import { Post } from "../entities/Post";

export interface FeedRankingStrategy {
  rank(posts: Post[]): Post[];
}