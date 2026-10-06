import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { GENRES_DATA, deleteGenre, STORIES_DATA } from "@/lib/data-store";

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
    const genre = GENRES_DATA.find((g) => g.id === id || g.slug === id);

    if (!genre) {
      return NextResponse.json({ error: "Không tìm thấy thể loại!" }, { status: 404 });
    }

    // Safety: check if stories are using this genre
    const storiesUsing = STORIES_DATA.filter((s) => s.genres.includes(genre.slug));
    if (storiesUsing.length > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa thể loại "${genre.name}" vì đang có ${storiesUsing.length} truyện sử dụng!`,
        },
        { status: 400 }
      );
    }

    deleteGenre(genre.id, session.name);

    return NextResponse.json({
      success: true,
      message: `Đã xóa thể loại "${genre.name}" thành công!`,
    });
  } catch (error) {
    console.error("Delete Genre Error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa thể loại!" }, { status: 500 });
  }
}
