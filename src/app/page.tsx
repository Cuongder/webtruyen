import Link from "next/link";
import { ChevronRight, Flame, Sparkles, BookCheck, TrendingUp, Trophy } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { FeaturedHero } from "@/components/story/FeaturedHero";
import { ContinueReadingCard } from "@/components/story/ContinueReadingCard";
import { StoryCardVertical } from "@/components/story/StoryCardVertical";
import { StoryCardMobile } from "@/components/story/StoryCardMobile";
import { GenreChips } from "@/components/story/GenreChips";
import { STORIES_DATA } from "@/lib/data-store";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  const featuredStory = STORIES_DATA.find((s) => s.featured) || STORIES_DATA[0];
  const trendingStories = [...STORIES_DATA].sort((a, b) => b.viewsCount - a.viewsCount);
  const latestStories = [...STORIES_DATA].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      {/* Responsive Headers */}
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-7">
        {/* Genre Quick Filter Chips */}
        <section aria-label="Thể loại truyện">
          <GenreChips />
        </section>

        {/* Hero Spotlight Banner */}
        <section aria-label="Tác phẩm tâm điểm">
          <FeaturedHero story={featuredStory} />
        </section>

        {/* Continue Reading Widget */}
        <section aria-label="Tiếp tục đọc">
          <ContinueReadingCard
            story={featuredStory}
            currentChapterNumber={3}
            currentChapterSlug="chuong-3-kiem-y-so-hien-chan-nhiep-quan-hung"
            progressPercent={45}
          />
        </section>

        {/* Trending This Week Section (Horizontal Scroll Carousel) */}
        <section aria-label="Thịnh hành tuần này">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gold/15 text-accent-gold">
                <Flame className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-primary sm:text-xl">
                Thịnh hành tuần này
              </h2>
            </div>
            <Link
              href="/discover?sort=popular"
              className="flex items-center gap-0.5 text-xs font-semibold text-accent-gold hover:text-accent-cream transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Horizontal scroll cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:gap-4">
            {trendingStories.map((story, index) => (
              <StoryCardVertical
                key={story.id}
                story={story}
                rankBadge={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Golden Ranked List (01 - 05 Editorial Top List) */}
        <section aria-label="Bảng vàng Mộc Thư" className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gold/20 text-accent-gold">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-ink-primary sm:text-lg">
                  Bảng vàng Nguyệt San
                </h2>
                <p className="text-xs text-ink-muted">Tác phẩm được độc giả đón đọc nhiều nhất</p>
              </div>
            </div>
            <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-[11px] font-medium text-accent-gold border border-border-subtle">
              Tháng 10/2026
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {trendingStories.slice(0, 4).map((story, idx) => (
              <StoryCardMobile key={story.id} story={story} rank={idx + 1} />
            ))}
          </div>
        </section>

        {/* Latest Chapter Updates (Vertical List Cards) */}
        <section aria-label="Mới cập nhật">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gold/15 text-accent-gold">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-primary sm:text-xl">
                Mới cập nhật
              </h2>
            </div>
            <Link
              href="/discover?sort=updated"
              className="flex items-center gap-0.5 text-xs font-semibold text-accent-gold hover:text-accent-cream transition-colors"
            >
              <span>Xem thêm</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {latestStories.map((story) => (
              <StoryCardMobile key={story.id} story={story} />
            ))}
          </div>
        </section>

        {/* Completed Stories (Truyện Hoàn Thành) */}
        <section aria-label="Truyện hoàn thành">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <BookCheck className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-primary sm:text-xl">
                Tác phẩm đã hoàn thành
              </h2>
            </div>
            <Link
              href="/discover?status=completed"
              className="flex items-center gap-0.5 text-xs font-semibold text-accent-gold hover:text-accent-cream transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:gap-4">
            {STORIES_DATA.filter((s) => s.status === "COMPLETED").map((story) => (
              <StoryCardVertical key={story.id} story={story} />
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
