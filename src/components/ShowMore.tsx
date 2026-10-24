"use client";

import { useState, type ReactNode } from "react";
import { PAGE_SIZE, cn } from "@/lib/site";

/** Muestra las primeras `size` tarjetas; el resto sigue en el HTML (para buscadores) con `hidden` hasta pedir más. */
export function ShowMore({ items, size = PAGE_SIZE, className }: { items: { key: string; node: ReactNode }[]; size?: number; className?: string }) {
  const [shown, setShown] = useState(size);
  return (
    <>
      <ul className={className}>
        {items.map((it, i) => (
          <li key={it.key} className={cn(i >= shown ? "hidden" : "lazy-paint")}>
            {it.node}
          </li>
        ))}
      </ul>
      {items.length > shown && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setShown((n) => n + size)} className="btn btn-ink">
            Ver {Math.min(size, items.length - shown)} más <span className="opacity-70">({shown} de {items.length})</span>
          </button>
        </div>
      )}
    </>
  );
}
