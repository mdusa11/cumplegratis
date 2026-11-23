import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { CATEGORIES, promos } from "@/lib/promos";
import { GUIDES } from "@/lib/guides";
import { CITIES, STATES, type CitySlug, type StateCode } from "@/lib/places";
import { MONTHS, pageUrl } from "@/lib/site";
import { STATE_SLUG, cityGroupParams, isThinCity, isThinState } from "@/lib/seo-pages";

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
    page("/respuestas", 0.8),
    ...GUIDES.map((g) => page(`/guias/${g.slug}`, 0.9)),
    ...(Object.keys(CITIES) as CitySlug[]).filter((c) => !isThinCity(c)).map((c) => page(`/ciudades/${c}`, 0.8)),
    ...cityGroupParams()
      .filter(({ slug }) => !isThinCity(slug as Parameters<typeof isThinCity>[0]))
      .map(({ slug, grupo }) => page(`/ciudades/${slug}/${grupo}`, 0.8)),
    ...(Object.keys(STATES) as StateCode[]).filter((c) => !isThinState(c)).map((c) => page(`/estados/${STATE_SLUG[c]}`, 0.8)),
    page("/cumpleanos", 0.8, "monthly"),
    ...MONTHS.map((m) => page(`/cumpleanos/${m}`, 0.8, "monthly")),
    page("/categorias", 0.7, "monthly"),
    ...Object.keys(CATEGORIES).map((c) => page(`/categorias/${c}`, 0.8)),
    ...promos.filter((p) => p.confidence !== "baja").map((p) => page(`/promos/${p.slug}`, 0.7)),
    page("/como-verificamos", 0.5, "monthly"),
    page("/acerca", 0.4, "monthly"),
    page("/contacto", 0.4, "monthly"),
    page("/terminos", 0.2, "yearly"),
    page("/privacidad", 0.2, "yearly"),
  ];
}
