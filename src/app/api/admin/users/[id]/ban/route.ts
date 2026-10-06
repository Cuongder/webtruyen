import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { banUser, unbanUser, getUserById } from "@/lib/data-store";

export async function POST(
  req: NextRequest,
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

    if (user.username === "hotprince") {
      return NextResponse.json(
        { error: "Không thể khóa tài khoản Quản trị viên tối cao hotprince!" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, reason = "Vi phạm quy chế cộng đồng Mộc Thư" } = body;

    if (action === "unban") {
      unbanUser(id, session.name);
      return NextResponse.json({
        success: true,
        message: `Đã mở khóa tài khoản "${user.username}"!`,
        user,
      });
    } else {
      banUser(id, reason, session.name);
      return NextResponse.json({
        success: true,
        message: `Đã khóa tài khoản "${user.username}". Lý do: ${reason}`,
        user,
      });
    }
  } catch (error) {
    console.error("Ban/Unban User Error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật trạng thái cấm người dùng!" }, { status: 500 });
  }
}
