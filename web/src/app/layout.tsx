import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Noto_Sans_TC } from "next/font/google";
import { DemoProvider } from "@/lib/demo-store";
import { getCatalog } from "@/lib/source";
import { SITE_URL, indexable } from "@/lib/site";
import { getMe } from "@/lib/supabase";
import "./globals.css";

// Latin + numerals in Barlow, CJK falls through to Noto Sans TC; times/prices in Barlow Condensed.
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const barlowCondensed = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const notoTC = Noto_Sans_TC({ variable: "--font-noto-tc", weight: ["400", "500", "700", "900"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: indexable ? undefined : { index: false, follow: false },
  title: { default: "PIKYOO 匹友｜找場、找課、找球友", template: "%s｜PIKYOO 匹友" },
  description: "雙北匹克球開團、找課、找場平台。Find your court. Find your coach. Find your game.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F2F3EF",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [catalog, me] = await Promise.all([getCatalog(), getMe()]);
  return (
    <html lang="zh-Hant" className={`${barlow.variable} ${barlowCondensed.variable} ${notoTC.variable}`}>
      <body>
        <DemoProvider key={me?.id ?? "guest"} catalog={catalog} me={me}>{children}</DemoProvider>
      </body>
    </html>
  );
}
