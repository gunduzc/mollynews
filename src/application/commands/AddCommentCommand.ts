import { randomUUID } from "crypto";
import { Command } from "./Command";
import { Comment } from "../../domain/entities/Comment";
import { CommentRepository } from "../../domain/interfaces/CommentRepository";
import { PostRepository } from "../../domain/interfaces/PostRepository";

type AddCommentCommandInput = {
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string | null;
};

export class AddCommentCommand implements Command<Comment> {
  constructor(
    private readonly input: AddCommentCommandInput,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository
  ) {}

  async execute(): Promise<Comment> {
    const content = this.input.content.trim();
    const parentCommentId = this.input.parentCommentId ?? null;

    if (!content) {
      throw new Error("Comment content is required");
    }

    const post = await this.postRepository.findById(this.input.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (parentCommentId) {
      const parentComment = await this.commentRepository.findById(parentCommentId);

      if (!parentComment || parentComment.postId !== this.input.postId) {
        throw new Error("Invalid parent comment");
      }
    }

    return this.commentRepository.create({
      id: randomUUID(),
      postId: this.input.postId,
      authorId: this.input.authorId,
      parentCommentId,
      content,
      createdAt: Date.now(),
    });
  }
}
