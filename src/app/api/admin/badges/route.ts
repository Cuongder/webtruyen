import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { BADGES_DATA, createNewBadge, type BadgeItem } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: BADGES_DATA.length,
    badges: BADGES_DATA,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      code,
      description = "",
      icon = "Sparkles",
      color = "#D39A5B",
      category = "ACHIEVEMENT",
    } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên và mã danh hiệu!" },
        { status: 400 }
      );
    }

    const exists = BADGES_DATA.find(
      (b) => b.code.toUpperCase() === code.toUpperCase() || b.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      return NextResponse.json({ error: "Danh hiệu này đã tồn tại!" }, { status: 400 });
    }

    const newBadge = createNewBadge({
      name,
      code: code.toUpperCase().replace(/\s+/g, "_"),
      description,
      icon,
      color,
      category: category as BadgeItem["category"],
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo danh hiệu "${newBadge.name}" thành công!`,
      badge: newBadge,
    });
  } catch (error) {
    console.error("Create Badge Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi tạo danh hiệu!" }, { status: 500 });
  }
}
