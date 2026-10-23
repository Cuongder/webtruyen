import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { serializeAdminGenre } from "@/lib/admin-read-model";

export async function GET(req: NextRequest) {
  const context = await requireAdminContext(req);
  if (context.response) return context.response;
  const genres = await db.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stories: true } } },
  });
  return NextResponse.json({
    success: true,
    total: genres.length,
    genres: genres.map(serializeAdminGenre),
  });
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireAdminContext(req);
    if (context.response) return context.response;

    const body = await req.json();
    const { name, slug: customSlug, description = "" } = body;

    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập tên thể loại!" }, { status: 400 });
    }

    const slug =
      customSlug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const exists = await db.genre.findFirst({ where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] } });
    if (exists) {
      return NextResponse.json({ error: "Thể loại này đã tồn tại trên hệ thống!" }, { status: 400 });
    }

    const newGenre = await db.genre.create({
      data: {
      name,
      slug,
      description,
      },
      include: { _count: { select: { stories: true } } },
    });
    await writeAdminAudit({
      adminId: context.adminId,
      action: "CREATE_GENRE",
      targetType: "GENRE",
      targetId: newGenre.id,
      details: { name: newGenre.name },
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm thành công thể loại "${newGenre.name}"!`,
      genre: serializeAdminGenre(newGenre),
    });
  } catch (error) {
    console.error("Create Genre Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Slug hoặc tên thể loại đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi thêm thể loại!" }, { status: 500 });
  }
}
