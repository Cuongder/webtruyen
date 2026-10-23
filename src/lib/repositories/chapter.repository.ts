import { db } from "../db";
import type { ChapterStatus } from "@prisma/client";

// ponytail: Basic chapter operations with direct aggregate counts; upgrade to async queue if word counting/reindexing takes too long.

export async function findChapterById(id: string) {
  return db.chapter.findUnique({
    where: { id },
    include: {
      story: {
        select: {
          id: true,
          slug: true,
          title: true,
          authorId: true,
          visibility: true,
          status: true,
        },
      },
    },
  });
}

export async function findChapterByIdOrSlug(idOrSlug: string) {
  return db.chapter.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      story: {
        select: {
          id: true,
          slug: true,
          title: true,
          authorId: true,
          visibility: true,
          status: true,
        },
      },
    },
  });
}

export async function findChapterByStoryAndIdOrSlug(storyId: string, idOrSlug: string) {
  return db.chapter.findFirst({
    where: {
      storyId,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      story: {
        select: {
          id: true,
          slug: true,
          title: true,
          authorId: true,
          visibility: true,
          status: true,
        },
      },
    },
  });
}

export async function findChaptersByStory(
  storyId: string,
  options: { includeAllStatuses?: boolean } = {}
) {
  return db.chapter.findMany({
    where: {
      storyId,
      ...(options.includeAllStatuses ? {} : { status: "PUBLISHED" }),
    },
    orderBy: {
      chapterNumber: "asc",
    },
    select: {
      id: true,
      storyId: true,
      chapterNumber: true,
      title: true,
      slug: true,
      wordCount: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getNextChapterNumber(storyId: string): Promise<number> {
  const result = await db.chapter.aggregate({
    where: { storyId },
    _max: {
      chapterNumber: true,
    },
  });
  return (result._max.chapterNumber || 0) + 1;
}

export async function createChapter(data: {
  storyId: string;
  chapterNumber?: number;
  title: string;
  slug: string;
  content: string;
  wordCount?: number;
  status?: ChapterStatus;
  publishedAt?: Date;
}) {
  const chapterNumber =
    data.chapterNumber !== undefined
      ? data.chapterNumber
      : await getNextChapterNumber(data.storyId);

  const wordCount =
    data.wordCount !== undefined
      ? data.wordCount
      : data.content.trim().split(/\s+/).filter(Boolean).length;

  return db.$transaction(async (tx) => {
    const chapter = await tx.chapter.create({
      data: {
        storyId: data.storyId,
        chapterNumber,
        title: data.title,
        slug: data.slug,
        content: data.content,
        wordCount,
        status: data.status || "PUBLISHED",
        publishedAt: data.publishedAt || new Date(),
      },
    });

    await tx.story.update({
      where: { id: data.storyId },
      data: {
        updatedAt: new Date(),
      },
    });

    return chapter;
  });
}

export async function updateChapter(
  id: string,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    wordCount?: number;
    status?: ChapterStatus;
    publishedAt?: Date;
  }
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.content && data.wordCount === undefined) {
    updateData.wordCount = data.content.trim().split(/\s+/).filter(Boolean).length;
  }

  const updated = await db.chapter.update({
    where: { id },
    data: updateData,
    include: {
      story: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  await db.story.update({
    where: { id: updated.storyId },
    data: { updatedAt: new Date() },
  });

  return updated;
}

export async function deleteChapter(id: string) {
  const chapter = await db.chapter.findUnique({
    where: { id },
    select: { storyId: true },
  });

  const deleted = await db.chapter.delete({
    where: { id },
  });

  if (chapter?.storyId) {
    await db.story.update({
      where: { id: chapter.storyId },
      data: { updatedAt: new Date() },
    });
  }

  return deleted;
}
