"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./providers";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const { pick } = useLanguage();
  const router = useRouter();
  const [city, setCity] = useState("Gaza");
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const next = new Date(today); next.setDate(today.getDate() + 3);
  const toDate = (value: Date) => value.toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(toDate(tomorrow));
  const [checkOut, setCheckOut] = useState(toDate(next));
  const [guests, setGuests] = useState("2");
  const submit = (event: FormEvent) => { event.preventDefault(); router.push(`/explore?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`); };
  return <form className={compact ? "search-bar search-compact" : "search-bar"} onSubmit={submit}><label><span>⌖</span><div><small>{pick("Where", "الوجهة")}</small><select value={city} onChange={(event) => setCity(event.target.value)}><option>Gaza</option><option>Jericho</option><option>Bethlehem</option><option>Ramallah</option><option>Nablus</option><option>Hebron</option><option>Jenin</option><option>Tulkarm</option><option>Rawabi</option></select></div></label><label><span>◫</span><div><small>{pick("Check in", "الوصول")}</small><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></div></label><label><span>◫</span><div><small>{pick("Check out", "المغادرة")}</small><input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></div></label><label><span>♙</span><div><small>{pick("Guests", "الضيوف")}</small><select value={guests} onChange={(event) => setGuests(event.target.value)}>{[1,2,3,4,5,6,8,10,12].map((value) => <option key={value}>{value}</option>)}</select></div></label><button className="search-submit"><span>⌕</span><b>{pick("Search", "بحث")}</b></button></form>;
}
