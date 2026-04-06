import { DownvoteCommand } from "../commands/DownvoteCommand";
import { UpvoteCommand } from "../commands/UpvoteCommand";
import { Comment } from "../../domain/entities/Comment";
import { Post } from "../../domain/entities/Post";
import { CommentRepository } from "../../domain/interfaces/CommentRepository";
import { PostRepository } from "../../domain/interfaces/PostRepository";
import { VoteRepository } from "../../domain/interfaces/VoteRepository";

export class VoteService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly voteRepository: VoteRepository
  ) {}

  async upvotePost(userId: string, postId: string) {
    const command = new UpvoteCommand<Post>(
      {
        userId,
        targetId: postId,
        targetType: "post",
        targetLabel: "Post",
      },
      this.postRepository,
      this.voteRepository
    );

    return command.execute();
  }

  async downvotePost(userId: string, postId: string) {
    const command = new DownvoteCommand<Post>(
      {
        userId,
        targetId: postId,
        targetType: "post",
        targetLabel: "Post",
      },
      this.postRepository,
      this.voteRepository
    );

    return command.execute();
  }

  async upvoteComment(userId: string, commentId: string) {
    const command = new UpvoteCommand<Comment>(
      {
        userId,
        targetId: commentId,
        targetType: "comment",
        targetLabel: "Comment",
      },
      this.commentRepository,
      this.voteRepository
    );

    return command.execute();
  }

  async downvoteComment(userId: string, commentId: string) {
    const command = new DownvoteCommand<Comment>(
      {
        userId,
        targetId: commentId,
        targetType: "comment",
        targetLabel: "Comment",
      },
      this.commentRepository,
      this.voteRepository
    );

    return command.execute();
  }
}
