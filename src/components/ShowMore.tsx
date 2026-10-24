"use client";

import { useState, type ReactNode } from "react";
import { PromoCard } from "./PromoCard";
import type { Promo } from "@/lib/promo-meta";
import { PAGE_SIZE, cn } from "@/lib/site";
import { loadPromos } from "@/lib/use-lazy";

/** `first` ya viene en el HTML; las demás (`rest`, solo slugs) se bajan del bundle de datos al pedir más. */
export function ShowMore({ first, rest, size = PAGE_SIZE, className }: { first: { key: string; node: ReactNode }[]; rest: string[]; size?: number; className?: string }) {
  const [shown, setShown] = useState(0);
  const [extra, setExtra] = useState<Promo[]>([]);
  const [busy, setBusy] = useState(false);
  const more = async () => {
    setBusy(true);
    const bySlug = new Map((await loadPromos()).map((p) => [p.slug, p]));
    setExtra(rest.map((s) => bySlug.get(s)).filter((p): p is Promo => !!p));
    setShown((n) => n + size);
    setBusy(false);
  };
  const left = rest.length - shown;
  return (
    <>
      <ul className={className}>
        {first.map((it) => (
          <li key={it.key} className="lazy-paint">
            {it.node}
          </li>
        ))}
        {extra.slice(0, shown).map((p) => (
          <li key={p.slug} className="lazy-paint">
            <PromoCard promo={p} />
          </li>
        ))}
      </ul>
      {left > 0 && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={more} disabled={busy} className={cn("btn btn-ink", busy && "opacity-70")}>
            Ver {Math.min(size, left)} más <span className="opacity-70">({first.length + shown} de {first.length + rest.length})</span>
          </button>
        </div>
      )}
    </>
  );
}
