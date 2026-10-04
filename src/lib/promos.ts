import raw from "@/data/promos.json";
import { CITIES, STATES, type CitySlug, type StateCode } from "./places";
import type { IconName } from "@/components/Icon";

export type BenefitType = "gratis" | "descuento" | "2x1" | "regalo-con-compra";
export type ClaimWindow = "mes" | "semana" | "dia" | "otro";
export type Confidence = "alta" | "media" | "baja";
export type GroupId = "comida" | "tiendas" | "diversion" | "servicios";
export type Coverage = "nacional" | "estados" | "ciudades";

export const CATEGORIES = {
  cafe: { label: "Café", group: "comida", icon: "coffee" },
  postres: { label: "Postres", group: "comida", icon: "donut" },
  restaurantes: { label: "Restaurantes", group: "comida", icon: "plate" },
  "comida-rapida": { label: "Comida rápida", group: "comida", icon: "burger" },
  belleza: { label: "Belleza", group: "tiendas", icon: "lipstick" },
  ropa: { label: "Ropa", group: "tiendas", icon: "sneaker" },
  departamentales: { label: "Departamentales", group: "tiendas", icon: "bag" },
  tecnologia: { label: "Tecnología", group: "tiendas", icon: "phone" },
  mascotas: { label: "Mascotas", group: "tiendas", icon: "paw" },
  "otras-tiendas": { label: "Tiendas", group: "tiendas", icon: "gift" },
  cine: { label: "Cine", group: "diversion", icon: "popcorn" },
  parques: { label: "Parques", group: "diversion", icon: "ferris" },
  experiencias: { label: "Experiencias", group: "diversion", icon: "ticket" },
  bares: { label: "Bares", group: "diversion", icon: "beer" },
  servicios: { label: "Servicios", group: "servicios", icon: "card" },
  viajes: { label: "Viajes", group: "servicios", icon: "plane" },
} as const satisfies Record<string, { label: string; group: GroupId; icon: IconName }>;

export type CategoryId = keyof typeof CATEGORIES;

export const GROUPS: Record<GroupId, { label: string; color: string; icon: IconName; blurb: string }> = {
  comida: { label: "Comida", color: "var(--color-hot)", icon: "cakeSlice", blurb: "Café, pastel, helado y hasta comida completa." },
  tiendas: { label: "Tiendas", color: "var(--color-lilac)", icon: "bag", blurb: "Belleza, ropa, tecnología y cupones de regalo." },
  diversion: { label: "Diversión", color: "var(--color-sky)", icon: "ferris", blurb: "Cine, parques y planes para celebrar." },
  servicios: { label: "Servicios", color: "var(--color-sun)", icon: "card", blurb: "Bancos, apps, viajes y otros beneficios." },
};

export const BENEFIT: Record<BenefitType, { label: string; color: string }> = {
  gratis: { label: "Gratis", color: "var(--color-acid)" },
  "2x1": { label: "2x1", color: "var(--color-sky)" },
  descuento: { label: "Descuento", color: "var(--color-sun)" },
  "regalo-con-compra": { label: "Con compra", color: "var(--color-pink)" },
};

export const WINDOW_LABEL: Record<ClaimWindow, string> = {
  mes: "Todo tu mes",
  semana: "Tu semana",
  dia: "Solo el día",
  otro: "Fechas especiales",
};

export const CONFIDENCE: Record<Confidence, { label: string; hint: string }> = {
  alta: { label: "Verificada", hint: "Confirmada en el sitio o términos oficiales de la marca." },
  media: { label: "Reportada", hint: "Publicada por medios recientes; la marca no la detalla en su sitio." },
  baja: { label: "Sin confirmar", hint: "No encontramos una fuente reciente. Pregunta antes de ir." },
};

export type Promo = {
  slug: string;
  brand: string;
  category: CategoryId;
  benefit: string;
  benefitType: BenefitType;
  details: string;
  program: string | null;
  signupUrl: string | null;
  requirements: string[];
  registerDaysBefore: number | null;
  window: ClaimWindow;
  windowNote: string;
  minPurchase: number | null;
  howToClaim: string;
  sources: string[];
  confidence: Confidence;
  /** null = todavía no verificamos dónde aplica. */
  coverage: Coverage | null;
  states: StateCode[];
  cities: CitySlug[];
  locationNote: string | null;
  needsId: boolean | null;
  companions: number | null;
  /** Último día de vigencia publicado por la marca (ISO), o null si no lo dice. */
  validUntil: string | null;
};

const CONFIDENCE_RANK: Record<Confidence, number> = { alta: 0, media: 1, baja: 2 };

// Se evalúa al construir el sitio (diario en CI) y otra vez en el navegador: lo vencido no se muestra.
const today = new Date().toISOString().slice(0, 10);

export const promos: Promo[] = (raw as Promo[])
  .filter((p) => p.category in CATEGORIES && !(p.validUntil && p.validUntil < today))
  .sort((a, b) => CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || a.brand.localeCompare(b.brand, "es"));

export const groupOf = (p: Promo): GroupId => CATEGORIES[p.category].group;

export const getPromo = (slug: string) => promos.find((p) => p.slug === slug);

export const relatedPromos = (promo: Promo, count = 3) =>
  promos.filter((p) => p.slug !== promo.slug && groupOf(p) === groupOf(promo)).slice(0, count);

