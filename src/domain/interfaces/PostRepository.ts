import { Post } from "../entities/Post";

export interface CreatePostInput {
  id: string;
  title: string;
  type: "link" | "text";
  url?: string;
  text?: string;
  authorId: string;
  createdAt: number;
}

export interface PostRepository {
  create(input: CreatePostInput): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  listLatest(limit: number): Promise<Post[]>;
  listVisible(limit: number): Promise<Post[]>;
  incrementScore(id: string): Promise<void>;
  decrementScore(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: "normal" | "hidden" | "removed"): Promise<void>;
}
