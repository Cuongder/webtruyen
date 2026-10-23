import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BADGES_DATA, GENRES_DATA, STORIES_DATA, CHAPTERS_DATA, USERS_DATA } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu (Seed Data) cho Mộc Thư...");

  const defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || defaultPassword;
  const authorPassword = process.env.SEED_AUTHOR_PASSWORD || defaultPassword;
  const readerPassword = process.env.SEED_READER_PASSWORD || defaultPassword;
  if (!adminPassword || !authorPassword || !readerPassword) {
    throw new Error(
      "Missing SEED_ADMIN_PASSWORD, SEED_AUTHOR_PASSWORD, SEED_READER_PASSWORD (or SEED_DEFAULT_USER_PASSWORD)."
    );
  }

  // 1. Tạo users từ env-managed passwords.
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const authorPasswordHash = await bcrypt.hash(authorPassword, 12);
  const readerPasswordHash = await bcrypt.hash(readerPassword, 12);

  const readerUser = await prisma.user.upsert({
    where: { email: "reader@mocthu.vn" },
    update: {},
    create: {
      email: "reader@mocthu.vn",
      username: "lamphong",
      passwordHash: readerPasswordHash,
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
      passwordHash: authorPasswordHash,
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
      passwordHash: adminPasswordHash,
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
      passwordHash: adminPasswordHash,
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

  console.log("✅ Đã tạo thành công các tài khoản seed.");

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

  for (const badge of BADGES_DATA) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category,
      },
      create: {
        id: badge.id,
        name: badge.name,
        code: badge.code,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category,
      },
    });
  }
  const seededUsers = await prisma.user.findMany({ select: { id: true, username: true } });
  for (const legacyUser of USERS_DATA) {
    const user = seededUsers.find((candidate) => candidate.username === legacyUser.username);
    if (!user) continue;
    for (const badgeId of legacyUser.badges) {
      const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
      if (badge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
          update: {},
          create: { userId: user.id, badgeId: badge.id },
        });
      }
    }
  }

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
