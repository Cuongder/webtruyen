"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookMarked, Play, Clock, Sparkles, BookOpen } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import type { StoryItem } from "@/lib/data-store";
import type { SessionUser } from "@/lib/auth";

interface ReadingProgress {
  storySlug: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle?: string;
  percent: number;
  updatedAt: string;
}

interface LibraryEntry {
  id: string;
  shelfType: "READING" | "FOLLOWING" | "FAVORITE" | "READ_LATER" | "FINISHED";
  story: StoryItem;
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "reading";

  const [session, setSession] = useState<SessionUser | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [entries, setEntries] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setEntries(data.entries || []);
        const nextProgress: Record<string, ReadingProgress> = {};
        for (const item of data.progress || []) {
          if (!item.story?.slug) continue;
          nextProgress[item.story.slug] = {
            storySlug: item.story.slug,
            chapterSlug: item.chapter?.slug || "",
            chapterNumber: item.chapter?.chapterNumber || 1,
            chapterTitle: item.chapter?.title,
            percent: Math.round(item.scrollPercentage || 0),
            updatedAt: item.updatedAt,
          };
        }
        setProgressMap(nextProgress);
      })
      .catch(() => {});
  }, []);

  const storiesByShelf = (shelf: LibraryEntry["shelfType"]) =>
    entries.filter((entry) => entry.shelfType === shelf).map((entry) => entry.story);

  const readingStories = useMemo(() => storiesByShelf("READING"), [entries]);
  const followingStories = useMemo(() => storiesByShelf("FOLLOWING"), [entries]);
  const favoriteStories = useMemo(() => storiesByShelf("FAVORITE"), [entries]);
  const finishedStories = useMemo(() => storiesByShelf("FINISHED"), [entries]);

  const tabData = useMemo(() => [
    { id: "reading", label: `Đang đọc (${readingStories.length})`, list: readingStories },
    { id: "following", label: `Theo dõi (${followingStories.length})`, list: followingStories },
    { id: "favorite", label: `Yêu thích (${favoriteStories.length})`, list: favoriteStories },
    { id: "finished", label: `Đã đọc (${finishedStories.length})`, list: finishedStories },
  ], [readingStories, followingStories, favoriteStories, finishedStories]);

  const activeTabConfig = tabData.find((t) => t.id === currentTab) || tabData[0];
  const displayedStories = activeTabConfig.list;

  const getStoryProgress = (story: StoryItem) => {
    const prog = progressMap[story.slug];
    if (prog) {
      return {
        currentChapter: prog.chapterNumber || 1,
        percent: prog.percent || 1,
        chapterSlug: prog.chapterSlug,
      };
    }
    return {
      currentChapter: 1,
      percent: 0,
      chapterSlug: undefined,
    };
  };

  const getContinueUrl = (story: StoryItem) => {
    const { chapterSlug } = getStoryProgress(story);
    if (chapterSlug) {
      return `/story/${story.slug}/chapter/${chapterSlug}`;
    }
    return `/story/${story.slug}`;
  };

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
          {tabData.map((t) => {
            const isActive = currentTab === t.id;
            return (
              <Link
                key={t.id}
                href={`/library?tab=${t.id}`}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all min-h-[44px] flex items-center ${
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
          {displayedStories.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
              Chưa có tác phẩm nào trong ngăn này.
            </div>
          ) : (
            displayedStories.map((story) => {
              const { currentChapter, percent } = getStoryProgress(story);
              const continueUrl = getContinueUrl(story);

              return (
                <div
                  key={story.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-surface p-3.5 shadow-xs transition-colors hover:border-accent-gold/40"
                >
                  {/* Cover 3:4 */}
                  <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg border border-border-subtle shadow-xs">
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
                      <Link
                        href={`/story/${story.slug}`}
                        className="line-clamp-1 font-display text-sm font-semibold text-ink-primary hover:text-accent-gold sm:text-base"
                      >
                        {story.title}
                      </Link>
                      <p className="text-xs text-ink-secondary">
                        {story.authorPenName || story.authorName}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                        <span>
                          Chương {currentChapter} / {story.totalChapters || 1}
                        </span>
                        <span className="font-semibold text-accent-gold">
                          {percent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
                        <div
                          className="h-full rounded-full bg-accent-gold transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button: 44px min target */}
                  <Link
                    href={continueUrl}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-gold text-bg-base shadow-sm transition-transform active:scale-95"
                    title="Đọc tiếp"
                    aria-label={`Đọc tiếp ${story.title}`}
                  >
                    <Play className="h-4 w-4 fill-bg-base ml-0.5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <LibraryContent />
    </Suspense>
  );
}
