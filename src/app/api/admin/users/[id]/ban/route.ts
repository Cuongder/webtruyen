import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { serializeAdminUser } from "@/lib/admin-read-model";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAdminContext(req);
    if (context.response) return context.response;

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }

    if (user.username === "hotprince" && user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Không thể khóa tài khoản Quản trị viên tối cao hotprince!" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, reason = "Vi phạm quy chế cộng đồng Mộc Thư" } = body;

    if (action === "unban") {
      const updated = await db.user.update({
        where: { id },
        data: { status: "ACTIVE", sessionVersion: { increment: 1 } },
        include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
      });
      await writeAdminAudit({
        adminId: context.adminId,
        action: "UNBAN_USER",
        targetType: "USER",
        targetId: id,
        details: { reason },
      });
      return NextResponse.json({
        success: true,
        message: `Đã mở khóa tài khoản "${user.username}"!`,
        user: serializeAdminUser(updated),
      });
    } else {
      const updated = await db.user.update({
        where: { id },
        data: { status: "BANNED", sessionVersion: { increment: 1 } },
        include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
      });
      await writeAdminAudit({
        adminId: context.adminId,
        action: "BAN_USER",
        targetType: "USER",
        targetId: id,
        details: { reason },
      });
      return NextResponse.json({
        success: true,
        message: `Đã khóa tài khoản "${user.username}". Lý do: ${reason}`,
        user: serializeAdminUser(updated),
      });
    }
  } catch (error) {
    console.error("Ban/Unban User Error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật trạng thái cấm người dùng!" }, { status: 500 });
  }
}
