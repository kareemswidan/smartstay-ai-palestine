import { env } from "cloudflare:workers";

export async function GET(_: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  if (!env.UPLOADS) return new Response("Storage unavailable", { status: 503 });
  const object = await env.UPLOADS.get(key.join("/"));
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}
