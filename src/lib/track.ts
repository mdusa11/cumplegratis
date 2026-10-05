// Analítica propia y anónima: sin cookies ni IP. Un id aleatorio por pestaña (sessionStorage) para contar visitas.
// Solo se envía en el dominio real; en desarrollo y en vistas previas no se mide.

export type TrackType = "pageview" | "promo_open" | "city_set" | "search" | "share" | "whatsapp" | "signup_click" | "install" | "birthday";

let sid: string | null = null;
let referrer: string | null | undefined;

function session() {
  if (sid) return sid;
  try {
    sid = sessionStorage.getItem("cg:sid");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("cg:sid", sid);
    }
  } catch {
    sid = "anon";
  }
  return sid;
}

// El origen (Google, WhatsApp…) solo cuenta en la primera página de la visita.
function firstReferrer() {
  if (referrer !== undefined) return null;
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    referrer = host && !host.endsWith("cumplegratis.fun") ? host : null;
  } catch {
    referrer = null;
  }
  return referrer;
}

function chosenLocation(): { state?: string; city?: string | null } {
  try {
    return JSON.parse(localStorage.getItem("cg:location") ?? "null") ?? {};
  } catch {
    return {};
  }
}

export function track(t: TrackType, data: { target?: string | null; value?: number } = {}) {
  if (typeof window === "undefined" || !location.hostname.endsWith("cumplegratis.fun")) return;
  const loc = chosenLocation();
  const body = JSON.stringify({
    t,
    p: location.pathname.replace(/(.)\/$/, "$1"),
    g: data.target ?? null,
    v: data.value,
    s: session(),
    r: t === "pageview" ? firstReferrer() : null,
    st: matchMedia("(display-mode: standalone)").matches,
    as: loc.state ?? null,
    ac: loc.city ?? null,
  });
  try {
    if (!navigator.sendBeacon?.("/api/e", new Blob([body], { type: "application/json" }))) {
      fetch("/api/e", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  } catch {}
}
