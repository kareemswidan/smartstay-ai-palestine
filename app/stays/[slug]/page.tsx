import { notFound } from "next/navigation";
import { BookingCard } from "@/components/booking-card";
import { findStay } from "@/lib/properties";
import { getDatabase } from "@/lib/server/db";
import type { Stay } from "@/lib/types";
import { StayPageClient } from "./stay-page-client";

async function loadStay(slug: string): Promise<Stay | null> {
  const local = findStay(slug);
  if (local) return local;
  try {
    const db = await getDatabase();
    const row = await db.prepare("SELECT * FROM ss_properties WHERE (slug = ? OR id = ?) AND status = 'approved'").bind(slug, Number(slug) || -1).first<Record<string, unknown>>();
    if (!row) return null;
    const images = (await db.prepare("SELECT url FROM ss_property_images WHERE property_id = ? ORDER BY sort_order").bind(row.id).all<{url:string}>()).results.map((item)=>item.url);
    const amenities = (await db.prepare("SELECT amenity FROM ss_property_amenities WHERE property_id = ?").bind(row.id).all<{amenity:string}>()).results.map((item)=>item.amenity);
    return { id:Number(row.id), slug:String(row.slug), name:String(row.name), nameAr:String(row.name_ar||row.name), type:String(row.type), typeAr:String(row.type), city:String(row.city), cityAr:String(row.city_ar||row.city), area:String(row.area||"Palestine"), areaAr:String(row.area_ar||"فلسطين"), price:Number(row.price), rating:5, reviews:0, guests:Number(row.capacity), bedrooms:Number(row.bedrooms), bathrooms:Number(row.bathrooms), image:images[0]||"", gallery:images.slice(1), amenities, amenitiesAr:amenities, description:String(row.description||"A new local stay."), descriptionAr:String(row.description_ar||row.description||"إقامة محلية جديدة."), badge:"New stay", badgeAr:"إقامة جديدة", instant:Boolean(row.instant_book), latitude:Number(row.latitude||31.9), longitude:Number(row.longitude||35.2) };
  } catch { return null; }
}

export default async function StayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stay = await loadStay(slug);
  if (!stay) notFound();
  return <StayPageClient stay={stay} booking={<BookingCard propertyId={stay.id} price={stay.price} maxGuests={stay.guests} />} />;
}
