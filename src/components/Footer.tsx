"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SITE } from "@/lib/site";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["60%", "0%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 0]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-20 pb-10 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-4xl text-acid sm:text-5xl">Que ningún regalo se te escape.</p>
          <p className="mt-4 max-w-sm text-paper/70">{SITE.description}</p>
        </div>
        <FooterCol title="Explora" links={[["/promos", "Todas las promos"], ["/mi-cumple", "Mi plan de cumpleaños"], ["/promos?g=comida", "Comida gratis"]]} />
        <FooterCol title="Ayuda" links={[["/promos#sugerir", "Sugerir una promo"], ["/#faq", "Preguntas frecuentes"]]} />
      </div>

      <p className="mx-auto max-w-7xl px-5 text-sm text-paper/50 sm:px-8">
        Cumplegratis no está afiliado a ninguna de las marcas mencionadas. Las promociones cambian sin aviso: revisa siempre las condiciones
        oficiales. Última revisión: {SITE.lastReview}.
      </p>

      <motion.p
        aria-hidden
        style={{ y, rotate }}
        className="display pointer-events-none mt-6 origin-bottom-left text-center text-[15.6vw] leading-[0.78] whitespace-nowrap text-acid select-none"
      >
        Cumplegratis
      </motion.p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mono-tag text-paper/50">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-lg font-semibold transition-colors hover:text-acid">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
