import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, SplitText } from "@/components/Reveal";
import { MONTH_NOTE, capital, monthYear } from "@/lib/seo-pages";
import { MONTHS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Promociones de cumpleaños por mes",
  description: "Elige el mes en que cumples y descubre qué te regalan en tu cumpleaños en México y hasta cuándo registrarte en cada promo.",
  alternates: { canonical: "/cumpleanos" },
};

export default function MonthsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">12 meses</p>
      <h1 className="display mt-3 text-[clamp(4rem,13vw,11rem)]">
        <SplitText text="¿En qué mes" className="block" />
        <SplitText text="cumples?" delay={0.2} className="block text-hot" />
      </h1>
      <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MONTHS.map((mes, i) => (
          <li key={mes}>
            <Reveal delay={(i % 3) * 0.05} y={24} className="h-full">
              <Link href={`/cumpleanos/${mes}`} className="card group flex h-full flex-col bg-paper p-6 transition-[translate,box-shadow] hover:-translate-y-1 hover:shadow-hard-lg">
                <span className="display text-5xl">
                  {capital(mes)} {monthYear(i + 1)}
                </span>
                <span className="mt-2 font-medium">{MONTH_NOTE[i + 1].split(":")[0].split(".")[0]}.</span>
                <span className="mt-auto pt-4 font-bold">Ver qué te regalan →</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
