"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/** Páginas vistas en cada navegación y clics salientes (WhatsApp, registro en la marca) por delegación, sin tocar cada botón. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    track("pageview");
  }, [pathname]);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.hostname === "wa.me") track("whatsapp", { target: location.pathname });
      else if (a.hostname && !a.hostname.endsWith("cumplegratis.fun") && a.rel.includes("nofollow")) track("signup_click", { target: a.hostname.replace(/^www\./, "") });
    };
    const installed = () => track("install");
    document.addEventListener("click", click, { capture: true });
    window.addEventListener("appinstalled", installed);
    return () => {
      document.removeEventListener("click", click, { capture: true });
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  return null;
}
