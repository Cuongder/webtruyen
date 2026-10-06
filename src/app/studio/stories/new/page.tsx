"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Image as ImageIcon, Sparkles, Send } from "lucide-react";
import { GENRES_DATA } from "@/lib/data-store";
import { slugify } from "@/lib/utils";

export default function CreateStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tiên Hiệp");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
  );
  const [loading, setLoading] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert(`Đã khởi tạo bộ truyện mới "${title}" thành công! Bắt đầu viết chương đầu tiên.`);
      router.push("/studio/stories");
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 sm:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border-subtle bg-surface px-4 safe-pt">
        <Link
          href="/studio/stories"
          className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Hủy</span>
        </Link>
        <h1 className="font-display text-sm font-semibold text-ink-primary">
          Khởi tạo tác phẩm mới
        </h1>
        <div className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Thông tin cơ bản */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 space-y-4">
            <h2 className="font-display text-sm font-bold text-accent-gold">
              1. Thông tin tác phẩm
            </h2>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Tên truyện <span className="text-accent-gold">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Trường Khách Sơn Hà"
                className="mt-1 h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Đường dẫn tĩnh (Slug SEO)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="truong-khach-son-ha"
                className="mt-1 h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Thể loại chính
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              >
                {GENRES_DATA.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Từ khóa / Thẻ tag (cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Kiếm đạo, Trọng sinh, Cổ phong..."
                className="mt-1 h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Mô tả */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 space-y-4">
            <h2 className="font-display text-sm font-bold text-accent-gold">
              2. Văn án & Lời giới thiệu
            </h2>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Lời đề từ ngắn (Hiển thị thẻ xem nhanh)
              </label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Một hoặc hai câu thơ hoặc câu dẫn gợi mở cảm xúc..."
                className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated p-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Tóm tắt cốt truyện chi tiết
              </label>
              <textarea
                rows={5}
                required
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="Bối cảnh thế giới, nhân vật chính, nút thắt ân oán..."
                className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated p-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Bìa sách */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 space-y-4">
            <h2 className="font-display text-sm font-bold text-accent-gold">
              3. Ảnh bìa tác phẩm
            </h2>

            <div>
              <label className="block text-xs font-medium text-ink-secondary">
                Đường dẫn ảnh bìa (Tỉ lệ 3:4)
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            {coverUrl && (
              <div className="flex items-center gap-3">
                <div className="relative aspect-[3/4] w-20 overflow-hidden rounded-lg border border-border-subtle shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt="Xem trước bìa sách"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs text-ink-muted">
                  Bìa sách chuẩn hiển thị trên thiết bị di động
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-gold text-xs font-bold text-bg-base shadow-md hover:bg-accent-gold-hover transition-all active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span>Tạo truyện & Bắt đầu viết chương</span>
          </button>
        </form>
      </main>
    </div>
  );
}
