import Link from "next/link";
import { cn } from "@/lib/site";

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Cumplegratis, inicio"
      className={cn("group display flex items-center gap-1 text-[1.7rem] tracking-tight", className)}
    >
      <span>Cumple</span>
      <span className="inline-block -rotate-3 rounded-lg border-2 border-ink bg-acid px-1.5 pt-1 pb-0.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:rotate-2 group-hover:scale-105">
        gratis
      </span>
    </Link>
  );
}
