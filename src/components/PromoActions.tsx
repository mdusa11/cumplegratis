"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { SAFE_DAYS, buildPlan, formatDate } from "@/lib/plan";
import type { Promo } from "@/lib/promo-meta";
import { MONTHS, cn } from "@/lib/site";
import { toggleDone, useDone, useStoredBirthday } from "@/lib/storage";

const PENDING = "cg:pending";
const ASKED = "cg:asked";

/** Casilla «Ya me registré» para promos con programa. */
export function DoneToggle({ promo, className }: { promo: Promo; className?: string }) {
  const done = useDone().includes(promo.slug);
  if (!promo.program) return null;
  return (
    <button
      type="button"
      onClick={() => toggleDone(promo.slug)}
      aria-pressed={done}
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-base font-bold transition-colors", done ? "bg-acid" : "bg-paper hover:bg-paper-2", className)}
    >
      <span className={"flex size-5 items-center justify-center rounded border-2 border-ink bg-paper"} aria-hidden>
        {done && <Icon name="check" className="!size-3.5" />}
      </span>
      {done ? "Ya me registré" : "Marcar como registrado"}
    </button>
  );
}

/** Fecha límite para registrarse según el cumpleaños guardado. */
export function PersonalCard({ promo, className }: { promo: Promo; className?: string }) {
  const birthday = useStoredBirthday();
  if (!promo.program) return null;
  if (!birthday) {
    return (
      <p className={cn("card bg-paper p-4 text-base font-semibold", className)}>
        <Icon name="calendar" /> Pon tu fecha y te decimos hasta cuándo registrarte.{" "}
        <Link href="/mi-cumple/" className="inline-block py-2 underline underline-offset-4 hover:text-hot">
          Poner mi fecha →
        </Link>
      </p>
    );
  }
  const item = buildPlan(birthday, [promo]).now[0] ?? buildPlan(birthday, [promo]).later[0];
  if (!item?.registerBy) return null;
  return (
    <p className={cn("card bg-acid p-4 text-base font-semibold", className)}>
      <Icon name="calendar" /> Para tu cumple del {birthday.d} de {MONTHS[birthday.m - 1]}:{" "}
      {item.status === "tarde" ? "debiste registrarte antes del" : "regístrate antes del"} <b>{formatDate(item.registerBy)}</b>
      {item.status === "tarde" && ". Quizá ya no alcanzas; intenta igual"}
      {item.estimated && <span className="mt-1 block text-sm font-medium opacity-80">Estimado a {SAFE_DAYS} días: la marca no publica su anticipación.</span>}
    </p>
  );
}

const readList = (key: string): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
};

/** Al volver de registrarse en la marca (otra pestaña) pregunta si lo logró, una vez por promo. */
export function RegisterPrompt() {
  const [ask, setAsk] = useState<{ slug: string; program: string } | null>(null);
  const done = useDone();
  const doneRef = useRef(done);
  useEffect(() => {
    doneRef.current = done;
  });

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[data-register]");
      if (!a) return;
      try {
        sessionStorage.setItem(PENDING, JSON.stringify({ slug: a.getAttribute("data-register"), program: a.getAttribute("data-program") ?? "" }));
      } catch {}
    };
    const visible = () => {
      if (document.visibilityState !== "visible") return;
      let pending: { slug: string; program: string } | null = null;
      try {
        pending = JSON.parse(sessionStorage.getItem(PENDING) ?? "null");
        sessionStorage.removeItem(PENDING);
      } catch {}
      if (!pending?.slug) return;
      const asked = readList(ASKED);
      if (asked.includes(pending.slug) || doneRef.current.includes(pending.slug)) return;
      try {
        sessionStorage.setItem(ASKED, JSON.stringify([...asked, pending.slug]));
      } catch {}
      setAsk(pending);
    };
    document.addEventListener("click", click);
    document.addEventListener("visibilitychange", visible);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);

  return (
    <AnimatePresence>
      {ask && (
        <motion.div
          role="status"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="card fixed inset-x-3 bottom-24 z-[96] mx-auto max-w-md bg-paper p-4 shadow-hard-lg sm:bottom-4"
        >
          <p className="font-bold">¿Ya te registraste en {ask.program || "el programa"}?</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!doneRef.current.includes(ask.slug)) toggleDone(ask.slug);
                setAsk(null);
              }}
              className="btn btn-ink flex-1 !px-3 !py-2 !text-base"
            >
              Sí, márcalo
            </button>
            <button type="button" onClick={() => setAsk(null)} className="btn btn-paper flex-1 !px-3 !py-2 !text-base">
              Todavía no
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
