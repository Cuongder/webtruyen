import { notFound } from "next/navigation";
import { STORIES_DATA, CHAPTERS_DATA } from "@/lib/data-store";
import { ReaderCanvas } from "@/components/reader/ReaderCanvas";

interface ChapterReaderPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function ChapterReaderPage({ params }: ChapterReaderPageProps) {
  const { slug, chapterSlug } = await params;

  const story = STORIES_DATA.find((s) => s.slug === slug);
  if (!story) {
    notFound();
  }

  const allChapters = CHAPTERS_DATA[slug] || [];
  const currentChapterIndex = allChapters.findIndex(
    (c) => c.slug === chapterSlug || c.chapterNumber.toString() === chapterSlug
  );

  if (currentChapterIndex === -1) {
    notFound();
  }

  const chapter = allChapters[currentChapterIndex];
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
