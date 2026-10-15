"use client";

import { LayoutGroup, motion } from "motion/react";
import { CHANNEL_LABEL, type Channel } from "@/lib/availability";
import { cn } from "@/lib/site";

export type ChannelPick = Channel | "todas";

/** Separa lo local de lo que es igual en todo México (cadenas y promos en línea). */
export function ChannelFilter({ value, onChange, counts, id }: { value: ChannelPick; onChange: (c: ChannelPick) => void; counts: Record<ChannelPick, number>; id: string }) {
  return (
    <div role="tablist" aria-label="Dónde se cobra" className="flex gap-2 overflow-x-auto pb-1">
      <LayoutGroup id={id}>
        {(["todas", "local", "sucursal", "en-linea"] as ChannelPick[]).map((c) => {
          const active = value === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(c)}
              disabled={!counts[c] && !active}
              className={cn(
                "relative shrink-0 rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold whitespace-nowrap transition-colors",
                active ? "text-paper" : "bg-paper hover:bg-paper-2",
                !counts[c] && !active && "cursor-not-allowed opacity-40",
              )}
            >
              {active && <motion.span layoutId={`${id}-pill`} className="absolute inset-[-2px] rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
              <span className="relative">
                {c === "todas" ? "Todas" : CHANNEL_LABEL[c]}
                <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", active ? "bg-acid text-ink" : "bg-paper-2")}>{counts[c]}</span>
              </span>
            </button>
          );
        })}
      </LayoutGroup>
    </div>
  );
}

export function countChannels<T>(list: T[], of: (x: T) => ChannelPick): Record<ChannelPick, number> {
  const counts: Record<ChannelPick, number> = { todas: list.length, local: 0, sucursal: 0, "en-linea": 0 };
  list.forEach((x) => counts[of(x)]++);
  return counts;
}
