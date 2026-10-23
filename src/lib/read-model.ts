import { db } from "./db";
import { findStories, findStoryByIdOrSlug } from "./repositories/story.repository";
import { serializeStory, serializeChapter } from "./story-mapper";

export async function getPublicStories(options: {
  search?: string;
  genre?: string;
  status?: "ONGOING" | "COMPLETED" | "DRAFT" | "HIATUS";
} = {}) {
  const result = await findStories({
    ...options,
    visibility: "PUBLIC",
  });
  return result.stories.map(serializeStory);
}

export async function getAuthorStories(authorId?: string) {
  const result = await findStories({
    ...(authorId ? { authorId } : {}),
    visibility: "PUBLIC",
  });
  return result.stories.map(serializeStory);
}

export async function getManagedAuthorStories(authorId?: string) {
  const result = await findStories(authorId ? { authorId } : {});
  return result.stories.map(serializeStory);
}

export async function getPublicGenres() {
  const genres = await db.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stories: true } } },
  });
  return genres.map((genre) => ({
    id: genre.id,
    name: genre.name,
    slug: genre.slug,
    description: genre.description || "",
    count: genre._count.stories,
  }));
}

export async function getPublicStory(slug: string) {
  const story = await findStoryByIdOrSlug(slug);
  if (!story || story.visibility !== "PUBLIC" || story.status === "DRAFT") return null;
  return {
    story: serializeStory(story),
    chapters: story.chapters
      .filter((chapter) => chapter.status === "PUBLISHED" && chapter.publishedAt <= new Date())
      .map((chapter) =>
        serializeChapter({
          ...chapter,
          story: { slug: story.slug },
        })
      ),
  };
}
