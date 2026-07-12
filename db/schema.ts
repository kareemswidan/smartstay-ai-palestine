import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("ss_users", {
  id: integer("id").primaryKey({ autoIncrement: true }), fullName: text("full_name").notNull(), email: text("email").notNull().unique(), passwordHash: text("password_hash").notNull(), passwordSalt: text("password_salt").notNull(), role: text("role", { enum: ["customer","owner","admin"] }).notNull(), phone: text("phone"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("ss_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }), userId: integer("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}), tokenHash: text("token_hash").notNull().unique(), expiresAt: text("expires_at").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [index("ss_sessions_token_idx").on(table.tokenHash)]);

export const properties = sqliteTable("ss_properties", {
  id: integer("id").primaryKey({ autoIncrement: true }), ownerId: integer("owner_id").notNull().references(()=>users.id,{onDelete:"cascade"}), slug: text("slug").notNull().unique(), name: text("name").notNull(), nameAr: text("name_ar"), type: text("type").notNull(), city: text("city").notNull(), cityAr: text("city_ar"), area: text("area"), areaAr: text("area_ar"), address: text("address"), description: text("description"), descriptionAr: text("description_ar"), price: real("price").notNull(), cleaningFee: real("cleaning_fee").notNull().default(0), capacity: integer("capacity").notNull(), bedrooms: integer("bedrooms").notNull().default(1), bathrooms: integer("bathrooms").notNull().default(1), latitude: real("latitude"), longitude: real("longitude"), status: text("status",{enum:["pending","approved","rejected"]}).notNull().default("pending"), instantBook: integer("instant_book",{mode:"boolean"}).notNull().default(false), featured: integer("featured",{mode:"boolean"}).notNull().default(false), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [index("ss_properties_owner_idx").on(table.ownerId),index("ss_properties_city_idx").on(table.city)]);

export const propertyImages = sqliteTable("ss_property_images", { id: integer("id").primaryKey({autoIncrement:true}), propertyId: integer("property_id").notNull().references(()=>properties.id,{onDelete:"cascade"}), url: text("url").notNull(), sortOrder: integer("sort_order").notNull().default(0) });
export const propertyAmenities = sqliteTable("ss_property_amenities", { propertyId: integer("property_id").notNull().references(()=>properties.id,{onDelete:"cascade"}), amenity: text("amenity").notNull() }, table => [uniqueIndex("ss_property_amenity_unique").on(table.propertyId,table.amenity)]);

export const bookings = sqliteTable("ss_bookings", {
  id: integer("id").primaryKey({autoIncrement:true}), bookingCode: text("booking_code").notNull().unique(), propertyId: integer("property_id").notNull().references(()=>properties.id), userId: integer("user_id").references(()=>users.id), guestName: text("guest_name").notNull(), guestEmail: text("guest_email").notNull(), guestPhone: text("guest_phone"), startAt: text("start_at").notNull(), endAt: text("end_at").notNull(), guests: integer("guests").notNull(), subtotal: real("subtotal").notNull(), serviceFee: real("service_fee").notNull(), total: real("total").notNull(), status: text("status").notNull().default("confirmed"), paymentStatus: text("payment_status").notNull().default("demo"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [index("ss_bookings_property_idx").on(table.propertyId),index("ss_bookings_user_idx").on(table.userId)]);

export const bookingSlots = sqliteTable("ss_booking_slots", { id:integer("id").primaryKey({autoIncrement:true}), bookingId:integer("booking_id").notNull().references(()=>bookings.id,{onDelete:"cascade"}), propertyId:integer("property_id").notNull().references(()=>properties.id), slotKey:text("slot_key").notNull() }, table => [uniqueIndex("ss_booking_slot_unique").on(table.propertyId,table.slotKey),index("ss_booking_slots_lookup_idx").on(table.propertyId,table.slotKey)]);

export const reviews = sqliteTable("ss_reviews", { id:integer("id").primaryKey({autoIncrement:true}), propertyId:integer("property_id").notNull().references(()=>properties.id), userId:integer("user_id").notNull().references(()=>users.id), rating:integer("rating").notNull(), comment:text("comment"), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`) }, table => [uniqueIndex("ss_review_unique").on(table.propertyId,table.userId)]);
export const favorites = sqliteTable("ss_favorites", { userId:integer("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}), propertyId:integer("property_id").notNull().references(()=>properties.id,{onDelete:"cascade"}), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`) }, table => [uniqueIndex("ss_favorite_unique").on(table.userId,table.propertyId)]);
