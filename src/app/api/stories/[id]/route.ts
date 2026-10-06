import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { STORIES_DATA, deleteStory, type StoryItem } from "@/lib/data-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

  if (!story) {
    return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
  }

  return NextResponse.json({ success: true, story });
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
    const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }

    // Guard: Only story author or admin can update
    if (session.role !== "ADMIN" && story.authorId !== session.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa tác phẩm này!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const allowedKeys: (keyof StoryItem)[] = [
      "title",
      "shortDescription",
      "fullDescription",
      "coverUrl",
      "status",
      "genres",
      "tags",
      "featured",
    ];

    allowedKeys.forEach((key) => {
      if (body[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (story as any)[key] = body[key];
      }
    });

    story.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Cập nhật tác phẩm thành công!",
      story,
    });
  } catch (error) {
    console.error("Update story error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật truyện!" }, { status: 500 });
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
    const story = STORIES_DATA.find((s) => s.id === id || s.slug === id);

    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }

    // Guard: Only author or admin can delete
    if (session.role !== "ADMIN" && story.authorId !== session.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa tác phẩm này!" },
        { status: 403 }
      );
    }

    deleteStory(story.id, session.name);

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công tác phẩm "${story.title}"`,
    });
  } catch (error) {
    console.error("Delete story error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa tác phẩm!" }, { status: 500 });
  }
}
