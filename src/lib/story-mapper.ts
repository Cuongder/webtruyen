import type { Chapter, Story } from "@prisma/client";
import type { ChapterItem, StoryItem } from "./data-store";

type StoryWithRelations = Story & {
  author?: {
    username: string;
    profile?: { displayName: string | null; avatarUrl: string | null } | null;
    authorProfile?: { penName: string; avatarUrl: string | null } | null;
  } | null;
  genres?: Array<{ genre: { name: string; slug: string } }>;
  tags?: Array<{ tag: { name: string; slug: string } }>;
  chapters?: Array<{
    id: string;
    chapterNumber?: number;
    wordCount: number;
    title?: string;
    slug?: string;
    content?: string;
    publishedAt?: Date | null;
  }>;
};

export function serializeStory(story: StoryWithRelations): StoryItem {
  const authorName =
    story.author?.authorProfile?.penName ||
    story.author?.profile?.displayName ||
    story.author?.username ||
    "Tác giả";

  return {
    id: story.id,
    title: story.title,
    slug: story.slug,
    authorId: story.authorId,
    authorName,
    authorPenName: story.author?.authorProfile?.penName || authorName,
    authorAvatar:
      story.author?.authorProfile?.avatarUrl ||
      story.author?.profile?.avatarUrl ||
      "",
    coverUrl: story.coverUrl,
    shortDescription: story.shortDescription,
    fullDescription: story.fullDescription,
    status: story.status === "HIATUS" ? "ONGOING" : story.status,
    genres: story.genres?.map(({ genre }) => genre.name) || [],
    tags: story.tags?.map(({ tag }) => tag.name) || [],
    viewsCount: story.viewsCount,
    followersCount: story.followersCount,
    ratingScore: story.ratingScore,
    ratingsCount: 0,
    totalChapters: story.chapters?.length || 0,
    wordCount:
      story.chapters?.reduce((total, chapter) => total + chapter.wordCount, 0) || 0,
    featured: story.featured,
    updatedAt: story.updatedAt.toISOString(),
  };
}

export function serializeChapter(
  chapter: {
    id: string;
    storyId?: string;
    chapterNumber: number;
    title: string;
    slug: string;
    content?: string;
    wordCount: number;
    publishedAt: Date;
    createdAt: Date;
    story?: { slug: string } | null;
  }
): ChapterItem {
  return {
    id: chapter.id,
    storyId: chapter.storyId || "",
    storySlug: chapter.story?.slug || "",
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    slug: chapter.slug,
    content: chapter.content || "",
    wordCount: chapter.wordCount,
    publishedAt: (chapter.publishedAt || chapter.createdAt).toISOString(),
  };
}
