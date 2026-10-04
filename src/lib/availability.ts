import { CITIES, NEARBY_KM, distanceKm, type CitySlug, type StateCode } from "./places";
import type { Promo } from "./promos";

export type UserLocation = { state: StateCode; city: CitySlug | null };
export type Availability = "nacional" | "tu-ciudad" | "cerca" | "tu-estado" | "en-linea" | "fuera" | "sin-dato";

export function availability(p: Promo, loc: UserLocation): Availability {
  if (!p.coverage) return "sin-dato";
  if (p.coverage === "nacional") return p.presence ? chainAvailability(p.presence, loc) : "nacional";
  if (p.coverage === "estados") return p.states.includes(loc.state) ? "tu-estado" : "fuera";
  if (loc.city) {
    if (p.cities.includes(loc.city)) return "tu-ciudad";
    const here = CITIES[loc.city];
    return p.cities.some((c) => distanceKm(here, CITIES[c]) <= NEARBY_KM) ? "cerca" : "fuera";
  }
  return p.states.includes(loc.state) ? "tu-estado" : "fuera";
}

function chainAvailability(pr: NonNullable<Promo["presence"]>, loc: UserLocation): Availability {
  if (loc.city) {
    if (pr.cities.includes(loc.city)) return "tu-ciudad";
    const here = CITIES[loc.city];
    if (pr.cities.some((c) => distanceKm(here, CITIES[c]) <= NEARBY_KM)) return "cerca";
  }
  if (pr.states.includes(loc.state)) return "tu-estado";
  return pr.online ? "en-linea" : "fuera";
}

export const isAvailable = (a: Availability) => a !== "fuera";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  nacional: "En todo México",
  "tu-ciudad": "En tu ciudad",
  cerca: "Cerca de ti",
  "tu-estado": "En tu estado",
  "en-linea": "Sin sucursal cerca: se cobra en línea",
  fuera: "No está en tu zona",
  "sin-dato": "Ubicación por confirmar",
};

/** Las locales primero: son las que menos gente conoce. */
export const AVAILABILITY_RANK: Record<Availability, number> = { "tu-ciudad": 0, cerca: 1, "tu-estado": 2, nacional: 3, "en-linea": 4, "sin-dato": 5, fuera: 6 };
