"use client";

import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { BenefitBadge } from "./BenefitBadge";
import { useLocation, locationName } from "./LocationProvider";
import { AVAILABILITY_LABEL, availability, type Availability } from "@/lib/availability";
import { CITIES, STATES } from "@/lib/places";
import { CATEGORIES, CONFIDENCE, GROUPS, WINDOW_LABEL, coverageLabel, groupOf, quickRules, ruleIcon, validityText, type Promo } from "@/lib/promos";
import { lockScroll } from "@/lib/scroll";
import { cn } from "@/lib/site";
import { useMediaQuery } from "@/lib/storage";

const SheetContext = createContext<(p: Promo) => void>(() => {});
export const useOpenPromo = () => useContext(SheetContext);

export function PromoSheetProvider({ children }: { children: ReactNode }) {
  const [promo, setPromo] = useState<Promo | null>(null);
  const close = useCallback(() => setPromo(null), []);
  return (
    <SheetContext.Provider value={setPromo}>
      {children}
      <AnimatePresence>{promo && <Sheet key={promo.slug} promo={promo} onClose={close} />}</AnimatePresence>
    </SheetContext.Provider>
  );
}

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } };
const ITEM = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 320, damping: 28 } } };

const BANNER: Record<Availability, { bg: string; icon: IconName }> = {
  nacional: { bg: "bg-sky", icon: "mexico" },
  "tu-ciudad": { bg: "bg-acid", icon: "check" },
  cerca: { bg: "bg-acid", icon: "check" },
  "tu-estado": { bg: "bg-acid", icon: "check" },
  fuera: { bg: "bg-hot", icon: "warning" },
  "en-linea": { bg: "bg-sky", icon: "phone" },
  "sin-dato": { bg: "bg-paper-2", icon: "question" },
};

