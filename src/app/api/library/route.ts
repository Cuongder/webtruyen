import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeStory } from "@/lib/story-mapper";

const SHELVES = ["READING", "FOLLOWING", "FAVORITE", "READ_LATER", "FINISHED"] as const;

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const shelf = new URL(req.url).searchParams.get("shelfType");
    const shelfType = SHELVES.includes(shelf as (typeof SHELVES)[number])
      ? (shelf as (typeof SHELVES)[number])
      : undefined;

    const entries = await db.libraryEntry.findMany({
      where: { userId: session.id, ...(shelfType ? { shelfType } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          include: {
            author: {
              select: {
                username: true,
                profile: { select: { displayName: true, avatarUrl: true } },
                authorProfile: { select: { penName: true, avatarUrl: true } },
              },
            },
            genres: { include: { genre: true } },
            tags: { include: { tag: true } },
            chapters: {
              select: { id: true, chapterNumber: true, wordCount: true },
              orderBy: { chapterNumber: "asc" },
            },
          },
        },
      },
    });

    const progress = await db.readingProgress.findMany({
      where: { userId: session.id },
      select: {
        storyId: true,
        chapterId: true,
        scrollPercentage: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      entries: entries.map((entry) => ({
        id: entry.id,
        shelfType: entry.shelfType,
        createdAt: entry.createdAt,
        story: serializeStory(entry.story),
      })),
      progress,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Library GET error:", error);
    return NextResponse.json({ error: "Không thể tải tủ sách." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const storyId = typeof body.storyId === "string" ? body.storyId : "";
    const shelfType = SHELVES.includes(body.shelfType) ? body.shelfType : "READING";

    if (!storyId) {
      return NextResponse.json({ error: "Thiếu storyId." }, { status: 400 });
    }

    const story = await db.story.findUnique({ where: { id: storyId }, select: { id: true } });
    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm." }, { status: 404 });
    }

    const entry = await db.libraryEntry.upsert({
      where: {
        userId_storyId_shelfType: {
          userId: session.id,
          storyId,
          shelfType,
        },
      },
      update: {},
      create: { userId: session.id, storyId, shelfType },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Library POST error:", error);
    return NextResponse.json({ error: "Không thể lưu tủ sách." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const params = new URL(req.url).searchParams;
    const storyId = params.get("storyId") || "";
    const shelfType = SHELVES.includes(params.get("shelfType") as (typeof SHELVES)[number])
      ? params.get("shelfType") as (typeof SHELVES)[number]
      : "READING";

    if (!storyId) {
      return NextResponse.json({ error: "Thiếu storyId." }, { status: 400 });
    }

    await db.libraryEntry.deleteMany({
      where: { userId: session.id, storyId, shelfType },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }
    console.error("Library DELETE error:", error);
    return NextResponse.json({ error: "Không thể cập nhật tủ sách." }, { status: 500 });
  }
}
