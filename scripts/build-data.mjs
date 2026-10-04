// Une data/raw/*.json en src/data/promos.json, validando cada promo. Uso: npm run data
// Los archivos "_extra-*.json" no traen promos nuevas: completan ubicación y reglas de promos existentes (por slug).
// "_presence-*.json": sucursales reales de cada cadena nacional (estados, ciudades, si se cobra en línea).
// "_fixes.json": correcciones manuales ({ slug, remove: true } quita una promo cerrada; { slug, patch: {...} } corrige campos).
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CITIES, STATES } from "../src/lib/places.ts";

// Abreviaturas comunes que los agentes usan en lugar del código ISO.
const STATE_ALIASES = { QRO: "QUE", BC: "BCN", CDMX: "CMX", QROO: "ROO", EDOMEX: "MEX", GTO: "GUA", NL: "NLE", CHIH: "CHH", COAH: "COA" };
const RAW = "data/raw";
const OUT = "src/data/promos.json";

const CATEGORIES = new Set([
  "cafe", "postres", "restaurantes", "comida-rapida",
  "belleza", "ropa", "departamentales", "tecnologia", "mascotas", "otras-tiendas",
  "cine", "parques", "experiencias", "bares", "servicios", "viajes",
]);
const BENEFIT = new Set(["gratis", "descuento", "2x1", "regalo-con-compra"]);
const WINDOW = new Set(["mes", "semana", "dia", "otro"]);
const CONFIDENCE = new Set(["alta", "media", "baja"]);
const COVERAGE = new Set(["nacional", "estados", "ciudades"]);

// Directorios de la competencia: sirven como pista, nunca como fuente. Una promo que solo se apoya en ellos se descarta.
const BLOCKED_SOURCES = ["quecumple.mx"];
const blocked = (url) => BLOCKED_SOURCES.some((d) => new URL(url).hostname.replace(/^www\./, "").endsWith(d));
const CONF_RANK = { alta: 0, media: 1, baja: 2 };
const brandKey = (b) =>
  b
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\b(mexico|mx|cdmx|restaurante|restaurant)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const isUrl = (s) => {
  try {
    return ["http:", "https:"].includes(new URL(s).protocol);
  } catch {
    return false;
  }
};

const warnings = [];

/** Normaliza ubicación: descarta claves desconocidas y deduce estados a partir de ciudades. */
function location(raw, slug) {
  const cities = (Array.isArray(raw.cities) ? raw.cities : []).filter((c) => {
    if (c in CITIES) return true;
    warnings.push(`${slug}: ciudad desconocida "${c}"`);
    return false;
  });
  // Si el agente escribió algo raro en coverage ("Tepic"), se deduce de lo que sí trae.
  let coverage = COVERAGE.has(raw.coverage) ? raw.coverage : raw.coverage && cities.length ? "ciudades" : raw.coverage && raw.states?.length ? "estados" : null;
  const states = new Set(
    (Array.isArray(raw.states) ? raw.states : []).map((s) => STATE_ALIASES[s] ?? s).filter((s) => {
      if (s in STATES) return true;
      warnings.push(`${slug}: estado desconocido "${s}"`);
      return false;
    }),
  );
  cities.forEach((c) => states.add(CITIES[c].state));
  if (coverage === "ciudades" && cities.length === 0) coverage = states.size ? "estados" : null;
  if (coverage === "estados" && states.size === 0) coverage = null;
  if (coverage === "nacional") return { coverage, states: [], cities: [] };
  return { coverage, states: [...states].sort(), cities: coverage === "ciudades" ? cities : [] };
}

function extras(raw, slug) {
  return {
    ...location(raw, slug),
    locationNote: raw.locationNote?.trim() || null,
    needsId: typeof raw.needsId === "boolean" ? raw.needsId : null,
    companions: Number.isInteger(raw.companions) && raw.companions > 0 ? raw.companions : null,
  };
}

