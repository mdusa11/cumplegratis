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
  const errors = useRef(new Set<string>());

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
    errors.current.clear();
    page.current = { path: clean(pathname), visibleSince: document.visibilityState === "visible" ? performance.now() : null, ms: 0, scroll: 0, vitalsSent: page.current !== null };
    track("pageview");
  }, [pathname]);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.hostname === "wa.me") track("whatsapp", { target: location.pathname });
      else if (a.hostname && !a.hostname.endsWith("cumplegratis.fun") && a.rel.includes("nofollow"))
        // Solo el botón de registro trae data-promo; los demás enlaces externos son las fuentes de la promo.
        track(a.dataset.promo ? "signup_click" : "source", { target: a.dataset.promo ?? a.hostname.replace(/^www\./, "") });
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

    // Errores reales de nuestro código: máximo 5 por página y sin repetir mensaje; se ignoran extensiones y scripts de terceros.
    const seen = errors.current;
    const report = (msg: string, line: number | undefined, file = "") => {
      const m = msg.replace(/\s+/g, " ").trim().slice(0, 160);
      if (!m || seen.size >= 5 || seen.has(m)) return;
      if (file && (new URL(file, location.href).origin !== location.origin || /googlesyndication|adsbygoogle|cloudflareinsights/i.test(file))) return;
      if (!file && /^script error\.?$/i.test(m)) return;
      seen.add(m);
      track("error", { target: m, value: line });
    };
    const onError = (e: ErrorEvent) => {
      try {
        report(e.message || String(e.error ?? ""), e.lineno, e.filename);
      } catch {}
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      try {
        const r = e.reason;
        report(r instanceof Error ? `${r.name}: ${r.message}` : String(r ?? ""), undefined, r instanceof Error ? (/(https?:\/\/[^\s)]+?):\d+:\d+/.exec(r.stack ?? "")?.[1] ?? "") : "");
      } catch {}
    };
    addEventListener("error", onError);
    addEventListener("unhandledrejection", onRejection);

    // Web Vitals sin librería: el último LCP, la suma de saltos de diseño y la interacción más lenta.
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void, extra: object = {}) => {
      try {
        const o = new PerformanceObserver(cb);
        o.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        observers.push(o);
      } catch {}
    };
    // Como Chrome: el LCP deja de contar tras la primera interacción y el CLS es la mayor ventana de saltos
    // (cada ventana cierra tras 1 s sin saltos o a los 5 s), no la suma de toda la sesión.
    let interacted = false;
    const stop = () => (interacted = true);
    addEventListener("pointerdown", stop, { once: true, capture: true });
    addEventListener("keydown", stop, { once: true, capture: true });
    let win = 0;
    let winStart = 0;
    let winLast = 0;
    observe("largest-contentful-paint", (l) => {
      const last = l.getEntries().at(-1);
      if (last && !interacted) vitals.current.lcp = Math.round(last.startTime);
    });
    observe("layout-shift", (l) => {
      for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (e.hadRecentInput) continue;
        if (win && e.startTime - winLast < 1000 && e.startTime - winStart < 5000) win += e.value;
        else {
          win = e.value;
          winStart = e.startTime;
        }
        winLast = e.startTime;
        vitals.current.cls = Math.max(vitals.current.cls, win);
      }
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
      removeEventListener("error", onError);
      removeEventListener("unhandledrejection", onRejection);
      removeEventListener("pointerdown", stop, { capture: true });
      removeEventListener("keydown", stop, { capture: true });
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return null;
}
