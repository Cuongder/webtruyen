"use client";

import Link from "next/link";
import { BookOpen, CheckCheck, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

function iconFor(type: string) {
  if (type === "NEW_CHAPTER") return BookOpen;
  if (type === "NEW_COMMENT_REPLY") return MessageSquare;
  return Sparkles;
}

export function NotificationList({ initialItems }: { initialItems: NotificationItem[] }) {
  const [items, setItems] = useState(initialItems);
  const unread = items.some((item) => !item.isRead);

  async function markRead(id?: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {}),
    });
    if (!response.ok) return;
    setItems((current) => current.map((item) => (id && item.id !== id ? item : { ...item, isRead: true })));
  }

  return (
    <>
      <button
        type="button"
        disabled={!unread}
        onClick={() => markRead()}
        className="flex items-center gap-1 text-xs text-accent-gold hover:underline disabled:opacity-40"
      >
        <CheckCheck className="h-3.5 w-3.5" />
        <span>Đánh dấu đã đọc</span>
      </button>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center text-sm text-ink-muted">
            Chưa có thông báo.
          </div>
        ) : (
          items.map((item) => {
            const Icon = iconFor(item.type);
            return (
              <Link
                key={item.id}
                href={item.link || "/"}
                onClick={() => !item.isRead && markRead(item.id)}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                  !item.isRead
                    ? "border-accent-gold/40 bg-surface-elevated/70 shadow-xs"
                    : "border-border-subtle bg-surface text-ink-muted"
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  !item.isRead ? "bg-accent-gold/20 text-accent-gold" : "bg-surface text-ink-muted"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xs font-semibold text-ink-primary">{item.title}</h3>
                    <span className="text-[10px] text-ink-muted">{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{item.content}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
