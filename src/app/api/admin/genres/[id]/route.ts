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
    const genre = await db.genre.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { _count: { select: { stories: true } } },
    });

    if (!genre) {
      return NextResponse.json({ error: "Không tìm thấy thể loại!" }, { status: 404 });
    }

    // Safety: check if stories are using this genre
    if (genre._count.stories > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa thể loại "${genre.name}" vì đang có ${genre._count.stories} truyện sử dụng!`,
        },
        { status: 400 }
      );
    }

    await db.genre.delete({ where: { id: genre.id } });
    await writeAdminAudit({
      adminId: context.adminId,
      action: "DELETE_GENRE",
      targetType: "GENRE",
      targetId: genre.id,
      details: { name: genre.name },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa thể loại "${genre.name}" thành công!`,
    });
  } catch (error) {
    console.error("Delete Genre Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy thể loại!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa thể loại!" }, { status: 500 });
  }
}
