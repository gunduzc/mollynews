import { Post } from "../entities/Post";
import { FeedRankingStrategy } from "./FeedRankingStrategy";

export class LatestFeedStrategy implements FeedRankingStrategy {
  rank(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => b.createdAt - a.createdAt);
  }
}