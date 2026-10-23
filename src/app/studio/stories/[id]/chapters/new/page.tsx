import { notFound } from "next/navigation";
import { ChapterEditorMobile } from "@/components/studio/ChapterEditorMobile";
import { findStoryByIdOrSlug } from "@/lib/repositories/story.repository";

interface NewChapterPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewChapterPage({ params }: NewChapterPageProps) {
  const { id } = await params;
  const story = await findStoryByIdOrSlug(id);
  if (!story) notFound();

  return (
    <ChapterEditorMobile
      storyId={story.id}
      storySlug={story.slug}
      storyTitle={story.title}
      initialChapterNumber={story.chapters.length + 1}
    />
  );
}
