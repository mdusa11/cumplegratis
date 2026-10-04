"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { PromoCard } from "./PromoCard";
import { Pin, locationName, useAutoAskLocation, useLocation } from "./LocationProvider";
import { AVAILABILITY_RANK, availability, isAvailable } from "@/lib/availability";
import { BENEFIT, CATEGORIES, GROUPS, groupOf, normalize, promos, type BenefitType, type CategoryId, type GroupId } from "@/lib/promos";
import { BASE_PATH, cn } from "@/lib/site";

type GroupFilter = GroupId | "todos";

export function Catalog() {
  const params = useSearchParams();
  const initial = params.get("g");
  const initialCat = params.get("c");
  const [group, setGroup] = useState<GroupFilter>(initial && initial in GROUPS ? (initial as GroupId) : "todos");
  const [cat, setCat] = useState<CategoryId | null>(initialCat && initialCat in CATEGORIES ? (initialCat as CategoryId) : null);
  const [type, setType] = useState<BenefitType | "todos">("todos");
  const [noSignup, setNoSignup] = useState(false);
  const [query, setQuery] = useState("");
  const [everywhere, setEverywhere] = useState(false);
  const { location, openPicker } = useLocation();
  useAutoAskLocation();

  const syncUrl = (g: GroupFilter, c: CategoryId | null) => {
    const qs = new URLSearchParams();
    if (g !== "todos") qs.set("g", g);
    if (c) qs.set("c", c);
    const search = qs.toString();
    window.history.replaceState(null, "", `${BASE_PATH}/promos${BASE_PATH ? "/" : ""}${search ? `?${search}` : ""}`);
  };
  const pickGroup = (g: GroupFilter) => {
    setGroup(g);
    setCat(null);
    syncUrl(g, null);
  };
  const pickCat = (c: CategoryId | null) => {
    setCat(c);
    syncUrl(group, c);
  };

  // Todo menos el tipo: sirve para contar cuántas promos hay de cada tipo con los demás filtros puestos.
  const base = useMemo(() => {
    const q = normalize(query.trim());
    return promos.filter(
      (p) =>
        (group === "todos" || groupOf(p) === group) &&
        (type === "todos" || p.benefitType === type) &&
        (!noSignup || !p.program) &&
        (!location || everywhere || isAvailable(availability(p, location))) &&
        (!q || normalize(`${p.brand} ${p.benefit} ${CATEGORIES[p.category].label}`).includes(q)),
    );
  }, [group, type, noSignup, query, location, everywhere]);

  const catCounts = useMemo(() => {
    const counts = new Map<CategoryId, number>();
    base.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return counts;
  }, [base]);

  const results = useMemo(() => {
    const list = base.filter((p) => !cat || p.category === cat);
    if (!location) return list;
    // Lo local primero (lo que menos gente conoce), luego cadenas nacionales; lo de otras zonas al final.
    return [...list].sort((a, b) => AVAILABILITY_RANK[availability(a, location)] - AVAILABILITY_RANK[availability(b, location)]);
  }, [base, cat, location]);


  const reset = () => {
    setEverywhere(true);
    pickGroup("todos");
    setCat(null);
    setType("todos");
    setNoSignup(false);
    setQuery("");
  };

  return (
    <>
      {/* En móvil la barra no se queda pegada: con tantas opciones taparía media pantalla. */}
      <div className="z-30 -mx-5 border-y-[2.5px] border-ink bg-paper/95 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:sticky lg:top-24">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup id="groups">
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categoría">
              {(["todos", ...Object.keys(GROUPS)] as GroupFilter[]).map((g) => (
                <Pill key={g} active={group === g} onClick={() => pickGroup(g)} layoutId="group-pill">
                  {g === "todos" ? "Todas" : `${GROUPS[g].emoji} ${GROUPS[g].label}`}
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
                          {c === "todas" ? `Todo ${GROUPS[group].label.toLowerCase()}` : `${CATEGORIES[c].emoji} ${CATEGORIES[c].label}`}
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
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <p className="display text-4xl sm:text-5xl">
          <AnimatedCount value={results.length} /> {results.length === 1 ? "promo" : "promos"}
          {location && !everywhere && <span className="text-hot"> cerca de {locationName(location).split(",")[0]}</span>}
        </p>
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
            📍 {locationName(location, true)} · cambiar
          </motion.button>
        ) : (
          <motion.button
            key="ask"
            type="button"
            onClick={openPicker}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card mt-4 flex w-full items-center gap-4 bg-sun p-4 text-left transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-hard-lg sm:p-5"
          >
            <Pin bounce className="shrink-0" />
            <span>
              <span className="display block text-3xl">¿Dónde estás?</span>
              <span className="font-medium">No todas las promos están en todos los estados. Dinos tu ciudad y te mostramos solo las que te quedan cerca.</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.ul layout className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <PromoCard promo={p} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {results.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card mt-6 bg-paper-2 p-10 text-center">
            <p className="text-6xl">😵‍💫</p>
            <p className="display mt-4 text-5xl">Nada por aquí</p>
            <button type="button" onClick={reset} className="btn btn-acid mt-6">
              Quitar filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
