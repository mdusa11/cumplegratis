// Analítica propia y anónima: sin cookies ni IP. Un id aleatorio por pestaña (sessionStorage) para contar visitas.
// Solo se envía en el dominio real; en desarrollo y en vistas previas no se mide.

export type TrackType = "pageview" | "leave" | "promo_open" | "city_set" | "search" | "filter" | "share" | "whatsapp" | "signup_click" | "install" | "birthday";

let sid: string | null = null;
let vid: string | null = null;

// Id aleatorio que se queda en este navegador: solo sirve para saber si alguien regresa. No se liga a ningún dato personal.
function visitor() {
  if (vid) return vid;
  try {
    vid = localStorage.getItem("cg:vid");
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem("cg:vid", vid);
    }
  } catch {
    vid = null;
  }
  return vid;
}
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

// El origen (Google, TikTok…) solo cuenta en la primera página de la visita. Un ?utm_source= (enlaces cortos /tt, /ig…)
// manda sobre el referrer, porque las apps casi nunca lo envían.
function firstReferrer() {
  if (referrer !== undefined) return null;
  try {
    const utm = new URLSearchParams(location.search).get("utm_source");
    if (utm) return (referrer = `${utm.toLowerCase().slice(0, 30)} (enlace)`);
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

export type PageStats = { path?: string; sec?: number; sc?: number; lcp?: number; cls?: number; inp?: number };

export function track(t: TrackType, data: { target?: string | null; value?: number } & PageStats = {}) {
  // navigator.webdriver: navegadores automatizados (pruebas, robots disfrazados de celular). No son personas.
  if (typeof window === "undefined" || !location.hostname.endsWith("cumplegratis.fun") || navigator.webdriver) return;
  const loc = chosenLocation();
  const body = JSON.stringify({
    t,
    p: data.path ?? location.pathname.replace(/(.)\/$/, "$1"),
    g: data.target ?? null,
    v: data.value,
    s: session(),
    f: t === "pageview" && referrer === undefined,
    r: t === "pageview" ? firstReferrer() : null,
    st: matchMedia("(display-mode: standalone)").matches,
    as: loc.state ?? null,
    ac: loc.city ?? null,
    u: visitor(),
    sec: data.sec,
    sc: data.sc,
    lcp: data.lcp,
    cls: data.cls,
    inp: data.inp,
  });
  try {
    if (!navigator.sendBeacon?.("/api/e", new Blob([body], { type: "application/json" }))) {
      fetch("/api/e", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  } catch {}
}
