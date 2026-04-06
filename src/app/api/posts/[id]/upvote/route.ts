import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  postReadRepository,
  postWriteRepository,
  voteReadRepository,
  voteWriteRepository,
} from "../../../../../infrastructure/container";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const { id: postId } = await context.params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await postReadRepository.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== "normal") {
      return NextResponse.json(
        { error: "This post cannot be upvoted" },
        { status: 400 }
      );
    }

    const existingVote = await voteReadRepository.findByUserTarget(user.id, "post", postId);

    if (!existingVote) {
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "post",
        targetId: postId,
        value: 1,
        createdAt: Date.now(),
      });

      await postWriteRepository.incrementScore(postId);
    } else if (existingVote.value === 1) {
      await voteWriteRepository.deleteByUserTarget(user.id, "post", postId);
      await postWriteRepository.decrementScore(postId);
    } else {
      await voteWriteRepository.deleteByUserTarget(user.id, "post", postId);
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "post",
        targetId: postId,
        value: 1,
        createdAt: Date.now(),
      });

      await postWriteRepository.incrementScore(postId);
      await postWriteRepository.incrementScore(postId);
    }

    const updatedPost = await postReadRepository.findById(postId);

    return NextResponse.json(
      {
        message:
          !existingVote
            ? "Post upvoted successfully"
            : existingVote.value === 1
              ? "Post upvote removed"
              : "Downvote removed and post upvoted",
        post: updatedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id: postId } = await context.params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await postReadRepository.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingVote = await voteReadRepository.findByUserTarget(user.id, "post", postId);

    if (!existingVote) {
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "post",
        targetId: postId,
        value: -1,
        createdAt: Date.now(),
      });

      await postWriteRepository.decrementScore(postId);
    } else if (existingVote.value === -1) {
      await voteWriteRepository.deleteByUserTarget(user.id, "post", postId);
      await postWriteRepository.incrementScore(postId);
    } else {
      await voteWriteRepository.deleteByUserTarget(user.id, "post", postId);
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "post",
        targetId: postId,
        value: -1,
        createdAt: Date.now(),
      });

      await postWriteRepository.decrementScore(postId);
      await postWriteRepository.decrementScore(postId);
    }

    const updatedPost = await postReadRepository.findById(postId);

    return NextResponse.json(
      {
        message:
          !existingVote
            ? "Post downvoted successfully"
            : existingVote.value === -1
              ? "Post downvote removed"
              : "Upvote removed and post downvoted",
        post: updatedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
