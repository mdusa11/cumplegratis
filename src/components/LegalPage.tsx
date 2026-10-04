import type { ReactNode } from "react";
import { SplitText } from "./Reveal";
import { LEGAL } from "@/lib/site";

/** Layout de páginas legales: índice pegajoso a la izquierda, secciones numeradas a la derecha. */
export function LegalPage({ kicker, title, intro, sections }: { kicker: string; title: string; intro: ReactNode; sections: { id: string; title: string; body: ReactNode }[] }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">{kicker}</p>
      <h1 className="display mt-3 text-[clamp(3.4rem,10vw,8rem)]">
        <SplitText text={title} />
      </h1>
      <p className="mono-tag mt-4 opacity-70">Última actualización: {LEGAL.updated}</p>
      <div className="mt-8 max-w-3xl text-xl leading-relaxed font-medium">{intro}</div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Índice" className="hidden lg:block">
          <ol className="sticky top-28 space-y-2 border-l-[2.5px] border-ink pl-4">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="font-semibold transition-colors hover:text-hot">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="display flex items-baseline gap-3 text-4xl sm:text-5xl">
                <span className="text-hot">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="legal mt-4 space-y-4 text-lg leading-relaxed">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
