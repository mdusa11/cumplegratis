"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdSlot } from "./Ads";
import { ChannelFilter, countChannels, type ChannelPick } from "./ChannelFilter";
import { Icon } from "./Icon";
import { PromoCard } from "./PromoCard";
import { TitleReveal } from "./fx";
import { channel } from "@/lib/availability";
import { CATEGORIES, GROUPS, type CategoryId, type Promo } from "@/lib/promos";
import type { CitySlug, StateCode } from "@/lib/places";
import { cn } from "@/lib/site";
import { saveLocation } from "@/lib/storage";

const PAGE = 12;

type Props = { city: CitySlug; state: StateCode; name: string; national: Promo[]; local: Promo[] };

export function CityPromos({ city, state, name, national, local }: Props) {
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [chan, setChan] = useState<ChannelPick>("todas");
  const loc = useMemo(() => ({ state, city }), [state, city]);
  const all = useMemo(() => [...local, ...national], [local, national]);

  const inCat = useMemo(() => all.filter((p) => !cat || p.category === cat), [all, cat]);
  const chanCounts = useMemo(() => countChannels(inCat, (p) => channel(p, loc)), [inCat, loc]);
  const inChan = useMemo(() => all.filter((p) => chan === "todas" || channel(p, loc) === chan), [all, chan, loc]);
  const catCounts = useMemo(() => {
    const counts = new Map<CategoryId, number>();
    inChan.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return counts;
  }, [inChan]);
  const shown = useMemo(() => new Set(inCat.filter((p) => chan === "todas" || channel(p, loc) === chan).map((p) => p.slug)), [inCat, chan, loc]);

  const groupOrder = Object.keys(GROUPS);
  const cats = (Object.keys(CATEGORIES) as CategoryId[])
    .filter((c) => all.some((p) => p.category === c))
    .sort((a, b) => groupOrder.indexOf(CATEGORIES[a].group) - groupOrder.indexOf(CATEGORIES[b].group));

  return (
    <>
      <div className="mt-10 border-y-[2.5px] border-ink py-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Tipo de lugar">
          <Pill active={!cat} onClick={() => setCat(null)}>
            Todo<Count active={!cat}>{inChan.length}</Count>
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

      {local.length > 0 && (
        <Section title={`Solo en ${name} y *alrededores`} hint="Negocios locales y cadenas regionales: las que casi nadie conoce." items={local} shown={shown} />
      )}
      {local.length > 0 && <AdSlot className="mt-16" />}
      <Section
        title="Las *favoritas de siempre"
        hint={`Cadenas que todos conocen: primero las que tienen sucursal en ${name}, luego las que se cobran en línea o en todo el país.`}
        items={national}
        shown={shown}
      />
      {local.length === 0 && <AdSlot className="mt-16" />}
      {shown.size === 0 && (
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
    </>
  );
}

// Todas las tarjetas viven en el HTML (SEO); las que no caben en la página o en el filtro solo se ocultan con CSS.
function Section({ title, hint, items, shown }: { title: string; hint: string; items: Promo[]; shown: Set<string> }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const rank = new Map(items.filter((p) => shown.has(p.slug)).map((p, i) => [p.slug, i]));
  const extra = Math.max(0, rank.size - PAGE);
  return (
    <section className={cn("mt-20", rank.size === 0 && "hidden")}>
      <TitleReveal text={title} className="text-5xl sm:text-7xl" />
      <p className="mt-3 text-lg font-medium">{hint}</p>
      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const i = rank.get(p.slug);
          return (
            <li key={p.slug} className={cn("lazy-paint", (i === undefined || (!open && i >= PAGE)) && "hidden")}>
              <PromoCard promo={p} />
            </li>
          );
        })}
      </ul>
      {extra > 0 && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="btn btn-paper mt-8">
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
