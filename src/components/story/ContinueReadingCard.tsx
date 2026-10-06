import Link from "next/link";
import { Play } from "lucide-react";
import type { StoryItem } from "@/lib/data-store";

interface ContinueReadingProps {
  story: StoryItem;
  currentChapterNumber: number;
  currentChapterSlug: string;
  progressPercent: number;
}

export function ContinueReadingCard({
  story,
  currentChapterNumber,
  currentChapterSlug,
  progressPercent,
}: ContinueReadingProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent-gold/30 bg-gradient-to-r from-surface to-surface-elevated p-3.5 shadow-sm">
      {/* Background soft glow */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-gold/5 blur-xl pointer-events-none" />

      <div className="flex items-center gap-3.5">
        {/* Cover 3:4 */}
        <div className="relative h-20 aspect-[3/4] shrink-0 overflow-hidden rounded-md border border-border-subtle shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.coverUrl}
            alt={story.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 min-w-0 flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-gold">
              Đang đọc dở
            </span>
            <span className="text-[10px] text-ink-muted">
              {progressPercent}% hoàn thành
            </span>
          </div>

          <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-primary">
            {story.title}
          </h3>

          <p className="text-xs text-ink-secondary">
            Chương {currentChapterNumber} / {story.totalChapters}
          </p>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
            <div
              className="h-full rounded-full bg-accent-gold transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/story/${story.slug}/chapter/${currentChapterSlug}`}
          aria-label={`Đọc tiếp ${story.title} chương ${currentChapterNumber}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gold text-bg-base shadow-md transition-transform duration-200 hover:bg-accent-gold-hover hover:scale-105 active:scale-95"
        >
          <Play className="h-4 w-4 fill-bg-base ml-0.5" />
        </Link>
      </div>
    </div>
  );
}
