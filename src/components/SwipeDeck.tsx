"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useLocation } from "./LocationProvider";
import { useOpenPromo } from "./PromoSheet";
import { BenefitBadge } from "./BenefitBadge";
import { availability, isAvailable } from "@/lib/availability";
import { CATEGORIES, GROUPS, byProminence, coverageLabel, groupOf, quickRules, type Promo } from "@/lib/promos";

const THRESHOLD = 110;
export const buzz = () => navigator.vibrate?.(12);

/** Mazo de tarjetas: desliza a la derecha para ver la promo, a la izquierda para pasar. */
export function SwipeDeck({ promos }: { promos: Promo[] }) {
  const { location } = useLocation();
  const openPromo = useOpenPromo();
  const list = useMemo(
    () => (location ? promos.filter((p) => isAvailable(availability(p, location))) : promos).toSorted(byProminence),
    [promos, location],
  );
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);

  if (list.length === 0) return null;
  const at = (i: number) => list[i % list.length];

  const decide = (direction: 1 | -1) => {
    buzz();
    setDir(direction);
    if (direction === 1) openPromo(at(index));
    setIndex((i) => i + 1);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div className="relative h-[27rem] w-full sm:h-[29rem]">
        <AnimatePresence custom={dir} initial={false}>
          {[2, 1, 0].map((depth) => {
            const n = index + depth;
            return <DeckCard key={n} promo={at(n)} depth={depth} onDecide={decide} />;
          })}
        </AnimatePresence>
      </div>
      <div className="mt-8 flex items-center gap-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85, rotate: -12 }}
          onClick={() => decide(-1)}
          aria-label="Pasar"
          className="flex size-16 items-center justify-center rounded-full border-[2.5px] border-ink bg-paper text-2xl shadow-hard"
        >
          ✕
        </motion.button>
        <p className="mono-tag w-20 text-center">
          {(index % list.length) + 1} / {list.length}
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.85, rotate: 12 }}
          onClick={() => decide(1)}
          aria-label="Ver promo"
          className="flex size-16 items-center justify-center rounded-full border-[2.5px] border-ink bg-acid text-2xl shadow-hard"
        >
          ♥
        </motion.button>
      </div>
    </div>
  );
}

function DeckCard({ promo, depth, onDecide }: { promo: Promo; depth: number; onDecide: (d: 1 | -1) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const like = useTransform(x, [20, THRESHOLD], [0, 1]);
  const nope = useTransform(x, [-THRESHOLD, -20], [1, 0]);
  const top = depth === 0;
  const group = GROUPS[groupOf(promo)];
  const cat = CATEGORIES[promo.category];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > THRESHOLD || info.velocity.x > 600) onDecide(1);
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -600) onDecide(-1);
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 10 - depth }}
      initial={{ scale: 0.82, y: 46, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.06, y: depth * 18, opacity: depth > 1 ? 0.7 : 1, rotate: depth === 0 ? 0 : depth % 2 ? 3 : -3 }}
      exit="gone"
      variants={{ gone: (d: number) => ({ x: d * 520, rotate: d * 28, opacity: 0, transition: { duration: 0.4 } }) }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <motion.article
        drag={top ? "x" : false}
        dragSnapToOrigin
        dragElastic={0.9}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.03 }}
        style={{ x, rotate, background: group.color }}
        className="card relative flex h-full cursor-grab touch-pan-y flex-col overflow-hidden p-6 select-none active:cursor-grabbing"
      >
        <motion.span style={{ opacity: like }} className="display absolute top-24 left-6 z-10 -rotate-12 rounded-xl border-4 border-ink bg-acid px-3 py-1 text-3xl">
          ¡Me late!
        </motion.span>
        <motion.span style={{ opacity: nope }} className="display absolute top-24 right-6 z-10 rotate-12 rounded-xl border-4 border-ink bg-paper px-3 py-1 text-3xl">
          Paso
        </motion.span>
        <div className="flex items-start justify-between">
          <span className="mono-tag rounded-full border-2 border-ink bg-paper px-2.5 py-1">
            {cat.emoji} {cat.label}
          </span>
          <BenefitBadge type={promo.benefitType} />
        </div>
        <div className="mt-auto">
          <span className="text-7xl">{cat.emoji}</span>
          <h3 className="display mt-3 text-[clamp(3rem,13vw,4.5rem)] break-words">{promo.brand}</h3>
          <p className="mt-2 text-xl leading-tight font-bold">{promo.benefit}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {quickRules(promo).map((r) => (
              <span key={r.label} className="chip bg-paper !text-xs">
                {r.icon} {r.label}
              </span>
            ))}
            <span className="chip bg-paper !text-xs">📍 {coverageLabel(promo)}</span>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
