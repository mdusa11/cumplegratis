// Cuántas personas distintas dijeron «Sí me la dieron» en cada promo. Una sola lectura por el índice (type, ts),
// cacheada una hora en el borde para no gastar el límite diario de D1.
export async function votes(request, env) {
  if (request.method !== "GET") return new Response(null, { status: 405 });
  const key = new Request("https://votes-cache.cumplegratis.fun/worked");
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: { "content-type": "application/json", "cache-control": "public, max-age=600" } });
  const { results } = await env.DB.prepare(
    "SELECT target, COUNT(DISTINCT COALESCE(vid, sid)) AS n FROM events WHERE type = 'worked' AND target IS NOT NULL GROUP BY target",
  ).all();
  const body = JSON.stringify(Object.fromEntries(results.map((r) => [r.target, r.n])));
  await caches.default.put(key, new Response(body, { headers: { "content-type": "application/json", "cache-control": "max-age=3600" } }));
  return new Response(body, { headers: { "content-type": "application/json", "cache-control": "public, max-age=600" } });
}
