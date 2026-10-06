"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CITIES, STATES, citiesOf, nearestCity, type CitySlug, type StateCode } from "@/lib/places";
import type { UserLocation } from "@/lib/availability";
import { lockScroll } from "@/lib/scroll";
import { cn } from "@/lib/site";
import { markAskedLocation, saveLocation, useMediaQuery, useStoredLocation, wasAskedLocation } from "@/lib/storage";

type Ctx = { location: UserLocation | null; openPicker: () => void };
const LocationContext = createContext<Ctx>({ location: null, openPicker: () => {} });

export const useLocation = () => useContext(LocationContext);

export function locationName(loc: UserLocation, long = false) {
  const state = STATES[loc.state];
  if (!loc.city) return state.name;
  return long ? `${CITIES[loc.city].name}, ${state.name}` : `${CITIES[loc.city].name}, ${state.short}`;
}

/** Pregunta la ubicación una sola vez por visitante (en catálogo y plan), sin pedir permiso de GPS hasta que lo elija. */
export function useAutoAskLocation() {
  const { location, openPicker } = useLocation();
  useEffect(() => {
    if (location || wasAskedLocation()) return;
    const t = setTimeout(() => {
      markAskedLocation();
      openPicker();
    }, 1200);
    return () => clearTimeout(t);
  }, [location, openPicker]);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const location = useStoredLocation();
  const [open, setOpen] = useState(false);
  const openPicker = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <LocationContext.Provider value={{ location, openPicker }}>
      {children}
      <AnimatePresence>{open && <LocationSheet initial={location} onClose={close} />}</AnimatePresence>
    </LocationContext.Provider>
  );
}

type Gps = { status: "idle" } | { status: "locating" } | { status: "found"; city: CitySlug; km: number } | { status: "error"; message: string };

