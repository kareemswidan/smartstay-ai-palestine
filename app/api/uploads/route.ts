import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";

export async function POST(request: Request) {
  const user = await requireRole(["owner", "admin"]);
  if (!user) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  if (!env.UPLOADS) return NextResponse.json({ error: "Upload storage is not configured" }, { status: 503 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image" }, { status: 422 });
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Images only, maximum 8 MB" }, { status: 422 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const key = `owners/${user.id}/${crypto.randomUUID()}.${extension}`;
  await env.UPLOADS.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { ownerId: String(user.id), originalName: file.name } });
  return NextResponse.json({ url: `/api/uploads/${encodeURIComponent(key)}`, key }, { status: 201 });
}
