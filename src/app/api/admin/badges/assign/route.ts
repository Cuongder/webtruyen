import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { assignBadgeToUser, removeBadgeFromUser, getUserById, BADGES_DATA } from "@/lib/data-store";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, badgeId, action = "assign" } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ userId và badgeId!" },
        { status: 400 }
      );
    }

    const user = getUserById(userId);
    const badge = BADGES_DATA.find((b) => b.id === badgeId);

    if (!user || !badge) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng hoặc danh hiệu!" },
        { status: 404 }
      );
    }

    if (action === "remove") {
      removeBadgeFromUser(userId, badgeId, session.name);
      return NextResponse.json({
        success: true,
        message: `Đã thu hồi danh hiệu "${badge.name}" từ ${user.name}!`,
        user,
      });
    } else {
      assignBadgeToUser(userId, badgeId, session.name);
      return NextResponse.json({
        success: true,
        message: `Đã trao tặng danh hiệu "${badge.name}" cho ${user.name}!`,
        user,
      });
    }
  } catch (error) {
    console.error("Assign Badge Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi gán danh hiệu!" }, { status: 500 });
  }
}
