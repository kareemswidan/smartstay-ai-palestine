import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";

export async function GET() {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const db = await getDatabase();
  const [users,properties,bookings,revenue,pending,recentUsers] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS value FROM ss_users").first<{value:number}>(),
    db.prepare("SELECT COUNT(*) AS value FROM ss_properties").first<{value:number}>(),
    db.prepare("SELECT COUNT(*) AS value FROM ss_bookings").first<{value:number}>(),
    db.prepare("SELECT COALESCE(SUM(total),0) AS value FROM ss_bookings").first<{value:number}>(),
    db.prepare("SELECT p.*,u.full_name AS owner_name,(SELECT url FROM ss_property_images WHERE property_id=p.id ORDER BY sort_order LIMIT 1) AS image FROM ss_properties p JOIN ss_users u ON u.id=p.owner_id WHERE p.status='pending' ORDER BY p.created_at DESC").all(),
    db.prepare("SELECT id,full_name,email,role,created_at FROM ss_users ORDER BY created_at DESC LIMIT 100").all(),
  ]);
  return NextResponse.json({ metrics:{users:Number(users?.value||0),properties:Number(properties?.value||0),bookings:Number(bookings?.value||0),revenue:Number(revenue?.value||0)},pending:pending.results,users:recentUsers.results });
}
