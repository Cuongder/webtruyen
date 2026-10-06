import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import {
  STORIES_DATA,
  CHAPTERS_DATA,
  adminCreateChapter,
} from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const storyIdOrSlug = searchParams.get("storyId") || searchParams.get("storySlug");

  if (!storyIdOrSlug) {
    return NextResponse.json(
      { error: "Vui lòng cung cấp storyId hoặc storySlug!" },
      { status: 400 }
    );
  }

  const story = STORIES_DATA.find(
    (s) => s.id === storyIdOrSlug || s.slug === storyIdOrSlug
  );
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

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const body = await req.json();
    const {
      storyId,
      storySlug,
      chapterNumber,
      title,
      slug,
      content,
      status = "PUBLISHED",
      notifyFollowers = true,
    } = body;

    const targetStoryIdentifier = storyId || storySlug;

    if (!targetStoryIdentifier) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ID hoặc Slug của tác phẩm!" },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên chương truyện!" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập nội dung chương truyện!" },
        { status: 400 }
      );
    }

    const story = STORIES_DATA.find(
      (s) => s.id === targetStoryIdentifier || s.slug === targetStoryIdentifier
    );
    if (!story) {
      return NextResponse.json(
        { error: "Không tìm thấy tác phẩm mục tiêu trên hệ thống!" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Không thể thêm chương cho tác phẩm này!" },
        { status: 500 }
      );
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
    console.error("Admin Create Chapter Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi đăng chương truyện!" },
      { status: 500 }
    );
  }
}
