import { Post } from "../../domain/entities/Post";
import { PostRepository } from "../../domain/interfaces/PostRepository";
import { FeedRankingStrategy } from "../../domain/strategies/FeedRankingStrategy";

export class FeedService {
  constructor(private readonly postRepository: PostRepository) {}

  async getFeed(strategy: FeedRankingStrategy, limit = 20): Promise<Post[]> {
    const posts = await this.postRepository.listVisible(limit);
    return strategy.rank(posts);
  }
}