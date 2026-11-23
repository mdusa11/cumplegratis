import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal, SplitText } from "@/components/Reveal";
import { CATEGORIES, GROUPS, promos, type CategoryId, type GroupId } from "@/lib/promos";

export const metadata: Metadata = {
  title: "Promos de cumpleaños por categoría",
  description: "Café, postres, restaurantes, cine, belleza, parques y más: elige qué quieres que te regalen en tu cumpleaños y ve todas las promos de esa categoría en México.",
  alternates: { canonical: "/categorias" },
};

export default function CategoriesPage() {
  const count = (c: CategoryId) => promos.filter((p) => p.category === c).length;
  const groups = Object.keys(GROUPS) as GroupId[];
  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 md:pt-40">
      <p className="mono-tag">{Object.keys(CATEGORIES).length} categorías · {promos.length} promos</p>
      <h1 className="display mt-3 text-[clamp(4rem,13vw,11rem)]">
        <SplitText text="¿Qué se te" className="block" />
        <SplitText text="antoja?" delay={0.2} className="block text-hot" />
      </h1>
      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {groups.map((g, i) => (
          <Reveal key={g} delay={(i % 2) * 0.05} y={24}>
            <section className="card bg-paper h-full p-5">
              <h2 className="display flex items-center gap-2 text-3xl">
                <Icon name={GROUPS[g].icon} shadow /> {GROUPS[g].label}
              </h2>
              <p className="mt-1 font-medium">{GROUPS[g].blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(CATEGORIES) as CategoryId[])
                  .filter((c) => CATEGORIES[c].group === g && count(c) > 0)
                  .map((c) => (
                    <li key={c}>
                      <Link href={`/categorias/${c}`} className="chip bg-paper transition-colors hover:bg-acid">
                        <Icon name={CATEGORIES[c].icon} /> {CATEGORIES[c].label}
                        <span className="rounded-full bg-ink px-1.5 text-xs text-paper">{count(c)}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
