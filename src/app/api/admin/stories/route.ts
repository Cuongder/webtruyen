import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import {
  STORIES_DATA,
  getUserById,
  adminCreateStory,
  type StoryItem,
} from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase();
  const genre = searchParams.get("genre");
  const status = searchParams.get("status");
  const featured = searchParams.get("featured");

  let list = [...STORIES_DATA];

  if (search) {
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.authorName.toLowerCase().includes(search) ||
        s.authorPenName.toLowerCase().includes(search)
    );
  }

  if (genre) {
    list = list.filter((s) => s.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  }

  if (status) {
    list = list.filter((s) => s.status === status);
  }

  if (featured !== null && featured !== undefined) {
    list = list.filter((s) => s.featured === (featured === "true"));
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    stories: list,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Yêu cầu quyền Quản trị viên!" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      authorMode = "CUSTOM", // "EXISTING_USER" | "CUSTOM"
      authorId,
      authorName,
      authorPenName,
      authorAvatar,
      genres = [],
      tags = [],
      shortDescription,
      fullDescription,
      coverUrl,
      status = "ONGOING",
      featured = false,
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên tác phẩm!" },
        { status: 400 }
      );
    }

    if (!shortDescription || !shortDescription.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập phần giới thiệu tóm tắt tác phẩm!" },
        { status: 400 }
      );
    }

    if (!genres || genres.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một thể loại cho truyện!" },
        { status: 400 }
      );
    }

    // Determine Author details
    let finalAuthorId = authorId;
    let finalAuthorName = authorName?.trim();
    let finalAuthorPenName = authorPenName?.trim() || finalAuthorName;
    let finalAuthorAvatar = authorAvatar?.trim();

    if (authorMode === "EXISTING_USER" && authorId) {
      const existingUser = getUserById(authorId);
      if (existingUser) {
        finalAuthorId = existingUser.id;
        finalAuthorName = existingUser.penName || existingUser.name;
        finalAuthorPenName = existingUser.penName || existingUser.name;
        finalAuthorAvatar = existingUser.avatarUrl;
      }
    }

    if (!finalAuthorName) {
      return NextResponse.json(
        { error: "Vui lòng chỉ định hoặc nhập tên tác giả!" },
        { status: 400 }
      );
    }

    // Check duplicate slug if provided
    if (slug && slug.trim()) {
      const isDuplicate = STORIES_DATA.some(
        (s) => s.slug.toLowerCase() === slug.trim().toLowerCase()
      );
      if (isDuplicate) {
        return NextResponse.json(
          { error: `Đường dẫn tĩnh "${slug}" đã tồn tại! Vui lòng chọn slug khác.` },
          { status: 409 }
        );
      }
    }

    const finalCoverUrl =
      coverUrl && coverUrl.trim()
        ? coverUrl.trim()
        : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80";

    const createdStory = adminCreateStory(
      {
        title,
        slug,
        authorId: finalAuthorId,
        authorName: finalAuthorName,
        authorPenName: finalAuthorPenName,
        authorAvatar: finalAuthorAvatar,
        coverUrl: finalCoverUrl,
        shortDescription,
        fullDescription,
        genres,
        tags,
        status,
        featured,
      },
      auth.adminName || "Admin"
    );

    return NextResponse.json(
      {
        success: true,
        message: `Đã khởi tạo tác phẩm "${createdStory.title}" thành công!`,
        story: createdStory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Create Story Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi khởi tạo tác phẩm!" },
      { status: 500 }
    );
  }
}
