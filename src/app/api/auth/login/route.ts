import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "../../../../infrastructure/container";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await authService.login(
      String(body.username ?? ""),
      String(body.password ?? "")
    );

    const cookieStore = await cookies();

    cookieStore.set("session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor((session.expiresAt - Date.now()) / 1000)
    });

    return NextResponse.json({ userId: session.userId }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}