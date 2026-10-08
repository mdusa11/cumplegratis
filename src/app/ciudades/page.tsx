import type { Metadata } from "next";
import Link from "next/link";
import { SplitText } from "@/components/Reveal";
import { Reveal } from "@/components/Reveal";
import { promosInCity } from "@/lib/cities-data";
import { CITIES, STATES, citiesOf, type StateCode } from "@/lib/places";
import { STATE_SLUG } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Promos de cumpleaños por ciudad",
  description: "Encuentra las promociones de cumpleaños de tu ciudad: negocios locales y cadenas nacionales en todo México.",
  alternates: { canonical: "/ciudades" },
};

export default function CitiesPage() {
  const states = (Object.keys(STATES) as StateCode[]).sort((a, b) => STATES[a].name.localeCompare(STATES[b].name, "es"));
  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">{Object.keys(CITIES).length} ciudades · 32 estados</p>
      <h1 className="display mt-3 text-[clamp(4rem,13vw,11rem)]">
        <SplitText text="Tu ciudad," className="block" />
        <SplitText text="tus regalos" delay={0.2} className="block text-hot" />
      </h1>
      <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {states.map((s, i) => (
          <Reveal key={s} delay={(i % 3) * 0.05} y={24} className="mb-5 break-inside-avoid">
            <section className="card bg-paper p-5">
              <h2 className="display text-3xl">
                <Link href={`/estados/${STATE_SLUG[s]}`} className="hover:text-hot hover:underline">
                  {STATES[s].name}
                </Link>
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {citiesOf(s).map((c) => {
                  const { local } = promosInCity(c);
                  return (
                    <li key={c}>
                      <Link href={`/ciudades/${c}`} className="chip bg-paper transition-colors hover:bg-acid">
                        {CITIES[c].name}
                        {local.length > 0 && <span className="rounded-full bg-ink px-1.5 text-xs text-paper">{local.length}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
