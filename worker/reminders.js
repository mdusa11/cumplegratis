import { confirmMail, message, promosMail, send, tomorrowMail, unsubPage } from "./mail.js";

// Recordatorios por correo: alta con doble opt-in, confirmación, baja y el cron diario que manda los avisos.

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const EMAIL = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // febrero con 29: el cumple del 29-feb es válido
const DAY = 864e5;
const MAX_PER_IP_HOUR = 5;
const MAX_MAILS_PER_RUN = 90; // plan gratis de Resend: 100/día; el resto queda para las confirmaciones
const STAGES = [30, 14, 1];
const TOKEN = /^[0-9a-f]{64}$/;

const newToken = () => [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
async function hash(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signup(request, env) {
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  if (!/^https:\/\/([a-z0-9-]+\.)?cumplegratis\.fun(\/|$)/.test(origin)) return new Response(null, { status: 403 });

  let b;
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ ok: false }, 413);
    b = JSON.parse(text);
  } catch {
    return json({ ok: false }, 400);
  }

  // Límite por IP: solo un hash + hora en reminder_rate (se purga en el cron); la IP no llega a la tabla de recordatorios.
  const now = Date.now();
  const hour = Math.floor(now / 3600000);
  const h = await hash(`${request.headers.get("cf-connecting-ip") ?? "local"}|${hour}`);
  const rate = await env.DB.prepare(`INSERT INTO reminder_rate (h, hour, n) VALUES (?1, ?2, 1) ON CONFLICT (h, hour) DO UPDATE SET n = n + 1 RETURNING n`).bind(h, hour).first();
  if (rate.n > MAX_PER_IP_HOUR) return json({ ok: false }, 429);

  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase() : "";
  const month = b?.month, day = b?.day;
  const city = typeof b?.city === "string" && /^[a-z0-9-]{1,40}$/.test(b.city) ? b.city : null;
  if (email.length > 254 || !EMAIL.test(email)) return json({ ok: false, error: "email" }, 400);
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > DAYS_IN[month - 1]) return json({ ok: false, error: "fecha" }, 400);

  const row = await env.DB.prepare(`SELECT state, token, created_at, change_sent_at FROM reminders WHERE email = ?1`).bind(email).first();
  let mail = null;
  if (!row) {
    const token = newToken();
    await env.DB.prepare(`INSERT INTO reminders (email, month, day, state, city, token, created_at) VALUES (?1, ?2, ?3, 'pending', ?4, ?5, ?6)`).bind(email, month, day, city, token, now).run();
    mail = token;
  } else if (row.state === "active") {
    // Cualquiera puede escribir un correo ajeno en el formulario: el cambio queda en espera hasta que el dueño lo confirme.
    const resend = !row.change_sent_at || now - row.change_sent_at > 5 * 60000;
    await env.DB.prepare(`UPDATE reminders SET pending_month = ?2, pending_day = ?3, pending_city = ?4, change_sent_at = CASE WHEN ?5 THEN ?6 ELSE change_sent_at END WHERE email = ?1`)
      .bind(email, month, day, city, resend ? 1 : 0, now)
      .run();
    if (resend) mail = row.token;
  } else if (row.state === "pending") {
    await env.DB.prepare(`UPDATE reminders SET month = ?2, day = ?3, city = COALESCE(?4, city) WHERE email = ?1`).bind(email, month, day, city).run();
    // Evita que reenviar el formulario use nuestro correo para acosar a alguien: máximo un reenvío cada 5 min.
    if (now - row.created_at > 5 * 60000) mail = row.token;
  } else {
    // Re-alta tras baja: token nuevo (el viejo ya no sirve) y otra vez doble opt-in.
    const token = newToken();
    await env.DB.prepare(`UPDATE reminders SET month = ?2, day = ?3, city = ?4, state = 'pending', token = ?5, created_at = ?6, confirmed_at = NULL, unsubscribed_at = NULL, last_sent = NULL WHERE email = ?1`).bind(email, month, day, city, token, now).run();
    mail = token;
  }
  if (mail) await send(env, message(email, mail, confirmMail(mail, month, day)));
  return json({ ok: true });
}

