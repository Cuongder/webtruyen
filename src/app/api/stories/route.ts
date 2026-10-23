import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { createStory, findStories } from "@/lib/repositories/story.repository";
import { serializeStory } from "@/lib/story-mapper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || undefined;
  const genre = searchParams.get("genre");
  const status = searchParams.get("status");
  const author = searchParams.get("author");

  const result = await findStories({
    search,
    genre: genre || undefined,
    status:
      status === "COMPLETED" || status === "DRAFT" || status === "HIATUS"
        ? status
        : status === "ONGOING"
          ? "ONGOING"
          : undefined,
    authorId: author || undefined,
    visibility: "PUBLIC",
  });

  return NextResponse.json({
    success: true,
    total: result.total,
    stories: result.stories.map(serializeStory),
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

    const story = await createStory({
      title: title.trim(),
      slug,
      authorId: session.id,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription?.trim() || shortDescription.trim(),
      coverUrl: coverUrl.trim(),
      bannerUrl: bannerUrl?.trim() || undefined,
      status:
        status === "COMPLETED" || status === "DRAFT" || status === "HIATUS"
          ? status
          : "ONGOING",
      genreSlugs: Array.isArray(genreIds) ? genreIds : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    return NextResponse.json({
      success: true,
      message: "Tạo truyện thành công!",
      story: serializeStory(story),
    });
  } catch (error) {
    console.error("Create Story Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Slug truyện đã tồn tại." }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy tác giả hoặc thể loại." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Lỗi máy chủ khi đăng truyện!" },
      { status: 500 }
    );
  }
}
