import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { serializeAdminBadge } from "@/lib/admin-read-model";

export async function GET(req: NextRequest) {
  const context = await requireAdminContext(req);
  if (context.response) return context.response;
  const badges = await db.badge.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    success: true,
    total: badges.length,
    badges: badges.map(serializeAdminBadge),
  });
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireAdminContext(req);
    if (context.response) return context.response;

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

    const normalizedCode = code.toUpperCase().replace(/\s+/g, "_");
    const exists = await db.badge.findFirst({
      where: { OR: [{ code: normalizedCode }, { name: { equals: name, mode: "insensitive" } }] },
    });
    if (exists) {
      return NextResponse.json({ error: "Danh hiệu này đã tồn tại!" }, { status: 400 });
    }

    const newBadge = await db.badge.create({
      data: { name, code: normalizedCode, description, icon, color, category },
    });
    await writeAdminAudit({
      adminId: context.adminId,
      action: "CREATE_BADGE",
      targetType: "BADGE",
      targetId: newBadge.id,
      details: { name: newBadge.name },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo danh hiệu "${newBadge.name}" thành công!`,
      badge: serializeAdminBadge(newBadge),
    });
  } catch (error) {
    console.error("Create Badge Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Mã hoặc tên danh hiệu đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi tạo danh hiệu!" }, { status: 500 });
  }
}
