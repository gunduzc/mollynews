import { PostRepository } from "../../domain/interfaces/PostRepository";
import { CommentRepository } from "../../domain/interfaces/CommentRepository";
import { VoteRepository } from "../../domain/interfaces/VoteRepository";
import { ContentState, ContentStatus } from "../../domain/states/ContentState";
import { NormalState } from "../../domain/states/NormalState";
import { HiddenState } from "../../domain/states/HiddenState";
import { RemovedState } from "../../domain/states/RemovedState";

type ModerationAction = "hide" | "remove" | "restore";
type ModerationTargetType = "post" | "comment";

function resolveState(status: ContentStatus): ContentState {
  switch (status) {
    case "hidden":
      return new HiddenState();
    case "removed":
      return new RemovedState();
    case "normal":
    default:
      return new NormalState();
  }
}

export class ModerationService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly voteRepository: VoteRepository
  ) {}

  async moderatePost(id: string, action: ModerationAction) {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (action === "remove") {
      const comments = await this.commentRepository.findByPostId(id);

      for (const comment of comments) {
        await this.voteRepository.deleteByTarget("comment", comment.id);
      }

      await this.commentRepository.deleteByPostId(id);
      await this.voteRepository.deleteByTarget("post", id);
      await this.postRepository.delete(id);

      return { deleted: true as const };
    }

    let state = resolveState(post.status);

    if (action === "hide") {
      state = state.hide();
    } else if (action === "restore") {
      state = state.restore();
    }

    await this.postRepository.updateStatus(id, state.getStatus());

    const updated = await this.postRepository.findById(id);
    if (!updated) {
      throw new Error("Failed to load updated post");
    }

    return updated;
  }

  async moderateComment(id: string, action: ModerationAction) {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (action === "remove") {
      const subtreeIds = await this.commentRepository.findSubtreeIds(id);

      for (const commentId of subtreeIds) {
        await this.voteRepository.deleteByTarget("comment", commentId);
      }

      await this.commentRepository.delete(id);

      return { deleted: true as const };
    }

    let state = resolveState(comment.status);

    if (action === "hide") {
      state = state.hide();
    } else if (action === "restore") {
      state = state.restore();
    }

    await this.commentRepository.updateStatus(id, state.getStatus());

    const updated = await this.commentRepository.findById(id);
    if (!updated) {
      throw new Error("Failed to load updated comment");
    }

    return updated;
  }
}
