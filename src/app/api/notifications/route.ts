import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth();
    const notifications = await db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, notifications });
  } catch {
    return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : undefined;
    await db.notification.updateMany({
      where: { userId: session.id, ...(id ? { id } : {}) },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
  }
}