// Vigencia: solo fechas ancladas a "vigente al", "hasta el", "válido hasta", "vence el" o "vigencia 5 ene–31 dic 2026"
// (así no confundimos días de exclusión como "no válido del 15 al 18 dic").
const MONTHS = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
const DATE = String.raw`(\d{1,2})(?:\s+de)?[\s-]+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\.?(?:[\s-]+(?:de\s+)?(\d{4}))?`;
const VALIDITY = [
  new RegExp(String.raw`(?:vigen\w*|v[aá]lid\w*|vence\w*)(?:\s+(?:del?|desde)\s+[^.;]{0,30}?)?\s+(?:al|hasta(?:\s+el)?|el)\s+${DATE}`, "gi"),
  new RegExp(String.raw`hasta\s+el\s+${DATE}`, "gi"),
  new RegExp(String.raw`vigencia\s+[^.;]{0,25}?[–-]\s*${DATE}`, "gi"),
];
const BUILD_YEAR = new Date().getFullYear();

function validUntil(p) {
  const text = [p.details, p.windowNote, p.locationNote].filter(Boolean).join(" ");
  let best = null;
  for (const re of VALIDITY) {
    for (const m of text.matchAll(re)) {
      const [day, mon, year] = [Number(m[1]), MONTHS[m[2].toLowerCase()], m[3] ? Number(m[3]) : BUILD_YEAR];
      if (!(day >= 1 && day <= 31)) continue;
      const iso = new Date(Date.UTC(year, mon, day)).toISOString().slice(0, 10);
      if (!best || iso > best) best = iso;
    }
  }
  return best;
}

function mergeLocation(a, b) {
  if (a.coverage === "nacional" || b.coverage === "nacional") return { coverage: "nacional", states: [], cities: [] };
  if (!a.coverage || !b.coverage) return a.coverage ? {} : { coverage: b.coverage, states: b.states, cities: b.cities };
  const states = [...new Set([...a.states, ...b.states])].sort();
  const cities = [...new Set([...a.cities, ...b.cities])];
  // Si una de las dos aplica a estados completos, la unión también.
  const coverage = a.coverage === "ciudades" && b.coverage === "ciudades" ? "ciudades" : "estados";
  return { coverage, states, cities: coverage === "ciudades" ? cities : [] };
}

function check(p) {
  const errors = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug ?? "")) errors.push("slug");
  if (!p.brand) errors.push("brand");
  if (!CATEGORIES.has(p.category)) errors.push(`category=${p.category}`);
  if (!p.benefit) errors.push("benefit");
  if (!BENEFIT.has(p.benefitType)) errors.push(`benefitType=${p.benefitType}`);
  if (!WINDOW.has(p.window)) errors.push(`window=${p.window}`);
  if (!CONFIDENCE.has(p.confidence)) errors.push(`confidence=${p.confidence}`);
  if (p.signupUrl != null && !isUrl(p.signupUrl)) errors.push("signupUrl");
  if (p.registerDaysBefore != null && !(Number.isInteger(p.registerDaysBefore) && p.registerDaysBefore >= 0)) errors.push("registerDaysBefore");
  if (p.minPurchase != null && !(typeof p.minPurchase === "number" && p.minPurchase > 0)) errors.push("minPurchase");
  return errors;
}

const files = (await readdir(RAW)).filter((f) => f.endsWith(".json")).sort();
const bySlug = new Map();
const overlays = [];
const fixes = [];
const presence = [];
let rejected = 0;

for (const file of files) {
  let items;
  try {
    items = JSON.parse(await readFile(join(RAW, file), "utf8"));
  } catch (e) {
    console.warn(`✗ ${file}: JSON inválido (${e.message}); se omite`);
    continue;
  }
  if (file === "_fixes.json") {
    fixes.push(...items);
    continue;
  }
  if (file.startsWith("_presence")) {
    presence.push(...items);
    continue;
  }
  if (file.startsWith("_")) {
    overlays.push(...items);
    continue;
  }
  for (const raw of items) {
    const p = {
      slug: raw.slug,
      brand: raw.brand?.trim(),
      category: raw.category,
      benefit: raw.benefit?.trim(),
      benefitType: raw.benefitType,
      details: raw.details?.trim() ?? "",
      program: raw.program?.trim() || null,
      signupUrl: raw.signupUrl || null,
      requirements: Array.isArray(raw.requirements) ? raw.requirements.filter(Boolean) : [],
      registerDaysBefore: raw.registerDaysBefore ?? null,
      window: raw.window,
      windowNote: raw.windowNote?.trim() ?? "",
      minPurchase: raw.minPurchase ?? null,
      howToClaim: raw.howToClaim?.trim() ?? "",
      sources: Array.isArray(raw.sources) ? raw.sources.filter(isUrl).filter((u) => !blocked(u)) : [],
      confidence: raw.confidence,
      ...extras(raw, raw.slug),
    };
    const errors = check(p);
    // Sin confirmar + citada de un competidor = la promo viene de su directorio, no de la marca.
    if (Array.isArray(raw.sources) && raw.sources.some((u) => isUrl(u) && blocked(u)) && (p.sources.length === 0 || p.confidence === "baja")) {
      errors.push("viene de un directorio competidor sin confirmar");
    }
    if (errors.length) {
      rejected++;
      console.warn(`✗ ${file} ${p.slug ?? "?"}: ${errors.join(", ")}`);
      continue;
    }
    const dup = bySlug.get(p.slug) ?? [...bySlug.values()].find((q) => brandKey(q.brand) === brandKey(p.brand));
    if (dup) {
      // Misma marca dos veces: el texto de la mejor verificada (empate: la primera) y la ubicación de ambas.
      const [win, lose] = CONF_RANK[p.confidence] < CONF_RANK[dup.confidence] ? [p, dup] : [dup, p];
      Object.assign(win, mergeLocation(win, lose));
      win.sources = [...new Set([...win.sources, ...lose.sources])];
      bySlug.delete(dup.slug);
      bySlug.set(win.slug, win);
      console.warn(`↺ ${p.brand}: se unen ${dup.slug} + ${file}/${p.slug} → ${win.slug}`);
    } else bySlug.set(p.slug, p);
  }
}

