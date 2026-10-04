import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

/** Public pages for search engines (PRD F10-5): the lists, every coach and court, and upcoming games. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { coaches, courts, games } = await getCatalog();
  const url = (path: string) => `${SITE_URL}${path}`;
  return [
    ...["", "/coaches", "/games", "/courts", "/learn"].map((p) => ({ url: url(p), changeFrequency: "daily" as const })),
    ...coaches.map((c) => ({ url: url(`/coaches/${c.id}`), changeFrequency: "weekly" as const })),
    ...courts.map((c) => ({ url: url(`/courts/${c.id}`), changeFrequency: "monthly" as const })),
    ...games.map((g) => ({ url: url(`/games/${g.id}`), changeFrequency: "daily" as const })),
  ];
}
