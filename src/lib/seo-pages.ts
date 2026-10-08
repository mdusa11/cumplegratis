// Datos de las páginas pensadas para buscadores: por estado, por mes de cumpleaños y por ciudad × tipo de promo.
// Solo se generan páginas con contenido suficiente; una página casi vacía le resta al sitio en Google.

import { AVAILABILITY_RANK, availability, isAvailable } from "./availability";
import { promosInCity } from "./cities-data";
import { CITIES, STATES, type CitySlug, type StateCode } from "./places";
import { SAFE_DAYS } from "./plan";
import { byProminence, groupOf, normalize, promos, type GroupId, type Promo } from "./promos";
import { MONTHS } from "./site";

export const slugify = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------- Estados ---------- */

export const STATE_SLUG = Object.fromEntries((Object.keys(STATES) as StateCode[]).map((c) => [c, slugify(STATES[c].name)])) as Record<StateCode, string>;
export const stateBySlug = (slug: string) => (Object.keys(STATE_SLUG) as StateCode[]).find((c) => STATE_SLUG[c] === slug) ?? null;

/** Promos que aplican en un estado: negocios locales/regionales y cadenas (primero las que tienen sucursal ahí). */
export function promosInState(state: StateCode) {
  const loc = { state, city: null };
  const list = promos.map((p) => ({ p, a: availability(p, loc) })).filter(({ a }) => isAvailable(a));
  return {
    local: list.filter(({ p }) => p.coverage !== "nacional").sort((x, y) => byProminence(x.p, y.p)).map(({ p }) => p),
    national: list
      .filter(({ p }) => p.coverage === "nacional")
      .sort((x, y) => AVAILABILITY_RANK[x.a] - AVAILABILITY_RANK[y.a] || byProminence(x.p, y.p))
      .map(({ p }) => p),
  };
}

/* ---------- Ciudad × tipo ---------- */

export const CITY_GROUP_MIN = 6;
/** Además, negocios locales propios: sin ellos la página sería casi idéntica a la de cualquier otra ciudad. */
export const CITY_GROUP_MIN_LOCAL = 3;
export const GROUP_PAGE: Record<GroupId, { slug: string; title: (city: string) => string; question: (city: string) => string; h1: string; lead: string }> = {
  comida: {
    slug: "comida-gratis",
    title: (c) => `Comida gratis en tu cumpleaños en ${c}`,
    question: (c) => `¿Dónde te dan comida gratis en tu cumpleaños en ${c}?`,
    h1: "Comida gratis en tu cumple en",
    lead: "Restaurantes, cafés, postres y comida rápida que te regalan algo",
  },
  tiendas: {
    slug: "regalos-en-tiendas",
    title: (c) => `Regalos y descuentos de cumpleaños en tiendas de ${c}`,
    question: (c) => `¿Qué tiendas de ${c} te regalan algo en tu cumpleaños?`,
    h1: "Regalos de cumple en tiendas de",
    lead: "Belleza, ropa, tecnología y departamentales con regalo o descuento",
  },
  diversion: {
    slug: "diversion-gratis",
    title: (c) => `Cine, parques y diversión gratis en tu cumpleaños en ${c}`,
    question: (c) => `¿Dónde celebrar gratis tu cumpleaños en ${c}?`,
    h1: "Cine y diversión gratis en",
    lead: "Cine, parques, boliche, experiencias y bares para celebrar",
  },
  servicios: {
    slug: "servicios-y-viajes",
    title: (c) => `Bancos, apps y viajes con regalo de cumpleaños en ${c}`,
    question: (c) => `¿Qué bancos, apps o viajes dan regalo de cumpleaños en ${c}?`,
    h1: "Servicios con regalo de cumple en",
    lead: "Tarjetas, apps, hoteles y viajes que te dan algo en tu cumpleaños",
  },
};
export const groupBySlug = (slug: string) => (Object.keys(GROUP_PAGE) as GroupId[]).find((g) => GROUP_PAGE[g].slug === slug) ?? null;

export function promosInCityGroup(city: CitySlug, group: GroupId) {
  const { local, national } = promosInCity(city);
  return { local: local.filter((p) => groupOf(p) === group), national: national.filter((p) => groupOf(p) === group) };
}