let applied = 0;
for (const o of overlays) {
  const p = bySlug.get(o.slug);
  if (!p) {
    warnings.push(`extra para slug inexistente "${o.slug}"`);
    continue;
  }
  Object.assign(p, extras(o, o.slug));
  if (isUrl(o.coverageSource ?? "") && !p.sources.includes(o.coverageSource)) p.sources.push(o.coverageSource);
  applied++;
}

let located = 0;
for (const o of presence) {
  const p = bySlug.get(o.slug);
  if (!p) {
    warnings.push(`sucursales para slug inexistente "${o.slug}"`);
    continue;
  }
  if (/^CERRADA/i.test(o.note ?? "")) warnings.push(`${o.slug}: el agente reporta que cerró (${o.note})`);
  if (p.coverage !== "nacional" || o.scope === "servicio") continue;
  const cities = (o.cities ?? []).filter((c) => c in CITIES);
  const states = new Set([...(o.states ?? []).map((s) => STATE_ALIASES[s] ?? s).filter((s) => s in STATES), ...cities.map((c) => CITIES[c].state)]);
  if (states.size === 0) continue;
  // Presente en los 32 estados = nacional de verdad; solo guardamos ciudades para marcar "en tu ciudad".
  p.presence = { states: [...states].sort(), cities: [...new Set(cities)].sort(), online: o.online === true };
  for (const s of o.sources ?? []) if (isUrl(s) && !p.sources.includes(s)) p.sources.push(s);
  located++;
}

for (const f of fixes) {
  if (!bySlug.has(f.slug)) continue;
  if (f.remove) bySlug.delete(f.slug);
  else if (f.patch) Object.assign(bySlug.get(f.slug), f.patch);
}

const today = new Date().toISOString().slice(0, 10);
let expired = 0;
for (const p of bySlug.values()) {
  p.validUntil = validUntil(p);
  if (p.validUntil && p.validUntil < today) {
    expired++;
    warnings.push(`${p.slug}: vencida el ${p.validUntil}, se quita`);
    bySlug.delete(p.slug);
  }
}

const promos = [...bySlug.values()];
await writeFile(OUT, JSON.stringify(promos, null, 2) + "\n");
warnings.forEach((w) => console.warn(`⚠ ${w}`));
const count = (k, v) => promos.filter((p) => p[k] === v).length;
console.log(
  `✓ ${promos.length} promos (alta ${count("confidence", "alta")}, media ${count("confidence", "media")}, baja ${count("confidence", "baja")}), ` +
    `${rejected} rechazadas, ${applied} con ubicación verificada aparte, ${located} cadenas con sucursales → ${OUT}`,
);
console.log(`  vigencia: ${promos.filter((p) => p.validUntil).length} con fecha de fin, ${expired} vencidas quitadas`);
console.log(
  `  cobertura: nacional ${count("coverage", "nacional")}, estados ${count("coverage", "estados")}, ciudades ${count("coverage", "ciudades")}, sin dato ${count("coverage", null)}`,
);
