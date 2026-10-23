import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const params = new URL(req.url).searchParams;
    const storyId = params.get("storyId") || undefined;
    const chapterId = params.get("chapterId") || undefined;
    const bookmarks = await db.bookmark.findMany({
      where: { userId: session.id, ...(storyId ? { storyId } : {}), ...(chapterId ? { chapterId } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, bookmarks });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Bookmarks GET error:", error);
    return NextResponse.json({ error: "Không thể tải bookmark." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const storyId = typeof body.storyId === "string" ? body.storyId : "";
    const chapterId = typeof body.chapterId === "string" ? body.chapterId : "";
    const paragraphIndex = Number.isInteger(body.paragraphIndex) ? body.paragraphIndex : 0;
    if (!storyId || !chapterId || paragraphIndex < 0) {
      return NextResponse.json({ error: "Dữ liệu bookmark không hợp lệ." }, { status: 400 });
    }

    const chapter = await db.chapter.findFirst({ where: { id: chapterId, storyId }, select: { id: true } });
    if (!chapter) return NextResponse.json({ error: "Không tìm thấy chương." }, { status: 404 });

    const bookmark = await db.bookmark.create({
      data: {
        userId: session.id,
        storyId,
        chapterId,
        paragraphIndex,
        note: typeof body.note === "string" ? body.note.trim() || null : null,
      },
    });
    return NextResponse.json({ success: true, bookmark });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Bookmarks POST error:", error);
    return NextResponse.json({ error: "Không thể lưu bookmark." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Thiếu bookmark id." }, { status: 400 });
    await db.bookmark.deleteMany({ where: { id, userId: session.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Bookmarks DELETE error:", error);
    return NextResponse.json({ error: "Không thể xóa bookmark." }, { status: 500 });
  }
}
