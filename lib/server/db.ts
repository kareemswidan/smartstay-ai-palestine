import { env } from "cloudflare:workers";
import { stays } from "@/lib/properties";
import { hashPassword, randomToken } from "./crypto";

let ready: Promise<D1Database> | null = null;

const statements = [
  `CREATE TABLE IF NOT EXISTS ss_users (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('customer','owner','admin')), phone TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS ss_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES ss_users(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS ss_sessions_token_idx ON ss_sessions(token_hash)`,
  `CREATE TABLE IF NOT EXISTS ss_properties (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER NOT NULL, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, name_ar TEXT, type TEXT NOT NULL, city TEXT NOT NULL, city_ar TEXT, area TEXT, area_ar TEXT, address TEXT, description TEXT, description_ar TEXT, price REAL NOT NULL, cleaning_fee REAL NOT NULL DEFAULT 0, capacity INTEGER NOT NULL, bedrooms INTEGER NOT NULL DEFAULT 1, bathrooms INTEGER NOT NULL DEFAULT 1, latitude REAL, longitude REAL, status TEXT NOT NULL DEFAULT 'pending', instant_book INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(owner_id) REFERENCES ss_users(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS ss_properties_owner_idx ON ss_properties(owner_id)`,
  `CREATE INDEX IF NOT EXISTS ss_properties_city_idx ON ss_properties(city)`,
  `CREATE TABLE IF NOT EXISTS ss_property_images (id INTEGER PRIMARY KEY AUTOINCREMENT, property_id INTEGER NOT NULL, url TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(property_id) REFERENCES ss_properties(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS ss_property_amenities (property_id INTEGER NOT NULL, amenity TEXT NOT NULL, PRIMARY KEY(property_id, amenity), FOREIGN KEY(property_id) REFERENCES ss_properties(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS ss_bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, booking_code TEXT NOT NULL UNIQUE, property_id INTEGER NOT NULL, user_id INTEGER, guest_name TEXT NOT NULL, guest_email TEXT NOT NULL, guest_phone TEXT, start_at TEXT NOT NULL, end_at TEXT NOT NULL, guests INTEGER NOT NULL, subtotal REAL NOT NULL, service_fee REAL NOT NULL, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', payment_status TEXT NOT NULL DEFAULT 'demo', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(property_id) REFERENCES ss_properties(id), FOREIGN KEY(user_id) REFERENCES ss_users(id))`,
  `CREATE INDEX IF NOT EXISTS ss_bookings_property_idx ON ss_bookings(property_id)`,
  `CREATE INDEX IF NOT EXISTS ss_bookings_user_idx ON ss_bookings(user_id)`,
  `CREATE TABLE IF NOT EXISTS ss_booking_slots (id INTEGER PRIMARY KEY AUTOINCREMENT, booking_id INTEGER NOT NULL, property_id INTEGER NOT NULL, slot_key TEXT NOT NULL, UNIQUE(property_id, slot_key), FOREIGN KEY(booking_id) REFERENCES ss_bookings(id) ON DELETE CASCADE, FOREIGN KEY(property_id) REFERENCES ss_properties(id))`,
  `CREATE INDEX IF NOT EXISTS ss_booking_slots_lookup_idx ON ss_booking_slots(property_id, slot_key)`,
  `CREATE TABLE IF NOT EXISTS ss_reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, property_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL, comment TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(property_id, user_id), FOREIGN KEY(property_id) REFERENCES ss_properties(id), FOREIGN KEY(user_id) REFERENCES ss_users(id))`,
  `CREATE TABLE IF NOT EXISTS ss_favorites (user_id INTEGER NOT NULL, property_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, property_id), FOREIGN KEY(user_id) REFERENCES ss_users(id) ON DELETE CASCADE, FOREIGN KEY(property_id) REFERENCES ss_properties(id) ON DELETE CASCADE)`,
];

async function seedUsers(db: D1Database) {
  const existing = await db.prepare("SELECT COUNT(*) AS count FROM ss_users").first<{ count: number }>();
  if (Number(existing?.count ?? 0) > 0) return;
  const demos = [
    ["Maya Khalil", "guest@smartstay.ps", "Guest123!", "customer"],
    ["Omar Nassar", "owner@smartstay.ps", "Owner123!", "owner"],
    ["SmartStay Admin", "admin@smartstay.ps", "Admin123!", "admin"],
  ];
  for (const [name, email, password, role] of demos) {
    const salt = randomToken(16);
    const hash = await hashPassword(password, salt);
    await db.prepare("INSERT INTO ss_users (full_name, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)").bind(name, email, hash, salt, role).run();
  }
}

async function seedProperties(db: D1Database) {
  const owner = await db.prepare("SELECT id FROM ss_users WHERE role = 'owner' LIMIT 1").first<{ id: number }>();
  if (!owner) return;
  for (const stay of stays) {
    const existing = await db.prepare("SELECT id FROM ss_properties WHERE id = ? OR slug = ? LIMIT 1").bind(stay.id, stay.slug).first();
    if (existing) continue;
    await db.prepare(`INSERT INTO ss_properties (id, owner_id, slug, name, name_ar, type, city, city_ar, area, area_ar, description, description_ar, price, capacity, bedrooms, bathrooms, latitude, longitude, status, instant_book, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, 1)`)
      .bind(stay.id, owner.id, stay.slug, stay.name, stay.nameAr, stay.type, stay.city, stay.cityAr, stay.area, stay.areaAr, stay.description, stay.descriptionAr, stay.price, stay.guests, stay.bedrooms, stay.bathrooms, stay.latitude, stay.longitude, stay.instant ? 1 : 0).run();
    await db.batch([
      db.prepare("INSERT INTO ss_property_images (property_id, url, sort_order) VALUES (?, ?, 0)").bind(stay.id, stay.image),
      ...stay.gallery.map((image, index) => db.prepare("INSERT INTO ss_property_images (property_id, url, sort_order) VALUES (?, ?, ?)").bind(stay.id, image, index + 1)),
      ...stay.amenities.map((amenity) => db.prepare("INSERT INTO ss_property_amenities (property_id, amenity) VALUES (?, ?)").bind(stay.id, amenity)),
    ]);
  }
}

export async function getDatabase() {
  if (!ready) {
    ready = (async () => {
      const db = env.DB;
      if (!db) throw new Error("D1 binding DB is not configured");
      await db.batch(statements.map((sql) => db.prepare(sql)));
      await seedUsers(db);
      await seedProperties(db);
      return db;
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
