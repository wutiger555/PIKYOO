import type { MetadataRoute } from "next";
import { SITE_URL, indexable } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/me", "/coach", "/admin", "/api", "/welcome", "/design", "/groups"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
