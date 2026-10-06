import { NextResponse } from "next/server";
import {
  setSessionCookie,
  clearSessionCookie,
  DEMO_USERS,
  verifyPassword,
  hashPassword,
  type SessionUser,
  type UserRole,
} from "@/lib/auth";

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
      if (!email || !password) {
        return NextResponse.json(
          { error: "Vui lòng nhập email và mật khẩu!" },
          { status: 400 }
        );
      }
      // Check demo credentials by email or username
      const lookupKey = email.toLowerCase().trim();
      const user =
        DEMO_USERS[lookupKey] ||
        Object.values(DEMO_USERS).find(
          (u) =>
            u.username.toLowerCase() === lookupKey ||
            u.email.toLowerCase() === lookupKey
        );
      if (!user) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không chính xác!" },
          { status: 401 }
        );
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không chính xác!" },
          { status: 401 }
        );
      }

      await setSessionCookie({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        penName: user.penName,
        avatarUrl: user.avatarUrl,
      });

      return NextResponse.json({ success: true, user });
    }

    if (action === "register") {
      if (!email || !password || !username) {
        return NextResponse.json(
          { error: "Vui lòng nhập đầy đủ email, tài khoản và mật khẩu!" },
          { status: 400 }
        );
      }

      const assignedRole: UserRole = role === "AUTHOR" ? "AUTHOR" : "READER";
      const newUser: SessionUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        name: name || username,
        role: assignedRole,
        penName: role === "AUTHOR" ? penName || username : undefined,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      };

      await setSessionCookie(newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === "logout") {
      await clearSessionCookie();
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ trong quá trình xác thực" },
      { status: 500 }
    );
  }
}
