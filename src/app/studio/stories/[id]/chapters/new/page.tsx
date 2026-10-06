import { notFound } from "next/navigation";
import { ChapterEditorMobile } from "@/components/studio/ChapterEditorMobile";
import { STORIES_DATA } from "@/lib/data-store";

interface NewChapterPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewChapterPage({ params }: NewChapterPageProps) {
  const { id } = await params;
  const story =
    STORIES_DATA.find((s) => s.id === id || s.slug === id) || STORIES_DATA[0];

  return (
    <ChapterEditorMobile
      storyId={story.id}
      storySlug={story.slug}
      storyTitle={story.title}
      initialChapterNumber={story.totalChapters + 1}
    />
  );
}
