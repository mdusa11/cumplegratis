"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { cn } from "@/lib/site";

/**
 * Cinta infinita a velocidad de lectura (`speed` en px por segundo).
 * El movimiento es una animación Web (WAAPI) que corre en la GPU: en reposo no gasta nada del hilo principal.
 * El scroll solo ajusta la velocidad, el sentido y la inclinación mientras dura, nunca más del doble.
 */
export function Marquee({ children, speed = 45, className }: { children: ReactNode; speed?: number; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);
  const direction = useRef(1);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const skewX = useTransform(velocity, [-2500, 2500], [5, -5]);

  useEffect(() => {
    const el = track.current;
    if (!el || reduced) return;
    const start = () => {
      anim.current?.cancel();
      // 4 copias: avanzar una copia (25%) deja la cinta exactamente igual, así el ciclo no se nota.
      const duration = ((el.scrollWidth / 4) / speed) * 1000;
      if (!duration) return;
      anim.current = el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-25%)" }], { duration, iterations: Infinity });
      anim.current.playbackRate = direction.current;
    };
    start();
    let width = el.scrollWidth;
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.scrollWidth - width) > 1) {
        width = el.scrollWidth;
        start();
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      anim.current?.cancel();
    };
  }, [speed, reduced]);

  // Bajar empuja la cinta hacia la izquierda; subir, hacia la derecha. Solo corre mientras hay scroll.
  useMotionValueEvent(velocity, "change", (v) => {
    const a = anim.current;
    if (!a) return;
    const f = Math.max(-1, Math.min(1, v / 2000));
    if (f < -0.05) direction.current = -1;
    else if (f > 0.05) direction.current = 1;
    a.playbackRate = direction.current * (1 + Math.abs(f));
  });

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div style={{ skewX }}>
        <div ref={track} className="flex w-max flex-nowrap will-change-transform">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
              {children}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
