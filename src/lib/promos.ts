import raw from "@/data/promos.json";
import { CATEGORIES, CONFIDENCE_RANK, groupOf, type Promo } from "./promo-meta";

// La lista completa de promos. En componentes de cliente, importar de aquí solo donde de verdad se necesita la lista
// (catálogo, plan, portada); para tipos y funciones usar ./promo-meta.
export * from "./promo-meta";

// Se evalúa al construir el sitio (diario en CI) y otra vez en el navegador: lo vencido no se muestra.
const today = new Date().toISOString().slice(0, 10);

export const promos: Promo[] = (raw as Promo[])
  .filter((p) => p.category in CATEGORIES && !(p.validUntil && p.validUntil < today))
  .sort((a, b) => CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || a.brand.localeCompare(b.brand, "es"));

export const getPromo = (slug: string) => promos.find((p) => p.slug === slug);

export const relatedPromos = (promo: Promo, count = 3) =>
  promos.filter((p) => p.slug !== promo.slug && groupOf(p) === groupOf(promo)).slice(0, count);

export const stats = {
  total: promos.length,
  free: promos.filter((p) => p.benefitType === "gratis").length,
  noSignup: promos.filter((p) => !p.program).length,
};