function Sheet({ promo, onClose }: { promo: Promo; onClose: () => void }) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const drag = useDragControls();
  const { location, openPicker } = useLocation();
  const group = GROUPS[groupOf(promo)];
  const cat = CATEGORIES[promo.category];
  const rules = quickRules(promo);
  const avail = location ? availability(promo, location) : null;

  useEffect(() => {
    lockScroll(true);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 140 || info.velocity.y > 600) onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-end" role="dialog" aria-modal aria-label={`Promo de ${promo.brand}`}>
      <motion.button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/70 desk:bg-ink/55 desk:backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        initial={desktop ? { x: "100%" } : { y: "100%" }}
        animate={desktop ? { x: 0 } : { y: 0 }}
        exit={desktop ? { x: "100%" } : { y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
        drag={desktop ? false : "y"}
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={onDragEnd}
        className="relative flex h-[90svh] w-full flex-col overflow-hidden rounded-t-[2rem] border-[2.5px] border-b-0 border-ink bg-paper md:h-full md:max-w-[560px] md:rounded-none md:rounded-l-[2rem] md:border-r-0 md:border-b-[2.5px]"
      >
        <div onPointerDown={(e) => drag.start(e)} className="absolute inset-x-0 top-0 z-10 h-8 touch-none md:hidden">
          <span className="mx-auto mt-3 block h-1.5 w-14 rounded-full bg-ink/70" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-20 flex size-11 items-center justify-center rounded-full border-2 border-ink bg-paper text-xl transition-transform hover:rotate-90 md:top-5 md:right-5"
        >
          ✕
        </button>

        {/* Todo se desplaza junto: en pantallas bajas (tablet acostada) el encabezado fijo no dejaba leer los detalles. */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
          <header className="relative border-b-[2.5px] border-ink px-6 pt-9 pb-5 sm:px-8 md:pt-6" style={{ background: group.color }}>
            <p className="mono-tag">
              <Icon name={cat.icon} /> {cat.label}
            </p>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 22 }}
              className="display mt-2 pr-12 text-[clamp(2.6rem,min(12vw,9svh),4.5rem)] break-words"
            >
              {promo.brand}
            </motion.h2>
            <p className="mt-2 text-xl leading-tight font-bold sm:text-2xl">{promo.benefit}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <BenefitBadge type={promo.benefitType} />
              <span className="chip bg-paper">
                <Icon name="calendar" /> {WINDOW_LABEL[promo.window]}
              </span>
              <span className="chip bg-paper">{CONFIDENCE[promo.confidence].label}</span>
            </div>
          </header>

          <motion.div className="px-6 pb-32 sm:px-8" variants={STAGGER} initial="hidden" animate="show">
            {avail ? (
              <motion.div variants={ITEM} className={cn("card mt-6 flex items-start gap-3 p-4", BANNER[avail].bg)}>
                <Icon name={BANNER[avail].icon} tone={BANNER[avail].bg === "bg-acid" ? "var(--color-paper)" : undefined} className="!size-7" />
                <div className="flex-1">
                  <p className="display text-2xl">{avail === "fuera" ? "No está en tu zona" : AVAILABILITY_LABEL[avail]}</p>
                  <p className="text-sm font-medium">
                    {avail === "fuera" ? `Solo en: ${coverageLabel(promo)}.` : `Tu zona: ${locationName(location!).replace(/\.$/, "")}.`}{" "}
                    <button type="button" onClick={openPicker} className="underline underline-offset-2">
                      Cambiar
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.button
                variants={ITEM}
                type="button"
                onClick={openPicker}
                className="card mt-6 flex w-full items-center gap-3 bg-paper-2 p-4 text-left"
              >
                <Icon name="pin" className="!size-7" />
                <span className="font-semibold">¿Está en tu ciudad? Dinos dónde estás →</span>
              </motion.button>
            )}

            <Section title="Lo que necesitas">
              <div className="grid grid-cols-2 gap-2">
                {rules.map((r) => (
                  <motion.div key={r.label} variants={ITEM} className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-paper p-3">
                    <Icon name={r.icon} className="!size-7" />
                    <span className="text-sm leading-tight font-bold">{r.label}</span>
                  </motion.div>
                ))}
              </div>
              {promo.requirements.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {promo.requirements.map((req) => (
                    <motion.li key={req} variants={ITEM} className="flex gap-3 text-lg leading-snug">
                      <Icon name={ruleIcon(req)} className="mt-0.5 !size-6" />
                      {req}
                    </motion.li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Cuándo">
              <motion.p variants={ITEM} className="text-lg">
                <Icon name="calendar" /> {promo.windowNote}
              </motion.p>
              {validityText(promo) && (
                <motion.p variants={ITEM} className="mt-1 text-base font-semibold">
                  <Icon name="hourglass" /> {validityText(promo)}
                </motion.p>
              )}
            </Section>

            <Section title="Cómo cobrarlo">
              <motion.p variants={ITEM} className="text-lg">
                {promo.howToClaim}
              </motion.p>
            </Section>

            <Section title="Dónde">
              <motion.p variants={ITEM} className="text-lg font-semibold">
                <Icon name="pin" /> {coverageLabel(promo)}
              </motion.p>
              {promo.locationNote && (
                <motion.p variants={ITEM} className="mt-1 text-base">
                  {promo.locationNote}
                </motion.p>
              )}
              {(promo.cities.length > 0 || promo.states.length > 0) && (
                <motion.div variants={ITEM} className="mt-3 flex flex-wrap gap-1.5">
                  {promo.cities.length > 0
                    ? promo.cities.map((c) => (
                        <span key={c} className="chip bg-paper !text-xs">
                          {CITIES[c].name}
                        </span>
                      ))
                    : promo.states.map((s) => (
                        <span key={s} className="chip bg-paper !text-xs">
                          {STATES[s].name}
                        </span>
                      ))}
                </motion.div>
              )}
            </Section>

            {promo.details && (
              <Section title="Letra chiquita">
                <motion.p variants={ITEM} className="text-base leading-relaxed">
                  {promo.details}
                </motion.p>
              </Section>
            )}

            <Section title="¿Qué tan segura es?">
              <motion.p variants={ITEM}>
                <b>{CONFIDENCE[promo.confidence].label}:</b> {CONFIDENCE[promo.confidence].hint}
              </motion.p>
              {promo.sources.length > 0 && (
                <motion.ul variants={ITEM} className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {promo.sources.map((s) => (
                    <li key={s}>
                      <a href={s} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-hot">
                        {new URL(s).hostname.replace("www.", "")}
                      </a>
                    </li>
                  ))}
                </motion.ul>
              )}
            </Section>
          </motion.div>
        </div>

        <motion.footer
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 28 }}
          className="absolute inset-x-0 bottom-0 flex gap-3 border-t-[2.5px] border-ink bg-paper p-3 desk:bg-paper/95 desk:backdrop-blur sm:px-8 sm:py-4"
        >
          {promo.signupUrl && (
            <a href={promo.signupUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-ink flex-1 !px-4 !text-lg">
              {promo.program ? "Registrarme" : "Sitio oficial"} ↗︎
            </a>
          )}
          <Link href={`/promos/${promo.slug}`} onClick={onClose} className="btn btn-paper flex-1 !px-4 !text-lg">
            Página completa
          </Link>
        </motion.footer>
      </motion.aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <motion.h3 variants={ITEM} className="mono-tag mb-3">
        {title}
      </motion.h3>
      {children}
    </section>
  );
}
