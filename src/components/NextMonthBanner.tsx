"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { MONTHS } from "@/lib/site";

/** El HTML sale con el cálculo del build; en el navegador se recalcula con la fecha de hoy (el sitio no se reconstruye a diario). */
export function NextMonthBanner({ month, count, register, className = "" }: { month: number; count: number; register: number; className?: string }) {
  const [now, setNow] = useState({ month, count, register });
  useEffect(() => {
    let alive = true;
    import("@/lib/seo-pages").then(({ nextMonthReach }) => alive && setNow(nextMonthReach()));
    return () => {
      alive = false;
    };
  }, []);

  if (now.count === 0) return null;
  const name = MONTHS[now.month - 1];
  return (
    <Link
      href={`/cumpleanos/${name}`}
      className={`card group flex flex-wrap items-center gap-x-4 gap-y-1 bg-sun px-5 py-3 transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-hard-lg ${className}`}
    >
      <Icon name="calendar" shadow className="!size-7 shrink-0" />
      <span className="min-w-0 flex-1 basis-64 font-semibold">
        ¿Cumples en {name}? Todavía alcanzas <b className="display text-2xl">{now.count}</b> regalos
        {now.register > 0 && <>; {now.register} piden registro, hazlo esta semana</>}
      </span>
      <span className="font-bold">Ver cuáles →</span>
    </Link>
  );
}
