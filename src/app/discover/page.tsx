import Link from "next/link";
import { Filter, SlidersHorizontal, BookOpen, Star } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { StoryCardMobile } from "@/components/story/StoryCardMobile";
import { STORIES_DATA, GENRES_DATA } from "@/lib/data-store";
import { getSession } from "@/lib/auth";

interface DiscoverPageProps {
  searchParams: Promise<{
    genre?: string;
    status?: string;
    sort?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { genre, status, sort } = await searchParams;
  const session = await getSession();

  let stories = [...STORIES_DATA];

  if (genre) {
    stories = stories.filter((s) =>
      s.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  if (status) {
    stories = stories.filter(
      (s) => s.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (sort === "popular") {
    stories.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sort === "rating") {
    stories.sort((a, b) => b.ratingScore - a.ratingScore);
  } else if (sort === "updated") {
    stories.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-5">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
              Khám phá tác phẩm
            </h1>
            <p className="text-xs text-ink-muted">
              {stories.length} bộ truyện tuyển chọn
            </p>
          </div>
        </div>

        {/* Filter Bar (Horizontal chips on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <Link
            href="/discover"
            className={`shrink-0 rounded-full px-4 py-1.5 font-medium transition-all ${
              !genre && !status && !sort
                ? "bg-accent-gold text-bg-base font-semibold"
                : "border border-border-subtle bg-surface text-ink-secondary"
            }`}
          >
            Tất cả
          </Link>
          <Link
            href="/discover?sort=popular"
            className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all ${
              sort === "popular"
                ? "bg-accent-gold text-bg-base font-semibold"
                : "border border-border-subtle bg-surface text-ink-secondary"
            }`}
          >
            Đọc nhiều nhất
          </Link>
          <Link
            href="/discover?status=completed"
            className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all ${
              status === "completed"
                ? "bg-accent-gold text-bg-base font-semibold"
                : "border border-border-subtle bg-surface text-ink-secondary"
            }`}
          >
            Đã hoàn thành
          </Link>
          <Link
            href="/discover?sort=rating"
            className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all ${
              sort === "rating"
                ? "bg-accent-gold text-bg-base font-semibold"
                : "border border-border-subtle bg-surface text-ink-secondary"
            }`}
          >
            Đánh giá cao
          </Link>
        </div>

        {/* Genre Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {GENRES_DATA.map((g) => (
            <Link
              key={g.id}
              href={`/discover?genre=${encodeURIComponent(g.name)}`}
              className={`shrink-0 rounded-lg px-3 py-1 text-xs transition-colors ${
                genre?.toLowerCase() === g.name.toLowerCase()
                  ? "bg-surface-elevated text-accent-gold border border-accent-gold/40 font-medium"
                  : "bg-surface/70 text-ink-muted hover:text-ink-primary"
              }`}
            >
              {g.name} ({g.count})
            </Link>
          ))}
        </div>

        {/* Stories Results Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCardMobile key={story.id} story={story} />
          ))}
        </div>

        {stories.length === 0 && (
          <div className="rounded-2xl border border-border-subtle bg-surface p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-semibold text-ink-primary">
              Không tìm thấy tác phẩm phù hợp
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Hãy thử chọn lại thể loại hoặc bộ lọc khác
            </p>
            <Link
              href="/discover"
              className="mt-4 inline-block rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base"
            >
              Xem tất cả truyện
            </Link>
          </div>
        )}
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
