"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { SessionUser } from "@/lib/auth";

interface MobileHeaderProps {
  user?: SessionUser | null;
}

export function MobileHeader({ user }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border-subtle bg-bg-base/90 px-4 backdrop-blur-md safe-pt md:hidden">
      {/* Logo */}
      <Link href="/" className="group flex shrink-0 items-center gap-2">
        <span className="whitespace-nowrap font-display text-xl font-bold tracking-tight text-accent-gold transition-colors group-hover:text-accent-cream sm:text-2xl">
          {siteConfig.name}
        </span>
        <span className="hidden whitespace-nowrap rounded-full bg-accent-gold/10 px-2 py-0.5 text-[10px] font-medium text-accent-gold border border-accent-gold/20 xs:inline-flex">
          Chữ Việt
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href="/search"
          aria-label="Tìm kiếm truyện"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-elevated hover:text-ink-primary active:scale-95"
        >
          <Search className="h-5 w-5" />
        </Link>

        <Link
          href="/notifications"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-elevated hover:text-ink-primary active:scale-95"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-gold ring-2 ring-bg-base" />
        </Link>

        {user ? (
          <Link
            href="/profile"
            aria-label="Tài khoản cá nhân"
            className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-accent-gold/40 active:scale-95"
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="bg-surface-elevated text-xs font-semibold text-accent-gold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="ml-1 whitespace-nowrap rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-medium text-accent-gold border border-border-subtle hover:border-accent-gold/40 active:scale-95"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
