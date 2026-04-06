export type PostType = "link" | "text";
export type PostStatus = "normal" | "hidden" | "removed";

export interface Post {
  id: string;
  title: string;
  type: PostType;
  url?: string | null;
  text?: string | null;
  authorId: string;
  score: number;
  status: PostStatus;
  createdAt: number;
}