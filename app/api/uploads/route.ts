import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/db";

const MAX_UPLOAD_BYTES = 1536 * 1024;

export async function POST(request: Request) {
  const user = await requireRole(["owner", "admin"]);
  if (!user) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image" }, { status: 422 });
  if (!file.type.startsWith("image/") || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Images only, maximum 1.5 MB" }, { status: 422 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const key = `owners/${user.id}/${crypto.randomUUID()}.${extension}`;
  const db = await getDatabase();
  await db.prepare("INSERT INTO ss_uploads (object_key, owner_id, content_type, original_name, data) VALUES (?, ?, ?, ?, ?)")
    .bind(key, user.id, file.type, file.name, await file.arrayBuffer())
    .run();
  return NextResponse.json({ url: `/api/uploads/${encodeURIComponent(key)}`, key }, { status: 201 });
}
