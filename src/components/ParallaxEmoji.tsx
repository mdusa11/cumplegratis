"use client";

import { motion, useScroll, useTransform } from "motion/react";

/** Emoji gigante del encabezado que sube y gira conforme bajas. */
export function ParallaxEmoji({ emoji }: { emoji: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -140]);
  const rotate = useTransform(scrollY, [0, 600], [0, -18]);
  return (
    <motion.span
      aria-hidden
      style={{ y, rotate }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.3 }}
      className="pointer-events-none absolute -right-8 -bottom-10 block text-[9rem] opacity-50 select-none sm:-right-10 sm:-bottom-16 sm:text-[22rem] sm:opacity-90"
    >
      {emoji}
    </motion.span>
  );
}
