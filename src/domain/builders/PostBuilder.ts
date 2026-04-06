import { Post, PostType } from "../entities/Post";

export class PostBuilder {
  private id?: string;
  private title?: string;
  private type?: PostType;
  private url?: string;
  private text?: string;
  private authorId?: string;
  private createdAt?: number;

  withId(id: string) {
    this.id = id;
    return this;
  }

  withTitle(title: string) {
    this.title = title.trim();
    return this;
  }

  withType(type: PostType) {
    this.type = type;
    return this;
  }

  withLink(url: string) {
    this.url = url.trim();
    return this;
  }

  withText(text: string) {
    this.text = text.trim();
    return this;
  }

  withAuthorId(authorId: string) {
    this.authorId = authorId;
    return this;
  }

  withCreatedAt(timestamp: number) {
    this.createdAt = timestamp;
    return this;
  }

  build(): Post {
    if (!this.id || !this.title || !this.type || !this.authorId || !this.createdAt) {
      throw new Error("Missing required post fields.");
    }

    if (this.type === "link" && !this.url) {
      throw new Error("Link posts require a URL.");
    }

    if (this.type === "text" && !this.text) {
      throw new Error("Text posts require body text.");
    }

    return {
      id: this.id,
      title: this.title,
      type: this.type,
      url: this.url,
      text: this.text,
      authorId: this.authorId,
      score: 0,
      status: "normal",
      createdAt: this.createdAt
    };
  }
}
