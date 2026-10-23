export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

import { NextResponse } from "next/server";
import {
  setSessionCookie,
  clearSessionCookie,
  getSession,
  revokeUserSessions,
  verifyPassword,
  hashPassword,
  type SessionUser,
  type UserRole,
} from "@/lib/auth";
import { userRepository } from "@/lib/repositories";

// ponytail: Basic regex email/username validation; upgrade to Zod schema validator when request surface grows.

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let action: string | undefined;
    let email: string | undefined;
    let password: string | undefined;
    let username: string | undefined;
    let name: string | undefined;
    let role: string | undefined;
    let penName: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      action = body.action;
      email = body.email;
      password = body.password;
      username = body.username;
      name = body.name;
      role = body.role;
      penName = body.penName;
    } else {
      const formData = await req.formData();
      action = formData.get("action")?.toString();
      email = formData.get("email")?.toString();
      password = formData.get("password")?.toString();
      username = formData.get("username")?.toString();
      name = formData.get("name")?.toString();
      role = formData.get("role")?.toString();
      penName = formData.get("penName")?.toString();
    }

    if (action === "login") {
      const identifier = (email || username || "").trim();
      if (!identifier || !password) {
        return NextResponse.json(
          { error: "Vui lòng nhập tài khoản/email và mật khẩu!" },
          { status: 400 }
        );
      }

      const user = await userRepository.findUserByEmailOrUsername(identifier);
      if (!user) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không chính xác!" },
          { status: 401 }
        );
      }

      if (user.status === "BANNED") {
        return NextResponse.json(
          { error: "Tài khoản của bạn đã bị khóa vĩnh viễn!" },
          { status: 403 }
        );
      }

      if (user.status === "SUSPENDED") {
        return NextResponse.json(
          { error: "Tài khoản của bạn đang bị tạm ngưng hoạt động!" },
          { status: 403 }
        );
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không chính xác!" },
          { status: 401 }
        );
      }

      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.profile?.displayName || user.username,
        role: user.role as UserRole,
        status: user.status,
        penName: user.authorProfile?.penName || undefined,
        avatarUrl: user.profile?.avatarUrl || undefined,
        sessionVersion: user.sessionVersion,
      };

      await setSessionCookie(sessionUser);
      return NextResponse.json({ success: true, user: sessionUser });
    }

    if (action === "register") {
      if (!email || !password || !username) {
        return NextResponse.json(
          { error: "Vui lòng nhập đầy đủ email, tên người dùng và mật khẩu!" },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();
      const cleanUsername = username.toLowerCase().trim();

      if (!isValidEmail(cleanEmail)) {
        return NextResponse.json(
          { error: "Địa chỉ email không đúng định dạng!" },
          { status: 400 }
        );
      }

      if (!isValidUsername(cleanUsername)) {
        return NextResponse.json(
          { error: "Tên tài khoản từ 3-30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!" },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu phải có tối thiểu 6 ký tự!" },
          { status: 400 }
        );
      }

      const existingByEmail = await userRepository.findUserByEmail(cleanEmail);
      if (existingByEmail) {
        return NextResponse.json(
          { error: "Email này đã được đăng ký!" },
          { status: 409 }
        );
      }

      const existingByUsername = await userRepository.findUserByUsername(cleanUsername);
      if (existingByUsername) {
        return NextResponse.json(
          { error: "Tên tài khoản này đã được sử dụng!" },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);
      const assignedRole: UserRole = role === "AUTHOR" ? "AUTHOR" : "READER";

      const createdUser = await userRepository.createUser({
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        role: assignedRole,
        displayName: name?.trim() || cleanUsername,
        penName: role === "AUTHOR" ? (penName?.trim() || name?.trim() || cleanUsername) : undefined,
      });

      const sessionUser: SessionUser = {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        name: createdUser.profile?.displayName || createdUser.username,
        role: createdUser.role as UserRole,
        status: createdUser.status,
        penName: createdUser.authorProfile?.penName || undefined,
        avatarUrl: createdUser.profile?.avatarUrl || undefined,
        sessionVersion: createdUser.sessionVersion,
      };

      await setSessionCookie(sessionUser);
      return NextResponse.json({ success: true, user: sessionUser }, { status: 201 });
    }

    if (action === "logout") {
      const session = await getSession();
      if (session) await revokeUserSessions(session.id);
      await clearSessionCookie();
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Yêu cầu không hợp lệ!" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ trong quá trình xác thực!" },
      { status: 500 }
    );
  }
}
