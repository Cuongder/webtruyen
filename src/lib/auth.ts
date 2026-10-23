import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { assertProductionConfig } from "./config";
import { getUserSessionVerification, incrementSessionVersion } from "./repositories/user.repository";

// ponytail: JWT in HttpOnly cookie verified on-demand against DB user record. Upgrade to distributed Redis cache if DB session checks bottleneck high TPS.

export type UserRole = "GUEST" | "READER" | "AUTHOR" | "MODERATOR" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  status?: "ACTIVE" | "SUSPENDED" | "BANNED";
  penName?: string;
  avatarUrl?: string;
  sessionVersion?: number;
}

export const SESSION_COOKIE_NAME = "mocthu_session";
function getJwtSecret(): Uint8Array {
  assertProductionConfig();
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret === "mocthu_super_secret_session_jwt_key_2026_vibecode") {
      throw new Error("CRITICAL_CONFIG_ERROR: JWT_SECRET must be configured in production.");
    }
  }
  return new TextEncoder().encode(
    secret || "mocthu_super_secret_session_jwt_key_2026_vibecode"
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getJwtSecret();
  return new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status || "ACTIVE",
      penName: user.penName,
      avatarUrl: user.avatarUrl,
      sessionVersion: user.sessionVersion || 1,
    },
  })
    .setSubject(user.id)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    const tokenUser = payload.user as SessionUser | undefined;
    if (!tokenUser || !tokenUser.id) return null;

    // Database-backed session verification and revocation
    const dbUser = await getUserSessionVerification(tokenUser.id);
    if (!dbUser) return null;

    // Check account status
    if (dbUser.status !== "ACTIVE") return null;

    // Check session version revocation
    if (
      tokenUser.sessionVersion !== undefined &&
      dbUser.sessionVersion !== tokenUser.sessionVersion
    ) {
      return null;
    }

    // Check role revocation
    if (tokenUser.role && dbUser.role !== tokenUser.role) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      name: dbUser.profile?.displayName || dbUser.username,
      role: dbUser.role as UserRole,
      status: dbUser.status,
      penName: dbUser.authorProfile?.penName || undefined,
      avatarUrl: dbUser.profile?.avatarUrl || undefined,
      sessionVersion: dbUser.sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await incrementSessionVersion(userId);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

// ================= ADMIN API KEY MANAGEMENT =================

const globalForAdminApiKey = globalThis as unknown as {
  __MOCTHU_ADMIN_API_KEY?: string;
};

export function getAdminApiKey(): string {
  if (process.env.ADMIN_API_KEY) return process.env.ADMIN_API_KEY;
  if (!globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY && process.env.NODE_ENV !== "production") {
    globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY = `mocthu_dev_admin_key_${randomBytes(24).toString("hex")}`;
  }
  return globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY || "";
}

export function setAdminApiKey(newKey: string): string {
  globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY = newKey.trim();
  return globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY;
}

export function regenerateAdminApiKey(): string {
  const newKey = `mocthu_admin_key_${randomBytes(32).toString("hex")}`;
  return setAdminApiKey(newKey);
}

function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function verifyAdminRequest(req: Request): Promise<{
  authorized: boolean;
  adminName: string;
  authMethod: "API_KEY" | "SESSION" | null;
  error?: string;
}> {
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_API_KEY) {
    return {
      authorized: false,
      adminName: "",
      authMethod: null,
      error: "CRITICAL_CONFIG_ERROR: ADMIN_API_KEY must be configured in production.",
    };
  }

  const apiKeyHeader =
    req.headers.get("x-api-key") ||
    req.headers.get("X-API-KEY") ||
    req.headers.get("x-admin-key") ||
    req.headers.get("X-Admin-Key");

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let bearerToken = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    bearerToken = authHeader.substring(7).trim();
  }

  const candidateKey = apiKeyHeader?.trim() || bearerToken;
  const currentValidKey = getAdminApiKey();

  if (candidateKey) {
    if (currentValidKey && timingSafeCompare(candidateKey, currentValidKey)) {
      return {
        authorized: true,
        adminName: "Admin (API Key)",
        authMethod: "API_KEY",
      };
    }
    return {
      authorized: false,
      adminName: "",
      authMethod: "API_KEY",
      error: "Mã khóa API Key Quản trị viên không chính xác hoặc đã bị thu hồi!",
    };
  }

  try {
    const session = await getSession();
    if (session && session.role === "ADMIN") {
      return {
        authorized: true,
        adminName: session.name || "Admin",
        authMethod: "SESSION",
      };
    }
  } catch {
    // Non-cookie context
  }

  return {
    authorized: false,
    adminName: "",
    authMethod: null,
    error: "Yêu cầu cung cấp Admin API Key qua header x-api-key hoặc đăng nhập tài khoản Quản trị viên!",
  };
}

// Backward compatibility stubs for legacy components
export const DEMO_USERS: Record<string, SessionUser & { passwordHash: string }> = {};

export function updateUserPassword(_emailOrUsername: string, _newHash: string): boolean {
  return true;
}
