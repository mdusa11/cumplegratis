"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Logo } from "./Logo";
import { cn } from "@/lib/site";

const LINKS = [
  { href: "/promos", label: "Promos" },
  { href: "/mi-cumple", label: "Mi cumple" },
];

export function Nav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
  });

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setOpen(false);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      animate={{ y: hidden && !open ? "-130%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border-[2.5px] border-ink bg-paper/90 py-2 pr-2 pl-5 shadow-hard backdrop-blur-md">
        <Logo onClick={close} />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-4 py-2 font-semibold transition-colors",
                isActive(l.href) ? "text-paper" : "hover:bg-paper-2",
              )}
            >
              {isActive(l.href) && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
              )}
              {l.label}
            </Link>
          ))}
          <Link href="/mi-cumple" className="btn btn-acid ml-2 !py-2.5 !text-lg">
            Arma tu plan →
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="relative flex size-11 items-center justify-center rounded-full border-2 border-ink bg-acid md:hidden"
        >
          <motion.span className="absolute h-0.5 w-5 bg-ink" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }} />
          <motion.span className="absolute h-0.5 w-5 bg-ink" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="card mx-auto mt-3 flex max-w-7xl flex-col gap-2 bg-acid p-4 md:hidden"
          >
            {[{ href: "/", label: "Inicio" }, ...LINKS].map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                <Link href={l.href} onClick={close} className="display block py-1 text-6xl">
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
