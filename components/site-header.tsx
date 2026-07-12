"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, useLanguage } from "./providers";

export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`logo ${light ? "logo-light" : ""}`}><span className="logo-glyph">S</span><span>SmartStay</span><b>AI</b></Link>;
}

export function SiteHeader() {
  const { language, toggleLanguage, pick } = useLanguage();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-shell"><Logo /><button className="mobile-trigger" onClick={() => setOpen(!open)} aria-label="Menu"><span /><span /></button><nav className={open ? "nav-open" : ""}><Link href="/explore">{pick("Explore stays", "استكشف الإقامات")}</Link><Link href="/ai-planner">{pick("AI trip planner", "مخطط الرحلات الذكي")}<i>AI</i></Link><Link href="/host">{pick("List your place", "أضف منشأتك")}</Link><Link href="/about">{pick("How it works", "كيف نعمل")}</Link></nav><div className="header-actions"><button className="language-button" onClick={toggleLanguage}><span>◎</span>{language === "en" ? "العربية" : "English"}</button>{user ? <div className="profile-menu"><Link href={user.role === "owner" ? "/owner" : user.role === "admin" ? "/admin" : "/dashboard"}><span>{user.name.charAt(0)}</span><b>{user.name.split(" ")[0]}</b></Link><button onClick={logout}>↗</button></div> : <><Link className="text-link" href="/login">{pick("Sign in", "تسجيل الدخول")}</Link><Link className="button button-dark header-cta" href="/register">{pick("Get started", "ابدأ الآن")}</Link></>}</div></div></header>;
}
