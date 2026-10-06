import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GENRES_DATA, STORIES_DATA, CHAPTERS_DATA } from "../src/lib/data-store";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu (Seed Data) cho Mộc Thư...");

  // 1. Tạo demo users
  const passwordHash = await bcrypt.hash("mocthu123", 10);

  const readerUser = await prisma.user.upsert({
    where: { email: "reader@mocthu.vn" },
    update: {},
    create: {
      email: "reader@mocthu.vn",
      username: "lamphong",
      passwordHash,
      role: Role.READER,
      profile: {
        create: {
          displayName: "Lâm Phong",
          bio: "Độc giả đam mê tiên hiệp cổ phong và huyền ảo.",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        },
      },
    },
  });

  const authorUser = await prisma.user.upsert({
    where: { email: "author@mocthu.vn" },
    update: {},
    create: {
      email: "author@mocthu.vn",
      username: "coniemvu",
      passwordHash,
      role: Role.AUTHOR,
      profile: {
        create: {
          displayName: "Cố Niệm Vũ",
          bio: "Cây bút chuyên sáng tác thể loại tiên hiệp và kiếm hiệp cổ điển.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        },
      },
      authorProfile: {
        create: {
          penName: "Cố Niệm Vũ",
          bio: "Lấy câu từ làm đò chở đạo, dùng kiếm ý tạc bóng nhân sinh.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          followerCount: 38400,
          totalViews: 1240000,
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mocthu.vn" },
    update: {},
    create: {
      email: "admin@mocthu.vn",
      username: "quantrimocthu",
      passwordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          displayName: "Quản Trị Mộc Thư",
          bio: "Ban quản trị và điều phối nội dung nền tảng Mộc Thư.",
        },
      },
    },
  });

  const hotprinceAdmin = await prisma.user.upsert({
    where: { email: "hotprince@mocthu.vn" },
    update: {},
    create: {
      email: "hotprince@mocthu.vn",
      username: "hotprince",
      passwordHash: await bcrypt.hash("Napoleong112@", 10),
      role: Role.ADMIN,
      profile: {
        create: {
          displayName: "Hot Prince",
          bio: "Quản trị viên tối cao của nền tảng Mộc Thư.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        },
      },
    },
  });

  console.log("✅ Đã tạo thành công các tài khoản: reader, author, admin, hotprince.");

  // 2. Tạo thể loại (Genres)
  for (const genre of GENRES_DATA) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: {
        name: genre.name,
        slug: genre.slug,
        description: genre.description,
      },
    });
  }
  console.log(`✅ Đã tạo ${GENRES_DATA.length} thể loại văn học.`);

  // 3. Tạo các bộ truyện và chương
  for (const story of STORIES_DATA) {
    const createdStory = await prisma.story.upsert({
      where: { slug: story.slug },
      update: {},
      create: {
        title: story.title,
        slug: story.slug,
        authorId: authorUser.id,
        shortDescription: story.shortDescription,
        fullDescription: story.fullDescription,
        coverUrl: story.coverUrl,
        viewsCount: story.viewsCount,
        followersCount: story.followersCount,
        ratingScore: story.ratingScore,
        status: story.status === "COMPLETED" ? "COMPLETED" : "ONGOING",
      },
    });

    const chapters = CHAPTERS_DATA[story.slug] || [];
    for (const ch of chapters) {
      await prisma.chapter.upsert({
        where: {
          storyId_chapterNumber: {
            storyId: createdStory.id,
            chapterNumber: ch.chapterNumber,
          },
        },
        update: {},
        create: {
          storyId: createdStory.id,
          chapterNumber: ch.chapterNumber,
          title: ch.title,
          slug: ch.slug,
          content: ch.content,
          wordCount: ch.wordCount,
        },
      });
    }
  }

  console.log(`✅ Đã gieo mầm ${STORIES_DATA.length} bộ truyện kèm chương mẫu tiếng Việt.`);
  console.log("🎉 Hoàn tất quá trình Seed dữ liệu!");
}

main()
  .catch((e) => {
    console.error("Lỗi khi seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
