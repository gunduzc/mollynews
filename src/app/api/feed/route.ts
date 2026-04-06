import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  authService,
  feedService,
  userReadRepository,
  voteReadRepository,
} from "../../../infrastructure/container";
import { FeedStrategySelector } from "../../../domain/strategies/FeedStrategySelector";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") ?? "new";

    const strategy = FeedStrategySelector.select(mode);

    const posts = await feedService.getFeed(strategy);
    const authorEntries = await Promise.all(
      posts.map(async (post) => [
        post.authorId,
        (await userReadRepository.findById(post.authorId))?.username ?? "unknown",
      ] as const)
    );
    const authorMap = Object.fromEntries(authorEntries);

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    const user = sessionToken
      ? await authService.getUserBySessionToken(sessionToken)
      : null;

    const voteMap = user
      ? await voteReadRepository.findValuesByUserTargets(
          user.id,
          "post",
          posts.map((post) => post.id)
        )
      : {};

    const postsWithVotes = posts.map((post) => ({
      ...post,
      authorUsername: authorMap[post.authorId] ?? "unknown",
      currentUserVote: voteMap[post.id] ?? 0,
    }));

    return NextResponse.json({ posts: postsWithVotes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
