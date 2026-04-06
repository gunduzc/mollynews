import { Post, PostType } from "../../domain/entities/Post";
import { PostFactorySelector, PostInput } from "../../domain/factories/PostFactory";
import { PostRepository } from "../../domain/interfaces/PostRepository";

export class SubmitPostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postFactorySelector: PostFactorySelector
  ) {}

  async submit(input: PostInput): Promise<Post> {
    this.validateInput(input);
    const factory = this.postFactorySelector.getFactory(input.type);
    const post = factory.create(input);
    await this.postRepository.create({
      id: post.id,
      title: post.title,
      type: post.type,
      url: post.url ?? undefined,
      text: post.text ?? undefined,
      authorId: post.authorId,
      createdAt: post.createdAt,
    });
    return post;
  }

  private validateInput(input: PostInput) {
    if (!input.title || input.title.trim().length < 3) {
      throw new Error("Title must be at least 3 characters.");
    }

    if (!input.authorId) {
      throw new Error("Author is required.");
    }

    if (input.type === "link" && !input.url) {
      throw new Error("URL is required for link posts.");
    }

    if (input.type === "text" && !input.text) {
      throw new Error("Text is required for text posts.");
    }
  }
}
