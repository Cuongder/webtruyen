import Link from "next/link";
import { ArrowLeft, Bell, BookOpen, MessageSquare, Sparkles, CheckCheck } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { getSession } from "@/lib/auth";

export default async function NotificationsPage() {
  const session = await getSession();

  const notifications = [
    {
      id: "notif-1",
      type: "NEW_CHAPTER",
      title: "Chương mới ra lò!",
      content: "Truyện 'Trường Khách Sơn Hà' vừa ra mắt Chương 3: Kiếm ý sơ hiển, chấn nhiếp quần hùng.",
      time: "15 phút trước",
      link: "/story/truong-khach-son-ha/chapter/chuong-3-kiem-y-so-hien-chan-nhiep-quan-hung",
      isUnread: true,
      icon: BookOpen,
    },
    {
      id: "notif-2",
      type: "REPLY",
      title: "Tác giả đã trả lời bình luận của bạn",
      content: "Cố Niệm Vũ: 'Cảm ơn đạo hữu đã kiên nhẫn đồng hành cùng câu chữ...'",
      time: "2 giờ trước",
      link: "/story/truong-khach-son-ha",
      isUnread: true,
      icon: MessageSquare,
    },
    {
      id: "notif-3",
      type: "SYSTEM",
      title: "Chào mừng đến với Mộc Thư!",
      content: "Chúc bạn có những giây phút lắng đọng và thư giãn cùng hàng ngàn tác phẩm chữ Việt.",
      time: "1 ngày trước",
      link: "/discover",
      isUnread: false,
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-lg font-bold text-ink-primary sm:text-xl">
              Thông báo
            </h1>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs text-accent-gold hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Đánh dấu đã đọc</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                  item.isUnread
                    ? "border-accent-gold/40 bg-surface-elevated/70 shadow-xs"
                    : "border-border-subtle bg-surface text-ink-muted"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.isUnread
                      ? "bg-accent-gold/20 text-accent-gold"
                      : "bg-surface text-ink-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xs font-semibold text-ink-primary">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-ink-muted">{item.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
