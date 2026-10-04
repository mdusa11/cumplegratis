"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { PromoCard } from "./PromoCard";
import { BENEFIT, GROUPS, groupOf, normalize, promos, type BenefitType, type GroupId } from "@/lib/promos";
import { cn } from "@/lib/site";

type GroupFilter = GroupId | "todos";

export function Catalog() {
  const params = useSearchParams();
  const initial = params.get("g");
  const [group, setGroup] = useState<GroupFilter>(initial && initial in GROUPS ? (initial as GroupId) : "todos");
  const [type, setType] = useState<BenefitType | "todos">("todos");
  const [noSignup, setNoSignup] = useState(false);
  const [query, setQuery] = useState("");

  const pickGroup = (g: GroupFilter) => {
    setGroup(g);
    const url = g === "todos" ? "/promos" : `/promos?g=${g}`;
    window.history.replaceState(null, "", url);
  };

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return promos.filter(
      (p) =>
        (group === "todos" || groupOf(p) === group) &&
        (type === "todos" || p.benefitType === type) &&
        (!noSignup || !p.program) &&
        (!q || normalize(`${p.brand} ${p.benefit} ${p.category}`).includes(q)),
    );
  }, [group, type, noSignup, query]);

  const reset = () => {
    pickGroup("todos");
    setType("todos");
    setNoSignup(false);
    setQuery("");
  };

  return (
    <>
      <div className="sticky top-[5.5rem] z-30 -mx-5 border-y-[2.5px] border-ink bg-paper/95 px-5 py-4 backdrop-blur-md sm:top-24 sm:-mx-8 sm:px-8">
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

      <div className="mt-10 flex items-baseline justify-between">
        <p className="display text-4xl">
          <AnimatedCount value={results.length} /> {results.length === 1 ? "promo" : "promos"}
        </p>
      </div>

      <motion.ul layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layoutId: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-full border-2 border-ink font-semibold whitespace-nowrap transition-colors",
        small ? "px-3 py-1 text-sm" : "px-4 py-2",
        active ? "text-paper" : "bg-paper hover:bg-paper-2",
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
