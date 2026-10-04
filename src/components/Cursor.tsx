"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useMediaQuery } from "@/lib/storage";

/** Bolita que sigue al mouse y se infla sobre links. `data-cursor="Texto"` le pone etiqueta. */
export function Cursor() {
  const enabled = useMediaQuery("(pointer: fine) and (prefers-reduced-motion: no-preference)");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 45, mass: 0.4 });
  const [hover, setHover] = useState<{ label: string | null } | null>(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as Element | null)?.closest?.("a, button, [data-cursor], select, label");
      setHover((prev) => {
        if (!el) return prev ? null : prev;
        const label = el.getAttribute("data-cursor");
        return prev?.label === label ? prev : { label };
      });
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = hover?.label ? 84 : hover ? 44 : 14;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] flex items-center justify-center rounded-full border-2 border-ink bg-acid"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: size, height: size, scale: down ? 0.8 : 1, opacity: hover && !hover.label ? 0.6 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <AnimatePresence>
        {hover?.label && (
          <motion.span
            key={hover.label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="display text-lg"
          >
            {hover.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
