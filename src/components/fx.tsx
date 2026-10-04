"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  animate,
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
