import Link from "next/link";
import { BookMarked, Play, Clock, Sparkles } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { STORIES_DATA } from "@/lib/data-store";
import { getSession } from "@/lib/auth";

interface LibraryPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { tab = "reading" } = await searchParams;
  const session = await getSession();

  const tabs = [
    { id: "reading", label: "Đang đọc (3)" },
    { id: "following", label: "Theo dõi (5)" },
    { id: "favorite", label: "Yêu thích (4)" },
    { id: "finished", label: "Đã đọc (2)" },
  ];

  const libraryStories = STORIES_DATA.slice(0, 3).map((story, i) => ({
    ...story,
    currentChapter: i === 0 ? 3 : i === 1 ? 14 : 45,
    percent: i === 0 ? 45 : i === 1 ? 20 : 80,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 space-y-5">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
            Tủ sách của bạn
          </h1>
          <p className="text-xs text-ink-muted">
            Quản lý tiến độ đọc và truyện theo dõi
          </p>
        </div>

        {/* Horizontal Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border-subtle">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <Link
                key={t.id}
                href={`/library?tab=${t.id}`}
                className={`shrink-0 border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-accent-gold text-accent-gold"
                    : "border-transparent text-ink-muted hover:text-ink-primary"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Stories List with Progress Bars */}
        <div className="space-y-3">
          {libraryStories.map((story) => (
            <div
              key={story.id}
              className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-surface p-3.5 shadow-xs transition-colors hover:border-accent-gold/40"
            >
              {/* Cover 3:4 */}
              <div className="relative h-22 w-16 shrink-0 overflow-hidden rounded-lg border border-border-subtle shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info & Progress */}
              <div className="flex flex-1 min-w-0 flex-col justify-between self-stretch py-0.5">
                <div>
                  <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-primary sm:text-base">
                    {story.title}
                  </h3>
                  <p className="text-xs text-ink-secondary">
                    {story.authorPenName || story.authorName}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                    <span>
                      Chương {story.currentChapter} / {story.totalChapters}
                    </span>
                    <span className="font-semibold text-accent-gold">
                      {story.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
                    <div
                      className="h-full rounded-full bg-accent-gold"
                      style={{ width: `${story.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/story/${story.slug}/chapter/chuong-1-kiem-gi-duoi-tang-tung`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gold text-bg-base shadow-sm transition-transform active:scale-95"
                title="Đọc tiếp"
              >
                <Play className="h-4 w-4 fill-bg-base ml-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
