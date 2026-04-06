import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  commentReadRepository,
  commentWriteRepository,
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
    const { id: commentId } = await context.params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await commentReadRepository.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.status !== "normal") {
      return NextResponse.json(
        { error: "This comment cannot be upvoted" },
        { status: 400 }
      );
    }

    const existingVote = await voteReadRepository.findByUserTarget(
      user.id,
      "comment",
      commentId
    );

    if (!existingVote) {
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "comment",
        targetId: commentId,
        value: 1,
        createdAt: Date.now(),
      });

      await commentWriteRepository.incrementScore(commentId);
    } else if (existingVote.value === 1) {
      await voteWriteRepository.deleteByUserTarget(user.id, "comment", commentId);
      await commentWriteRepository.decrementScore(commentId);
    } else {
      await voteWriteRepository.deleteByUserTarget(user.id, "comment", commentId);
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "comment",
        targetId: commentId,
        value: 1,
        createdAt: Date.now(),
      });

      await commentWriteRepository.incrementScore(commentId);
      await commentWriteRepository.incrementScore(commentId);
    }

    const updatedComment = await commentReadRepository.findById(commentId);

    return NextResponse.json(
      {
        message:
          !existingVote
            ? "Comment upvoted successfully"
            : existingVote.value === 1
              ? "Comment upvote removed"
              : "Downvote removed and comment upvoted",
        comment: updatedComment,
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
    const { id: commentId } = await context.params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await commentReadRepository.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const existingVote = await voteReadRepository.findByUserTarget(
      user.id,
      "comment",
      commentId
    );

    if (!existingVote) {
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "comment",
        targetId: commentId,
        value: -1,
        createdAt: Date.now(),
      });

      await commentWriteRepository.decrementScore(commentId);
    } else if (existingVote.value === -1) {
      await voteWriteRepository.deleteByUserTarget(user.id, "comment", commentId);
      await commentWriteRepository.incrementScore(commentId);
    } else {
      await voteWriteRepository.deleteByUserTarget(user.id, "comment", commentId);
      await voteWriteRepository.create({
        id: randomUUID(),
        userId: user.id,
        targetType: "comment",
        targetId: commentId,
        value: -1,
        createdAt: Date.now(),
      });

      await commentWriteRepository.decrementScore(commentId);
      await commentWriteRepository.decrementScore(commentId);
    }

    const updatedComment = await commentReadRepository.findById(commentId);

    return NextResponse.json(
      {
        message:
          !existingVote
            ? "Comment downvoted successfully"
            : existingVote.value === -1
              ? "Comment downvote removed"
              : "Upvote removed and comment downvoted",
        comment: updatedComment,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
