import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { STORIES_DATA, CHAPTERS_DATA, type ChapterItem } from "@/lib/data-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

  if (!story) {
    return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
  }

  const chapters = CHAPTERS_DATA[story.slug] || [];
  return NextResponse.json({
    success: true,
    total: chapters.length,
    chapters,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await params;
    const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }

    // Guard: Only story author or admin can add chapters
    if (session.role !== "ADMIN" && story.authorId !== session.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền đăng chương cho tác phẩm này!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      content,
      authorNote,
      status = "PUBLISHED",
      chapterNumber: customNumber,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tiêu đề và nội dung chương!" },
        { status: 400 }
      );
    }

    const existingChapters = CHAPTERS_DATA[story.slug] || [];
    const chapterNumber =
      customNumber !== undefined ? Number(customNumber) : existingChapters.length + 1;

    // Generate chapter slug
    const slug =
      customSlug ||
      `chuong-${chapterNumber}-${title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)}`;

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const fullContent = authorNote
      ? `${content}\n\n---\n*Lời tác giả: ${authorNote}*`
      : content;

    const newChapter: ChapterItem = {
      id: `ch-${story.id}-${Date.now()}`,
      storyId: story.id,
      storySlug: story.slug,
      chapterNumber,
      title: title.startsWith("Chương") ? title : `Chương ${chapterNumber}: ${title}`,
      slug,
      content: fullContent,
      wordCount,
      publishedAt: new Date().toISOString(),
    };

    if (!CHAPTERS_DATA[story.slug]) {
      CHAPTERS_DATA[story.slug] = [];
    }

    CHAPTERS_DATA[story.slug].push(newChapter);

    // Update story counters
    story.totalChapters = CHAPTERS_DATA[story.slug].length;
    story.wordCount = (story.wordCount || 0) + wordCount;
    story.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: `Đăng thành công ${newChapter.title}!`,
      chapter: newChapter,
    });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi đăng chương!" }, { status: 500 });
  }
}
