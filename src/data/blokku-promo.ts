import type { Promo } from "@/lib/promo-meta";

// Promo de Blokku (juego de Dusa Solutions). Vive fuera de data/raw → promos.json a propósito: ahí aparecería también en
// public/data/promos-min.json y en el panel aunque la promo esté apagada. Solo entra a la lista con BLOKKU_PROMO_ON (src/lib/site.ts).
export const blokkuPromo: Promo = {
  slug: "blokku",
  brand: "Blokku",
  category: "experiencias",
  benefit: "500 Bloques, Bloques dobles todo el día y marco «Cumpleañero»",
  benefitType: "gratis",
  details:
    "Blokku es un juego de bloques para celular. El día de tu cumpleaños te regala 500 Bloques (la moneda del juego), Bloques dobles durante todo el día y un marco «Cumpleañero» del año para tu perfil.",
  program: "Blokku 2.0",
  signupUrl: "https://blokku.online",
  requirements: ["Tener Blokku 2.0 instalado", "Poner tu cumpleaños en el Perfil del juego"],
  registerDaysBefore: null,
  window: "dia",
  windowNote: "Solo el día de tu cumpleaños",
  minPurchase: null,
  howToClaim: "Abre Blokku el día de tu cumple y toca el cofre de cumpleaños.",
  sources: ["https://blokku.online"],
  confidence: "alta",
  coverage: "nacional",
  states: [],
  cities: [],
  presence: { states: [], cities: [], online: true },
  locationNote: "Juego para celular, disponible en todo el país",
  needsId: false,
  companions: null,
  validUntil: null,
};
