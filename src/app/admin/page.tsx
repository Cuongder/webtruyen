import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { findStories } from "@/lib/repositories/story.repository";
import {
  serializeAdminAuditLog,
  serializeAdminBadge,
  serializeAdminGenre,
  serializeAdminUser,
  serializeStory,
} from "@/lib/admin-read-model";
import { AdminManagementDashboard } from "@/components/admin/AdminManagementDashboard";

export default async function AdminPage() {
  const session = await getSession();

  // Guard: Admin role required
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [{ users, stories, genres, badges, logs }] = await Promise.all([
    (async () => {
      const [users, storyResult, genres, badges, logs] = await Promise.all([
        db.user.findMany({
          include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
          orderBy: { createdAt: "desc" },
        }),
        findStories({}),
        db.genre.findMany({ include: { _count: { select: { stories: true } } }, orderBy: { name: "asc" } }),
        db.badge.findMany({ orderBy: { createdAt: "desc" } }),
        db.adminAuditLog.findMany({
          include: { admin: { select: { username: true, profile: { select: { displayName: true } } } } },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);
      return {
        users: users.map(serializeAdminUser),
        stories: storyResult.stories.map(serializeStory),
        genres: genres.map(serializeAdminGenre),
        badges: badges.map(serializeAdminBadge),
        logs: logs.map(serializeAdminAuditLog),
      };
    })(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
        <AdminManagementDashboard
          initialUsers={users}
          initialStories={stories}
          initialGenres={genres}
          initialBadges={badges}
          initialLogs={logs}
          currentAdminName={session.name || "Admin"}
        />
      </main>

      <BottomNavigation userRole={session.role} />
    </div>
  );
}
