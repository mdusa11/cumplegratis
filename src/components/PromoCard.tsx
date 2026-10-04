"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { MouseEvent, PointerEvent } from "react";
import { BenefitBadge } from "./BenefitBadge";
import { useLocation } from "./LocationProvider";
import { useOpenPromo } from "./PromoSheet";
import { availability } from "@/lib/availability";
import { CATEGORIES, GROUPS, WINDOW_LABEL, coverageLabel, groupOf, quickRules, ruleIcon, type Promo } from "@/lib/promos";
import { cn } from "@/lib/site";

const MAX_BULLETS = 3;

/** Tarjeta con inclinación 3D; al tocarla abre el panel de detalles (Cmd/Ctrl+clic abre la página). */
export function PromoCard({ promo }: { promo: Promo }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 260, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 260, damping: 20 });
  const openPromo = useOpenPromo();
  const { location } = useLocation();
  const cat = CATEGORIES[promo.category];
  const group = GROUPS[groupOf(promo)];
  const avail = location ? availability(promo, location) : null;
  const bullets = promo.requirements.length ? promo.requirements : quickRules(promo).map((r) => r.label);
  const local = promo.coverage === "ciudades" || promo.coverage === "estados";

  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };
  const open = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openPromo(promo);
  };

  return (
    <motion.div style={{ rotateX, rotateY, transformPerspective: 900 }} whileTap={{ scale: 0.97 }} className="h-full min-w-0">
      <Link
        href={`/promos/${promo.slug}`}
        data-cursor="Ver"
        onClick={open}
        onPointerMove={tilt}
        onPointerLeave={reset}
        className={cn(
          "card group relative flex h-full flex-col overflow-hidden bg-paper p-5 transition-[box-shadow,opacity] duration-200 hover:shadow-hard-lg",
          avail === "fuera" && "opacity-60 hover:opacity-100",
        )}
      >
        <span
          aria-hidden
          className="absolute -top-16 -right-16 size-40 rounded-full border-[2.5px] border-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[2.6]"
          style={{ background: group.color }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <span className="mono-tag pt-1">
            {cat.emoji} {cat.label}
          </span>
          <BenefitBadge type={promo.benefitType} />
        </div>
        <h3 className="display relative mt-7 text-5xl break-words sm:text-[3.4rem]">{promo.brand}</h3>
        <p className="relative mt-2 text-lg leading-snug font-bold">{promo.benefit}</p>

        {bullets.length > 0 && (
          <div className="relative mt-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper/70 p-3">
            <p className="mono-tag mb-1.5 !text-[0.65rem] opacity-70">Necesitas</p>
            <ul className="space-y-1">
              {bullets.slice(0, MAX_BULLETS).map((b, i) => (
                <li
                  key={b}
                  className="flex gap-2 text-sm leading-snug transition-transform duration-300 group-hover:translate-x-1"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <span className="w-5 shrink-0 text-center">{ruleIcon(b)}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {bullets.length > MAX_BULLETS && <p className="mt-1 pl-7 text-xs font-bold">+{bullets.length - MAX_BULLETS} más · toca para ver todo</p>}
          </div>
        )}

        <div className="relative mt-auto flex flex-wrap gap-2 pt-5">
          <span className="chip bg-paper">📅 {WINDOW_LABEL[promo.window]}</span>
          <span className={cn("chip max-w-full !whitespace-normal leading-tight", local ? "bg-sun" : "bg-paper")}>
            {promo.coverage === "nacional" ? "🇲🇽" : "📍"} {coverageLabel(promo)}
          </span>
          {avail === "fuera" && <span className="chip bg-hot">Fuera de tu zona</span>}
          {(avail === "tu-ciudad" || avail === "cerca") && <span className="chip bg-acid">✓ Cerca de ti</span>}
          {promo.confidence === "baja" && <span className="chip border-dashed bg-paper">Sin confirmar</span>}
        </div>
      </Link>
    </motion.div>
  );
}
