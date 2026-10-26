import type { Metadata } from "next";
import { ShareButton } from "@/components/ShareButton";
import { AdSlot } from "@/components/Ads";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BenefitBadge } from "@/components/BenefitBadge";
import { PromoCard } from "@/components/PromoCard";
import { ReportButtons } from "@/components/ReportButtons";
import { WhereCard } from "@/components/WhereCard";
import { ParallaxIcon } from "@/components/ParallaxIcon";
import { Reveal, SplitText } from "@/components/Reveal";
import { TitleReveal } from "@/components/fx";
import { CATEGORIES, CONFIDENCE, GROUPS, WINDOW_LABEL, coverageLabel, getPromo, groupOf, money, promos, relatedPromos, signupLabel, days, quickRules, validityText, readableSources, type Promo } from "@/lib/promos";
import { ReportChange } from "@/components/ReportChange";
import { breadcrumbs, clip, jsonLd } from "@/lib/site";
import { DoneToggle, PersonalCard } from "@/components/PromoActions";
import { FaqList } from "@/components/FaqList";
import { CITIES, STATES } from "@/lib/places";
import { STATE_SLUG } from "@/lib/seo-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return promos.map((p) => ({ slug: p.slug }));
}

const year = new Date().getFullYear();

// Como la gente lo busca: "<marca> cumpleaños", qué regala y el año. Si no cabe (~60), el regalo va en la descripción.
const plainBrand = (b: string) => b.replace(/\s*\([^)]*\)/g, "").trim();
const brandCount = promos.reduce((m, p) => m.set(plainBrand(p.brand), (m.get(plainBrand(p.brand)) ?? 0) + 1), new Map<string, number>());

function promoTitle(p: Promo) {
  // Varias sucursales o sedes comparten marca: conservar el paréntesis (ciudad, sede) para que cada título sea único.
  const brand = (brandCount.get(plainBrand(p.brand)) ?? 0) > 1 ? p.brand : plainBrand(p.brand);
  const gift = p.benefit.charAt(0).toLowerCase() + p.benefit.slice(1);
  const full = `${brand} cumpleaños: ${gift} (${year})`;
  if (full.length <= 62) return full;
  const mid = `${brand} cumpleaños ${year}: qué regala y requisitos`;
  return mid.length <= 62 ? mid : `${brand}: regalo de cumpleaños ${year}`;
}

