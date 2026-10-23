import { NextResponse, type NextRequest } from "next/server";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { createStory, findStories } from "@/lib/repositories/story.repository";
import { serializeStory } from "@/lib/story-mapper";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const context = await requireAdminContext(req);
  if ("response" in context) return context.response;

  const params = new URL(req.url).searchParams;
  const result = await findStories({
    search: params.get("q") || undefined,
    genre: params.get("genre") || undefined,
    status:
      params.get("status") === "DRAFT" ||
      params.get("status") === "ONGOING" ||
      params.get("status") === "COMPLETED" ||
      params.get("status") === "HIATUS"
        ? params.get("status") as "DRAFT" | "ONGOING" | "COMPLETED" | "HIATUS"
        : undefined,
    visibility:
      params.get("visibility") === "PRIVATE" ||
      params.get("visibility") === "UNLISTED" ||
      params.get("visibility") === "PUBLIC"
        ? params.get("visibility") as "PRIVATE" | "UNLISTED" | "PUBLIC"
        : undefined,
    featured: params.has("featured") ? params.get("featured") === "true" : undefined,
  });

  return NextResponse.json({
    success: true,
    total: result.total,
    stories: result.stories.map(serializeStory),
  });
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireAdminContext(req);
    if ("response" in context) return context.response;

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const shortDescription =
      typeof body.shortDescription === "string" ? body.shortDescription.trim() : "";
    if (!title || !shortDescription) {
      return NextResponse.json({ error: "Thiếu tiêu đề hoặc mô tả ngắn." }, { status: 400 });
    }

    const authorId =
      typeof body.authorId === "string" && body.authorId
        ? body.authorId
        : context.adminId;
    const author = await db.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });
    if (!author) return NextResponse.json({ error: "Không tìm thấy tác giả." }, { status: 404 });

    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? body.slug.trim()
        : `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString().slice(-5)}`;

    const story = await createStory({
      title,
      slug,
      authorId: author.id,
      shortDescription,
      fullDescription:
        typeof body.fullDescription === "string" ? body.fullDescription.trim() : shortDescription,
      coverUrl:
        typeof body.coverUrl === "string" && body.coverUrl.trim()
          ? body.coverUrl.trim()
          : "",
      status:
        body.status === "DRAFT" ||
        body.status === "COMPLETED" ||
        body.status === "HIATUS"
          ? body.status
          : "ONGOING",
      visibility:
        body.visibility === "PRIVATE" || body.visibility === "UNLISTED"
          ? body.visibility
          : "PUBLIC",
      featured: Boolean(body.featured),
      genreSlugs: Array.isArray(body.genres) ? body.genres : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    await writeAdminAudit({
      adminId: context.adminId,
      action: "CREATE_STORY",
      targetType: "STORY",
      targetId: story.id,
      details: { title: story.title },
    });

    return NextResponse.json(
      { success: true, message: `Đã khởi tạo tác phẩm "${story.title}".`, story: serializeStory(story) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Create Story Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Slug truyện đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi khởi tạo tác phẩm!" }, { status: 500 });
  }
}
