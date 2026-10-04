import { AVAILABILITY_RANK, availability, isAvailable } from "./availability";
import { CITIES, type CitySlug } from "./places";
import { byProminence, promos } from "./promos";

/** Promos que aplican en una ciudad, separadas en locales (lo que solo hay ahí) y nacionales. */
export function promosInCity(city: CitySlug) {
  const loc = { state: CITIES[city].state, city };
  const list = promos
    .map((p) => ({ p, a: availability(p, loc) }))
    .filter(({ a }) => isAvailable(a))
    .sort((x, y) => byProminence(x.p, y.p) || AVAILABILITY_RANK[x.a] - AVAILABILITY_RANK[y.a]);
  return {
    local: list.filter(({ a }) => a === "tu-ciudad" || a === "cerca" || a === "tu-estado").map(({ p }) => p),
    national: list.filter(({ a }) => a === "nacional" || a === "en-linea" || a === "sin-dato").map(({ p }) => p),
  };
}