export async function generateMetadata({ params }: PageProps<"/promos/[slug]">): Promise<Metadata> {
  const promo = getPromo((await params).slug);
  if (!promo) return {};
  return {
    title: promoTitle(promo),
    description: clip(`${promo.details} Requisitos, cuándo registrarte y cómo cobrarlo paso a paso.`),
    alternates: { canonical: `/promos/${promo.slug}` },
    // Sin confirmar: visible en el sitio, pero fuera del índice de Google hasta verificarla (calidad del dominio).
    ...(promo.confidence === "baja" && { robots: { index: false, follow: true } }),
  };
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();
const host = (u: string) => new URL(u).hostname.replace("www.", "");

function steps(p: Promo) {
  const list: { title: string; body: string }[] = [];
  if (p.program) {
    const when = p.registerDaysBefore ? `al menos ${days(p.registerDaysBefore)} antes de tu cumpleaños` : null;
    list.push({
      title: `Entra a ${p.program}`,
      body: when
        ? `Regístrate ${when} y pon tu fecha de nacimiento en tu perfil.`
        : "Regístrate cuanto antes: la marca no publica con cuántos días de anticipación (te recomendamos 30). Pon tu fecha de nacimiento en tu perfil.",
    });
  } else {
    list.push({ title: "No necesitas registrarte", body: "Basta con una identificación oficial que muestre tu fecha de nacimiento." });
  }
  list.push({ title: WINDOW_LABEL[p.window], body: [p.windowNote, validityText(p)].filter(Boolean).join(". ") });
  list.push({ title: "Cóbralo", body: p.howToClaim });
  return list;
}

function SourceList({ list, className = "mt-4" }: { list: string[]; className?: string }) {
  return (
    <ul className={`${className} space-y-1 text-sm`}>
      {list.map((s) => (
        <li key={s} className="truncate">
          <a href={s} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-hot">
            {host(s)}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function PromoPage({ params }: PageProps<"/promos/[slug]">) {
  const promo = getPromo((await params).slug);
  if (!promo) notFound();

  const cat = CATEGORIES[promo.category];
  const group = GROUPS[groupOf(promo)];
  const confidence = CONFIDENCE[promo.confidence];
  const related = relatedPromos(promo);
  const extras = [
    promo.needsId && "llevar una identificación oficial (INE)",
    promo.companions && `ir con ${promo.companions} ${promo.companions === 1 ? "acompañante" : "acompañantes"}`,
    promo.minPurchase && `una compra mínima de ${money(promo.minPurchase)}`,
  ].filter(Boolean);
  const stepList = steps(promo);
  const faq = [
    { q: `¿Qué regala ${promo.brand} en tu cumpleaños?`, a: `${promo.benefit}. ${promo.details}` },
    {
      q: `¿Hay que registrarse para el regalo de cumpleaños de ${promo.brand}?`,
      a: promo.program ? `Sí, en ${promo.program}. ${signupLabel(promo)}.` : "No, basta con tu identificación oficial.",
    },
    { q: `¿Cuándo se puede cobrar el regalo de ${promo.brand}?`, a: [promo.windowNote, validityText(promo)].filter(Boolean).join(". ") },
    { q: `¿Cómo pido mi regalo de cumpleaños en ${promo.brand}?`, a: promo.howToClaim },
    { q: `¿En qué ciudades aplica?`, a: [coverageLabel(promo), promo.locationNote].filter(Boolean).join(". ") },
    ...(extras.length ? [{ q: "¿Qué piden para dártelo?", a: `Además de tu fecha de cumpleaños, piden ${extras.join(", ")}.` }] : []),
  ];
  // En pantalla se omiten las preguntas que solo repiten "La letra chiquita" o los pasos; el JSON-LD conserva todas.
  const seen = [promo.details, ...stepList.map((s) => s.body)].map(norm);
  const visibleFaq = faq.filter((f) => !seen.some((t) => t && (norm(f.a).includes(t) || t === norm(f.a))));
  // Enlaces a las páginas de ciudad y estado donde aplica (también ayudan a que Google las descubra).
  const allCities = promo.cities.length ? promo.cities : (promo.presence?.cities ?? []);
  const allStates = promo.cities.length ? [] : promo.states.length ? promo.states : (promo.presence?.states ?? []);
  const onlyStates = allStates.length > 8;
  const where = [
    ...(onlyStates ? [] : allCities.map((c) => ({ href: `/ciudades/${c}`, name: CITIES[c].name }))),
    ...allStates.map((st) => ({ href: `/estados/${STATE_SLUG[st]}`, name: STATES[st].name })),
  ].filter((w, i, a) => a.findIndex((x) => x.name === w.name) === i);
  const brandHost = (promo.signupUrl ? host(promo.signupUrl) : "").split(".").slice(-2).join(".");
  const sources = readableSources(promo.sources).sort((a, b) => Number(host(b).endsWith(brandHost) && !!brandHost) - Number(host(a).endsWith(brandHost) && !!brandHost));
  const mainSources = sources.length > 2 ? sources.slice(0, 2) : sources;
  const moreSources = sources.slice(mainSources.length);

  return (
    <article>
      <header className="relative overflow-hidden border-b-[2.5px] border-ink px-5 pt-32 pb-16 sm:px-8 md:pt-40" style={{ background: group.color }}>
        <div className="relative z-10 mx-auto max-w-7xl">
          <nav className="mono-tag flex gap-2" aria-label="Migas">
            <Link href="/promos" className="-my-3.5 inline-block py-3.5 underline-offset-4 hover:underline">
              Promos
            </Link>
            <span>/</span>
            <Link href={`/categorias/${promo.category}`} className="-my-3.5 inline-block py-3.5 underline-offset-4 hover:underline">
              <Icon name={cat.icon} /> {cat.label}
            </Link>
          </nav>
          <h1 className="mt-6">
            {/* Se achica si la palabra más larga no cabe en el ancho: así no se parte ni se sale. */}
            <span
              className="display block text-[clamp(4rem,15vw,13rem)]"
              style={{ fontSize: `min(clamp(4rem, 15vw, 13rem), calc(86vw / ${Math.max(...promo.brand.split(" ").map((w) => w.length)) * 0.5}))` }}
            >
              <SplitText text={promo.brand} stagger={0.04} />
            </span>
            <span className="mt-4 block max-w-3xl text-3xl leading-tight font-bold sm:text-4xl">{promo.benefit}
              {/cumple/i.test(promo.benefit) ? "" : " en tu cumpleaños"}
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-2">
            <BenefitBadge type={promo.benefitType} />
            <span className="chip bg-paper">{WINDOW_LABEL[promo.window]}</span>
            <span className="chip bg-paper">{signupLabel(promo)}</span>
            <span className="chip bg-paper"><Icon name="pin" /> {coverageLabel(promo)}</span>
            {promo.minPurchase && <span className="chip bg-paper">Compra mínima ${promo.minPurchase.toLocaleString("es-MX")}</span>}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {promo.signupUrl && (
              <a href={promo.signupUrl} target="_blank" rel="noopener noreferrer nofollow" data-promo={promo.slug} {...(promo.program && { "data-register": promo.slug, "data-program": promo.program })} className="btn btn-ink max-w-full !whitespace-normal" data-cursor="Ir">
                {promo.program ? `Registrarme en ${promo.program}` : "Sitio oficial"} ↗︎
              </a>
            )}
            <Link href="/mi-cumple" className="btn btn-paper">
              Armar mi plan de cumpleaños
            </Link>
            <ShareButton path={`/promos/${promo.slug}/`} text={`${promo.brand}: ${promo.benefit} en tu cumpleaños. Así se cobra:`} />
          </div>
          {promo.program && (
            <div className="mt-6 flex max-w-2xl flex-col items-start gap-3">
              <PersonalCard promo={promo} className="w-full" />
              <DoneToggle promo={promo} />
            </div>
          )}
          <p className="mt-6 text-lg font-bold">
            <Link href={`/categorias/${promo.category}/`} className="underline underline-offset-4 hover:text-hot">
              Más de {cat.label} →
            </Link>
          </p>
        </div>
        <ParallaxIcon name={cat.icon} />
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <TitleReveal text="Lo que necesitas" className="text-6xl sm:text-7xl" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickRules(promo).map((r, i) => (
              <Reveal key={r.label} delay={i * 0.06} y={24}>
                <div className="card flex h-full flex-col gap-2 bg-paper p-4">
                  <Icon name={r.icon} shadow className="!size-10" />
                  <span className="leading-tight font-bold">{r.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <TitleReveal text="Cómo cobrarlo" className="mt-16 text-6xl sm:text-7xl" />
          <ol className="mt-8 space-y-5">
            {stepList.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <li className="card flex gap-5 bg-paper p-6">
                  <span className="display flex size-14 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-acid text-3xl">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="display text-3xl">{s.title}</h3>
                    <p className="mt-1 text-lg">{s.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <AdSlot className="mt-14" />

          <Reveal className="mt-14">
            <h2 className="display text-5xl">La letra chiquita</h2>
            <p className="mt-4 text-lg leading-relaxed">{promo.details}</p>
            {promo.requirements.length > 0 && (
              <ul className="mt-5 space-y-2">
                {promo.requirements.map((r) => (
                  <li key={r} className="flex gap-3 text-lg">
                    <span aria-hidden className="mt-1.5 size-3 shrink-0 rotate-45 border-2 border-ink bg-hot" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <FaqList items={visibleFaq} jsonLdItems={faq} className="mt-16" />

          {where.length > 0 && (
            <nav className="mt-14" aria-label={`Dónde aplica ${promo.brand}`}>
              <h2 className="display text-4xl sm:text-5xl">Más promos donde aplica</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {where.slice(0, 8).map((w) => (
                  <li key={w.href}>
                    <Link href={w.href} className="chip bg-paper transition-colors hover:bg-acid">
                      {w.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/ciudades/" className="mt-4 inline-block font-bold underline underline-offset-4 hover:text-hot">
                Ver todas las ciudades →
              </Link>
            </nav>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <WhereCard promo={promo} />
          </Reveal>
          <Reveal className="card bg-paper-2 p-6">
            <p className="mono-tag">¿Qué tan segura es?</p>
            <p className="display mt-2 text-4xl">{confidence.label}</p>
            <p className="mt-2">{confidence.hint}</p>
            {sources.length > 0 && (
              <>
                <SourceList list={mainSources} />
                {moreSources.length > 0 && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer font-bold">Ver más fuentes</summary>
                    <SourceList list={moreSources} className="mt-2" />
                  </details>
                )}
              </>
            )}
            <ReportChange slug={promo.slug} brand={promo.brand} className="mt-4" />
          </Reveal>
          <Reveal delay={0.1} className="card bg-acid p-6">
            <p className="mono-tag">¿Ya la cobraste?</p>
            <p className="display mt-2 mb-5 text-4xl">¿Te funcionó?</p>
            <ReportButtons slug={promo.slug} brand={promo.brand} />
          </Reveal>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t-[2.5px] border-ink bg-paper-2 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="display text-6xl sm:text-7xl">Más promos de {cat.label.toLowerCase()}</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PromoCard key={p.slug} promo={p} />
              ))}
            </div>
            <Link href={`/categorias/${promo.category}/`} className="mt-10 inline-block text-xl font-bold underline underline-offset-4 hover:text-hot">
              Ver todas las de {cat.label} →
            </Link>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbs([
            ["Promos", "/promos"],
            [cat.label, `/categorias/${promo.category}`],
            [promo.brand, `/promos/${promo.slug}`],
          ]),
        )}
      />
    </article>
  );
}
