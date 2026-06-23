import type { CommentResponse } from "./api/types";

export function countAllComments(comments: CommentResponse[]): number {
  return comments.reduce((sum, c) => sum + 1 + countAllComments(c.replies), 0);
}
