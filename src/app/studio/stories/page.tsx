import Link from "next/link";
import { Plus, PenTool, List, Eye, Edit, Clock } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { STORIES_DATA } from "@/lib/data-store";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export default async function StudioStoriesPage() {
  const session = await getSession();
  const authorStories = STORIES_DATA.filter((s) => s.authorId === "author-1");

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
              Quản lý tác phẩm
            </h1>
            <p className="text-xs text-ink-muted">
              {authorStories.length} bộ truyện đã tạo
            </p>
          </div>
          <Link
            href="/studio/stories/new"
            className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-3.5 py-2 text-xs font-bold text-bg-base shadow-sm hover:bg-accent-gold-hover active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo truyện</span>
          </Link>
        </div>

        {/* Stories Cards List for Mobile */}
        <div className="space-y-3.5">
          {authorStories.map((story) => (
            <div
              key={story.id}
              className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-lg border border-border-subtle shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 min-w-0 flex-col justify-between self-stretch">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-accent-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-accent-gold">
                        {story.status === "ONGOING" ? "Đang ra" : "Hoàn thành"}
                      </span>
                      <span className="text-[10px] text-ink-muted flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(story.updatedAt)}
                      </span>
                    </div>

                    <h2 className="mt-1 line-clamp-1 font-display text-base font-bold text-ink-primary">
                      {story.title}
                    </h2>

                    <p className="line-clamp-1 text-xs text-ink-secondary">
                      {story.genres.join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-1">
                    <span>{story.totalChapters} chương</span>
                    <span>•</span>
                    <span>{formatNumber(story.viewsCount)} đọc</span>
                    <span>•</span>
                    <span>{formatNumber(story.followersCount)} theo dõi</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Mobile */}
              <div className="flex items-center gap-2 border-t border-border-subtle pt-3">
                <Link
                  href={`/studio/stories/${story.id}/chapters/new`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-gold py-2 text-xs font-bold text-bg-base shadow-xs hover:bg-accent-gold-hover active:scale-95"
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>Viết chương mới</span>
                </Link>

                <Link
                  href={`/story/${story.slug}`}
                  className="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-ink-primary hover:border-accent-gold/40"
                  title="Xem trước như độc giả"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Xem trước</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