function LocationSheet({ initial, onClose }: { initial: UserLocation | null; onClose: () => void }) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const [gps, setGps] = useState<Gps>({ status: "idle" });
  const [state, setState] = useState<StateCode | "">(initial?.state ?? "");
  const [city, setCity] = useState<CitySlug | "">(initial?.city ?? "");

  useEffect(() => {
    lockScroll(true);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const locate = () => {
    if (!("geolocation" in navigator)) return setGps({ status: "error", message: "Tu navegador no comparte ubicación. Elígela abajo." });
    setGps({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { slug, km } = nearestCity({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGps({ status: "found", city: slug, km: Math.round(km) });
      },
      (err) =>
        setGps({
          status: "error",
          message: err.code === err.PERMISSION_DENIED ? "No nos diste permiso. Sin problema: elígela abajo." : "No pudimos ubicarte. Elígela abajo.",
        }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600_000 },
    );
  };

  const save = (loc: UserLocation | null) => {
    saveLocation(loc);
    markAskedLocation();
    onClose();
  };

  const panel = desktop
    ? { initial: { opacity: 0, scale: 0.9, y: 30 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 20 } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <motion.div className="fixed inset-0 z-[95] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal aria-label="Elige tu ubicación">
      <motion.button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/70 desk:bg-ink/60 desk:backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        {...panel}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        data-lenis-prevent
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-[2rem] border-[2.5px] border-ink bg-paper p-6 shadow-hard-lg sm:p-8 md:max-w-xl md:rounded-[2rem]"
      >
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full border-2 border-ink bg-paper text-xl hover:bg-acid">
          ✕
        </button>
        <p className="mono-tag">Tu zona</p>
        <h2 className="display mt-2 pr-12 text-6xl sm:text-7xl">¿Dónde estás?</h2>
        <p className="mt-3 text-lg font-medium">No todas las promos están en todos los estados. Te mostramos solo las que te quedan cerca.</p>

        <AnimatePresence mode="wait">
          {gps.status === "found" ? (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card mt-6 flex flex-col items-center bg-acid p-6 text-center"
            >
              <Pin drop />
              <p className="mono-tag mt-3">Te ubicamos en</p>
              <p className="display mt-1 text-5xl">{CITIES[gps.city].name}</p>
              <p className="font-semibold">{STATES[CITIES[gps.city].state].name}</p>
              {gps.km > 40 && <p className="mt-2 text-sm">Es la ciudad más cercana que tenemos (a unos {gps.km} km).</p>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className="btn btn-ink" onClick={() => save({ state: CITIES[gps.city].state, city: gps.city })}>
                  ¡Sí, ahí! ✓
                </button>
                <button type="button" className="btn btn-paper" onClick={() => setGps({ status: "idle" })}>
                  Elegir yo
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                onClick={locate}
                disabled={gps.status === "locating"}
                className="card group relative mt-6 flex w-full items-center gap-5 overflow-hidden bg-sky p-5 text-left transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-hard-lg"
              >
                <span className="relative flex size-16 shrink-0 items-center justify-center">
                  {gps.status === "locating" && <Radar />}
                  <Pin bounce={gps.status === "locating"} />
                </span>
                <span>
                  <span className="display block text-3xl">{gps.status === "locating" ? "Buscándote…" : "Usar mi ubicación"}</span>
                  <span className="text-sm font-medium">Se calcula en tu cel. No guardamos ni enviamos tu ubicación.</span>
                </span>
              </button>
              {gps.status === "error" && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-semibold text-hot">
                  {gps.message}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="my-6 flex items-center gap-3">
          <span className="h-0.5 flex-1 bg-ink/20" />
          <span className="mono-tag">o elige tú</span>
          <span className="h-0.5 flex-1 bg-ink/20" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Estado"
            value={state}
            onChange={(v) => {
              setState(v as StateCode | "");
              setCity("");
            }}
          >
            <option value="">Estado</option>
            {(Object.keys(STATES) as StateCode[])
              .sort((a, b) => STATES[a].name.localeCompare(STATES[b].name, "es"))
              .map((s) => (
                <option key={s} value={s}>
                  {STATES[s].name}
                </option>
              ))}
          </Select>
          <Select label="Ciudad" value={city} onChange={(v) => setCity(v as CitySlug | "")} disabled={!state}>
            <option value="">{state ? "Todo el estado" : "Ciudad"}</option>
            {state &&
              citiesOf(state).map((c) => (
                <option key={c} value={c}>
                  {CITIES[c].name}
                </option>
              ))}
          </Select>
        </div>
        <button type="button" disabled={!state} onClick={() => state && save({ state, city: city || null })} className="btn btn-acid mt-4 w-full disabled:opacity-50">
          Guardar mi zona
        </button>

        <button type="button" onClick={() => save(null)} className={cn("mt-4 w-full text-center font-semibold underline underline-offset-4 hover:text-hot", !initial && "opacity-70")}>
          Ver promos de todo México
        </button>
      </motion.div>
    </motion.div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="field cursor-pointer pr-10 disabled:cursor-not-allowed disabled:opacity-50">
        {children}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
        ▼
      </span>
    </label>
  );
}

/** Pin de mapa: rebota mientras busca, cae con resorte al encontrar. */
export function Pin({ bounce, drop, className }: { bounce?: boolean; drop?: boolean; className?: string }) {
  // El rebote va en CSS sobre el <span> (GPU); un <svg> animado obliga a repintar en cada cuadro.
  return (
    <span className={cn("relative inline-block", bounce && "animate-hop-lg", className)}>
      <motion.svg
        viewBox="0 0 40 52"
        className="block h-12 w-10 drop-shadow-[3px_3px_0_#0b0b0b]"
        initial={drop ? { y: -60, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        aria-hidden
      >
        <path d="M20 2C10 2 3 9.5 3 19c0 12 17 31 17 31s17-19 17-31C37 9.5 30 2 20 2z" fill="#ff5a36" stroke="#0b0b0b" strokeWidth="3" />
        <circle cx="20" cy="19" r="6.5" fill="#f3f0e8" stroke="#0b0b0b" strokeWidth="3" />
      </motion.svg>
    </span>
  );
}

function Radar() {
  return (
    <>
      {[0, 0.5, 1].map((delay) => (
        <span key={delay} className="absolute inset-0 animate-radar rounded-full border-[2.5px] border-ink opacity-0" style={{ animationDelay: `${delay}s` }} />
      ))}
    </>
  );
}
