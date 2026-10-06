export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
    discord: string;
  };
  navigation: {
    main: Array<{ title: string; href: string; icon: string; requiresAuth?: boolean }>;
    bottom: Array<{ title: string; href: string; icon: string; id: string }>;
    studio: Array<{ title: string; href: string; icon: string }>;
    admin: Array<{ title: string; href: string; icon: string }>;
  };
}

export const siteConfig: SiteConfig = {
  name: "Mộc Thư",
  shortName: "Mộc Thư",
  tagline: "Không gian đọc và sáng tác truyện chữ lắng đọng",
  description: "Nền tảng đọc và sáng tác truyện chữ trực tuyến tiếng Việt chuẩn mực, tối ưu trải nghiệm đọc trên thiết bị di động, không lóa mắt, không giật lag.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    github: "https://github.com/mocthu/platform",
    discord: "https://discord.gg/mocthu",
  },
  navigation: {
    main: [
      { title: "Trang chủ", href: "/", icon: "Home" },
      { title: "Khám phá", href: "/discover", icon: "Compass" },
      { title: "Tủ sách", href: "/library", icon: "BookMarked", requiresAuth: true },
      { title: "Sáng tác", href: "/studio", icon: "Feather" },
    ],
    bottom: [
      { id: "home", title: "Trang chủ", href: "/", icon: "Home" },
      { id: "discover", title: "Khám phá", href: "/discover", icon: "Compass" },
      { id: "library", title: "Tủ sách", href: "/library", icon: "BookMarked" },
      { id: "notifications", title: "Thông báo", href: "/notifications", icon: "Bell" },
      { id: "profile", title: "Cá nhân", href: "/profile", icon: "User" },
    ],
    studio: [
      { title: "Tổng quan", href: "/studio", icon: "LayoutDashboard" },
      { title: "Tác phẩm", href: "/studio/stories", icon: "BookOpen" },
      { title: "Viết chương", href: "/studio/stories/new", icon: "PenTool" },
      { title: "Lịch xuất bản", href: "/studio/schedule", icon: "Calendar" },
      { title: "Bình luận", href: "/studio/comments", icon: "MessageSquare" },
    ],
    admin: [
      { title: "Bảng điều khiển", href: "/admin", icon: "Shield" },
      { title: "Duyệt tác phẩm", href: "/admin/stories", icon: "BookCheck" },
      { title: "Báo cáo vi phạm", href: "/admin/reports", icon: "AlertTriangle" },
      { title: "Người dùng", href: "/admin/users", icon: "Users" },
      { title: "Thể loại & Thẻ", href: "/admin/genres", icon: "Tags" },
    ],
  },
};
