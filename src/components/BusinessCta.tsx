import { Icon } from "./Icon";
import { cn, whatsappUrl } from "@/lib/site";

/** "¿Tienes un negocio?": los dueños registran o corrigen su promo por WhatsApp. */
export function BusinessCta({ city, className }: { city?: string; className?: string }) {
  const text = `Hola, tengo un negocio${city ? ` en ${city}` : ""} y quiero registrar mi promo de cumpleaños en Cumplegratis.`;
  return (
    <section className={cn("card grid gap-6 bg-sun p-7 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-center", className)}>
      <div>
        <p className="mono-tag">Para negocios</p>
        <h2 className="display mt-3 text-5xl sm:text-6xl">¿Tienes un negocio{city ? ` en ${city}` : ""}?</h2>
        <p className="mt-4 text-lg font-medium">
          Si regalas algo a tus clientes en su cumpleaños, ponlo aquí sin costo. También escríbenos si tu promo cambió o ya no existe.
        </p>
      </div>
      <a
        href={whatsappUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="WhatsApp"
        className="btn btn-ink w-full justify-center gap-3 !py-4 !text-xl !whitespace-normal md:w-auto md:justify-self-end"
      >
        <Icon name="whatsapp" className="!size-7" /> Escríbenos por WhatsApp
      </a>
    </section>
  );
}
