import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { getSession } from "@/lib/auth";
import {
  getUserByUsernameOrEmail,
  BADGES_DATA,
  STORIES_DATA,
  type UserItem,
} from "@/lib/data-store";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch full user record from data-store or create fallback
  let userRecord = getUserByUsernameOrEmail(session.email);
  if (!userRecord) {
    userRecord = {
      id: session.id,
      email: session.email,
      username: session.username,
      name: session.name,
      role: session.role,
      status: "ACTIVE",
      penName: session.penName,
      avatarUrl: session.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      bio: "Độc giả đam mê văn chương chữ Việt tại Mộc Thư.",
      createdAt: "2026-09-01T00:00:00Z",
      badges: session.role === "ADMIN" ? ["badge-quan-tri", "badge-dai-than"] : ["badge-mot-sach"],
      readingStats: {
        hoursRead: 64,
        wordsRead: 520000,
        chaptersRead: 280,
        streakDays: 16,
        cultivationRank: session.role === "ADMIN" ? "Hóa Thần Thư Thánh" : "Trúc Cơ Tu Sĩ",
      },
    };
  }

  const userStories = STORIES_DATA.filter((s) => s.authorId === userRecord.id);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <ProfileDashboard
          user={userRecord}
          badges={BADGES_DATA}
          userStories={userStories}
        />
      </main>

      <BottomNavigation userRole={session.role} />
    </div>
  );
}
