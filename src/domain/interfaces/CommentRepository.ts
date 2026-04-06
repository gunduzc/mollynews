import { Comment } from "../entities/Comment";

export interface CreateCommentInput {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId?: string | null;
  content: string;
  createdAt: number;
}

export interface CommentRepository {
  create(input: CreateCommentInput): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string): Promise<Comment[]>;
  findSubtreeIds(id: string): Promise<string[]>;
  incrementScore(id: string): Promise<void>;
  decrementScore(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByPostId(postId: string): Promise<void>;
  updateStatus(id: string, status: "normal" | "hidden" | "removed"): Promise<void>;
}
