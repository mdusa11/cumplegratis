// Versión mínima de promos.json para el Worker (correos del cron): solo lo necesario para elegir y mostrar promos.
// Sale en public/data/ para que ASSETS la sirva. Uso: parte de `npm run data`.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { CITIES } from "../src/lib/places.ts";

const promos = JSON.parse(await readFile("src/data/promos.json", "utf8"));
const min = promos
  .filter((p) => p.program)
  .map((p) => ({
    slug: p.slug, brand: p.brand, program: p.program, registerDaysBefore: p.registerDaysBefore, benefit: p.benefit,
    confidence: p.confidence, coverage: p.coverage, states: p.states, cities: p.cities,
    presence: p.presence ? { states: p.presence.states, cities: p.presence.cities, online: !!p.presence.online } : null,
  }));
// El Worker no importa places.ts: le pasamos ciudad → estado.
const cityStates = Object.fromEntries(Object.entries(CITIES).map(([k, c]) => [k, c.state]));
await mkdir("public/data", { recursive: true });
await writeFile("public/data/promos-min.json", JSON.stringify({ cityStates, promos: min }));
console.log(`promos-min.json: ${min.length} promos con programa`);
