import { Comment, CommentStatus } from "../entities/Comment";

export interface SerializedCommentNode {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId?: string | null;
  content: string;
  score: number;
  status: CommentStatus;
  createdAt: number;
  childCount: number;
  children: SerializedCommentNode[];
}

export interface CommentThreadComponent {
  getId(): string;
  addChild(child: CommentThreadComponent): void;
  getChildren(): CommentThreadComponent[];
  getChildCount(): number;
  toJSON(): SerializedCommentNode;
}

abstract class BaseCommentThreadComponent implements CommentThreadComponent {
  protected readonly children: CommentThreadComponent[] = [];

  constructor(protected readonly comment: Comment) {}

  getId(): string {
    return this.comment.id;
  }

  addChild(child: CommentThreadComponent): void {
    this.children.push(child);
  }

  getChildren(): CommentThreadComponent[] {
    return this.children;
  }

  getChildCount(): number {
    return this.children.length;
  }

  toJSON(): SerializedCommentNode {
    return {
      ...this.comment,
      childCount: this.getChildCount(),
      children: this.children.map((child) => child.toJSON()),
    };
  }
}

export class CommentLeaf extends BaseCommentThreadComponent {
  addChild(_: CommentThreadComponent): void {
    throw new Error("Leaf comments cannot receive child comments.");
  }
}

export class CommentComposite extends BaseCommentThreadComponent {}

export function createCommentThreadComponent(
  comment: Comment,
  hasChildren: boolean
): CommentThreadComponent {
  return hasChildren ? new CommentComposite(comment) : new CommentLeaf(comment);
}