/** Tipos con suficientes promos en la ciudad para merecer su propia página. */
export const cityGroups = (city: CitySlug) =>
  (Object.keys(GROUP_PAGE) as GroupId[]).filter((g) => {
    const { local, national } = promosInCityGroup(city, g);
    return local.length >= CITY_GROUP_MIN_LOCAL && local.length + national.length >= CITY_GROUP_MIN;
  });

export const cityGroupParams = () =>
  (Object.keys(CITIES) as CitySlug[]).flatMap((c) => cityGroups(c).map((g) => ({ slug: c, grupo: GROUP_PAGE[g].slug })));

/* ---------- Mes de cumpleaños ---------- */

export const monthBySlug = (slug: string) => {
  const i = MONTHS.indexOf(slug);
  return i >= 0 ? i + 1 : null;
};
export const monthName = (m: number) => MONTHS[m - 1];
export const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Un contexto propio por mes para que ninguna página sea copia de otra. */
export const MONTH_NOTE: Record<number, string> = {
  1: "Enero arranca con la cuesta de enero, así que un café o un postre gratis se agradece el doble. Ojo: varias marcas renuevan sus programas de lealtad a inicio de año.",
  2: "En febrero tu cumple compite con el 14: reserva con tiempo, porque los restaurantes que regalan comida se llenan en esas fechas.",
  3: "Marzo trae puentes y vacaciones de primavera en puerta: buen momento para promos de parques, cine y salidas en grupo.",
  4: "En abril cae Semana Santa: si viajas, revisa qué promos valen en todo el país y cuáles solo en tu ciudad.",
  5: "Mayo está lleno de festejos (Día de las Madres, Día del Maestro) y los restaurantes se saturan: confirma antes de ir si tu cumple cae cerca del 10.",
  6: "Junio es temporada de lluvias y de fin de cursos: los planes bajo techo, como cine, boliche o postres, lucen más.",
  7: "Julio es vacaciones de verano: parques, balnearios y experiencias suelen tener promo de cumpleañero, y conviene llegar temprano.",
  8: "En agosto vuelven las clases: aprovecha las promos de tiendas y tecnología con descuento de cumpleaños antes del regreso.",
  9: "Septiembre es mes patrio: si cumples cerca del 15 y 16, reserva con tiempo porque restaurantes y bares se llenan.",
  10: "Octubre trae Halloween al final del mes y el Buen Fin se asoma: combina tu descuento de cumpleaños con las ofertas de temporada.",
  11: "En noviembre coinciden Día de Muertos y el Buen Fin: muchas tiendas suman tu descuento de cumpleaños a sus ofertas.",
  12: "Diciembre es temporada de posadas y vacaciones: las promos de \"todo tu mes\" rinden más porque te dejan elegir el día.",
};

const DAY = 86_400_000;
/** Próxima vez que llega ese mes (este año si aún no pasa; si ya pasó, el siguiente). */
export function monthYear(m: number, today = new Date()) {
  const y = today.getFullYear();
  return today.getMonth() + 1 > m ? y + 1 : y;
}

export type Deadline = { promo: Promo; first: Date; last: Date; estimated: boolean };

/** Hasta cuándo registrarte si cumples el primer o el último día del mes. */
export function monthDeadlines(m: number, year = monthYear(m)): Deadline[] {
  const first = new Date(year, m - 1, 1);
  const last = new Date(year, m, 0);
  return promos
    .filter((p) => p.program && p.confidence !== "baja")
    .sort(byProminence)
    .map((promo) => {
      const lead = promo.registerDaysBefore ?? SAFE_DAYS;
      return { promo, first: new Date(first.getTime() - lead * DAY), last: new Date(last.getTime() - lead * DAY), estimated: promo.registerDaysBefore == null };
    });
}

export function monthPromos() {
  const confirmed = promos.filter((p) => p.confidence !== "baja").sort(byProminence);
  return {
    wholeMonth: confirmed.filter((p) => p.window === "mes"),
    noSignup: confirmed.filter((p) => !p.program),
    free: confirmed.filter((p) => p.benefitType === "gratis"),
    total: promos.length,
  };
}

