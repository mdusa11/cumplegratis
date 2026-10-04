"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { BirthdayPicker } from "./BirthdayPicker";
import { SplitText } from "./Reveal";
import { Floaters } from "./fx";
import { locationName, useLocation } from "./LocationProvider";
import { availability, isAvailable } from "@/lib/availability";
import { BENEFIT, promos, type Promo } from "@/lib/promos";

// Posiciones (en % del hero) y giro de cada sticker en escritorio.
const SPOTS = [
  { left: "71%", top: "11%", rotate: -7 },
  { left: "75%", top: "25%", rotate: 6 },
  { left: "58%", top: "33%", rotate: -4 },
];
const STICKER_COLORS = ["var(--color-lilac)", "var(--color-hot)", "var(--color-sky)", "var(--color-sun)", "var(--color-pink)", "var(--color-paper)"];

export function Hero({ featured, total }: { featured: Promo[]; total: number }) {
  const area = useRef<HTMLDivElement>(null);
  const { location, openPicker } = useLocation();
  const near = location ? promos.filter((p) => isAvailable(availability(p, location))).length : total;

  return (
    <section ref={area} className="relative min-h-[100svh] overflow-hidden px-5 pt-32 pb-16 sm:px-8 md:pt-36">
      <Floaters />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.button
          type="button"
          onClick={openPicker}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mono-tag inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-left hover:bg-sun"
        >
          <span className="size-2 shrink-0 animate-pulse rounded-full bg-hot" />
          {location ? (
            <span>
              {near} promos cerca de {locationName(location)} · <u>cambiar</u>
            </span>
          ) : (
            <span>
              {total} promos en México · <u>¿dónde estás?</u>
            </span>
          )}
        </motion.button>

        <h1 className="display mt-6 text-[20.5vw] sm:text-[15.5vw] lg:text-[min(13vw,24vh)]">
          <SplitText text="Tu cumple" delay={0.15} className="block" />
          <span className="flex items-center gap-[0.15em]">
            <SplitText text="sale" delay={0.4} />
            <SpinBadge total={total} />
          </span>
          <motion.span
            className="relative inline-block"
            initial={{ rotate: 0 }}
            animate={{ rotate: -2.5 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 300, damping: 12 }}
          >
            <motion.span
              aria-hidden
              className="absolute inset-x-[-0.08em] inset-y-[0.04em] -z-10 origin-left rounded-[0.12em] border-[3px] border-ink bg-acid shadow-hard-lg"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            <SplitText text="gratis" delay={0.6} />
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:absolute lg:right-0 lg:bottom-2 lg:w-[38%]"
        >
          <p className="mt-10 max-w-xl text-xl leading-snug font-medium sm:text-2xl lg:mt-0">
            Café, pastel, cine, descuentos y regalos. Pon tu fecha y te decimos <b>dónde registrarte</b> y <b>hasta cuándo</b> para cobrarlo todo.
          </p>
          <BirthdayPicker className="mt-8 lg:mt-6 lg:flex-col" />
        </motion.div>
      </div>

      {/* Stickers arrastrables: el "juguete" del hero. */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
        {featured.slice(0, SPOTS.length).map((p, i) => (
          <motion.div
            key={p.slug}
            drag
            dragConstraints={area}
            dragElastic={0.25}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
            initial={{ scale: 0, rotate: SPOTS[i].rotate - 30 }}
            animate={{ scale: 1, rotate: SPOTS[i].rotate }}
            transition={{ delay: 1.2 + i * 0.08, type: "spring", stiffness: 260, damping: 14 }}
            whileHover={{ scale: 1.06, rotate: 0 }}
            whileDrag={{ scale: 1.12, rotate: SPOTS[i].rotate * -1, zIndex: 30, boxShadow: "12px 12px 0 0 #0b0b0b" }}
            data-cursor="Jala"
            className="pointer-events-auto absolute cursor-grab touch-none rounded-2xl border-[2.5px] border-ink px-5 py-3 shadow-hard active:cursor-grabbing"
            style={{ left: SPOTS[i].left, top: SPOTS[i].top, background: STICKER_COLORS[i] }}
          >
            <p className="display text-4xl select-none">{p.brand}</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold select-none">
              <span className="rounded-full border-2 border-ink px-2 py-0.5 text-xs" style={{ background: BENEFIT[p.benefitType].color }}>
                {BENEFIT[p.benefitType].label}
              </span>
              <span className="max-w-[12rem] truncate">{p.benefit}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SpinBadge({ total }: { total: number }) {
  const text = `+${total} regalos · cero pesos · `;
  return (
    <motion.span
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 12 }}
      className="relative inline-flex size-[0.85em] shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-lilac"
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-ink font-mono text-[11px] font-bold uppercase">
          <textPath href="#circle" textLength="228" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="animate-wiggle text-[0.32em]">🎂</span>
    </motion.span>
  );
}
