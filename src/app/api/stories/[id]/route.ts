import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canReadStory, canManageStory } from "@/lib/access-control";
import {
  deleteStory,
  findStoryByIdOrSlug,
  updateStory,
} from "@/lib/repositories/story.repository";
import { serializeStory } from "@/lib/story-mapper";

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

  return NextResponse.json({ success: true, story: serializeStory(story) });
}

export async function PUT(
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

    // Guard: Only story author or admin can update
    if (!canManageStory(story, session)) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa tác phẩm này!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    await updateStory(story.id, {
      title: typeof body.title === "string" ? body.title.trim() : undefined,
      shortDescription:
        typeof body.shortDescription === "string"
          ? body.shortDescription.trim()
          : undefined,
      fullDescription:
        typeof body.fullDescription === "string" ? body.fullDescription.trim() : undefined,
      coverUrl: typeof body.coverUrl === "string" ? body.coverUrl.trim() : undefined,
      bannerUrl: typeof body.bannerUrl === "string" ? body.bannerUrl.trim() : undefined,
      status:
        body.status === "ONGOING" ||
        body.status === "COMPLETED" ||
        body.status === "DRAFT" ||
        body.status === "HIATUS"
          ? body.status
          : undefined,
      visibility:
        body.visibility === "PUBLIC" ||
        body.visibility === "PRIVATE" ||
        body.visibility === "UNLISTED"
          ? body.visibility
          : undefined,
      featured: session.role === "ADMIN" && typeof body.featured === "boolean"
        ? body.featured
        : undefined,
    });

    const updated = await findStoryByIdOrSlug(story.id);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm sau khi cập nhật!" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Cập nhật tác phẩm thành công!",
      story: serializeStory(updated),
    });
  } catch (error) {
    console.error("Update story error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Slug truyện đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật truyện!" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
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

    // Guard: Only author or admin can delete
    if (!canManageStory(story, session)) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa tác phẩm này!" },
        { status: 403 }
      );
    }

    await deleteStory(story.id);

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công tác phẩm "${story.title}"`,
    });
  } catch (error) {
    console.error("Delete story error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa tác phẩm!" }, { status: 500 });
  }
}
