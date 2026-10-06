import Link from "next/link";
import { Star, BookOpen, Clock } from "lucide-react";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import type { StoryItem } from "@/lib/data-store";

interface StoryCardMobileProps {
  story: StoryItem;
  rank?: number;
}

export function StoryCardMobile({ story, rank }: StoryCardMobileProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-border-subtle bg-surface p-3 transition-all duration-200 hover:border-accent-gold/40 hover:bg-surface-elevated active:scale-[0.99]"
    >
      {/* Optional Rank Badge */}
      {rank && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center font-display text-base font-bold text-accent-gold">
          {rank < 10 ? `0${rank}` : rank}
        </div>
      )}

      {/* Book Cover 3:4 */}
      <div className="relative h-24 aspect-[3/4] shrink-0 overflow-hidden rounded-md border border-border-subtle bg-surface-elevated shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.coverUrl}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 min-w-0 flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-accent-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-gold">
              {story.genres[0]}
            </span>
            <span className="text-[10px] text-ink-muted flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(story.updatedAt)}
            </span>
          </div>

          <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold text-ink-primary transition-colors group-hover:text-accent-gold">
            {story.title}
          </h3>

          <p className="mt-0.5 line-clamp-1 text-xs text-ink-secondary">
            {story.authorPenName || story.authorName}
          </p>
        </div>

        {/* Metadata */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
            <span className="font-medium text-ink-primary">{story.ratingScore}</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{story.totalChapters} ch.</span>
          </span>
          <span>{formatNumber(story.viewsCount)} đọc</span>
        </div>
      </div>
    </Link>
  );
}
