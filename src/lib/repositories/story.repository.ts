import { db } from "../db";
import type { StoryStatus, Visibility, Prisma } from "@prisma/client";

// ponytail: Direct Prisma relation queries; upgrade to Elasticsearch/Meilisearch if fulltext search needs fuzzy relevance.

export interface FindStoriesFilter {
  search?: string;
  genre?: string;
  status?: StoryStatus;
  authorId?: string;
  visibility?: Visibility;
  featured?: boolean;
  skip?: number;
  take?: number;
}

export async function findStoryByIdOrSlug(idOrSlug: string) {
  return db.story.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
          authorProfile: {
            select: {
              penName: true,
              avatarUrl: true,
            },
          },
        },
      },
      genres: {
        include: {
          genre: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      chapters: {
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          slug: true,
          wordCount: true,
          status: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: {
          chapterNumber: "asc",
        },
      },
    },
  });
}

export async function findStories(filter: FindStoriesFilter = {}) {
  const where: Prisma.StoryWhereInput = {};

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.visibility) {
    where.visibility = filter.visibility;
  }

  if (filter.featured !== undefined) {
    where.featured = filter.featured;
  }

  if (filter.authorId) {
    where.authorId = filter.authorId;
  }

  if (filter.genre) {
    where.genres = {
      some: {
        genre: {
          slug: filter.genre.toLowerCase(),
        },
      },
    };
  }

  if (filter.search) {
    const s = filter.search.toLowerCase().trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { author: { username: { contains: s, mode: "insensitive" } } },
      { author: { profile: { displayName: { contains: s, mode: "insensitive" } } } },
      { author: { authorProfile: { penName: { contains: s, mode: "insensitive" } } } },
    ];
  }

  const [total, stories] = await Promise.all([
    db.story.count({ where }),
    db.story.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      orderBy: { updatedAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
            authorProfile: {
              select: {
                penName: true,
                avatarUrl: true,
              },
            },
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        chapters: {
          select: {
            id: true,
            wordCount: true,
          },
        },
      },
    }),
  ]);

  return { total, stories };
}

export async function createStory(data: {
  title: string;
  slug: string;
  authorId: string;
  shortDescription: string;
  fullDescription?: string;
  coverUrl: string;
  bannerUrl?: string;
  status?: StoryStatus;
  visibility?: Visibility;
  featured?: boolean;
  genreSlugs?: string[];
  tags?: string[];
}) {
  return db.$transaction(async (tx) => {
    const story = await tx.story.create({
      data: {
        title: data.title,
        slug: data.slug,
        authorId: data.authorId,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription || data.shortDescription,
        coverUrl: data.coverUrl,
        bannerUrl: data.bannerUrl,
        status: data.status || "ONGOING",
        visibility: data.visibility || "PUBLIC",
        featured: data.featured || false,
      },
    });

    if (data.genreSlugs && data.genreSlugs.length > 0) {
      for (const gSlug of data.genreSlugs) {
        const genre = await tx.genre.findUnique({ where: { slug: gSlug } });
        if (genre) {
          await tx.storyGenre.create({
            data: {
              storyId: story.id,
              genreId: genre.id,
            },
          });
        }
      }
    }

    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const cleanTag = tagName.trim();
        if (!cleanTag) continue;
        const tagSlug = cleanTag
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: cleanTag, slug: tagSlug },
        });

        await tx.storyTag.create({
          data: {
            storyId: story.id,
            tagId: tag.id,
          },
        });
      }
    }

    return story;
  });
}

export async function updateStory(
  id: string,
  data: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    fullDescription?: string;
    coverUrl?: string;
    bannerUrl?: string;
    status?: StoryStatus;
    visibility?: Visibility;
    featured?: boolean;
  }
) {
  return db.story.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteStory(id: string) {
  return db.story.delete({
    where: { id },
  });
}
