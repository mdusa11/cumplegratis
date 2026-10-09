import { gsc } from "./gsc.js";

// Panel de analítica en /admin: login con contraseña (secreto PANEL_PASSWORD) y /admin/api/stats con todos los agregados.

const COOKIE = "cg_panel";
const DAYS_LOGGED = 30;
const MX = "(ts / 1000 - 21600)"; // hora del centro de México (UTC-6, sin horario de verano)

const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sign(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function loggedIn(request, env) {
  const raw = (request.headers.get("cookie") ?? "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw || !env.PANEL_PASSWORD) return false;
  const [exp, mac] = raw.slice(COOKIE.length + 1).split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  return same(mac, await sign(env.PANEL_PASSWORD, `panel|${exp}`));
}

const loginPage = (error = "") => `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel · Cumplegratis</title><meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@800;900&family=Bricolage+Grotesque:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#0b0b0b;--paper:#f3f0e8;--acid:#5b7cff;--hot:#ff5a36}
*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:var(--paper);color:var(--ink);font-family:"Bricolage Grotesque",system-ui,sans-serif;padding:16px}
form{width:100%;max-width:380px;background:#fff;border:2.5px solid var(--ink);border-radius:24px;box-shadow:6px 6px 0 var(--ink);padding:28px}
h1{font-family:"Big Shoulders",sans-serif;text-transform:uppercase;font-size:44px;line-height:.9;margin:0 0 6px}h1 span{background:var(--acid);border:2px solid var(--ink);border-radius:8px;padding:0 6px;display:inline-block;transform:rotate(-3deg)}
p{margin:0 0 18px;font-weight:500}input{width:100%;font:inherit;font-size:18px;padding:12px 14px;border:2.5px solid var(--ink);border-radius:14px;background:var(--paper)}
button{margin-top:12px;width:100%;font-family:"Big Shoulders",sans-serif;text-transform:uppercase;font-size:22px;padding:12px;border:2.5px solid var(--ink);border-radius:999px;background:var(--ink);color:var(--paper);cursor:pointer}
.err{color:var(--hot);font-weight:700;margin-top:10px}
</style></head><body><form method="post" action="/admin/login">
<h1>Cumple <span>panel</span></h1><p>Analítica privada de Cumplegratis.</p>
<input type="password" name="password" placeholder="Contraseña" autocomplete="current-password" autofocus required>
<button>Entrar</button>${error ? `<p class="err">${error}</p>` : ""}</form></body></html>`;

const html = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...headers } });

async function login(request, env) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (!env.PANEL_PASSWORD || !same(password, env.PANEL_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 600));
    return html(loginPage("Contraseña incorrecta."), 401);
  }
  const exp = Date.now() + DAYS_LOGGED * 864e5;
  const value = `${exp}.${await sign(env.PANEL_PASSWORD, `panel|${exp}`)}`;
  return new Response(null, {
    status: 303,
    headers: { location: "/admin/", "set-cookie": `${COOKIE}=${value}; Path=/admin; Max-Age=${DAYS_LOGGED * 86400}; HttpOnly; Secure; SameSite=Strict` },
  });
}

// "2026-10-05" en hora de México → epoch ms UTC.
const mxDay = (s, fallback) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], 6) : fallback;
};

const KPI = `SUM(type='pageview') pv, COUNT(DISTINCT CASE WHEN type='pageview' THEN sid END) visits, SUM(type='promo_open') opens,
  SUM(type='search') searches, SUM(type='share') shares, SUM(type='whatsapp') whatsapp, SUM(type='signup_click') signups,
  SUM(type='install') installs, SUM(type='city_set') cityset, COUNT(DISTINCT CASE WHEN standalone=1 THEN sid END) app`;

// Filtros del panel → WHERE con parámetros. `shift` mueve el rango hacia atrás (periodo anterior).
function filters(q, from, to) {
  const where = ["ts >= ?", "ts < ?"];
  const args = [from, to];
  for (const k of ["country", "region", "city", "device", "app_city"]) {
    const v = q.get(k);
    if (v) {
      where.push(`${k} = ?`);
      args.push(v);
    }
  }
  return { W: where.join(" AND "), args };
}

