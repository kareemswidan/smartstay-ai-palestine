import { NextResponse } from "next/server";
import { deleteCurrentSession, SESSION_COOKIE } from "@/lib/server/auth";

export async function POST() {
  await deleteCurrentSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", expires: new Date(0) });
  return response;
}
