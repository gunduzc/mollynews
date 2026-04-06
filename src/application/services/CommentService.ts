import { AddCommentCommand } from "../commands/AddCommentCommand";
import { Comment } from "../../domain/entities/Comment";
import { CommentRepository } from "../../domain/interfaces/CommentRepository";
import { PostRepository } from "../../domain/interfaces/PostRepository";

type AddCommentInput = {
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string | null;
};

export class CommentService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository
  ) {}

  async addComment(input: AddCommentInput): Promise<Comment> {
    const command = new AddCommentCommand(
      input,
      this.postRepository,
      this.commentRepository
    );

    return command.execute();
  }
}
