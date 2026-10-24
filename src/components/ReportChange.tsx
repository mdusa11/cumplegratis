import { Icon } from "./Icon";
import { SITE, cn, pageUrl, whatsappUrl } from "@/lib/site";

/** Fecha de revisión y aviso por WhatsApp si la promo cambió. */
export function ReportChange({ slug, brand, className }: { slug: string; brand: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <p className="mono-tag">Revisada: {SITE.lastReview}</p>
      <a
        href={whatsappUrl(`Hola, la promo de ${brand} en Cumplegratis cambió o ya no existe: ${pageUrl(`/promos/${slug}`)}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:text-hot"
      >
        <Icon name="whatsapp" className="!size-4" /> ¿Cambió esta promo? Avísanos
      </a>
    </div>
  );
}
