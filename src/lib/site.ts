export const SITE = {
  name: "Cumplegratis",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cumplegratis.com",
  tagline: "Todas las promos de cumpleaños de México en un solo lugar",
  description:
    "Café, pastel, cine, descuentos y regalos gratis en tu cumpleaños. Te decimos qué marcas regalan algo, dónde registrarte y hasta cuándo para cobrarlo todo.",
  lastReview: "octubre 2026",
};

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** JSON-LD seguro para <script>: escapa "<" para que ningún texto pueda cerrar la etiqueta. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** En GitHub Pages no hay servidor: los formularios que escriben en Supabase se ocultan. */
export const API_ENABLED = process.env.NEXT_PUBLIC_STATIC !== "1";
