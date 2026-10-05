import { admin } from "./admin.js";

// Worker del sitio: sirve el export estático (ASSETS) y recibe la analítica propia en /api/e.
// Solo corre para /api/* y /admin* (run_worker_first); el resto lo sirve Cloudflare directo desde los assets.

const TYPES = new Set(["pageview", "leave", "promo_open", "city_set", "search", "filter", "share", "whatsapp", "signup_click", "install", "birthday"]);
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp\/|curl|wget|python|axios/i;
// Robots en centros de datos que se disfrazan de navegador (Frankfurt, Oregon…): se descartan por la red de origen.
const DATACENTER = /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|hetzner|ovh|linode|akamai|oracle|alibaba|tencent|vultr|contabo|leaseweb|m247|datacamp|scaleway|choopa|hostinger|ionos|cloudflare|fastly|zenlayer|psychz|colocrossing|hostwinds|bytedance|censys|shodan/i;
const int = (v, max) => (Number.isFinite(v) && v >= 0 ? Math.min(Math.round(v), max) : null);
const str = (v, n) => (typeof v === "string" && v ? v.slice(0, n) : null);

function device(ua) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}
const os = (ua) => (/android/i.test(ua) ? "Android" : /iphone|ipad|ipod/i.test(ua) ? "iOS" : /windows/i.test(ua) ? "Windows" : /mac os/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "Otro");
const browser = (ua) =>
  /edg\//i.test(ua) ? "Edge" : /samsungbrowser/i.test(ua) ? "Samsung" : /opr\/|opera/i.test(ua) ? "Opera" : /firefox|fxios/i.test(ua) ? "Firefox" : /crios|chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Otro";

async function collect(request, env) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  if (!/^https:\/\/([a-z0-9-]+\.)?cumplegratis\.fun(\/|$)/.test(origin)) return new Response(null, { status: 403 });
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new Response(null, { status: 204 });

  let e;
  try {
    const text = await request.text();
    if (text.length > 2048) return new Response(null, { status: 413 });
    e = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!TYPES.has(e.t)) return new Response(null, { status: 400 });

  const cf = request.cf ?? {};
  if (DATACENTER.test(cf.asOrganization ?? "")) return new Response(null, { status: 204 });
  await env.DB.prepare(
    `INSERT INTO events (ts, type, path, target, value, sid, ref, device, os, browser, standalone, country, region, city, lat, lon, app_state, app_city,
       vid, secs, scroll, lcp, cls, inp)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24)`,
  )
    .bind(
      Date.now(),
      e.t,
      str(e.p, 200),
      str(e.g, 120),
      Number.isFinite(e.v) ? Math.trunc(e.v) : null,
      str(e.s, 40),
      str(e.r, 80),
      device(ua),
      os(ua),
      browser(ua),
      e.st ? 1 : 0,
      str(cf.country, 2),
      str(cf.region, 80),
      str(cf.city, 80),
      Number(cf.latitude) || null,
      Number(cf.longitude) || null,
      str(e.as, 4),
      str(e.ac, 40),
      str(e.u, 40),
      int(e.sec, 6 * 3600),
      int(e.sc, 100),
      int(e.lcp, 120000),
      Number.isFinite(e.cls) && e.cls >= 0 ? Math.min(e.cls, 10) : null,
      int(e.inp, 60000),
    )
    .run();
  return new Response(null, { status: 204 });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/e") return collect(request, env);
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return admin(request, env);
    return env.ASSETS.fetch(request);
  },
};

export default worker;
