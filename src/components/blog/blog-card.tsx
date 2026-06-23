"use client";

import Link from "next/link";

import { relativeTime } from "@/lib/format";
import type { BlogCard as BlogCardType } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { ReactionBar } from "./reaction-bar";
import { getFilterCss } from "@/lib/filters";

export function BlogCard({ blog }: { blog: BlogCardType }) {
  const author = blog.author;

  return (
    <Card className="overflow-hidden gap-3 py-0 pb-4">
      <div className="flex items-center gap-3 px-5 pt-5">
        <Link href={`/u/${author.handle}`}>
          <Avatar className="size-10">
            <AvatarImage src={author.avatarUrl ?? undefined} alt={author.name} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${author.handle}`}
            className="flex items-center gap-1 text-sm font-medium hover:underline w-fit"
          >
            <span className="truncate">{author.name}</span>
            {author.isVerified && <VerifiedBadge />}
          </Link>
          <p className="text-xs text-muted-foreground">
            {relativeTime(blog.createdAt)} · {blog.readTimeMinutes} min read
          </p>
        </div>
      </div>

      <Link href={`/blog/${blog.id}`} className="block px-5 group">
        <h2 className="font-display text-lg sm:text-xl font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors">
          {blog.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
          {blog.excerpt}
        </p>
      </Link>

      {blog.coverImageUrl && (
        <Link href={`/blog/${blog.id}`} className="block px-5">
          <div className="overflow-hidden rounded-xl border border-border aspect-[16/9] bg-muted">
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="size-full object-cover transition-transform hover:scale-[1.02]"
              style={{ filter: getFilterCss(blog.coverFilter ?? undefined) }}
            />
          </div>
        </Link>
      )}

      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5">
          {blog.tags.map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
              <Badge variant="secondary" className="hover:bg-secondary/70 cursor-pointer">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="px-5">
        <ReactionBar blog={blog} commentCount={blog.commentsCount} />
      </div>
    </Card>
  );
}
