"use client";

import { useEffect, type ReactNode } from "react";
import { Analytics } from "./Analytics";
import { MotionConfig } from "motion/react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smooth } from "@/lib/scroll";
import { LocationProvider } from "./LocationProvider";
import { PromoSheetProvider } from "./PromoSheet";

gsap.registerPlugin(ScrollTrigger);

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    smooth.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
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
