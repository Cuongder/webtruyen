import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getUsersList,
  createNewUser,
  type UserItem,
} from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase();
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  let list = getUsersList();

  if (search) {
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search) ||
        (u.penName && u.penName.toLowerCase().includes(search))
    );
  }

  if (role) {
    list = list.filter((u) => u.role === role);
  }

  if (status) {
    list = list.filter((u) => u.status === status);
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    users: list,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const body = await req.json();
    const { email, username, name, role = "READER", penName, bio } = body;

    if (!email || !username || !name) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email, Username và Tên hiển thị!" },
        { status: 400 }
      );
    }

    const newUser = createNewUser({
      email,
      username,
      name,
      role: role as UserItem["role"],
      penName,
      bio,
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo thành công tài khoản "${newUser.name}"!`,
      user: newUser,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi tạo người dùng!" }, { status: 500 });
  }
}
