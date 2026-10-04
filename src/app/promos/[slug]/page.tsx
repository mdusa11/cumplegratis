import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BenefitBadge } from "@/components/BenefitBadge";
import { PromoCard } from "@/components/PromoCard";
import { ReportButtons } from "@/components/ReportButtons";
import { WhereCard } from "@/components/WhereCard";
import { Reveal, SplitText } from "@/components/Reveal";
import { TitleReveal } from "@/components/fx";
import { CATEGORIES, CONFIDENCE, GROUPS, WINDOW_LABEL, getPromo, groupOf, promos, relatedPromos, signupLabel, days, quickRules, type Promo } from "@/lib/promos";
import { API_ENABLED, SITE, jsonLd } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return promos.map((p) => ({ slug: p.slug }));
}

const year = new Date().getFullYear();

export async function generateMetadata({ params }: PageProps<"/promos/[slug]">): Promise<Metadata> {
  const promo = getPromo((await params).slug);
  if (!promo) return {};
  return {
    title: `${promo.brand} en tu cumpleaños ${year}: ${promo.benefit}`,
    description: `${promo.details} Requisitos, cuándo registrarte y cómo cobrarlo paso a paso.`.slice(0, 300),
    alternates: { canonical: `/promos/${promo.slug}` },
  };
}

function steps(p: Promo) {
  const list: { title: string; body: string }[] = [];
  if (p.program) {
    const when = p.registerDaysBefore ? `al menos ${days(p.registerDaysBefore)} antes de tu cumpleaños` : "con varias semanas de anticipación";
    list.push({ title: `Entra a ${p.program}`, body: `Regístrate ${when} y pon tu fecha de nacimiento en tu perfil.` });
  } else {
    list.push({ title: "No necesitas registrarte", body: "Basta con una identificación oficial que muestre tu fecha de nacimiento." });
  }
  list.push({ title: WINDOW_LABEL[p.window], body: p.windowNote });
  list.push({ title: "Cóbralo", body: p.howToClaim });
  return list;
}

export default async function PromoPage({ params }: PageProps<"/promos/[slug]">) {
  const promo = getPromo((await params).slug);
  if (!promo) notFound();

  const cat = CATEGORIES[promo.category];
  const group = GROUPS[groupOf(promo)];
  const confidence = CONFIDENCE[promo.confidence];
  const related = relatedPromos(promo);
  const faq = [
    { q: `¿Qué regala ${promo.brand} en tu cumpleaños?`, a: `${promo.benefit}. ${promo.details}` },
    {
      q: `¿Hay que registrarse para el regalo de cumpleaños de ${promo.brand}?`,
      a: promo.program ? `Sí, en ${promo.program}. ${signupLabel(promo)}.` : "No, basta con tu identificación oficial.",
    },
    { q: `¿Cuándo se puede cobrar?`, a: promo.windowNote },
  ];

  return (
    <article>
      <header className="relative overflow-hidden border-b-[2.5px] border-ink px-5 pt-32 pb-16 sm:px-8 md:pt-40" style={{ background: group.color }}>
        <div className="relative z-10 mx-auto max-w-7xl">
          <nav className="mono-tag flex gap-2" aria-label="Migas">
            <Link href="/promos" className="underline-offset-4 hover:underline">
              Promos
            </Link>
            <span>/</span>
            <Link href={`/promos?g=${groupOf(promo)}`} className="underline-offset-4 hover:underline">
              {cat.emoji} {cat.label}
            </Link>
          </nav>
          <h1 className="mt-6">
            <span className="display block text-[clamp(4rem,15vw,13rem)] break-words">
              <SplitText text={promo.brand} stagger={0.04} />
            </span>
            <span className="mt-4 block max-w-3xl text-3xl leading-tight font-bold sm:text-4xl">{promo.benefit} en tu cumpleaños</span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-2">
            <BenefitBadge type={promo.benefitType} />
            <span className="chip bg-paper">{WINDOW_LABEL[promo.window]}</span>
            <span className="chip bg-paper">{signupLabel(promo)}</span>
            {promo.minPurchase && <span className="chip bg-paper">Compra mínima ${promo.minPurchase.toLocaleString("es-MX")}</span>}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {promo.signupUrl && (
              <a href={promo.signupUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-ink max-w-full !whitespace-normal" data-cursor="Ir">
                {promo.program ? `Registrarme en ${promo.program}` : "Sitio oficial"} ↗
              </a>
            )}
            <Link href="/mi-cumple" className="btn btn-paper">
              Ver mi plan completo
            </Link>
          </div>
        </div>
        <span aria-hidden className="pointer-events-none absolute -right-8 -bottom-10 text-[9rem] opacity-50 select-none sm:-right-10 sm:-bottom-16 sm:text-[22rem] sm:opacity-90">
          {cat.emoji}
        </span>
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <TitleReveal text="Lo que necesitas" className="text-6xl sm:text-7xl" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickRules(promo).map((r, i) => (
              <Reveal key={r.label} delay={i * 0.06} y={24}>
                <div className="card flex h-full flex-col gap-2 bg-paper p-4">
                  <span className="text-4xl">{r.icon}</span>
                  <span className="leading-tight font-bold">{r.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <TitleReveal text="Cómo cobrarlo" className="mt-16 text-6xl sm:text-7xl" />
          <ol className="mt-8 space-y-5">
            {steps(promo).map((s, i) => (
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
        </section>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <WhereCard promo={promo} />
          </Reveal>
          <Reveal className="card bg-paper-2 p-6">
            <p className="mono-tag">¿Qué tan segura es?</p>
            <p className="display mt-2 text-4xl">{confidence.label}</p>
            <p className="mt-2">{confidence.hint}</p>
            {promo.sources.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {promo.sources.map((s) => (
                  <li key={s} className="truncate">
                    <a href={s} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-hot">
                      {new URL(s).hostname.replace("www.", "")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mono-tag mt-4 opacity-60">Revisada: {SITE.lastReview}</p>
          </Reveal>
          {API_ENABLED && (
          <Reveal delay={0.1} className="card bg-acid p-6">
            <p className="mono-tag">¿Ya la cobraste?</p>
            <p className="display mt-2 mb-5 text-4xl">¿Te funcionó?</p>
            <ReportButtons slug={promo.slug} />
          </Reveal>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t-[2.5px] border-ink bg-paper-2 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="display text-6xl sm:text-7xl">También en {group.label.toLowerCase()}</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PromoCard key={p.slug} promo={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}
      />
    </article>
  );
}
