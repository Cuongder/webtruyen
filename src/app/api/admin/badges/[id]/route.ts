import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAdminContext(_req);
    if (context.response) return context.response;

    const { id } = await params;
    const badge = await db.badge.findUnique({ where: { id } });

    if (!badge) {
      return NextResponse.json({ error: "Không tìm thấy danh hiệu!" }, { status: 404 });
    }

    await db.badge.delete({ where: { id: badge.id } });
    await writeAdminAudit({
      adminId: context.adminId,
      action: "DELETE_BADGE",
      targetType: "BADGE",
      targetId: badge.id,
      details: { name: badge.name },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa danh hiệu "${badge.name}" khỏi hệ thống!`,
    });
  } catch (error) {
    console.error("Delete Badge Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy danh hiệu!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa danh hiệu!" }, { status: 500 });
  }
}
