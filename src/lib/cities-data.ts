import { AVAILABILITY_RANK, availability, isAvailable } from "./availability";
import { CITIES, type CitySlug } from "./places";
import { byProminence, promos } from "./promos";

/** Promos que aplican en una ciudad: cadenas nacionales (primero las que tienen sucursal ahí) y negocios locales/regionales. */
export function promosInCity(city: CitySlug) {
  const loc = { state: CITIES[city].state, city };
  const list = promos.map((p) => ({ p, a: availability(p, loc) })).filter(({ a }) => isAvailable(a));
  return {
    local: list
      .filter(({ p }) => p.coverage !== "nacional")
      .sort((x, y) => byProminence(x.p, y.p) || AVAILABILITY_RANK[x.a] - AVAILABILITY_RANK[y.a])
      .map(({ p }) => p),
    national: list
      .filter(({ p }) => p.coverage === "nacional")
      .sort((x, y) => AVAILABILITY_RANK[x.a] - AVAILABILITY_RANK[y.a] || byProminence(x.p, y.p))
      .map(({ p }) => p),
  };
}