export async function confirm(request, env) {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const res = TOKEN.test(t)
    ? await env.DB.batch([
        env.DB.prepare(`UPDATE reminders SET state = 'active', confirmed_at = COALESCE(confirmed_at, ?2) WHERE token = ?1 AND state IN ('pending','active')`).bind(t, Date.now()),
        // Si había un cambio de fecha en espera, se aplica ahora que el dueño del correo lo confirmó.
        env.DB.prepare(
          `UPDATE reminders SET month = pending_month, day = pending_day, city = COALESCE(pending_city, city), last_sent = NULL,
           pending_month = NULL, pending_day = NULL, pending_city = NULL WHERE token = ?1 AND state = 'active' AND pending_month IS NOT NULL`,
        ).bind(t),
      ])
    : null;
  const ok = res?.[0]?.meta?.changes > 0;
  return new Response(null, { status: 302, headers: { Location: `/mi-cumple/?recordatorio=${ok ? "ok" : "error"}`, "Cache-Control": "no-store" } });
}

// GET desde el enlace del correo; POST para el "one-click" de List-Unsubscribe (RFC 8058).
export async function unsubscribe(request, env) {
  if (request.method !== "GET" && request.method !== "POST") return new Response(null, { status: 405 });
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const res = TOKEN.test(t)
    ? await env.DB.prepare(`UPDATE reminders SET state = 'unsubscribed', unsubscribed_at = COALESCE(unsubscribed_at, ?2), city = NULL WHERE token = ?1`).bind(t, Date.now()).run()
    : null;
  const ok = res?.meta?.changes > 0;
  return request.method === "POST" ? new Response(null, { status: ok ? 200 : 404 }) : unsubPage(ok);
}

// ---- Cron ----

