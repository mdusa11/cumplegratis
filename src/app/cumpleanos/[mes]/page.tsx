import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Ads";
import { FaqList } from "@/components/FaqList";
import { PromoCard } from "@/components/PromoCard";
import { SplitText } from "@/components/Reveal";
import { TitleReveal } from "@/components/fx";
import { formatDate } from "@/lib/plan";
import { MONTH_NOTE, capital, monthBySlug, monthDeadlines, monthName, monthPromos, monthYear } from "@/lib/seo-pages";
import { MONTHS, breadcrumbs, itemList, jsonLd } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return MONTHS.map((mes) => ({ mes }));
}

export async function generateMetadata({ params }: PageProps<"/cumpleanos/[mes]">): Promise<Metadata> {
  const m = monthBySlug((await params).mes);
  if (!m) return {};
  const name = monthName(m);
  const year = monthYear(m);
  const { total, free } = monthPromos();
  return {
    title: `Promociones de cumpleaños en ${name} ${year} en México`,
    description: `¿Cumples en ${name}? ${total} promos de cumpleaños en México (${free.length} gratis) y hasta cuándo registrarte en cada una para cobrarlas en ${name} ${year}.`,
    alternates: { canonical: `/cumpleanos/${MONTHS[m - 1]}` },
  };
}

export default async function MonthPage({ params }: PageProps<"/cumpleanos/[mes]">) {
  const m = monthBySlug((await params).mes);
  if (!m) notFound();
  const name = monthName(m);
  const year = monthYear(m);
  const { wholeMonth, noSignup, free, total } = monthPromos();
  const deadlines = monthDeadlines(m, year).slice(0, 24);
  const earliest = deadlines.reduce((d, x) => (x.first < d ? x.first : d), deadlines[0]?.first ?? new Date(year, m - 1, 1));
  const prev = MONTHS[(m + 10) % 12];
  const next = MONTHS[m % 12];

  const faq = [
    {
      q: `¿Qué te regalan en tu cumpleaños si cumples en ${name}?`,
      a: `Las mismas ${total} promos de todo el año aplican en ${name}: ${free.length} son gratis, como ${free.slice(0, 4).map((p) => `${p.brand} (${p.benefit.toLowerCase()})`).join(", ")}. Lo que cambia es hasta cuándo debes registrarte.`,
    },
    {
      q: `¿Cuándo me tengo que registrar si cumplo en ${name}?`,
      a: `Depende de la marca: algunas piden registrarte 30 días antes o más. Si cumples a principios de ${name} ${year}, empieza a registrarte desde el ${formatDate(earliest)}. En Mi plan pones tu fecha exacta y te damos la lista con cada fecha límite.`,
    },
    {
      q: `¿Qué promos duran todo ${name}?`,
      a: `${wholeMonth.length} promociones verificadas se pueden cobrar durante todo tu mes de cumpleaños, por ejemplo ${wholeMonth.slice(0, 5).map((p) => p.brand).join(", ")}.`,
    },
    {
      q: "¿Cuáles no piden registro?",
      a: `${noSignup.length} promociones verificadas no piden registro previo: llegas con tu identificación en tu cumpleaños. Por ejemplo ${noSignup.slice(0, 5).map((p) => p.brand).join(", ")}.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex gap-2" aria-label="Migas">
        <Link href="/cumpleanos" className="underline-offset-4 hover:underline">
          Por mes
        </Link>
        <span>/</span>
        <span>{capital(name)}</span>
      </nav>
      <h1 className="display mt-4 text-[clamp(3.6rem,11vw,10rem)]">
        <SplitText text="¿Cumples en" className="block text-[0.45em]" />
        <SplitText text={`${name}?`} delay={0.25} className="block text-hot" />
      </h1>
      <p className="mt-8 max-w-3xl text-xl font-medium">
        Esto te regalan en tu cumpleaños en {name} {year}: {total} promociones en México, {free.length} totalmente gratis. {MONTH_NOTE[m]}
      </p>
      <Link href="/mi-cumple" className="btn btn-ink mt-8">
        Armar mi plan de {name}
      </Link>

      <section className="mt-20">
        <TitleReveal text="Hasta cuándo *registrarte" className="text-5xl sm:text-7xl" />
        <p className="mt-3 max-w-3xl text-lg font-medium">
          Las marcas que piden registro y la fecha límite si cumples el 1 o el último día de {name} {year}. Cuando la marca no publica la anticipación usamos 30 días para ir a la segura.
        </p>
        <div className="card mt-8 overflow-x-auto bg-paper p-2 sm:p-4">
          <table className="w-full min-w-[520px] text-left">
            <thead className="mono-tag">
              <tr className="border-b-2 border-ink">
                <th className="p-2">Marca</th>
                <th className="p-2">Regalo</th>
                <th className="p-2">Si cumples el 1</th>
                <th className="p-2">Si cumples el {new Date(year, m, 0).getDate()}</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => (
                <tr key={d.promo.slug} className="border-b border-ink/15">
                  <td className="p-2 font-bold">
                    <Link href={`/promos/${d.promo.slug}`} className="hover:text-hot hover:underline">
                      {d.promo.brand}
                    </Link>
                  </td>
                  <td className="p-2 text-sm">{d.promo.benefit}</td>
                  <td className="p-2 text-sm whitespace-nowrap">
                    {formatDate(d.first)}
                    {d.estimated && "*"}
                  </td>
                  <td className="p-2 text-sm whitespace-nowrap">
                    {formatDate(d.last)}
                    {d.estimated && "*"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-2 text-xs opacity-70">* La marca no publica la anticipación; usamos 30 días.</p>
        </div>
      </section>

      <AdSlot className="mt-16" />

      <section className="mt-16">
        <TitleReveal text={`Para cobrar *todo ${name}`} className="text-5xl sm:text-7xl" />
        <p className="mt-3 text-lg font-medium">Promos verificadas que valen durante todo tu mes de cumpleaños.</p>
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wholeMonth.slice(0, 18).map((p) => (
            <li key={p.slug} className="lazy-paint">
              <PromoCard promo={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <TitleReveal text="Sin *registro previo" className="text-5xl sm:text-7xl" />
        <p className="mt-3 text-lg font-medium">Llegas en tu cumpleaños con tu identificación y listo.</p>
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {noSignup.slice(0, 12).map((p) => (
            <li key={p.slug} className="lazy-paint">
              <PromoCard promo={p} />
            </li>
          ))}
        </ul>
      </section>

      <FaqList items={faq} className="mt-20" />

      <nav className="mt-14 flex flex-wrap gap-3" aria-label="Otros meses">
        <Link href={`/cumpleanos/${prev}`} className="btn btn-paper">
          ← {capital(prev)}
        </Link>
        <Link href={`/cumpleanos/${next}`} className="btn btn-paper">
          {capital(next)} →
        </Link>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs([["Por mes", "/cumpleanos"], [capital(name), `/cumpleanos/${MONTHS[m - 1]}`]]))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(itemList(`Promociones de cumpleaños en ${name}`, wholeMonth.slice(0, 18).map((p) => [`${p.brand}: ${p.benefit}`, `/promos/${p.slug}`])))}
      />
    </div>
  );
}