export const stats = {
  total: promos.length,
  free: promos.filter((p) => p.benefitType === "gratis").length,
  noSignup: promos.filter((p) => !p.program).length,
};

export const days = (n: number) => (n === 1 ? "1 día" : `${n} días`);

export const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function signupLabel(p: Promo) {
  if (!p.program) return "Sin registro";
  if (p.registerDaysBefore != null && p.registerDaysBefore > 0) return `Regístrate ${days(p.registerDaysBefore)} antes`;
  return "Requiere registro";
}

export const money = (n: number) => `$${n.toLocaleString("es-MX")}`;

/** Ícono para una viñeta de requisito según de qué habla. */
export function ruleIcon(text: string): IconName {
  const t = normalize(text);
  if (/\b(ine|identificacion|credencial|pasaporte)\b/.test(t)) return "id";
  if (/acompanante|personas|amigos|invitados/.test(t)) return "people";
  if (/\$|compra|consumo|ticket|minimo/.test(t)) return "card";
  if (/registr|app|cuenta|club|miembro|socio|tarjeta|membresia|rewards|perfil/.test(t)) return "register";
  if (/dia|mes|semana|fecha|vigen/.test(t)) return "calendar";
  return "sparkle";
}

/** Reglas rápidas estructuradas (para los íconos grandes del panel). */
export function quickRules(p: Promo) {
  const rules: { icon: IconName; label: string }[] = [];
  if (p.program) rules.push({ icon: "register", label: p.registerDaysBefore ? `Regístrate ${days(p.registerDaysBefore)} antes` : `Registro en ${p.program}` });
  else rules.push({ icon: "walk", label: "Sin registro previo" });
  if (p.needsId) rules.push({ icon: "id", label: "Lleva tu INE" });
  if (p.companions) rules.push({ icon: "people", label: `Ve con ${p.companions} ${p.companions === 1 ? "acompañante" : "acompañantes"}` });
  if (p.minPurchase) rules.push({ icon: "card", label: `Compra mínima ${money(p.minPurchase)}` });
  return rules;
}

const listJoin = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;

/** "Todo México", "Solo en Guadalajara", "Monterrey, Saltillo y 3 más", "Jalisco y Nuevo León". */
export function coverageLabel(p: Promo) {
  if (p.coverage === "nacional") return "Todo México";
  if (p.coverage === "ciudades") {
    const names = p.cities.map((c) => CITIES[c].name);
    return names.length === 1 ? `Solo en ${names[0]}` : names.length <= 3 ? listJoin(names) : `${names.slice(0, 2).join(", ")} y ${names.length - 2} más`;
  }
  if (p.coverage === "estados") {
    const names = p.states.map((s) => STATES[s].name);
    return names.length <= 3 ? listJoin(names) : `${names.slice(0, 2).join(", ")} y ${names.length - 2} estados más`;
  }
  return "Ubicación por confirmar";
}

const DAY_MS = 86_400_000;

/** "Vence el 31 oct" si a la promo le quedan menos de `soonDays` días; null si no tiene fecha o falta mucho. */
export function expiryLabel(p: Promo, soonDays = 60) {
  if (!p.validUntil) return null;
  const end = new Date(`${p.validUntil}T23:59:59`);
  const left = Math.ceil((end.getTime() - Date.now()) / DAY_MS);
  if (left > soonDays) return null;
  return left <= 1 ? "Vence hoy" : `Vence el ${end.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "")}`;
}

export const validityText = (p: Promo) =>
  p.validUntil ? `Vigente hasta el ${new Date(`${p.validUntil}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}` : null;

// Marcas que casi todo mundo conoce, en orden de reconocimiento: van hasta arriba dentro de su grupo.
const FAMOUS = [
  "mcdonalds", "mcdonalds-mexico", "starbucks", "cinepolis", "cinemex", "liverpool", "sephora", "el-palacio-de-hierro", "palacio-de-hierro",
  "krispy-kreme", "dairy-queen", "nutrisa", "vips", "toks", "italiannis", "chilis", "sanborns", "kidzania", "six-flags-mexico",
  "nike", "adidas", "xiaomi", "victorias-secret", "bath-and-body-works", "pandora", "miniso", "petco", "dominos", "carls-jr",
  "el-globo", "cielito-querido", "benavides", "farmacias-del-ahorro", "kfc", "subway", "little-caesars", "burger-king",
];
const FAMOUS_RANK = new Map(FAMOUS.map((slug, i) => [slug, i]));

const isChain = (p: Promo) => p.coverage === "nacional" || p.states.length >= 3 || p.cities.length >= 4;

/**
 * Orden de prominencia (menor = más arriba): cadenas famosas verificadas → locales verificadas →
 * cadenas sin confirmar → locales sin confirmar. Dentro: marcas conocidas primero y luego la mejor verificada.
 */
export function prominence(p: Promo) {
  const verified = p.confidence !== "baja";
  const tier = isChain(p) ? (verified ? 0 : 2) : verified ? 1 : 3;
  const famous = FAMOUS_RANK.get(p.slug) ?? FAMOUS.length;
  return tier * 1000 + famous * 10 + CONFIDENCE_RANK[p.confidence];
}

export const byProminence = (a: Promo, b: Promo) => prominence(a) - prominence(b) || a.brand.localeCompare(b.brand, "es");
