import {
  CommentThreadComponent,
  SerializedCommentNode,
  createCommentThreadComponent,
} from "../../domain/composites/CommentThread";
import { Comment } from "../../domain/entities/Comment";

export class CommentThreadService {
  buildThread(comments: Comment[]): SerializedCommentNode[] {
    const childParentIds = new Set(
      comments
        .map((comment) => comment.parentCommentId)
        .filter((value): value is string => Boolean(value))
    );

    const nodes = new Map<string, CommentThreadComponent>();
    for (const comment of comments) {
      nodes.set(
        comment.id,
        createCommentThreadComponent(comment, childParentIds.has(comment.id))
      );
    }

    const roots: CommentThreadComponent[] = [];

    for (const comment of comments) {
      const node = nodes.get(comment.id);
      if (!node) {
        continue;
      }

      if (comment.parentCommentId) {
        const parent = nodes.get(comment.parentCommentId);
        if (parent) {
          try {
            parent.addChild(node);
            continue;
          } catch {
            const upgradedParent = createCommentThreadComponent(
              comments.find((entry) => entry.id === comment.parentCommentId) ?? comment,
              true
            );

            for (const existingChild of parent.getChildren()) {
              upgradedParent.addChild(existingChild);
            }

            upgradedParent.addChild(node);
            nodes.set(comment.parentCommentId, upgradedParent);
            continue;
          }
        }
      }

      roots.push(node);
    }

    return roots.map((root) => root.toJSON());
  }
}
