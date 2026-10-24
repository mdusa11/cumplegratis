"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { AdSlot } from "./Ads";
import { ChannelFilter } from "./ChannelFilter";
import { countChannels, type ChannelPick } from "@/lib/channels";
import { Icon } from "./Icon";
import { PromoCard } from "./PromoCard";
import { TitleReveal } from "./fx";
import { channel } from "@/lib/availability";
import { CATEGORIES, GROUPS, type CategoryId, type Promo } from "@/lib/promo-meta";
import type { CitySlug, StateCode } from "@/lib/places";
import { cn } from "@/lib/site";
import { useLazy } from "@/lib/use-lazy";
import { saveLocation } from "@/lib/storage";

const PAGE = 24;

type Card = { key: string; node: ReactNode };
/** Lo que trae el HTML estático: conteos y las primeras tarjetas de cada sección. El resto sale de `promosInCity`, que se baja aparte. */
export type CityInitial = { cats: [CategoryId, number][]; chans: Record<ChannelPick, number>; total: number; local: { total: number; first: Card[] }; national: { total: number; first: Card[] } };
type Props = { city: CitySlug; state: StateCode; name: string; initial: CityInitial };

const loadCity = (city: CitySlug) => import("@/lib/cities-data").then((m) => m.promosInCity(city));

export function CityPromos({ city, state, name, initial }: Props) {
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [chan, setChan] = useState<ChannelPick>("todas");
  const loc = useMemo(() => ({ state, city }), [state, city]);
  const [data, go] = useLazy(() => loadCity(city));
  const all = useMemo(() => (data ? [...data.local, ...data.national] : []), [data]);

  const inCat = useMemo(() => all.filter((p) => !cat || p.category === cat), [all, cat]);
  const chanCounts = useMemo(() => (data ? countChannels(inCat, (p) => channel(p, loc)) : initial.chans), [data, inCat, loc, initial.chans]);
  const inChan = useMemo(() => all.filter((p) => chan === "todas" || channel(p, loc) === chan), [all, chan, loc]);
  const catCounts = useMemo(() => {
    const counts = new Map<CategoryId, number>(data ? [] : initial.cats);
    if (data) inChan.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return counts;
  }, [data, inChan, initial.cats]);
  const shown = useMemo(() => new Set(inChan.filter((p) => !cat || p.category === cat).map((p) => p.slug)), [inChan, cat]);
  const total = data ? inChan.length : initial.total;

  const groupOrder = Object.keys(GROUPS);
  const cats = (Object.keys(CATEGORIES) as CategoryId[])
    .filter((c) => (data ? all.some((p) => p.category === c) : catCounts.has(c)))
    .sort((a, b) => groupOrder.indexOf(CATEGORIES[a].group) - groupOrder.indexOf(CATEGORIES[b].group));

  const sectionOf = (list: Promo[] | undefined, init: CityInitial["local"]) =>
    data ? { total: list!.filter((p) => shown.has(p.slug)).length, cards: list!.filter((p) => shown.has(p.slug)).map((p) => ({ key: p.slug, node: <PromoCard promo={p} /> })) } : { total: init.total, cards: init.first };
  const local = sectionOf(data?.local, initial.local);
  const national = sectionOf(data?.national, initial.national);

  return (
    <div onPointerDownCapture={go} onFocusCapture={go}>
      <div className="mt-10 border-y-[2.5px] border-ink py-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Tipo de lugar">
          <Pill active={!cat} onClick={() => setCat(null)}>
            Todo<Count active={!cat}>{total}</Count>
          </Pill>
          {cats.map((c) => {
            const n = catCounts.get(c) ?? 0;
            return (
              <Pill key={c} active={cat === c} onClick={() => setCat(c)} disabled={n === 0 && cat !== c}>
                <Icon name={CATEGORIES[c].icon} className="mr-1" />
                {CATEGORIES[c].label}
                <Count active={cat === c}>{n}</Count>
              </Pill>
            );
          })}
        </div>
        <div className="mt-3">
          <ChannelFilter id="city-channel" value={chan} onChange={setChan} counts={chanCounts} />
        </div>
        <Link href="/mi-cumple" onClick={() => saveLocation({ state, city })} className="btn btn-acid mt-4">
          Armar mi plan en {name} <Icon name="party" />
        </Link>
      </div>

      {local.total > 0 && (
        <Section title={`Solo en ${name} y *alrededores`} hint="Negocios locales y cadenas regionales: las que casi nadie conoce." section={local} go={go} />
      )}
      {local.total > 0 && <AdSlot className="mt-16" />}
      <Section
        title="Las *favoritas de siempre"
        hint={`Cadenas que todos conocen: primero las que tienen sucursal en ${name}, luego las que se cobran en línea o en todo el país.`}
        section={national}
        go={go}
      />
      {local.total === 0 && <AdSlot className="mt-16" />}
      {data && shown.size === 0 && (
        <div className="card mt-10 bg-paper-2 p-8 text-center">
          <p className="display text-4xl">Nada con esos filtros</p>
          <button
            type="button"
            onClick={() => {
              setCat(null);
              setChan("todas");
            }}
            className="btn btn-acid mt-5"
          >
            Quitar filtros
          </button>
        </div>
      )}
    </div>
  );
}

// El HTML trae las primeras 24 de cada sección (con enlaces a sus fichas); «Ver las restantes» baja el resto.
function Section({ title, hint, section, go }: { title: string; hint: string; section: { total: number; cards: Card[] }; go: () => void }) {
  const [open, setOpen] = useState(false);
  if (section.total === 0) return null;
  const extra = section.total - PAGE;
  const cards = open ? section.cards : section.cards.slice(0, PAGE);
  return (
    <section className="mt-20">
      <TitleReveal text={title} className="text-5xl sm:text-7xl" />
      <p className="mt-3 text-lg font-medium">{hint}</p>
      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.key} className="lazy-paint">
            {c.node}
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          onClick={() => {
            go();
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          className="btn btn-paper mt-8"
        >
          {open ? "Ver menos" : `Ver las ${extra} restantes`}
        </button>
      )}
    </section>
  );
}

function Pill({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold whitespace-nowrap transition-colors",
        active ? "bg-ink text-paper" : "bg-paper hover:bg-paper-2",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

const Count = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
  <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", active ? "bg-acid text-ink" : "bg-paper-2")}>{children}</span>
);
