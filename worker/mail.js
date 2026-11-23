// Correos de recordatorios: envío por Resend (HTTP, sin dependencias) y plantillas HTML de marca (tablas, estilos inline, imágenes en /email).
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

// Plantilla común: tablas con role="presentation", estilos inline, 600px, cabecera PNG, tarjeta con sombra dura simulada con bordes.
const IMG = `${SITE}/email`;
const INK = "#0b0b0b";
const DISPLAY = "'Big Shoulders Display','Arial Black',Impact,Arial,sans-serif";
const BODY = "'Bricolage Grotesque',Arial,Helvetica,sans-serif";
const MONO = "'Space Mono','Courier New',monospace";
const FONTS = "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800;900&family=Bricolage+Grotesque:wght@400;700&family=Space+Mono:wght@700&display=swap";
const img = (src, alt, w, h, extra = "") => `<img src="${IMG}/${src}" alt="${esc(alt)}" width="${w}" height="${h}" style="display:block;border:0;outline:none;text-decoration:none;width:100%;max-width:${w}px;height:auto;${extra}">`;

// compact: cabecera chica y sin ilustración (correo transaccional sobrio). hero: { src, alt, bg } 1200x360.
function layout(token, { title, preheader, bodyHtml, bodyText, hero = null, compact = false }) {
  const unsub = unsubUrl(token);
  const foot = "Cumplegratis, un producto de Dusa Solutions · contacto@dusasolutions.com";
  const pad = "&#847;&zwnj;&nbsp;".repeat(40);
  const top = compact
    ? `<tr><td style="padding:22px 28px 0 28px">${img("header.png", "Cumplegratis", 180, 60, "width:180px")}</td></tr>`
    : `<tr><td style="background:#f3f0e8">${img("header.png", "Cumplegratis", 600, 200)}</td></tr>${
        hero ? `<tr><td style="border-top:3px solid ${INK};border-bottom:3px solid ${INK};background:#e7e1d3">${img(hero.src, hero.alt, 600, 180)}</td></tr>` : ""
      }`;
  const h1 = compact ? "30px" : "38px";
  const html = `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(title)}</title>
<link href="${FONTS}" rel="stylesheet"><!--[if mso]><style>*{font-family:Arial,Helvetica,sans-serif !important}</style><![endif]--></head>
<body style="margin:0;padding:0;background:#f3f0e8;-webkit-text-size-adjust:100%">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${esc(preheader)}${pad}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f0e8"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td style="border-right:8px solid ${INK};border-bottom:8px solid ${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:3px solid ${INK}">
${top}
<tr><td style="padding:28px 28px 32px 28px;font-family:${BODY};font-size:16px;line-height:1.55;color:${INK}">
<h1 style="margin:0 0 14px 0;font-family:${DISPLAY};font-weight:900;font-size:${h1};line-height:1.05;text-transform:uppercase;color:${INK}">${esc(title)}</h1>
${bodyHtml}
</td></tr></table></td></tr></table>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tr><td style="padding:22px 8px 0 8px;font-family:${BODY};font-size:12px;line-height:1.6;color:#4a463d;text-align:center">
<a href="${esc(unsub)}" style="color:${INK};font-weight:700;text-decoration:underline">Darme de baja</a> de estos recordatorios.<br>${foot}
</td></tr></table></td></tr></table></body></html>`;
  const text = `${title}\n\n${bodyText}\n\nDarme de baja: ${unsub}\n${foot}\n`;
  return { html, text };
}
const btn = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0"><tr><td style="border-right:5px solid ${INK};border-bottom:5px solid ${INK}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#5b7cff" style="background:#5b7cff;border:3px solid ${INK}"><a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font-family:${DISPLAY};font-weight:900;font-size:20px;line-height:1;letter-spacing:1px;text-transform:uppercase;color:${INK};text-decoration:none">${esc(label)}</a></td></tr></table></td></tr></table>`;
const p = (html, extra = "") => `<p style="margin:0 0 ${extra || "0"} 0">${html}</p>`;

export function confirmMail(token, month, day) {
  const when = `${day} de ${MONTHS[month - 1]}`;
  const url = confirmUrl(token);
  const { html, text } = layout(token, {
    title: "Confirma tu correo",
    preheader: "Un toque en el botón y quedas listo. Si no fuiste tú, ignóralo.",
    compact: true,
    bodyHtml: `${p(`Pediste recordatorios para tu cumpleaños (${esc(when)}). Confirma para activarlos; si no fuiste tú, ignora este correo y no pasará nada.`)}${btn(url, "Confirmar mi correo")}`,
    bodyText: `Pediste recordatorios para tu cumpleaños (${when}). Confirma aquí para activarlos:\n${url}\n\nSi no fuiste tú, ignora este correo y no pasará nada.`,
  });
  return { subject: "Confirma tu correo para activar tus recordatorios", html, text };
}

const CHIPS = ["#7cd6ff", "#ff9bd9", "#b9a6ff", "#ffd23f"];

