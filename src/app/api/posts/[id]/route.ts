import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  postReadRepository,
  voteReadRepository,
} from "../../../../infrastructure/container";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const post = await postReadRepository.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    const user = sessionToken
      ? await authService.getUserBySessionToken(sessionToken)
      : null;

    const vote = user
      ? await voteReadRepository.findByUserTarget(user.id, "post", id)
      : null;

    return NextResponse.json(
      { post: { ...post, currentUserVote: vote?.value ?? 0 } },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
