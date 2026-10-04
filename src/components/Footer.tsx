"use client";

import Link from "next/link";
import { Icon } from "./Icon";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SITE } from "@/lib/site";
import { openInstall } from "./PwaInstall";

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
        <FooterCol
          title="Explora"
          links={[
            ["/promos", "Todas las promos"],
            ["/ciudades", "Promos por ciudad"],
            ["/categorias/restaurantes", "Comida gratis"],
            ["/categorias/belleza", "Belleza"],
            ["/categorias/cine", "Cine"],
            ["/mi-cumple", "Mi plan de cumpleaños"],
          ]}
        />
        <div>
          <FooterCol
            title="Guías y ayuda"
            links={[
              ["/guias/que-te-regalan-en-tu-cumpleanos", "Qué te regalan en tu cumple"],
              ["/guias/comida-gratis-en-tu-cumpleanos", "Comida gratis"],
              ["/guias/como-cobrar-regalos-de-cumpleanos", "Cómo cobrarlo todo"],
              ["/promos#sugerir", "Sugerir una promo"],
              ["/#faq", "Preguntas frecuentes"],
            ]}
          />
          <button type="button" onClick={openInstall} className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-acid px-4 py-2 font-semibold text-acid transition-colors hover:bg-acid hover:text-ink">
            <Icon name="install" /> Instalar la app
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-5 pb-4 text-sm font-semibold sm:px-8">
        <Link href="/terminos" className="text-paper/70 underline-offset-4 hover:text-acid hover:underline">
          Términos y condiciones
        </Link>
        <Link href="/privacidad" className="text-paper/70 underline-offset-4 hover:text-acid hover:underline">
          Aviso de privacidad
        </Link>
        <span className="text-paper/40">© {new Date().getFullYear()} {SITE.name}</span>
      </div>
      <p className="mx-auto max-w-7xl px-5 text-sm text-paper/50 sm:px-8">
        Cumplegratis no está afiliado a ninguna de las marcas mencionadas; sus nombres pertenecen a sus titulares y se usan solo para identificar
        cada promoción. Las promociones las decide cada marca y cambian sin aviso: confirma siempre las condiciones oficiales. Última revisión:{" "}
        {SITE.lastReview}.
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
