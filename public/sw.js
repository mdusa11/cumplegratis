// Service worker de Cumplegratis: la app abre sin conexión con lo último que viste.
// - Páginas: red primero (datos frescos), si falla usa la copia guardada y si no hay, /offline.
// - /_next/static: nunca cambian (llevan hash) → caché primero.
// - Imágenes, fuentes e íconos: copia guardada al instante y se actualiza por detrás.
// - Fichas /promos/{slug}/: la página avisa (postMessage) cuáles guardar al abrir una promo y, en ratos libres, las de su plan/ciudad.
const VERSION = "cg-v5";
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const ASSETS = `${VERSION}-assets`;
const PRECACHE = ["/", "/promos/", "/mi-cumple/", "/ciudades/", "/offline/", "/offline"].map((p) => BASE + p);

// Una respuesta que viene de una redirección no se puede usar para navegar: solo guardamos las directas.
const cacheable = (res) => res && res.ok && !res.redirected;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) =>
        Promise.all(PRECACHE.map((url) => fetch(url).then((res) => cacheable(res) && cache.put(url, res)).catch(() => {}))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const MAX_PAGES = 40;

// Solo fichas de promo de este mismo sitio; nunca /api/ ni /admin.
function pageUrl(raw) {
  try {
    const u = new URL(raw, self.location.origin);
    const ok = u.origin === self.location.origin && u.pathname.startsWith(`${BASE}/promos/`) && !/\/(api|admin)(\/|$)/.test(u.pathname);
    if (!ok) return null;
    u.search = "";
    u.hash = "";
    if (!u.pathname.endsWith("/")) u.pathname += "/";
    return u.href;
  } catch {
    return null;
  }
}

async function cachePages(urls) {
  const cache = await caches.open(PAGES);
  for (const raw of urls.slice(0, MAX_PAGES)) {
    const url = pageUrl(raw);
    if (!url || (await cache.match(url))) continue;
    try {
      const res = await fetch(url);
      if (cacheable(res)) await cache.put(url, res);
    } catch {}
  }
}

self.addEventListener("message", (event) => {
  const { type, urls } = event.data || {};
  if (type === "cache-pages" && Array.isArray(urls)) event.waitUntil(cachePages(urls));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin || url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => {
          const alt = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : `${url.pathname}/`;
          return (
            (await caches.match(request, { ignoreSearch: true })) ||
            (await caches.match(url.origin + alt, { ignoreSearch: true })) ||
            (await caches.match(`${BASE}/offline/`)) ||
            caches.match(`${BASE}/offline`)
          );
        }),
    );
    return;
  }

  if (url.pathname.startsWith(`${BASE}/_next/static/`)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (cacheable(res)) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (/\.(png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname) || url.pathname.includes("opengraph-image")) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        const fresh = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      }),
    );
  }
});
