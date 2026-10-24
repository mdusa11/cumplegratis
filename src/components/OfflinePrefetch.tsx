"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cacheFichas } from "@/lib/offline";
import { useStoredBirthday, useStoredLocation } from "@/lib/storage";

const MAX_FICHAS = 30;
let done = false;

/** Guarda la ficha que estás viendo y, en ratos libres, las de tu plan o ciudad para abrirlas sin señal. */
export function OfflinePrefetch() {
  const pathname = usePathname();
  const birthday = useStoredBirthday();
  const location = useStoredLocation();

  useEffect(() => {
    const m = pathname.match(/\/promos\/([^/]+)\/?$/);
    if (m) cacheFichas([m[1]]);
  }, [pathname]);

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (done || saveData || (!birthday && !location)) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 3000));
    const handle = idle(async () => {
      const [{ promos }, { buildPlan }, { availability, isAvailable }] = await Promise.all([import("@/lib/promos"), import("@/lib/plan"), import("@/lib/availability")]);
      const nearby = location ? promos.filter((p) => isAvailable(availability(p, location))) : promos;
      const plan = birthday ? buildPlan(birthday, nearby) : null;
      const ordered = plan ? [...plan.now.filter((i) => i.status === "urgente"), ...plan.later, ...plan.walkIn, ...plan.now.filter((i) => i.status === "tarde")].map((i) => i.promo) : nearby;
      done = true;
      cacheFichas(ordered.slice(0, MAX_FICHAS).map((p) => p.slug));
    });
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [birthday, location]);

  return null;
}
