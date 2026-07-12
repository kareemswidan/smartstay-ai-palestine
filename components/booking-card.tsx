"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth, useLanguage } from "./providers";

function localInput(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function BookingCard({ propertyId, price, maxGuests }: { propertyId: number; price: number; maxGuests: number }) {
  const { pick } = useLanguage();
  const { user } = useAuth();
  const arrival = new Date(); arrival.setDate(arrival.getDate() + 2); arrival.setHours(15, 0, 0, 0);
  const departure = new Date(arrival); departure.setDate(departure.getDate() + 2); departure.setHours(11, 0, 0, 0);
  const [startAt, setStartAt] = useState(localInput(arrival));
  const [endAt, setEndAt] = useState(localInput(departure));
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle"|"checking"|"available"|"unavailable"|"booking"|"success">("idle");
  const [message, setMessage] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const nights = useMemo(() => Math.max(1, Math.ceil((new Date(endAt).getTime() - new Date(startAt).getTime()) / 86_400_000)), [startAt,endAt]);
  const subtotal = price * nights;
  const service = Math.round(subtotal * .08);

  const check = async () => {
    setState("checking"); setMessage("");
    const query = new URLSearchParams({ propertyId: String(propertyId), startAt, endAt });
    const response = await fetch(`/api/availability?${query}`);
    const data = await response.json() as { available?: boolean; error?: string };
    setState(data.available ? "available" : "unavailable");
    setMessage(data.available ? pick("Available — your time can be secured now.", "متاح — يمكنك تثبيت هذا الوقت الآن.") : (data.error || pick("Already booked for part of this period.", "محجوز بالفعل خلال جزء من هذه الفترة.")));
  };

  const book = async (event: FormEvent) => {
    event.preventDefault(); setState("booking"); setMessage("");
    const response = await fetch("/api/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ propertyId, guestName: name, email, phone, startAt, endAt, guests }) });
    const data = await response.json() as { bookingCode?: string; error?: string };
    if (response.status === 409) { setState("unavailable"); setMessage(pick("Another guest secured this time first. Choose another slot.", "قام ضيف آخر بتثبيت هذا الوقت أولًا. اختر وقتًا آخر.")); return; }
    if (!response.ok) { setState("idle"); setMessage(data.error || pick("Could not complete the booking.", "تعذر إكمال الحجز.")); return; }
    setBookingCode(data.bookingCode ?? "PS-CONFIRMED"); setState("success");
  };

  if (state === "success") return <div className="booking-card booking-success"><div className="success-check">✓</div><span className="kicker">{pick("BOOKING CONFIRMED", "تم تأكيد الحجز")}</span><h3>{pick("Your time is locked.", "تم تثبيت وقتك.")}</h3><p>{pick("No other guest can book this property during your selected period.", "لا يمكن لأي ضيف آخر حجز هذه المنشأة خلال الفترة المحددة.")}</p><div className="confirmation-code"><small>{pick("Confirmation", "رقم التأكيد")}</small><b>{bookingCode}</b></div><a className="button button-dark" href="/dashboard">{pick("View my trips", "عرض رحلاتي")} →</a></div>;

  return <form className="booking-card" onSubmit={book}><div className="booking-price"><div><strong>${price}</strong><span>/ {pick("night", "ليلة")}</span></div><b>★ 4.9 <small>· 120+ {pick("reviews", "تقييم")}</small></b></div><div className="booking-dates"><label><small>{pick("ARRIVAL", "الوصول")}</small><input type="datetime-local" value={startAt} onChange={(event) => { setStartAt(event.target.value); setState("idle"); }} /></label><label><small>{pick("DEPARTURE", "المغادرة")}</small><input type="datetime-local" value={endAt} onChange={(event) => { setEndAt(event.target.value); setState("idle"); }} /></label><label className="guest-select"><small>{pick("GUESTS", "الضيوف")}</small><select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{Array.from({length:maxGuests},(_,index)=><option key={index+1}>{index+1}</option>)}</select></label></div><button type="button" className="availability-button" onClick={check} disabled={state === "checking"}>{state === "checking" ? pick("Checking live calendar…", "جاري فحص التقويم…") : `◷ ${pick("Check live availability", "تحقق من التوفر اللحظي")}`}</button>{message && <div className={`availability-message ${state}`}><span>{state === "available" ? "✓" : "!"}</span>{message}</div>}{state === "available" && <div className="guest-fields"><label>{pick("Full name", "الاسم الكامل")}<input value={name} onChange={(event)=>setName(event.target.value)} required /></label><label>{pick("Email", "البريد الإلكتروني")}<input type="email" value={email} onChange={(event)=>setEmail(event.target.value)} required /></label><label>{pick("Phone", "رقم الهاتف")}<input value={phone} onChange={(event)=>setPhone(event.target.value)} /></label></div>}<div className="price-breakdown"><p><span>${price} × {nights} {pick(nights === 1 ? "night" : "nights", nights === 1 ? "ليلة" : "ليالٍ")}</span><b>${subtotal}</b></p><p><span>{pick("SmartStay service", "خدمة SmartStay")}</span><b>${service}</b></p><p className="total"><span>{pick("Total", "الإجمالي")}</span><b>${subtotal+service}</b></p></div><button className="button button-mint booking-submit" disabled={state !== "available" || !name || !email}>{state === "booking" ? pick("Securing your time…", "جاري تثبيت الوقت…") : pick("Reserve this stay", "احجز هذه الإقامة")}</button><small className="payment-note">⌾ {pick("Demo payment — no charge will be made", "دفع تجريبي — لن يتم خصم أي مبلغ")}</small></form>;
}
