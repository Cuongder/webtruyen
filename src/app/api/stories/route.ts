import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { STORIES_DATA, CHAPTERS_DATA, type StoryItem } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase();
  const genre = searchParams.get("genre");
  const status = searchParams.get("status");
  const author = searchParams.get("author");

  let filtered = [...STORIES_DATA];

  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.authorName.toLowerCase().includes(search) ||
        (s.authorPenName && s.authorPenName.toLowerCase().includes(search))
    );
  }

  if (genre) {
    filtered = filtered.filter((s) => s.genres.includes(genre));
  }

  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }

  if (author) {
    filtered = filtered.filter((s) => s.authorId === author);
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    stories: filtered,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AUTHOR" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập với vai trò Tác giả hoặc Quản trị viên để đăng truyện!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      shortDescription,
      fullDescription,
      coverUrl,
      bannerUrl,
      genreIds = [],
      tags = [],
      status = "ONGOING",
    } = body;

    if (!title || !shortDescription || !coverUrl) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tiêu đề, mô tả ngắn và ảnh bìa!" },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug =
      customSlug ||
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const newStory: StoryItem = {
      id: `story-${Date.now()}`,
      title,
      slug,
      authorId: session.id,
      authorName: session.name,
      authorPenName: session.penName || session.name,
      authorAvatar: session.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      coverUrl,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      status: status as "ONGOING" | "COMPLETED" | "DRAFT",
      genres: genreIds.length > 0 ? genreIds : ["tien-hiep"],
      tags: tags.length > 0 ? tags : ["Sáng Tác Việt", "Mộc Thư"],
      viewsCount: 0,
      followersCount: 0,
      ratingScore: 5.0,
      ratingsCount: 1,
      totalChapters: 0,
      wordCount: 0,
      featured: false,
      updatedAt: new Date().toISOString(),
    };

    STORIES_DATA.unshift(newStory);
    CHAPTERS_DATA[newStory.slug] = [];

    return NextResponse.json({
      success: true,
      message: "Tạo truyện thành công!",
      story: newStory,
    });
  } catch (error) {
    console.error("Create Story Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi đăng truyện!" },
      { status: 500 }
    );
  }
}
