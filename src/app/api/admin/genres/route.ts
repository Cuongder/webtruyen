import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { GENRES_DATA, createNewGenre } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: GENRES_DATA.length,
    genres: GENRES_DATA,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

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

    const exists = GENRES_DATA.find((g) => g.slug === slug || g.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return NextResponse.json({ error: "Thể loại này đã tồn tại trên hệ thống!" }, { status: 400 });
    }

    const newGenre = createNewGenre({
      id: slug,
      name,
      slug,
      description,
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm thành công thể loại "${newGenre.name}"!`,
      genre: newGenre,
    });
  } catch (error) {
    console.error("Create Genre Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi thêm thể loại!" }, { status: 500 });
  }
}