async function stats(url, env) {
  const q = url.searchParams;
  const now = Date.now();
  const from = mxDay(q.get("from"), now - 30 * 864e5);
  const to = mxDay(q.get("to"), now) + 864e5;
  const { W, args } = filters(q, from, to);
  const prev = filters(q, from - (to - from), from);
  const hourly = to - from <= 3 * 864e5;
  const fmt = hourly ? "%Y-%m-%d %H:00" : "%Y-%m-%d";
  const db = env.DB;
  const st = (sql, a = args) => db.prepare(sql).bind(...a);

  // Hoy y ayer en hora de México (independiente del rango elegido, pero con los demás filtros).
  const todayStart = mxDay(new Date(now - 6 * 3600e3).toISOString().slice(0, 10), now);
  const geo = filters(q, todayStart - 864e5, now + 60e3);
  const GOOGLE = "ref LIKE '%google.%'";
  const queries = {
    kpi: st(`SELECT ${KPI} FROM events WHERE ${W}`),
    days: st(
      `SELECT COUNT(DISTINCT CASE WHEN ts >= ? THEN sid END) today, COUNT(DISTINCT CASE WHEN ts < ? THEN sid END) yesterday,
        COUNT(DISTINCT CASE WHEN ts >= ? AND ${GOOGLE} THEN sid END) googleToday, COUNT(DISTINCT CASE WHEN ts < ? AND ${GOOGLE} THEN sid END) googleYesterday
       FROM events WHERE ${geo.W} AND type='pageview'`,
      [todayStart, todayStart, todayStart, todayStart, ...geo.args],
    ),
    google: st(`SELECT COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='pageview' AND ${GOOGLE}`),
    prevGoogle: st(`SELECT COUNT(DISTINCT sid) n FROM events WHERE ${prev.W} AND type='pageview' AND ${GOOGLE}`, prev.args),
    googleEntries: st(`SELECT path k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='pageview' AND ${GOOGLE} GROUP BY path ORDER BY n DESC LIMIT 30`),
    prevKpi: st(`SELECT ${KPI} FROM events WHERE ${prev.W}`, prev.args),
    sessions: st(`WITH s AS (SELECT sid, SUM(type='pageview') pv, SUM(CASE WHEN type='leave' THEN secs END) secs FROM events WHERE ${W} GROUP BY sid)
      SELECT COUNT(*) sessions, SUM(pv=1) bounces, AVG(pv) ppv, AVG(secs) secs FROM s WHERE pv > 0`),
    prevSessions: st(`WITH s AS (SELECT sid, SUM(type='pageview') pv, SUM(CASE WHEN type='leave' THEN secs END) secs FROM events WHERE ${prev.W} GROUP BY sid)
      SELECT COUNT(*) sessions, SUM(pv=1) bounces, AVG(pv) ppv, AVG(secs) secs FROM s WHERE pv > 0`, prev.args),
    visitors: st(`WITH d AS (SELECT vid, COUNT(DISTINCT strftime('%Y-%m-%d', ${MX}, 'unixepoch')) days FROM events WHERE ${W} AND vid IS NOT NULL GROUP BY vid),
      f AS (SELECT vid, MIN(ts) first FROM events WHERE vid IN (SELECT vid FROM d) GROUP BY vid)
      SELECT COUNT(*) visitors, SUM(d.days > 1 OR f.first < ?) back FROM d JOIN f USING (vid)`, [...args, from]),
    funnel: st(`WITH s AS (SELECT sid, MAX(type='pageview') v, MAX(type='birthday' OR (type='pageview' AND path LIKE '/mi-cumple%')) plan,
      MAX(type='promo_open' OR (type='pageview' AND path LIKE '/promos/_%')) promo, MAX(type='signup_click') signup FROM events WHERE ${W} GROUP BY sid)
      SELECT SUM(v) visits, SUM(plan) plan, SUM(promo) promo, SUM(signup) signup FROM s WHERE v = 1`),
    series: st(`SELECT strftime('${fmt}', ${MX}, 'unixepoch') k, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits FROM events WHERE ${W} GROUP BY k ORDER BY k`),
    heat: st(`SELECT CAST(strftime('%w', ${MX}, 'unixepoch') AS INT) d, CAST(strftime('%H', ${MX}, 'unixepoch') AS INT) h, COUNT(*) n
      FROM events WHERE ${W} AND type='pageview' GROUP BY d, h`),
    countries: st(`SELECT country k, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits FROM events WHERE ${W} GROUP BY country ORDER BY visits DESC LIMIT 60`),
    regions: st(`SELECT country, region k, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits FROM events WHERE ${W} GROUP BY country, region ORDER BY visits DESC LIMIT 120`),
    cities: st(`SELECT country, region, city k, AVG(lat) lat, AVG(lon) lon, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits
      FROM events WHERE ${W} AND city IS NOT NULL GROUP BY country, region, city ORDER BY visits DESC LIMIT 400`),
    pages: st(`SELECT path k, COUNT(*) n, COUNT(DISTINCT sid) visits FROM events WHERE ${W} AND type='pageview' GROUP BY path ORDER BY n DESC LIMIT 60`),
    entries: st(`WITH f AS (SELECT path, ROW_NUMBER() OVER (PARTITION BY sid ORDER BY ts) rn FROM events WHERE ${W} AND type='pageview')
      SELECT path k, COUNT(*) n FROM f WHERE rn = 1 GROUP BY path ORDER BY n DESC LIMIT 40`),
    time: st(`SELECT path k, COUNT(*) n, SUM(secs) secs, MAX(scroll) maxscroll, AVG(scroll) scroll FROM events WHERE ${W} AND type='leave' GROUP BY path ORDER BY n DESC LIMIT 40`),
    promoPerf: st(`SELECT slug k, SUM(o) opens, SUM(v) views, SUM(s) signups FROM (
        SELECT target slug, 1 o, 0 v, 0 s FROM events WHERE ${W} AND type='promo_open'
        UNION ALL SELECT substr(path, 9) slug, 0, 1, 0 FROM events WHERE ${W} AND type='pageview' AND path LIKE '/promos/_%'
        UNION ALL SELECT target slug, 0, 0, 1 FROM events WHERE ${W} AND type='signup_click')
      GROUP BY slug ORDER BY opens + views DESC LIMIT 80`, [...args, ...args, ...args]),
    chosen: st(`SELECT target k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='city_set' GROUP BY target ORDER BY n DESC LIMIT 40`),
    pairs: st(`SELECT city, region, app_city, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND app_city IS NOT NULL AND city IS NOT NULL
      GROUP BY city, region, app_city ORDER BY n DESC LIMIT 60`),
    searches: st(`SELECT target k, COUNT(*) n, MAX(value) results FROM events WHERE ${W} AND type='search' GROUP BY target ORDER BY n DESC LIMIT 80`),
    filtersUsed: st(`SELECT target k, COUNT(*) n FROM events WHERE ${W} AND type='filter' GROUP BY target ORDER BY n DESC LIMIT 40`),
    refs: st(`SELECT ref k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='pageview' AND ref IS NOT NULL GROUP BY ref ORDER BY n DESC LIMIT 30`),
    devices: st(`SELECT device k, COUNT(DISTINCT sid) n FROM events WHERE ${W} GROUP BY device ORDER BY n DESC`),
    oses: st(`SELECT os k, COUNT(DISTINCT sid) n FROM events WHERE ${W} GROUP BY os ORDER BY n DESC`),
    browsers: st(`SELECT browser k, COUNT(DISTINCT sid) n FROM events WHERE ${W} GROUP BY browser ORDER BY n DESC`),
    standalone: st(`SELECT standalone k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='pageview' GROUP BY standalone`),
    months: st(`SELECT value k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='birthday' GROUP BY value ORDER BY value`),
    signups: st(`SELECT target k, COUNT(*) n FROM events WHERE ${W} AND type='signup_click' GROUP BY target ORDER BY n DESC LIMIT 30`),
    whatsapp: st(`SELECT path k, COUNT(*) n FROM events WHERE ${W} AND type='whatsapp' GROUP BY path ORDER BY n DESC LIMIT 30`),
    vitals: st(`SELECT device, lcp, cls, inp FROM events WHERE ${W} AND type='leave' AND (lcp IS NOT NULL OR inp IS NOT NULL) ORDER BY ts DESC LIMIT 3000`),
    options: st(`SELECT DISTINCT country, region, city FROM events WHERE ts >= ? AND ts < ? AND country IS NOT NULL LIMIT 2000`, [from, to]),
    appCities: st(`SELECT DISTINCT app_city FROM events WHERE ts >= ? AND ts < ? AND app_city IS NOT NULL LIMIT 500`, [from, to]),
    live: st(`SELECT COUNT(DISTINCT sid) n FROM events WHERE ts >= ?`, [now - 30 * 60 * 1000]),
  };
  const names = Object.keys(queries);
  const results = await db.batch(Object.values(queries));
  const out = { range: { from, to, hourly } };
  names.forEach((k, i) => (out[k] = results[i].results));
  for (const k of ["kpi", "prevKpi", "sessions", "prevSessions", "visitors", "funnel", "days"]) out[k] = out[k][0] ?? {};
  out.google = out.google[0]?.n ?? 0;
  out.prevGoogle = out.prevGoogle[0]?.n ?? 0;
  out.live = out.live[0]?.n ?? 0;
  out.appCities = out.appCities.map((r) => r.app_city);
  return Response.json(out, { headers: { "cache-control": "no-store" } });
}

