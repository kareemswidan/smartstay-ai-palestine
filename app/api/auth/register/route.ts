import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";
import { createSession, createUser, SESSION_COOKIE } from "@/lib/server/auth";

export async function POST(request: Request) {
  const body = await request.json() as { name?: string; email?: string; password?: string; role?: UserRole; phone?: string };
  if (!body.name || !body.email || !body.password || body.password.length < 8) return NextResponse.json({ error: "Please complete all fields. Password must be at least 8 characters." }, { status: 422 });
  const role: UserRole = body.role === "owner" ? "owner" : "customer";
  try {
    const user = await createUser({ name: body.name, email: body.email, password: body.password, role, phone: body.phone });
    const session = await createSession(user.id);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, session.token, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", expires: new Date(session.expiresAt) });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }
}
