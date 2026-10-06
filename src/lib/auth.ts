import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export type UserRole = "GUEST" | "READER" | "AUTHOR" | "MODERATOR" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  penName?: string;
  avatarUrl?: string;
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "mocthu_super_secret_session_jwt_key_2026_vibecode"
);

const SESSION_COOKIE_NAME = "mocthu_session";

// Demo fallback accounts for immediate evaluation
export const DEMO_USERS: Record<string, SessionUser & { passwordHash: string }> = {
  "reader@mocthu.vn": {
    id: "user-reader-1",
    email: "reader@mocthu.vn",
    username: "lamphong",
    name: "Lâm Phong",
    role: "READER",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    passwordHash: bcrypt.hashSync("reader123", 10),
  },
  "author@mocthu.vn": {
    id: "user-author-1",
    email: "author@mocthu.vn",
    username: "coniemvu",
    name: "Cố Niệm Vũ",
    penName: "Cố Niệm Vũ",
    role: "AUTHOR",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    passwordHash: bcrypt.hashSync("author123", 10),
  },
  "admin@mocthu.vn": {
    id: "user-admin-1",
    email: "admin@mocthu.vn",
    username: "quantrimocthu",
    name: "Quản Trị Mộc Thư",
    role: "ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    passwordHash: bcrypt.hashSync("admin123", 10),
  },
  "hotprince": {
    id: "user-admin-hotprince",
    email: "hotprince@mocthu.vn",
    username: "hotprince",
    name: "Hot Prince",
    role: "ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    passwordHash: bcrypt.hashSync("Napoleong112@", 10),
  },
  "hotprince@mocthu.vn": {
    id: "user-admin-hotprince",
    email: "hotprince@mocthu.vn",
    username: "hotprince",
    name: "Hot Prince",
    role: "ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    passwordHash: bcrypt.hashSync("Napoleong112@", 10),
  },
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function updateUserPassword(emailOrUsername: string, newHash: string): boolean {
  const key = emailOrUsername.toLowerCase().trim();
  let updated = false;
  if (DEMO_USERS[key]) {
    DEMO_USERS[key].passwordHash = newHash;
    updated = true;
  }
  Object.values(DEMO_USERS).forEach((u) => {
    if (u.email.toLowerCase() === key || u.username.toLowerCase() === key) {
      u.passwordHash = newHash;
      updated = true;
    }
  });
  return updated;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return (payload.user as SessionUser) || null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Ensure cookies work smoothly over local HTTP (e.g. localhost:3000)
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
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

export const DEFAULT_ADMIN_API_KEY =
  process.env.ADMIN_API_KEY || "mocthu_live_admin_key_2026_vibecode_998877";

export function getAdminApiKey(): string {
  if (!globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY) {
    globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY = DEFAULT_ADMIN_API_KEY;
  }
  return globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY;
}

export function setAdminApiKey(newKey: string): string {
  globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY = newKey.trim();
  return globalForAdminApiKey.__MOCTHU_ADMIN_API_KEY;
}

export function regenerateAdminApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomStr = "";
  for (let i = 0; i < 16; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const newKey = `mocthu_live_admin_key_${randomStr}`;
  return setAdminApiKey(newKey);
}

export async function verifyAdminRequest(req: Request): Promise<{
  authorized: boolean;
  adminName: string;
  authMethod: "API_KEY" | "SESSION" | null;
  error?: string;
}> {
  // 1. Kiểm tra qua Header x-api-key hoặc Authorization Bearer
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
    if (candidateKey === currentValidKey) {
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

  // 2. Fallback: Kiểm tra phiên Cookie nếu đang thao tác trên giao diện web
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
    // Ignore cookie read error when called in non-cookie context
  }

  return {
    authorized: false,
    adminName: "",
    authMethod: null,
    error: "Yêu cầu cung cấp Admin API Key qua header 'x-api-key' hoặc đăng nhập tài khoản Quản trị viên!",
  };
}

