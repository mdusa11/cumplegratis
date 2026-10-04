import type { MetadataRoute } from "next";
import { promos } from "@/lib/promos";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/promos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/mi-cumple`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...promos.map((p) => ({ url: `${SITE.url}/promos/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
