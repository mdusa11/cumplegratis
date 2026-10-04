import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { SplitText, Reveal } from "@/components/Reveal";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guías de regalos de cumpleaños",
  description: "Guías para aprovechar todas las promociones de cumpleaños en México: qué te regalan, dónde comer gratis, qué no pide registro y cómo cobrarlo todo.",
  alternates: { canonical: "/guias" },
};

export default function Guias() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">Guías</p>
      <h1 className="display mt-3 text-[clamp(4rem,12vw,10rem)]">
        <SplitText text="Saca todo" className="block" />
        <SplitText text="tu cumple" delay={0.2} className="block text-hot" />
      </h1>
      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g, i) => (
          <Reveal key={g.slug} delay={(i % 2) * 0.08}>
            <Link href={`/guias/${g.slug}`} className="card group flex h-full flex-col bg-paper p-6 transition-[translate,box-shadow] hover:-translate-y-1 hover:shadow-hard-lg sm:p-8">
              <Icon name={g.icon} shadow className="!size-14 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />
              <h2 className="display mt-4 text-4xl">{g.short}</h2>
              <p className="mt-2 text-lg font-medium">{g.description}</p>
              <span className="mt-auto pt-6 font-bold">Leer guía →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
