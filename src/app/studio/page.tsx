import Link from "next/link";
import {
  Feather,
  BookOpen,
  Eye,
  Users,
  Plus,
  PenTool,
  MessageSquare,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { STORIES_DATA } from "@/lib/data-store";
import { formatNumber } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export default async function StudioDashboardPage() {
  const session = await getSession();

  const authorStories = STORIES_DATA.filter((s) => s.authorId === "author-1");
  const totalViews = authorStories.reduce((acc, s) => acc + s.viewsCount, 0);
  const totalFollowers = authorStories.reduce((acc, s) => acc + s.followersCount, 0);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 space-y-6">
        {/* Studio Banner */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-gradient-to-r from-surface-elevated via-surface to-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent-gold/20 px-2.5 py-0.5 text-xs font-semibold text-accent-gold">
                Author Studio
              </span>
              <span className="text-xs text-ink-muted">Không gian sáng tác</span>
            </div>
            <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
              Chào mừng trở lại, {session?.penName || "Tác giả"}
            </h1>
            <p className="text-xs text-ink-secondary">
              Hôm nay câu từ của bạn đã chạm đến hàng ngàn độc giả.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/studio/stories/new"
              className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold text-bg-base shadow-sm hover:bg-accent-gold-hover transition-colors active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo truyện mới</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-medium">Tổng lượt đọc</span>
              <Eye className="h-4 w-4 text-accent-gold" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink-primary">
              {formatNumber(totalViews)}
            </p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="h-3 w-3" /> +14.2% tuần này
            </span>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-medium">Người theo dõi</span>
              <Users className="h-4 w-4 text-accent-cream" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink-primary">
              {formatNumber(totalFollowers)}
            </p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="h-3 w-3" /> +280 độc giả mới
            </span>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-medium">Tác phẩm</span>
              <BookOpen className="h-4 w-4 text-accent-gold" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink-primary">
              {authorStories.length}
            </p>
            <span className="text-[10px] text-ink-muted mt-0.5 block">Đang phát hành</span>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-medium">Tổng số chữ</span>
              <Feather className="h-4 w-4 text-accent-cream" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink-primary">
              1.3M
            </p>
            <span className="text-[10px] text-ink-muted mt-0.5 block">218 chương</span>
          </div>
        </div>

        {/* Stories Management Quick List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-primary">
              Tác phẩm của bạn
            </h2>
            <Link
              href="/studio/stories"
              className="flex items-center gap-0.5 text-xs text-accent-gold hover:underline"
            >
              <span>Quản lý tất cả</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {authorStories.map((story) => (
              <div
                key={story.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-border-subtle shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.coverUrl}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-primary">
                      {story.title}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {story.totalChapters} chương • {formatNumber(story.viewsCount)} đọc
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/studio/stories/${story.id}/chapters/new`}
                    className="flex items-center gap-1 rounded-xl bg-accent-gold/15 px-3 py-1.5 text-xs font-semibold text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/25 active:scale-95"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">Viết chương</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
