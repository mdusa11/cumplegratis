"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { burst } from "./BirthdayPicker";
import { lockScroll } from "@/lib/scroll";
import { BASE_PATH, cn } from "@/lib/site";
import { useMediaQuery } from "@/lib/storage";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const DISMISSED = "cg:install-dismissed";
const SNOOZE_DAYS = 14;
const BANNER_DELAY_MS = 20_000;

/** Abre la guía de instalación desde cualquier botón ("Instalar app" del menú, footer, etc.). */
export const openInstall = () => window.dispatchEvent(new Event("cg:install"));

const noop = () => () => {};
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function useInstalled() {
  const standalone = useMediaQuery("(display-mode: standalone)");
  const iosStandalone = useSyncExternalStore(noop, () => Boolean((navigator as { standalone?: boolean }).standalone), () => false);
  return standalone || iosStandalone;
}

function snoozed() {
  try {
    const at = Number(localStorage.getItem(DISMISSED));
    return at > 0 && Date.now() - at < SNOOZE_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

export function PwaInstall() {
  const installed = useInstalled();
  const ios = useSyncExternalStore(noop, isIos, () => false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [banner, setBanner] = useState(false);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).catch(() => {});
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const onInstalled = () => {
      setPrompt(null);
      setBanner(false);
      setGuide(false);
      burst({ x: 0.5, y: 0.3 });
    };
    const onOpen = () => setGuide(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("cg:install", onOpen);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("cg:install", onOpen);
    };
  }, []);

  // El aviso solo sale si se puede instalar, después de un rato navegando y si no lo cerraron hace poco.
  useEffect(() => {
    if (installed || (!prompt && !ios) || snoozed()) return;
    const t = setTimeout(() => setBanner(true), BANNER_DELAY_MS);
    return () => clearTimeout(t);
  }, [installed, prompt, ios]);

  const install = async () => {
    setBanner(false);
    if (!prompt) return setGuide(true);
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  const dismiss = () => {
    setBanner(false);
    try {
      localStorage.setItem(DISMISSED, String(Date.now()));
    } catch {}
  };

  if (installed) return null;

  return (
    <>
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-x-3 top-[5.5rem] z-[45] mx-auto max-w-md sm:top-24"
            role="dialog"
            aria-label="Instalar Cumplegratis"
          >
            <div className="card relative bg-paper p-3 pr-12 shadow-hard-lg">
              <div className="flex items-center gap-3">
                <AppIcon className="size-14 shrink-0" wiggle />
                <div className="min-w-0">
                  <p className="display text-xl leading-none sm:text-2xl">Instala la app</p>
                  <p className="mt-1 text-sm leading-tight font-medium">Tu plan a un toque, aunque no tengas señal.</p>
                </div>
              </div>
              <button type="button" onClick={install} className="btn btn-acid mt-3 w-full !py-2.5 !text-lg">
                📲 Instalar gratis
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Ahora no"
                className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border-2 border-ink text-sm"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{guide && <InstallGuide ios={ios} canPrompt={Boolean(prompt)} onInstall={install} onClose={() => setGuide(false)} />}</AnimatePresence>
    </>
  );
}

export function AppIcon({ className, wiggle }: { className?: string; wiggle?: boolean }) {
  return (
    <motion.img
      src={`${BASE_PATH}/icons/icon-192.png`}
      alt=""
      className={cn("rounded-[22%] border-2 border-ink shadow-hard-sm", className)}
      animate={wiggle ? { rotate: [0, -8, 8, -4, 0] } : undefined}
      transition={wiggle ? { repeat: Infinity, duration: 1.2, repeatDelay: 2.5 } : undefined}
    />
  );
}

const IOS_STEPS = [
  { icon: <ShareIcon />, title: "Toca Compartir", body: "El botón del cuadrito con flecha hacia arriba, abajo en Safari." },
  { icon: <PlusIcon />, title: "“Agregar a inicio”", body: "Desliza el menú hacia abajo hasta encontrarlo." },
  { icon: <AppIcon className="size-12" />, title: "¡Listo!", body: "Ábrela desde tu pantalla de inicio, como cualquier app." },
];
const ANDROID_STEPS = [
  { icon: <span className="text-4xl font-black">⋮</span>, title: "Abre el menú", body: "Los tres puntitos de tu navegador." },
  { icon: <PlusIcon />, title: "“Instalar app”", body: "O “Agregar a pantalla principal”." },
  { icon: <AppIcon className="size-12" />, title: "¡Listo!", body: "Ábrela desde tu pantalla de inicio." },
];

function InstallGuide({ ios, canPrompt, onInstall, onClose }: { ios: boolean; canPrompt: boolean; onInstall: () => void; onClose: () => void }) {
  const steps = ios ? IOS_STEPS : ANDROID_STEPS;
  const [active, setActive] = useState(0);

  useEffect(() => {
    lockScroll(true);
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), 1700);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      lockScroll(false);
      clearInterval(t);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose, steps.length]);

  return (
    <div className="fixed inset-0 z-[96] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal aria-label="Cómo instalar Cumplegratis">
      <motion.button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-default bg-ink/70 desk:bg-ink/60 desk:backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 34 }}
        data-lenis-prevent
        className="relative max-h-[92svh] w-full overflow-y-auto overscroll-contain rounded-t-[2rem] border-[2.5px] border-ink bg-paper p-6 pb-10 shadow-hard-lg sm:p-8 md:max-w-lg md:rounded-[2rem] md:pb-8"
      >
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full border-2 border-ink bg-paper hover:bg-acid">
          ✕
        </button>
        <div className="flex items-center gap-4 pr-12">
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}>
            <AppIcon className="size-20" />
          </motion.div>
          <div>
            <p className="mono-tag">Instálala gratis</p>
            <h2 className="display text-4xl sm:text-5xl">Llévatela en tu cel</h2>
          </div>
        </div>
        <p className="mt-4 text-base font-medium sm:text-lg">Se abre en pantalla completa, sin barra del navegador, y tu plan funciona aunque no tengas internet.</p>

        {canPrompt ? (
          <button type="button" onClick={onInstall} className="btn btn-acid mt-6 w-full !py-4 !text-2xl">
            📲 Instalar ahora
          </button>
        ) : (
          <ol className="mt-6 space-y-3">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                animate={{ scale: active === i ? 1.03 : 1, backgroundColor: active === i ? "#c6ff00" : "#f3f0e8" }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex items-center gap-4 rounded-2xl border-[2.5px] border-ink p-3"
              >
                <motion.span
                  animate={active === i ? { y: [0, -6, 0] } : { y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper"
                >
                  {s.icon}
                </motion.span>
                <span>
                  <span className="display block text-2xl">
                    {i + 1}. {s.title}
                  </span>
                  <span className="text-sm font-medium">{s.body}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        )}
        {ios && (
          <p className="mt-4 text-center text-sm font-medium opacity-70">En iPhone solo se puede desde Safari.</p>
        )}
      </motion.div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="#0b0b0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
      <path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="#0b0b0b" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

/** Tarjeta para invitar a instalar (en "Mi cumple"): el plan es lo que más conviene tener a la mano. */
export function InstallCard() {
  const installed = useInstalled();
  if (installed) return null;
  return (
    <motion.button
      type="button"
      onClick={openInstall}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileTap={{ scale: 0.97 }}
      className="card mt-10 flex w-full items-center gap-4 bg-ink p-5 text-left text-paper transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-hard-lg sm:p-6"
    >
      <AppIcon className="size-16 shrink-0" wiggle />
      <span className="flex-1">
        <span className="display block text-3xl text-acid sm:text-4xl">Ten tu plan a un toque</span>
        <span className="font-medium">Instala Cumplegratis en tu cel: gratis, sin tienda de apps y funciona sin señal.</span>
      </span>
      <span className="hidden text-3xl sm:block">→</span>
    </motion.button>
  );
}
