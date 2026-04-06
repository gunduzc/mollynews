import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  commentTreeService,
  postReadRepository,
  commentReadRepository,
  commentWriteRepository,
  voteReadRepository,
} from "../../../../../infrastructure/container";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id: postId } = await context.params;

    const post = await postReadRepository.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await commentReadRepository.findByPostId(postId);
    const thread = commentTreeService.buildThread(comments);
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    const user = sessionToken
      ? await authService.getUserBySessionToken(sessionToken)
      : null;
    const voteMap = user
      ? await voteReadRepository.findValuesByUserTargets(
          user.id,
          "comment",
          comments.map((comment) => comment.id)
        )
      : {};

    function applyVotes(nodes: typeof thread): typeof thread {
      return nodes.map((node) => ({
        ...node,
        currentUserVote: voteMap[node.id] ?? 0,
        children: applyVotes(node.children),
      }));
    }

    return NextResponse.json(
      { comments, thread: applyVotes(thread), totalComments: comments.length },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, context: RouteContext) {
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

    const body = await request.json();
    const content = String(body.content ?? "").trim();
    const parentCommentId = body.parentCommentId
      ? String(body.parentCommentId)
      : null;

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (parentCommentId) {
      const parentComment = await commentReadRepository.findById(parentCommentId);

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: "Invalid parent comment" },
          { status: 400 }
        );
      }
    }

    const comment = await commentWriteRepository.create({
      id: randomUUID(),
      postId,
      authorId: user.id,
      parentCommentId,
      content,
      createdAt: Date.now(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
