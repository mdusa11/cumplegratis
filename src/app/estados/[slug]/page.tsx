import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Ads";
import { BusinessCta } from "@/components/BusinessCta";
import { FaqList } from "@/components/FaqList";
import { PromoCard } from "@/components/PromoCard";
import { SplitText } from "@/components/Reveal";
import { CountUp, TitleReveal } from "@/components/fx";
import { promosInCity } from "@/lib/cities-data";
import { CITIES, STATES, citiesOf, type StateCode } from "@/lib/places";
import { CATEGORIES } from "@/lib/promos";
import { STATE_SLUG, promosInState, stateBySlug } from "@/lib/seo-pages";
import { breadcrumbs, itemList, jsonLd } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(STATES) as StateCode[]).map((c) => ({ slug: STATE_SLUG[c] }));
}

const year = new Date().getFullYear();

export async function generateMetadata({ params }: PageProps<"/estados/[slug]">): Promise<Metadata> {
  const code = stateBySlug((await params).slug);
  if (!code) return {};
  const { local, national } = promosInState(code);
  const name = STATES[code].name;
  return {
    title: `Promociones de cumpleaños en ${name} ${year}`,
    description: `${local.length + national.length} lugares que te regalan algo en tu cumpleaños en ${name}: ${local.length} negocios locales y ${national.length} cadenas. Comida gratis, cine, descuentos, requisitos y cómo cobrarlo.`,
    alternates: { canonical: `/estados/${STATE_SLUG[code]}` },
  };
}

export default async function StatePage({ params }: PageProps<"/estados/[slug]">) {
  const code = stateBySlug((await params).slug);
  if (!code) notFound();
  const name = STATES[code].name;
  const { local, national } = promosInState(code);
  const cities = citiesOf(code);
  const free = [...national, ...local].filter((p) => p.benefitType === "gratis");
  const catCount = new Map<string, number>();
  local.forEach((p) => catCount.set(CATEGORIES[p.category].label.toLowerCase(), (catCount.get(CATEGORIES[p.category].label.toLowerCase()) ?? 0) + 1));
  const topCats = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  const withStore = national.filter((p) => p.presence && p.presence.states.includes(code)).slice(0, 6).map((p) => p.brand);

  const faq = [
    {
      q: `¿Qué te regalan en tu cumpleaños en ${name}?`,
      a: `En ${name} hay ${local.length + national.length} promociones de cumpleaños: ${free.length} son totalmente gratis (como ${free.slice(0, 4).map((p) => `${p.brand}: ${p.benefit.toLowerCase()}`).join("; ")}) y el resto son descuentos, 2x1 o regalos con compra.`,
    },
    {
      q: `¿Qué negocios locales de ${name} regalan algo en tu cumpleaños?`,
      a: local.length
        ? `Tenemos ${local.length} negocios locales o regionales en ${name}, por ejemplo ${local.slice(0, 5).map((p) => p.brand).join(", ")}.${topCats.length ? ` Lo que más hay: ${topCats.join(", ")}.` : ""}`
        : `Todavía no tenemos negocios locales confirmados en ${name}; las cadenas nacionales sí aplican. Si conoces uno, mándanoslo por WhatsApp.`,
    },
    {
      q: `¿Qué cadenas tienen sucursal en ${name}?`,
      a: withStore.length
        ? `Entre las cadenas con promo de cumpleaños y sucursal en ${name} están ${withStore.join(", ")}. Otras se cobran en línea o en todo el país.`
        : `Las cadenas nacionales con promo de cumpleaños aplican en ${name}; revisa en cada una si hay sucursal cerca de ti.`,
    },
    {
      q: "¿Necesito registrarme antes de mi cumpleaños?",
      a: "En la mayoría de las cadenas sí: te piden estar en su programa de lealtad con tu fecha de nacimiento, a veces semanas antes. En Mi plan te decimos qué registrar y hasta cuándo según tu fecha.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex gap-2" aria-label="Migas">
        <Link href="/ciudades" className="underline-offset-4 hover:underline">
          Ciudades
        </Link>
        <span>/</span>
        <span>{name}</span>
      </nav>
      <h1 className="display mt-4 text-[clamp(3.6rem,11vw,10rem)]">
        <SplitText text="Promos de cumple en" className="block text-[0.45em]" />
        <SplitText text={name} delay={0.25} className="block text-hot" />
      </h1>
      <p className="mt-8 max-w-2xl text-xl font-medium">
        <b className="display text-4xl">
          <CountUp value={local.length + national.length} />
        </b>{" "}
        promociones de cumpleaños en {name}: {national.length} cadenas y {local.length} {local.length === 1 ? "negocio local" : "negocios locales"}
        {free.length > 0 && <>, {free.length} totalmente gratis</>}.
      </p>

      {cities.length > 0 && (
        <nav className="mt-8" aria-label={`Ciudades de ${name}`}>
          <p className="mono-tag">Por ciudad</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {cities.map((c) => (
              <li key={c}>
                <Link href={`/ciudades/${c}`} className="chip bg-paper transition-colors hover:bg-acid">
                  {CITIES[c].name} <span className="rounded-full bg-ink px-1.5 text-xs text-paper">{promosInCity(c).local.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {local.length > 0 && (
        <section className="mt-16">
          <TitleReveal text={`Solo en *${name}`} className="text-5xl sm:text-7xl" />
          <p className="mt-3 text-lg font-medium">Negocios locales y cadenas regionales del estado.</p>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {local.map((p) => (
              <li key={p.slug} className="lazy-paint">
                <PromoCard promo={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdSlot className="mt-16" />

      <section className="mt-16">
        <TitleReveal text="Las *cadenas de siempre" className="text-5xl sm:text-7xl" />
        <p className="mt-3 text-lg font-medium">Primero las que tienen sucursal en {name}; luego las que se cobran en línea o en todo el país.</p>
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {national.map((p) => (
            <li key={p.slug} className="lazy-paint">
              <PromoCard promo={p} />
            </li>
          ))}
        </ul>
      </section>

      <FaqList items={faq} className="mt-20" />
      <BusinessCta className="mt-16" />

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs([["Ciudades", "/ciudades"], [name, `/estados/${STATE_SLUG[code]}`]]))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(itemList(`Promociones de cumpleaños en ${name}`, [...local, ...national].map((p) => [`${p.brand}: ${p.benefit}`, `/promos/${p.slug}`])))}
      />
    </div>
  );
}
