"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

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
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            pin: true,
            scrub: 0.8,
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
    <section ref={section} className="relative overflow-hidden bg-paper py-20 lg:flex lg:h-screen lg:items-center lg:py-0">
      <div ref={track} className="flex flex-col gap-8 px-5 sm:px-8 lg:w-max lg:flex-row lg:items-center lg:gap-12 lg:pr-[12vw] lg:pl-[6vw]">
        <div className="lg:w-[34vw] lg:shrink-0">
          <p className="mono-tag">Cómo funciona</p>
          <h2 className="display mt-3 text-[clamp(3.5rem,9vw,9rem)]">
            Así de <span className="outline-text">fácil</span>
          </h2>
          <p className="mt-4 max-w-sm text-xl font-medium">Tres pasos y no se te vuelve a pasar un regalo de cumpleaños.</p>
        </div>
        {STEPS.map((s) => (
          <article
            key={s.n}
            data-step
            className="card relative flex min-h-[22rem] flex-col justify-between p-7 sm:p-10 lg:h-[68vh] lg:w-[46vw] lg:shrink-0"
            style={{ background: s.color }}
          >
            <div className="flex items-start justify-between">
              <span className="display outline-text text-[8rem] lg:text-[12rem]">{s.n}</span>
              <span className="text-6xl lg:text-8xl">{s.emoji}</span>
            </div>
            <div>
              <h3 className="display text-[clamp(2.6rem,11vw,3.75rem)] lg:text-[clamp(3.5rem,5.4vw,6rem)]">{s.title}</h3>
              <p className="mt-4 max-w-lg text-xl leading-snug font-medium lg:text-2xl">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
