"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReaderSettingsSheet, type ReaderSettings } from "./ReaderSettingsSheet";
import { ChapterListSheet } from "./ChapterListSheet";
import type { StoryItem, ChapterItem } from "@/lib/data-store";

interface ReaderCanvasProps {
  story: StoryItem;
  chapter: ChapterItem;
  allChapters: ChapterItem[];
  prevChapter?: ChapterItem | null;
  nextChapter?: ChapterItem | null;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "dark",
  fontFamily: "sans",
  fontSize: 18,
  lineHeight: 1.85,
  wakeLock: false,
};

export function ReaderCanvas({
  story,
  chapter,
  allChapters,
  prevChapter,
  nextChapter,
}: ReaderCanvasProps) {
  const [showChrome, setShowChrome] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const lastScrollY = useRef(0);

  // Load user settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mocthu_reader_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Default to sans (ui-sans-serif)
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          fontFamily: parsed.fontFamily || "sans",
        });
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleSettingsChange = (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("mocthu_reader_settings", JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  // Scroll tracking & auto-hide HUD chrome
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (currentScrollY / maxScroll) * 100));
      setScrollProgress(progress);

      // Save reading progress to local storage
      const progressData = {
        storySlug: story.slug,
        chapterSlug: chapter.slug,
        chapterNumber: chapter.chapterNumber,
        percent: Math.round(progress),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`mocthu_progress_${story.slug}`, JSON.stringify(progressData));
    }

    // Auto-hide chrome on downward scroll, reveal on upward scroll
    if (currentScrollY > 150) {
      if (currentScrollY > lastScrollY.current + 15) {
        setShowChrome(false);
      } else if (currentScrollY < lastScrollY.current - 15) {
        setShowChrome(true);
      }
    } else {
      setShowChrome(true);
    }

    lastScrollY.current = currentScrollY;
  }, [story.slug, chapter.slug, chapter.chapterNumber]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Single tap on canvas toggles controls
  const handleCanvasTap = (e: React.MouseEvent) => {
    // Avoid toggling if clicking links or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    setShowChrome((prev) => !prev);
  };

  // Split content into clean paragraphs
  const paragraphs = chapter.content
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const themeClasses = {
    dark: "bg-[#14110F] text-[#F2E8DC]",
    sepia: "bg-[#F4ECE1] text-[#2D2319]",
    light: "bg-[#FAF7F2] text-[#1C1714]",
  };

  const themeChromeClasses = {
    dark: "bg-[#14110F]/95 border-[#2C241E] text-[#F2E8DC]",
    sepia: "bg-[#F4ECE1]/95 border-[#DFD8CB] text-[#2D2319]",
    light: "bg-[#FAF7F2]/95 border-[#E2DDD5] text-[#1C1714]",
  };

  return (
    <div
      onClick={handleCanvasTap}
      className={cn(
        "min-h-screen transition-colors duration-200 select-text",
        themeClasses[settings.theme]
      )}
    >
      {/* 2px Baseline Progress Bar Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-[2px] bg-black/10">
        <div
          className="h-full bg-accent-gold transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* TOP HUD BAR */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 flex h-14 w-full items-center justify-between border-b px-4 backdrop-blur-md transition-all duration-300 safe-pt",
          themeChromeClasses[settings.theme],
          showChrome ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <Link
          href={`/story/${story.slug}`}
          className="flex items-center gap-1.5 text-xs font-medium hover:text-accent-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="line-clamp-1 max-w-[140px] sm:max-w-xs">{story.title}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            aria-label="Đánh dấu trang"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isBookmarked ? "text-accent-gold" : "opacity-75 hover:opacity-100"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-accent-gold")} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Cài đặt giao diện"
            className="flex h-9 w-9 items-center justify-center rounded-full opacity-75 hover:opacity-100 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* READING PROSE CANVAS */}
      <main className="mx-auto max-w-prose px-4 pt-20 pb-32 sm:px-6 md:px-8">
        {/* Story Title & Chapter Header */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-accent-gold font-semibold">
            {story.title}
          </p>
          <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight sm:text-3xl">
            {chapter.title}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs opacity-60">
            <span>{chapter.wordCount} chữ</span>
            <span>•</span>
            <span>{story.authorPenName || story.authorName}</span>
          </div>
        </div>

        {/* Prose Paragraphs */}
        <div
          className={cn(
            "space-y-6 transition-all duration-200",
            settings.fontFamily === "reading" ? "font-serif" : "font-sans"
          )}
          style={{
            fontFamily:
              settings.fontFamily === "reading"
                ? "var(--font-reading), Georgia, serif"
                : "ui-sans-serif, var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-justify tracking-normal indent-6 selection:bg-accent-gold/25"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* End of Chapter Navigation Bar */}
        <div className="mt-16 border-t border-current/15 pt-8">
          <p className="text-center text-xs opacity-60">
            Bạn vừa hoàn thành {chapter.title}
          </p>

          <div className="mt-6 flex items-center justify-between gap-4">
            {prevChapter ? (
              <Link
                href={`/story/${story.slug}/chapter/${prevChapter.slug}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-current/20 p-3 text-xs font-semibold transition-all hover:border-accent-gold hover:text-accent-gold active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Chương trước</span>
              </Link>
            ) : (
              <div className="flex-1 opacity-30 cursor-not-allowed text-center text-xs p-3">
                Đang ở chương đầu
              </div>
            )}

            {nextChapter ? (
              <Link
                href={`/story/${story.slug}/chapter/${nextChapter.slug}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-gold p-3 text-xs font-bold text-bg-base shadow-md transition-all hover:bg-accent-gold-hover hover:scale-102 active:scale-95"
              >
                <span>Chương sau</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex-1 opacity-30 cursor-not-allowed text-center text-xs p-3">
                Hết chương mới
              </div>
            )}
          </div>
        </div>
      </main>

      {/* BOTTOM HUD TOOLBAR */}
      <footer
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 flex h-16 w-full items-center justify-around border-t px-3 backdrop-blur-md transition-all duration-300 safe-pb",
          themeChromeClasses[settings.theme],
          showChrome ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        {/* Prev Chapter */}
        {prevChapter ? (
          <Link
            href={`/story/${story.slug}/chapter/${prevChapter.slug}`}
            className="flex flex-col items-center py-1 opacity-80 hover:opacity-100 hover:text-accent-gold"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Trước</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center py-1 opacity-30">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Trước</span>
          </div>
        )}

        {/* Table of Contents */}
        <button
          onClick={() => setIsChapterListOpen(true)}
          className="flex flex-col items-center py-1 opacity-80 hover:opacity-100 hover:text-accent-gold"
        >
          <List className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Mục lục</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center py-1 text-accent-gold"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">Cài đặt</span>
        </button>

        {/* Next Chapter */}
        {nextChapter ? (
          <Link
            href={`/story/${story.slug}/chapter/${nextChapter.slug}`}
            className="flex flex-col items-center py-1 opacity-80 hover:opacity-100 hover:text-accent-gold"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Sau</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center py-1 opacity-30">
            <ChevronRight className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Sau</span>
          </div>
        )}
      </footer>

      {/* Cài đặt Sheet */}
      <ReaderSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChange={handleSettingsChange}
      />

      {/* Mục lục Sheet */}
      <ChapterListSheet
        isOpen={isChapterListOpen}
        onClose={() => setIsChapterListOpen(false)}
        storySlug={story.slug}
        currentChapterNumber={chapter.chapterNumber}
        chapters={allChapters}
      />
    </div>
  );
}
