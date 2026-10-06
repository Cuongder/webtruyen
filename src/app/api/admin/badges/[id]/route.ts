import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { BADGES_DATA, deleteBadge } from "@/lib/data-store";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const { id } = await params;
    const badge = BADGES_DATA.find((b) => b.id === id);

    if (!badge) {
      return NextResponse.json({ error: "Không tìm thấy danh hiệu!" }, { status: 404 });
    }

    deleteBadge(badge.id, session.name);

    return NextResponse.json({
      success: true,
      message: `Đã xóa danh hiệu "${badge.name}" khỏi hệ thống!`,
    });
  } catch (error) {
    console.error("Delete Badge Error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa danh hiệu!" }, { status: 500 });
  }
}
