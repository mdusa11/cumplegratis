"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MONTHS, cn } from "@/lib/site";
import { saveBirthday, useStoredBirthday } from "@/lib/storage";

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const CONFETTI_COLORS = ["#c6ff00", "#b9a6ff", "#ff5a36", "#7cd6ff", "#ffd23f", "#ff9bd9"];

export async function burst(origin?: { x: number; y: number }) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  const base = { colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 120, origin };
  confetti({ ...base, particleCount: 90, spread: 80, startVelocity: 48, scalar: 1.1 });
  confetti({ ...base, particleCount: 40, spread: 130, startVelocity: 30, shapes: ["circle"], scalar: 0.8 });
}

export function BirthdayPicker({ className, size = "md", onDone }: { className?: string; size?: "md" | "lg"; onDone?: () => void }) {
  const router = useRouter();
  const stored = useStoredBirthday();
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const m = month || stored?.m || "";
  const d = day || stored?.d || "";
  const maxDay = m ? DAYS_IN_MONTH[m - 1] : 31;
  const ready = Boolean(m && d && d <= maxDay);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    saveBirthday({ m: Number(m), d: Number(d) });
    const r = buttonRef.current?.getBoundingClientRect();
    burst(r && { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight });
    const url = `/mi-cumple?m=${m}&d=${d}`;
    if (onDone) {
      router.replace(url, { scroll: false });
      onDone();
    } else setTimeout(() => router.push(url), 450);
  };

  const big = size === "lg";
  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-3 sm:flex-row sm:items-stretch", className)}>
      <div className="flex gap-3">
        <Select label="Día" value={d} onChange={(v) => setDay(v)} big={big} className="w-28 sm:w-32">
          <option value="">Día</option>
          {Array.from({ length: maxDay }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Select>
        <Select label="Mes" value={m} onChange={(v) => setMonth(v)} big={big} className="flex-1 sm:w-48">
          <option value="">Mes</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name[0].toUpperCase() + name.slice(1)}
            </option>
          ))}
        </Select>
      </div>
      <motion.button
        ref={buttonRef}
        type="submit"
        disabled={!ready}
        data-cursor="¡Va!"
        animate={ready ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
        className={cn("btn btn-ink disabled:cursor-not-allowed disabled:opacity-50", big && "!px-8 !py-4 !text-2xl")}
      >
        Armar mi plan 🎉
      </motion.button>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
  big,
  className,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  children: React.ReactNode;
  big: boolean;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        className={cn("field cursor-pointer pr-10", big && "!py-4 !text-xl")}
      >
        {children}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
        ▼
      </span>
    </label>
  );
}
