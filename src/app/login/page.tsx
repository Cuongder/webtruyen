"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Lock, Mail, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("hotprince");
  const [password, setPassword] = useState("Napoleong112@");
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

  const setQuickAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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

        {/* Demo Fast Login Pills */}
        <div className="mt-6 rounded-xl border border-border-subtle bg-surface p-3 text-center">
          <p className="text-[11px] font-medium text-ink-muted">Tài khoản trải nghiệm mẫu:</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setQuickAccount("hotprince", "Napoleong112@")}
              className="rounded-lg bg-accent-gold/20 px-2.5 py-1 text-[11px] font-bold text-accent-gold border border-accent-gold/40 hover:bg-accent-gold/30 ring-1 ring-accent-gold/50"
            >
              👑 Admin hotprince
            </button>
            <button
              type="button"
              onClick={() => setQuickAccount("author@mocthu.vn", "author123")}
              className="rounded-lg bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-accent-cream border border-border-subtle hover:border-accent-cream"
            >
              Tác giả demo
            </button>
            <button
              type="button"
              onClick={() => setQuickAccount("reader@mocthu.vn", "reader123")}
              className="rounded-lg bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-accent-gold border border-border-subtle hover:border-accent-gold"
            >
              Độc giả demo
            </button>
          </div>
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
                placeholder="hotprince hoặc vidu@mocthu.vn"
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
