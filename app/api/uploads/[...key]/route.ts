import { getDatabase } from "@/lib/server/db";

export async function GET(_: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const db = await getDatabase();
  const object = await db.prepare("SELECT content_type, data FROM ss_uploads WHERE object_key = ? LIMIT 1")
    .bind(key.join("/"))
    .first<{ content_type: string; data: ArrayBuffer }>();
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.data, {
    headers: {
      "content-type": object.content_type,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
