import raw from "@/data/promos.json";
import { blokkuPromo } from "@/data/blokku-promo";
import { BLOKKU_PROMO_ON } from "./site";
import { CATEGORIES, CONFIDENCE_RANK, groupOf, type Promo } from "./promo-meta";

// La lista completa de promos. En componentes de cliente, importar de aquí solo donde de verdad se necesita la lista
// (catálogo, plan, portada); para tipos y funciones usar ./promo-meta.
export * from "./promo-meta";

// Se evalúa al construir el sitio (diario en CI) y otra vez en el navegador: lo vencido no se muestra.
const today = new Date().toISOString().slice(0, 10);

export const promos: Promo[] = [...(raw as Promo[]), ...(BLOKKU_PROMO_ON ? [blokkuPromo] : [])]
  .filter((p) => p.category in CATEGORIES && !(p.validUntil && p.validUntil < today))
  .sort((a, b) => CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || a.brand.localeCompare(b.brand, "es"));

export const getPromo = (slug: string) => promos.find((p) => p.slug === slug);

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rotate = <T,>(list: T[], by: number) => (list.length ? [...list.slice(by % list.length), ...list.slice(0, by % list.length)] : list);

/** Misma categoría primero, luego mismo grupo; las confirmadas antes que las dudosas. El desplazamiento depende del slug para que cada ficha muestre otras. */
export const relatedPromos = (promo: Promo, count = 6) => {
  const offset = hash(promo.slug);
  const sameGroup = promos.filter((p) => p.slug !== promo.slug && groupOf(p) === groupOf(promo));
  const tier = (list: Promo[]) => [...rotate(list.filter((p) => p.confidence !== "baja"), offset), ...rotate(list.filter((p) => p.confidence === "baja"), offset)];
  return [...tier(sameGroup.filter((p) => p.category === promo.category)), ...tier(sameGroup.filter((p) => p.category !== promo.category))].slice(0, count);
};

export const stats = {
  total: promos.length,
  free: promos.filter((p) => p.benefitType === "gratis").length,
  noSignup: promos.filter((p) => !p.program).length,
};

