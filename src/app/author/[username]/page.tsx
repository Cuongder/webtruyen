import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Star, Plus, Check } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { StoryCardMobile } from "@/components/story/StoryCardMobile";
import { formatNumber } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { FollowAuthorButton } from "@/components/story/StoryActions";
import { userRepository } from "@/lib/repositories";
import { getAuthorStories } from "@/lib/read-model";
import { notFound } from "next/navigation";

interface AuthorProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorProfilePage({ params }: AuthorProfilePageProps) {
  const { username } = await params;
  const session = await getSession();

  const author = await userRepository.findUserByUsername(username);
  if (!author || !author.authorProfile) notFound();
  const authorStories = await getAuthorStories(author.id);
  const authorName = author.authorProfile.penName || author.profile?.displayName || author.username;
  const totalViews = authorStories.reduce((acc, s) => acc + s.viewsCount, 0);
  const avatarUrl = author.authorProfile.avatarUrl || author.profile?.avatarUrl || "";

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-ink-primary pb-20 md:pb-12">
      <MobileHeader user={session} />
      <DesktopHeader user={session} />

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Link>

        {/* Author Profile Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-md">
          {/* Cover Header */}
          <div className="h-28 w-full bg-gradient-to-r from-surface-elevated via-accent-gold/20 to-surface-elevated sm:h-36" />

          {/* Avatar and Info */}
          <div className="relative px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-14 mb-4">
              <div className="flex items-end gap-3.5">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-surface bg-surface-elevated shadow-lg ring-1 ring-accent-gold/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-xl font-bold text-ink-primary sm:text-2xl">
                      {authorName}
                    </h1>
                    <span className="rounded bg-accent-gold/15 px-2 py-0.5 text-[10px] font-bold text-accent-gold">
                      Đại thần sáng tác
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">Tác giả ký hợp đồng Mộc Thư</p>
                </div>
              </div>

              {/* Follow Button */}
              <div className="mt-3 sm:mt-0">
                <FollowAuthorButton authorName={authorName} authorId={author.authorProfile.id} />
              </div>
            </div>

            {/* Bio */}
            <p className="font-reading text-xs leading-relaxed text-ink-secondary sm:text-sm">
              &quot;{author.authorProfile.bio || author.profile?.bio || "Tác giả Mộc Thư."}&quot;
            </p>

            {/* Author Stats Bar */}
            <div className="mt-4 flex items-center gap-6 border-t border-border-subtle pt-3 text-xs">
              <div>
                <span className="font-bold text-ink-primary">{authorStories.length}</span>{" "}
                <span className="text-ink-muted">Tác phẩm</span>
              </div>
              <div>
                <span className="font-bold text-ink-primary">{formatNumber(totalViews)}</span>{" "}
                <span className="text-ink-muted">Lượt đọc</span>
              </div>
              <div>
                  <span className="font-bold text-ink-primary">{formatNumber(author.authorProfile.followerCount)}</span>{" "}
                <span className="text-ink-muted">Độc giả theo dõi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Author Works Grid */}
        <div>
          <h2 className="mb-3 text-base font-bold font-display text-ink-primary">
            Tác phẩm đã sáng tác ({authorStories.length})
          </h2>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {authorStories.map((story) => (
              <StoryCardMobile key={story.id} story={story} />
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation userRole={session?.role} />
    </div>
  );
}
