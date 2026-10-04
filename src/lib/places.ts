// Estados (claves ISO 3166-2:MX sin prefijo) y ciudades principales con coordenadas aproximadas.
// Las coordenadas permiten ubicar al usuario en la ciudad más cercana sin mandar su ubicación a ningún servidor.

export const STATES = {
  AGU: { name: "Aguascalientes", short: "Ags." },
  BCN: { name: "Baja California", short: "B.C." },
  BCS: { name: "Baja California Sur", short: "B.C.S." },
  CAM: { name: "Campeche", short: "Camp." },
  CHP: { name: "Chiapas", short: "Chis." },
  CHH: { name: "Chihuahua", short: "Chih." },
  CMX: { name: "Ciudad de México", short: "CDMX" },
  COA: { name: "Coahuila", short: "Coah." },
  COL: { name: "Colima", short: "Col." },
  DUR: { name: "Durango", short: "Dgo." },
  GUA: { name: "Guanajuato", short: "Gto." },
  GRO: { name: "Guerrero", short: "Gro." },
  HID: { name: "Hidalgo", short: "Hgo." },
  JAL: { name: "Jalisco", short: "Jal." },
  MEX: { name: "Estado de México", short: "Edomex" },
  MIC: { name: "Michoacán", short: "Mich." },
  MOR: { name: "Morelos", short: "Mor." },
  NAY: { name: "Nayarit", short: "Nay." },
  NLE: { name: "Nuevo León", short: "N.L." },
  OAX: { name: "Oaxaca", short: "Oax." },
  PUE: { name: "Puebla", short: "Pue." },
  QUE: { name: "Querétaro", short: "Qro." },
  ROO: { name: "Quintana Roo", short: "Q. Roo" },
  SLP: { name: "San Luis Potosí", short: "S.L.P." },
  SIN: { name: "Sinaloa", short: "Sin." },
  SON: { name: "Sonora", short: "Son." },
  TAB: { name: "Tabasco", short: "Tab." },
  TAM: { name: "Tamaulipas", short: "Tamps." },
  TLA: { name: "Tlaxcala", short: "Tlax." },
  VER: { name: "Veracruz", short: "Ver." },
  YUC: { name: "Yucatán", short: "Yuc." },
  ZAC: { name: "Zacatecas", short: "Zac." },
} as const;

export type StateCode = keyof typeof STATES;

type City = { name: string; state: StateCode; lat: number; lng: number };

