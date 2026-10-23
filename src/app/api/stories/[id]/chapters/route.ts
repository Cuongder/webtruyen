import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageChapter, canReadStory } from "@/lib/access-control";
import { createChapter, findChaptersByStory } from "@/lib/repositories/chapter.repository";
import { findStoryByIdOrSlug } from "@/lib/repositories/story.repository";
import { serializeChapter } from "@/lib/story-mapper";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = await findStoryByIdOrSlug(id);

  if (!story) {
    return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
  }

  const session = await getSession();
  if (!canReadStory(story, session)) {
    return NextResponse.json({ error: "Tác phẩm không công khai." }, { status: 403 });
  }

  const chapters = await findChaptersByStory(story.id, {
    includeAllStatuses: Boolean(session && (session.role === "ADMIN" || session.id === story.authorId)),
  });
  return NextResponse.json({
    success: true,
    total: chapters.length,
    chapters: chapters.map((chapter) => ({
      ...chapter,
      storySlug: story.slug,
      publishedAt: chapter.publishedAt?.toISOString() || chapter.createdAt.toISOString(),
    })),
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
    const story = await findStoryByIdOrSlug(id);

    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }

    // Guard: Only story author or admin can add chapters
    if (!canManageChapter(story, session)) {
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

    const chapterNumber = customNumber !== undefined ? Number(customNumber) : undefined;

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

    const newChapter = await createChapter({
      storyId: story.id,
      chapterNumber,
      title: title.startsWith("Chương") ? title : `Chương ${chapterNumber || 1}: ${title}`,
      slug,
      content: fullContent,
      wordCount,
      status:
        status === "DRAFT" || status === "SCHEDULED" || status === "TRASH"
          ? status
          : "PUBLISHED",
    });

    return NextResponse.json({
      success: true,
      message: `Đăng thành công ${newChapter.title}!`,
      chapter: serializeChapter({ ...newChapter, story: { slug: story.slug } }),
    });
  } catch (error) {
    console.error("Create chapter error:", error);
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") return NextResponse.json({ error: "Số chương hoặc slug đã tồn tại." }, { status: 409 });
      if (error.code === "P2025") return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi đăng chương!" }, { status: 500 });
  }
}
