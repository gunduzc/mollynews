import { Post } from "../entities/Post";
import { FeedRankingStrategy } from "./FeedRankingStrategy";

export class TopFeedStrategy implements FeedRankingStrategy {
  rank(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.createdAt - a.createdAt;
    });
  }
}