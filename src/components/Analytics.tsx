"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

const clean = (p: string) => p.replace(/(.)\/$/, "$1");

type Page = { path: string; visibleSince: number | null; ms: number; scroll: number; vitalsSent: boolean };

/**
 * Páginas vistas, tiempo visible y scroll de cada página ("leave"), rapidez real (LCP, CLS, INP)
 * y clics salientes (WhatsApp, registro en la marca) por delegación, sin tocar cada botón.
 */
export function Analytics() {
  const pathname = usePathname();
  const page = useRef<Page | null>(null);
  const vitals = useRef({ lcp: 0, cls: 0, inp: 0 });

  // Cierra el tramo visible de la página actual y lo manda.
  const flush = () => {
    const p = page.current;
    if (!p) return;
    if (p.visibleSince !== null) {
      p.ms += performance.now() - p.visibleSince;
      p.visibleSince = null;
    }
    if (p.ms < 500) return;
    const v = vitals.current;
    track("leave", {
      path: p.path,
      sec: p.ms / 1000,
      sc: p.scroll,
      ...(!p.vitalsSent && { lcp: v.lcp || undefined, cls: Math.round(v.cls * 1000) / 1000, inp: v.inp || undefined }),
    });
    p.vitalsSent = true;
    p.ms = 0;
  };

  useEffect(() => {
    flush();
    page.current = { path: clean(pathname), visibleSince: document.visibilityState === "visible" ? performance.now() : null, ms: 0, scroll: 0, vitalsSent: page.current !== null };
    track("pageview");
  }, [pathname]);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.hostname === "wa.me") track("whatsapp", { target: location.pathname });
      else if (a.hostname && !a.hostname.endsWith("cumplegratis.fun") && a.rel.includes("nofollow"))
        track("signup_click", { target: a.dataset.promo ?? a.hostname.replace(/^www\./, "") });
    };
    const scroll = () => {
      const p = page.current;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (p) p.scroll = Math.max(p.scroll, max > 0 ? Math.round((scrollY / max) * 100) : 100);
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") flush();
      else if (page.current) page.current.visibleSince = performance.now();
    };
    const installed = () => track("install");

    // Web Vitals sin librería: el último LCP, la suma de saltos de diseño y la interacción más lenta.
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void, extra: object = {}) => {
      try {
        const o = new PerformanceObserver(cb);
        o.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        observers.push(o);
      } catch {}
    };
    observe("largest-contentful-paint", (l) => {
      const last = l.getEntries().at(-1);
      if (last) vitals.current.lcp = Math.round(last.startTime);
    });
    observe("layout-shift", (l) => {
      for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) vitals.current.cls += e.value;
    });
    observe("event", (l) => {
      for (const e of l.getEntries()) vitals.current.inp = Math.max(vitals.current.inp, Math.round(e.duration));
    }, { durationThreshold: 40 });

    document.addEventListener("click", click, { capture: true });
    addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    addEventListener("pagehide", flush);
    addEventListener("appinstalled", installed);
    return () => {
      document.removeEventListener("click", click, { capture: true });
      removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", visibility);
      removeEventListener("pagehide", flush);
      removeEventListener("appinstalled", installed);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return null;
}
