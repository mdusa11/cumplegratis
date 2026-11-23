import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { SplitText } from "@/components/Reveal";
import { answers } from "@/lib/respuestas";
import { SITE, breadcrumbs, clip, jsonLd } from "@/lib/site";

const items = answers();

export const metadata: Metadata = {
  title: "Preguntas sobre regalos de cumpleaños en México, respondidas",
  description: clip(`Qué te regalan en tu cumpleaños, dónde comer gratis, qué piden con tu INE y cuándo registrarte: ${items.length} respuestas directas con marcas reales y datos al día.`),
  alternates: { canonical: "/respuestas" },
};

export default function Respuestas() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">Respuestas</p>
      <h1 className="display mt-3 text-[clamp(2.6rem,7vw,5.5rem)]">
        <SplitText text="Preguntas sobre regalos de cumpleaños en México," className="block" />
        <SplitText text="respondidas" delay={0.2} className="block text-hot" />
      </h1>
      <p className="mono-tag mt-4 opacity-70">Actualizado: {SITE.lastReview}</p>
      <p className="mt-8 max-w-3xl text-xl leading-relaxed font-medium">
        Lo que la gente le pregunta a Google y a los asistentes de IA, con la respuesta primero y marcas reales. Solo promociones verificadas con la marca y vigentes; las condiciones las pone cada marca.
      </p>
      <FaqList items={items} title="Las respuestas" className="mt-14" />
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/promos" className="btn btn-ink">
          Ver todas las promos
        </Link>
        <Link href="/mi-cumple" className="btn btn-paper">
          Armar mi plan
        </Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs([["Respuestas", "/respuestas"]]))} />
    </div>
  );
}
