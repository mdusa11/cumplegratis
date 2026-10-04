import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PromoCard } from "@/components/PromoCard";
import { SplitText } from "@/components/Reveal";
import { SetCityButton } from "@/components/SetCityButton";
import { CountUp, TitleReveal } from "@/components/fx";
import { promosInCity } from "@/lib/cities-data";
import { CITIES, STATES, type CitySlug } from "@/lib/places";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ slug }));
}

const year = new Date().getFullYear();
const city = (slug: string) => (slug in CITIES ? (slug as CitySlug) : null);

export async function generateMetadata({ params }: PageProps<"/ciudades/[slug]">): Promise<Metadata> {
  const slug = city((await params).slug);
  if (!slug) return {};
  const { local, national } = promosInCity(slug);
  const name = CITIES[slug].name;
  return {
    title: `Promos de cumpleaños en ${name} ${year}`,
    description: `${local.length + national.length} lugares que te regalan algo en tu cumpleaños en ${name}, ${STATES[CITIES[slug].state].name}: ${local.length} locales y ${national.length} cadenas nacionales. Requisitos y cómo cobrarlos.`,
    alternates: { canonical: `/ciudades/${slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/ciudades/[slug]">) {
  const slug = city((await params).slug);
  if (!slug) notFound();
  const { name, state } = CITIES[slug];
  const { local, national } = promosInCity(slug);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex gap-2" aria-label="Migas">
        <Link href="/ciudades" className="underline-offset-4 hover:underline">
          Ciudades
        </Link>
        <span>/</span>
        <span>{STATES[state].name}</span>
      </nav>
      <h1 className="display mt-4 text-[clamp(3.6rem,11vw,10rem)]">
        <SplitText text="Promos de cumple en" className="block text-[0.45em]" />
        <SplitText text={name} delay={0.25} className="block text-hot" />
      </h1>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <p className="text-xl font-medium">
          <b className="display text-4xl">
            <CountUp value={local.length + national.length} />
          </b>{" "}
          lugares te regalan algo en tu cumpleaños aquí.
        </p>
        <SetCityButton city={slug} />
      </div>

      {local.length > 0 && (
        <section className="mt-20">
          <TitleReveal text={`Solo en ${name} y *alrededores`} className="text-5xl sm:text-7xl" />
          <p className="mt-3 text-lg font-medium">Negocios locales y cadenas regionales: las que casi nadie conoce.</p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {local.map((p) => (
              <li key={p.slug}>
                <PromoCard promo={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-20">
        <TitleReveal text="Cadenas en todo México" className="text-5xl sm:text-7xl" />
        <p className="mt-3 text-lg font-medium">También aplican en {name}.</p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {national.map((p) => (
            <li key={p.slug}>
              <PromoCard promo={p} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
