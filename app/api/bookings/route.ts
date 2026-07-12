import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";

function slotKeys(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) throw new Error("INVALID_RANGE");
  if (end.getTime() - start.getTime() > 1000 * 60 * 60 * 24 * 14) throw new Error("RANGE_TOO_LONG");
  const cursor = new Date(start);
  cursor.setMinutes(0, 0, 0);
  const keys: string[] = [];
  while (cursor < end) { keys.push(cursor.toISOString().slice(0, 13)); cursor.setHours(cursor.getHours() + 1); }
  return keys;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const db = await getDatabase();
  const url = new URL(request.url);
  const propertyId = Number(url.searchParams.get("propertyId") || 0);
  if (user.role === "owner") {
    const query = propertyId
      ? db.prepare(`SELECT b.*, p.name AS property_name FROM ss_bookings b JOIN ss_properties p ON p.id = b.property_id WHERE p.owner_id = ? AND b.property_id = ? ORDER BY b.created_at DESC`).bind(user.id, propertyId)
      : db.prepare(`SELECT b.*, p.name AS property_name FROM ss_bookings b JOIN ss_properties p ON p.id = b.property_id WHERE p.owner_id = ? ORDER BY b.created_at DESC`).bind(user.id);
    return NextResponse.json({ bookings: (await query.all()).results });
  }
  if (user.role === "admin") return NextResponse.json({ bookings: (await db.prepare(`SELECT b.*, p.name AS property_name FROM ss_bookings b JOIN ss_properties p ON p.id = b.property_id ORDER BY b.created_at DESC LIMIT 200`).all()).results });
  return NextResponse.json({ bookings: (await db.prepare(`SELECT b.*, p.name AS property_name, i.url AS image FROM ss_bookings b JOIN ss_properties p ON p.id = b.property_id LEFT JOIN ss_property_images i ON i.property_id = p.id AND i.sort_order = 0 WHERE b.user_id = ? ORDER BY b.created_at DESC`).bind(user.id).all()).results });
}

export async function POST(request: Request) {
  const body = await request.json() as { propertyId?: number; guestName?: string; email?: string; phone?: string; startAt?: string; endAt?: string; guests?: number };
  if (!body.propertyId || !body.guestName || !body.email || !body.startAt || !body.endAt) return NextResponse.json({ error: "Complete all booking details." }, { status: 422 });
  let slots: string[];
  try { slots = slotKeys(body.startAt, body.endAt); }
  catch (error) { return NextResponse.json({ error: error instanceof Error && error.message === "RANGE_TOO_LONG" ? "A single booking can cover up to 14 days." : "Choose a valid arrival and departure time." }, { status: 422 }); }
  const db = await getDatabase();
  const property = await db.prepare("SELECT id, price, cleaning_fee, status FROM ss_properties WHERE id = ?").bind(body.propertyId).first<{ id: number; price: number; cleaning_fee: number; status: string }>();
  if (!property || property.status !== "approved") return NextResponse.json({ error: "This stay is not available." }, { status: 404 });
  const placeholders = slots.map(() => "?").join(",");
  const conflict = await db.prepare(`SELECT slot_key FROM ss_booking_slots WHERE property_id = ? AND slot_key IN (${placeholders}) LIMIT 1`).bind(property.id, ...slots).first();
  if (conflict) return NextResponse.json({ error: "Those dates and times were just booked. Please choose another slot.", code: "TIME_CONFLICT" }, { status: 409 });
  const user = await getCurrentUser();
  const hours = Math.max(1, (new Date(body.endAt).getTime() - new Date(body.startAt).getTime()) / 3_600_000);
  const nights = Math.max(1, Math.ceil(hours / 24));
  const subtotal = property.price * nights + property.cleaning_fee;
  const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + serviceFee;
  const bookingCode = `PS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const result = await db.prepare(`INSERT INTO ss_bookings (booking_code, property_id, user_id, guest_name, guest_email, guest_phone, start_at, end_at, guests, subtotal, service_fee, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(bookingCode, property.id, user?.id ?? null, body.guestName.trim(), body.email.trim().toLowerCase(), body.phone ?? null, new Date(body.startAt).toISOString(), new Date(body.endAt).toISOString(), Math.max(1, Number(body.guests ?? 1)), subtotal, serviceFee, total).run();
  const bookingId = Number(result.meta.last_row_id);
  try {
    await db.batch(slots.map((slot) => db.prepare("INSERT INTO ss_booking_slots (booking_id, property_id, slot_key) VALUES (?, ?, ?)").bind(bookingId, property.id, slot)));
  } catch {
    await db.prepare("DELETE FROM ss_bookings WHERE id = ?").bind(bookingId).run();
    return NextResponse.json({ error: "Those dates and times were just booked. Please choose another slot.", code: "TIME_CONFLICT" }, { status: 409 });
  }
  return NextResponse.json({ ok: true, bookingCode, total }, { status: 201 });
}
