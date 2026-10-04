"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/site";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * Cinta infinita a velocidad de lectura (`speed` en px por segundo). El scroll la empuja un poco y la inclina,
 * pero nunca más del doble, para que siempre se pueda leer.
 */
export function Marquee({ children, speed = 45, className }: { children: ReactNode; speed?: number; className?: string }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-1, 0, 1]);
  const skewX = useTransform(velocity, [-2500, 2500], [5, -5]);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const direction = useRef(-1);
  const track = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => (width.current = el.scrollWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !width.current) return;
    const f = factor.get();
    if (f < -0.05) direction.current = 1;
    else if (f > 0.05) direction.current = -1;
    // px/s → % del ancho total (4 copias), que es la unidad de `baseX`.
    const px = speed * (1 + Math.abs(f)) * (delta / 1000);
    baseX.set(baseX.get() + (direction.current * px * 100) / width.current);
  });

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div ref={track} className="flex w-max flex-nowrap" style={{ x, skewX }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
