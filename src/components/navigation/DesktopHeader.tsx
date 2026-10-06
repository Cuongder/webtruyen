"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

interface DesktopHeaderProps {
  user?: SessionUser | null;
}

export function DesktopHeader({ user }: DesktopHeaderProps) {
  const pathname = usePathname();

  // If in chapter reading mode, desktop header collapses to clean minimal mode
  const isReading = pathname.includes("/chapter/");
  if (isReading) {
    return null;
  }

  const links = [
    { title: "Trang chủ", href: "/" },
    { title: "Khám phá", href: "/discover" },
    { title: "Tủ sách", href: "/library" },
    { title: "Sáng tác", href: "/studio" },
  ];

  if (user?.role === "ADMIN") {
    links.push({ title: "Quản trị", href: "/admin" });
  }

  return (
    <header className="sticky top-0 z-30 hidden w-full border-b border-border-subtle bg-bg-base/90 px-4 backdrop-blur-md md:block lg:px-8 xl:px-12">
      <div className="flex min-h-16 w-full flex-wrap items-center gap-x-3 lg:flex-nowrap lg:gap-x-4">
        {/* Brand */}
        <Link href="/" className="group flex h-16 shrink-0 items-center gap-2.5">
          <span className="whitespace-nowrap font-display text-2xl font-bold tracking-tight text-accent-gold transition-colors group-hover:text-accent-cream">
            {siteConfig.name}
          </span>
          <span className="hidden max-w-[310px] truncate rounded-full border border-accent-gold/20 bg-accent-gold/10 px-2 py-0.5 text-xs font-medium text-accent-gold xl:block">
            {siteConfig.tagline}
          </span>
        </Link>

        {/* Tablet navigation gets its own row; desktop stays on one row. */}
        <nav
          aria-label="Thanh điều hướng chính"
          className="order-last flex h-12 w-full items-center justify-center gap-1 border-t border-border-subtle lg:order-none lg:h-16 lg:w-auto lg:shrink-0 lg:justify-start lg:border-0"
        >
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors lg:px-2.5 xl:px-3.5",
                  isActive
                    ? "bg-surface-elevated text-accent-gold"
                    : "text-ink-secondary hover:bg-surface hover:text-ink-primary"
                )}
              >
                {link.title}
              </Link>
            );
          })}
        </nav>
        {/* Search can shrink without wrapping its placeholder. */}
        <div className="min-w-0 flex-1 lg:max-w-md">
          <Link
            href="/search"
            aria-label="Tìm kiếm truyện"
            className="flex h-10 w-full items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 text-sm text-ink-muted transition-colors hover:border-accent-gold/40 hover:text-ink-secondary"
          >
            <Search className="h-4 w-4 shrink-0 text-accent-gold" />
            <span className="min-w-0 truncate">Tìm tác phẩm, tác giả, thể loại...</span>
          </Link>
        </div>

        {/* Right User Actions */}
        <div className="flex shrink-0 items-center gap-2 xl:gap-3">
          <Link
            href="/notifications"
            aria-label="Thông báo"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-elevated hover:text-ink-primary"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-gold" />
          </Link>

          {user ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/profile"
                aria-label={`Tài khoản ${user.penName || user.name}`}
                title={user.penName || user.name}
                className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-border-subtle bg-surface px-2 transition-colors hover:border-accent-gold/50 lg:px-3"
              >
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-surface-elevated text-accent-gold flex items-center justify-center text-xs font-bold">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden max-w-[112px] truncate text-xs font-medium text-ink-primary lg:block">
                  {user.penName || user.name}
                </span>
              </Link>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Đăng xuất"
                  aria-label="Đăng xuất tài khoản"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-elevated hover:text-red-400 active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary lg:px-4"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-accent-gold px-3 py-1.5 text-xs font-semibold text-bg-base transition-colors hover:bg-accent-gold-hover lg:px-4"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
