// Google Search Console en el panel: con qué búsquedas aparece Cumplegratis en Google.
// Usa una cuenta de servicio de Google (secreto GSC_KEY = el JSON de la llave) agregada como usuario de la propiedad.

const SITE = "sc-domain:cumplegratis.fun";
const b64url = (data) =>
  btoa(typeof data === "string" ? data : String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

let cached = { token: null, exp: 0 };

async function accessToken(key) {
  if (cached.token && cached.exp > Date.now() + 60e3) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: key.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const pem = key.private_key.replace(/-----[^-]+-----|\s/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const pk = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pk, new TextEncoder().encode(`${head}.${claims}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claims}.${b64url(sig)}` }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Google no dio acceso: ${json.error_description ?? json.error ?? res.status}`);
  cached = { token: json.access_token, exp: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cached.token;
}

const day = (ms) => new Date(ms - 6 * 3600e3).toISOString().slice(0, 10);

export async function gsc(url, env) {
  if (!env.GSC_KEY) return Response.json({ connected: false });
  const key = JSON.parse(env.GSC_KEY);
  const token = await accessToken(key);
  const q = url.searchParams;
  const startDate = q.get("from") ?? day(Date.now() - 28 * 864e5);
  const endDate = q.get("to") ?? day(Date.now());
  const query = (dimensions, rowLimit = 50) =>
    fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, dataState: "all" }),
    }).then((r) => r.json());

  const [total, queries, pages, countries, devices, dates] = await Promise.all([
    query([], 1),
    query(["query"], 100),
    query(["page"], 50),
    query(["country"], 30),
    query(["device"], 5),
    query(["date"], 500),
  ]);
  if (total.error) throw new Error(total.error.message);
  return Response.json(
    { connected: true, email: key.client_email, total: total.rows?.[0] ?? null, queries: queries.rows ?? [], pages: pages.rows ?? [], countries: countries.rows ?? [], devices: devices.rows ?? [], dates: dates.rows ?? [] },
    { headers: { "cache-control": "no-store" } },
  );
}
