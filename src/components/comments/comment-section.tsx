"use client";

import { Loader2Icon, MessageCircleIcon } from "lucide-react";

import { useGetCommentsQuery, usePostCommentMutation } from "@/lib/store/api/blogifyApi";
import { countAllComments } from "@/lib/comment-utils";
import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";
import { Separator } from "@/components/ui/separator";

export function CommentSection({ blogId }: { blogId: string }) {
  const { data, isLoading } = useGetCommentsQuery({ blogId, size: 50 });
  const [postComment] = usePostCommentMutation();

  const comments = data?.content ?? [];
  const total = countAllComments(comments);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircleIcon className="size-4.5 text-brand-amber" />
        <h2 className="font-display text-lg font-semibold">
          {total} {total === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      <CommentComposer
        onSubmit={(content, taggedUserIds) =>
          postComment({ blogId, body: { content, taggedUserIds } })
        }
      />

      <Separator className="my-5" />

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Be the first to share what you think.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} blogId={blogId} />
          ))}
        </div>
      )}
    </div>
  );
}
