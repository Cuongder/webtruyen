import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { StoryCardMobile } from "@/components/story/StoryCardMobile";
import { GENRES_DATA, STORIES_DATA } from "@/lib/data-store";
import { getSession } from "@/lib/auth";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;
  const genre = GENRES_DATA.find((g) => g.slug === slug);

  if (!genre) {
    notFound();
  }

  const session = await getSession();
  const storiesInGenre = STORIES_DATA.filter((s) =>
    s.genres.some((g) => g.toLowerCase() === genre.name.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 space-y-6">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tất cả thể loại</span>
        </Link>

        {/* Genre Banner */}
        <div className="rounded-2xl border border-border-subtle bg-gradient-to-r from-surface-elevated to-surface p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent-gold/15 px-2.5 py-0.5 text-xs font-semibold text-accent-gold border border-accent-gold/20">
              Thể loại
            </span>
            <span className="text-xs text-ink-muted">{storiesInGenre.length} tác phẩm</span>
          </div>

          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            {genre.name}
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-ink-secondary sm:text-sm">
            {genre.description}
          </p>
        </div>

        {/* Story List */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Tác phẩm nổi bật trong thể loại
          </h2>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {storiesInGenre.map((story) => (
              <StoryCardMobile key={story.id} story={story} />
            ))}
          </div>

          {storiesInGenre.length === 0 && (
            <div className="rounded-2xl border border-border-subtle bg-surface p-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-ink-muted" />
              <p className="mt-2 text-sm text-ink-primary">
                Chưa có tác phẩm nào trong thể loại này
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
