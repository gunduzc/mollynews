import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  commentService,
  commentTreeService,
  postReadRepository,
  commentReadRepository,
  userReadRepository,
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
    const authorEntries = await Promise.all(
      comments.map(async (comment) => [
        comment.authorId,
        (await userReadRepository.findById(comment.authorId))?.username ?? "unknown",
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
          "comment",
          comments.map((comment) => comment.id)
        )
      : {};

    function applyVotes(nodes: typeof thread): typeof thread {
      return nodes.map((node) => ({
        ...node,
        authorUsername: authorMap[node.authorId] ?? "unknown",
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

    const body = await request.json();
    const content = String(body.content ?? "");
    const parentCommentId = body.parentCommentId
      ? String(body.parentCommentId)
      : null;
    const comment = await commentService.addComment({
      postId,
      authorId: user.id,
      content,
      parentCommentId,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    if (message === "Post not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
