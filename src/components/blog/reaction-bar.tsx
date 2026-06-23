"use client";

import { BookmarkIcon, MessageCircleIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { reactionConfig, reactionOrder } from "@/components/shared/reaction-config";
import type { ReactionCount, ReactionType } from "@/lib/api/types";
import {
  useBookmarkBlogMutation,
  useReactToBlogMutation,
  useRemoveBlogReactionMutation,
  useRemoveBookmarkMutation,
} from "@/lib/store/api/blogifyApi";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ReactableBlog {
  id: string;
  reactions: ReactionCount;
  myReaction: ReactionType | null;
  bookmarked: boolean;
}

export function ReactionBar({
  blog,
  commentCount,
  onCommentClick,
}: {
  blog: ReactableBlog;
  commentCount: number;
  onCommentClick?: () => void;
}) {
  const [reactToBlog] = useReactToBlogMutation();
  const [removeReaction] = useRemoveBlogReactionMutation();
  const [bookmarkBlog] = useBookmarkBlogMutation();
  const [removeBookmark] = useRemoveBookmarkMutation();

  const total = blog.reactions.total;
  const ActiveIcon = blog.myReaction
    ? reactionConfig[blog.myReaction].icon
    : reactionConfig.LIKE.icon;

  function toggleReaction(type: ReactionType) {
    if (blog.myReaction === type) {
      removeReaction(blog.id);
    } else {
      reactToBlog({ id: blog.id, reactionType: type });
    }
  }

  function toggleBookmark() {
    if (blog.bookmarked) {
      removeBookmark(blog.id);
    } else {
      bookmarkBlog(blog.id);
    }
  }

  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={blog.myReaction ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-1.5", blog.myReaction && "text-primary")}
              onClick={() => !blog.myReaction && toggleReaction("LIKE")}
            >
              <ActiveIcon
                className={cn("size-4", blog.myReaction && "fill-primary/20")}
              />
              {total > 0 ? compactNumber(total) : "React"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1.5 flex gap-1" side="top" align="start">
            {reactionOrder.map((type) => {
              const Icon = reactionConfig[type].icon;
              const isActive = blog.myReaction === type;
              const count = blog.reactions[reactionConfig[type].countKey];
              return (
                <button
                  key={type}
                  onClick={() => toggleReaction(type)}
                  title={reactionConfig[type].label}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className={cn("size-5", isActive && "fill-current")} />
                  {count ? compactNumber(count) : 0}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onCommentClick}>
          <MessageCircleIcon className="size-4" />
          {commentCount > 0 ? compactNumber(commentCount) : "Comment"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast("Link copied", { description: "Post link copied to clipboard." })
          }
        >
          <Share2Icon className="size-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Bookmark"
        onClick={toggleBookmark}
        className={cn(blog.bookmarked && "text-brand-amber")}
      >
        <BookmarkIcon className={cn("size-4.5", blog.bookmarked && "fill-brand-amber")} />
      </Button>
    </div>
  );
}
