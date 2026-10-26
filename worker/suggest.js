// Sugerencias de promos desde el sitio (POST /api/suggest) y su bandeja en el panel (/admin/api/suggestions).

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const MAX_PER_IP_HOUR = 5;
const clean = (v, n) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim() : "").slice(0, n);

async function hash(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function suggest(request, env) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const origin = request.headers.get("origin") ?? "";
  if (!/^https:\/\/([a-z0-9-]+\.)?cumplegratis\.fun$/.test(origin)) return new Response(null, { status: 403 });

  let b;
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ ok: false }, 413);
    b = JSON.parse(text);
  } catch {
    return json({ ok: false }, 400);
  }
  if (!b || typeof b !== "object") return json({ ok: false }, 400);

  const brand = typeof b.brand === "string" ? b.brand.trim() : "";
  const note = typeof b.note === "string" ? b.note.trim() : "";
  if (!brand || brand.length > 80 || note.length > 600) return json({ ok: false, error: "largo" }, 400);
  let url = null;
  if (b.url) {
    try {
      const u = new URL(String(b.url));
      if (!/^https?:$/.test(u.protocol) || u.href.length > 300) throw 0;
      url = u.href;
    } catch {
      return json({ ok: false, error: "url" }, 400);
    }
  }
  const city = typeof b.city === "string" && /^[a-z0-9-]{1,40}$/.test(b.city) ? b.city : null;
  const kind = b.kind === "cambio" ? "cambio" : "nueva";

  // Límite por IP: solo un hash + hora en reminder_rate (el cron lo purga); la IP no se guarda.
  const hour = Math.floor(Date.now() / 3600000);
  const h = await hash(`sug|${request.headers.get("cf-connecting-ip") ?? "local"}|${hour}`);
  const rate = await env.DB.prepare(`INSERT INTO reminder_rate (h, hour, n) VALUES (?1, ?2, 1) ON CONFLICT (h, hour) DO UPDATE SET n = n + 1 RETURNING n`).bind(h, hour).first();
  if (rate.n > MAX_PER_IP_HOUR) return json({ ok: false }, 429);

  await env.DB.prepare(`INSERT INTO suggestions (kind, brand, note, city, url, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`)
    .bind(kind, clean(brand, 80), clean(note, 600), city, url, Date.now())
    .run();
  return json({ ok: true });
}

// Panel: GET lista (nuevas primero); POST {id, status} aprueba o descarta.
export async function suggestions(url, env, request) {
  if (request.method === "POST") {
    let b;
    try {
      b = await request.json();
    } catch {
      return json({ error: "json" }, 400);
    }
    if (!Number.isInteger(b?.id) || !["nueva", "aprobada", "descartada"].includes(b?.status)) return json({ error: "datos" }, 400);
    await env.DB.prepare(`UPDATE suggestions SET status = ?2 WHERE id = ?1`).bind(b.id, b.status).run();
    return json({ ok: true });
  }
  const { results } = await env.DB.prepare(
    `SELECT id, kind, brand, note, city, url, status, created_at FROM suggestions ORDER BY status = 'nueva' DESC, created_at DESC LIMIT 200`,
  ).all();
  return json(results);
}