const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Hoy en la Ciudad de México como medianoche UTC (así las diferencias en días salen exactas, sin horario de verano). */
function todayMx(now = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(now).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Días que faltan para el próximo cumple; el 29-feb se celebra el 28 en años no bisiestos. */
function daysUntil(month, day, today) {
  const y0 = new Date(today).getUTCFullYear();
  for (const y of [y0, y0 + 1]) {
    const d = month === 2 && day === 29 && !leap(y) ? 28 : day;
    const at = Date.UTC(y, month - 1, d);
    if (at >= today) return { days: Math.round((at - today) / DAY), year: y };
  }
}

const RANK = { alta: 0, media: 1, baja: 2 };
function available(p, city, cityStates) {
  if (!p.coverage) return false;
  if (!city) return p.coverage === "nacional";
  const st = cityStates[city];
  if (p.coverage === "estados") return p.states.includes(st);
  if (p.coverage === "ciudades") return p.cities.includes(city);
  const pr = p.presence;
  return !pr || pr.cities.includes(city) || pr.states.includes(st) || pr.online;
}

/** Hasta 8 promos con programa: primero las que aún se alcanzan a registrar (su fecha límite cae en ≤14 días), luego las que ya vencieron. */
function pickPromos(data, stage, city) {
  const scored = data.promos
    .filter((p) => available(p, city, data.cityStates))
    .map((p) => ({ p, slack: stage - (p.registerDaysBefore ?? 30) }))
    .filter((x) => x.slack <= 14);
  const by = (a, b) => RANK[a.p.confidence] - RANK[b.p.confidence] || (a.slack >= 0 ? a.slack - b.slack : b.slack - a.slack);
  const open = scored.filter((x) => x.slack >= 0).sort(by);
  const late = scored.filter((x) => x.slack < 0).sort(by);
  const picked = [...open, ...late].slice(0, 8);
  return { promos: picked.map((x) => x.p), late: picked.some((x) => x.slack < 0) };
}

export async function runReminders(env, now = new Date()) {
  const t = now.getTime();
  // Lo que el aviso de privacidad promete: pendientes sin confirmar se borran a los 7 días; las bajas, a los 30.
  const del1 = await env.DB.prepare(`DELETE FROM reminders WHERE state = 'pending' AND created_at < ?1`).bind(t - 7 * DAY).run();
  const del2 = await env.DB.prepare(`DELETE FROM reminders WHERE state = 'unsubscribed' AND unsubscribed_at < ?1`).bind(t - 30 * DAY).run();
  await env.DB.prepare(`DELETE FROM reminder_rate WHERE hour < ?1`).bind(Math.floor(t / 3600000) - 3).run();
  console.log(`limpieza: ${del1.meta.changes} pendientes, ${del2.meta.changes} bajas borradas`);

  const today = todayMx(now);
  // Solo traemos a quien cumple en 30/14/1 días: el índice (month, day) evita recorrer toda la tabla.
  const pairs = new Set();
  for (const s of STAGES) {
    const d = new Date(today + s * DAY);
    pairs.add(`${d.getUTCMonth() + 1}-${d.getUTCDate()}`);
    if (d.getUTCMonth() === 1 && d.getUTCDate() === 28 && !leap(d.getUTCFullYear())) pairs.add("2-29");
  }
  const list = [...pairs].map((p) => p.split("-").map(Number));
  const rows = (
    await env.DB.prepare(`SELECT id, email, token, month, day, city, last_sent FROM reminders WHERE state = 'active' AND (${list.map((_, i) => `(month = ?${i * 2 + 1} AND day = ?${i * 2 + 2})`).join(" OR ")})`)
      .bind(...list.flat())
      .all()
  ).results;

  const due = [];
  for (const r of rows) {
    const u = daysUntil(r.month, r.day, today);
    if (!u || !STAGES.includes(u.days)) continue;
    const key = `${u.year}:${u.days}`;
    if (r.last_sent !== key) due.push({ ...r, stage: u.days, key });
  }
  due.sort((a, b) => a.stage - b.stage); // si hay más de 90, primero los de mañana
  if (due.length > MAX_MAILS_PER_RUN) console.warn(`${due.length - MAX_MAILS_PER_RUN} correos quedan sin enviar por el tope diario`);
  const batch = due.slice(0, MAX_MAILS_PER_RUN);

  let data = null;
  if (batch.some((r) => r.stage !== 1)) {
    try {
      const res = await env.ASSETS.fetch(new Request("https://cumplegratis.fun/data/promos-min.json"));
      data = res.ok ? await res.json() : null;
    } catch {}
    if (!data) console.error("promos-min.json no disponible: los avisos de 30/14 días se omiten");
  }

  let sent = 0;
  const msgs = [];
  for (const r of batch) {
    if (r.stage === 1) msgs.push({ r, m: message(r.email, r.token, tomorrowMail(r.token, r.month, r.day)) });
    else if (data) {
      const { promos, late } = pickPromos(data, r.stage, r.city);
      msgs.push({ r, m: message(r.email, r.token, promosMail(r.token, r.stage, r.month, r.day, promos, late)) });
    }
  }
  // Lotes de 50 con /emails/batch (Resend limita a ~2 peticiones/s); solo marcamos last_sent si el lote salió bien.
  for (let i = 0; i < msgs.length; i += 50) {
    const chunk = msgs.slice(i, i + 50);
    if (i) await sleep(600);
    if (!(await send(env, chunk.map((x) => x.m)))) continue;
    await env.DB.batch(chunk.map(({ r }) => env.DB.prepare(`UPDATE reminders SET last_sent = ?2 WHERE id = ?1`).bind(r.id, r.key)));
    sent += chunk.length;
  }
  console.log(`recordatorios: ${rows.length} candidatos, ${due.length} pendientes, ${msgs.length} armados, ${sent} enviados`);
  return { sent, built: msgs.length };
}
