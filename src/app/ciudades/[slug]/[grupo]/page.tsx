import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Ads";
import { BusinessCta } from "@/components/BusinessCta";
import { FaqList } from "@/components/FaqList";
import { PromoCard } from "@/components/PromoCard";
import { SplitText } from "@/components/Reveal";
import { CountUp } from "@/components/fx";
import { CITIES, STATES, type CitySlug } from "@/lib/places";
import { CATEGORIES } from "@/lib/promos";
import { GROUP_PAGE, STATE_SLUG, cityGroupParams, cityGroups, groupBySlug, promosInCityGroup } from "@/lib/seo-pages";
import { breadcrumbs, itemList, jsonLd } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return cityGroupParams();
}

const year = new Date().getFullYear();

function resolve(slug: string, grupo: string) {
  const city = slug in CITIES ? (slug as CitySlug) : null;
  const group = groupBySlug(grupo);
  return city && group && cityGroups(city).includes(group) ? { city, group } : null;
}

export async function generateMetadata({ params }: PageProps<"/ciudades/[slug]/[grupo]">): Promise<Metadata> {
  const { slug, grupo } = await params;
  const r = resolve(slug, grupo);
  if (!r) return {};
  const name = CITIES[r.city].name;
  const { local, national } = promosInCityGroup(r.city, r.group);
  const all = [...local, ...national];
  return {
    title: `${GROUP_PAGE[r.group].title(name)} (${year})`,
    description: `${all.length} lugares en ${name} que te regalan algo en tu cumpleaños: ${all.slice(0, 4).map((p) => p.brand).join(", ")} y más. Qué regalan, requisitos y cómo cobrarlo.`,
    alternates: { canonical: `/ciudades/${r.city}/${GROUP_PAGE[r.group].slug}` },
  };
}

export default async function CityGroupPage({ params }: PageProps<"/ciudades/[slug]/[grupo]">) {
  const { slug, grupo } = await params;
  const r = resolve(slug, grupo);
  if (!r) notFound();
  const { city, group } = r;
  const { name, state } = CITIES[city];
  const page = GROUP_PAGE[group];
  const { local, national } = promosInCityGroup(city, group);
  const all = [...local, ...national];
  const free = all.filter((p) => p.benefitType === "gratis");
  const noSignup = all.filter((p) => !p.program);
  const cats = [...new Set(all.map((p) => CATEGORIES[p.category].label.toLowerCase()))].slice(0, 4);
  const others = cityGroups(city).filter((g) => g !== group);

  const faq = [
    {
      q: page.question(name),
      a: `Hay ${all.length} lugares en ${name}. ${free.length ? `Totalmente gratis: ${free.slice(0, 5).map((p) => `${p.brand} (${p.benefit.toLowerCase()})`).join(", ")}.` : ""} El resto son descuentos, 2x1 o regalo con compra.`,
    },
    {
      q: "¿Cuáles no piden registrarse antes?",
      a: noSignup.length
        ? `${noSignup.slice(0, 6).map((p) => p.brand).join(", ")}: llegas en tu cumpleaños con tu identificación.`
        : "En esta lista todos piden registrarte antes en su programa o app; en Mi plan te decimos hasta cuándo.",
    },
    {
      q: `¿Qué negocios locales de ${name} entran?`,
      a: local.length
        ? `${local.slice(0, 6).map((p) => p.brand).join(", ")}${local.length > 6 ? ` y ${local.length - 6} más` : ""}.`
        : `Por ahora son cadenas con sucursal o cobro en ${name}. Si conoces un negocio local con promo, mándanoslo por WhatsApp.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex flex-wrap gap-2" aria-label="Migas">
        <Link href={`/estados/${STATE_SLUG[state]}`} className="underline-offset-4 hover:underline">
          {STATES[state].name}
        </Link>
        <span>/</span>
        <Link href={`/ciudades/${city}`} className="underline-offset-4 hover:underline">
          {name}
        </Link>
      </nav>
      <h1 className="display mt-4 text-[clamp(3.2rem,10vw,9rem)]">
        <SplitText text={page.h1} className="block text-[0.45em]" />
        <SplitText text={name} delay={0.25} className="block text-hot" />
      </h1>
      <p className="mt-8 max-w-3xl text-xl font-medium">
        <b className="display text-4xl">
          <CountUp value={all.length} />
        </b>{" "}
        {page.lead} en {name}
        {free.length > 0 && <>; {free.length} totalmente gratis</>}. Hay {cats.join(", ")}.
      </p>
      {others.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {others.map((g) => (
            <li key={g}>
              <Link href={`/ciudades/${city}/${GROUP_PAGE[g].slug}`} className="chip bg-paper transition-colors hover:bg-acid">
                {GROUP_PAGE[g].title(name)}
              </Link>
            </li>
          ))}
          <li>
            <Link href={`/ciudades/${city}`} className="chip bg-paper transition-colors hover:bg-acid">
              Todas las promos de {name}
            </Link>
          </li>
        </ul>
      )}

      <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((p, i) => (
          <li key={p.slug} className={i > 8 ? "lazy-paint" : undefined}>
            <PromoCard promo={p} />
          </li>
        ))}
      </ul>

      <AdSlot className="mt-16" />
      <FaqList items={faq} className="mt-16" />
      <BusinessCta city={name} className="mt-16" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbs([
            [STATES[state].name, `/estados/${STATE_SLUG[state]}`],
            [name, `/ciudades/${city}`],
            [page.title(name), `/ciudades/${city}/${page.slug}`],
          ]),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(itemList(page.title(name), all.map((p) => [`${p.brand}: ${p.benefit}`, `/promos/${p.slug}`])))} />
    </div>
  );
}

