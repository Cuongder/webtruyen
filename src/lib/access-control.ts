import type { Role, StoryStatus, Visibility, ChapterStatus, UserStatus } from "@prisma/client";
import type { SessionUser } from "./auth";

// ponytail: Role-based logic with hardcoded roles; upgrade to Casbin/Permify if fine-grained dynamic permissions are needed.

export function isUserActive(status?: UserStatus | string | null): boolean {
  return status === "ACTIVE" || !status;
}

export function canCreateStory(session: SessionUser | null): boolean {
  if (!session || !isUserActive((session as { status?: string }).status)) return false;
  return session.role === "AUTHOR" || session.role === "ADMIN";
}

export function canManageStory(
  story: { authorId: string },
  session: SessionUser | null
): boolean {
  if (!session || !isUserActive((session as { status?: string }).status)) return false;
  if (session.role === "ADMIN") return true;
  return session.role === "AUTHOR" && session.id === story.authorId;
}

export function canReadStory(
  story: { visibility: Visibility | string; status: StoryStatus | string; authorId: string },
  session: SessionUser | null
): boolean {
  if (session && (session.role === "ADMIN" || session.id === story.authorId)) {
    return true;
  }
  if (story.status === "DRAFT" || story.visibility === "PRIVATE") {
    return false;
  }
  return true;
}

export function canManageChapter(
  story: { authorId: string },
  session: SessionUser | null
): boolean {
  return canManageStory(story, session);
}

export function canReadChapter(
  chapter: { status: ChapterStatus | string; publishedAt?: Date | string | null },
  story: { authorId: string; visibility: Visibility | string; status: StoryStatus | string },
  session: SessionUser | null
): boolean {
  if (!canReadStory(story, session)) return false;

  if (session && (session.role === "ADMIN" || session.id === story.authorId)) {
    return true;
  }

  if (chapter.status === "TRASH" || chapter.status === "DRAFT") {
    return false;
  }

  if (chapter.status === "SCHEDULED") {
    if (!chapter.publishedAt) return false;
    const pubDate = new Date(chapter.publishedAt);
    return !Number.isNaN(pubDate.getTime()) && pubDate.getTime() <= Date.now();
  }

  return chapter.status === "PUBLISHED";
}

export function validateStoryPublication(data: {
  title?: string;
  shortDescription?: string;
  coverUrl?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || !data.title.trim()) errors.push("Tiêu đề tác phẩm không được để trống!");
  if (!data.shortDescription || !data.shortDescription.trim()) errors.push("Mô tả ngắn tác phẩm không được để trống!");
  if (!data.coverUrl || !data.coverUrl.trim()) errors.push("Ảnh bìa tác phẩm không được để trống!");
  return { valid: errors.length === 0, errors };
}

export function validateChapterPublication(data: {
  title?: string;
  content?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || !data.title.trim()) errors.push("Tiêu đề chương không được để trống!");
  if (!data.content || !data.content.trim()) errors.push("Nội dung chương không được để trống!");
  return { valid: errors.length === 0, errors };
}
