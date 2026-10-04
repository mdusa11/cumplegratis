import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SplitText } from "@/components/Reveal";
import { TitleReveal } from "@/components/fx";
import { BenefitBadge } from "@/components/BenefitBadge";
import { GUIDES, getGuide, promoLine } from "@/lib/guides";
import { CATEGORIES } from "@/lib/promos";
import { SITE, breadcrumbs, jsonLd, pageUrl } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: PageProps<"/guias/[slug]">): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: `/guias/${g.slug}` }, openGraph: { type: "article" } };
}

export default async function GuidePage({ params }: PageProps<"/guias/[slug]">) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((o) => o.slug !== g.slug);

  return (
    <article className="mx-auto max-w-4xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <nav className="mono-tag flex gap-2" aria-label="Migas">
        <Link href="/guias" className="underline-offset-4 hover:underline">
          Guías
        </Link>
      </nav>
      <Icon name={g.icon} shadow className="mt-6 !size-16" />
      <h1 className="display mt-3 text-[clamp(3rem,8vw,6.5rem)]">
        <SplitText text={g.title} stagger={0.012} />
      </h1>
      <p className="mono-tag mt-4 opacity-70">Actualizada: {SITE.lastReview}</p>
      <p className="mt-8 text-xl leading-relaxed font-medium">{g.intro}</p>

      {g.sections.map((s) => (
        <section key={s.title} className="mt-14">
          <div className="flex items-center gap-3">
            {s.icon && <Icon name={s.icon} shadow className="!size-10 sm:!size-12" />}
            <TitleReveal text={s.title} as="h2" className="text-4xl sm:text-5xl" />
          </div>
          {s.text && <p className="mt-4 text-lg leading-relaxed">{s.text}</p>}
          {s.promos && s.promos.length > 0 && (
            <ol className="mt-6 space-y-3">
              {s.promos.map((p, i) => (
                <li key={p.slug} className="lazy-paint card flex gap-4 bg-paper p-4 sm:p-5">
                  <span className="display flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-acid text-xl">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/promos/${p.slug}`} className="display text-3xl hover:text-hot">
                        {p.brand}
                      </Link>
                      <BenefitBadge type={p.benefitType} className="!text-sm" />
                    </div>
                    <p className="mt-1 text-lg font-semibold">{p.benefit}</p>
                    <p className="mt-1 text-sm">
                      <Icon name={CATEGORIES[p.category].icon} className="mr-1" /> <span className="opacity-80">{promoLine(p)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {s.tips && (
            <ul className="mt-6 space-y-3">
              {s.tips.map((t) => (
                <li key={t} className="flex gap-3 text-lg">
                  <span aria-hidden className="mt-1.5 size-3 shrink-0 rotate-45 border-2 border-ink bg-hot" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mt-16">
        <h2 className="display text-4xl sm:text-5xl">Preguntas frecuentes</h2>
        <div className="mt-6 space-y-6">
          {g.faq.map((f) => (
            <div key={f.q}>
              <h3 className="text-xl font-bold">{f.q}</h3>
              <p className="mt-1 text-lg">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="card mt-16 bg-acid p-6 sm:p-8">
        <p className="display text-4xl">Arma tu plan en 2 segundos</p>
        <p className="mt-2 text-lg font-medium">Pon tu fecha y tu ciudad y te decimos qué registrar y hasta cuándo.</p>
        <Link href="/mi-cumple" className="btn btn-ink mt-5">
          Armar mi plan <Icon name="party" />
        </Link>
      </div>

      <nav className="mt-14" aria-label="Más guías">
        <p className="mono-tag">Más guías</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/guias/${o.slug}`} className="chip bg-paper transition-colors hover:bg-acid">
                <Icon name={o.icon} /> {o.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbs([["Guías", "/guias"], [g.short, `/guias/${g.slug}`]]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.description,
            inLanguage: "es-MX",
            mainEntityOfPage: pageUrl(`/guias/${g.slug}`),
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ])}
      />
    </article>
  );
}
