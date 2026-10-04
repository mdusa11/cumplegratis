"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AnimatePresence,
  animate,
  useMotionTemplate,
  useMotionValueEvent,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Barra verde arriba que avanza con el scroll de la página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-1.5 origin-left bg-acid" style={{ scaleX }} />;
}

/** El hijo se "pega" al cursor cuando pasa cerca. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Número que cuenta desde 0 cuando entra en pantalla. */
export function CountUp({ value, className, duration = 1.4 }: { value: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!inView || reduced) {
      el.textContent = inView || reduced ? String(value) : "0";
      return;
    }
    const controls = animate(0, value, { duration, ease: EASE, onUpdate: (v) => (el.textContent = String(Math.round(v))) });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {value}
    </span>
  );
}

/** Título que entra palabra por palabra al aparecer en pantalla. `*palabra` la resalta en verde. */
export function TitleReveal({ text, className, as: Tag = "h2" }: { text: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  const words = text.split(" ");
  return (
    <Tag className={cn("display", className)} aria-label={text.replace(/\*/g, "")}>
      {words.map((w, i) => {
        const hl = w.startsWith("*");
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-bottom">
            <motion.span
              className={cn("inline-block", hl && "rounded-[0.1em] bg-acid px-[0.08em]")}
              initial={{ y: "105%", rotate: 6 }}
              whileInView={{ y: "0%", rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.06 }}
            >
              {hl ? w.slice(1) : w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </Tag>
  );
}

const FLOATERS = [
  { e: "🎂", x: "8%", y: "70%", d: 0.9, s: "3.2rem" },
  { e: "🎈", x: "46%", y: "12%", d: 1.4, s: "2.6rem" },
  { e: "🎁", x: "92%", y: "82%", d: 0.6, s: "3rem" },
  { e: "🍩", x: "40%", y: "88%", d: 1.1, s: "2.4rem" },
  { e: "🎉", x: "97%", y: "8%", d: 1.6, s: "2.4rem" },
  { e: "☕", x: "3%", y: "22%", d: 0.7, s: "2.2rem" },
];

/** Emojis que flotan y se mueven en sentido contrario al mouse (profundidad). */
export function Floaters() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [mx, my, reduced]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden select-none md:block">
      {FLOATERS.map((f, i) => (
        <Floater key={f.e} {...f} index={i} mx={mx} my={my} />
      ))}
    </div>
  );
}

function Floater({ e, x, y, d, s, index, mx, my }: (typeof FLOATERS)[number] & { index: number; mx: MotionValue<number>; my: MotionValue<number> }) {
  const tx = useSpring(useTransform(mx, (v) => v * -60 * d), { stiffness: 60, damping: 18 });
  const ty = useSpring(useTransform(my, (v) => v * -60 * d), { stiffness: 60, damping: 18 });
  return (
    <motion.span className="absolute" style={{ left: x, top: y, x: tx, y: ty, fontSize: s }}>
      <motion.span
        className="block"
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: [0, 8, -6, 0], y: [0, -14, 0] }}
        transition={{
          scale: { delay: 1.4 + index * 0.1, type: "spring", stiffness: 260, damping: 12 },
          rotate: { repeat: Infinity, duration: 5 + index, ease: "easeInOut" },
          y: { repeat: Infinity, duration: 3.5 + index * 0.4, ease: "easeInOut" },
        }}
      >
        {e}
      </motion.span>
    </motion.span>
  );
}

/** La sección se "abre" desde una tarjeta redondeada hasta ocupar todo el ancho conforme entra con el scroll. */
export function ClipReveal({ children, className, id, noFab }: { children: ReactNode; className?: string; id?: string; noFab?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const inset = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [56, 0]);
  const clipPath = useMotionTemplate`inset(0% ${inset}% 0% ${inset}% round ${radius}px)`;
  return (
    <motion.section ref={ref} id={id} style={{ clipPath }} className={className} data-no-fab={noFab || undefined}>
      {children}
    </motion.section>
  );
}

/** Botón flotante en móvil: aparece después del hero y se esconde al llegar al final. */
export function FloatingCTA() {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [past, setPast] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setPast(y > 800 && scrollYProgress.get() < 0.9));

  // Se esconde mientras haya en pantalla una sección interactiva marcada con data-no-fab (mazo, selector de fecha).
  useEffect(() => {
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setBlocked(visible.size > 0);
    });
    document.querySelectorAll("[data-no-fab]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const show = past && !blocked;
  if (pathname !== "/") return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed inset-x-4 bottom-4 z-40 lg:hidden"
        >
          <Link href="/mi-cumple" className="btn btn-acid w-full !py-4 !text-xl shadow-hard-lg">
            <motion.span animate={{ rotate: [0, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}>
              🎂
            </motion.span>
            Armar mi plan
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
