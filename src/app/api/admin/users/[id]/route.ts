import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/data-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
  }

  const { id } = await params;
  const user = getUserById(id);

  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = updateUser(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy người dùng để cập nhật!" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thông tin thành công cho "${updated.name}"!`,
      user: updated,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật người dùng!" }, { status: 500 });
  }
}

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
    const user = getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }

    // Safety: prevent deleting hotprince
    if (user.username === "hotprince") {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản Quản trị viên tối cao hotprince!" },
        { status: 400 }
      );
    }

    deleteUser(id, session.name);

    return NextResponse.json({
      success: true,
      message: `Đã xóa vĩnh viễn tài khoản "${user.username}" khỏi hệ thống!`,
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa người dùng!" }, { status: 500 });
  }
}
