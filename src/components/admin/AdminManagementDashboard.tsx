"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  BookOpen,
  FolderTree,
  Award,
  History,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Star,
  Check,
  X,
  UserCheck,
  Crown,
  Sparkles,
  Flame,
  Trophy,
  ExternalLink,
  PenTool,
  FileText,
  Key,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  Code2,
  CheckCircle2,
  ChevronRight,
  FileJson,
  ArrowRight,
  BookOpenCheck,
} from "lucide-react";
import { cn, slugify, countWords } from "@/lib/utils";
import type {
  UserItem,
  StoryItem,
  GenreItem,
  BadgeItem,
  AuditLogItem,
} from "@/lib/data-store";

interface AdminManagementDashboardProps {
  initialUsers: UserItem[];
  initialStories: StoryItem[];
  initialGenres: GenreItem[];
  initialBadges: BadgeItem[];
  initialLogs: AuditLogItem[];
  currentAdminName: string;
}

export function AdminManagementDashboard({
  initialUsers,
  initialStories,
  initialGenres,
  initialBadges,
  initialLogs,
  currentAdminName,
}: AdminManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "stories" | "genres" | "badges" | "logs" | "api-docs">("overview");

  // State collections
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [genres, setGenres] = useState<GenreItem[]>(initialGenres);
  const [badges, setBadges] = useState<BadgeItem[]>(initialBadges);
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);

  // Search & Filter
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [storySearch, setStorySearch] = useState("");

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUserForBan, setSelectedUserForBan] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState("Vi phạm quy chế cộng đồng Mộc Thư");

  const [isAddGenreModalOpen, setIsAddGenreModalOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreSlug, setNewGenreSlug] = useState("");
  const [newGenreDesc, setNewGenreDesc] = useState("");

  const [isAddBadgeModalOpen, setIsAddBadgeModalOpen] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeCode, setNewBadgeCode] = useState("");
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#D39A5B");
  const [newBadgeIcon, setNewBadgeIcon] = useState("Crown");

  const [isAssignBadgeModalOpen, setIsAssignBadgeModalOpen] = useState(false);
  const [selectedUserForBadge, setSelectedUserForBadge] = useState<UserItem | null>(null);
  const [badgeToAssign, setBadgeToAssign] = useState<string>("");

  // Form states for new user
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"READER" | "AUTHOR" | "ADMIN">("READER");

  // Form states for Admin Story Creation
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storySlug, setStorySlug] = useState("");
  const [authorMode, setAuthorMode] = useState<"EXISTING_USER" | "CUSTOM">("CUSTOM");
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [customAuthorName, setCustomAuthorName] = useState("");
  const [customAuthorPenName, setCustomAuthorPenName] = useState("");
  const [selectedStoryGenres, setSelectedStoryGenres] = useState<string[]>(["Tiên Hiệp"]);
  const [storyTagsInput, setStoryTagsInput] = useState("");
  const [storyShortDesc, setStoryShortDesc] = useState("");
  const [storyFullDesc, setStoryFullDesc] = useState("");
  const [storyCoverUrl, setStoryCoverUrl] = useState(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
  );
  const [storyStatus, setStoryStatus] = useState<"ONGOING" | "COMPLETED" | "DRAFT">("ONGOING");
  const [storyFeatured, setStoryFeatured] = useState(false);
  const [storySubmitting, setStorySubmitting] = useState(false);

  // Form states for Admin Chapter Creation
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [selectedStoryForChapter, setSelectedStoryForChapter] = useState<StoryItem | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterContent, setChapterContent] = useState("");
  const [chapterStatus, setChapterStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [chapterSubmitting, setChapterSubmitting] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // ================= ADMIN API KEY & DOCS STATE =================
  const [apiKey, setApiKey] = useState<string>("mocthu_live_admin_key_2026_vibecode_998877");
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [activeApiDocTab, setActiveApiDocTab] = useState<"stories" | "chapters" | "manage" | "general">("stories");
  const [activeSnippetTabStory, setActiveSnippetTabStory] = useState<"curl" | "json" | "response">("curl");
  const [activeSnippetTabChapter, setActiveSnippetTabChapter] = useState<"curl" | "json" | "response">("curl");

  useEffect(() => {
    fetch("/api/admin/api-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setIsKeyCopied(true);
    showNotification("Đã sao chép Admin API Key vào khay nhớ tạm!");
    setTimeout(() => setIsKeyCopied(false), 2500);
  };

  const handleCopyCodeSnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    showNotification("Đã sao chép đoạn mã thành công!");
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleRegenerateApiKey = async () => {
    if (
      !confirm(
        "CẢNH BÁO BẢO MẬT:\nĐổi mã Admin API Key sẽ lập tức vô hiệu hóa mã cũ. Tất cả ứng dụng bên ngoài hoặc bot đang dùng khóa cũ sẽ bị từ chối truy cập (403).\n\nBạn có chắc chắn muốn làm mới API Key không?"
      )
    ) {
      return;
    }

    setIsRegeneratingKey(true);
    try {
      const res = await fetch("/api/admin/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate" }),
      });
      const data = await res.json();
      if (res.ok && data.apiKey) {
        setApiKey(data.apiKey);
        showNotification("Đã tạo và kích hoạt mã Admin API Key mới thành công!");
      } else {
        alert(data.error || "Không thể sinh lại API Key!");
      }
    } catch {
      alert("Lỗi kết nối khi sinh lại API Key!");
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  // ================= USERS ACTIONS =================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          username: newUsername,
          name: newName,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers([data.user, ...users]);
        setIsAddUserModalOpen(false);
        setNewEmail("");
        setNewUsername("");
        setNewName("");
        showNotification(`Đã tạo thành công tài khoản "${data.user.name}"!`);
      } else {
        alert(data.error || "Không thể tạo người dùng!");
      }
    } catch {
      alert("Lỗi kết nối khi tạo người dùng!");
    }
  };

  const handleToggleBanUser = async () => {
    if (!selectedUserForBan) return;
    const isBanned = selectedUserForBan.status === "BANNED";
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForBan.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isBanned ? "unban" : "ban",
          reason: banReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.id === selectedUserForBan.id
              ? {
                  ...u,
                  status: isBanned ? "ACTIVE" : "BANNED",
                  banReason: isBanned ? undefined : banReason,
                }
              : u
          )
        );
        setIsBanModalOpen(false);
        setSelectedUserForBan(null);
        showNotification(data.message);
      } else {
        alert(data.error || "Không thể thay đổi trạng thái!");
      }
    } catch {
      alert("Lỗi khi cập nhật trạng thái cấm!");
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const roles: ("READER" | "AUTHOR" | "ADMIN")[] = ["READER", "AUTHOR", "ADMIN"];
    const nextRole = roles[(roles.indexOf(currentRole as any) + 1) % roles.length];
    if (!confirm(`Bạn có muốn đổi quyền của người dùng này sang "${nextRole}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
        showNotification(`Đã đổi quyền thành công sang "${nextRole}"!`);
      }
    } catch {
      alert("Lỗi khi cập nhật quyền!");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`XÁC NHẬN: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${username}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        showNotification(data.message);
      } else {
        alert(data.error || "Không thể xóa người dùng!");
      }
    } catch {
      alert("Lỗi khi xóa người dùng!");
    }
  };

  // ================= STORIES ACTIONS =================
  const handleToggleStoryBan = async (storyId: string, currentStatus: string, title: string) => {
    const action = currentStatus === "DRAFT" ? "unban" : "ban";
    const promptReason =
      action === "ban"
        ? prompt(`Nhập lý do khóa truyện "${title}":`, "Nghi vấn vi phạm bản quyền")
        : "";
    if (action === "ban" && !promptReason) return;

    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: promptReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setStories(
          stories.map((s) =>
            s.id === storyId ? { ...s, status: action === "ban" ? "DRAFT" : "ONGOING" } : s
          )
        );
        showNotification(data.message);
      }
    } catch {
      alert("Lỗi khi cập nhật trạng thái truyện!");
    }
  };

  const handleToggleFeatured = async (storyId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feature", isFeatured: !currentFeatured }),
      });
      const data = await res.json();
      if (res.ok) {
        setStories(
          stories.map((s) => (s.id === storyId ? { ...s, featured: !currentFeatured } : s))
        );
        showNotification(data.message);
      }
    } catch {
      alert("Lỗi khi cập nhật ghim nổi bật!");
    }
  };

  const handleDeleteStory = async (storyId: string, title: string) => {
    if (!confirm(`XÁC NHẬN: Bạn có chắc chắn muốn xóa vĩnh viễn truyện "${title}" cùng toàn bộ chương?`)) return;

    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setStories(stories.filter((s) => s.id !== storyId));
        showNotification(data.message);
      } else {
        alert(data.error || "Không thể xóa truyện!");
      }
    } catch {
      alert("Lỗi khi xóa truyện!");
    }
  };

  const handleOpenAddChapter = (story: StoryItem) => {
    setSelectedStoryForChapter(story);
    const nextChapterNum = story.totalChapters + 1;
    setChapterNumber(nextChapterNum);
    setChapterTitle(`Chương ${nextChapterNum}: `);
    setChapterContent("");
    setChapterStatus("PUBLISHED");
    setIsAddChapterModalOpen(true);
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setStorySubmitting(true);
    try {
      const tagsArray = storyTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const targetAuthor =
        authorMode === "EXISTING_USER"
          ? users.find((u) => u.id === selectedAuthorId)
          : null;

      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyTitle,
          slug: storySlug.trim() || undefined,
          authorMode,
          authorId: authorMode === "EXISTING_USER" ? selectedAuthorId : undefined,
          authorName:
            authorMode === "EXISTING_USER"
              ? targetAuthor?.penName || targetAuthor?.name || "Tác giả"
              : customAuthorName,
          authorPenName:
            authorMode === "EXISTING_USER"
              ? targetAuthor?.penName || targetAuthor?.name
              : customAuthorPenName || customAuthorName,
          genres: selectedStoryGenres,
          tags: tagsArray,
          shortDescription: storyShortDesc,
          fullDescription: storyFullDesc || storyShortDesc,
          coverUrl: storyCoverUrl,
          status: storyStatus,
          featured: storyFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStories([data.story, ...stories]);
        setIsAddStoryModalOpen(false);
        setStoryTitle("");
        setStorySlug("");
        setCustomAuthorName("");
        setCustomAuthorPenName("");
        setStoryShortDesc("");
        setStoryFullDesc("");
        setStoryTagsInput("");
        setStoryFeatured(false);
        showNotification(`Đã tạo thành công tác phẩm "${data.story.title}"!`);
      } else {
        alert(data.error || "Không thể khởi tạo tác phẩm!");
      }
    } catch {
      alert("Lỗi kết nối khi khởi tạo tác phẩm!");
    } finally {
      setStorySubmitting(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryForChapter) return;
    setChapterSubmitting(true);
    try {
      const res = await fetch("/api/admin/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: selectedStoryForChapter.id,
          chapterNumber,
          title: chapterTitle,
          content: chapterContent,
          status: chapterStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStories(
          stories.map((s) =>
            s.id === selectedStoryForChapter.id
              ? {
                  ...s,
                  totalChapters: data.updatedStory.totalChapters,
                  wordCount: data.updatedStory.wordCount,
                  updatedAt: data.updatedStory.updatedAt,
                }
              : s
          )
        );
        setIsAddChapterModalOpen(false);
        setChapterTitle("");
        setChapterContent("");
        showNotification(`Đã xuất bản thành công ${data.chapter.title}!`);
      } else {
        alert(data.error || "Không thể đăng chương truyện!");
      }
    } catch {
      alert("Lỗi kết nối khi đăng chương truyện!");
    } finally {
      setChapterSubmitting(false);
    }
  };

  // ================= GENRES ACTIONS =================
  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGenreName,
          slug: newGenreSlug || undefined,
          description: newGenreDesc,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGenres([...genres, data.genre]);
        setIsAddGenreModalOpen(false);
        setNewGenreName("");
        setNewGenreSlug("");
        setNewGenreDesc("");
        showNotification(`Đã thêm thành công thể loại "${data.genre.name}"!`);
      } else {
        alert(data.error || "Không thể thêm thể loại!");
      }
    } catch {
      alert("Lỗi kết nối khi thêm thể loại!");
    }
  };

  const handleDeleteGenre = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thể loại "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/genres/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setGenres(genres.filter((g) => g.id !== id && g.slug !== id));
        showNotification(data.message);
      } else {
        alert(data.error || "Không thể xóa thể loại!");
      }
    } catch {
      alert("Lỗi kết nối khi xóa thể loại!");
    }
  };

  // ================= BADGES ACTIONS =================
  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBadgeName,
          code: newBadgeCode,
          description: newBadgeDesc,
          color: newBadgeColor,
          icon: newBadgeIcon,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBadges([...badges, data.badge]);
        setIsAddBadgeModalOpen(false);
        setNewBadgeName("");
        setNewBadgeCode("");
        setNewBadgeDesc("");
        showNotification(`Đã tạo thành công danh hiệu "${data.badge.name}"!`);
      } else {
        alert(data.error || "Không thể tạo danh hiệu!");
      }
    } catch {
      alert("Lỗi khi tạo danh hiệu!");
    }
  };

  const handleDeleteBadge = async (badgeId: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh hiệu "${name}" khỏi toàn hệ thống?`)) return;

    try {
      const res = await fetch(`/api/admin/badges/${badgeId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setBadges(badges.filter((b) => b.id !== badgeId));
        // Remove badge from users in local state
        setUsers(
          users.map((u) => ({
            ...u,
            badges: u.badges.filter((b) => b !== badgeId),
          }))
        );
        showNotification(data.message);
      } else {
        alert(data.error || "Không thể xóa danh hiệu!");
      }
    } catch {
      alert("Lỗi khi xóa danh hiệu!");
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedUserForBadge || !badgeToAssign) return;

    try {
      const res = await fetch("/api/admin/badges/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForBadge.id,
          badgeId: badgeToAssign,
          action: "assign",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.id === selectedUserForBadge.id && !u.badges.includes(badgeToAssign)
              ? { ...u, badges: [...u.badges, badgeToAssign] }
              : u
          )
        );
        setIsAssignBadgeModalOpen(false);
        showNotification(data.message);
      } else {
        alert(data.error || "Không thể gán danh hiệu!");
      }
    } catch {
      alert("Lỗi khi gán danh hiệu!");
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole =
      userRoleFilter === "ALL"
        ? true
        : userRoleFilter === "BANNED"
        ? u.status === "BANNED"
        : u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered stories
  const filteredStories = stories.filter((s) =>
    s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
    s.authorName.toLowerCase().includes(storySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-accent-gold px-4 py-3 text-xs font-bold text-bg-base shadow-xl animate-in slide-in-from-top duration-200">
          <Check className="h-4 w-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="rounded-2xl border border-border-subtle bg-gradient-to-r from-surface-elevated via-surface to-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
                🛡️ Ban Điều Hành Tối Cao
              </span>
              <span className="text-xs text-ink-muted">Admin: {currentAdminName}</span>
            </div>
            <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
              Trung Tâm Quản Trị Hệ Thống Mộc Thư
            </h1>
            <p className="text-xs text-ink-secondary">
              Toàn quyền giám sát thành viên, duyệt & khóa truyện, quản lý thể loại và trao tặng danh hiệu.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary"
          >
            <span>Về trang chủ</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 7 Tabs Navigation (Scrollable on mobile) */}
      <div className="flex overflow-x-auto gap-2 border-b border-border-subtle pb-2 no-scrollbar">
        {[
          { key: "overview", label: "Tổng quan", icon: Shield },
          { key: "users", label: `Người dùng (${users.length})`, icon: Users },
          { key: "stories", label: `Truyện (${stories.length})`, icon: BookOpen },
          { key: "genres", label: `Thể loại (${genres.length})`, icon: FolderTree },
          { key: "badges", label: `Danh hiệu (${badges.length})`, icon: Award },
          { key: "logs", label: `Nhật ký (${logs.length})`, icon: History },
          { key: "api-docs", label: "Tài liệu API & Khóa API Key", icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-95",
                isActive
                  ? "bg-accent-gold text-bg-base shadow-sm font-bold"
                  : "bg-surface text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary border border-border-subtle"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border-subtle bg-surface p-4">
              <span className="text-xs text-ink-muted">Tổng thành viên</span>
              <p className="mt-1 font-display text-2xl font-bold text-ink-primary">{users.length}</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface p-4">
              <span className="text-xs text-ink-muted">Tác phẩm xuất bản</span>
              <p className="mt-1 font-display text-2xl font-bold text-accent-gold">{stories.length}</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface p-4">
              <span className="text-xs text-ink-muted">Thể loại truyện</span>
              <p className="mt-1 font-display text-2xl font-bold text-sky-400">{genres.length}</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface p-4">
              <span className="text-xs text-ink-muted">Danh hiệu vinh danh</span>
              <p className="mt-1 font-display text-2xl font-bold text-amber-400">{badges.length}</p>
            </div>
          </div>

          {/* Quick Warning / Reports */}
          <div className="rounded-2xl border border-amber-500/30 bg-surface p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span>Hàng chờ kiểm duyệt nội dung khẩn cấp</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-surface-elevated p-3 border border-border-subtle text-xs">
                <div>
                  <span className="font-semibold text-red-400">[Bình luận vi phạm]</span>
                  <p className="text-ink-secondary mt-0.5">Bình luận dùng từ ngữ đả kích cá nhân tại truyện "Trường Khách Sơn Hà"</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showNotification("Đã ẩn bình luận vi phạm")}
                    className="rounded-lg bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-800/40 hover:bg-red-900/50"
                  >
                    Xóa bình luận
                  </button>
                  <button
                    onClick={() => showNotification("Đã bỏ qua báo cáo")}
                    className="rounded-lg bg-surface px-2.5 py-1 text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                placeholder="Tìm email, username, tên..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface py-2 pl-9 pr-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            {/* Filter and Add Button */}
            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs text-ink-primary focus:border-accent-gold"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="READER">Độc giả</option>
                <option value="AUTHOR">Tác giả</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="BANNED">Đang bị khóa</option>
              </select>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-3.5 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm User</span>
              </button>
            </div>
          </div>

          {/* User List Cards */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-colors",
                  user.status === "BANNED"
                    ? "border-red-900/40 bg-red-950/15"
                    : "border-border-subtle bg-surface hover:border-accent-gold/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-elevated ring-1 ring-border-subtle flex items-center justify-center font-bold text-accent-gold">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink-primary text-sm">{user.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                          user.role === "ADMIN"
                            ? "bg-red-500/15 text-red-400"
                            : user.role === "AUTHOR"
                            ? "bg-accent-gold/15 text-accent-gold"
                            : "bg-surface-elevated text-ink-muted"
                        )}
                      >
                        {user.role}
                      </span>
                      {user.status === "BANNED" && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">
                          BỊ KHÓA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      @{user.username} • {user.email}
                    </p>
                    {user.banReason && (
                      <p className="text-[11px] text-red-400 mt-0.5">Lý do khóa: {user.banReason}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                  {/* Change Role Button */}
                  <button
                    onClick={() => handleChangeRole(user.id, user.role)}
                    title="Chuyển vai trò"
                    className="rounded-lg bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-accent-gold border border-border-subtle hover:border-accent-gold"
                  >
                    Đổi quyền
                  </button>

                  {/* Assign Badge Button */}
                  <button
                    onClick={() => {
                      setSelectedUserForBadge(user);
                      setIsAssignBadgeModalOpen(true);
                    }}
                    title="Gán danh hiệu"
                    className="rounded-lg bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-amber-400 border border-border-subtle hover:border-amber-400"
                  >
                    + Danh hiệu
                  </button>

                  {/* Ban/Unban Button */}
                  <button
                    onClick={() => {
                      setSelectedUserForBan(user);
                      setIsBanModalOpen(true);
                    }}
                    title={user.status === "BANNED" ? "Mở khóa" : "Khóa tài khoản"}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border",
                      user.status === "BANNED"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/50"
                        : "bg-amber-950/30 text-amber-400 border-amber-800/40 hover:bg-amber-900/50"
                    )}
                  >
                    {user.status === "BANNED" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    <span>{user.status === "BANNED" ? "Mở khóa" : "Cấm"}</span>
                  </button>

                  {/* Delete Button */}
                  {user.username !== "hotprince" && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      title="Xóa vĩnh viễn"
                      className="rounded-lg bg-red-950/30 p-1.5 text-red-400 border border-red-800/30 hover:bg-red-950/60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STORIES MANAGEMENT */}
      {activeTab === "stories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                placeholder="Tìm tên truyện, tác giả..."
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface py-2 pl-9 pr-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAddStoryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-3.5 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Đăng Truyện Mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-colors",
                  story.status === "DRAFT"
                    ? "border-red-900/40 bg-red-950/15"
                    : "border-border-subtle bg-surface hover:border-accent-gold/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative aspect-[3/4] h-16 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={story.coverUrl} alt={story.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-ink-primary">{story.title}</h3>
                      {story.featured && (
                        <span className="rounded-full bg-accent-gold/20 px-2 py-0.5 text-[9px] font-bold text-accent-gold border border-accent-gold/30">
                          ★ SPOTLIGHT
                        </span>
                      )}
                      {story.status === "DRAFT" && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">
                          ĐÃ KHÓA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      Tác giả: <span className="text-accent-cream">{story.authorPenName || story.authorName}</span> • {story.totalChapters} chương • {story.viewsCount.toLocaleString()} lượt đọc
                    </p>
                    <p className="text-[11px] text-ink-secondary mt-1 line-clamp-1">{story.shortDescription}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Add Chapter Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddChapter(story)}
                    title="Đăng chương mới cho truyện này"
                    className="flex items-center gap-1 rounded-lg bg-accent-gold/15 px-2.5 py-1 text-xs font-semibold text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/25"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+ Chương</span>
                  </button>

                  {/* Spotlight Feature Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(story.id, !!story.featured)}
                    title="Ghim nổi bật"
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border",
                      story.featured
                        ? "bg-accent-gold text-bg-base border-accent-gold"
                        : "bg-surface-elevated text-ink-muted border-border-subtle hover:text-accent-gold"
                    )}
                  >
                    <Star className="h-3 w-3" />
                    <span>{story.featured ? "Đã Ghim" : "Ghim"}</span>
                  </button>

                  {/* Ban/Unban Story */}
                  <button
                    onClick={() => handleToggleStoryBan(story.id, story.status, story.title)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border",
                      story.status === "DRAFT"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                        : "bg-red-950/30 text-red-400 border-red-800/30"
                    )}
                  >
                    {story.status === "DRAFT" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    <span>{story.status === "DRAFT" ? "Mở khóa" : "Khóa"}</span>
                  </button>

                  {/* Delete Story */}
                  <button
                    onClick={() => handleDeleteStory(story.id, story.title)}
                    className="rounded-lg bg-red-950/30 p-1.5 text-red-400 border border-red-800/30 hover:bg-red-950/60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GENRES MANAGEMENT */}
      {activeTab === "genres" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-muted">Danh mục các thể loại tiểu thuyết hỗ trợ trên sàn.</p>
            <button
              onClick={() => setIsAddGenreModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-3.5 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Thể Loại</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="flex items-start justify-between rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-ink-primary">{genre.name}</span>
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] text-ink-muted border border-border-subtle">
                      /{genre.slug}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary line-clamp-2">{genre.description}</p>
                  <p className="mt-2 text-[10px] text-accent-gold font-semibold">
                    {genre.count || 0} truyện thuộc thể loại
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteGenre(genre.id, genre.name)}
                  title="Xóa thể loại"
                  className="rounded-lg p-1 text-ink-muted hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BADGES & TITLES MANAGEMENT */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-muted">Danh hiệu vinh danh độc giả và tác giả xuất sắc.</p>
            <button
              onClick={() => setIsAddBadgeModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-3.5 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo Danh Hiệu Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border"
                    style={{
                      backgroundColor: `${badge.color}15`,
                      borderColor: `${badge.color}40`,
                      color: badge.color,
                    }}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>{badge.name}</span>
                  </div>

                  {badge.code !== "SUPER_ADMIN" && (
                    <button
                      onClick={() => handleDeleteBadge(badge.id, badge.name)}
                      className="rounded-lg p-1 text-ink-muted hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-ink-secondary">{badge.description}</p>
                <div className="flex items-center justify-between text-[10px] text-ink-muted pt-2 border-t border-border-subtle/50">
                  <span>Mã: {badge.code}</span>
                  <span className="font-semibold text-accent-cream">{badge.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">Nhật ký các thao tác kiểm toán của quản trị viên.</p>
          <div className="rounded-2xl border border-border-subtle bg-surface divide-y divide-border-subtle/60 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent-gold/15 px-2 py-0.5 text-[10px] font-bold text-accent-gold">
                      {log.action}
                    </span>
                    <span className="font-semibold text-ink-primary">{log.adminName}</span>
                    <span className="text-ink-muted">đã tác động tới</span>
                    <span className="font-semibold text-accent-cream">{log.targetName || log.targetId}</span>
                  </div>
                  {log.details && <p className="text-[11px] text-ink-secondary mt-1">{log.details}</p>}
                </div>
                <span className="text-[10px] text-ink-muted shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: API DOCS & ADMIN API KEY */}
      {activeTab === "api-docs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. Master API Key Management Card */}
          <div className="relative overflow-hidden rounded-2xl border border-accent-gold/40 bg-gradient-to-br from-surface-elevated via-surface to-surface p-5 sm:p-6 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-border-subtle pb-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gold/20 text-accent-gold border border-accent-gold/30 shadow-inner">
                  <Key className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-ink-primary">
                      Khóa Bí Mật Quản Trị Viên (Admin API Key)
                    </h2>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Đang Hoạt Động
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary max-w-2xl leading-relaxed">
                    Mã khóa này dùng để xác thực toàn quyền Quản trị viên (Admin Master) khi gọi các API tạo truyện, đăng chương hoặc điều hành hệ thống qua HTTP Client bên ngoài (cURL, Postman, script bot) mà không cần cookie đăng nhập.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleRegenerateApiKey}
                  disabled={isRegeneratingKey}
                  className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-semibold text-ink-secondary hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-50"
                  title="Vô hiệu hóa khóa cũ và tạo mã khóa mới"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isRegeneratingKey && "animate-spin text-accent-gold")} />
                  <span>{isRegeneratingKey ? "Đang tạo mới..." : "Sinh lại khóa mới"}</span>
                </button>
              </div>
            </div>

            {/* API Key Box */}
            <div className="mt-5 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                <span>Mã Khóa API Hiện Hành (Master Secret)</span>
                <span className="text-[11px] font-normal normal-case text-amber-400/90">
                  ⚠️ Quyền hạn tối cao — Tuyệt đối không chia sẻ công khai
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 flex items-center rounded-xl border border-accent-gold/30 bg-bg-base/90 px-3.5 py-2.5 font-mono text-xs sm:text-sm text-accent-gold shadow-inner overflow-x-auto">
                  <Terminal className="h-4 w-4 mr-2 text-ink-muted shrink-0" />
                  <span className="select-all whitespace-nowrap">
                    {isApiKeyVisible ? apiKey : "mocthu_live_••••••••••••••••••••••••••••••••"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface transition-all"
                  >
                    {isApiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{isApiKeyVisible ? "Ẩn khóa" : "Hiện khóa"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyApiKey}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold text-bg-base hover:bg-accent-gold-hover shadow-md transition-all active:scale-95"
                  >
                    {isKeyCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-950" /> : <Copy className="h-4 w-4" />}
                    <span>{isKeyCopied ? "Đã chép!" : "Sao chép khóa"}</span>
                  </button>
                </div>
              </div>

              {/* Header Guidelines Card */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-3 space-y-1">
                  <span className="text-[11px] font-bold text-ink-primary flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-gold" />
                    Cách 1: Sử dụng Header x-api-key (Khuyên dùng)
                  </span>
                  <p className="text-[11px] text-ink-muted">
                    Thêm cặp Header HTTP vào mỗi Request:
                  </p>
                  <code className="block rounded-lg bg-bg-base px-2.5 py-1.5 font-mono text-[11px] text-accent-cream border border-border-subtle select-all">
                    x-api-key: {apiKey}
                  </code>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-3 space-y-1">
                  <span className="text-[11px] font-bold text-ink-primary flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-gold" />
                    Cách 2: Sử dụng Authorization Bearer
                  </span>
                  <p className="text-[11px] text-ink-muted">
                    Hỗ trợ tiêu chuẩn Bearer Token phổ quát:
                  </p>
                  <code className="block rounded-lg bg-bg-base px-2.5 py-1.5 font-mono text-[11px] text-accent-cream border border-border-subtle select-all">
                    Authorization: Bearer {apiKey}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Sub-tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-2">
            {[
              { id: "stories", label: "1. API Tạo Truyện Mới", badge: "POST", methodColor: "bg-emerald-500/20 text-emerald-400" },
              { id: "chapters", label: "2. API Đăng Chương Mới", badge: "POST", methodColor: "bg-emerald-500/20 text-emerald-400" },
              { id: "manage", label: "3. API Quản Lý Truyện & Chương", badge: "GET / PUT / DEL", methodColor: "bg-blue-500/20 text-blue-400" },
              { id: "general", label: "4. Quy Chuẩn & Mã Lỗi HTTP", badge: "INFO", methodColor: "bg-amber-500/20 text-amber-400" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveApiDocTab(st.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                  activeApiDocTab === st.id
                    ? "bg-accent-gold text-bg-base font-bold shadow-sm"
                    : "bg-surface text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary border border-border-subtle"
                )}
              >
                <span>{st.label}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.2 text-[10px] font-bold uppercase",
                    activeApiDocTab === st.id ? "bg-bg-base/20 text-bg-base" : st.methodColor
                  )}
                >
                  {st.badge}
                </span>
              </button>
            ))}
          </div>

          {/* ================= SECTION 1: CREATE STORY API ================= */}
          {activeApiDocTab === "stories" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      POST
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-primary">
                      /api/admin/stories
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Xác thực: Header x-api-key hoặc Bearer</span>
                </div>

                <p className="text-xs text-ink-secondary leading-relaxed">
                  Endpoint tạo một tác phẩm truyện mới hoàn chỉnh trên hệ thống Mộc Thư. Hỗ trợ thiết lập toàn bộ metadata (Tên, tác giả, thể loại, tóm tắt, ảnh bìa, nhãn từ khóa, truyện VIP, giá bán trọn bộ).
                </p>

                {/* Parameter Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Danh Sách Tham Số Request Body (JSON)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border-subtle">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-elevated text-ink-muted">
                        <tr>
                          <th className="px-3.5 py-2.5 font-semibold">Tên trường</th>
                          <th className="px-3.5 py-2.5 font-semibold">Kiểu</th>
                          <th className="px-3.5 py-2.5 font-semibold">Bắt buộc</th>
                          <th className="px-3.5 py-2.5 font-semibold">Mặc định</th>
                          <th className="px-3.5 py-2.5 font-semibold">Mô tả chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-ink-secondary font-sans">
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">title</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-emerald-400 font-bold">Bắt buộc</td>
                          <td className="px-3.5 py-2 text-ink-muted">-</td>
                          <td className="px-3.5 py-2">Tên tác phẩm truyện (Chấp nhận alias: <code>name</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">slug</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tự sinh từ title</td>
                          <td className="px-3.5 py-2">Đường dẫn tĩnh SEO duy nhất (Ví dụ: <code>hon-nguyen-tien-ton</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">authorName</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">"Quản trị viên"</td>
                          <td className="px-3.5 py-2">Tên tác giả hoặc bút danh (Chấp nhận alias: <code>author</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">shortDescription</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">""</td>
                          <td className="px-3.5 py-2">Giới thiệu tóm tắt truyện (Chấp nhận alias: <code>synopsis</code>, <code>description</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">genres</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string[]</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">["Tiên Hiệp"]</td>
                          <td className="px-3.5 py-2">Mảng thể loại (Hoặc truyền chuỗi đơn <code>category</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">coverUrl</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">Ảnh mặc định</td>
                          <td className="px-3.5 py-2">URL ảnh bìa sách (Chấp nhận alias: <code>coverImage</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">tags</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string[]</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">[]</td>
                          <td className="px-3.5 py-2">Mảng nhãn thẻ tìm kiếm (Ví dụ: <code>["Trùng Sinh", "Vô Địch"]</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">status</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">"ONGOING"</td>
                          <td className="px-3.5 py-2">Trạng thái phát hành: <code>ONGOING</code> | <code>COMPLETED</code> | <code>DRAFT</code>.</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">featured</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">boolean</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">false</td>
                          <td className="px-3.5 py-2">Ghim lên bảng nổi bật Spotlight trang chủ.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Snippets Viewer */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {(["curl", "json", "response"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveSnippetTabStory(tab)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                            activeSnippetTabStory === tab
                              ? "bg-surface-elevated text-accent-gold border border-border-subtle"
                              : "text-ink-muted hover:text-ink-primary"
                          )}
                        >
                          {tab === "curl" && "Lệnh cURL (Gắn Key Thật)"}
                          {tab === "json" && "Mẫu Body JSON"}
                          {tab === "response" && "Mẫu Response (201)"}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        let text = "";
                        if (activeSnippetTabStory === "curl") {
                          text = `curl -X POST http://localhost:3000/api/admin/stories \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${apiKey}" \\\n  -d '{\n    "title": "Hỗn Nguyên Tiên Tôn",\n    "slug": "hon-nguyen-tien-ton",\n    "authorName": "Cổ Chân Nhân",\n    "genres": ["Tiên Hiệp", "Huyền Huyễn"],\n    "shortDescription": "Thiếu niên trọng sinh mang theo Cổ Thần Châu, bước lên con đường nghịch thiên đoạt mệnh.",\n    "tags": ["Tu Chân", "Trùng Sinh", "Nghịch Thiên"],\n    "status": "ONGOING"\n  }'`;
                        } else if (activeSnippetTabStory === "json") {
                          text = `{\n  "title": "Hỗn Nguyên Tiên Tôn",\n  "slug": "hon-nguyen-tien-ton",\n  "authorName": "Cổ Chân Nhân",\n  "shortDescription": "Thiếu niên trọng sinh mang theo Cổ Thần Châu, bước lên con đường nghịch thiên đoạt mệnh.",\n  "genres": ["Tiên Hiệp", "Huyền Huyễn"],\n  "tags": ["Tu Chân", "Trùng Sinh", "Nghịch Thiên"],\n  "status": "ONGOING",\n  "featured": true\n}`;
                        } else {
                          text = `{\n  "success": true,\n  "message": "Đã khởi tạo tác phẩm \\"Hỗn Nguyên Tiên Tôn\\" thành công!",\n  "story": {\n    "id": "story-1718000000000",\n    "title": "Hỗn Nguyên Tiên Tôn",\n    "slug": "hon-nguyen-tien-ton",\n    "authorName": "Cổ Chân Nhân",\n    "status": "ONGOING",\n    "totalChapters": 0,\n    "rating": 5.0,\n    "createdAt": "2026-10-06T15:00:00.000Z"\n  }\n}`;
                        }
                        handleCopyCodeSnippet(`story-${activeSnippetTabStory}`, text);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink-secondary hover:text-ink-primary"
                    >
                      {copiedCodeId === `story-${activeSnippetTabStory}` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedCodeId === `story-${activeSnippetTabStory}` ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>

                  <div className="relative rounded-xl border border-border-subtle bg-bg-base p-4 font-mono text-xs overflow-x-auto text-accent-cream leading-relaxed">
                    {activeSnippetTabStory === "curl" && (
                      <pre>
                        {`curl -X POST http://localhost:3000/api/admin/stories \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${apiKey}" \\\n  -d '{\n    "title": "Hỗn Nguyên Tiên Tôn",\n    "slug": "hon-nguyen-tien-ton",\n    "authorName": "Cổ Chân Nhân",\n    "genres": ["Tiên Hiệp", "Huyền Huyễn"],\n    "shortDescription": "Thiếu niên trọng sinh mang theo Cổ Thần Châu, bước lên con đường nghịch thiên đoạt mệnh.",\n    "tags": ["Tu Chân", "Trùng Sinh", "Nghịch Thiên"],\n    "status": "ONGOING"\n  }'`}
                      </pre>
                    )}
                    {activeSnippetTabStory === "json" && (
                      <pre>
                        {`{\n  "title": "Hỗn Nguyên Tiên Tôn",\n  "slug": "hon-nguyen-tien-ton",\n  "authorName": "Cổ Chân Nhân",\n  "shortDescription": "Thiếu niên trọng sinh mang theo Cổ Thần Châu, bước lên con đường nghịch thiên đoạt mệnh.",\n  "genres": ["Tiên Hiệp", "Huyền Huyễn"],\n  "tags": ["Tu Chân", "Trùng Sinh", "Nghịch Thiên"],\n  "status": "ONGOING",\n  "featured": true\n}`}
                      </pre>
                    )}
                    {activeSnippetTabStory === "response" && (
                      <pre>
                        {`{\n  "success": true,\n  "message": "Đã khởi tạo tác phẩm \\"Hỗn Nguyên Tiên Tôn\\" thành công!",\n  "story": {\n    "id": "story-1718000000000",\n    "title": "Hỗn Nguyên Tiên Tôn",\n    "slug": "hon-nguyen-tien-ton",\n    "authorName": "Cổ Chân Nhân",\n    "status": "ONGOING",\n    "totalChapters": 0,\n    "rating": 5.0,\n    "createdAt": "2026-10-06T15:00:00.000Z"\n  }\n}`}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: POST CHAPTER API ================= */}
          {activeApiDocTab === "chapters" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      POST
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-primary">
                      /api/admin/chapters
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Endpoint phụ: <code>/api/admin/stories/[id]/chapters</code></span>
                </div>

                <p className="text-xs text-ink-secondary leading-relaxed">
                  Endpoint đăng một chương truyện mới vào tác phẩm đã có. Hệ thống sẽ tự động tính toán tổng số từ (wordCount), cập nhật số thứ tự chương (totalChapters) và đẩy thời gian <code>updatedAt</code> của tác phẩm lên đầu danh sách vừa cập nhật.
                </p>

                {/* Parameter Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Danh Sách Tham Số Request Body (JSON)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border-subtle">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-elevated text-ink-muted">
                        <tr>
                          <th className="px-3.5 py-2.5 font-semibold">Tên trường</th>
                          <th className="px-3.5 py-2.5 font-semibold">Kiểu</th>
                          <th className="px-3.5 py-2.5 font-semibold">Bắt buộc</th>
                          <th className="px-3.5 py-2.5 font-semibold">Mặc định</th>
                          <th className="px-3.5 py-2.5 font-semibold">Mô tả chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-ink-secondary font-sans">
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">storyId</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-emerald-400 font-bold">Bắt buộc</td>
                          <td className="px-3.5 py-2 text-ink-muted">-</td>
                          <td className="px-3.5 py-2">ID tác phẩm hoặc Slug truyện (Chấp nhận alias: <code>storySlug</code>, <code>storyIdOrSlug</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">title</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-emerald-400 font-bold">Bắt buộc</td>
                          <td className="px-3.5 py-2 text-ink-muted">-</td>
                          <td className="px-3.5 py-2">Tiêu đề chương truyện (Ví dụ: <code>Chương 1: Trọng Sinh Thiếu Niên</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">content</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-emerald-400 font-bold">Bắt buộc</td>
                          <td className="px-3.5 py-2 text-ink-muted">-</td>
                          <td className="px-3.5 py-2">Văn bản nội dung toàn văn của chương truyện (hỗ trợ xuống dòng).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">chapterNumber</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">number</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tự tăng (+1)</td>
                          <td className="px-3.5 py-2">Số thứ tự chương (Ví dụ: <code>1</code>, <code>2</code>, <code>100</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">slug</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">chuong-{`{n}`}</td>
                          <td className="px-3.5 py-2">Đường dẫn tĩnh chương truyện (Ví dụ: <code>chuong-1</code>).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">status</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">string</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">"PUBLISHED"</td>
                          <td className="px-3.5 py-2">Trạng thái phát hành: <code>PUBLISHED</code> (Xuất bản) hoặc <code>DRAFT</code> (Nháp).</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">isLocked</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">boolean</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">false</td>
                          <td className="px-3.5 py-2">Khóa chương VIP yêu cầu mở khóa bằng xu.</td>
                        </tr>
                        <tr className="hover:bg-surface-elevated/30">
                          <td className="px-3.5 py-2 font-mono font-bold text-accent-cream">priceCoins</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-sky-400">number</td>
                          <td className="px-3.5 py-2 text-ink-muted">Tùy chọn</td>
                          <td className="px-3.5 py-2 text-ink-muted">0</td>
                          <td className="px-3.5 py-2">Số lượng xu cần trả để đọc chương này.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Snippets Viewer */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {(["curl", "json", "response"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveSnippetTabChapter(tab)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                            activeSnippetTabChapter === tab
                              ? "bg-surface-elevated text-accent-gold border border-border-subtle"
                              : "text-ink-muted hover:text-ink-primary"
                          )}
                        >
                          {tab === "curl" && "Lệnh cURL (Gắn Key Thật)"}
                          {tab === "json" && "Mẫu Body JSON"}
                          {tab === "response" && "Mẫu Response (201)"}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        let text = "";
                        if (activeSnippetTabChapter === "curl") {
                          text = `curl -X POST http://localhost:3000/api/admin/chapters \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${apiKey}" \\\n  -d '{\n    "storyId": "hon-nguyen-tien-ton",\n    "chapterNumber": 1,\n    "title": "Chương 1: Trọng sinh thiếu niên",\n    "content": "Tiếng sấm rền vang rách toạc màn đêm u tối. Thiếu niên từ từ mở mắt, ánh mắt tràn ngập hàn quang...",\n    "status": "PUBLISHED"\n  }'`;
                        } else if (activeSnippetTabChapter === "json") {
                          text = `{\n  "storyId": "hon-nguyen-tien-ton",\n  "chapterNumber": 1,\n  "title": "Chương 1: Trọng sinh thiếu niên",\n  "content": "Tiếng sấm rền vang rách toạc màn đêm u tối. Thiếu niên từ từ mở mắt, ánh mắt tràn ngập hàn quang...",\n  "status": "PUBLISHED",\n  "isLocked": false,\n  "priceCoins": 0\n}`;
                        } else {
                          text = `{\n  "success": true,\n  "message": "Đã đăng Chương 1: Trọng sinh thiếu niên cho tác phẩm \\"Hỗn Nguyên Tiên Tôn\\" thành công!",\n  "chapter": {\n    "id": "chap-hon-nguyen-tien-ton-1",\n    "storyId": "hon-nguyen-tien-ton",\n    "chapterNumber": 1,\n    "title": "Chương 1: Trọng sinh thiếu niên",\n    "slug": "chuong-1",\n    "wordCount": 1850,\n    "createdAt": "2026-10-06T15:05:00.000Z"\n  },\n  "updatedStory": {\n    "title": "Hỗn Nguyên Tiên Tôn",\n    "totalChapters": 1,\n    "wordCount": 1850\n  }\n}`;
                        }
                        handleCopyCodeSnippet(`chapter-${activeSnippetTabChapter}`, text);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink-secondary hover:text-ink-primary"
                    >
                      {copiedCodeId === `chapter-${activeSnippetTabChapter}` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedCodeId === `chapter-${activeSnippetTabChapter}` ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>

                  <div className="relative rounded-xl border border-border-subtle bg-bg-base p-4 font-mono text-xs overflow-x-auto text-accent-cream leading-relaxed">
                    {activeSnippetTabChapter === "curl" && (
                      <pre>
                        {`curl -X POST http://localhost:3000/api/admin/chapters \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${apiKey}" \\\n  -d '{\n    "storyId": "hon-nguyen-tien-ton",\n    "chapterNumber": 1,\n    "title": "Chương 1: Trọng sinh thiếu niên",\n    "content": "Tiếng sấm rền vang rách toạc màn đêm u tối. Thiếu niên từ từ mở mắt, ánh mắt tràn ngập hàn quang...",\n    "status": "PUBLISHED"\n  }'`}
                      </pre>
                    )}
                    {activeSnippetTabChapter === "json" && (
                      <pre>
                        {`{\n  "storyId": "hon-nguyen-tien-ton",\n  "chapterNumber": 1,\n  "title": "Chương 1: Trọng sinh thiếu niên",\n  "content": "Tiếng sấm rền vang rách toạc màn đêm u tối. Thiếu niên từ từ mở mắt, ánh mắt tràn ngập hàn quang...",\n  "status": "PUBLISHED",\n  "isLocked": false,\n  "priceCoins": 0\n}`}
                      </pre>
                    )}
                    {activeSnippetTabChapter === "response" && (
                      <pre>
                        {`{\n  "success": true,\n  "message": "Đã đăng Chương 1: Trọng sinh thiếu niên cho tác phẩm \\"Hỗn Nguyên Tiên Tôn\\" thành công!",\n  "chapter": {\n    "id": "chap-hon-nguyen-tien-ton-1",\n    "storyId": "hon-nguyen-tien-ton",\n    "chapterNumber": 1,\n    "title": "Chương 1: Trọng sinh thiếu niên",\n    "slug": "chuong-1",\n    "wordCount": 1850,\n    "createdAt": "2026-10-06T15:05:00.000Z"\n  },\n  "updatedStory": {\n    "title": "Hỗn Nguyên Tiên Tôn",\n    "totalChapters": 1,\n    "wordCount": 1850\n  }\n}`}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 3: MANAGEMENT & ACTIONS API ================= */}
          {activeApiDocTab === "manage" && (
            <div className="space-y-4">
              {/* GET All Stories */}
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 font-mono text-xs font-bold text-blue-400 border border-blue-500/30">
                      GET
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-primary">
                      /api/admin/stories
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Lấy danh sách tác phẩm & Tìm kiếm</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Hỗ trợ query parameters: <code>?q=tu-tien</code> (tìm kiếm), <code>?genre=tien-hiep</code> (thể loại), <code>?status=ONGOING</code> (trạng thái), <code>?featured=true</code> (ghim nổi bật).
                </p>
                <div className="rounded-xl border border-border-subtle bg-bg-base p-3 font-mono text-xs text-accent-cream">
                  <code>curl -H "x-api-key: {apiKey}" "http://localhost:3000/api/admin/stories?q=tien"</code>
                </div>
              </div>

              {/* PUT Story Action */}
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
                      PUT
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-primary">
                      /api/admin/stories/[id]
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Khóa / Mở Khóa / Ghim Spotlight</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Truyền action trong body JSON: <code>{"{\"action\":\"ban\",\"reason\":\"Vi phạm bản quyền\"}"}</code> hoặc <code>{"{\"action\":\"unban\"}"}</code> hoặc <code>{"{\"action\":\"feature\",\"isFeatured\":true}"}</code>.
                </p>
                <div className="rounded-xl border border-border-subtle bg-bg-base p-3 font-mono text-xs text-accent-cream">
                  <code>curl -X PUT -H "x-api-key: {apiKey}" -H "Content-Type: application/json" -d &apos;{"{\"action\":\"ban\",\"reason\":\"Vi phạm quy chế\"}"}&apos; http://localhost:3000/api/admin/stories/story-1</code>
                </div>
              </div>

              {/* DELETE Story */}
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-red-500/20 px-2.5 py-1 font-mono text-xs font-bold text-red-400 border border-red-500/30">
                      DELETE
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-primary">
                      /api/admin/stories/[id]
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Xóa vĩnh viễn tác phẩm</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Xóa vĩnh viễn truyện cùng toàn bộ các chương truyện liên kết. Hành động này sẽ được ghi vết tự động vào hệ thống Audit Log.
                </p>
                <div className="rounded-xl border border-border-subtle bg-bg-base p-3 font-mono text-xs text-accent-cream">
                  <code>curl -X DELETE -H "x-api-key: {apiKey}" http://localhost:3000/api/admin/stories/story-1</code>
                </div>
              </div>

              {/* GET Chapters by Story */}
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 font-mono text-xs font-bold text-blue-400 border border-blue-500/30">
                      GET
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-primary">
                      /api/admin/stories/[id]/chapters
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Lấy danh sách chương của một truyện</span>
                </div>
                <div className="rounded-xl border border-border-subtle bg-bg-base p-3 font-mono text-xs text-accent-cream">
                  <code>curl -H "x-api-key: {apiKey}" http://localhost:3000/api/admin/stories/hon-nguyen-tien-ton/chapters</code>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: GENERAL & ERROR CODES ================= */}
          {activeApiDocTab === "general" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-4">
                <h3 className="font-display text-base font-bold text-ink-primary">
                  Bảng Mã Lỗi Chuẩn HTTP Trả Về
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-ink-muted">
                      <tr>
                        <th className="px-3.5 py-2.5 font-semibold">Mã HTTP</th>
                        <th className="px-3.5 py-2.5 font-semibold">Trạng thái</th>
                        <th className="px-3.5 py-2.5 font-semibold">Nguyên nhân & Hướng giải quyết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-ink-secondary">
                      <tr>
                        <td className="px-3.5 py-2 font-mono font-bold text-emerald-400">200 OK</td>
                        <td className="px-3.5 py-2">Thành công</td>
                        <td className="px-3.5 py-2">Truy vấn dữ liệu hoặc cập nhật thành công.</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono font-bold text-emerald-400">201 Created</td>
                        <td className="px-3.5 py-2">Khởi tạo thành công</td>
                        <td className="px-3.5 py-2">Đã tạo mới tác phẩm hoặc chương truyện thành công.</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono font-bold text-amber-400">400 Bad Request</td>
                        <td className="px-3.5 py-2">Dữ liệu không hợp lệ</td>
                        <td className="px-3.5 py-2">Thiếu các trường bắt buộc (title, storyId, content) hoặc dữ liệu sai định dạng.</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono font-bold text-red-400">403 Forbidden</td>
                        <td className="px-3.5 py-2">Từ chối truy cập</td>
                        <td className="px-3.5 py-2">Header <code>x-api-key</code> bị thiếu, không khớp với API Key Quản trị viên hoặc đã bị sinh mới.</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono font-bold text-sky-400">404 Not Found</td>
                        <td className="px-3.5 py-2">Không tìm thấy</td>
                        <td className="px-3.5 py-2">Không tìm thấy truyện với ID hoặc Slug cung cấp.</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-mono font-bold text-purple-400">409 Conflict</td>
                        <td className="px-3.5 py-2">Trùng lặp</td>
                        <td className="px-3.5 py-2">Slug truyện hoặc số thứ tự chương đã tồn tại trước đó.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Modal Add User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border-accent bg-surface p-5 shadow-2xl safe-pb animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-display text-base font-bold text-ink-primary">Thêm người dùng mới</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-muted">Tên hiển thị</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Phân quyền</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold"
                >
                  <option value="READER">Độc giả (READER)</option>
                  <option value="AUTHOR">Tác giả (AUTHOR)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-ink-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Ban User */}
      {isBanModalOpen && selectedUserForBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border-accent bg-surface p-5 shadow-2xl safe-pb animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-display text-base font-bold text-ink-primary">
                {selectedUserForBan.status === "BANNED" ? "Mở khóa người dùng" : "Khóa tài khoản người dùng"}
              </h3>
              <button onClick={() => setIsBanModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-ink-secondary">
                Tài khoản mục tiêu: <span className="font-bold text-ink-primary">{selectedUserForBan.name}</span> (@{selectedUserForBan.username})
              </p>
              {selectedUserForBan.status !== "BANNED" && (
                <div>
                  <label className="text-xs font-medium text-ink-muted">Lý do khóa tài khoản</label>
                  <textarea
                    rows={3}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBanModalOpen(false)}
                  className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-ink-muted"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleToggleBanUser}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-bold text-bg-base",
                    selectedUserForBan.status === "BANNED" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  {selectedUserForBan.status === "BANNED" ? "Xác nhận Mở khóa" : "Xác nhận Khóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Add Genre */}
      {isAddGenreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border-accent bg-surface p-5 shadow-2xl safe-pb animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-display text-base font-bold text-ink-primary">Thêm thể loại mới</h3>
              <button onClick={() => setIsAddGenreModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGenre} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-muted">Tên thể loại</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đô Thị Dị Năng"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Slug (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="do-thi-di-nang"
                  value={newGenreSlug}
                  onChange={(e) => setNewGenreSlug(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Mô tả thể loại</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả phong cách và đặc trưng..."
                  value={newGenreDesc}
                  onChange={(e) => setNewGenreDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGenreModalOpen(false)}
                  className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-ink-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover"
                >
                  Thêm thể loại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Add Badge */}
      {isAddBadgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border-accent bg-surface p-5 shadow-2xl safe-pb animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-display text-base font-bold text-ink-primary">Tạo danh hiệu mới</h3>
              <button onClick={() => setIsAddBadgeModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBadge} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-muted">Tên danh hiệu</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kiếm Thánh Xuất Trần"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Mã định danh (CODE)</label>
                <input
                  type="text"
                  placeholder="SWORD_SAINT"
                  value={newBadgeCode}
                  onChange={(e) => setNewBadgeCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Màu sắc nổi bật</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={newBadgeColor}
                    onChange={(e) => setNewBadgeColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-border-subtle bg-transparent"
                  />
                  <span className="text-xs font-mono text-ink-muted">{newBadgeColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Mô tả tiêu chuẩn đạt được</label>
                <textarea
                  rows={2}
                  placeholder="Dành cho tác giả có trên 500k chữ kiếm hiệp..."
                  value={newBadgeDesc}
                  onChange={(e) => setNewBadgeDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBadgeModalOpen(false)}
                  className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-ink-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover"
                >
                  Tạo danh hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Assign Badge to User */}
      {isAssignBadgeModalOpen && selectedUserForBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border-accent bg-surface p-5 shadow-2xl safe-pb animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-display text-base font-bold text-ink-primary">Gán danh hiệu cho người dùng</h3>
              <button onClick={() => setIsAssignBadgeModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-ink-secondary">
                Trao tặng danh hiệu cho: <span className="font-bold text-ink-primary">{selectedUserForBadge.name}</span> (@{selectedUserForBadge.username})
              </p>
              <div>
                <label className="text-xs font-medium text-ink-muted">Chọn danh hiệu vinh danh</label>
                <select
                  value={badgeToAssign}
                  onChange={(e) => setBadgeToAssign(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold"
                >
                  <option value="">-- Chọn một danh hiệu --</option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignBadgeModalOpen(false)}
                  className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-ink-muted"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!badgeToAssign}
                  onClick={handleAssignBadge}
                  className="rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover disabled:opacity-50"
                >
                  Trao tặng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Create Story (Admin) */}
      {isAddStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-6 w-full max-w-2xl rounded-2xl border border-border-accent bg-surface p-5 sm:p-6 shadow-2xl safe-pb animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gold/20 text-accent-gold">
                  <BookOpen className="h-4 w-4" />
                </span>
                <h3 className="font-display text-base font-bold text-ink-primary sm:text-lg">
                  Khởi Tạo Tác Phẩm Mới (Admin)
                </h3>
              </div>
              <button
                onClick={() => setIsAddStoryModalOpen(false)}
                className="rounded-lg p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="mt-4 space-y-4">
              {/* Tên truyện & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-muted">
                    Tên tác phẩm <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bạch Lạc Ma Kinh"
                    value={storyTitle}
                    onChange={(e) => {
                      setStoryTitle(e.target.value);
                      if (!storySlug || storySlug === slugify(storyTitle)) {
                        setStorySlug(slugify(e.target.value));
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted">Đường dẫn tĩnh (Slug SEO)</label>
                  <input
                    type="text"
                    placeholder="bach-lac-ma-kinh (để trống sẽ tự sinh)"
                    value={storySlug}
                    onChange={(e) => setStorySlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-secondary focus:border-accent-gold focus:outline-hidden font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Tác giả: Tự nhập hoặc chọn từ hệ thống */}
              <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-gold">Tác giả & Bản quyền</span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-ink-secondary">
                      <input
                        type="radio"
                        name="authorMode"
                        value="CUSTOM"
                        checked={authorMode === "CUSTOM"}
                        onChange={() => setAuthorMode("CUSTOM")}
                        className="text-accent-gold focus:ring-accent-gold"
                      />
                      <span>Tác giả độc lập / Tự do</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-ink-secondary">
                      <input
                        type="radio"
                        name="authorMode"
                        value="EXISTING_USER"
                        checked={authorMode === "EXISTING_USER"}
                        onChange={() => setAuthorMode("EXISTING_USER")}
                        className="text-accent-gold focus:ring-accent-gold"
                      />
                      <span>Thành viên hệ thống</span>
                    </label>
                  </div>
                </div>

                {authorMode === "CUSTOM" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-ink-muted">
                        Tên tác giả / Bút danh <span className="text-accent-gold">*</span>
                      </label>
                      <input
                        type="text"
                        required={authorMode === "CUSTOM"}
                        placeholder="Ví dụ: Độc Cô Nhạn"
                        value={customAuthorName}
                        onChange={(e) => setCustomAuthorName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-muted">Bút danh chính thức</label>
                      <input
                        type="text"
                        placeholder="Để trống nếu trùng tên tác giả"
                        value={customAuthorPenName}
                        onChange={(e) => setCustomAuthorPenName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-ink-muted">
                      Chọn tác giả từ danh sách thành viên <span className="text-accent-gold">*</span>
                    </label>
                    <select
                      value={selectedAuthorId}
                      required={authorMode === "EXISTING_USER"}
                      onChange={(e) => setSelectedAuthorId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                    >
                      <option value="">-- Chọn thành viên phụ trách --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (@{u.username}) {u.penName ? `• Bút danh: ${u.penName}` : ""} • {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Thể loại (đa chọn chips) */}
              <div>
                <label className="text-xs font-medium text-ink-muted block mb-1.5">
                  Thể loại truyện <span className="text-accent-gold">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 rounded-xl border border-border-subtle bg-surface-elevated/30">
                  {genres.map((g) => {
                    const isSelected = selectedStoryGenres.includes(g.name);
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedStoryGenres.length > 1) {
                              setSelectedStoryGenres(selectedStoryGenres.filter((name) => name !== g.name));
                            }
                          } else {
                            setSelectedStoryGenres([...selectedStoryGenres, g.name]);
                          }
                        }}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border",
                          isSelected
                            ? "bg-accent-gold text-bg-base border-accent-gold font-semibold"
                            : "bg-surface-elevated text-ink-secondary border-border-subtle hover:text-ink-primary"
                        )}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags từ khóa */}
              <div>
                <label className="text-xs font-medium text-ink-muted">Thẻ từ khóa (Tags, cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trọng Sinh, Ma Đạo, Cổ Phong, Vô Địch"
                  value={storyTagsInput}
                  onChange={(e) => setStoryTagsInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                />
              </div>

              {/* Tóm tắt ngắn & Lời tựa chi tiết */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-ink-muted">
                    Giới thiệu tóm tắt <span className="text-accent-gold">*</span> (Hiển thị ngoài card danh sách)
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Mô tả súc tích nội dung chính của truyện (1-3 câu)..."
                    value={storyShortDesc}
                    onChange={(e) => setStoryShortDesc(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted">
                    Lời tựa / Văn án chi tiết (Hiển thị trang chi tiết truyện)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Toàn văn lời tựa, dẫn nhập tác phẩm..."
                    value={storyFullDesc}
                    onChange={(e) => setStoryFullDesc(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Ảnh bìa & Preset covers */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-muted">
                    URL Ảnh bìa (tỷ lệ 3:4) <span className="text-accent-gold">*</span>
                  </label>
                  <span className="text-[11px] text-accent-gold">Chọn nhanh ảnh mẫu:</span>
                </div>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                  {[
                    { name: "Kiếm Đạo", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
                    { name: "Thư Cổ", url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80" },
                    { name: "Sơn Thủy", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80" },
                    { name: "Trăng Đêm", url: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600&auto=format&fit=crop&q=80" },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setStoryCoverUrl(preset.url)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-colors shrink-0",
                        storyCoverUrl === preset.url
                          ? "bg-accent-gold/20 border-accent-gold text-accent-gold font-bold"
                          : "bg-surface-elevated border-border-subtle text-ink-secondary hover:text-ink-primary"
                      )}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={storyCoverUrl}
                  onChange={(e) => setStoryCoverUrl(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                />
              </div>

              {/* Trạng thái & Ghim Spotlight */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border-subtle">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-muted block mb-1">Trạng thái phát hành</label>
                    <select
                      value={storyStatus}
                      onChange={(e) => setStoryStatus(e.target.value as "ONGOING" | "COMPLETED" | "DRAFT")}
                      className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-ink-primary focus:border-accent-gold"
                    >
                      <option value="ONGOING">Đang ra (ONGOING)</option>
                      <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
                      <option value="DRAFT">Lưu nháp / Khóa (DRAFT)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={storyFeatured}
                      onChange={(e) => setStoryFeatured(e.target.checked)}
                      className="rounded text-accent-gold focus:ring-accent-gold"
                    />
                    <span className="text-xs font-semibold text-accent-gold">Ghim Spotlight Bảng vàng</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddStoryModalOpen(false)}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink-primary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={storySubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-5 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover disabled:opacity-50 shadow-md"
                  >
                    {storySubmitting ? <span>Đang lưu...</span> : <span>Khởi tạo tác phẩm</span>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Post Chapter (Admin) */}
      {isAddChapterModalOpen && selectedStoryForChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-6 w-full max-w-2xl rounded-2xl border border-border-accent bg-surface p-5 sm:p-6 shadow-2xl safe-pb animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gold/20 text-accent-gold">
                  <PenTool className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-primary sm:text-lg">
                    Đăng Chương Mới (Admin)
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Tác phẩm: <span className="font-semibold text-accent-gold">{selectedStoryForChapter.title}</span> (Hiện có {selectedStoryForChapter.totalChapters} chương)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddChapterModalOpen(false)}
                className="rounded-lg p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChapter} className="mt-4 space-y-4">
              {/* Số chương & Tên chương */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-medium text-ink-muted">
                    Số thứ tự chương <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-medium text-ink-muted">
                    Tiêu đề chương <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Chương 4: Quyết chiến đỉnh Vân Tiêu"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Nội dung chương */}
              <div>
                <div className="flex items-center justify-between pb-1">
                  <label className="text-xs font-medium text-ink-muted">
                    Nội dung chương toàn văn <span className="text-accent-gold">*</span>
                  </label>
                  <span className="text-xs font-semibold text-accent-gold">
                    {countWords(chapterContent).toLocaleString()} chữ
                  </span>
                </div>
                <textarea
                  required
                  rows={12}
                  placeholder="Dán hoặc soạn thảo văn bản chương truyện tại đây..."
                  value={chapterContent}
                  onChange={(e) => setChapterContent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3.5 py-3 text-xs leading-relaxed text-ink-primary focus:border-accent-gold focus:outline-hidden font-sans"
                />
              </div>

              {/* Trạng thái & Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div>
                  <label className="text-xs font-medium text-ink-muted block mb-1">Trạng thái xuất bản</label>
                  <select
                    value={chapterStatus}
                    onChange={(e) => setChapterStatus(e.target.value as "PUBLISHED" | "DRAFT")}
                    className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-ink-primary focus:border-accent-gold"
                  >
                    <option value="PUBLISHED">Xuất bản ngay (PUBLISHED)</option>
                    <option value="DRAFT">Lưu bản nháp (DRAFT)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddChapterModalOpen(false)}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink-primary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={chapterSubmitting || !chapterContent.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-accent-gold px-5 py-2 text-xs font-bold text-bg-base hover:bg-accent-gold-hover disabled:opacity-50 shadow-md"
                  >
                    {chapterSubmitting ? <span>Đang đăng...</span> : <span>Xuất bản chương</span>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
