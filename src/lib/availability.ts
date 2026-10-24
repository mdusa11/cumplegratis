import { CITIES, NEARBY_KM, distanceKm, type CitySlug, type StateCode } from "./places";
import type { Promo } from "./promo-meta";

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
  if (pr.online) return "en-linea";
  // Aunque la lista de sucursales esté incompleta, no la damos por buena donde no encontramos ninguna:
  // mostrar una cadena que no existe en tu ciudad es peor que esconder una que sí.
  return "fuera";
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

/** Cómo se cobra: en un negocio de la zona, en una sucursal de cadena, o en línea (código, app, tarjeta). */
export type Channel = "local" | "sucursal" | "en-linea";

export function channel(p: Promo, loc: UserLocation | null): Channel {
  if (p.coverage !== "nacional") return "local";
  // Cadenas sin lista de sucursales: casi todas se cobran con código por correo, app o tarjeta.
  if (!p.presence) return "en-linea";
  return loc && availability(p, loc) === "en-linea" ? "en-linea" : "sucursal";
}

export const CHANNEL_LABEL: Record<Channel, string> = { local: "Locales y regionales", sucursal: "Cadenas con sucursal", "en-linea": "En línea y apps" };
