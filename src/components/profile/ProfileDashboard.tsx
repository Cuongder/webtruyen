"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Feather,
  Shield,
  Settings,
  BookMarked,
  LogOut,
  Sparkles,
  Flame,
  Crown,
  BookOpen,
  Trophy,
  Clock,
  FileText,
  PlusCircle,
  Edit3,
  Check,
  ChevronRight,
  X,
  AlertCircle,
  Lock,
  Mail,
  KeyRound,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserItem, BadgeItem, StoryItem } from "@/lib/data-store";

interface ProfileDashboardProps {
  user: UserItem;
  badges: BadgeItem[];
  userStories: StoryItem[];
}

const PRESET_AVATARS = [
  {
    name: "Cổ phong",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Kiếm khách",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Thư sinh",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Nữ hiệp",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Đạo sĩ",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
  },
];

export function ProfileDashboard({
  user: initialUser,
  badges: allBadges,
  userStories,
}: ProfileDashboardProps) {
  const [user, setUser] = useState<UserItem>(initialUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"INFO" | "SECURITY">("INFO");
  const [displayName, setDisplayName] = useState(user.name);
  const [penName, setPenName] = useState(user.penName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Map user badge IDs to badge objects
  const userBadges = allBadges.filter((b) => user.badges?.includes(b.id));

  const stats = user.readingStats || {
    hoursRead: 45,
    wordsRead: 350000,
    chaptersRead: 180,
    streakDays: 12,
    cultivationRank: "Trúc Cơ Tu Sĩ",
  };

  const openEditModal = () => {
    setDisplayName(user.name);
    setPenName(user.penName || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || "");
    setActiveTab("INFO");
    setMessage(null);
    setErrorMessage(null);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditModalOpen(true);
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Crown":
        return <Crown className="h-3.5 w-3.5" />;
      case "Flame":
        return <Flame className="h-3.5 w-3.5" />;
      case "BookOpen":
        return <BookOpen className="h-3.5 w-3.5" />;
      case "Trophy":
        return <Trophy className="h-3.5 w-3.5" />;
      case "Shield":
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setErrorMessage(null);

    if (activeTab === "SECURITY") {
      if (!oldPassword) {
        setErrorMessage("Vui lòng nhập mật khẩu hiện tại!");
        setIsSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("Mật khẩu mới phải có tối thiểu 6 ký tự!");
        setIsSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không trùng khớp!");
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Only pass name if user is ADMIN
          name: user.role === "ADMIN" ? displayName : undefined,
          penName: (user.role === "AUTHOR" || user.role === "ADMIN") ? penName : undefined,
          bio,
          avatarUrl,
          oldPassword: activeTab === "SECURITY" ? oldPassword : undefined,
          newPassword: activeTab === "SECURITY" ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Không thể cập nhật hồ sơ!");
      } else {
        setUser({
          ...user,
          name: user.role === "ADMIN" ? displayName : user.name,
          penName: (user.role === "AUTHOR" || user.role === "ADMIN") ? penName : user.penName,
          bio,
          avatarUrl,
        });
        setMessage(data.message || "Cập nhật hồ sơ thành công!");
        if (activeTab === "SECURITY") {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
        setTimeout(() => {
          setIsEditModalOpen(false);
          setMessage(null);
          setErrorMessage(null);
        }, 1500);
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeToAuthor = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng ký trở thành Tác giả Mộc Thư?")) return;
    setIsUpgrading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upgradeToAuthor: true, penName: user.name }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, role: "AUTHOR", penName: user.name });
        alert("Chúc mừng bạn đã trở thành Tác giả Mộc Thư! Hãy bắt đầu viết tác phẩm của bạn.");
      } else {
        alert(data.error || "Không thể nâng cấp vai trò!");
      }
    } catch {
      alert("Lỗi khi nâng cấp tài khoản!");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Identity Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-elevated via-surface to-surface p-5 shadow-md">
        {/* Glow corner */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-gold/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-elevated ring-2 ring-accent-gold/40 shadow-inner">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-accent-gold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-bg-base" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-bold text-ink-primary sm:text-2xl">
                  {user.name}
                </h1>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border",
                    user.role === "ADMIN"
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : user.role === "AUTHOR"
                      ? "bg-accent-gold/15 text-accent-gold border-accent-gold/30"
                      : "bg-surface-elevated text-ink-secondary border-border-subtle"
                  )}
                >
                  {user.role === "ADMIN" ? "Quản Trị Viên" : user.role === "AUTHOR" ? "Tác Giả" : "Độc Giả"}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-ink-muted">@{user.username}</p>

              {user.penName && user.role === "AUTHOR" && (
                <p className="mt-1 text-xs text-accent-cream">
                  Bút danh: <span className="font-semibold text-accent-gold">{user.penName}</span>
                </p>
              )}

              {/* Cultivation rank badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                  <Flame className="h-3 w-3 text-amber-400" />
                  <span>Cảnh giới: {stats.cultivationRank}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={openEditModal}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-semibold text-ink-secondary transition-all hover:border-accent-gold/40 hover:text-ink-primary active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5 text-accent-gold" />
            <span>Sửa hồ sơ</span>
          </button>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-4 text-xs leading-relaxed text-ink-secondary border-t border-border-subtle/60 pt-3">
            {user.bio}
          </p>
        )}

        {/* Badges list */}
        {userBadges.length > 0 && (
          <div className="mt-4 border-t border-border-subtle/60 pt-3">
            <p className="text-[11px] font-medium text-ink-muted mb-2">Huy hiệu & Danh hiệu sở hữu:</p>
            <div className="flex flex-wrap gap-2">
              {userBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border"
                  style={{
                    backgroundColor: `${badge.color}15`,
                    borderColor: `${badge.color}40`,
                    color: badge.color,
                  }}
                  title={badge.description}
                >
                  {renderBadgeIcon(badge.icon)}
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Reading Stats (4 Cards) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-accent-gold/15 text-accent-gold mb-2">
            <Clock className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-ink-muted">Thời gian đọc</span>
          <p className="font-display text-lg font-bold text-ink-primary">{stats.hoursRead} giờ</p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-accent-cream/15 text-accent-cream mb-2">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-ink-muted">Số chữ đã đọc</span>
          <p className="font-display text-lg font-bold text-ink-primary">
            {stats.wordsRead >= 1000000
              ? `${(stats.wordsRead / 1000000).toFixed(1)}M`
              : `${(stats.wordsRead / 1000).toFixed(0)}k`}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 mb-2">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-ink-muted">Số chương đã xem</span>
          <p className="font-display text-lg font-bold text-ink-primary">{stats.chaptersRead} chương</p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 mb-2">
            <Flame className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-ink-muted">Chuỗi ngày đọc</span>
          <p className="font-display text-lg font-bold text-amber-400">{stats.streakDays} ngày liên tục</p>
        </div>
      </div>

      {/* 3. Role-specific Actions & Content */}
      {user.role === "READER" && (
        <div className="rounded-2xl border border-accent-gold/30 bg-gradient-to-r from-accent-gold/10 via-surface to-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-accent-gold/20 px-2 py-0.5 text-[10px] font-bold text-accent-gold border border-accent-gold/30">
                Cơ hội sáng tác
              </span>
              <h3 className="mt-1 font-display text-base font-bold text-ink-primary">
                Trở thành Tác giả Mộc Thư
              </h3>
              <p className="mt-1 text-xs text-ink-secondary">
                Bạn có ý tưởng cho một thế giới tu tiên hay huyền huyễn ly kỳ? Hãy lập bút danh và bắt đầu xuất bản tác phẩm của bạn ngay hôm nay.
              </p>
            </div>
            <button
              onClick={handleUpgradeToAuthor}
              disabled={isUpgrading}
              className="shrink-0 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold text-bg-base transition-transform hover:bg-accent-gold-hover hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isUpgrading ? "Đang xử lý..." : "Đăng ký Tác giả"}
            </button>
          </div>
        </div>
      )}

      {/* 4. Author Works Section */}
      {(user.role === "AUTHOR" || user.role === "ADMIN") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-primary flex items-center gap-2">
              <Feather className="h-4 w-4 text-accent-gold" />
              <span>Tác phẩm do tôi sáng tác ({userStories.length})</span>
            </h2>
            <Link
              href="/studio/stories/new"
              className="flex items-center gap-1 rounded-lg bg-surface-elevated border border-border-subtle px-2.5 py-1 text-xs font-semibold text-accent-gold hover:border-accent-gold active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Đăng truyện mới</span>
            </Link>
          </div>

          {userStories.length > 0 ? (
            <div className="space-y-3">
              {userStories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-3 transition-colors hover:border-accent-gold/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative aspect-[3/4] h-16 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={story.coverUrl} alt={story.title} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-semibold text-ink-primary line-clamp-1">
                        {story.title}
                      </h4>
                      <p className="text-[11px] text-ink-muted">
                        {story.totalChapters} chương • {story.viewsCount.toLocaleString()} lượt đọc
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold",
                          story.status === "ONGOING"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-surface-elevated text-ink-muted"
                        )}
                      >
                        {story.status === "ONGOING" ? "Đang ra" : "Hoàn thành"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/studio/stories/${story.id}/chapters/new`}
                      className="rounded-lg bg-accent-gold/15 px-3 py-1.5 text-xs font-bold text-accent-gold border border-accent-gold/30 hover:bg-accent-gold hover:text-bg-base transition-colors"
                    >
                      + Chương
                    </Link>
                    <Link
                      href={`/story/${story.slug}`}
                      className="rounded-lg bg-surface-elevated p-1.5 text-ink-muted hover:text-ink-primary"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center">
              <Feather className="mx-auto h-8 w-8 text-ink-muted/50 mb-2" />
              <p className="text-xs text-ink-muted">Bạn chưa đăng tải tác phẩm nào.</p>
              <Link
                href="/studio/stories/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Bắt đầu viết tác phẩm đầu tay</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 5. Navigation Links & Settings */}
      <div className="rounded-2xl border border-border-subtle bg-surface divide-y divide-border-subtle/60 text-xs shadow-sm">
        <Link
          href="/library"
          className="flex items-center justify-between p-4 transition-colors hover:bg-surface-elevated"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-elevated text-accent-gold">
              <BookMarked className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-ink-primary">Tủ sách cá nhân</p>
              <p className="text-[11px] text-ink-muted">Truyện đang đọc dở, yêu thích và đánh dấu</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-muted" />
        </Link>

        {(user.role === "AUTHOR" || user.role === "ADMIN") && (
          <Link
            href="/studio"
            className="flex items-center justify-between p-4 transition-colors hover:bg-surface-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-gold/15 text-accent-gold">
                <Feather className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-accent-gold">Không gian sáng tác (Author Studio)</p>
                <p className="text-[11px] text-ink-muted">Quản lý chương, bản thảo và thống kê độc giả</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-accent-gold" />
          </Link>
        )}

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center justify-between p-4 transition-colors hover:bg-surface-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-amber-400">Trung tâm quản trị (Admin Dashboard)</p>
                <p className="text-[11px] text-ink-muted">Quản lý người dùng, truyện, thể loại và danh hiệu</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-400" />
          </Link>
        )}
      </div>

      {/* 6. Logout Form Button */}
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 py-3 text-xs font-semibold text-red-400 transition-colors hover:bg-red-950/40 active:scale-98"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </form>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-border-accent bg-surface p-4 sm:p-6 shadow-2xl safe-pb animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-gold/15 text-accent-gold">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-primary">
                    Chỉnh sửa hồ sơ cá nhân
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Cập nhật ảnh đại diện, bút danh, tiểu sử & mật khẩu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-elevated hover:text-ink-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="mt-3 flex rounded-xl bg-surface-elevated p-1 border border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("INFO");
                  setMessage(null);
                  setErrorMessage(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all",
                  activeTab === "INFO"
                    ? "bg-accent-gold text-bg-base shadow-sm"
                    : "text-ink-muted hover:text-ink-primary"
                )}
              >
                <User className="h-3.5 w-3.5" />
                <span>Thông tin cá nhân</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("SECURITY");
                  setMessage(null);
                  setErrorMessage(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all",
                  activeTab === "SECURITY"
                    ? "bg-accent-gold text-bg-base shadow-sm"
                    : "text-ink-muted hover:text-ink-primary"
                )}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Đổi mật khẩu</span>
              </button>
            </div>

            {/* Status Feedback */}
            {message && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-950/40 p-2.5 text-xs text-emerald-300 border border-emerald-800/40">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{message}</span>
              </div>
            )}
            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-950/40 p-2.5 text-xs text-red-300 border border-red-800/40">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-3.5">
              {activeTab === "INFO" ? (
                <>
                  {/* Display Name Section */}
                  <div>
                    {user.role === "ADMIN" ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-ink-muted">Tên hiển thị</label>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-accent-gold">
                            <Crown className="h-3.5 w-3.5" /> Quyền Admin: Được phép sửa
                          </span>
                        </div>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-accent-gold/50 bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-ink-muted">Tên hiển thị</label>
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                            <Lock className="h-3 w-3" /> Cố định (Chỉ Admin đổi)
                          </span>
                        </div>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            value={user.name}
                            disabled
                            readOnly
                            className="w-full rounded-xl border border-border-subtle bg-surface-elevated/40 px-3 py-2 pl-9 text-xs text-ink-muted cursor-not-allowed select-none"
                          />
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-amber-500/70" />
                        </div>
                        <div className="mt-2 rounded-xl border border-amber-800/40 bg-amber-950/20 p-2.5 text-xs">
                          <div className="flex items-center gap-1.5 text-accent-gold font-bold text-[11px]">
                            <Shield className="h-3.5 w-3.5" />
                            <span>Quy định bảo vệ tên hiển thị Mộc Thư</span>
                          </div>
                          <p className="mt-1 text-ink-secondary text-[11px] leading-relaxed">
                            Tên hiển thị không được tự ý chỉnh sửa nhằm bảo vệ danh tiếng và tác quyền tác giả. Tác giả & người dùng muốn sửa tên vui lòng liên hệ Admin.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                "Vui lòng gửi email đến: hotprince@mocthu.vn kèm lý do thay đổi tên hiển thị để Admin xét duyệt và cập nhật."
                              )
                            }
                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-accent-gold/15 px-2.5 py-1 text-[11px] font-bold text-accent-gold hover:bg-accent-gold/25 border border-accent-gold/30 active:scale-95 transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Liên hệ Admin đổi tên</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account identifiers (Read-only) */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-elevated/50 p-2.5 border border-border-subtle text-xs">
                    <div>
                      <span className="block text-[10px] text-ink-muted">Tên tài khoản (Username)</span>
                      <span className="font-semibold text-ink-primary">@{user.username}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-ink-muted">Email đăng ký</span>
                      <span className="truncate font-semibold text-ink-primary block">{user.email}</span>
                    </div>
                  </div>

                  {/* Pen Name for Author/Admin */}
                  {(user.role === "AUTHOR" || user.role === "ADMIN") && (
                    <div>
                      <label className="text-xs font-medium text-ink-muted">
                        Bút danh sáng tác (Pen Name)
                      </label>
                      <input
                        type="text"
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder="Nhập bút danh xuất hiện trên bìa truyện..."
                        className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                      />
                      <span className="text-[10px] text-ink-muted mt-0.5 block">
                        Bút danh này sẽ xuất hiện trên trang tác giả và bìa các bộ truyện do bạn viết.
                      </span>
                    </div>
                  )}

                  {/* Avatar Section & Presets */}
                  <div>
                    <label className="text-xs font-medium text-ink-muted flex items-center justify-between">
                      <span>Ảnh đại diện (Avatar)</span>
                      <span className="text-[10px] text-accent-cream">Chọn mẫu hoặc dán link URL</span>
                    </label>

                    {/* Presets Gallery */}
                    <div className="mt-1.5 flex items-center gap-2 overflow-x-auto pb-1.5">
                      {PRESET_AVATARS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          title={preset.name}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl p-1 border transition-all shrink-0 active:scale-95",
                            avatarUrl === preset.url
                              ? "border-accent-gold bg-accent-gold/10 ring-1 ring-accent-gold"
                              : "border-border-subtle bg-surface-elevated hover:border-accent-gold/40"
                          )}
                        >
                          <div className="h-10 w-10 overflow-hidden rounded-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] text-ink-muted">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom URL Input */}
                    <div className="relative mt-2">
                      <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-ink-muted">
                        Giới thiệu bản thân (Bio)
                      </label>
                      <span className="text-[10px] text-ink-muted">{bio.length}/300</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={300}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                      placeholder="Viết đôi dòng chia sẻ sở thích đọc hoặc phong cách sáng tác..."
                    />
                  </div>
                </>
              ) : (
                /* Tab 2: Security & Password Change */
                <div className="space-y-3.5 py-1">
                  <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-3 text-xs text-ink-secondary">
                    <p className="font-semibold text-accent-gold flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" /> Đổi mật khẩu tài khoản
                    </p>
                    <p className="text-[11px] text-ink-muted mt-1">
                      Mật khẩu mới cần tối thiểu 6 ký tự để đảm bảo an toàn cho tài khoản và tác phẩm của bạn.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink-muted">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng..."
                      className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink-muted">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..."
                      className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink-muted">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-border-subtle px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink-primary active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base shadow-sm hover:bg-accent-gold-hover active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isSaving ? "Đang lưu..." : activeTab === "SECURITY" ? "Cập nhật mật khẩu" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
