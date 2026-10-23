import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { NotificationList } from "@/components/notifications/NotificationList";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex min-h-screen flex-col bg-bg-base pb-20 text-ink-primary md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />
      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-lg font-bold sm:text-xl">Thông báo</h1>
        </div>
        <NotificationList initialItems={notifications.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          link: item.link,
          isRead: item.isRead,
          createdAt: item.createdAt.toISOString(),
        }))} />
      </main>
      <BottomNavigation userRole={session.role} />
    </div>
  );
}
