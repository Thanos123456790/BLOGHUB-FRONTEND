"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileQuestionIcon, Loader2Icon } from "lucide-react";

import {
  useFollowUserMutation,
  useGetBlogQuery,
  useGetMeQuery,
  useUnfollowUserMutation,
} from "@/lib/store/api/blogifyApi";
import { relativeTime } from "@/lib/format";
import { getFilterCss } from "@/lib/filters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { BackButton } from "@/components/shared/back-button";
import { BlockRenderer } from "@/components/blog/block-renderer";
import { ReactionBar } from "@/components/blog/reaction-bar";
import { CommentSection } from "@/components/comments/comment-section";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: blog, isLoading, isError } = useGetBlogQuery(params.id);
  const { data: me } = useGetMeQuery();
  const [followUser, { isLoading: following_ }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 px-6">
        <FileQuestionIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">Post not found</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          This post may have been removed or the link is incorrect.
        </p>
        <Button onClick={() => router.push("/")} className="mt-2">
          Back to home
        </Button>
      </div>
    );
  }

  const author = blog.author;
  const isMe = author.id === me?.id;

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-5 lg:py-8 pb-16">
      <BackButton className="mb-5" />

      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {blog.tags.map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
              <Badge variant="secondary" className="hover:bg-secondary/70 cursor-pointer">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
        {blog.title}
      </h1>

      <p className="mt-2 text-base text-muted-foreground">{blog.excerpt}</p>

      <div className="flex items-center justify-between gap-3 mt-5">
        <Link href={`/u/${author.handle}`} className="flex items-center gap-3 min-w-0">
          <Avatar className="size-11">
            <AvatarImage src={author.avatarUrl ?? undefined} alt={author.name} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="flex items-center gap-1 text-sm font-medium">
              <span className="truncate">{author.name}</span>
              {author.isVerified && <VerifiedBadge />}
            </span>
            <p className="text-xs text-muted-foreground">
              {relativeTime(blog.createdAt)} · {blog.readTimeMinutes} min read
            </p>
          </div>
        </Link>

        {!isMe && (
          <Button
            variant={author.isFollowing ? "outline" : "default"}
            size="sm"
            disabled={following_ || unfollowing}
            onClick={() =>
              author.isFollowing ? unfollowUser(author.id) : followUser(author.id)
            }
            className="shrink-0"
          >
            {author.isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {blog.coverImageUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted aspect-[16/9]">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="size-full object-cover"
            style={{ filter: getFilterCss(blog.coverFilter ?? undefined) }}
          />
        </div>
      )}

      <div className="mt-7">
        <BlockRenderer blocks={blog.blocks} />
      </div>

      <Separator className="my-7" />

      <ReactionBar blog={blog} commentCount={blog.commentsCount} />

      <Separator className="my-7" />

      <CommentSection blogId={blog.id} />
    </div>
  );
}
