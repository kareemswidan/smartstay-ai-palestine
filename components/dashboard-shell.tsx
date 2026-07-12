"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useLanguage } from "./providers";

export function DashboardShell({ type, children }: { type:"customer"|"owner"|"admin"; children:React.ReactNode }) {
  const pathname=usePathname(); const {pick}=useLanguage(); const {user,loading}=useAuth();
  const links=type==="owner"?[["/owner","Overview","نظرة عامة","⌁"],["/owner/properties","Properties","المنشآت","⌂"],["/owner/properties/new","Add property","إضافة منشأة","＋"],["/owner/bookings","Bookings","الحجوزات","◫"]]:type==="admin"?[["/admin","Platform overview","نظرة المنصة","⌁"],["/admin/properties","Approvals","الموافقات","✓"],["/admin/users","Users","المستخدمون","♙"]]:[["/dashboard","My trips","رحلاتي","◫"],["/explore","Explore stays","استكشف","⌕"],["/dashboard/favorites","Saved","المفضلة","♡"]];
  if(loading)return <div className="dashboard-loading"><span className="loading-ring"/><p>{pick("Loading your workspace…","جاري تحميل مساحتك…")}</p></div>;
  if(!user || (type!=="customer"&&user.role!==type))return <div className="access-card"><span>⌾</span><h1>{pick("Sign in to continue", "سجل الدخول للمتابعة")}</h1><p>{pick("This workspace is available to the relevant account role.","هذه المساحة متاحة لنوع الحساب المناسب.")}</p><Link className="button button-dark" href="/login">{pick("Go to sign in","الذهاب لتسجيل الدخول")}</Link></div>;
  return <div className="dashboard-page"><aside className="dashboard-sidebar"><div><span className="workspace-label">{pick(type==="owner"?"HOST WORKSPACE":type==="admin"?"PLATFORM CONTROL":"TRAVEL WORKSPACE",type==="owner"?"مساحة المضيف":type==="admin"?"إدارة المنصة":"مساحة المسافر")}</span><h3>{user.name}</h3><p>{user.email}</p></div><nav>{links.map(([href,en,ar,icon])=><Link key={href} href={href} className={pathname===href?"active":""}><span>{icon}</span>{pick(en,ar)}</Link>)}</nav><div className="support-card"><span>✦</span><b>{pick("Need a hand?","تحتاج مساعدة؟")}</b><p>{pick("Our local host team usually replies in under 10 minutes.","يرد فريق المضيفين المحلي خلال أقل من 10 دقائق عادةً.")}</p><button>{pick("Contact support","تواصل مع الدعم")}</button></div></aside><section className="dashboard-content">{children}</section></div>;
}
