"use client";

import { useState } from "react";
import { Bookmark, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToLibraryButtonProps {
  storyTitle?: string;
  className?: string;
  variant?: "icon" | "full";
}

export function AddToLibraryButton({
  storyTitle = "truyện",
  className,
  variant = "icon",
}: AddToLibraryButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    setAdded((prev) => !prev);
    if (!added) {
      alert(`Đã thêm "${storyTitle}" vào Tủ sách cá nhân!`);
    } else {
      alert(`Đã gỡ "${storyTitle}" khỏi Tủ sách cá nhân.`);
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-3 text-sm font-medium text-ink-primary hover:border-accent-gold/40 hover:bg-surface transition-colors active:scale-95",
          added && "border-accent-gold text-accent-gold",
          className
        )}
      >
        {added ? (
          <>
            <Check className="h-4 w-4 text-accent-gold" />
            <span>Đã thêm</span>
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4 text-accent-gold" />
            <span>+ Tủ sách</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Thêm vào Tủ sách"
      className={cn(
        "flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-elevated text-accent-gold active:scale-95 transition-colors",
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
  );
}

export function FollowAuthorButton({
  authorName,
  className,
}: {
  authorName: string;
  className?: string;
}) {
  const [following, setFollowing] = useState(false);

  const handleClick = () => {
    setFollowing((prev) => !prev);
    if (!following) {
      alert(`Đã theo dõi tác giả ${authorName}! Bạn sẽ nhận thông báo khi có chương mới.`);
    } else {
      alert(`Đã hủy theo dõi tác giả ${authorName}.`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition-all active:scale-95",
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
  );
}
