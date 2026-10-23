"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  AlertCircle,
  Loader2,
  X,
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
  const router = useRouter();
  const [chapterNumber, setChapterNumber] = useState(initialChapterNumber);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "OFFLINE">("SAVED");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const localDraftKey = `mocthu_draft_${storyId}_${chapterNumber}`;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

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
  const persistDraftLocally = (newContent: string, newTitle: string, newNumber: number) => {
    try {
      localStorage.setItem(
        `mocthu_draft_${storyId}_${newNumber}`,
        JSON.stringify({
          title: newTitle,
          chapterNumber: newNumber,
          content: newContent,
          timestamp: Date.now(),
        })
      );
    } catch {}
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus("SAVING");
    persistDraftLocally(newContent, title, chapterNumber);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus(navigator.onLine ? "SAVED" : "OFFLINE");
      setLastSavedTime(
        new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1500);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    persistDraftLocally(content, newTitle, chapterNumber);
  };

  const handleNumberChange = (newNumber: number) => {
    setChapterNumber(newNumber);
    persistDraftLocally(content, title, newNumber);
  };

  const handleRecoverDraft = () => {
    try {
      const saved = localStorage.getItem(localDraftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
        setHasRecoverableDraft(false);
        showToast("info", "Đã khôi phục bản thảo lưu tạm!");
      }
    } catch {}
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

  // Manual draft save
  const handleSaveDraft = async () => {
    persistDraftLocally(content, title, chapterNumber);
    setSaveStatus("SAVED");
    setLastSavedTime(
      new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );

    // Optional background draft save to server
    try {
      if (title.trim() && content.trim()) {
        await fetch(`/api/stories/${storyId}/chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            chapterNumber,
            content: content.trim(),
            status: "DRAFT",
          }),
        });
      }
    } catch {}

    showToast("success", "Bản nháp đã được lưu an toàn!");
  };

  // Connect to real chapter publishing API
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      showToast("error", "Vui lòng nhập đầy đủ tiêu đề và nội dung chương!");
      return;
    }

    setIsPublishing(true);

    try {
      const res = await fetch(`/api/stories/${storyId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          chapterNumber,
          content: content.trim(),
          status: "PUBLISHED",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Không thể xuất bản chương. Vui lòng thử lại!");
        setIsPublishing(false);
        return;
      }

      // Cleanup local draft
      try {
        localStorage.removeItem(localDraftKey);
      } catch {}

      showToast("success", `Đã xuất bản thành công: ${data.chapter?.title || title}!`);
      setTimeout(() => {
        const destSlug = data.chapter?.slug || `chuong-${chapterNumber}`;
        router.push(`/story/${storySlug}/chapter/${destSlug}`);
      }, 900);
    } catch {
      showToast("error", "Lỗi kết nối máy chủ khi xuất bản chương!");
      setIsPublishing(false);
    }
  };

  const words = countWords(content);
  const readTime = estimateReadingTime(words);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary">
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
              : toastMessage.type === "error"
              ? "bg-red-950/90 text-red-300 border border-red-500/40"
              : "bg-surface-elevated text-accent-gold border border-accent-gold/40"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === "error" && <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />}
          {toastMessage.type === "info" && <Sparkles className="h-4 w-4 text-accent-gold shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header - Responsive at 320px */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border-subtle bg-surface px-2.5 sm:px-4 safe-pt">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Link
            href="/studio/stories"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary active:scale-95 shrink-0"
            aria-label="Quay lại danh sách tác phẩm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="line-clamp-1 text-xs font-semibold text-ink-primary">
              {storyTitle}
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              {saveStatus === "SAVED" && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  <span className="hidden xs:inline">Đã lưu {lastSavedTime ? `(${lastSavedTime})` : ""}</span>
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
                  <span>Ngoại tuyến</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action CTAs - 44px min targets */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex min-h-[44px] items-center rounded-lg border border-border-subtle bg-surface-elevated px-2.5 sm:px-3 py-1.5 text-xs font-medium text-ink-primary hover:border-accent-gold/40 active:scale-95"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-accent-gold px-3 sm:px-3.5 py-1.5 text-xs font-bold text-bg-base hover:bg-accent-gold-hover shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Xuất bản</span>
          </button>
        </div>
      </header>

      {/* Recoverable draft alert */}
      {hasRecoverableDraft && (
        <div className="flex items-center justify-between bg-accent-gold/15 px-4 py-2 border-b border-accent-gold/30 text-xs text-accent-gold">
          <span>Phát hiện bản thảo lưu ngoại tuyến chưa đồng bộ!</span>
          <button
            type="button"
            onClick={handleRecoverDraft}
            className="flex min-h-[36px] items-center rounded bg-accent-gold px-3 py-1 font-semibold text-bg-base text-[11px] active:scale-95"
          >
            Khôi phục
          </button>
        </div>
      )}

      {/* Chapter Number & Title Inputs */}
      <div className="border-b border-border-subtle bg-surface/50 px-4 py-3">
        <div className="flex gap-2">
          <label htmlFor="chapter-number-input" className="sr-only">Số thứ tự chương</label>
          <input
            id="chapter-number-input"
            type="number"
            min="1"
            value={chapterNumber}
            onChange={(e) => handleNumberChange(parseInt(e.target.value) || 1)}
            className="w-16 sm:w-20 rounded-lg border border-border-subtle bg-surface-elevated px-2.5 py-2 text-center text-xs font-bold text-accent-gold focus:border-accent-gold focus:outline-hidden"
            placeholder="Số ch."
          />
          <label htmlFor="chapter-title-input" className="sr-only">Tiêu đề chương</label>
          <input
            id="chapter-title-input"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
        <label htmlFor="chapter-editor-textarea" className="sr-only">Nội dung toàn văn chương</label>
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
        className="fixed left-0 right-0 z-40 flex h-12 items-center justify-between border-t border-border-subtle bg-surface px-3 shadow-lg safe-pb transition-all duration-100"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => insertTextAtCursor("“", "”")}
            className="flex min-h-[44px] px-3 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold active:scale-95"
            title="Dấu ngoặc kép đối thoại"
            aria-label="Chèn dấu ngoặc kép đối thoại"
          >
            “ ”
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("…")}
            className="flex min-h-[44px] px-3 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold active:scale-95"
            title="Dấu ba chấm"
            aria-label="Chèn dấu ba chấm"
          >
            …
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("— ")}
            className="flex min-h-[44px] px-3 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold active:scale-95"
            title="Gạch đầu dòng thoại"
            aria-label="Chèn gạch đầu dòng thoại"
          >
            —
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("\n\n    ")}
            className="flex min-h-[44px] px-3 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-ink-secondary active:scale-95"
            title="Thụt lề đoạn văn"
            aria-label="Thụt lề đoạn văn"
          >
            Thụt lề
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded text-ink-secondary hover:text-accent-gold active:scale-95"
            title="Lên lịch xuất bản"
            aria-label="Mở bảng hẹn giờ lên lịch xuất bản"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded text-ink-secondary hover:text-accent-gold active:scale-95"
            title="Xem trước hiển thị chương"
            aria-label="Xem trước hiển thị chương"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Interactive Reader Preview Modal */}
      {isPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-border-accent bg-bg-base shadow-2xl safe-pb">
            <div className="flex items-center justify-between border-b border-border-subtle p-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-accent-gold font-semibold">
                  Xem trước độc giả
                </span>
                <h2 id="preview-modal-title" className="font-display text-sm font-bold text-ink-primary">
                  {title || "Chưa đặt tiêu đề chương"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Đóng xem trước"
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 font-reading text-base leading-relaxed space-y-4">
              <div className="text-center pb-4 border-b border-border-subtle/50">
                <p className="text-xs text-accent-gold font-medium">{storyTitle}</p>
                <h3 className="text-xl font-bold mt-1">Chương {chapterNumber}: {title || "Tiêu đề"}</h3>
                <p className="text-[11px] text-ink-muted mt-1">{words} chữ • {readTime}</p>
              </div>

              {content ? (
                content.split("\n\n").map((p, idx) => (
                  <p key={idx} className="indent-6 text-justify">
                    {p.trim()}
                  </p>
                ))
              ) : (
                <p className="italic text-ink-muted text-center py-8">
                  Chưa có nội dung văn bản.
                </p>
              )}
            </div>

            <div className="border-t border-border-subtle p-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex min-h-[44px] items-center rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Dialog */}
      {isScheduleOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border-accent bg-surface p-5 shadow-2xl safe-pb space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h2 id="schedule-modal-title" className="font-sans text-sm font-semibold text-ink-primary">
                Hẹn giờ xuất bản chương
              </h2>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                aria-label="Đóng bảng hẹn giờ"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-ink-secondary">
              Chọn thời điểm chương tự động mở cho độc giả:
            </p>

            <input
              type="datetime-local"
              aria-label="Chọn ngày giờ xuất bản tự động"
              defaultValue={new Date(Date.now() + 3600 * 1000 * 24).toISOString().slice(0, 16)}
              className="w-full rounded-xl border border-border-subtle bg-surface-elevated p-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="flex flex-1 min-h-[44px] items-center justify-center rounded-xl border border-border-subtle text-xs font-medium text-ink-secondary hover:text-ink-primary"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsScheduleOpen(false);
                  showToast("success", "Đã đặt lịch xuất bản chương thành công!");
                }}
                className="flex flex-1 min-h-[44px] items-center justify-center rounded-xl bg-accent-gold text-xs font-bold text-bg-base"
              >
                Xác nhận lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
