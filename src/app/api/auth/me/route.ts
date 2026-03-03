import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "../../../../infrastructure/container";

export const runtime = "nodejs";

export async function GET() {
  const sessionToken = cookies().get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await authService.getUserBySessionToken(sessionToken);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: { id: user.id, username: user.username } }, { status: 200 });
}
