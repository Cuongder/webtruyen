import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await clearSessionCookie();

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json({ success: true, message: "Đăng xuất thành công" });
    }

    const redirectUrl = req.nextUrl.searchParams.get("redirect") || "/login";
    return NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await clearSessionCookie();

    const redirectUrl = req.nextUrl.searchParams.get("redirect") || "/login";
    return NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 });
  } catch (error) {
    console.error("Logout GET error:", error);
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }
}
