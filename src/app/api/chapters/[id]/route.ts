import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canManageChapter, canReadChapter } from "@/lib/access-control";
import {
  deleteChapter,
  findChapterById,
  findChapterByIdOrSlug,
  updateChapter,
} from "@/lib/repositories/chapter.repository";
import { serializeChapter } from "@/lib/story-mapper";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const chapter = await findChapterByIdOrSlug(id);
  const session = await getSession();
  if (chapter && canReadChapter(chapter, chapter.story, session)) {
    return NextResponse.json({ success: true, chapter: serializeChapter(chapter) });
  }

  return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await params;
    const foundChapter = await findChapterByIdOrSlug(id);
    const foundStory = foundChapter?.story;

    if (!foundChapter || !foundStory) {
      return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
    }

    if (!canManageChapter(foundStory, session)) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa chương này!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateChapter(foundChapter.id, {
      title: typeof body.title === "string" ? body.title.trim() : undefined,
      content: typeof body.content === "string" ? body.content : undefined,
      status:
        body.status === "DRAFT" ||
        body.status === "SCHEDULED" ||
        body.status === "PUBLISHED" ||
        body.status === "TRASH"
          ? body.status
          : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật chương thành công!",
      chapter: serializeChapter({ ...updated, story: foundStory }),
    });
  } catch (error) {
    console.error("Update chapter error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Slug chương đã tồn tại." }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi cập nhật chương!" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await params;

    const foundChapter = await findChapterByIdOrSlug(id);
    if (foundChapter) {
      if (!canManageChapter(foundChapter.story, session)) {
        return NextResponse.json(
          { error: "Bạn không có quyền xóa chương này!" },
          { status: 403 }
        );
      }

      const deleted = await deleteChapter(foundChapter.id);
      return NextResponse.json({
        success: true,
        message: `Đã xóa thành công ${deleted.title}`,
      });
    }

    return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
  } catch (error) {
    console.error("Delete chapter error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa chương!" }, { status: 500 });
  }
}
