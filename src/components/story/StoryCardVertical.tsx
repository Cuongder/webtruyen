import Link from "next/link";
import { Star } from "lucide-react";
import type { StoryItem } from "@/lib/data-store";

interface StoryCardVerticalProps {
  story: StoryItem;
  rankBadge?: number;
}

export function StoryCardVertical({ story, rankBadge }: StoryCardVerticalProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className="group flex w-32 shrink-0 flex-col sm:w-36 md:w-44 transition-all duration-200 active:scale-[0.98]"
    >
      {/* Book Cover 3:4 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-elevated shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.coverUrl}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Decorative spine gradient */}
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Optional Rank Badge */}
        {rankBadge && (
          <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-bg-base/90 font-display text-xs font-bold text-accent-gold shadow-sm ring-1 ring-accent-gold/30">
            {rankBadge}
          </div>
        )}

        {/* Rating overlay badge */}
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded bg-bg-base/80 px-1.5 py-0.5 text-[10px] font-medium text-ink-primary backdrop-blur-xs">
          <Star className="h-2.5 w-2.5 fill-accent-gold text-accent-gold" />
          <span>{story.ratingScore}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 flex flex-col">
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink-primary transition-colors group-hover:text-accent-gold">
          {story.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-ink-secondary">
          {story.authorPenName || story.authorName}
        </p>
        <span className="mt-0.5 text-[11px] text-ink-muted">
          {story.totalChapters} chương
        </span>
      </div>
    </Link>
  );
}
