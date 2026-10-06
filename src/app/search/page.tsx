"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search as SearchIcon, ArrowLeft, X, BookOpen, Clock, Tag } from "lucide-react";
import { StoryCardMobile } from "@/components/story/StoryCardMobile";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { STORIES_DATA } from "@/lib/data-store";

const POPULAR_KEYWORDS = [
  "Trường Khách Sơn Hà",
  "Tiên hiệp",
  "Trọng sinh",
  "Kiếm tu",
  "Cố Niệm Vũ",
  "Thiên Đạo",
  "Án mạng",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredStories = query.trim()
    ? STORIES_DATA.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.authorName.toLowerCase().includes(query.toLowerCase()) ||
          s.authorPenName.toLowerCase().includes(query.toLowerCase()) ||
          s.genres.some((g) => g.toLowerCase().includes(query.toLowerCase())) ||
          s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      {/* Search Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-3 border-b border-border-subtle bg-surface/95 px-4 backdrop-blur-md safe-pt">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Large Search Input */}
        <div className="relative flex flex-1 items-center">
          <SearchIcon className="absolute left-3.5 h-4 w-4 text-accent-gold" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => startTransition(() => setQuery(e.target.value))}
            placeholder="Tìm theo tên truyện, tác giả, thể loại, từ khóa..."
            className="h-10 w-full rounded-full border border-border-subtle bg-surface-elevated pl-10 pr-9 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-border-subtle text-ink-muted hover:text-ink-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-4 space-y-6">
        {/* If query empty: show Trending keywords */}
        {!query.trim() && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Từ khóa tìm kiếm phổ biến
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setQuery(kw)}
                  className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs text-ink-secondary hover:border-accent-gold/40 hover:text-accent-gold active:scale-95 transition-all"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && (
          <div>
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-xs font-semibold text-ink-muted">
                Kết quả tìm kiếm cho: &quot;<span className="text-accent-gold font-bold">{query}</span>&quot;
              </h2>
              <span className="text-xs text-ink-muted">
                {filteredStories.length} kết quả
              </span>
            </div>

            {filteredStories.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {filteredStories.map((story) => (
                  <StoryCardMobile key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border-subtle bg-surface p-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-ink-muted" />
                <p className="mt-3 text-sm font-semibold text-ink-primary">
                  Không tìm thấy truyện nào
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Thử tìm kiếm với từ khóa khác như tên tác giả hoặc thể loại
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
