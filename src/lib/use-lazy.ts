"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Carga datos pesados fuera del bundle inicial: en reposo tras la hidratación, o ya con `go()` (primer toque, filtros en la URL). */
export function useLazy<T>(loader: () => Promise<T>, eager = false) {
  const [data, setData] = useState<T | null>(null);
  const started = useRef(false);
  const load = useRef(loader);
  const go = useCallback(() => {
    if (started.current) return;
    started.current = true;
    load.current().then(setData);
  }, []);
  useEffect(() => {
    if (eager) {
      go();
      return;
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = setTimeout(go, 1500);
    return () => clearTimeout(id);
  }, [eager, go]);
  return [data, go] as const;
}

export const loadPromos = () => import("./promos").then((m) => m.promos);
