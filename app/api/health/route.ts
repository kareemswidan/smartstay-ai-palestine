import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server/db";

export async function GET() {
  try {
    const db = await getDatabase();
    const result = await db.prepare("SELECT COUNT(*) AS users FROM ss_users").first<{ users: number }>();
    return NextResponse.json({ ok: true, database: "ready", users: Number(result?.users ?? 0) });
  } catch (error) {
    console.error("SmartStay health check failed", error);
    return NextResponse.json({ ok: false, database: "unavailable" }, { status: 500 });
  }
}
