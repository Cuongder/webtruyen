"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Image as ImageIcon, Sparkles, Send, AlertCircle, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function CreateStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [genres, setGenres] = useState<Array<{ slug: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/genres")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const nextGenres = data?.genres || [];
        setGenres(nextGenres);
        if (nextGenres[0] && !selectedGenre) setSelectedGenre(nextGenres[0].slug);
      })
      .catch(() => {});
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Connect to real backend API
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          shortDescription: shortDesc.trim(),
          fullDescription: fullDesc.trim() || shortDesc.trim(),
          coverUrl: coverUrl.trim(),
          genreIds: [selectedGenre],
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          status: "ONGOING",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Không thể tạo truyện. Vui lòng kiểm tra lại thông tin!");
        setLoading(false);
        return;
      }

      // ponytail: direct router push to new chapter writer upon creation; add draft persistence if needed later.
      router.push(`/studio/stories/${data.story.id}/chapters/new`);
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ khi khởi tạo truyện!");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 sm:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border-subtle bg-surface px-4 safe-pt">
        <Link
          href="/studio/stories"
          className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent-gold"
          aria-label="Hủy tạo truyện và quay lại danh sách"
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
        {errorMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/20 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Thông tin cơ bản */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 space-y-4">
            <h2 className="font-display text-sm font-bold text-accent-gold">
              1. Thông tin tác phẩm
            </h2>

            <div>
              <label htmlFor="story-title" className="block text-xs font-medium text-ink-secondary">
                Tên truyện <span className="text-accent-gold">*</span>
              </label>
              <input
                id="story-title"
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Trường Khách Sơn Hà"
                className="mt-1 h-11 min-h-[44px] w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="story-slug" className="block text-xs font-medium text-ink-secondary">
                Đường dẫn tĩnh (Slug SEO)
              </label>
              <input
                id="story-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="truong-khach-son-ha"
                className="mt-1 h-11 min-h-[44px] w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-muted focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="story-genre" className="block text-xs font-medium text-ink-secondary">
                Thể loại chính
              </label>
              <select
                id="story-genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="mt-1 h-11 min-h-[44px] w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              >
                {genres.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="story-tags" className="block text-xs font-medium text-ink-secondary">
                Từ khóa / Thẻ tag (cách nhau bằng dấu phẩy)
              </label>
              <input
                id="story-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Kiếm đạo, Trọng sinh, Cổ phong..."
                className="mt-1 h-11 min-h-[44px] w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Mô tả */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 space-y-4">
            <h2 className="font-display text-sm font-bold text-accent-gold">
              2. Văn án & Lời giới thiệu
            </h2>

            <div>
              <label htmlFor="story-short-desc" className="block text-xs font-medium text-ink-secondary">
                Lời đề từ ngắn (Hiển thị thẻ xem nhanh) <span className="text-accent-gold">*</span>
              </label>
              <textarea
                id="story-short-desc"
                rows={2}
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Một hoặc hai câu thơ hoặc câu dẫn gợi mở cảm xúc..."
                className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-elevated p-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="story-full-desc" className="block text-xs font-medium text-ink-secondary">
                Tóm tắt cốt truyện chi tiết
              </label>
              <textarea
                id="story-full-desc"
                rows={5}
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
              <label htmlFor="story-cover-url" className="block text-xs font-medium text-ink-secondary">
                Đường dẫn ảnh bìa (Tỉ lệ 3:4) <span className="text-accent-gold">*</span>
              </label>
              <input
                id="story-cover-url"
                type="url"
                required
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="mt-1 h-11 min-h-[44px] w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 text-xs text-ink-primary focus:border-accent-gold focus:outline-hidden"
              />
            </div>

            {coverUrl && (
              <div className="flex items-center gap-3">
                <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg border border-border-subtle shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt="Xem trước bìa sách"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs text-ink-muted">
                  Bìa sách chuẩn hiển thị trên thiết bị di động (tỷ lệ 3:4)
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent-gold text-xs font-bold text-bg-base shadow-md hover:bg-accent-gold-hover transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xử lý khởi tạo truyện...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Tạo truyện & Bắt đầu viết chương</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
