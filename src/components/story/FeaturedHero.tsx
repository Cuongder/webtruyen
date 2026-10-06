import Link from "next/link";
import { BookOpen, Bookmark, Star } from "lucide-react";
import type { StoryItem } from "@/lib/data-store";

interface FeaturedHeroProps {
  story: StoryItem;
}

export function FeaturedHero({ story }: FeaturedHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface p-4 shadow-lg sm:p-6">
      {/* Decorative Warm Background Glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent-gold/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Book Cover */}
        <div className="mx-auto w-32 shrink-0 sm:mx-0 sm:w-36 md:w-44">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border-accent bg-surface-elevated shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.coverUrl}
              alt={story.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-bg-base/80 px-2 py-0.5 text-xs font-semibold text-accent-gold backdrop-blur-xs">
              <Star className="h-3 w-3 fill-accent-gold" />
              <span>{story.ratingScore}</span>
            </div>
          </div>
        </div>

        {/* Story Details */}
        <div className="flex flex-1 flex-col justify-between text-center sm:text-left">
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-accent-gold/15 px-2.5 py-0.5 text-xs font-semibold text-accent-gold border border-accent-gold/30">
                Tâm điểm tháng
              </span>
              <span className="text-xs text-ink-muted">
                {story.genres.join(" • ")}
              </span>
            </div>

            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink-primary sm:text-2xl lg:text-3xl">
              {story.title}
            </h2>

            <p className="mt-1 text-xs font-medium text-accent-cream sm:text-sm">
              Tác giả: {story.authorPenName || story.authorName}
            </p>

            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-ink-secondary sm:text-sm">
              {story.shortDescription}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
            <Link
              href={`/story/${story.slug}/chapter/chuong-1-kiem-gi-duoi-tang-tung`}
              className="flex items-center gap-2 rounded-xl bg-accent-gold px-5 py-2.5 text-xs font-bold text-bg-base shadow-md transition-all duration-200 hover:bg-accent-gold-hover hover:scale-102 active:scale-95 sm:text-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>Đọc ngay</span>
            </Link>

            <Link
              href={`/story/${story.slug}`}
              className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-2.5 text-xs font-medium text-ink-primary transition-all duration-200 hover:border-accent-gold/40 hover:bg-surface active:scale-95 sm:text-sm"
            >
              <Bookmark className="h-4 w-4 text-accent-gold" />
              <span>Chi tiết</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
