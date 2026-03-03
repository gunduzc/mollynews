import { NextResponse } from "next/server";
import { authService } from "../../../../infrastructure/container";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await authService.register(String(body.username ?? ""), String(body.password ?? ""));
    return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
