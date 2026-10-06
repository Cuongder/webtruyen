import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { CHAPTERS_DATA, STORIES_DATA } from "@/lib/data-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  for (const slug in CHAPTERS_DATA) {
    const chapter = CHAPTERS_DATA[slug].find((c) => c.id === id || c.slug === id);
    if (chapter) {
      return NextResponse.json({ success: true, chapter });
    }
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
    let foundChapter = null;
    let foundStory = null;

    for (const slug in CHAPTERS_DATA) {
      const idx = CHAPTERS_DATA[slug].findIndex((c) => c.id === id || c.slug === id);
      if (idx !== -1) {
        foundChapter = CHAPTERS_DATA[slug][idx];
        foundStory = STORIES_DATA.find((s) => s.slug === slug);
        break;
      }
    }

    if (!foundChapter || !foundStory) {
      return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && foundStory.authorId !== session.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa chương này!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (body.title) foundChapter.title = body.title;
    if (body.content) {
      foundChapter.content = body.content;
      foundChapter.wordCount = body.content.trim().split(/\s+/).filter(Boolean).length;
    }

    foundStory.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Cập nhật chương thành công!",
      chapter: foundChapter,
    });
  } catch (error) {
    console.error("Update chapter error:", error);
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

    for (const slug in CHAPTERS_DATA) {
      const idx = CHAPTERS_DATA[slug].findIndex((c) => c.id === id || c.slug === id);
      if (idx !== -1) {
        const foundStory = STORIES_DATA.find((s) => s.slug === slug);
        if (foundStory && session.role !== "ADMIN" && foundStory.authorId !== session.id) {
          return NextResponse.json(
            { error: "Bạn không có quyền xóa chương này!" },
            { status: 403 }
          );
        }

        const deleted = CHAPTERS_DATA[slug].splice(idx, 1)[0];
        if (foundStory) {
          foundStory.totalChapters = CHAPTERS_DATA[slug].length;
          foundStory.updatedAt = new Date().toISOString();
        }

        return NextResponse.json({
          success: true,
          message: `Đã xóa thành công ${deleted.title}`,
        });
      }
    }

    return NextResponse.json({ error: "Không tìm thấy chương truyện!" }, { status: 404 });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa chương!" }, { status: 500 });
  }
}
