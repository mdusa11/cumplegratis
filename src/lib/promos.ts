import raw from "@/data/promos.json";
import { CITIES, STATES, type CitySlug, type StateCode } from "./places";

export type BenefitType = "gratis" | "descuento" | "2x1" | "regalo-con-compra";
export type ClaimWindow = "mes" | "semana" | "dia" | "otro";
export type Confidence = "alta" | "media" | "baja";
export type GroupId = "comida" | "tiendas" | "diversion" | "servicios";
export type Coverage = "nacional" | "estados" | "ciudades";

export const CATEGORIES = {
  cafe: { label: "Café", group: "comida", emoji: "☕" },
  postres: { label: "Postres", group: "comida", emoji: "🍩" },
  restaurantes: { label: "Restaurantes", group: "comida", emoji: "🍽️" },
  "comida-rapida": { label: "Comida rápida", group: "comida", emoji: "🍔" },
  belleza: { label: "Belleza", group: "tiendas", emoji: "💄" },
  ropa: { label: "Ropa", group: "tiendas", emoji: "👟" },
  departamentales: { label: "Departamentales", group: "tiendas", emoji: "🛍️" },
  tecnologia: { label: "Tecnología", group: "tiendas", emoji: "📱" },
  mascotas: { label: "Mascotas", group: "tiendas", emoji: "🐶" },
  "otras-tiendas": { label: "Tiendas", group: "tiendas", emoji: "🎁" },
  cine: { label: "Cine", group: "diversion", emoji: "🍿" },
  parques: { label: "Parques", group: "diversion", emoji: "🎢" },
  experiencias: { label: "Experiencias", group: "diversion", emoji: "🎟️" },
  bares: { label: "Bares", group: "diversion", emoji: "🍻" },
  servicios: { label: "Servicios", group: "servicios", emoji: "💳" },
  viajes: { label: "Viajes", group: "servicios", emoji: "✈️" },
} as const satisfies Record<string, { label: string; group: GroupId; emoji: string }>;

export type CategoryId = keyof typeof CATEGORIES;

export const GROUPS: Record<GroupId, { label: string; color: string; emoji: string; blurb: string }> = {
  comida: { label: "Comida", color: "var(--color-hot)", emoji: "🍰", blurb: "Café, pastel, helado y hasta comida completa." },
  tiendas: { label: "Tiendas", color: "var(--color-lilac)", emoji: "🛍️", blurb: "Belleza, ropa, tecnología y cupones de regalo." },
  diversion: { label: "Diversión", color: "var(--color-sky)", emoji: "🎢", blurb: "Cine, parques y planes para celebrar." },
  servicios: { label: "Servicios", color: "var(--color-sun)", emoji: "💳", blurb: "Bancos, apps, viajes y otros beneficios." },
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
};

const CONFIDENCE_RANK: Record<Confidence, number> = { alta: 0, media: 1, baja: 2 };

export const promos: Promo[] = (raw as Promo[])
  .filter((p) => p.category in CATEGORIES)
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
export function ruleIcon(text: string) {
  const t = normalize(text);
  if (/\b(ine|identificacion|credencial|pasaporte)\b/.test(t)) return "🪪";
  if (/acompanante|personas|amigos|invitados/.test(t)) return "👥";
  if (/\$|compra|consumo|ticket|minimo/.test(t)) return "💳";
  if (/registr|app|cuenta|club|miembro|socio|tarjeta|membresia|rewards|perfil/.test(t)) return "📝";
  if (/dia|mes|semana|fecha|vigen/.test(t)) return "📅";
  return "✦";
}

/** Reglas rápidas estructuradas (para los íconos grandes del panel). */
export function quickRules(p: Promo) {
  const rules: { icon: string; label: string }[] = [];
  if (p.program) rules.push({ icon: "📝", label: p.registerDaysBefore ? `Regístrate ${days(p.registerDaysBefore)} antes` : `Registro en ${p.program}` });
  else rules.push({ icon: "🚶", label: "Sin registro previo" });
  if (p.needsId) rules.push({ icon: "🪪", label: "Lleva tu INE" });
  if (p.companions) rules.push({ icon: "👥", label: `Ve con ${p.companions} ${p.companions === 1 ? "acompañante" : "acompañantes"}` });
  if (p.minPurchase) rules.push({ icon: "💳", label: `Compra mínima ${money(p.minPurchase)}` });
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
