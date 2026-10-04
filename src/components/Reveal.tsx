"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Aparece al entrar en pantalla (sube y se desvanece). */
export function Reveal({ children, delay = 0, className, y = 40 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Texto cuyas palabras se "encienden" conforme haces scroll. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("flex flex-wrap", className)} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const highlight = children.startsWith("*");
  const word = highlight ? children.slice(1) : children;
  return (
    <motion.span aria-hidden style={{ opacity }} className={cn("mr-[0.25em]", highlight && "rounded-lg bg-acid px-1.5")}>
      {word}
    </motion.span>
  );
}

/** Titular que entra letra por letra desde abajo. */
export function SplitText({ text, className, delay = 0, stagger = 0.03 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  return (
    <span className={cn("-mt-[0.18em] inline-block overflow-hidden pt-[0.18em] pb-[0.06em]", className)} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ y: "110%", rotate: 8 }}
          animate={{ y: "0%", rotate: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
