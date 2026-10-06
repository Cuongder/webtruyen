"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Search, ArrowUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChapterItem } from "@/lib/data-store";

interface ChapterListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  storySlug: string;
  currentChapterNumber: number;
  chapters: ChapterItem[];
}

export function ChapterListSheet({
  isOpen,
  onClose,
  storySlug,
  currentChapterNumber,
  chapters,
}: ChapterListSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  if (!isOpen) return null;

  const filteredChapters = chapters
    .filter((ch) =>
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.chapterNumber.toString().includes(searchQuery)
    )
    .sort((a, b) =>
      isAscending
        ? a.chapterNumber - b.chapterNumber
        : b.chapterNumber - a.chapterNumber
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-2xl border-t border-border-accent bg-surface shadow-2xl safe-pb animate-in slide-in-from-bottom duration-200">
        {/* Handle */}
        <div className="mx-auto my-3 h-1 w-10 rounded-full bg-border-subtle" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border-subtle">
          <div>
            <h3 className="font-sans text-base font-semibold text-ink-primary">
              Mục lục chương
            </h3>
            <p className="text-xs text-ink-muted">{chapters.length} chương đã phát hành</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAscending(!isAscending)}
              className="flex items-center gap-1 rounded-lg border border-border-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary active:scale-95"
            >
              <ArrowUpDown className="h-3 w-3" />
              <span>{isAscending ? "Cũ nhất" : "Mới nhất"}</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs">
            <Search className="h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Tìm theo số chương hoặc tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-ink-primary placeholder:text-ink-muted focus:outline-hidden"
            />
          </div>
        </div>

        {/* Chapter List Scroll Area */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-border-subtle/50">
          {filteredChapters.map((chapter) => {
            const isCurrent = chapter.chapterNumber === currentChapterNumber;
            return (
              <Link
                key={chapter.id}
                href={`/story/${storySlug}/chapter/${chapter.slug}`}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between py-3 transition-colors active:scale-[0.99]",
                  isCurrent ? "text-accent-gold font-semibold" : "text-ink-primary hover:text-accent-gold"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs",
                      isCurrent
                        ? "bg-accent-gold text-bg-base font-bold"
                        : "bg-surface-elevated text-ink-muted font-medium"
                    )}
                  >
                    {chapter.chapterNumber}
                  </span>
                  <span className="line-clamp-1 text-xs sm:text-sm">
                    {chapter.title}
                  </span>
                </div>
                {isCurrent && <Check className="h-4 w-4 text-accent-gold shrink-0" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
