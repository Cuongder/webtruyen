import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { serializeAdminUser } from "@/lib/admin-read-model";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await requireAdminContext(_req);
  if (context.response) return context.response;

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: serializeAdminUser(user) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAdminContext(req);
    if (context.response) return context.response;

    const { id } = await params;
    const body = await req.json();
    const existing = await db.user.findUnique({ where: { id }, include: { profile: true, authorProfile: true } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy người dùng để cập nhật!" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (["READER", "AUTHOR", "ADMIN", "MODERATOR"].includes(body.role)) data.role = body.role;
    if (["ACTIVE", "SUSPENDED", "BANNED"].includes(body.status)) data.status = body.status;
    if (typeof body.email === "string" && body.email.trim()) data.email = body.email.toLowerCase().trim();
    if (typeof body.username === "string" && body.username.trim()) data.username = body.username.toLowerCase().trim();
    const updated = await db.user.update({
      where: { id },
      data: {
        ...data,
        ...(body.name || body.bio
          ? { profile: { upsert: { create: { displayName: body.name || existing.username, bio: body.bio }, update: { ...(body.name ? { displayName: body.name } : {}), ...(body.bio !== undefined ? { bio: body.bio } : {}) } } } }
          : {}),
        sessionVersion: { increment: 1 },
      },
      include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
    });
    await writeAdminAudit({
      adminId: context.adminId,
      action: "UPDATE_USER",
      targetType: "USER",
      targetId: id,
      details: body,
    });
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thông tin thành công cho "${updated.profile?.displayName || updated.username}"!`,
      user: serializeAdminUser(updated),
    });
  } catch (error) {
    console.error("Update User Error:", error);
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") return NextResponse.json({ error: "Email hoặc tên người dùng đã tồn tại." }, { status: 409 });
      if (error.code === "P2025") return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật người dùng!" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAdminContext(_req);
    if (context.response) return context.response;

    const { id } = await params;
    const user = await db.user.findUnique({ where: { id }, select: { id: true, username: true, role: true } });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }

    // Safety: prevent deleting hotprince
    if (user.role === "ADMIN" && user.username === "hotprince") {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản Quản trị viên tối cao hotprince!" },
        { status: 400 }
      );
    }

    await db.user.delete({ where: { id } });
    await writeAdminAudit({
      adminId: context.adminId,
      action: "DELETE_USER",
      targetType: "USER",
      targetId: id,
      details: { username: user.username },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa vĩnh viễn tài khoản "${user.username}" khỏi hệ thống!`,
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa người dùng!" }, { status: 500 });
  }
}
