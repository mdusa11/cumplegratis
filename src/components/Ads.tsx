"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ADS, cn } from "@/lib/site";
import { saveConsent, useConsent } from "@/lib/storage";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  }
}

/** El script ya viene en el HTML (layout); aquí solo se ajusta si los anuncios pueden ser personalizados. */
function useAdsScript() {
  const consent = useConsent();
  useEffect(() => {
    if (!ADS.client) return;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = consent === "all" ? 0 : 1;
  }, [consent]);
  return consent;
}

export const openCookiePrefs = () => saveConsent(null);

export function CookieBanner() {
  const consent = useAdsScript();
  return (
    <AnimatePresence>
      {ADS.client && consent === null && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32, delay: 1.2 }}
          role="dialog"
          aria-label="Aviso de cookies"
          className="card fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl bg-paper p-4 shadow-hard-lg sm:p-5"
        >
          <p className="font-semibold">Cumplegratis es gratis gracias a anuncios.</p>
          <p className="mt-1 text-sm font-medium">
            Google usa cookies para mostrarlos. Si aceptas, pueden ser personalizados; si no, verás anuncios genéricos.{" "}
            <Link href="/privacidad#publicidad" className="underline underline-offset-2">
              Más info
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => saveConsent("all")} className="btn btn-ink !px-5 !py-2 !text-base">
              Aceptar
            </button>
            <button type="button" onClick={() => saveConsent("essential")} className="btn btn-paper !px-5 !py-2 !text-base">
              Solo esenciales
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const NO_ADS = /^\/(admin|offline)(\/|$)/;

function Unit({ className }: { className?: string }) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <aside className={cn("rounded-[1.6rem] border-2 border-dashed border-ink/30 bg-paper-2/60 p-3", className)} aria-label="Publicidad">
      <p className="mono-tag mb-2 !text-[0.65rem] opacity-70">Publicidad</p>
      <ins
        ref={ref}
        className="adsbygoogle block min-h-[280px] md:min-h-[250px]"
        data-ad-client={ADS.client}
        data-ad-slot={ADS.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

/** Bloque de anuncio con el marco de la marca. Sin slot no renderiza nada; con key por ruta cada página crea su propio <ins> y su push. */
export function AdSlot({ className }: { className?: string }) {
  const pathname = usePathname();
  if (!ADS.client || !ADS.slot || NO_ADS.test(pathname)) return null;
  return <Unit key={pathname} className={className} />;
}
