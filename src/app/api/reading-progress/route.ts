import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth();
    const progress = await db.readingProgress.findMany({
      where: { userId: session.id },
      include: {
        story: { select: { id: true, slug: true, title: true } },
        chapter: { select: { id: true, slug: true, title: true, chapterNumber: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Reading progress GET error:", error);
    return NextResponse.json({ error: "Không thể tải tiến độ đọc." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const storyId = typeof body.storyId === "string" ? body.storyId : "";
    const chapterId = typeof body.chapterId === "string" ? body.chapterId : "";
    const scrollPercentage = Number(body.scrollPercentage);

    if (!storyId || !chapterId || !Number.isFinite(scrollPercentage)) {
      return NextResponse.json({ error: "Dữ liệu tiến độ không hợp lệ." }, { status: 400 });
    }

    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, storyId },
      select: { id: true },
    });
    if (!chapter) {
      return NextResponse.json({ error: "Không tìm thấy chương." }, { status: 404 });
    }

    const progress = await db.readingProgress.upsert({
      where: { userId_storyId: { userId: session.id, storyId } },
      update: {
        chapterId,
        scrollPercentage: Math.min(100, Math.max(0, scrollPercentage)),
      },
      create: {
        userId: session.id,
        storyId,
        chapterId,
        scrollPercentage: Math.min(100, Math.max(0, scrollPercentage)),
      },
    });

    await db.libraryEntry.upsert({
      where: {
        userId_storyId_shelfType: {
          userId: session.id,
          storyId,
          shelfType: "READING",
        },
      },
      update: {},
      create: { userId: session.id, storyId, shelfType: "READING" },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Reading progress POST error:", error);
    return NextResponse.json({ error: "Không thể lưu tiến độ đọc." }, { status: 500 });
  }
}
