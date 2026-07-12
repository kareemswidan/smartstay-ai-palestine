import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";

export async function GET(request: Request) {
  const db = await getDatabase();
  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "1";
  const user = mine ? await getCurrentUser() : null;
  if (mine && (!user || user.role !== "owner")) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const city = url.searchParams.get("city");
  const type = url.searchParams.get("type");
  const clauses = mine ? ["p.owner_id = ?"] : ["p.status = 'approved'"];
  const values: unknown[] = mine && user ? [user.id] : [];
  if (city) { clauses.push("LOWER(p.city) = LOWER(?)"); values.push(city); }
  if (type) { clauses.push("LOWER(p.type) = LOWER(?)"); values.push(type); }
  const result = await db.prepare(`SELECT p.*, (SELECT url FROM ss_property_images WHERE property_id = p.id ORDER BY sort_order LIMIT 1) AS image, (SELECT COUNT(*) FROM ss_bookings WHERE property_id = p.id) AS booking_count FROM ss_properties p WHERE ${clauses.join(" AND ")} ORDER BY p.featured DESC, p.created_at DESC`).bind(...values).all();
  return NextResponse.json({ properties: result.results });
}

export async function POST(request: Request) {
  const user = await requireRole(["owner", "admin"]);
  if (!user) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const body = await request.json() as { name?: string; nameAr?: string; type?: string; city?: string; cityAr?: string; area?: string; areaAr?: string; address?: string; description?: string; descriptionAr?: string; price?: number; cleaningFee?: number; capacity?: number; bedrooms?: number; bathrooms?: number; latitude?: number; longitude?: number; instantBook?: boolean; images?: string[]; amenities?: string[] };
  if (!body.name || !body.type || !body.city || !body.price || !body.capacity) return NextResponse.json({ error: "Name, type, city, price and capacity are required." }, { status: 422 });
  const db = await getDatabase();
  const slugBase = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "stay";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`;
  const result = await db.prepare(`INSERT INTO ss_properties (owner_id, slug, name, name_ar, type, city, city_ar, area, area_ar, address, description, description_ar, price, cleaning_fee, capacity, bedrooms, bathrooms, latitude, longitude, status, instant_book) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
    .bind(user.id, slug, body.name.trim(), body.nameAr ?? null, body.type, body.city, body.cityAr ?? null, body.area ?? null, body.areaAr ?? null, body.address ?? null, body.description ?? null, body.descriptionAr ?? null, Number(body.price), Number(body.cleaningFee ?? 0), Number(body.capacity), Number(body.bedrooms ?? 1), Number(body.bathrooms ?? 1), body.latitude ?? null, body.longitude ?? null, body.instantBook ? 1 : 0).run();
  const propertyId = Number(result.meta.last_row_id);
  for (let index = 0; index < (body.images ?? []).length; index++) await db.prepare("INSERT INTO ss_property_images (property_id, url, sort_order) VALUES (?, ?, ?)").bind(propertyId, body.images![index], index).run();
  for (const amenity of body.amenities ?? []) await db.prepare("INSERT OR IGNORE INTO ss_property_amenities (property_id, amenity) VALUES (?, ?)").bind(propertyId, amenity).run();
  return NextResponse.json({ ok: true, id: propertyId, slug, status: "pending" }, { status: 201 });
}
