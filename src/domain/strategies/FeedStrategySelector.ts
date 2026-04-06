import { FeedRankingStrategy } from "./FeedRankingStrategy";
import { LatestFeedStrategy } from "./LatestFeedStrategy";
import { TopFeedStrategy } from "./TopFeedStrategy";
import { TrendingFeedStrategy } from "./TrendingFeedStrategy";

export class FeedStrategySelector {
  static select(mode: string): FeedRankingStrategy {
    switch (mode) {
      case "top":
        return new TopFeedStrategy();
      case "trending":
        return new TrendingFeedStrategy();
      case "latest":
      default:
        return new LatestFeedStrategy();
    }
  }
}