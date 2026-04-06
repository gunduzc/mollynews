import { Post } from "../entities/Post";
import { FeedRankingStrategy } from "./FeedRankingStrategy";

export class TrendingFeedStrategy implements FeedRankingStrategy {
  rank(posts: Post[]): Post[] {
    const now = Date.now();

    const scorePost = (post: Post): number => {
      const ageHours = Math.max(1, (now - post.createdAt) / (1000 * 60 * 60));
      return post.score / ageHours;
    };

    return [...posts].sort((a, b) => {
      const scoreA = scorePost(a);
      const scoreB = scorePost(b);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      return b.createdAt - a.createdAt;
    });
  }
}