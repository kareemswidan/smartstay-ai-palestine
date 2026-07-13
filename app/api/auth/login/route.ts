import { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, verifyCredentials } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    if (!body.email || !body.password) return NextResponse.json({ error: "Email and password are required." }, { status: 422 });
    const user = await verifyCredentials(body.email, body.password);
    if (!user) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    const session = await createSession(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, session.token, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", expires: new Date(session.expiresAt) });
    return response;
  } catch (error) {
    console.error("SmartStay login failed", error);
    return NextResponse.json({ error: "The sign-in service is starting up. Please try again." }, { status: 500 });
  }
}
