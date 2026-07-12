"use client";

import Link from "next/link";
import { useState } from "react";
import type { Stay } from "@/lib/types";
import { useLanguage } from "./providers";

export function PropertyCard({ stay, priority = false }: { stay: Stay; priority?: boolean }) {
  const { pick } = useLanguage();
  const [liked, setLiked] = useState(false);
  return <article className="stay-card"><Link href={`/stays/${stay.slug}`} className="stay-visual" style={{ backgroundImage: `url(${stay.image})` }} data-priority={priority}><span className="stay-badge">{pick(stay.badge, stay.badgeAr)}</span>{stay.instant && <span className="instant-badge">✦ {pick("Instant book", "حجز فوري")}</span>}</Link><button className={liked ? "save-button is-saved" : "save-button"} onClick={() => setLiked(!liked)} aria-label="Save">{liked ? "♥" : "♡"}</button><div className="stay-content"><div className="stay-location"><span>{pick(stay.city, stay.cityAr)} · {pick(stay.type, stay.typeAr)}</span><b>★ {stay.rating}</b></div><Link href={`/stays/${stay.slug}`}><h3>{pick(stay.name, stay.nameAr)}</h3></Link><p>{pick(stay.area, stay.areaAr)} · {stay.guests} {pick("guests", "ضيوف")} · {stay.bedrooms} {pick("beds", "غرف")}</p><div className="stay-price"><strong>${stay.price}</strong><span>{pick("night", "ليلة")}</span><Link href={`/stays/${stay.slug}`}>↗</Link></div></div></article>;
}
