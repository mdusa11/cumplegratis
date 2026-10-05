"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { SITE, cn } from "@/lib/site";

/** Menú nativo de compartir en el celular; en computadora, WhatsApp o copiar el enlace. */
export function ShareButton({ path, text, label = "Compartir", iconOnly, className }: { path: string; text: string; label?: string; iconOnly?: boolean; className?: string }) {
  const url = `${SITE.url}${path}`;
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const out = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setMenu(false);
    window.addEventListener("pointerdown", out);
    return () => window.removeEventListener("pointerdown", out);
  }, [menu]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: SITE.name, text, url });
      } catch {}
      return;
    }
    setMenu((m) => !m);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div ref={box} className={cn("relative", iconOnly && "shrink-0")}>
      <button type="button" onClick={share} aria-label={label} className={cn("btn btn-paper gap-2", className)}>
        <Icon name="share" className={cn(iconOnly && "!size-6")} /> {!iconOnly && label}
      </button>
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            className={cn("card absolute z-30 flex w-56 flex-col gap-1 bg-paper p-2", iconOnly ? "right-0 bottom-full mb-2" : "top-full left-0 mt-2")}
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold hover:bg-paper-2"
            >
              <Icon name="whatsapp" /> WhatsApp
            </a>
            <button type="button" onClick={copy} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold hover:bg-paper-2">
              <Icon name={copied ? "check" : "share"} /> {copied ? "¡Enlace copiado!" : "Copiar enlace"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
