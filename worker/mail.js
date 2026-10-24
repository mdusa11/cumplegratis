// Correos de recordatorios: envío por Resend (HTTP, sin dependencias) y plantillas ligeras (texto + HTML sin imágenes).
const SITE = "https://cumplegratis.fun";
const FROM = "Cumplegratis <avisos@cumplegratis.fun>";
const REPLY = "contacto@dusasolutions.com";
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const unsubUrl = (token) => `${SITE}/api/reminders/unsubscribe?t=${token}`;
export const confirmUrl = (token) => `${SITE}/api/reminders/confirm?t=${token}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Un mensaje listo para Resend. Las cabeceras de baja son obligatorias (Gmail/Yahoo las exigen para envíos masivos). */
export const message = (to, token, { subject, html, text }) => ({
  from: FROM,
  to: [to],
  reply_to: REPLY,
  subject,
  html,
  text,
  headers: { "List-Unsubscribe": `<${unsubUrl(token)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
});

/** Envía uno (o varios con /emails/batch). Sin RESEND_API_KEY queda inactivo: solo registra y devuelve false. */
export async function send(env, msgs) {
  const list = Array.isArray(msgs) ? msgs : [msgs];
  if (!env.RESEND_API_KEY) {
    for (const m of list) console.log(`[correo inactivo] a=${m.to[0]} asunto="${m.subject}"\n${m.text}\n---`);
    return false;
  }
  const base = env.RESEND_URL ?? "https://api.resend.com";
  try {
    const res = await fetch(Array.isArray(msgs) ? `${base}/emails/batch` : `${base}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(Array.isArray(msgs) ? msgs : msgs),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) console.error(`resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res.ok;
  } catch (e) {
    console.error("resend fallo", String(e));
    return false;
  }
}

// Plantilla común: tipografía del sistema, un solo color de marca, cero imágenes.
function layout(token, title, bodyHtml, bodyText) {
  const unsub = unsubUrl(token);
  const foot = "Cumplegratis, un producto de Dusa Solutions · contacto@dusasolutions.com";
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f6f4ee;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a">
<div style="max-width:560px;margin:0 auto;padding:24px 16px"><p style="margin:0 0 12px;font-weight:800;font-size:20px;color:#5b7cff">Cumplegratis</p>
<div style="background:#fff;border:2px solid #1a1a1a;border-radius:16px;padding:24px"><h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">${esc(title)}</h1>${bodyHtml}</div>
<p style="font-size:12px;line-height:1.5;color:#555;margin:16px 0 0"><a href="${unsub}" style="color:#555">Darme de baja</a> de estos recordatorios.<br>${foot}</p></div></body></html>`;
  const text = `${title}\n\n${bodyText}\n\nDarme de baja: ${unsub}\n${foot}\n`;
  return { html, text };
}
const btn = (href, label) => `<p style="margin:20px 0 0"><a href="${href}" style="display:inline-block;background:#5b7cff;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">${esc(label)}</a></p>`;

export function confirmMail(token, month, day) {
  const when = `${day} de ${MONTHS[month - 1]}`;
  const url = confirmUrl(token);
  const { html, text } = layout(
    token,
    "Confirma tu correo",
    `<p style="margin:0">Pediste recordatorios para tu cumpleaños (${when}). Confirma para activarlos; si no fuiste tú, ignora este correo y no pasará nada.</p>${btn(url, "Confirmar mi correo")}`,
    `Pediste recordatorios para tu cumpleaños (${when}). Confirma aquí para activarlos:\n${url}\n\nSi no fuiste tú, ignora este correo y no pasará nada.`,
  );
  return { subject: "Confirma tu correo para tus recordatorios de cumple", html, text };
}

export function promosMail(token, days, month, day, promos, late) {
  const plan = `${SITE}/mi-cumple/?m=${month}&d=${day}`;
  const title = `Faltan ${days} días para tu cumple: regístrate en estas promos`;
  const row = (p) => `${p.brand} (${p.program}): ${p.benefit}`;
  const li = promos
    .map((p) => `<li style="margin:0 0 10px"><b>${esc(p.brand)}</b> · ${esc(p.program)}<br><span style="color:#444">${esc(p.benefit)}</span> <a href="${SITE}/promos/${p.slug}/" style="color:#5b7cff">Ver</a></li>`)
    .join("");
  const note = late ? " Algunas piden registrarte con más anticipación: revisa si todavía te dejan." : "";
  const lead = promos.length
    ? `Estos programas piden registrarte antes de tu cumple para que te den su regalo.${note}`
    : "Ya no vemos programas pendientes por registrar para tu zona, pero revisa tu plan completo.";
  const { html, text } = layout(
    token,
    title,
    `<p style="margin:0 0 14px">${lead}</p>${promos.length ? `<ul style="margin:0;padding-left:20px">${li}</ul>` : ""}${btn(plan, "Ver mi plan de cumple")}`,
    `${lead}\n\n${promos.map((p, i) => `${i + 1}. ${row(p)}\n   ${SITE}/promos/${p.slug}/`).join("\n")}\n\nTu plan completo: ${plan}`,
  );
  return { subject: title, html, text };
}

export function tomorrowMail(token, month, day) {
  const plan = `${SITE}/mi-cumple/?m=${month}&d=${day}`;
  const { html, text } = layout(
    token,
    "Mañana es tu cumple: lleva tu INE",
    `<p style="margin:0">Casi todas las promos piden una identificación oficial con fecha de nacimiento (INE, pasaporte). Llévala y revisa tu lista de qué cobrar primero.</p>${btn(plan, "Ver mi plan de cumple")}`,
    `Casi todas las promos piden una identificación oficial con fecha de nacimiento (INE, pasaporte). Llévala y revisa tu lista:\n${plan}`,
  );
  return { subject: "Mañana es tu cumple: lleva tu INE", html, text };
}

export function unsubPage(ok) {
  const msg = ok ? "Listo, ya no te mandaremos más recordatorios." : "Ese enlace no es válido o ya se usó.";
  return new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Cumplegratis</title><body style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;text-align:center"><h1 style="color:#5b7cff">Cumplegratis</h1><p style="font-size:18px">${msg}</p><p><a href="${SITE}">Volver al sitio</a></p></body></html>`,
    { status: ok ? 200 : 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
