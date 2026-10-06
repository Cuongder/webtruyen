import { NextResponse, type NextRequest } from "next/server";
import {
  getSession,
  setSessionCookie,
  hashPassword,
  verifyPassword,
  updateUserPassword,
  DEMO_USERS,
} from "@/lib/auth";
import { getUserByUsernameOrEmail, updateUser } from "@/lib/data-store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập!" }, { status: 401 });
  }

  const user = getUserByUsernameOrEmail(session.email);
  return NextResponse.json({
    success: true,
    user: user || session,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập!" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      avatarUrl,
      penName,
      upgradeToAuthor,
      oldPassword,
      newPassword,
    } = body;

    const user = getUserByUsernameOrEmail(session.email);
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy hồ sơ người dùng!" },
        { status: 404 }
      );
    }

    // NGUYÊN TẮC BẮT BUỘC: Không được phép sửa tên hiển thị trừ khi là ADMIN!
    if (name && name.trim() !== user.name.trim()) {
      if (session.role !== "ADMIN") {
        return NextResponse.json(
          {
            error:
              "Không được phép sửa tên hiển thị! Tên này chỉ có Quản trị viên (Admin) mới có quyền sửa. Vui lòng liên hệ Admin để được hỗ trợ.",
          },
          { status: 403 }
        );
      }
      user.name = name.trim();
    }

    // Đổi mật khẩu tài khoản
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Vui lòng nhập mật khẩu hiện tại để xác thực đổi mật khẩu!" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu mới phải có tối thiểu 6 ký tự!" },
          { status: 400 }
        );
      }

      // Xác thực mật khẩu cũ từ danh bạ xác thực
      const authUser =
        DEMO_USERS[session.email.toLowerCase()] ||
        DEMO_USERS[session.username.toLowerCase()];
      if (authUser) {
        const isValid = await verifyPassword(oldPassword, authUser.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { error: "Mật khẩu hiện tại không chính xác!" },
            { status: 400 }
          );
        }
        const newHash = await hashPassword(newPassword);
        updateUserPassword(session.email, newHash);
        updateUserPassword(session.username, newHash);
      }
    }

    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (penName && (user.role === "AUTHOR" || user.role === "ADMIN")) {
      user.penName = penName.trim();
    }

    if (upgradeToAuthor && user.role === "READER") {
      user.role = "AUTHOR";
      user.penName = user.penName || user.name;
    }

    updateUser(user.id, user);

    // Refresh session cookie
    await setSessionCookie({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      penName: user.penName,
      avatarUrl: user.avatarUrl,
    });

    return NextResponse.json({
      success: true,
      message: upgradeToAuthor
        ? "Chúc mừng bạn đã trở thành Tác giả Mộc Thư! Hãy bắt đầu sáng tác tác phẩm đầu tay."
        : newPassword
        ? "Cập nhật hồ sơ và đổi mật khẩu thành công!"
        : "Cập nhật hồ sơ cá nhân thành công!",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi cập nhật hồ sơ!" },
      { status: 500 }
    );
  }
}
