import { BASE_PATH } from "./site";

/** Pide al service worker guardar estas fichas para verlas sin conexión (él descarta lo ya guardado). */
export function cacheFichas(slugs: string[]) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || !slugs.length) return;
  const urls = slugs.map((s) => `${BASE_PATH}/promos/${s}/`);
  navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage({ type: "cache-pages", urls })).catch(() => {});
}
