import { getDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  try {
    const db = await getDatabase();
    const result = await db.prepare("SELECT COUNT(*) AS users FROM ss_users").first<{ users: number }>();
    return <main><h1>SmartStay backend ready</h1><p>Users: {Number(result?.users ?? 0)}</p></main>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return <main><h1>SmartStay backend unavailable</h1><pre>{message}</pre></main>;
  }
}
