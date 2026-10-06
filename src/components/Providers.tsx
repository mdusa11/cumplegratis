"use client";

import { useEffect, type ReactNode } from "react";
import { Analytics } from "./Analytics";
import { MotionConfig } from "motion/react";
import Lenis from "lenis";
import { smooth } from "@/lib/scroll";
import { LocationProvider } from "./LocationProvider";
import { PromoSheetProvider } from "./PromoSheet";


export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Lenis solo suaviza la rueda del mouse: en táctil no hace nada, así que ahí ni se monta.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    smooth.lenis = lenis;
    // Cuadros solo mientras Lenis mueve la página: en reposo no hay requestAnimationFrame corriendo.
    let id = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      id = lenis.isScrolling === "smooth" ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (id) return;
      // Sin esto, el primer cuadro tras el reposo mediría un salto de segundos y brincaría sin suavizado.
      (lenis as unknown as { time: number }).time = 0;
      id = requestAnimationFrame(loop);
    };
    addEventListener("wheel", wake, { passive: true });
    return () => {
      removeEventListener("wheel", wake);
      cancelAnimationFrame(id);
      lenis.destroy();
      smooth.lenis = null;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <LocationProvider>
        <PromoSheetProvider>
          <Analytics />
          {children}
        </PromoSheetProvider>
      </LocationProvider>
    </MotionConfig>
  );
}
