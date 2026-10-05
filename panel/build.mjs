// Genera public/meta.json: nombres de promos, ciudades y estados para que el panel muestre nombres en vez de slugs.
import { readFile, writeFile } from "node:fs/promises";
import { CITIES, STATES } from "../src/lib/places.ts";

const promos = JSON.parse(await readFile(new URL("../src/data/promos.json", import.meta.url), "utf8"));
const meta = {
  promos: Object.fromEntries(promos.map((p) => [p.slug, p.brand])),
  cities: Object.fromEntries(Object.entries(CITIES).map(([k, c]) => [k, `${c.name}, ${STATES[c.state].short}`])),
  states: Object.fromEntries(Object.entries(STATES).map(([k, s]) => [k, s.name])),
};
await writeFile(new URL("./public/meta.json", import.meta.url), JSON.stringify(meta));
console.log(`meta.json: ${promos.length} promos, ${Object.keys(CITIES).length} ciudades`);
