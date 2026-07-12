import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = await getDatabase();
  const property = await db.prepare("SELECT * FROM ss_properties WHERE id = ? OR slug = ?").bind(Number(id) || -1, id).first();
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  const images = (await db.prepare("SELECT url FROM ss_property_images WHERE property_id = ? ORDER BY sort_order").bind((property as { id: number }).id).all()).results;
  const amenities = (await db.prepare("SELECT amenity FROM ss_property_amenities WHERE property_id = ?").bind((property as { id: number }).id).all()).results;
  return NextResponse.json({ property, images, amenities });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["owner", "admin"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const db = await getDatabase();
  const property = await db.prepare("SELECT owner_id FROM ss_properties WHERE id = ?").bind(Number(id)).first<{ owner_id: number }>();
  if (!property || (user.role !== "admin" && property.owner_id !== user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as { status?: string; price?: number; name?: string; description?: string };
  if (user.role === "admin" && body.status) await db.prepare("UPDATE ss_properties SET status = ? WHERE id = ?").bind(body.status, Number(id)).run();
  if (body.price) await db.prepare("UPDATE ss_properties SET price = ? WHERE id = ?").bind(Number(body.price), Number(id)).run();
  if (body.name) await db.prepare("UPDATE ss_properties SET name = ? WHERE id = ?").bind(body.name, Number(id)).run();
  if (body.description) await db.prepare("UPDATE ss_properties SET description = ? WHERE id = ?").bind(body.description, Number(id)).run();
  return NextResponse.json({ ok: true });
}
