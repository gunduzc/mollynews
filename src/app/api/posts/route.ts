import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService, submitPostService, postReadRepository } from "../../../infrastructure/container";
import { PostType } from "../../../domain/entities/Post";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionToken = cookies().get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await submitPostService.submit({
      title: String(body.title ?? ""),
      type: body.type as PostType,
      url: body.url ? String(body.url) : undefined,
      text: body.text ? String(body.text) : undefined,
      authorId: user.id
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  const posts = await postReadRepository.listLatest(20);
  return NextResponse.json({ posts });
}
