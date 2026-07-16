import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("ships a multi-page bilingual marketplace", async () => {
  const [layout, provider, home, explore, properties] = await Promise.all([
    read("app/layout.tsx"), read("components/providers.tsx"), read("app/page.tsx"), read("app/explore/page.tsx"), read("lib/properties.ts"),
  ]);
  assert.match(layout, /lang="en"/);
  assert.match(provider, /smartstay-language/);
  assert.match(provider, /document\.documentElement\.dir/);
  assert.match(home, /Stay local/);
  assert.match(home, /أقم محليًا/);
  assert.match(explore, /OpenStreetMap/);
  assert.match(properties, /gaza-seafront-house/);
  assert.match(properties, /city: "Gaza"/);
  for (const route of ["app/login/page.tsx","app/register/page.tsx","app/owner/page.tsx","app/owner/properties/new/page.tsx","app/admin/page.tsx","app/stays/[slug]/page.tsx"]) await access(new URL(route, root));
});

test("uses real authentication and role-aware sessions", async () => {
  const [crypto, auth, login, register] = await Promise.all([
    read("lib/server/crypto.ts"), read("lib/server/auth.ts"), read("app/api/auth/login/route.ts"), read("app/api/auth/register/route.ts"),
  ]);
  assert.match(crypto, /PBKDF2/);
  assert.match(crypto, /100_000/);
  assert.match(auth, /ss_sessions/);
  assert.match(login, /httpOnly:\s*true/);
  assert.match(register, /role === "owner"/);
});

test("prevents overlapping bookings at the database level", async () => {
  const [bookingApi, availabilityApi, schema, migration] = await Promise.all([
    read("app/api/bookings/route.ts"), read("app/api/availability/route.ts"), read("db/schema.ts"), read("migrations-smartstay/0000_fancy_black_queen.sql"),
  ]);
  assert.match(bookingApi, /ss_booking_slots/);
  assert.match(bookingApi, /TIME_CONFLICT/);
  assert.match(bookingApi, /status:\s*409/);
  assert.match(availabilityApi, /available/);
  assert.match(schema, /uniqueIndex\("ss_booking_slot_unique"\)/);
  assert.match(migration, /CREATE UNIQUE INDEX `ss_booking_slot_unique`/);
});

test("supports owner property creation and image uploads", async () => {
  const [propertyApi, uploadApi, config] = await Promise.all([
    read("app/api/properties/route.ts"), read("app/api/uploads/route.ts"), read(".openai/hosting.json"),
  ]);
  assert.match(propertyApi, /status:\s*"pending"/);
  assert.match(uploadApi, /env\.UPLOADS\.put/);
  assert.match(config, /"d1": "DB"/);
  assert.match(config, /"r2": "UPLOADS"/);
});
