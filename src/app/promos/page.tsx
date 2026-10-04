import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { SuggestForm } from "@/components/SuggestForm";
import { SplitText } from "@/components/Reveal";
import { PromoCard } from "@/components/PromoCard";
import { promos, stats } from "@/lib/promos";
import { API_ENABLED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Todas las promociones de cumpleaños en México",
  description: `${stats.total} marcas que te regalan algo en tu cumpleaños: comida gratis, cine 2x1, descuentos en tiendas y más. Filtra y descubre cómo cobrar cada una.`,
  alternates: { canonical: "/promos" },
};

export default function PromosPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">{stats.total} marcas · {stats.free} totalmente gratis</p>
      <h1 className="display mt-3 text-[clamp(4rem,13vw,11rem)]">
        <SplitText text="Todas las" className="block" />
        <SplitText text="promos" delay={0.2} className="block text-hot" />
      </h1>

      <div className="mt-10">
        <Suspense
          fallback={
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((p) => (
                <li key={p.slug} className="lazy-paint">
                  <PromoCard promo={p} />
                </li>
              ))}
            </ul>
          }
        >
          <Catalog />
        </Suspense>
      </div>

      <section id="sugerir" className="card mt-24 grid scroll-mt-28 gap-8 bg-lilac p-7 sm:p-10 md:grid-cols-2">
        <div>
          <p className="mono-tag">La comunidad manda</p>
          <h2 className="display mt-3 text-6xl sm:text-7xl">¿Falta una?</h2>
          <p className="mt-4 text-lg font-medium">Si conoces una marca que regala algo en tu cumpleaños y no está aquí, mándanosla.</p>
        </div>
        {API_ENABLED ? <SuggestForm /> : <p className="display self-center text-5xl">Muy pronto podrás mandarla desde aquí <Icon name="mail" shadow /></p>}
      </section>
    </div>
  );
}
