"use client";

import { motion } from "motion/react";
import { Icon } from "./Icon";
import { locationName, useLocation } from "./LocationProvider";
import { availability } from "@/lib/availability";
import { CITIES, STATES } from "@/lib/places";
import { coverageLabel, isEverywhere, type Promo } from "@/lib/promo-meta";
import { cn } from "@/lib/site";

/** "Dónde aplica" + si está en la zona del visitante. */
export function WhereCard({ promo }: { promo: Promo }) {
  const { location, openPicker } = useLocation();
  const avail = location ? availability(promo, location) : null;
  const ok = avail && avail !== "fuera" && avail !== "sin-dato" && avail !== "en-linea";
  const places = promo.cities.length
    ? promo.cities.map((c) => CITIES[c].name)
    : promo.states.length
      ? promo.states.map((s) => STATES[s].name)
      : promo.presence && promo.presence.states.length < 30
        ? promo.presence.states.map((s) => STATES[s].name)
        : [];

  return (
    <div className={cn("card p-6", avail === "fuera" ? "bg-hot" : ok ? "bg-acid" : "bg-paper")}>
      <p className="mono-tag">Dónde aplica</p>
      <p className="display mt-2 text-4xl">
        <Icon name={isEverywhere(promo) ? "mexico" : "pin"} className="!size-[0.85em]" /> {coverageLabel(promo)}
      </p>
      {promo.locationNote && <p className="mt-2">{promo.locationNote}</p>}
      {places.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {places.map((n) => (
            <span key={n} className="chip bg-paper !text-xs">
              {n}
            </span>
          ))}
        </div>
      )}
      <motion.div key={avail ?? "none"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border-t-2 border-ink/20 pt-4">
        {location ? (
          <p className="font-semibold">
            {avail === "fuera" ? (
              <>
                <Icon name="warning" /> No está en tu zona
              </>
            ) : avail === "en-linea" ? (
              <>
                <Icon name="phone" /> Sin sucursal en tu zona, pero se cobra en línea
              </>
            ) : avail === "sin-dato" ? (
              <>
                <Icon name="question" /> Aún no confirmamos sus sucursales
              </>
            ) : (
              <>
                <Icon name="check" tone="var(--color-paper)" /> Disponible para ti
              </>
            )} ({locationName(location)}).{" "}
            <button type="button" onClick={openPicker} className="underline underline-offset-2">
              Cambiar
            </button>
          </p>
        ) : (
          <button type="button" onClick={openPicker} className="font-semibold underline underline-offset-4">
            <Icon name="pin" /> ¿Está en tu ciudad? Dinos dónde estás
          </button>
        )}
      </motion.div>
    </div>
  );
}
