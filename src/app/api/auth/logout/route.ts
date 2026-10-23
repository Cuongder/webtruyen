import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, getSession, revokeUserSessions } from "@/lib/auth";

async function revokeCurrentSession() {
  const session = await getSession();
  if (session) await revokeUserSessions(session.id);
  await clearSessionCookie();
}

function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/login";
  return value;
}

export async function POST(req: NextRequest) {
  try {
    await revokeCurrentSession();

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json({ success: true, message: "Đăng xuất thành công" });
    }

    const redirectUrl = safeRedirect(req.nextUrl.searchParams.get("redirect"));
    return NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await revokeCurrentSession();

    const redirectUrl = safeRedirect(req.nextUrl.searchParams.get("redirect"));
    return NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 });
  } catch (error) {
    console.error("Logout GET error:", error);
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }
}
