"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChannelFilter } from "./ChannelFilter";
import { countChannels, type ChannelPick } from "@/lib/channels";
import { track } from "@/lib/track";
import { AdSlot } from "./Ads";
import { Icon } from "./Icon";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { PromoCard } from "./PromoCard";
import { locationName, useAutoAskLocation, useLocation } from "./LocationProvider";
import { availability, channel, isAvailable } from "@/lib/availability";
import { SAFE_DAYS } from "@/lib/plan";
import { BENEFIT, CATEGORIES, GROUPS, byProminence, groupOf, normalize, type BenefitType, type CategoryId, type GroupId, type Promo } from "@/lib/promo-meta";
import { PAGE_SIZE, cn } from "@/lib/site";
import { loadPromos, useLazy } from "@/lib/use-lazy";

type GroupFilter = GroupId | "todos";

const LAYOUT_LIMIT = 36;
const ANIMATED_ITEMS = 24;

type Sort = "populares" | "az" | "facil";
const SORTS: { id: Sort; label: string }[] = [
  { id: "populares", label: "Más populares" },
  { id: "az", label: "A-Z" },
  { id: "facil", label: "Más fácil" },
];
const pick = <T extends string>(v: string | null, allowed: readonly string[], fallback: T) => (v && allowed.includes(v) ? (v as T) : fallback);

// Anuncios ligeros: después de la tarjeta 12 y de la 36.
const AD_AFTER = [11, 35];

const NONE: Promo[] = [];

