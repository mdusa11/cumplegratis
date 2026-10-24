import type { Metadata } from "next";
import { BusinessCta } from "@/components/BusinessCta";
import { CityPromos } from "@/components/CityPromos";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SplitText } from "@/components/Reveal";
import { SetCityButton } from "@/components/SetCityButton";
import { CountUp } from "@/components/fx";
import { promosInCity } from "@/lib/cities-data";
import { CITIES, STATES, type CitySlug } from "@/lib/places";
import { CATEGORIES, type CategoryId } from "@/lib/promos";
import { PromoCard } from "@/components/PromoCard";
import { countChannels } from "@/lib/channels";
import { channel } from "@/lib/availability";
import { PAGE_SIZE, breadcrumbs, clip, itemList, jsonLd } from "@/lib/site";
import { GROUP_PAGE, STATE_SLUG, cityGroups } from "@/lib/seo-pages";

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
    title: `Promociones de cumpleaños en ${slug === "cdmx" ? "CDMX" : name} ${year}: ${local.length + national.length} lugares`,
    description: clip(`${local.length + national.length} lugares que te regalan algo en tu cumpleaños en ${name}, ${STATES[CITIES[slug].state].name}: ${local.length} locales y ${national.length} cadenas nacionales. Requisitos y cómo cobrarlos.`),
    alternates: { canonical: `/ciudades/${slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/ciudades/[slug]">) {
  const slug = city((await params).slug);
  if (!slug) notFound();
  const { name, state } = CITIES[slug];
  const { local, national } = promosInCity(slug);
  const loc = { state, city: slug };
  const cards = (list: typeof local) => list.slice(0, PAGE_SIZE).map((p) => ({ key: p.slug, node: <PromoCard promo={p} /> }));
  // Texto propio de cada ciudad (marcas y categorías locales) para que ninguna página sea copia de otra.
  // Los ejemplos, de negocios de la ciudad antes que de cadenas regionales: son los que no conoces.
  const own = (p: (typeof local)[number]) => p.coverage === "ciudades" && p.cities.length <= 2;
  const topLocal = [...local.filter(own), ...local.filter((p) => !own(p))]
    .slice(0, 3)
    .map((p) => p.brand.replace(/\s*\([^)]*\)/g, ""));
  const catCount = new Map<string, number>();
  local.forEach((p) => catCount.set(CATEGORIES[p.category].label.toLowerCase(), (catCount.get(CATEGORIES[p.category].label.toLowerCase()) ?? 0) + 1));
  const topCats = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex gap-2" aria-label="Migas">
        <Link href="/ciudades" className="-my-3.5 inline-block py-3.5 underline-offset-4 hover:underline">
          Ciudades
        </Link>
        <span>/</span>
        <Link href={`/estados/${STATE_SLUG[state]}`} className="-my-3.5 inline-block py-3.5 underline-offset-4 hover:underline">
          {STATES[state].name}
        </Link>
      </nav>
      <h1 className="display mt-4 text-[clamp(3.6rem,11vw,10rem)]">
        <SplitText text="Promos de cumple en" className="block text-[0.45em]" />
        <SplitText text={name} delay={0.25} className="block text-hot" />
      </h1>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <p className="max-w-2xl text-xl font-medium">
          <b className="display text-4xl">
            <CountUp value={local.length + national.length} />
          </b>{" "}
          lugares te regalan algo en tu cumpleaños en {name}: {national.length} cadenas que ya conoces y {local.length}{" "}
          {local.length === 1 ? "local o regional" : "locales y regionales"}
          {topLocal.length > 0 && <> como {topLocal.join(", ")}</>}.
          {topCats.length > 0 && <> Lo que más hay aquí: {topCats.join(", ")}.</>}
        </p>
        <SetCityButton city={slug} />
      </div>
      {cityGroups(slug).length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {cityGroups(slug).map((g) => (
            <li key={g}>
              <Link href={`/ciudades/${slug}/${GROUP_PAGE[g].slug}`} className="chip bg-paper transition-colors hover:bg-acid">
                {GROUP_PAGE[g].title(name)}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CityPromos
        city={slug}
        state={state}
        name={name}
        initial={{
          total: local.length + national.length,
          cats: (Object.keys(CATEGORIES) as CategoryId[]).map((c): [CategoryId, number] => [c, [...local, ...national].filter((p) => p.category === c).length]).filter(([, n]) => n > 0),
          chans: countChannels([...local, ...national], (p) => channel(p, loc)),
          local: { total: local.length, first: cards(local) },
          national: { total: national.length, first: cards(national) },
        }}
      />

      <BusinessCta city={name} className="mt-20" />

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs([["Ciudades", "/ciudades"], [name, `/ciudades/${slug}`]]))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(itemList(`Promos de cumpleaños en ${name}`, [...national, ...local].slice(0, 50).map((p) => [`${p.brand}: ${p.benefit}`, `/promos/${p.slug}`])))}
      />
    </div>
  );
}
