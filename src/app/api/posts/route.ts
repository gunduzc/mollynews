import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  postReadRepository,
  submitPostService,
} from "../../../infrastructure/container";

export const runtime = "nodejs";

export async function GET() {
  try {
    const posts = await postReadRepository.listVisible(20);
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await submitPostService.submit({
      ...body,
      authorId: user.id,
    });

    return NextResponse.json({ success: true, post: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Post could not be created";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
