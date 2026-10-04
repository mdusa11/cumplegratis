"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Logo } from "./Logo";
import { useLocation } from "./LocationProvider";
import { openInstall, useInstalled } from "./PwaInstall";
import { CITIES, STATES } from "@/lib/places";
import { cn } from "@/lib/site";

const LINKS = [
  { href: "/promos", label: "Promos" },
  { href: "/ciudades", label: "Ciudades" },
  { href: "/mi-cumple", label: "Mi cumple" },
];

export function Nav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
  });

  const { location, openPicker } = useLocation();
  const place = location
    ? location.city
      ? CITIES[location.city].name
      : STATES[location.state].short
    : null;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setOpen(false);
  const installed = useInstalled();

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      animate={{ y: hidden && !open ? "-130%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border-[2.5px] border-ink bg-paper/90 py-2 pr-2 pl-5 shadow-hard backdrop-blur-md">
        <Logo onClick={close} />

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-4 py-2 font-semibold transition-colors",
                isActive(l.href) ? "text-paper" : "hover:bg-paper-2",
              )}
            >
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              {l.label}
            </Link>
          ))}
          <LocationPill place={place} onClick={openPicker} />
          <Link
            href="/mi-cumple"
            className="btn btn-acid ml-2 !py-2.5 !text-lg"
          >
            Arma tu plan →
          </Link>
        </div>

        <div className="ml-auto lg:hidden">
          <LocationPill place={place} onClick={openPicker} compact />
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="relative flex size-11 items-center justify-center rounded-full border-2 border-ink bg-acid lg:hidden"
        >
          <motion.span
            className="absolute h-0.5 w-5 bg-ink"
            animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
          />
          <motion.span
            className="absolute h-0.5 w-5 bg-ink"
            animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
          />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="card mx-auto mt-3 flex max-w-7xl flex-col gap-2 bg-acid p-4 lg:hidden"
          >
            <button
              type="button"
              onClick={() => {
                close();
                openPicker();
              }}
              className="mb-1 flex items-center justify-between rounded-2xl border-2 border-ink bg-paper px-4 py-3 text-left font-semibold"
            >
              <span>📍 {place ?? "Elige tu ciudad"}</span>
              <span className="mono-tag">{place ? "cambiar" : "→"}</span>
            </button>
            {[{ href: "/", label: "Inicio" }, ...LINKS].map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={l.href}
                  onClick={close}
                  className="display block py-1 text-6xl"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            {!installed && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  close();
                  openInstall();
                }}
                className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-ink bg-ink px-4 py-3 text-left font-semibold text-paper"
              >
                <span className="text-2xl">📲</span>
                <span>
                  Instalar la app
                  <span className="block text-sm font-medium opacity-70">Gratis, sin tienda de apps</span>
                </span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function LocationPill({
  place,
  onClick,
  compact,
}: {
  place: string | null;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-label={place ? `Tu zona: ${place}. Cambiar` : "Elegir tu ciudad"}
      className={cn(
        "flex items-center gap-1.5 rounded-full border-2 border-ink font-semibold transition-colors hover:bg-sun",
        compact
          ? "relative size-11 justify-center text-lg"
          : "ml-1 px-3.5 py-2",
        place ? "bg-paper" : "bg-sun",
      )}
    >
      <motion.span
        animate={place ? { y: 0 } : { y: [0, -3, 0] }}
        transition={place ? {} : { repeat: Infinity, duration: 1.2 }}
      >
        📍
      </motion.span>
      {compact && place && (
        <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-2 border-ink bg-acid" />
      )}
      <AnimatePresence mode="wait" initial={false}>
        {!compact && (
          <motion.span
            key={place ?? "none"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="truncate"
          >
            {place ?? "Tu ciudad"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
