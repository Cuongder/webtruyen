import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { getSession } from "@/lib/auth";
import {
  getUsersList,
  STORIES_DATA,
  GENRES_DATA,
  BADGES_DATA,
  AUDIT_LOGS_DATA,
} from "@/lib/data-store";
import { AdminManagementDashboard } from "@/components/admin/AdminManagementDashboard";

export default async function AdminPage() {
  const session = await getSession();

  // Guard: Admin role required
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const users = getUsersList();
  const stories = STORIES_DATA;
  const genres = GENRES_DATA;
  const badges = BADGES_DATA;
  const logs = AUDIT_LOGS_DATA;

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
