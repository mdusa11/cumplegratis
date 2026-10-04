"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { Icon, type IconName } from "./Icon";

/** Ícono gigante del encabezado que sube y gira conforme bajas. */
export function ParallaxIcon({ name }: { name: IconName }) {
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
      className="pointer-events-none absolute -right-8 -bottom-10 block size-36 opacity-50 select-none sm:-right-10 sm:-bottom-16 sm:size-80 sm:opacity-90"
    >
      <Icon name={name} tone="var(--color-paper)" weight={1.2} className="!size-full drop-shadow-[6px_6px_0_var(--color-ink)]" />
    </motion.span>
  );
}
