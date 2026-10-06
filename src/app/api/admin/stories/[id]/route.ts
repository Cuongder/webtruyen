import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { banStory, unbanStory, featureStory, deleteStory, STORIES_DATA } from "@/lib/data-store";

export async function PUT(
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
    const { action, reason = "Vi phạm chính sách nội dung", isFeatured } = body;

    if (action === "ban") {
      banStory(story.id, reason, auth.adminName);
      return NextResponse.json({
        success: true,
        message: `Đã khóa tác phẩm "${story.title}". Lý do: ${reason}`,
        story,
      });
    }

    if (action === "unban") {
      unbanStory(story.id, auth.adminName);
      return NextResponse.json({
        success: true,
        message: `Đã mở khóa phát hành cho tác phẩm "${story.title}"`,
        story,
      });
    }

    if (action === "feature") {
      featureStory(story.id, isFeatured ?? true, auth.adminName);
      return NextResponse.json({
        success: true,
        message: isFeatured
          ? `Đã ghim tác phẩm "${story.title}" lên Spotlight`
          : `Đã bỏ ghim tác phẩm "${story.title}"`,
        story,
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ!" }, { status: 400 });
  } catch (error) {
    console.error("Admin Story Action Error:", error);
    return NextResponse.json({ error: "Lỗi khi xử lý tác phẩm!" }, { status: 500 });
  }
}

export async function DELETE(
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

    deleteStory(story.id, auth.adminName);

    return NextResponse.json({
      success: true,
      message: `Đã xóa vĩnh viễn tác phẩm "${story.title}" khỏi hệ thống!`,
    });
  } catch (error) {
    console.error("Admin Delete Story Error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa tác phẩm!" }, { status: 500 });
  }
}
