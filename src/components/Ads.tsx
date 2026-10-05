"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ADS, cn } from "@/lib/site";
import { saveConsent, useConsent } from "@/lib/storage";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  }
}

/** Carga AdSense una sola vez, ya que el visitante eligió en el aviso. "Solo esenciales" = anuncios no personalizados. */
function useAdsScript() {
  const consent = useConsent();
  useEffect(() => {
    if (!ADS.client || !consent || document.getElementById("adsbygoogle-js")) return;
    window.adsbygoogle = window.adsbygoogle || [];
    if (consent === "essential") window.adsbygoogle.requestNonPersonalizedAds = 1;
    const s = document.createElement("script");
    s.id = "adsbygoogle-js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`;
    document.head.appendChild(s);
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

/** Bloque de anuncio con el marco de la marca; reserva altura para no mover la página al cargar. */
export function AdSlot({ className }: { className?: string }) {
  const consent = useConsent();
  const ref = useRef<HTMLModElement>(null);
  const ready = Boolean(ADS.client && ADS.slot && consent);

  useEffect(() => {
    if (!ready || !ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [ready]);

  if (!ready) return null;
  return (
    <aside className={cn("rounded-[1.6rem] border-2 border-dashed border-ink/30 bg-paper-2/60 p-3", className)} aria-label="Publicidad">
      <p className="mono-tag mb-2 !text-[0.65rem] opacity-60">Publicidad</p>
      <ins
        ref={ref}
        className="adsbygoogle block min-h-[250px]"
        data-ad-client={ADS.client}
        data-ad-slot={ADS.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
