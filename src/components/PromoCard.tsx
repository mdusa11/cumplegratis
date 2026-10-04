"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent } from "react";
import { BenefitBadge } from "./BenefitBadge";
import { CATEGORIES, GROUPS, WINDOW_LABEL, groupOf, signupLabel, type Promo } from "@/lib/promos";

/** Tarjeta con inclinación 3D que sigue al mouse. */
export function PromoCard({ promo }: { promo: Promo }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 260, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 260, damping: 20 });
  const cat = CATEGORIES[promo.category];
  const group = GROUPS[groupOf(promo)];

  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div style={{ rotateX, rotateY, transformPerspective: 900 }} className="h-full">
      <Link
        href={`/promos/${promo.slug}`}
        data-cursor="Ver"
        onPointerMove={tilt}
        onPointerLeave={reset}
        className="card group relative flex h-full flex-col overflow-hidden bg-paper p-5 transition-shadow duration-200 hover:shadow-hard-lg"
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
        <h3 className="display relative mt-8 text-5xl break-words sm:text-6xl">{promo.brand}</h3>
        <p className="relative mt-3 text-lg leading-snug font-semibold">{promo.benefit}</p>
        <div className="relative mt-auto flex flex-wrap gap-2 pt-6">
          <span className="chip bg-paper">{WINDOW_LABEL[promo.window]}</span>
          <span className="chip bg-paper">{signupLabel(promo)}</span>
          {promo.confidence === "baja" && <span className="chip border-dashed bg-paper">Sin confirmar</span>}
        </div>
      </Link>
    </motion.div>
  );
}