// Últimas acciones (sin "leave"), para el feed en vivo.
async function live(url, env) {
  const { W, args } = filters(url.searchParams, Date.now() - 6 * 3600e3, Date.now() + 60e3);
  const { results } = await env.DB.prepare(
    `SELECT ts, type, path, target, value, city, region, country, device FROM events WHERE ${W} AND type != 'leave' ORDER BY ts DESC LIMIT 50`,
  )
    .bind(...args)
    .all();
  return Response.json(results, { headers: { "cache-control": "no-store" } });
}

export async function admin(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/admin/login" && request.method === "POST") return login(request, env);
  if (path === "/admin/logout") {
    return new Response(null, { status: 303, headers: { location: "/admin/", "set-cookie": `${COOKIE}=; Path=/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict` } });
  }
  if (!(await loggedIn(request, env))) {
    return path.startsWith("/admin/api/") ? new Response("No autorizado", { status: 401 }) : html(loginPage(), 401, { "x-robots-tag": "noindex" });
  }
  const api = { "/admin/api/stats": stats, "/admin/api/live": live, "/admin/api/gsc": gsc }[path];
  if (api) {
    try {
      return await api(url, env);
    } catch (e) {
      return Response.json({ error: String(e?.message ?? e) }, { status: 500 });
    }
  }
  const res = await env.ASSETS.fetch(request);
  const out = new Response(res.body, res);
  out.headers.set("cache-control", "no-store");
  out.headers.set("x-robots-tag", "noindex");
  return out;
}
