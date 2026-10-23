import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { getSession } from "@/lib/auth";
import { userRepository } from "@/lib/repositories";
import { getAuthorStories } from "@/lib/read-model";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import type { BadgeItem, UserItem } from "@/lib/data-store";

export const dynamic = "force-dynamic";

const EMPTY_BADGES: BadgeItem[] = [];

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await userRepository.findUserById(session.id);
  if (!user) redirect("/login");

  const profileUser: UserItem = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.profile?.displayName || user.username,
    role: user.role as UserItem["role"],
    status: user.status as UserItem["status"],
    penName: user.authorProfile?.penName || undefined,
    avatarUrl:
      user.profile?.avatarUrl ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    bio: user.profile?.bio || "",
    createdAt: user.createdAt.toISOString(),
    badges: [],
    readingStats: {
      hoursRead: 0,
      wordsRead: 0,
      chaptersRead: 0,
      streakDays: 0,
      cultivationRank: user.role === "ADMIN" ? "Hóa Thần Thư Thánh" : "Trúc Cơ Tu Sĩ",
    },
  };

  const userStories =
    user.role === "AUTHOR" || user.role === "ADMIN"
      ? await getAuthorStories(user.role === "ADMIN" ? undefined : user.id)
      : [];

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <ProfileDashboard user={profileUser} badges={EMPTY_BADGES} userStories={userStories} />
      </main>
      <BottomNavigation userRole={session.role} />
    </div>
  );
}
