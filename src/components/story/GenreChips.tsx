import Link from "next/link";
import { GENRES_DATA } from "@/lib/data-store";
import { cn } from "@/lib/utils";

interface GenreChipsProps {
  activeSlug?: string;
}

export function GenreChips({ activeSlug }: GenreChipsProps) {
  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto py-1 no-scrollbar">
      <Link
        href="/discover"
        className={cn(
          "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95",
          !activeSlug
            ? "bg-accent-gold text-bg-base font-semibold shadow-xs"
            : "border border-border-subtle bg-surface text-ink-secondary hover:border-accent-gold/40 hover:text-ink-primary"
        )}
      >
        Tất cả
      </Link>

      {GENRES_DATA.map((genre) => {
        const isActive = activeSlug === genre.slug;
        return (
          <Link
            key={genre.id}
            href={`/genre/${genre.slug}`}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95",
              isActive
                ? "bg-accent-gold text-bg-base font-semibold shadow-xs"
                : "border border-border-subtle bg-surface text-ink-secondary hover:border-accent-gold/40 hover:text-ink-primary"
            )}
          >
            {genre.name}
          </Link>
        );
      })}
    </div>
  );
}
