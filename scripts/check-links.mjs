// Revisión de enlaces de las promos (signupUrl y primera fuente de las confiables). Reporte Markdown a stdout.
// Uso: node scripts/check-links.mjs > links.md   (código 0 siempre; los rotos se leen del reporte)
import { readFileSync } from "node:fs";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const promos = JSON.parse(readFileSync(new URL("../src/data/promos.json", import.meta.url), "utf8"));

const targets = new Map();
for (const p of promos) {
  if (p.confidence !== "alta" && p.confidence !== "media") continue;
  for (const [kind, url] of [["registro", p.signupUrl], ["fuente", p.sources?.[0]]]) {
    if (!url || !/^https?:\/\//.test(url)) continue;
    if (!targets.has(url)) targets.set(url, []);
    targets.get(url).push({ slug: p.slug, brand: p.brand, kind });
  }
}

async function attempt(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8", "accept-language": "es-MX,es;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(15_000) });
    await res.body?.cancel();
    return { status: res.status };
  } catch (e) {
    const code = e.cause?.code ?? e.cause?.message ?? e.name;
    return { error: /redirect/i.test(e.message) ? "bucle de redirecciones" : e.name === "TimeoutError" ? "timeout" : String(code) };
  }
}

const verdict = (r) => (r.error ? "roto" : r.status === 403 || r.status === 429 ? "bloqueado" : r.status === 404 || r.status === 410 || r.status >= 500 ? "roto" : "ok");

async function check(url) {
  let r = await attempt(url);
  if (verdict(r) !== "ok") {
    await new Promise((res) => setTimeout(res, 1500));
    r = await attempt(url);
  }
  return { url, ...r, verdict: verdict(r) };
}

const queue = [...targets.keys()];
const results = [];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) results.push(await check(url));
  }),
);

const by = (v) => results.filter((r) => r.verdict === v).sort((a, b) => a.url.localeCompare(b.url));
const row = (r) => `- ${r.error ?? r.status} — ${r.url}\n  ${targets.get(r.url).map((t) => `${t.brand} (${t.kind}, \`${t.slug}\`)`).join(", ")}`;
const month = new Date().toISOString().slice(0, 7);
const [broken, blocked] = [by("roto"), by("bloqueado")];

console.log(`# Enlaces de promos (${month})\n`);
console.log(`Revisados: ${results.length} enlaces únicos de ${promos.filter((p) => p.confidence !== "baja").length} promos. Rotos: ${broken.length}. Bloqueados: ${blocked.length}. Bien: ${by("ok").length}.\n`);
console.log(`## Rotos (404/410/5xx/DNS/TLS/bucle)\n`);
console.log(broken.length ? broken.map(row).join("\n") : "Ninguno.");
console.log(`\n## Bloqueados (403/429, revisar a mano)\n`);
console.log(blocked.length ? blocked.map(row).join("\n") : "Ninguno.");
