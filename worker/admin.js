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

async function stats(url, env) {
  const q = url.searchParams;
  const now = Date.now();
  const from = mxDay(q.get("from"), now - 30 * 864e5);
  const to = mxDay(q.get("to"), now) + 864e5;
  const range = ["ts >= ?", "ts < ?"];
  const rangeArgs = [from, to];
  const where = [...range];
  const args = [...rangeArgs];
  for (const k of ["country", "region", "city", "device"]) {
    const v = q.get(k);
    if (v) {
      where.push(`${k} = ?`);
      args.push(v);
    }
  }
  const W = where.join(" AND ");
  const hourly = to - from <= 3 * 864e5;
  const fmt = hourly ? "%Y-%m-%d %H:00" : "%Y-%m-%d";
  const db = env.DB;
  const st = (sql, a = args) => db.prepare(sql).bind(...a);

  const [kpi, series, heat, countries, regions, cities, pages, promos, chosen, searches, refs, devices, oses, browsers, months, signups, whatsapp, options, live] =
    await db.batch([
      st(`SELECT SUM(type='pageview') pv, COUNT(DISTINCT CASE WHEN type='pageview' THEN sid END) visits, SUM(type='promo_open') opens,
          SUM(type='search') searches, SUM(type='share') shares, SUM(type='whatsapp') whatsapp, SUM(type='signup_click') signups,
          SUM(type='install') installs, SUM(type='city_set') cityset, SUM(standalone=1 AND type='pageview') app FROM events WHERE ${W}`),
      st(`SELECT strftime('${fmt}', ${MX}, 'unixepoch') k, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits FROM events WHERE ${W} GROUP BY k ORDER BY k`),
      st(`SELECT CAST(strftime('%w', ${MX}, 'unixepoch') AS INT) d, CAST(strftime('%H', ${MX}, 'unixepoch') AS INT) h, COUNT(*) n
          FROM events WHERE ${W} AND type='pageview' GROUP BY d, h`),
      st(`SELECT country k, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits FROM events WHERE ${W} GROUP BY country ORDER BY visits DESC LIMIT 60`),
      st(`SELECT country, region k, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits FROM events WHERE ${W} GROUP BY country, region ORDER BY visits DESC LIMIT 120`),
      st(`SELECT country, region, city k, AVG(lat) lat, AVG(lon) lon, SUM(type='pageview') pv, COUNT(DISTINCT sid) visits
          FROM events WHERE ${W} AND city IS NOT NULL GROUP BY country, region, city ORDER BY visits DESC LIMIT 400`),
      st(`SELECT path k, COUNT(*) n, COUNT(DISTINCT sid) visits FROM events WHERE ${W} AND type='pageview' GROUP BY path ORDER BY n DESC LIMIT 60`),
      st(`SELECT target k, COUNT(*) n, COUNT(DISTINCT sid) visits FROM events WHERE ${W} AND type='promo_open' GROUP BY target ORDER BY n DESC LIMIT 40`),
      st(`SELECT target k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='city_set' GROUP BY target ORDER BY n DESC LIMIT 40`),
      st(`SELECT target k, COUNT(*) n, MAX(value) results FROM events WHERE ${W} AND type='search' GROUP BY target ORDER BY n DESC LIMIT 80`),
      st(`SELECT ref k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='pageview' AND ref IS NOT NULL GROUP BY ref ORDER BY n DESC LIMIT 30`),
      st(`SELECT device k, COUNT(DISTINCT sid) n FROM events WHERE ${W} GROUP BY device ORDER BY n DESC`),
      st(`SELECT os k, COUNT(DISTINCT sid) n FROM events WHERE ${W} GROUP BY os ORDER BY n DESC`),
      st(`SELECT browser k, COUNT(DISTINCT sid) n FROM events WHERE ${W} GROUP BY browser ORDER BY n DESC`),
      st(`SELECT value k, COUNT(DISTINCT sid) n FROM events WHERE ${W} AND type='birthday' GROUP BY value ORDER BY value`),
      st(`SELECT target k, COUNT(*) n FROM events WHERE ${W} AND type='signup_click' GROUP BY target ORDER BY n DESC LIMIT 30`),
      st(`SELECT path k, COUNT(*) n FROM events WHERE ${W} AND type='whatsapp' GROUP BY path ORDER BY n DESC LIMIT 30`),
      st(`SELECT DISTINCT country, region, city FROM events WHERE ${range.join(" AND ")} AND country IS NOT NULL LIMIT 2000`, rangeArgs),
      st(`SELECT COUNT(DISTINCT sid) n FROM events WHERE ts >= ?`, [now - 30 * 60 * 1000]),
    ]);

  return Response.json(
    {
      range: { from, to, hourly },
      kpi: kpi.results[0],
      series: series.results,
      heat: heat.results,
      countries: countries.results,
      regions: regions.results,
      cities: cities.results,
      pages: pages.results,
      promos: promos.results,
      chosen: chosen.results,
      searches: searches.results,
      refs: refs.results,
      devices: devices.results,
      oses: oses.results,
      browsers: browsers.results,
      months: months.results,
      signups: signups.results,
      whatsapp: whatsapp.results,
      options: options.results,
      live: live.results[0]?.n ?? 0,
    },
    { headers: { "cache-control": "no-store" } },
  );
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
  if (path === "/admin/api/stats") {
    try {
      return await stats(url, env);
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