/** `children` trae las primeras tarjetas ya en el HTML; la lista completa se baja aparte (en reposo, al tocar algo o si la URL trae filtros). */
export function Catalog({ total, channels, children }: { total: number; channels: Record<ChannelPick, number>; children: ReactNode }) {
  const params = useSearchParams();
  const [group, setGroup] = useState<GroupFilter>(pick(params.get("g"), Object.keys(GROUPS), "todos"));
  const [cat, setCat] = useState<CategoryId | null>(() => {
    const c = params.get("c");
    return c && c in CATEGORIES ? (c as CategoryId) : null;
  });
  const [type, setType] = useState<BenefitType | "todos">(pick(params.get("tipo"), Object.keys(BENEFIT), "todos"));
  const [noSignup, setNoSignup] = useState(params.get("sinregistro") === "1");
  const [onlyConfirmed, setOnlyConfirmed] = useState(params.get("confirmadas") === "1");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [everywhere, setEverywhere] = useState(params.get("zonas") === "1");
  const [chan, setChan] = useState<ChannelPick>(pick(params.get("canal"), ["local", "sucursal", "en-linea"], "todas"));
  const [sort, setSort] = useState<Sort>(pick(params.get("orden"), ["az", "facil"], "populares"));
  const { location, openPicker } = useLocation();
  useAutoAskLocation();
  const [all, go] = useLazy(loadPromos, params.toString() !== "");
  const promos = all ?? NONE;
  useEffect(() => {
    if (location) go();
  }, [location, go]);
  const filtering = group !== "todos" || !!cat || type !== "todos" || noSignup || onlyConfirmed || !!query.trim() || everywhere || chan !== "todas" || sort !== "populares" || !!location;

  // Todos los filtros viajan en la URL (sin apilar historial): recargar o volver de una ficha los conserva.
  useEffect(() => {
    const qs = new URLSearchParams();
    if (group !== "todos") qs.set("g", group);
    if (cat) qs.set("c", cat);
    if (type !== "todos") qs.set("tipo", type);
    if (noSignup) qs.set("sinregistro", "1");
    if (onlyConfirmed) qs.set("confirmadas", "1");
    if (chan !== "todas") qs.set("canal", chan);
    if (everywhere) qs.set("zonas", "1");
    if (sort !== "populares") qs.set("orden", sort);
    if (query.trim()) qs.set("q", query.trim());
    const search = qs.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [group, cat, type, noSignup, onlyConfirmed, chan, everywhere, sort, query]);

  const pickGroup = (g: GroupFilter) => {
    setGroup(g);
    setCat(null);
  };
  const pickCat = setCat;

  // Todo menos el tipo: sirve para contar cuántas promos hay de cada tipo con los demás filtros puestos.
  const base = useMemo(() => {
    const q = normalize(query.trim());
    return promos.filter(
      (p) =>
        (group === "todos" || groupOf(p) === group) &&
        (type === "todos" || p.benefitType === type) &&
        (!noSignup || !p.program) &&
        (!onlyConfirmed || p.confidence !== "baja") &&
        (!location || everywhere || isAvailable(availability(p, location))) &&
        (!q || normalize(`${p.brand} ${p.benefit} ${CATEGORIES[p.category].label}`).includes(q)),
    );
  }, [promos, group, type, noSignup, onlyConfirmed, query, location, everywhere]);

  const catCounts = useMemo(() => {
    const counts = new Map<CategoryId, number>();
    base.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return counts;
  }, [base]);

  const inCat = useMemo(() => base.filter((p) => !cat || p.category === cat), [base, cat]);
  const chanCounts = useMemo(() => countChannels(inCat, (p) => channel(p, location)), [inCat, location]);

  const results = useMemo(() => {
    const list = chan === "todas" ? inCat : inCat.filter((p) => channel(p, location) === chan);
    // Famosas verificadas arriba, luego locales verificadas, luego lo sin confirmar; lo de otras zonas siempre al final.
    const away = (p: (typeof list)[number]) => (location && !isAvailable(availability(p, location)) ? 1 : 0);
    const order: Record<Sort, (a: Promo, b: Promo) => number> = {
      populares: byProminence,
      az: (a, b) => a.brand.localeCompare(b.brand, "es"),
      // Sin registro primero y luego los que piden menos anticipación (si la marca no lo dice, se asumen 30 días).
      facil: (a, b) => Number(!!a.program) - Number(!!b.program) || (a.registerDaysBefore ?? SAFE_DAYS) - (b.registerDaysBefore ?? SAFE_DAYS) || byProminence(a, b),
    };
    return [...list].sort((a, b) => away(a) - away(b) || order[sort](a, b));
  }, [inCat, chan, location, sort]);
  const count = all ? results.length : total;

  // Cada cambio de filtro u orden vuelve a las primeras 24.
  const sig = `${group}|${cat}|${type}|${noSignup}|${onlyConfirmed}|${everywhere}|${chan}|${sort}|${query}`;
  const [paging, setPaging] = useState({ sig, n: PAGE_SIZE });
  const shown = paging.sig === sig ? paging.n : PAGE_SIZE;
  const visible = results.slice(0, shown);

  // Qué filtros usa la gente (solo cuando cambian, no al cargar).
  const prevFilters = useRef<Record<string, string> | null>(null);
  useEffect(() => {
    const now: Record<string, string> = { grupo: group, categoria: cat ?? "todas", tipo: type, "sin-registro": String(noSignup), confirmadas: String(onlyConfirmed), "otras-zonas": String(everywhere), canal: chan };
    const prev = prevFilters.current;
    prevFilters.current = now;
    if (!prev) return;
    for (const k of Object.keys(now)) if (now[k] !== prev[k]) track("filter", { target: `${k}:${now[k]}` });
  }, [group, cat, type, noSignup, onlyConfirmed, everywhere, chan]);

  const reset = () => {
    setEverywhere(true);
    pickGroup("todos");
    setCat(null);
    setType("todos");
    setNoSignup(false);
    setOnlyConfirmed(false);
    setChan("todas");
    setQuery("");
    setSort("populares");
  };

  return (
    <div onPointerDownCapture={go} onFocusCapture={go}>
      {/* En móvil la barra no se queda pegada: con tantas opciones taparía media pantalla. */}
      <div className="z-30 -mx-5 border-y-[2.5px] border-ink bg-paper px-5 py-4 transition-[top] duration-[450ms] ease-[var(--ease-out-expo)] desk:bg-paper/95 desk:backdrop-blur-md sm:-mx-8 sm:px-8 lg:sticky lg:top-24 lg:in-data-[nav=hidden]:top-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup id="groups">
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categoría">
              {(["todos", ...Object.keys(GROUPS)] as GroupFilter[]).map((g) => (
                <Pill key={g} active={group === g} onClick={() => pickGroup(g)} layoutId="group-pill">
                  {g === "todos" ? (
                    "Todas"
                  ) : (
                    <>
                      <Icon name={GROUPS[g].icon} className="mr-1" />
                      {GROUPS[g].label}
                    </>
                  )}
                </Pill>
              ))}
            </div>
          </LayoutGroup>
          <label className="relative block lg:w-72">
            <span className="sr-only">Buscar marca</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una marca…"
              className="field !py-2.5 !text-base !shadow-hard-sm"
            />
          </label>
        </div>
        <AnimatePresence initial={false}>
          {group !== "todos" && (
            <motion.div
              key={group}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-3 pb-1" role="group" aria-label="Tipo de producto">
                <LayoutGroup id="cats">
                  {(["todas", ...(Object.keys(CATEGORIES) as CategoryId[]).filter((c) => CATEGORIES[c].group === group)] as (CategoryId | "todas")[]).map((c, i) => {
                    const active = c === "todas" ? !cat : cat === c;
                    const count = c === "todas" ? base.length : (catCounts.get(c) ?? 0);
                    return (
                      <motion.div key={c} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 26 }}>
                        <Pill small active={active} onClick={() => pickCat(c === "todas" ? null : c)} layoutId="cat-pill" disabled={count === 0 && !active}>
                          {c === "todas" ? (
                            `Todo ${GROUPS[group].label.toLowerCase()}`
                          ) : (
                            <>
                              <Icon name={CATEGORIES[c].icon} className="mr-1" />
                              {CATEGORIES[c].label}
                            </>
                          )}
                          <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", active ? "bg-acid text-ink" : "bg-paper-2")}>{count}</span>
                        </Pill>
                      </motion.div>
                    );
                  })}
                </LayoutGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <LayoutGroup id="types">
            {(["todos", ...Object.keys(BENEFIT)] as (BenefitType | "todos")[]).map((t) => (
              <Pill key={t} small active={type === t} onClick={() => setType(t)} layoutId="type-pill">
                {t === "todos" ? "Cualquier regalo" : BENEFIT[t].label}
              </Pill>
            ))}
          </LayoutGroup>
          <button
            type="button"
            onClick={() => setNoSignup((v) => !v)}
            aria-pressed={noSignup}
            className={cn("chip shrink-0 transition-colors", noSignup ? "bg-acid" : "bg-paper hover:bg-paper-2")}
          >
            <motion.span animate={{ rotate: noSignup ? 0 : -90, scale: noSignup ? 1 : 0.6 }}>{noSignup ? "✓" : "○"}</motion.span>
            Sin registro previo
          </button>
          <button
            type="button"
            onClick={() => setOnlyConfirmed((v) => !v)}
            aria-pressed={onlyConfirmed}
            title="Oculta las promos que solo vimos en redes y no pudimos confirmar con la marca"
            className={cn("chip shrink-0 transition-colors", onlyConfirmed ? "bg-acid" : "bg-paper hover:bg-paper-2")}
          >
            <motion.span animate={{ rotate: onlyConfirmed ? 0 : -90, scale: onlyConfirmed ? 1 : 0.6 }}>{onlyConfirmed ? "✓" : "○"}</motion.span>
            Solo confirmadas
          </button>
        </div>
      </div>

      <div className="mt-3">
        <ChannelFilter id="catalog-channel" value={chan} onChange={setChan} counts={all ? chanCounts : channels} />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <p className="display text-4xl sm:text-5xl">
          <AnimatedCount value={count} /> {count === 1 ? "promo" : "promos"}
          {location && !everywhere && <span className="text-hot"> cerca de {locationName(location).split(",")[0]}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 font-semibold">
            <span className="mono-tag">Ordenar</span>
            <span className="relative block">
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field cursor-pointer !w-auto !py-2 !pr-9 !text-base !shadow-hard-sm">
                {SORTS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                ▼
              </span>
            </span>
          </label>
          {location && (
            <button
              type="button"
              onClick={() => setEverywhere((v) => !v)}
              aria-pressed={everywhere}
              className="flex items-center gap-3 rounded-full border-2 border-ink bg-paper py-1.5 pr-4 pl-1.5 font-semibold"
            >
              <span className={cn("flex h-7 w-12 items-center rounded-full border-2 border-ink p-0.5 transition-colors", everywhere ? "bg-acid" : "bg-paper-2")}>
                <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={cn("size-5 rounded-full bg-ink", everywhere && "ml-auto")} />
              </span>
              Incluir otras zonas
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {location ? (
          <motion.button
            key="loc"
            type="button"
            onClick={openPicker}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline"
          >
            <Icon name="pin" /> {locationName(location, true)} · cambiar
          </motion.button>
        ) : (
          <motion.button
            key="ask"
            type="button"
            onClick={openPicker}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-ink bg-sun px-4 py-2 text-left font-medium transition-colors hover:bg-sun/80"
          >
            <Icon name="pin" className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              <b>¿Dónde estás?</b> Dinos tu ciudad y ves solo lo que te queda cerca.
            </span>
            <u className="shrink-0 font-semibold">Elegir</u>
          </motion.button>
        )}
      </AnimatePresence>

      {!all && (
        <>
          <div className={cn("mt-4", filtering && "invisible")}>{children}</div>
          {total > PAGE_SIZE && !filtering && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  go();
                  setPaging({ sig, n: PAGE_SIZE * 2 });
                }}
                className="btn btn-ink"
              >
                Ver {Math.min(PAGE_SIZE, total - PAGE_SIZE)} más <span className="opacity-70">({PAGE_SIZE} de {total})</span>
              </button>
            </div>
          )}
        </>
      )}
      {/* Reacomodo animado solo con listas cortas; con cientos de tarjetas mediría todas en cada filtro. */}
      {all && (
      <motion.ul layout={visible.length <= LAYOUT_LIMIT} className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.flatMap((p, i) => [
            <motion.li
              key={p.slug}
              layout={visible.length <= LAYOUT_LIMIT}
              initial={i < ANIMATED_ITEMS ? { opacity: 0, scale: 0.85, y: 20 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={i < ANIMATED_ITEMS ? { opacity: 0, scale: 0.85 } : { opacity: 0, transition: { duration: 0 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className={i >= ANIMATED_ITEMS ? "lazy-paint" : undefined}
            >
              <PromoCard promo={p} />
            </motion.li>,
            ...(AD_AFTER.includes(i)
              ? [
                  <li key={`ad-${i}`} className="col-span-full">
                    <AdSlot />
                  </li>,
                ]
              : []),
          ])}
        </AnimatePresence>
      </motion.ul>
      )}

      {all && results.length > shown && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setPaging({ sig, n: shown + PAGE_SIZE })} className="btn btn-ink">
            Ver {Math.min(PAGE_SIZE, results.length - shown)} más <span className="opacity-70">({shown} de {results.length})</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {all && results.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card mt-6 bg-paper-2 p-10 text-center">
            <Icon name="search" shadow className="!size-16" />
            <p className="display mt-4 text-5xl">Nada por aquí</p>
            <button type="button" onClick={reset} className="btn btn-acid mt-6">
              Quitar filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
  layoutId,
  small,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layoutId: string;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative shrink-0 rounded-full border-2 border-ink font-semibold whitespace-nowrap transition-colors",
        small ? "px-3 py-1 text-sm" : "px-4 py-2",
        active ? "text-paper" : "bg-paper hover:bg-paper-2",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {active && (
        <motion.span layoutId={layoutId} className="absolute inset-[-2px] -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function AnimatedCount({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="inline-block rounded-lg bg-acid px-2"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
