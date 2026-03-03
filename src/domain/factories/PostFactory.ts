import { randomUUID } from "crypto";
import { PostBuilder } from "../builders/PostBuilder";
import { Post, PostType } from "../entities/Post";

export interface PostInput {
  title: string;
  type: PostType;
  url?: string;
  text?: string;
  authorId: string;
}

// Design Pattern: Factory Method
// Intent: Let subclasses decide which Post variant to create without changing call sites.
// Motivation: UC-3 supports LinkPost vs TextPost with different required fields.
// Improvement: Eliminates branching at callers (1 factory call instead of 2 type-specific flows).
export abstract class PostFactory {
  create(input: PostInput): Post {
    const builder = new PostBuilder()
      .withId(randomUUID())
      .withTitle(input.title)
      .withType(input.type)
      .withAuthorId(input.authorId)
      .withCreatedAt(Date.now());

    return this.applyTypeSpecific(builder, input).build();
  }

  protected abstract applyTypeSpecific(builder: PostBuilder, input: PostInput): PostBuilder;
}

export class LinkPostFactory extends PostFactory {
  protected applyTypeSpecific(builder: PostBuilder, input: PostInput): PostBuilder {
    if (!input.url) {
      throw new Error("URL is required for link posts.");
    }

    return builder.withLink(input.url);
  }
}

export class TextPostFactory extends PostFactory {
  protected applyTypeSpecific(builder: PostBuilder, input: PostInput): PostBuilder {
    if (!input.text) {
      throw new Error("Text is required for text posts.");
    }

    return builder.withText(input.text);
  }
}

export class PostFactorySelector {
  private readonly factories: Record<PostType, PostFactory> = {
    link: new LinkPostFactory(),
    text: new TextPostFactory()
  };

  getFactory(type: PostType): PostFactory {
    return this.factories[type];
  }
}
