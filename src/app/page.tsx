import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { HowItWorks } from "@/components/HowItWorks";
import { PromoCard } from "@/components/PromoCard";
import { BirthdayPicker } from "@/components/BirthdayPicker";
import { Faq, type QA } from "@/components/Faq";
import { Reveal, ScrollWords } from "@/components/Reveal";
import { jsonLd } from "@/lib/site";
import { GROUPS, groupOf, promos, stats, type GroupId } from "@/lib/promos";

const featured = promos.filter((p) => p.benefitType === "gratis" && p.confidence === "alta");
const stickers = featured.filter((p) => p.brand.length <= 11);

const FAQ: QA[] = [
  {
    q: "¿Qué marcas regalan algo en tu cumpleaños en México?",
    a: `Tenemos ${stats.total} marcas: cafeterías como Starbucks, cines como Cinépolis y Cinemex, restaurantes, tiendas de belleza, ropa, tecnología y más. ${stats.free} regalan algo totalmente gratis.`,
  },
  {
    q: "¿Por qué hay que registrarse antes?",
    a: "La mayoría de las promos de cumpleaños vienen de programas de lealtad. Si te registras el mismo día, el sistema todavía no sabe que es tu cumpleaños. Por eso te decimos con cuánta anticipación entrar a cada uno.",
  },
  {
    q: "¿Cómo sé que una promo sigue vigente?",
    a: "Cada promo trae su fuente y un sello: Verificada (sitio oficial), Reportada (medios recientes) o Sin confirmar. Además, quien la cobra nos dice si le funcionó.",
  },
  {
    q: "¿Cumplegratis cuesta algo?",
    a: "No. Es gratis y no necesitas cuenta. Tu fecha se guarda solo en tu navegador.",
  },
];

export default function Home() {
  const counts = promos.reduce<Record<GroupId, number>>(
    (acc, p) => ({ ...acc, [groupOf(p)]: acc[groupOf(p)] + 1 }),
    { comida: 0, tiendas: 0, diversion: 0, servicios: 0 },
  );

  return (
    <>
      <Hero featured={stickers} total={stats.total} />

      <Marquee className="-rotate-2 border-y-[2.5px] border-ink bg-ink py-4 text-paper">
        {promos.slice(0, 14).map((p) => (
          <span key={p.slug} className="display flex items-center text-5xl sm:text-6xl">
            <span className="px-6">{p.brand}</span>
            <span className="text-acid">{p.benefit}</span>
            <span className="px-6 text-4xl text-lilac">✺</span>
          </span>
        ))}
      </Marquee>

      <section className="mx-auto max-w-6xl px-5 py-32 sm:px-8 sm:py-44">
        <ScrollWords
          className="display text-[clamp(2.6rem,6.5vw,6rem)] leading-[0.95]"
          text="Cada año las marcas regalan miles de cafés, pasteles, boletos y descuentos a quien cumple. La mayoría se *pierden porque nadie sabe que existen. *Ya *no."
        />
      </section>

      <HowItWorks />

      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal>
          <p className="mono-tag">Explora</p>
          <h2 className="display mt-3 text-[clamp(3.5rem,9vw,8rem)]">¿Qué se te antoja?</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {(Object.keys(GROUPS) as GroupId[]).map((id, i) => (
            <Reveal key={id} delay={i * 0.08}>
              <Link
                href={`/promos?g=${id}`}
                data-cursor="Ver"
                className="card group relative flex min-h-64 flex-col justify-between overflow-hidden p-7 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-hard-lg"
                style={{ background: GROUPS[id].color }}
              >
                <div className="flex items-start justify-between">
                  <span className="mono-tag rounded-full border-2 border-ink bg-paper px-3 py-1">{counts[id]} promos</span>
                  <span className="text-7xl transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-125 group-hover:-rotate-12">
                    {GROUPS[id].emoji}
                  </span>
                </div>
                <div>
                  <h3 className="display text-7xl sm:text-8xl">{GROUPS[id].label}</h3>
                  <p className="mt-2 text-lg font-medium">{GROUPS[id].blurb}</p>
                </div>
                <span className="absolute right-6 bottom-6 flex size-14 items-center justify-center rounded-full border-[2.5px] border-ink bg-paper text-2xl transition-transform duration-300 group-hover:rotate-[-45deg]">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y-[2.5px] border-ink bg-paper-2 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mono-tag">100% gratis</p>
              <h2 className="display mt-3 text-[clamp(3.5rem,9vw,8rem)]">Lo más regalado</h2>
            </div>
            <Link href="/promos" className="btn btn-paper">
              Ver las {stats.total} →
            </Link>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                <PromoCard promo={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-acid px-5 py-32 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="display text-[clamp(4rem,13vw,12rem)]">¿Cuándo cumples?</h2>
            <p className="mx-auto mt-6 max-w-xl text-xl font-medium">Te armamos tu calendario de regalos en dos segundos.</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 flex justify-center">
            <BirthdayPicker size="lg" />
          </Reveal>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl scroll-mt-28 px-5 py-28 sm:px-8">
        <Reveal>
          <p className="mono-tag">Preguntas</p>
          <h2 className="display mt-3 mb-12 text-[clamp(3.5rem,9vw,8rem)]">Lo que todos preguntan</h2>
        </Reveal>
        <Faq items={FAQ} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          })}
        />
      </section>
    </>
  );
}
