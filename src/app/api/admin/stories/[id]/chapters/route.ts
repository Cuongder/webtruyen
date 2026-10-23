import { NextResponse, type NextRequest } from "next/server";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { findStoryByIdOrSlug } from "@/lib/repositories/story.repository";
import { createChapter, findChaptersByStory } from "@/lib/repositories/chapter.repository";
import { serializeChapter } from "@/lib/story-mapper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await requireAdminContext(req);
  if ("response" in context) return context.response;
  const { id } = await params;
  const story = await findStoryByIdOrSlug(id);
  if (!story) return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
  const chapters = await findChaptersByStory(story.id, { includeAllStatuses: true });
  return NextResponse.json({
    success: true,
    story: { id: story.id, title: story.title, slug: story.slug, totalChapters: chapters.length },
    chapters: chapters.map((chapter) => ({ ...chapter, storySlug: story.slug })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAdminContext(req);
    if ("response" in context) return context.response;
    const { id } = await params;
    const story = await findStoryByIdOrSlug(id);
    if (!story) return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!title || !content) {
      return NextResponse.json({ error: "Thiếu tên hoặc nội dung chương." }, { status: 400 });
    }

    const chapters = await findChaptersByStory(story.id, { includeAllStatuses: true });
    const chapterNumber = body.chapterNumber ? Number(body.chapterNumber) : chapters.length + 1;
    if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
      return NextResponse.json({ error: "chapterNumber không hợp lệ." }, { status: 400 });
    }

    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? body.slug.trim()
        : `chuong-${chapterNumber}-${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    const chapter = await createChapter({
      storyId: story.id,
      chapterNumber,
      title: title.startsWith("Chương") ? title : `Chương ${chapterNumber}: ${title}`,
      slug,
      content,
      status:
        body.status === "DRAFT" ||
        body.status === "SCHEDULED" ||
        body.status === "TRASH"
          ? body.status
          : "PUBLISHED",
    });

    await writeAdminAudit({
      adminId: context.adminId,
      action: "CREATE_CHAPTER",
      targetType: "CHAPTER",
      targetId: chapter.id,
      details: { storyId: story.id, title: chapter.title },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đã đăng ${chapter.title} cho tác phẩm "${story.title}".`,
        chapter: serializeChapter({ ...chapter, story: { slug: story.slug } }),
        updatedStory: { id: story.id, title: story.title, slug: story.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Story Chapters POST Error:", error);
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") return NextResponse.json({ error: "Số chương hoặc slug đã tồn tại." }, { status: 409 });
      if (error.code === "P2025") return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi đăng chương!" }, { status: 500 });
  }
}
