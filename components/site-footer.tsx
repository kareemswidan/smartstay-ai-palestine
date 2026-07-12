"use client";

import Link from "next/link";
import { Logo } from "./site-header";
import { useLanguage } from "./providers";

export function SiteFooter() {
  const { pick } = useLanguage();
  return <footer className="site-footer"><div className="footer-shell"><div className="footer-brand"><Logo light /><p>{pick("Palestine's intelligent marketplace for stays that feel personal, trusted and beautifully local.", "سوق فلسطين الذكي لإقامات شخصية وموثوقة ومحلية بكل تفاصيلها.")}</p><div className="social-row"><a>in</a><a>ig</a><a>𝕏</a></div></div><div><h4>{pick("Discover", "استكشف")}</h4><Link href="/explore">{pick("All stays", "كل الإقامات")}</Link><Link href="/explore?type=chalet">{pick("Chalets", "الشاليهات")}</Link><Link href="/explore?type=hotel">{pick("Hotels", "الفنادق")}</Link><Link href="/explore?type=villa">{pick("Villas", "الفلل")}</Link></div><div><h4>{pick("Hosting", "الاستضافة")}</h4><Link href="/host">{pick("List a property", "أضف منشأة")}</Link><Link href="/owner">{pick("Owner dashboard", "لوحة المالك")}</Link><Link href="/host">{pick("Hosting standards", "معايير الاستضافة")}</Link><Link href="/host">{pick("Owner protection", "حماية المالك")}</Link></div><div><h4>{pick("Support", "الدعم")}</h4><Link href="/about">{pick("How it works", "كيف نعمل")}</Link><Link href="/about">{pick("Safety centre", "مركز الأمان")}</Link><Link href="/about">{pick("Cancellation", "سياسة الإلغاء")}</Link><Link href="/about">{pick("Contact us", "تواصل معنا")}</Link></div><div className="footer-news"><h4>{pick("Travel better, weekly", "سافر بشكل أفضل أسبوعيًا")}</h4><p>{pick("Local discoveries, fair-price alerts and hosting insight.", "اكتشافات محلية وتنبيهات أسعار ونصائح للمالكين.")}</p><label><input placeholder={pick("Email address", "البريد الإلكتروني")} /><button>→</button></label></div></div><div className="footer-bottom"><span>© 2026 SmartStay AI</span><span>{pick("Built in Palestine, for everywhere.", "صُنع في فلسطين، لكل مكان.")}</span></div></footer>;
}
