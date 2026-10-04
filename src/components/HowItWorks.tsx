"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { useMediaQuery } from "@/lib/storage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    n: "01",
    title: "Pon tu fecha",
    body: "Tu día y tu mes. Nada más. Sin cuenta, sin contraseñas, sin rollos.",
    emoji: "📅",
    color: "var(--color-acid)",
  },
  {
    n: "02",
    title: "Regístrate a tiempo",
    body: "Casi todas las marcas te piden estar en su programa de lealtad días o semanas antes. Te decimos cuáles y hasta cuándo.",
    emoji: "⏰",
    color: "var(--color-lilac)",
  },
  {
    n: "03",
    title: "Cobra todo tu mes",
    body: "Café, pastel, cine, descuentos. Llegas, enseñas la app o tu INE y listo. Así de fácil.",
    emoji: "🎁",
    color: "var(--color-hot)",
  },
];

/** En escritorio la sección se queda fija y las tarjetas pasan en horizontal con el scroll. */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Scroll horizontal fijado solo en escritorio con mouse; en tablets/celulares es pesado y se siente trabado.
      mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            pin: true,
            // `true` sigue al scroll 1:1: Lenis ya lo suaviza; un segundo suavizado lo hacía sentir lento.
            scrub: true,
            anticipatePin: 1,
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((card) => {
          gsap.fromTo(
            card,
            { rotate: 6, scale: 0.92 },
            {
              rotate: -2,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center center", scrub: true },
            },
          );
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative overflow-hidden bg-paper py-20 desk:flex desk:h-screen desk:items-center desk:py-0">
      <div
        ref={track}
        className="flex flex-col gap-8 px-5 sm:px-8 lg:grid lg:grid-cols-3 desk:flex desk:w-max desk:flex-row desk:items-center desk:gap-12 desk:pr-[12vw] desk:pl-[6vw] desk:will-change-transform"
      >
        <div className="lg:col-span-3 desk:col-auto desk:w-[34vw] desk:shrink-0">
          <p className="mono-tag">Cómo funciona</p>
          <h2 className="display mt-3 text-[clamp(3.5rem,9vw,9rem)]">
            Así de <span className="outline-text">fácil</span>
          </h2>
          <p className="mt-4 max-w-sm text-xl font-medium">Tres pasos y no se te vuelve a pasar un regalo de cumpleaños.</p>
        </div>
        {STEPS.map((s, i) => (
          <StepCard key={s.n} step={s} index={i} animate={!desktop} />
        ))}
      </div>
    </section>
  );
}

/** En móvil/tablet cada tarjeta entra sola al aparecer (barato); en escritorio la anima GSAP con el scroll. */
function StepCard({ step: s, index, animate }: { step: (typeof STEPS)[number]; index: number; animate: boolean }) {
  return (
    <motion.article
      data-step
      initial={animate ? { opacity: 0, y: 60, rotate: index % 2 ? -3 : 3 } : false}
      whileInView={animate ? { opacity: 1, y: 0, rotate: 0 } : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 160, damping: 20, delay: index * 0.08 }}
      className="card relative flex min-h-[22rem] flex-col justify-between p-7 sm:p-10 desk:h-[68vh] desk:w-[46vw] desk:shrink-0"
      style={{ background: s.color }}
    >
      <div className="flex items-start justify-between">
        <span className="display outline-text text-[8rem] desk:text-[12rem]">{s.n}</span>
        <span className="bob text-6xl desk:text-8xl" style={{ animationDelay: `${index * 0.4}s` }}>
          {s.emoji}
        </span>
      </div>
      <div>
        <h3 className="display text-[clamp(2.6rem,11vw,3.75rem)] lg:text-[clamp(2.2rem,3.6vw,3.2rem)] desk:text-[clamp(3.5rem,5.4vw,6rem)]">{s.title}</h3>
        <p className="mt-4 max-w-lg text-xl leading-snug font-medium desk:text-2xl">{s.body}</p>
      </div>
    </motion.article>
  );
}
