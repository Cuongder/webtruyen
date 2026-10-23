import type { BadgeItem, GenreItem, UserItem, AuditLogItem } from "./data-store";
import { serializeStory } from "./story-mapper";

export function serializeAdminUser(user: any): UserItem {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.profile?.displayName || user.username,
    role: user.role,
    status: user.status,
    penName: user.authorProfile?.penName || undefined,
    avatarUrl: user.profile?.avatarUrl || "",
    bio: user.profile?.bio || undefined,
    createdAt: user.createdAt.toISOString(),
    badges: user.badges?.map((entry: any) => entry.badgeId) || [],
  };
}

export function serializeAdminBadge(badge: any): BadgeItem {
  return {
    id: badge.id,
    name: badge.name,
    code: badge.code,
    description: badge.description,
    icon: badge.icon,
    color: badge.color,
    category: badge.category,
    createdAt: badge.createdAt.toISOString(),
  };
}

export function serializeAdminGenre(genre: any): GenreItem {
  return {
    id: genre.id,
    name: genre.name,
    slug: genre.slug,
    description: genre.description || "",
    count: genre._count?.stories || 0,
  };
}

export function serializeAdminAuditLog(log: any): AuditLogItem {
  const details =
    typeof log.details === "string"
      ? log.details
      : log.details
        ? JSON.stringify(log.details)
        : undefined;

  return {
    id: log.id,
    adminId: log.adminId,
    adminName: log.admin?.profile?.displayName || log.admin?.username || "Admin",
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    details,
    createdAt: log.createdAt.toISOString(),
  };
}

export { serializeStory };
