import type { Metadata } from "next";
import { BusinessCta } from "@/components/BusinessCta";
import { AdSlot } from "@/components/Ads";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { SuggestForm } from "@/components/SuggestForm";
import { SplitText } from "@/components/Reveal";
import { PromoCard } from "@/components/PromoCard";
import { countChannels } from "@/lib/channels";
import { channel } from "@/lib/availability";
import { byProminence, promos, stats } from "@/lib/promos";
import { AD_EVERY, PAGE_SIZE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Todas las promociones de cumpleaños en México",
  description: `${stats.total} marcas que te regalan algo en tu cumpleaños: comida gratis, cine 2x1, descuentos en tiendas y más. Filtra y descubre cómo cobrar cada una.`,
  alternates: { canonical: "/promos" },
};

// Solo las primeras en el HTML; cada promo tiene su propia ficha en el sitemap. El resto lo baja el catálogo en el navegador.
const first = [...promos].sort(byProminence).slice(0, PAGE_SIZE);

function FirstCards() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {first.flatMap((p, i) => [
        <li key={p.slug} className="lazy-paint">
          <PromoCard promo={p} />
        </li>,
        ...((i + 1) % AD_EVERY === 0 && (i + 1) / AD_EVERY <= 3
          ? [
              <li key="ad" className="col-span-full">
                <AdSlot />
              </li>,
            ]
          : []),
      ])}
    </ul>
  );
}

export default function PromosPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 md:pt-32">
      <p className="mono-tag">{stats.total} marcas · {stats.free} totalmente gratis</p>
      {/* Una sola línea en escritorio: así los filtros y las primeras tarjetas entran en el primer pantallazo. */}
      <h1 className="display mt-2 text-[clamp(3.4rem,10vw,4.5rem)] md:text-[5.5rem]">
        <SplitText text="Todas las" className="mr-[0.25em]" />
        <SplitText text="promos" delay={0.2} className="text-hot" />
      </h1>

      <div className="mt-5">
        <Suspense fallback={<FirstCards />}>
          <Catalog total={promos.length} channels={countChannels(promos, (p) => channel(p, null))}>
            <FirstCards />
          </Catalog>
        </Suspense>
      </div>

      <section id="sugerir" className="card mt-24 grid scroll-mt-28 gap-8 bg-lilac p-7 sm:p-10 md:grid-cols-2">
        <div>
          <p className="mono-tag">La comunidad manda</p>
          <h2 className="display mt-3 text-6xl sm:text-7xl">¿Falta una?</h2>
          <p className="mt-4 text-lg font-medium">Si conoces una marca que regala algo en tu cumpleaños y no está aquí, mándanosla.</p>
        </div>
        <SuggestForm />
      </section>
      <BusinessCta className="mt-8" />
    </div>
  );
}
