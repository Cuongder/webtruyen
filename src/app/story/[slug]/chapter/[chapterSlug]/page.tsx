import { notFound } from "next/navigation";
import { findChapterByIdOrSlug } from "@/lib/repositories/chapter.repository";
import { getPublicStory } from "@/lib/read-model";
import { getSession } from "@/lib/auth";
import { canReadChapter } from "@/lib/access-control";
import { serializeChapter } from "@/lib/story-mapper";
import { ReaderCanvas } from "@/components/reader/ReaderCanvas";

export const dynamic = "force-dynamic";

interface ChapterReaderPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function ChapterReaderPage({ params }: ChapterReaderPageProps) {
  const { slug, chapterSlug } = await params;

  const publicStory = await getPublicStory(slug);
  if (!publicStory) {
    notFound();
  }

  const story = publicStory.story;
  const allChapters = publicStory.chapters;
  const currentChapterIndex = allChapters.findIndex(
    (c) => c.slug === chapterSlug || c.chapterNumber.toString() === chapterSlug
  );

  if (currentChapterIndex === -1) {
    notFound();
  }

  const chapterSummary = allChapters[currentChapterIndex];
  const session = await getSession();
  const dbChapter = await findChapterByIdOrSlug(chapterSummary.id);
  if (!dbChapter || !canReadChapter(dbChapter, dbChapter.story, session)) {
    notFound();
  }
  const chapter = serializeChapter(dbChapter);
  const prevChapter =
    currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex < allChapters.length - 1
      ? allChapters[currentChapterIndex + 1]
      : null;

  return (
    <ReaderCanvas
      story={story}
      chapter={chapter}
      allChapters={allChapters}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
