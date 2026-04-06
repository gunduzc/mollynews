export type CommentStatus = "normal" | "hidden" | "removed";

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId?: string | null;
  content: string;
  score: number;
  status: CommentStatus;
  createdAt: number;
}