import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "../../../../infrastructure/container";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    await authService.logout(sessionToken);
  }

  cookieStore.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}