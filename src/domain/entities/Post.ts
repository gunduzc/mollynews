export type PostType = "link" | "text";

export interface Post {
  id: string;
  title: string;
  type: PostType;
  url?: string;
  text?: string;
  authorId: string;
  createdAt: number;
}
