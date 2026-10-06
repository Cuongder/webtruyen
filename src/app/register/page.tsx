"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Feather, User, Mail, Lock, AlertCircle, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"READER" | "AUTHOR">("READER");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          role,
          username,
          email,
          password,
          penName: role === "AUTHOR" ? penName || username : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại");
      } else {
        router.push(role === "AUTHOR" ? "/studio" : "/");
        router.refresh();
      }
    } catch {
      setError("Không thể kết nối đến máy chủ xác thực");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-bg-base px-4 py-8 text-ink-primary sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold tracking-tight text-accent-gold">
              {siteConfig.name}
            </span>
          </Link>
          <h1 className="mt-2 text-sm text-ink-secondary">
            Tạo tài khoản thành viên mới
          </h1>
        </div>

        {/* Big Choice Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("READER")}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 active:scale-95",
              role === "READER"
                ? "border-accent-gold bg-surface-elevated text-accent-gold ring-1 ring-accent-gold shadow-md"
                : "border-border-subtle bg-surface text-ink-secondary hover:border-accent-gold/40"
            )}
          >
            <BookOpen className="h-6 w-6 mb-2 text-accent-gold" />
            <span className="text-xs font-bold">Tôi muốn đọc truyện</span>
            <span className="mt-0.5 text-[10px] text-ink-muted">Tủ sách, bình luận, bookmark</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("AUTHOR")}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 active:scale-95",
              role === "AUTHOR"
                ? "border-accent-gold bg-surface-elevated text-accent-gold ring-1 ring-accent-gold shadow-md"
                : "border-border-subtle bg-surface text-ink-secondary hover:border-accent-gold/40"
            )}
          >
            <Feather className="h-6 w-6 mb-2 text-accent-gold" />
            <span className="text-xs font-bold">Tôi muốn sáng tác</span>
            <span className="mt-0.5 text-[10px] text-ink-muted">Đăng truyện, quản lý chương</span>
          </button>
        </div>

        {/* Register Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-lg space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/40 p-3 text-xs text-red-300 border border-red-800/40">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-secondary">
              Tên đăng nhập
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tennguoidung"
                className="h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          {role === "AUTHOR" && (
            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Bút danh tác giả
              </label>
              <div className="relative mt-1">
                <Feather className="absolute left-3 top-2.5 h-4 w-4 text-accent-gold" />
                <input
                  type="text"
                  required
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  placeholder="Ví dụ: Cố Niệm Vũ, Mặc Bạch..."
                  className="h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-secondary">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@email.com"
                className="h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary">
              Mật khẩu
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-accent-gold text-xs font-bold text-bg-base shadow-md transition-all hover:bg-accent-gold-hover active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Đang khởi tạo tài khoản..." : "Hoàn tất đăng ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-accent-gold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
