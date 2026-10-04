// Une data/raw/*.json en src/data/promos.json, validando cada promo. Uso: node scripts/build-data.mjs
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

const isUrl = (s) => {
  try {
    return ["http:", "https:"].includes(new URL(s).protocol);
  } catch {
    return false;
  }
};

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
let rejected = 0;

for (const file of files) {
  const items = JSON.parse(await readFile(join(RAW, file), "utf8"));
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
      sources: Array.isArray(raw.sources) ? raw.sources.filter(isUrl) : [],
      confidence: raw.confidence,
    };
    const errors = check(p);
    if (errors.length) {
      rejected++;
      console.warn(`✗ ${file} ${p.slug ?? "?"}: ${errors.join(", ")}`);
      continue;
    }
    if (bySlug.has(p.slug)) console.warn(`↺ ${p.slug} repetido en ${file}; se queda el primero`);
    else bySlug.set(p.slug, p);
  }
}

const promos = [...bySlug.values()];
await writeFile(OUT, JSON.stringify(promos, null, 2) + "\n");
const count = (k) => promos.filter((p) => p.confidence === k).length;
console.log(`✓ ${promos.length} promos (alta ${count("alta")}, media ${count("media")}, baja ${count("baja")}), ${rejected} rechazadas → ${OUT}`);
