"use client";

import { useRef } from "react";
import { Icon } from "./Icon";
import { motion } from "motion/react";
import { useOpenPromo } from "./PromoSheet";
import { BENEFIT, type Promo } from "@/lib/promo-meta";

const COLORS = ["var(--color-lilac)", "var(--color-hot)", "var(--color-sky)", "var(--color-sun)", "var(--color-pink)", "var(--color-acid)"];
const TILT = [-6, 4, -3, 7, -5, 3, -7, 5];

/** Fila de stickers para móvil y tablet: se arrastra de lado, cada uno flota a su ritmo y al tocarlo abre la promo. */
export function StickerRow({ promos }: { promos: Promo[] }) {
  const area = useRef<HTMLDivElement>(null);
  const openPromo = useOpenPromo();
  return (
    <div className="mt-12 xl:hidden">
      <p className="mono-tag mb-3 flex items-center gap-2">
        <span className="inline-block animate-nudge">
          <Icon name="arrowRight" />
        </span>
        Desliza y toca uno
      </p>
      <div ref={area} className="-mx-5 overflow-hidden px-5 py-6 sm:-mx-8 sm:px-8">
        <motion.div drag="x" dragConstraints={area} dragElastic={0.15} className="flex w-max cursor-grab gap-4 active:cursor-grabbing">
          {promos.map((p, i) => (
            <motion.button
              key={p.slug}
              type="button"
              onTap={() => openPromo(p)}
              initial={{ scale: 0, rotate: TILT[i % TILT.length] - 25 }}
              animate={{ scale: 1, rotate: TILT[i % TILT.length] }}
              transition={{ delay: 1.3 + i * 0.07, type: "spring", stiffness: 260, damping: 14 }}
              whileTap={{ scale: 0.92, rotate: 0 }}
              className="bob shrink-0 rounded-2xl border-[2.5px] border-ink px-4 py-3 text-left shadow-hard"
              style={{ background: COLORS[i % COLORS.length], animationDuration: `${2.6 + (i % 3) * 0.5}s`, animationDelay: `${i * 0.2}s` }}
            >
              <span className="display block text-3xl whitespace-nowrap">{p.brand}</span>
              <span className="mt-1 flex items-center gap-2 text-xs font-bold">
                <span className="rounded-full border-2 border-ink px-1.5" style={{ background: BENEFIT[p.benefitType].color }}>
                  {BENEFIT[p.benefitType].label}
                </span>
                <span className="max-w-[10rem] truncate">{p.benefit}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
