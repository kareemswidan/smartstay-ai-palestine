import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const propertyId = Number(url.searchParams.get("propertyId"));
  const start = new Date(url.searchParams.get("startAt") || "");
  const end = new Date(url.searchParams.get("endAt") || "");
  if (!propertyId || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return NextResponse.json({ error: "Invalid date range" }, { status: 422 });
  const keys: string[] = [];
  const cursor = new Date(start); cursor.setMinutes(0, 0, 0);
  while (cursor < end && keys.length < 337) { keys.push(cursor.toISOString().slice(0, 13)); cursor.setHours(cursor.getHours() + 1); }
  const db = await getDatabase();
  const placeholders = keys.map(() => "?").join(",");
  const row = await db.prepare(`SELECT COUNT(*) AS count FROM ss_booking_slots WHERE property_id = ? AND slot_key IN (${placeholders})`).bind(propertyId, ...keys).first<{ count: number }>();
  return NextResponse.json({ available: Number(row?.count ?? 0) === 0, conflicts: Number(row?.count ?? 0) });
}
