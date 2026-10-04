import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { promos } from "@/lib/promos";
import { CITIES } from "@/lib/places";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/promos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/mi-cumple`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/ciudades`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...Object.keys(CITIES).map((c) => ({ url: `${SITE.url}/ciudades/${c}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...promos.map((p) => ({ url: `${SITE.url}/promos/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