export const CITIES = {
  aguascalientes: { name: "Aguascalientes", state: "AGU", lat: 21.885, lng: -102.292 },
  tijuana: { name: "Tijuana", state: "BCN", lat: 32.515, lng: -117.038 },
  mexicali: { name: "Mexicali", state: "BCN", lat: 32.625, lng: -115.452 },
  ensenada: { name: "Ensenada", state: "BCN", lat: 31.867, lng: -116.596 },
  "la-paz": { name: "La Paz", state: "BCS", lat: 24.143, lng: -110.313 },
  "los-cabos": { name: "Los Cabos", state: "BCS", lat: 22.89, lng: -109.917 },
  campeche: { name: "Campeche", state: "CAM", lat: 19.83, lng: -90.535 },
  "ciudad-del-carmen": { name: "Ciudad del Carmen", state: "CAM", lat: 18.652, lng: -91.808 },
  "tuxtla-gutierrez": { name: "Tuxtla Gutiérrez", state: "CHP", lat: 16.752, lng: -93.103 },
  tapachula: { name: "Tapachula", state: "CHP", lat: 14.903, lng: -92.257 },
  "san-cristobal": { name: "San Cristóbal de las Casas", state: "CHP", lat: 16.737, lng: -92.638 },
  chihuahua: { name: "Chihuahua", state: "CHH", lat: 28.632, lng: -106.069 },
  "ciudad-juarez": { name: "Ciudad Juárez", state: "CHH", lat: 31.69, lng: -106.425 },
  cdmx: { name: "Ciudad de México", state: "CMX", lat: 19.433, lng: -99.133 },
  saltillo: { name: "Saltillo", state: "COA", lat: 25.423, lng: -101.005 },
  torreon: { name: "Torreón", state: "COA", lat: 25.543, lng: -103.407 },
  monclova: { name: "Monclova", state: "COA", lat: 26.908, lng: -101.422 },
  colima: { name: "Colima", state: "COL", lat: 19.243, lng: -103.725 },
  manzanillo: { name: "Manzanillo", state: "COL", lat: 19.114, lng: -104.339 },
  durango: { name: "Durango", state: "DUR", lat: 24.028, lng: -104.653 },
  leon: { name: "León", state: "GUA", lat: 21.125, lng: -101.686 },
  silao: { name: "Silao", state: "GUA", lat: 20.944, lng: -101.428 },
  guanajuato: { name: "Guanajuato", state: "GUA", lat: 21.019, lng: -101.257 },
  irapuato: { name: "Irapuato", state: "GUA", lat: 20.677, lng: -101.356 },
  celaya: { name: "Celaya", state: "GUA", lat: 20.524, lng: -100.816 },
  "san-miguel-de-allende": { name: "San Miguel de Allende", state: "GUA", lat: 20.914, lng: -100.745 },
  acapulco: { name: "Acapulco", state: "GRO", lat: 16.853, lng: -99.824 },
  chilpancingo: { name: "Chilpancingo", state: "GRO", lat: 17.552, lng: -99.501 },
  zihuatanejo: { name: "Zihuatanejo", state: "GRO", lat: 17.642, lng: -101.551 },
  pachuca: { name: "Pachuca", state: "HID", lat: 20.101, lng: -98.759 },
  guadalajara: { name: "Guadalajara", state: "JAL", lat: 20.66, lng: -103.35 },
  zapopan: { name: "Zapopan", state: "JAL", lat: 20.721, lng: -103.392 },
  "puerto-vallarta": { name: "Puerto Vallarta", state: "JAL", lat: 20.653, lng: -105.225 },
  toluca: { name: "Toluca", state: "MEX", lat: 19.283, lng: -99.656 },
  naucalpan: { name: "Naucalpan", state: "MEX", lat: 19.479, lng: -99.24 },
  tlalnepantla: { name: "Tlalnepantla", state: "MEX", lat: 19.541, lng: -99.195 },
  ecatepec: { name: "Ecatepec", state: "MEX", lat: 19.602, lng: -99.051 },
  nezahualcoyotl: { name: "Nezahualcóyotl", state: "MEX", lat: 19.401, lng: -99.015 },
  morelia: { name: "Morelia", state: "MIC", lat: 19.706, lng: -101.195 },
  uruapan: { name: "Uruapan", state: "MIC", lat: 19.411, lng: -102.057 },
  cuernavaca: { name: "Cuernavaca", state: "MOR", lat: 18.924, lng: -99.222 },
  cuautla: { name: "Cuautla", state: "MOR", lat: 18.812, lng: -98.955 },
  tepic: { name: "Tepic", state: "NAY", lat: 21.504, lng: -104.895 },
  "nuevo-vallarta": { name: "Nuevo Vallarta", state: "NAY", lat: 20.699, lng: -105.296 },
  monterrey: { name: "Monterrey", state: "NLE", lat: 25.687, lng: -100.316 },
  oaxaca: { name: "Oaxaca", state: "OAX", lat: 17.073, lng: -96.727 },
  huatulco: { name: "Huatulco", state: "OAX", lat: 15.768, lng: -96.135 },
  puebla: { name: "Puebla", state: "PUE", lat: 19.041, lng: -98.206 },
  tehuacan: { name: "Tehuacán", state: "PUE", lat: 18.462, lng: -97.393 },
  queretaro: { name: "Querétaro", state: "QUE", lat: 20.589, lng: -100.39 },
  "san-juan-del-rio": { name: "San Juan del Río", state: "QUE", lat: 20.389, lng: -99.996 },
  cancun: { name: "Cancún", state: "ROO", lat: 21.162, lng: -86.852 },
  "playa-del-carmen": { name: "Playa del Carmen", state: "ROO", lat: 20.63, lng: -87.074 },
  tulum: { name: "Tulum", state: "ROO", lat: 20.211, lng: -87.465 },
  chetumal: { name: "Chetumal", state: "ROO", lat: 18.5, lng: -88.296 },
  "san-luis-potosi": { name: "San Luis Potosí", state: "SLP", lat: 22.157, lng: -100.986 },
  culiacan: { name: "Culiacán", state: "SIN", lat: 24.809, lng: -107.394 },
  mazatlan: { name: "Mazatlán", state: "SIN", lat: 23.249, lng: -106.411 },
  "los-mochis": { name: "Los Mochis", state: "SIN", lat: 25.791, lng: -108.986 },
  hermosillo: { name: "Hermosillo", state: "SON", lat: 29.073, lng: -110.956 },
  "ciudad-obregon": { name: "Ciudad Obregón", state: "SON", lat: 27.483, lng: -109.93 },
  nogales: { name: "Nogales", state: "SON", lat: 31.309, lng: -110.942 },
  villahermosa: { name: "Villahermosa", state: "TAB", lat: 17.989, lng: -92.948 },
  reynosa: { name: "Reynosa", state: "TAM", lat: 26.051, lng: -98.298 },
  matamoros: { name: "Matamoros", state: "TAM", lat: 25.869, lng: -97.503 },
  "nuevo-laredo": { name: "Nuevo Laredo", state: "TAM", lat: 27.478, lng: -99.55 },
  tampico: { name: "Tampico", state: "TAM", lat: 22.233, lng: -97.861 },
  "ciudad-victoria": { name: "Ciudad Victoria", state: "TAM", lat: 23.737, lng: -99.141 },
  tlaxcala: { name: "Tlaxcala", state: "TLA", lat: 19.314, lng: -98.24 },
  veracruz: { name: "Veracruz", state: "VER", lat: 19.174, lng: -96.134 },
  xalapa: { name: "Xalapa", state: "VER", lat: 19.544, lng: -96.91 },
  coatzacoalcos: { name: "Coatzacoalcos", state: "VER", lat: 18.135, lng: -94.459 },
  cordoba: { name: "Córdoba", state: "VER", lat: 18.884, lng: -96.926 },
  merida: { name: "Mérida", state: "YUC", lat: 20.967, lng: -89.593 },
  zacatecas: { name: "Zacatecas", state: "ZAC", lat: 22.771, lng: -102.583 },
} as const satisfies Record<string, City>;

export type CitySlug = keyof typeof CITIES;

/** Una promo local "te queda cerca" si alguna de sus ciudades está a menos de esto de la tuya (cubre zonas metropolitanas). */
export const NEARBY_KM = 60;

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearestCity(point: { lat: number; lng: number }) {
  let best: { slug: CitySlug; km: number } | null = null;
  for (const slug of Object.keys(CITIES) as CitySlug[]) {
    const km = distanceKm(point, CITIES[slug]);
    if (!best || km < best.km) best = { slug, km };
  }
  return best!;
}

export const citiesOf = (state: StateCode) => (Object.keys(CITIES) as CitySlug[]).filter((c) => CITIES[c].state === state);
