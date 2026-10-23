import { NextResponse, type NextRequest } from "next/server";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { deleteStory, findStoryByIdOrSlug, updateStory } from "@/lib/repositories/story.repository";
import { serializeStory } from "@/lib/story-mapper";

export async function PUT(
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
    const action = body.action;
    if (action === "ban") {
      await updateStory(story.id, { status: "HIATUS", visibility: "PRIVATE" });
    } else if (action === "unban") {
      await updateStory(story.id, { status: "ONGOING", visibility: "PUBLIC" });
    } else if (action === "feature") {
      await updateStory(story.id, { featured: body.isFeatured ?? true });
    } else {
      return NextResponse.json({ error: "Hành động không hợp lệ!" }, { status: 400 });
    }

    const updated = await findStoryByIdOrSlug(story.id);
    if (!updated) return NextResponse.json({ error: "Không tìm thấy tác phẩm." }, { status: 404 });

    await writeAdminAudit({
      adminId: context.adminId,
      action: String(action).toUpperCase() + "_STORY",
      targetType: "STORY",
      targetId: story.id,
      details: { reason: body.reason, isFeatured: body.isFeatured },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật tác phẩm "${updated.title}".`,
      story: serializeStory(updated),
    });
  } catch (error) {
    console.error("Admin Story Action Error:", error);
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") return NextResponse.json({ error: "Slug truyện đã tồn tại." }, { status: 409 });
      if (error.code === "P2025") return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xử lý tác phẩm!" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAdminContext(req);
    if ("response" in context) return context.response;

    const { id } = await params;
    const story = await findStoryByIdOrSlug(id);
    if (!story) return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });

    await deleteStory(story.id);
    await writeAdminAudit({
      adminId: context.adminId,
      action: "DELETE_STORY",
      targetType: "STORY",
      targetId: story.id,
      details: { title: story.title },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa tác phẩm "${story.title}" khỏi hệ thống.`,
    });
  } catch (error) {
    console.error("Admin Delete Story Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa tác phẩm!" }, { status: 500 });
  }
}
