import type Lenis from "lenis";

/** Instancia global de Lenis para poder pausar el scroll de la página cuando hay un panel abierto. */
export const smooth: { lenis: Lenis | null } = { lenis: null };

export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) smooth.lenis?.stop();
  else smooth.lenis?.start();
}
