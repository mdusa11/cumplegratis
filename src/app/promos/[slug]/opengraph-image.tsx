import { OG_SIZE, ogImage } from "@/lib/og";
import { GROUPS, getPromo, groupOf, promos } from "@/lib/promos";

export const alt = "Promo de cumpleaños";
export const size = OG_SIZE;
export const contentType = "image/png";

const HEX = { comida: "#ff5a36", tiendas: "#b9a6ff", diversion: "#7cd6ff", servicios: "#ffd23f" } as const;

export function generateStaticParams() {
  return promos.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const promo = getPromo((await params).slug)!;
  const group = groupOf(promo);
  return ogImage({ kicker: `${GROUPS[group].label} · en tu cumpleaños`, title: promo.brand, subtitle: promo.benefit, color: HEX[group] });
}