export function promosMail(token, days, month, day, promos, late) {
  const plan = `${SITE}/mi-cumple/?m=${month}&d=${day}`;
  const title = `Faltan ${days} días para tu cumple: regístrate en estas promos`;
  const row = (p) => `${p.brand} (${p.program}): ${p.benefit}`;
  const card = (p, i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0"><tr><td style="border-right:5px solid ${INK};border-bottom:5px solid ${INK}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f0e8;border:3px solid ${INK}"><tr><td style="padding:16px 18px">
${p.program ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px 0"><tr><td bgcolor="${CHIPS[i % CHIPS.length]}" style="background:${CHIPS[i % CHIPS.length]};border:2px solid ${INK};padding:3px 8px;font-family:${MONO};font-weight:700;font-size:11px;line-height:1.3;letter-spacing:.5px;text-transform:uppercase;color:${INK}">${esc(p.program)}</td></tr></table>` : ""}
<div style="font-family:${DISPLAY};font-weight:900;font-size:28px;line-height:1.05;text-transform:uppercase;color:${INK}">${esc(p.brand)}</div>
<div style="margin:6px 0 12px 0;font-family:${BODY};font-size:16px;line-height:1.45;color:${INK}">${esc(p.benefit)}</div>
<a href="${esc(`${SITE}/promos/${p.slug}/`)}" style="font-family:${BODY};font-size:15px;font-weight:700;color:${INK};text-decoration:underline">Ver cómo registrarte &rarr;</a>
</td></tr></table></td></tr></table>`;
  const cards = promos.map(card).join("");
  const note = late ? " Algunas piden registrarte con más anticipación: revisa si todavía te dejan." : "";
  const lead = promos.length
    ? `Estos programas piden registrarte antes de tu cumple para que te den su regalo.${note}`
    : "Ya no vemos programas pendientes por registrar para tu zona, pero revisa tu plan completo.";
  const { html, text } = layout(token, {
    title,
    preheader: promos.length ? `${promos.slice(0, 3).map((p) => p.brand).join(", ")} y más piden registro antes de tu cumple.` : "Revisa tu plan completo de cumpleaños.",
    hero: { src: "hero-days.png", alt: "Calendario: falta poco para tu cumpleaños" },
    bodyHtml: `${p(esc(lead), "18px")}${cards}${btn(plan, "Ver mi plan de cumple")}`,
    bodyText: `${lead}\n\n${promos.map((p, i) => `${i + 1}. ${row(p)}\n   ${SITE}/promos/${p.slug}/`).join("\n")}\n\nTu plan completo: ${plan}`,
  });
  return { subject: title, html, text };
}

export function tomorrowMail(token, month, day) {
  const plan = `${SITE}/mi-cumple/?m=${month}&d=${day}`;
  const { html, text } = layout(token, {
    title: "Mañana es tu cumple: lleva tu INE",
    preheader: "Tu identificación con fecha de nacimiento es lo que más piden. Revisa tu lista.",
    hero: { src: "hero-tomorrow.png", alt: "Identificación oficial y la palabra mañana" },
    bodyHtml: `${p("Casi todas las promos piden una identificación oficial con fecha de nacimiento (INE, pasaporte). Llévala y revisa tu lista de qué cobrar primero.")}${btn(plan, "Ver mi plan de cumple")}`,
    bodyText: `Casi todas las promos piden una identificación oficial con fecha de nacimiento (INE, pasaporte). Llévala y revisa tu lista:\n${plan}`,
  });
  return { subject: "Mañana es tu cumple: lleva tu INE", html, text };
}

export function unsubPage(ok) {
  const msg = ok ? "Listo, ya no te mandaremos más recordatorios." : "Ese enlace no es válido o ya se usó.";
  return new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Cumplegratis</title><link href="${FONTS}" rel="stylesheet"><body style="margin:0;background:#f3f0e8;font-family:${BODY};color:${INK}"><div style="max-width:520px;margin:10vh auto;padding:0 16px"><div style="border-right:8px solid ${INK};border-bottom:8px solid ${INK}"><div style="background:#fff;border:3px solid ${INK};text-align:center"><img src="${IMG}/header.png" alt="Cumplegratis" width="520" height="173" style="display:block;width:100%;height:auto"><div style="padding:24px 24px 32px"><h1 style="margin:0 0 12px;font-family:${DISPLAY};font-weight:900;font-size:32px;line-height:1.05;text-transform:uppercase">${esc(msg)}</h1><p style="margin:0"><a href="${SITE}" style="display:inline-block;background:#5b7cff;color:${INK};border:3px solid ${INK};box-shadow:5px 5px 0 ${INK};padding:12px 24px;font-family:${DISPLAY};font-weight:900;font-size:20px;letter-spacing:1px;text-transform:uppercase;text-decoration:none">Volver al sitio</a></p></div></div></div></div></body></html>`,
    { status: ok ? 200 : 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
