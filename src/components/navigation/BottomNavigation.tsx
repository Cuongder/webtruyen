"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookMarked, Bell, User, Feather } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userRole?: string;
}

export function BottomNavigation({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  // If in chapter reading mode or editor, bottom navigation is hidden to maximize reading canvas
  if (pathname.includes("/chapter/") || pathname.includes("/edit")) {
    return null;
  }

  const navItems = [
    { id: "home", label: "Trang chủ", href: "/", icon: Home },
    { id: "discover", label: "Khám phá", href: "/discover", icon: Compass },
    { id: "library", label: "Tủ sách", href: "/library", icon: BookMarked },
    { id: "notifications", label: "Thông báo", href: "/notifications", icon: Bell },
    {
      id: "profile",
      label: "Cá nhân",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Thanh điều hướng chính di động"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border-subtle bg-bg-base/95 px-2 backdrop-blur-lg safe-pb md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95",
              isActive ? "text-accent-gold" : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            <div className="relative flex h-7 w-7 items-center justify-center">
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110 stroke-[2.25px]"
                )}
              />
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent-gold" />
              )}
            </div>
            <span
              className={cn(
                "mt-0.5 text-[10px] tracking-tight transition-colors",
                isActive ? "font-semibold text-accent-gold" : "font-normal text-ink-muted"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
