import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import {
  STORIES_DATA,
  CHAPTERS_DATA,
  adminCreateChapter,
} from "@/lib/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
  }

  const { id } = await params;
  const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

  if (!story) {
    return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
  }

  const chapters = CHAPTERS_DATA[story.slug] || [];

  return NextResponse.json({
    success: true,
    story: {
      id: story.id,
      title: story.title,
      slug: story.slug,
      totalChapters: chapters.length,
    },
    chapters,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const { id } = await params;
    const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }

    const body = await req.json();
    const { chapterNumber, title, slug, content, status = "PUBLISHED" } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập tên chương truyện!" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập nội dung chương truyện!" }, { status: 400 });
    }

    const result = adminCreateChapter(
      {
        storyIdOrSlug: story.id,
        chapterNumber: chapterNumber ? parseInt(chapterNumber, 10) : undefined,
        title,
        slug,
        content,
        status,
      },
      auth.adminName || "Admin"
    );

    if (!result) {
      return NextResponse.json({ error: "Không thể đăng chương cho tác phẩm!" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Đã đăng ${result.chapter.title} cho tác phẩm "${story.title}" thành công!`,
        chapter: result.chapter,
        updatedStory: {
          id: story.id,
          title: story.title,
          slug: story.slug,
          totalChapters: story.totalChapters,
          wordCount: story.wordCount,
          updatedAt: story.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Story Chapters POST Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi đăng chương!" }, { status: 500 });
  }
}
