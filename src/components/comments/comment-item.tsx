"use client";

import * as React from "react";
import Link from "next/link";

import { relativeTime, compactNumber } from "@/lib/format";
import { reactionConfig, reactionOrder } from "@/components/shared/reaction-config";
import type { CommentResponse, ReactionType } from "@/lib/api/types";
import {
  useReactToCommentMutation,
  useRemoveCommentReactionMutation,
  useReplyToCommentMutation,
} from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { CommentText } from "./comment-text";
import { CommentComposer } from "./comment-composer";
import { cn } from "@/lib/utils";

export function CommentItem({
  comment,
  blogId,
  depth = 0,
  /** The root comment ID to post replies against (all nested replies go to same root) */
  rootCommentId,
}: {
  comment: CommentResponse;
  blogId: string;
  depth?: number;
  rootCommentId?: string;
}) {
  const author = comment.author;
  const [reactToComment] = useReactToCommentMutation();
  const [removeReaction] = useRemoveCommentReactionMutation();
  const [replyToComment] = useReplyToCommentMutation();
  const [showReply, setShowReply] = React.useState(false);
  const [showReplies, setShowReplies] = React.useState(depth === 0);

  // The comment ID to reply against — nested replies still target the root comment
  const replyTargetId = rootCommentId ?? comment.id;

  const total = comment.reactions.total;
  const ActiveIcon = comment.myReaction
    ? reactionConfig[comment.myReaction].icon
    : reactionConfig.LIKE.icon;

  function toggleReaction(type: ReactionType) {
    if (comment.myReaction === type) {
      removeReaction({ id: comment.id, blogId });
    } else {
      reactToComment({ id: comment.id, blogId, reactionType: type });
    }
  }

  return (
    <div className={cn(depth > 0 && "pl-4 sm:pl-6 border-l border-border")}>
      <div className="flex gap-2.5 py-3">
        <Link href={`/u/${author.handle}`} className="shrink-0">
          <Avatar className={depth > 0 ? "size-7" : "size-9"}>
            <AvatarImage src={author.avatarUrl ?? undefined} alt={author.name} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-muted px-3.5 py-2.5">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/u/${author.handle}`}
                className="text-sm font-medium hover:underline"
              >
                {author.name}
              </Link>
              {author.isVerified && <VerifiedBadge className="size-3.5" />}
            </div>
            <CommentText content={comment.content} taggedUsers={comment.taggedUsers} />
          </div>

          <div className="flex items-center gap-3 mt-1.5 px-1">
            <span className="text-xs text-muted-foreground">
              {relativeTime(comment.createdAt)}
            </span>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium transition-colors hover:text-primary",
                    comment.myReaction ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <ActiveIcon
                    className={cn(
                      "size-3.5",
                      comment.myReaction && "fill-primary/20"
                    )}
                  />
                  {total > 0 ? compactNumber(total) : "React"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1 flex gap-0.5" side="top" align="start">
                {reactionOrder.map((type) => {
                  const Icon = reactionConfig[type].icon;
                  const isActive = comment.myReaction === type;
                  return (
                    <button
                      key={type}
                      onClick={() => toggleReaction(type)}
                      title={reactionConfig[type].label}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-2 hover:bg-accent hover:text-accent-foreground transition-colors",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className={cn("size-4", isActive && "fill-current")} />
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>

            <button
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setShowReply((v) => !v)}
            >
              Reply
            </button>

            {comment.replies.length > 0 && depth === 0 && (
              <button
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setShowReplies((v) => !v)}
              >
                {showReplies
                  ? "Hide replies"
                  : `View ${comment.replies.length} ${
                      comment.replies.length === 1 ? "reply" : "replies"
                    }`}
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2.5">
              <CommentComposer
                size="sm"
                autoFocus
                // Auto-prefill @handle when replying
                initialValue={`@${author.handle} `}
                placeholder={`Reply to ${author.name}...`}
                onSubmit={(content, taggedUserIds) => {
                  replyToComment({
                    blogId,
                    commentId: replyTargetId,
                    body: { content, taggedUserIds },
                  });
                  setShowReply(false);
                  setShowReplies(true);
                }}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}

          {showReplies && comment.replies.length > 0 && (
            <div className="mt-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  blogId={blogId}
                  depth={depth + 1}
                  // All nested replies target the root comment (flat threading)
                  rootCommentId={replyTargetId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
