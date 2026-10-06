import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Star,
  Clock,
  Eye,
  Heart,
  Share2,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import {
  STORIES_DATA,
  CHAPTERS_DATA,
  COMMENTS_DATA,
} from "@/lib/data-store";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { AddToLibraryButton } from "@/components/story/StoryActions";

interface StoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;
  const story = STORIES_DATA.find((s) => s.slug === slug);

  if (!story) {
    notFound();
  }

  const session = await getSession();
  const chapters = CHAPTERS_DATA[slug] || [];
  const comments = COMMENTS_DATA[slug] || [];
  const firstChapter = chapters[0];

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-28 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-gold transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại trang chủ</span>
        </Link>

        {/* Story Hero Header Block */}
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface p-4 sm:p-6 shadow-md">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* Book Cover 3:4 */}
            <div className="mx-auto w-36 shrink-0 sm:mx-0 sm:w-44 md:w-52">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border-accent bg-surface-elevated shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Main Info */}
            <div className="flex flex-1 flex-col justify-between text-center sm:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-accent-gold/15 px-2.5 py-0.5 text-xs font-semibold text-accent-gold border border-accent-gold/30">
                    {story.status === "ONGOING" ? "Đang ra" : "Hoàn thành"}
                  </span>
                  {story.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs text-ink-secondary border border-border-subtle"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <h1 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
                  {story.title}
                </h1>

                {/* Author Link */}
                <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                  <Link
                    href={`/author/${story.authorId}`}
                    className="flex items-center gap-2 group"
                  >
                    <div className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-accent-gold/40 group-hover:ring-accent-gold transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.authorAvatar}
                        alt={story.authorPenName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-accent-cream group-hover:underline">
                      {story.authorPenName || story.authorName}
                    </span>
                  </Link>
                  <span className="rounded bg-accent-gold/10 px-1.5 py-0.2 text-[10px] font-semibold text-accent-gold">
                    Đại thần
                  </span>
                </div>

                {/* 4 Stat Chips */}
                <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-surface-elevated/70 p-2.5 text-center border border-border-subtle/60">
                  <div>
                    <span className="block font-display text-sm font-bold text-accent-gold flex items-center justify-center gap-0.5">
                      <Star className="h-3 w-3 fill-accent-gold" />
                      {story.ratingScore}
                    </span>
                    <span className="text-[10px] text-ink-muted">{story.ratingsCount} đánh giá</span>
                  </div>
                  <div>
                    <span className="block font-display text-sm font-bold text-ink-primary">
                      {story.totalChapters}
                    </span>
                    <span className="text-[10px] text-ink-muted">Chương</span>
                  </div>
                  <div>
                    <span className="block font-display text-sm font-bold text-ink-primary">
                      {formatNumber(story.viewsCount)}
                    </span>
                    <span className="text-[10px] text-ink-muted">Lượt đọc</span>
                  </div>
                  <div>
                    <span className="block font-display text-sm font-bold text-ink-primary">
                      {formatNumber(story.followersCount)}
                    </span>
                    <span className="text-[10px] text-ink-muted">Theo dõi</span>
                  </div>
                </div>
              </div>

              {/* Desktop CTAs */}
              <div className="mt-5 hidden sm:flex items-center gap-3">
                {firstChapter && (
                  <Link
                    href={`/story/${story.slug}/chapter/${firstChapter.slug}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-gold px-6 py-3 text-sm font-bold text-bg-base shadow-md hover:bg-accent-gold-hover transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Đọc ngay (Chương 1)</span>
                  </Link>
                )}
                <AddToLibraryButton storyTitle={story.title} variant="full" />
              </div>
            </div>
          </div>
        </div>

        {/* Story Description */}
        <section className="mt-6 rounded-2xl border border-border-subtle bg-surface p-5">
          <h2 className="font-display text-base font-bold text-ink-primary">
            Giới thiệu tác phẩm
          </h2>
          <div className="mt-3 space-y-3 font-reading text-sm leading-relaxed text-ink-secondary sm:text-base">
            <p className="italic text-accent-cream/90 border-l-2 border-accent-gold pl-3">
              &quot;{story.shortDescription}&quot;
            </p>
            <p>{story.fullDescription}</p>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border-subtle pt-3">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-surface-elevated px-2 py-1 text-[11px] text-ink-muted border border-border-subtle/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* Chapters List */}
        <section className="mt-6 rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h2 className="font-display text-base font-bold text-ink-primary">
                Danh sách chương
              </h2>
              <p className="text-xs text-ink-muted">Cập nhật lúc: {formatRelativeTime(story.updatedAt)}</p>
            </div>
            <span className="text-xs font-semibold text-accent-gold">
              {chapters.length} chương
            </span>
          </div>

          <div className="mt-2 divide-y divide-border-subtle/50">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/story/${story.slug}/chapter/${ch.slug}`}
                className="flex items-center justify-between py-3 transition-colors hover:text-accent-gold active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-elevated text-xs font-semibold text-accent-gold">
                    {ch.chapterNumber}
                  </span>
                  <span className="text-xs font-medium sm:text-sm text-ink-primary">
                    {ch.title}
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted">
                  {formatRelativeTime(ch.publishedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Comments Section */}
        <section className="mt-6 rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="font-display text-base font-bold text-ink-primary flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent-gold" />
              <span>Bình luận độc giả ({comments.length})</span>
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-border-subtle/60 bg-surface-elevated/50 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-ink-primary">
                      {comment.authorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-muted">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                  {comment.content}
                </p>

                {/* Author replies */}
                {comment.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className="mt-3 ml-4 rounded-lg border-l-2 border-accent-gold bg-surface p-2.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-accent-gold">
                        {reply.authorName}
                      </span>
                      <span className="rounded bg-accent-gold/15 px-1 py-0.2 text-[9px] font-bold text-accent-gold">
                        Tác giả
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-secondary">{reply.content}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-2 border-t border-border-accent bg-surface/95 px-4 py-3 backdrop-blur-md safe-pb sm:hidden shadow-2xl">
        {firstChapter && (
          <Link
            href={`/story/${story.slug}/chapter/${firstChapter.slug}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-gold py-3 text-xs font-bold text-bg-base shadow-md active:scale-95"
          >
            <BookOpen className="h-4 w-4" />
            <span>Đọc ngay (Chương 1)</span>
          </Link>
        )}
        <AddToLibraryButton storyTitle={story.title} variant="icon" />
      </div>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
