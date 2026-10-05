"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { useLocation } from "./LocationProvider";
import { useOpenPromo } from "./PromoSheet";
import { AVAILABILITY_RANK, availability, type Availability } from "@/lib/availability";
import { CITIES, STATES } from "@/lib/places";
import { CATEGORIES, GROUPS, byProminence, groupOf, normalize, promos } from "@/lib/promos";
import { lockScroll } from "@/lib/scroll";
import { cn, whatsappUrl } from "@/lib/site";

export const openSearch = () => window.dispatchEvent(new Event("cg:search"));

const MAX = 40;
const SUGGESTIONS = ["Starbucks", "Cine", "Pastel", "Spa", "Hamburguesa", "Tepic", "Sin registro"];

// Texto buscable de cada promo: marca, programa, regalo, categoría y dónde aplica (incluidas las sucursales de cadenas).
const INDEX = promos.map((p) => {
  const places = [...p.cities, ...(p.presence?.cities ?? [])].map((c) => CITIES[c].name);
  const states = [...p.states, ...(p.presence?.states ?? [])].map((s) => STATES[s].name);
  const cat = CATEGORIES[p.category];
  return {
    p,
    brand: normalize(p.brand),
    text: normalize(
      [p.brand, p.program, p.benefit, cat.label, GROUPS[cat.group].label, p.locationNote, p.program ? "" : "sin registro", ...places, ...states].join(" "),
    ),
  };
});

const CHIP: Partial<Record<Availability, [string, string]>> = {
  "tu-ciudad": ["En tu ciudad", "bg-acid"],
  cerca: ["Cerca de ti", "bg-acid"],
  "tu-estado": ["En tu estado", "bg-sun"],
  nacional: ["Todo México", "bg-paper"],
  "en-linea": ["En línea", "bg-sky"],
  fuera: ["No está en tu zona", "bg-hot"],
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const { location } = useLocation();
  const openPromo = useOpenPromo();

  useEffect(() => {
    const show = () => setOpen(true);
    const key = (e: KeyboardEvent) => {
      const typing = (e.target as Element | null)?.closest?.("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("cg:search", show);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("cg:search", show);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    const t = setTimeout(() => input.current?.focus(), 60);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", esc);
      clearTimeout(t);
    };
  }, [open]);

  const q = normalize(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    const words = q.split(/\s+/);
    return INDEX.filter((e) => words.every((w) => e.text.includes(w)))
      .map((e) => ({
        p: e.p,
        a: location ? availability(e.p, location) : null,
        score: e.brand.startsWith(q) ? 0 : e.brand.includes(q) ? 1 : 2,
      }))
      .sort(
        (x, y) =>
          x.score - y.score || (x.a && y.a ? AVAILABILITY_RANK[x.a] - AVAILABILITY_RANK[y.a] : 0) || byProminence(x.p, y.p),
      );
  }, [q, location]);

  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex justify-center px-3 pt-3 sm:px-6 sm:pt-[8vh]" role="dialog" aria-modal aria-label="Buscar promos">
          <motion.button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink/70 desk:bg-ink/55 desk:backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="card relative flex max-h-[min(80svh,46rem)] w-full max-w-2xl flex-col self-start overflow-hidden bg-paper shadow-hard-lg"
          >
            <div className="flex items-center gap-3 border-b-[2.5px] border-ink p-3 sm:p-4">
              <Icon name="search" className="!size-7 shrink-0" />
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca un lugar, ciudad o regalo…"
                aria-label="Buscar"
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none placeholder:text-ink/40 sm:text-2xl"
              />
              <button type="button" onClick={close} aria-label="Cerrar" className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-ink">
                <Icon name="close" />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
              {q.length < 2 ? (
                <div>
                  <p className="mono-tag opacity-70">Prueba con</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setQuery(s)} className="chip bg-paper transition-colors hover:bg-acid">
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium opacity-70">Busca entre {promos.length} promos de todo México, sin importar tu zona.</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="display text-4xl">No lo tenemos… aún</p>
                  <p className="mt-2 font-medium">Si sabes que «{query.trim()}» regala algo en tu cumpleaños, avísanos.</p>
                  <a
                    href={whatsappUrl(`Hola, ¿${query.trim()} tiene promo de cumpleaños? No la encontré en Cumplegratis.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ink mt-4 gap-2 !text-lg"
                  >
                    <Icon name="whatsapp" /> Avisar por WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  <p className="mono-tag mb-2 opacity-70">
                    {results.length} {results.length === 1 ? "resultado" : "resultados"}
                  </p>
                  <ul className="space-y-2">
                    {results.slice(0, MAX).map(({ p, a }) => {
                      const chip = a && CHIP[a];
                      return (
                        <li key={p.slug}>
                          <button
                            type="button"
                            onClick={() => {
                              close();
                              openPromo(p);
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-3 text-left transition-colors hover:bg-paper-2",
                              a === "fuera" && "opacity-60",
                            )}
                          >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink" style={{ background: GROUPS[groupOf(p)].color }}>
                              <Icon name={CATEGORIES[p.category].icon} tone="var(--color-paper)" className="!size-6" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="display block truncate text-2xl">{p.brand}</span>
                              <span className="block truncate text-sm font-medium">{p.benefit}</span>
                            </span>
                            {chip && <span className={cn("chip hidden shrink-0 !text-xs sm:inline-flex", chip[1])}>{chip[0]}</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {results.length > MAX && (
                    <Link href={`/promos/?q=${encodeURIComponent(query.trim())}`} onClick={close} className="btn btn-paper mt-3 w-full !text-lg">
                      Ver los {results.length} en el catálogo
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
