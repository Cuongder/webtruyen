"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
      } else {
        const target =
          data.user.role === "ADMIN"
            ? "/admin"
            : data.user.role === "AUTHOR"
            ? "/studio"
            : "/";
        window.location.href = target;
      }
    } catch {
      setError("Không thể kết nối đến máy chủ xác thực");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-bg-base px-4 py-8 text-ink-primary sm:px-6">
      <div className="mx-auto w-full max-w-sm">
        {/* Brand Link */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold tracking-tight text-accent-gold">
              {siteConfig.name}
            </span>
          </Link>
          <h1 className="mt-2 text-sm text-ink-secondary">
            Đăng nhập vào tài khoản độc giả / tác giả
          </h1>
        </div>

        {/* Form Card */}
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
              Email hoặc Tên tài khoản
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vidu@mocthu.vn hoặc tên tài khoản"
                className="h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-ink-secondary">Mật khẩu</label>
              <a href="#" className="text-accent-gold hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated pl-9 pr-3 text-xs text-ink-primary placeholder:text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-accent-gold text-xs font-bold text-bg-base shadow-md transition-all hover:bg-accent-gold-hover active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-accent-gold hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}
