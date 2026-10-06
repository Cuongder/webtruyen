"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  CloudOff,
  Eye,
  Send,
  Clock,
  Sparkles,
  Undo2,
  Redo2,
  Calendar,
} from "lucide-react";
import { countWords, estimateReadingTime } from "@/lib/utils";

interface ChapterEditorMobileProps {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  initialChapterNumber?: number;
  initialTitle?: string;
  initialContent?: string;
}

export function ChapterEditorMobile({
  storyId,
  storySlug,
  storyTitle,
  initialChapterNumber = 1,
  initialTitle = "",
  initialContent = "",
}: ChapterEditorMobileProps) {
  const [chapterNumber, setChapterNumber] = useState(initialChapterNumber);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "OFFLINE">("SAVED");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const localDraftKey = `mocthu_draft_${storyId}_${chapterNumber}`;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for local recoverable draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localDraftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.content && parsed.content !== initialContent) {
          setHasRecoverableDraft(true);
        }
      }
    } catch {
      // Ignore
    }
  }, [localDraftKey, initialContent]);

  // Virtual keyboard adaptation via window.visualViewport
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    window.visualViewport.addEventListener("resize", handleViewportResize);
    window.visualViewport.addEventListener("scroll", handleViewportResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      window.visualViewport?.removeEventListener("scroll", handleViewportResize);
    };
  }, []);

  // Multi-tier autosave
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus("SAVING");

    // Tier 1: Immediate local storage backup
    try {
      localStorage.setItem(
        localDraftKey,
        JSON.stringify({
          title,
          chapterNumber,
          content: newContent,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Ignore
    }

    // Tier 2: Debounced server save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Simulate server persistence
      setSaveStatus(navigator.onLine ? "SAVED" : "OFFLINE");
      setLastSavedTime(
        new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1500);
  };

  const handleRecoverDraft = () => {
    try {
      const saved = localStorage.getItem(localDraftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || title);
        setContent(parsed.content || content);
        setHasRecoverableDraft(false);
      }
    } catch {
      // Ignore
    }
  };

  // Helper insertions
  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("chapter-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + selected + suffix;

    const updated = content.substring(0, start) + replacement + content.substring(end);
    handleContentChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  const words = countWords(content);
  const readTime = estimateReadingTime(words);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border-subtle bg-surface px-4 safe-pt">
        <div className="flex items-center gap-2">
          <Link
            href={`/studio/stories`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <span className="line-clamp-1 text-xs font-semibold text-ink-primary">
              {storyTitle}
            </span>
            {/* Status indicator */}
            <div className="flex items-center gap-1 text-[10px]">
              {saveStatus === "SAVED" && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>Đã lưu {lastSavedTime ? `(${lastSavedTime})` : ""}</span>
                </span>
              )}
              {saveStatus === "SAVING" && (
                <span className="flex items-center gap-1 text-accent-gold">
                  <Save className="h-3 w-3 animate-spin" />
                  <span>Đang lưu...</span>
                </span>
              )}
              {saveStatus === "OFFLINE" && (
                <span className="flex items-center gap-1 text-amber-400">
                  <CloudOff className="h-3 w-3" />
                  <span>Lưu ngoại tuyến</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Bản nháp đã được lưu an toàn!")}
            className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-ink-primary hover:border-accent-gold/40"
          >
            Lưu nháp
          </button>
          <button
            onClick={() => alert(`Xuất bản thành công: Chương ${chapterNumber}: ${title}!`)}
            className="flex items-center gap-1.5 rounded-lg bg-accent-gold px-3.5 py-1.5 text-xs font-bold text-bg-base hover:bg-accent-gold-hover shadow-xs active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Xuất bản</span>
          </button>
        </div>
      </header>

      {/* Recoverable draft alert */}
      {hasRecoverableDraft && (
        <div className="flex items-center justify-between bg-accent-gold/15 px-4 py-2 border-b border-accent-gold/30 text-xs text-accent-gold">
          <span>Phát hiện bản thảo lưu ngoại tuyến chưa đồng bộ!</span>
          <button
            onClick={handleRecoverDraft}
            className="rounded bg-accent-gold px-2.5 py-1 font-semibold text-bg-base text-[11px]"
          >
            Khôi phục
          </button>
        </div>
      )}

      {/* Chapter Number & Title Inputs */}
      <div className="border-b border-border-subtle bg-surface/50 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
            className="w-20 rounded-lg border border-border-subtle bg-surface-elevated px-2.5 py-2 text-center text-xs font-bold text-accent-gold focus:border-accent-gold focus:outline-hidden"
            placeholder="Số ch."
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 font-display text-sm font-semibold text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
            placeholder="Tiêu đề chương (ví dụ: Kiếm gỉ dưới tàng tùng)..."
          />
        </div>

        {/* Word count & Reading time */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
          <div className="flex items-center gap-3">
            <span>{words.toLocaleString("vi-VN")} từ</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime}
            </span>
          </div>
          <span className="text-[10px] text-accent-cream">Tự động lưu đa tầng</span>
        </div>
      </div>

      {/* Main Text Editor Area */}
      <main className="flex-1 p-4 pb-28">
        <textarea
          id="chapter-editor-textarea"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Bắt đầu viết chương mới tại đây...&#10;&#10;Mộc Thư tự động lưu từng ký tự của bạn vào bộ đệm trình duyệt, đảm bảo an toàn tuyệt đối ngay cả khi mất kết nối mạng."
          className="h-full min-h-[60vh] w-full resize-none bg-transparent font-reading text-base leading-relaxed text-ink-primary placeholder:text-ink-muted/50 focus:outline-hidden"
        />
      </main>

      {/* Docked Author Mobile Toolbar above Virtual Keyboard */}
      <div
        style={{ bottom: `${keyboardOffset}px` }}
        className="fixed left-0 right-0 z-40 flex h-11 items-center justify-between border-t border-border-subtle bg-surface px-3 shadow-lg safe-pb transition-all duration-100"
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => insertTextAtCursor("“", "”")}
            className="flex h-8 px-2.5 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold active:scale-95"
            title="Dấu ngoặc kép đối thoại"
          >
            “ ”
          </button>
          <button
            onClick={() => insertTextAtCursor("…")}
            className="flex h-8 px-2.5 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold active:scale-95"
            title="Dấu ba chấm"
          >
            …
          </button>
          <button
            onClick={() => insertTextAtCursor("— ")}
            className="flex h-8 px-2.5 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold active:scale-95"
            title="Gạch đầu dòng thoại"
          >
            —
          </button>
          <button
            onClick={() => insertTextAtCursor("\n\n    ")}
            className="flex h-8 px-2.5 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-ink-secondary active:scale-95"
            title="Thụt lề đoạn văn"
          >
            Thụt lề
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => alert("Chức năng Lên lịch xuất bản theo giờ định sẵn!")}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-secondary hover:text-accent-gold"
            title="Lên lịch xuất bản"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={() => alert("Xem trước hiển thị chương như độc giả!")}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-secondary hover:text-accent-gold"
            title="Xem trước"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
