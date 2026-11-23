import type { Metadata } from "next";
import { BusinessCta } from "@/components/BusinessCta";
import { CityPromos } from "@/components/CityPromos";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SplitText } from "@/components/Reveal";
import { SetCityButton } from "@/components/SetCityButton";
import { CountUp } from "@/components/fx";
import { promosInCity } from "@/lib/cities-data";
import { CITIES, NEARBY_KM, STATES, citiesOf, distanceKm, type CitySlug } from "@/lib/places";
import { CATEGORIES, byProminence, promos, type CategoryId } from "@/lib/promos";
import { PromoCard } from "@/components/PromoCard";
import { countChannels } from "@/lib/channels";
import { channel } from "@/lib/availability";
import { PAGE_SIZE, breadcrumbs, clip, itemList, jsonLd } from "@/lib/site";
import { GROUP_PAGE, STATE_SLUG, cityGroups, isThinCity } from "@/lib/seo-pages";

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
    ...(isThinCity(slug) && { robots: { index: false, follow: true } }),
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

  // Bloque propio: solo locales confirmadas de esta ciudad, sus categorías, cuáles no existen en otro lado y vecinas cercanas.
  const confirmed = promos.filter((p) => p.coverage === "ciudades" && p.cities.includes(slug) && p.confidence !== "baja").sort(byProminence);
  const only = confirmed.filter((p) => p.cities.length === 1);
  const brandOf = (p: (typeof promos)[number]) => p.brand.replace(/\s*\([^)]*\)/g, "");
  const cats = new Map<CategoryId, number>();
  confirmed.forEach((p) => cats.set(p.category, (cats.get(p.category) ?? 0) + 1));
  const catRank = [...cats.entries()].sort((a, b) => b[1] - a[1]);
  const lead = catRank[0] && catRank[0][1] >= 2 && catRank[0][1] > confirmed.length / 3 ? catRank[0] : null;
  const featured = [...only, ...confirmed.filter((p) => p.cities.length > 1)].slice(0, 5);
  const nearby = (Object.keys(CITIES) as CitySlug[])
    .filter((c) => c !== slug)
    .map((c) => ({ c, km: distanceKm(CITIES[slug], CITIES[c]) }))
    .filter(({ km }) => km <= NEARBY_KM)
    .sort((a, b) => a.km - b.km)
    .slice(0, 4);
  const sameState = citiesOf(state).filter((c) => c !== slug && !nearby.some((n) => n.c === c)).slice(0, 3);
  const nat = national.length;
  const many = (n: number, one: string, other: string) => `${n} ${n === 1 ? one : other}`;
  const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);
  const stateName = STATES[state].name;

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

      <section className="mt-20 max-w-3xl space-y-4 text-lg leading-relaxed" aria-labelledby="sobre-ciudad">
        <h2 id="sobre-ciudad" className="display text-4xl sm:text-5xl">
          Promos de cumple en {name}, en corto
        </h2>
        {confirmed.length === 0 ? (
          <p>
            Por ahora no tenemos negocios propios de {name} con promo de cumpleaños confirmada, así que lo que ves aquí son {many(nat, "cadena nacional", "cadenas nacionales")} con sucursal o canje en línea. Si conoces un lugar de {name} que regale algo,{" "}
            <Link href="/promos#sugerir" className="font-bold underline underline-offset-4 hover:text-hot">
              mándanoslo
            </Link>{" "}
            y lo verificamos.
          </p>
        ) : (
          <>
            <p>
              En {name} hay {many(confirmed.length, "promo local confirmada", "promos locales confirmadas")}
              {nat > 0 && <>, además de {many(nat, "cadena nacional", "cadenas nacionales")}</>}.
              {lead ? (
                <> Lo que más pesa es {CATEGORIES[lead[0]].label.toLowerCase()} ({lead[1]} de {confirmed.length})</>
              ) : catRank.length > 1 ? (
                <> Están repartidas entre {join(catRank.slice(0, 3).map(([c]) => CATEGORIES[c].label.toLowerCase()))}, sin una categoría que domine</>
              ) : (
                <> Todas son de {CATEGORIES[catRank[0][0]].label.toLowerCase()}</>
              )}
              {lead && catRank.length > 1 && <>, seguido de {join(catRank.slice(1, 3).map(([c]) => CATEGORIES[c].label.toLowerCase()))}</>}.
            </p>
            {featured.length > 0 && (
              <p>
                {only.length > 0 ? "Para empezar, " : "Las más visibles son "}
                {featured.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && (i === featured.length - 1 ? " y " : ", ")}
                    <Link href={`/promos/${p.slug}`} className="font-bold underline underline-offset-4 hover:text-hot">
                      {brandOf(p)}
                    </Link>
                  </span>
                ))}
                {only.length > 0 ? "." : ", que también aplican en otras ciudades."}
                {only.length > 0 && (
                  <>
                    {" "}
                    {only.length === confirmed.length
                      ? `Todas son exclusivas de ${name}.`
                      : `${many(only.length, "es exclusiva", "son exclusivas")} de ${name}; ${confirmed.length - only.length === 1 ? "la otra también vale" : "las demás también valen"} en otras ciudades.`}
                  </>
                )}
              </p>
            )}
          </>
        )}
        <p>
          {nearby.length > 0 ? (
            <>
              Si te mueves por la zona, a menos de {NEARBY_KM} km también tienes{" "}
              {nearby.map(({ c }, i) => (
                <span key={c}>
                  {i > 0 && (i === nearby.length - 1 ? " y " : ", ")}
                  <Link href={`/ciudades/${c}`} className="font-bold underline underline-offset-4 hover:text-hot">
                    {CITIES[c].name}
                  </Link>
                </span>
              ))}
              .{" "}
            </>
          ) : sameState.length > 0 ? (
            <>
              No hay otra ciudad nuestra a menos de {NEARBY_KM} km; en {stateName} también puedes ver{" "}
              {sameState.map((c, i) => (
                <span key={c}>
                  {i > 0 && (i === sameState.length - 1 ? " y " : ", ")}
                  <Link href={`/ciudades/${c}`} className="font-bold underline underline-offset-4 hover:text-hot">
                    {CITIES[c].name}
                  </Link>
                </span>
              ))}
              .{" "}
            </>
          ) : null}
          Todo lo de{" "}
          <Link href={`/estados/${STATE_SLUG[state]}`} className="font-bold underline underline-offset-4 hover:text-hot">
            {stateName}
          </Link>{" "}
          está en su página de estado.
        </p>
      </section>

      <BusinessCta city={name} className="mt-20" />

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs([["Ciudades", "/ciudades"], [name, `/ciudades/${slug}`]]))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(itemList(`Promos de cumpleaños en ${name}`, [...national, ...local].slice(0, 50).map((p) => [`${p.brand}: ${p.benefit}`, `/promos/${p.slug}`])))}
      />
    </div>
  );
}
