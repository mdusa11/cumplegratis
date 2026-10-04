import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { CATEGORIES, promos } from "@/lib/promos";
import { GUIDES } from "@/lib/guides";
import { CITIES } from "@/lib/places";
import { pageUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "weekly") => ({
    url: pageUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/promos", 0.9, "daily"),
    page("/mi-cumple", 0.7, "monthly"),
    page("/ciudades", 0.8),
    page("/guias", 0.8),
    ...GUIDES.map((g) => page(`/guias/${g.slug}`, 0.9)),
    ...Object.keys(CITIES).map((c) => page(`/ciudades/${c}`, 0.8)),
    ...Object.keys(CATEGORIES).map((c) => page(`/categorias/${c}`, 0.8)),
    ...promos.filter((p) => p.confidence !== "baja").map((p) => page(`/promos/${p.slug}`, 0.7)),
    page("/terminos", 0.2, "yearly"),
    page("/privacidad", 0.2, "yearly"),
  ];
}
