import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authService,
  moderationService,
} from "../../../../../infrastructure/container";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

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
    const action = String(body.action ?? "");

    if (!["hide", "remove", "restore"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid moderation action" },
        { status: 400 }
      );
    }

    const result = await moderationService.moderateComment(
      id,
      action as "hide" | "remove" | "restore"
    );

    if ("deleted" in result) {
      return NextResponse.json({ deleted: true }, { status: 200 });
    }

    return NextResponse.json({ comment: result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";

    if (message === "Comment not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
