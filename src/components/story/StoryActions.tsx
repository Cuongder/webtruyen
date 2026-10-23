"use client";

import { useState, useEffect } from "react";
import { Bookmark, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToLibraryButtonProps {
  storyId?: string;
  storySlug?: string;
  storyTitle?: string;
  className?: string;
  variant?: "icon" | "full";
}

export function AddToLibraryButton({
  storyId,
  storySlug,
  storyTitle = "truyện",
  className,
  variant = "icon",
}: AddToLibraryButtonProps) {
  const [added, setAdded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;
    fetch("/api/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAdded(Boolean(data?.entries?.some(
        (entry: { story?: { id?: string }; shelfType?: string }) =>
          entry.story?.id === storyId && entry.shelfType === "FOLLOWING"
      ))))
      .catch(() => {});
  }, [storyId]);

  const handleClick = async () => {
    const next = !added;
    setAdded(next);
    if (!storyId) {
      setAdded(false);
      setFeedback("Không xác định được tác phẩm");
      return;
    }

    const response = next
      ? await fetch("/api/library", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ storyId, shelfType: "FOLLOWING" }),
        })
      : await fetch(`/api/library?storyId=${encodeURIComponent(storyId)}&shelfType=FOLLOWING`, {
          method: "DELETE",
        });

    if (!response.ok) {
      setAdded(!next);
      setFeedback(response.status === 401 ? "Vui lòng đăng nhập" : "Không thể cập nhật tủ sách");
      return;
    }

    setFeedback(next ? "Đã lưu vào Tủ sách" : "Đã gỡ khỏi Tủ sách");
    setTimeout(() => setFeedback(null), 2500);
  };

  if (variant === "full") {
    return (
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={handleClick}
          aria-label={added ? `Gỡ "${storyTitle}" khỏi Tủ sách` : `Thêm "${storyTitle}" vào Tủ sách`}
          className={cn(
            "flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-2.5 text-sm font-medium text-ink-primary hover:border-accent-gold/40 hover:bg-surface transition-colors active:scale-95",
            added && "border-accent-gold text-accent-gold bg-accent-gold/10",
            className
          )}
        >
          {added ? (
            <>
              <Check className="h-4 w-4 text-accent-gold" />
              <span>Đã trong Tủ sách</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 text-accent-gold" />
              <span>+ Tủ sách</span>
            </>
          )}
        </button>
        {feedback && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-elevated border border-accent-gold/40 px-2 py-0.5 text-[11px] font-semibold text-accent-gold shadow-md animate-in fade-in">
            {feedback}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        aria-label={added ? `Gỡ "${storyTitle}" khỏi Tủ sách` : `Thêm "${storyTitle}" vào Tủ sách`}
        className={cn(
          "flex h-11 min-h-[44px] w-12 min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-elevated text-accent-gold active:scale-95 transition-colors",
          added && "border-accent-gold bg-accent-gold/15",
          className
        )}
      >
        {added ? (
          <Check className="h-5 w-5 text-accent-gold" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </button>
      {feedback && (
        <span className="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-surface-elevated border border-accent-gold/40 px-2 py-0.5 text-[11px] font-semibold text-accent-gold shadow-md animate-in fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}

export function FollowAuthorButton({
  authorName,
  authorId,
  className,
}: {
  authorName: string;
  authorId?: string;
  className?: string;
}) {
  const [following, setFollowing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const storageKey = `mocthu_author_${authorId || authorName}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) setFollowing(true);
    } catch {}
  }, [storageKey]);

  const handleClick = () => {
    const next = !following;
    setFollowing(next);
    try {
      if (next) {
        localStorage.setItem(storageKey, "1");
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {}
    setFeedback(next ? "Đang theo dõi" : "Đã hủy theo dõi");
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        aria-label={following ? `Hủy theo dõi tác giả ${authorName}` : `Theo dõi tác giả ${authorName}`}
        className={cn(
          "flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold transition-all active:scale-95",
          following
            ? "bg-surface-elevated border border-accent-gold text-accent-gold"
            : "bg-accent-gold text-bg-base hover:bg-accent-gold-hover shadow-sm",
          className
        )}
      >
        {following ? (
          <>
            <Check className="h-4 w-4" />
            <span>Đang theo dõi</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Theo dõi</span>
          </>
        )}
      </button>
      {feedback && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-elevated border border-accent-gold/40 px-2 py-0.5 text-[10px] font-semibold text-accent-gold shadow-sm animate-in fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
