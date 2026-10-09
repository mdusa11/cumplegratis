// Resumen del sitio para asistentes de IA (ChatGPT, Claude, Perplexity…): qué es, cómo leerlo y cada promo en una línea.

export const dynamic = "force-static";
import { CATEGORIES, byProminence, promos, signupLabel, type CategoryId } from "@/lib/promos";
import { GUIDES } from "@/lib/guides";
import { MONTHS, SITE, STUDIO, pageUrl } from "@/lib/site";

export function GET() {
  const byCat = (Object.keys(CATEGORIES) as CategoryId[])
    .map((c) => ({ c, list: promos.filter((p) => p.category === c).sort(byProminence) }))
    .filter(({ list }) => list.length);
  const text = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.tagline}. ${SITE.description}`,
    "",
    `Directorio independiente y gratuito de promociones de cumpleaños en México, hecho por ${STUDIO.name}. Cada promo dice qué regalan, si hay que registrarse y con cuántos días de anticipación, cuándo se cobra (el día, la semana o el mes), requisitos y en qué estados o ciudades aplica. Se revisa contra las fuentes oficiales de cada marca; última revisión: ${SITE.lastReview}. Las condiciones las pone cada marca y pueden cambiar.`,
    "",
    "## Secciones",
    `- [Todas las promos](${pageUrl("/promos")}): catálogo completo con filtros por ciudad, categoría y tipo de regalo`,
    `- [Mi plan de cumpleaños](${pageUrl("/mi-cumple")}): calendario de en qué fecha registrarse en cada programa según tu fecha de nacimiento`,
    `- [Promos por mes de cumpleaños](${pageUrl("/cumpleanos")}): ${MONTHS.map((m) => `[${m}](${pageUrl(`/cumpleanos/${m}`)})`).join(", ")}`,
    `- [Promos por ciudad](${pageUrl("/ciudades")}) y por estado`,
    "",
    "## Guías",
    ...GUIDES.map((g) => `- [${g.title}](${pageUrl(`/guias/${g.slug}`)})`),
    "",
    ...byCat.flatMap(({ c, list }) => [
      `## ${CATEGORIES[c].label}`,
      ...list.map((p) => `- [${p.brand}](${pageUrl(`/promos/${p.slug}`)}): ${p.benefit}. ${signupLabel(p)}.${p.coverage === "nacional" ? "" : " Solo en algunas ciudades."}`),
      "",
    ]),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
