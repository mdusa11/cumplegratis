import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PromoCard } from "@/components/PromoCard";
import { SplitText } from "@/components/Reveal";
import { CountUp } from "@/components/fx";
import { CATEGORIES, GROUPS, byProminence, promos, type CategoryId } from "@/lib/promos";
import { breadcrumbs, itemList, jsonLd } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

const year = new Date().getFullYear();
const category = (slug: string) => (slug in CATEGORIES ? (slug as CategoryId) : null);
const inCategory = (c: CategoryId) => promos.filter((p) => p.category === c).sort(byProminence);

export async function generateMetadata({ params }: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const c = category((await params).slug);
  if (!c) return {};
  const list = inCategory(c);
  const label = CATEGORIES[c].label.toLowerCase();
  const brands = list.slice(0, 4).map((p) => p.brand).join(", ");
  return {
    title: `Promos de cumpleaños de ${label} en México ${year}`,
    description: `${list.length} lugares de ${label} que te regalan algo en tu cumpleaños: ${brands} y más. Requisitos, cuándo registrarte y cómo cobrarlo.`,
    alternates: { canonical: `/categorias/${c}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categorias/[slug]">) {
  const c = category((await params).slug);
  if (!c) notFound();
  const { label, icon, group } = CATEGORIES[c];
  const list = inCategory(c);
  const free = list.filter((p) => p.benefitType === "gratis").length;
  const siblings = (Object.keys(CATEGORIES) as CategoryId[]).filter((k) => k !== c && CATEGORIES[k].group === group);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex gap-2" aria-label="Migas">
        <Link href="/promos" className="underline-offset-4 hover:underline">
          Promos
        </Link>
        <span>/</span>
        <span>{GROUPS[group].label}</span>
      </nav>
      <h1 className="display mt-4 text-[clamp(3.6rem,11vw,10rem)]">
        <SplitText text="Cumpleaños con" className="block text-[0.45em]" />
        <span className="flex items-center gap-[0.18em]">
          <Icon name={icon} shadow className="!size-[0.85em] !align-baseline" />
          <SplitText text={label} delay={0.25} className="block text-hot" />
        </span>
      </h1>
      <p className="mt-8 max-w-2xl text-xl font-medium">
        <b className="display text-4xl">
          <CountUp value={list.length} />
        </b>{" "}
        promociones de {label.toLowerCase()} para tu cumpleaños en México
        {free > 0 && <>, {free} de ellas totalmente gratis</>}. Primero las cadenas más conocidas y verificadas; luego los negocios locales.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {siblings.map((s) => (
          <Link key={s} href={`/categorias/${s}`} className="chip bg-paper transition-colors hover:bg-acid">
            <Icon name={CATEGORIES[s].icon} /> {CATEGORIES[s].label}
          </Link>
        ))}
      </div>

      <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.slug} className="lazy-paint">
            <PromoCard promo={p} />
          </li>
        ))}
      </ul>

      <p className="mt-14 text-lg font-medium">
        ¿Quieres ver solo lo que hay en tu ciudad?{" "}
        <Link href={`/promos?g=${group}&c=${c}`} className="underline underline-offset-4 hover:text-hot">
          Filtra {label.toLowerCase()} por tu zona →
        </Link>
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs([["Promos", "/promos"], [label, `/categorias/${c}`]]))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          itemList(
            `Promos de cumpleaños de ${label}`,
            list.map((p) => [`${p.brand}: ${p.benefit}`, `/promos/${p.slug}`]),
          ),
        )}
      />
    </div>
  );
}
