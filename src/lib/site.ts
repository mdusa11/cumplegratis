export const SITE = {
  name: "Cumplegratis",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cumplegratis.fun",
  tagline: "Todas las promos de cumpleaños de México en un solo lugar",
  description:
    "Café, pastel, cine, descuentos y regalos gratis en tu cumpleaños. Te decimos qué marcas regalan algo, dónde registrarte y hasta cuándo para cobrarlo todo.",
  lastReview: "octubre 2026",
};

export const ACCENT = "#5b7cff";

export const STUDIO = { name: "Dusa Solutions", url: "https://dusasolutions.com" };
export const SOCIAL = { instagram: "https://www.instagram.com/cumplegratis.fun/", tiktok: "https://www.tiktok.com/@cumplegratis.fun" };

/** Negocios que quieren aparecer (o corregir su promo) nos escriben por WhatsApp. */
export const WHATSAPP = "523114857991";
export const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/** Cloudflare Web Analytics: Cloudflare ya inyecta el medidor automático; esto solo para un sitio fuera de Cloudflare. */
export const CF_BEACON = process.env.NEXT_PUBLIC_CF_BEACON ?? "";

/** AdSense: vacío = sin anuncios, sin aviso de cookies y sin ads.txt. El ID de editor y el del bloque son públicos. */
// Para encender todos los anuncios basta con poner aquí el número de bloque (o en NEXT_PUBLIC_ADSENSE_SLOT).
export const ADS = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-8612524538834472",
  slot: process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "",
};

/** Un anuncio cada tantas tarjetas en listados, máximo 3 por página. */
export const AD_EVERY = 12;

/** Tarjetas por tanda en catálogo y categorías. */
export const PAGE_SIZE = 24;

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** JSON-LD seguro para <script>: escapa "<" para que ningún texto pueda cerrar la etiqueta. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** En el export estático no hay servidor: los formularios que escriben en Supabase se ocultan. */
export const API_ENABLED = process.env.NEXT_PUBLIC_STATIC !== "1";
/** Recordatorios por correo (Worker + Resend). Se enciende cuando el dominio esté verificado en Resend y exista el secreto RESEND_API_KEY. */
export const REMINDERS_ON = false;

/** Promo de cumpleaños de Blokku 2.0 (src/data/blokku-promo.ts). Apagada = no existe en listados, sitemap, conteos, fichas ni JSON-LD. Encender el día que salga la 2.0 (ver README). */
export const BLOKKU_PROMO_ON = false;

/**
 * Datos del responsable para Términos y Aviso de privacidad (LFPDPPP).
 * PENDIENTE: llenar con los datos reales antes de recabar correos (nombre o razón social, domicilio y correo de contacto).
 */
export const LEGAL = {
  responsible: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "Dusa Solutions",
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? "Av. Patria 3995, Col. Lomas de Atemajac, Zapopan, Jalisco, México",
  email: process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "contacto@dusasolutions.com",
  updated: "8 de octubre de 2026",
};

/** URL absoluta de una página; en el export estático lleva diagonal final (trailingSlash) para coincidir con la canónica. */
export const pageUrl = (path: string) => `${SITE.url}${path === "/" ? "" : path}${API_ENABLED ? "" : "/"}`;

/** BreadcrumbList para Google: [["Promos", "/promos"], ["Café", "/categorias/cafe"]] */
export const breadcrumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["Inicio", "/"] as [string, string], ...items].map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: pageUrl(path),
  })),
});

export const itemList = (name: string, paths: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: paths.length,
  itemListElement: paths.map(([n, path], i) => ({ "@type": "ListItem", position: i + 1, name: n, url: pageUrl(path) })),
});

/** Recorta en límite de palabra para que una meta description no pase de `max` caracteres. */
export function clip(s: string, max = 160) {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/[\s,;:.\-–]*\S*$/, "")}…`;
}
