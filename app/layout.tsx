import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
import "./polish.css";
import "./typography.css";

export const metadata: Metadata = {
  title: { default: "SmartStay AI — Stay local. Travel deeper.", template: "%s — SmartStay AI" },
  description: "Discover and book trusted hotels, chalets, villas and local stays across Palestine with intelligent recommendations.",
  openGraph: { title: "SmartStay AI", description: "Palestine's intelligent stay marketplace.", images: ["/og-v2.png"] },
  twitter: { card: "summary_large_image", images: ["/og-v2.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" dir="ltr" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head><body><Providers><SiteHeader /><main className="page-main">{children}</main><SiteFooter /></Providers></body></html>;
}

