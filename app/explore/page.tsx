"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PropertyCard } from "@/components/property-card";
import { SearchBar } from "@/components/search-bar";
import { useLanguage } from "@/components/providers";
import { stays } from "@/lib/properties";
import type { Stay } from "@/lib/types";

export default function ExplorePage() {
  const { pick } = useLanguage();
  const params = useSearchParams();
  const [type, setType] = useState(params.get("type") || "All");
  const [maxPrice, setMaxPrice] = useState(250);
  const [sort, setSort] = useState("recommended");
  const [mapOpen, setMapOpen] = useState(true);
  const [databaseStays, setDatabaseStays] = useState<Stay[]>([]);
  useEffect(() => { fetch("/api/properties").then((response) => response.json()).then((data: { properties?: Record<string, unknown>[] }) => { const known = new Set(stays.map((stay) => stay.id)); const mapped = (data.properties ?? []).filter((item) => !known.has(Number(item.id))).map((item) => ({ id: Number(item.id), slug: String(item.slug), name: String(item.name), nameAr: String(item.name_ar || item.name), type: String(item.type), typeAr: String(item.type), city: String(item.city), cityAr: String(item.city_ar || item.city), area: String(item.area || "Palestine"), areaAr: String(item.area_ar || "فلسطين"), price: Number(item.price), rating: 5, reviews: 0, guests: Number(item.capacity), bedrooms: Number(item.bedrooms), bathrooms: Number(item.bathrooms), image: String(item.image || stays[0].image), gallery: [], amenities: [], amenitiesAr: [], description: String(item.description || "A new local stay."), descriptionAr: String(item.description_ar || "إقامة محلية جديدة."), badge: "New host", badgeAr: "مضيف جديد", instant: Boolean(item.instant_book), latitude: Number(item.latitude || 31.9), longitude: Number(item.longitude || 35.2) } satisfies Stay)); setDatabaseStays(mapped); }).catch(() => {}); }, []);
  const allStays = [...stays, ...databaseStays];
  const city = params.get("city");
  const filtered = useMemo(() => allStays.filter((stay) => (!city || stay.city.toLowerCase() === city.toLowerCase()) && (type === "All" || stay.type.toLowerCase() === type.toLowerCase()) && stay.price <= maxPrice).sort((a,b) => sort === "price" ? a.price-b.price : sort === "rating" ? b.rating-a.rating : b.rating*10+b.reviews/100-(a.rating*10+a.reviews/100)), [allStays, city, type, maxPrice, sort]);
  return <div className="explore-page"><div className="explore-top"><div><span className="kicker">{pick("DISCOVER PALESTINE", "اكتشف فلسطين")}</span><h1>{city ? pick(`Stays in ${city}`, `إقامات في ${stays.find((stay) => stay.city === city)?.cityAr ?? city}`) : pick("Find your next stay", "اعثر على إقامتك القادمة")}</h1></div><SearchBar compact /></div><div className="filter-toolbar"><div className="type-pills">{["All","Hotel","Chalet","Villa","Apartment","Resort","Farmstay"].map((value) => <button key={value} className={type === value ? "active" : ""} onClick={() => setType(value)}>{pick(value, ({All:"الكل",Hotel:"فندق",Chalet:"شاليه",Villa:"فيلا",Apartment:"شقة",Resort:"منتجع",Farmstay:"مزرعة"} as Record<string,string>)[value])}</button>)}</div><label className="price-filter"><span>{pick("Up to", "حتى")} ${maxPrice}</span><input type="range" min="70" max="250" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">{pick("Recommended", "الموصى به")}</option><option value="price">{pick("Lowest price", "الأقل سعرًا")}</option><option value="rating">{pick("Top rated", "الأعلى تقييمًا")}</option></select><button className={mapOpen ? "map-toggle active" : "map-toggle"} onClick={() => setMapOpen(!mapOpen)}>⌖ {pick("Map", "الخريطة")}</button></div><div className={mapOpen ? "explore-layout has-map" : "explore-layout"}><section><div className="results-meta"><p><b>{filtered.length}</b> {pick("stays match your trip", "إقامة تناسب رحلتك")}</p><span>✦ {pick("AI-ranked for relevance", "مرتبة بالذكاء حسب الملاءمة")}</span></div><div className="explore-grid">{filtered.map((stay) => <PropertyCard key={stay.id} stay={stay} />)}</div></section>{mapOpen && <aside className="map-panel"><iframe title="Palestine stays map" src="https://www.openstreetmap.org/export/embed.html?bbox=34.85%2C31.35%2C35.65%2C32.55&layer=mapnik" /><div className="map-note"><span>⌖</span><p><b>{pick("Explore by neighbourhood", "استكشف حسب المنطقة")}</b><small>{pick("Interactive map powered by OpenStreetMap", "خريطة تفاعلية من OpenStreetMap")}</small></p></div></aside>}</div></div>;
}
