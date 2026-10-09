// Panel de Cumplegratis: lee /admin/api/* con los filtros y pinta KPIs, embudo, gráficas, mapa, rankings, en vivo y Google.
// Los filtros viven en la URL (se pueden guardar como marcador) y se recuerdan en este navegador.

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("es-MX");
const pct = (n) => `${Math.round(n * 100)}%`;
const countryName = new Intl.DisplayNames(["es-MX"], { type: "region" });
const C = { ink: "#0b0b0b", paper: "#f3f0e8", acid: "#5b7cff", hot: "#ff5a36", sky: "#7cd6ff", sun: "#ffd23f", lilac: "#b9a6ff", pink: "#ff9bd9", green: "#2fb36b" };
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DEVICE = { mobile: "Celular", tablet: "Tablet", desktop: "Computadora" };
const FILTERS = ["from", "to", "country", "region", "city", "app_city", "device"];
// Cloudflare da algunos estados y ciudades en inglés.
const ES = { "Mexico City": "Ciudad de México", "State of Mexico": "Estado de México", "Nuevo Leon": "Nuevo León", Michoacan: "Michoacán", Queretaro: "Querétaro", Yucatan: "Yucatán", "San Luis Potosi": "San Luis Potosí" };
const es = (s) => ES[s] ?? s ?? "Desconocido";
const ACTION = {
  pageview: "abrió",
  promo_open: "abrió la promo",
  city_set: "eligió la ciudad",
  search: "buscó",
  filter: "filtró",
  share: "compartió",
  whatsapp: "tocó WhatsApp en",
  signup_click: "fue a registrarse a",
  install: "instaló la app",
  birthday: "puso su cumpleaños en",
};

let meta = { promos: {}, cities: {}, states: {} };
const charts = {};
const csv = {};
let map, markers;

const mxToday = () => new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - 6 * 3600e3 - (n - 1) * 864e5).toISOString().slice(0, 10);
const cname = (code) => {
  try {
    return code ? countryName.of(code) : "Desconocido";
  } catch {
    return code;
  }
};
const promoName = (slug) => meta.promos[slug] ?? slug;
const cityName = (slug) => meta.cities[slug] ?? meta.states[slug] ?? slug;
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dur = (s) => (!s ? "—" : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);
const ago = (ts) => {
  const s = Math.round((Date.now() - ts) / 1000);
  return s < 60 ? `hace ${s} s` : s < 3600 ? `hace ${Math.round(s / 60)} min` : `hace ${Math.round(s / 3600)} h`;
};

function readState() {
  const url = new URLSearchParams(location.search);
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("cg-panel") ?? "{}");
  } catch {}
  const s = {};
  for (const k of FILTERS) s[k] = url.get(k) ?? (url.toString() ? "" : (saved[k] ?? ""));
  if (!s.from) s.from = daysAgo(30);
  if (!s.to) s.to = mxToday();
  return s;
}

let state = readState();
const query = () => new URLSearchParams(Object.entries(state).filter(([, v]) => v));

function setState(patch) {
  state = { ...state, ...patch };
  history.replaceState(null, "", `?${query()}`);
  try {
    localStorage.setItem("cg-panel", JSON.stringify(state));
  } catch {}
  load();
  loadLive();
  loadGoogle();
}

function syncControls(options, appCities) {
  $("from").value = state.from;
  $("to").value = state.to;
  $("device").value = state.device;
  const span = Math.round((Date.parse(state.to) - Date.parse(state.from)) / 864e5) + 1;
  document.querySelectorAll("#presets button").forEach((b) => b.classList.toggle("on", state.to === mxToday() && Number(b.dataset.days) === span));

  const fill = (el, values, label, current, name = (v) => v) => {
    el.replaceChildren(new Option(label, ""), ...values.map((v) => new Option(name(v), v)));
    if (current && !values.includes(current)) el.append(new Option(name(current), current));
    el.value = current;
    el.classList.toggle("active", Boolean(current));
  };
  const uniq = (a) => [...new Set(a.filter(Boolean))].sort((x, y) => String(x).localeCompare(String(y), "es"));
  const inCountry = (o) => !state.country || o.country === state.country;
  fill($("country"), uniq(options.map((o) => o.country)), "Todos los países", state.country, cname);
  fill($("region"), uniq(options.filter(inCountry).map((o) => o.region)), "Todos los estados", state.region, es);
  fill($("city"), uniq(options.filter((o) => inCountry(o) && (!state.region || o.region === state.region)).map((o) => o.city)), "Todas las ciudades", state.city, es);
  fill($("app_city"), uniq(appCities), "Ciudad elegida: todas", state.app_city, (v) => `Eligió ${cityName(v)}`);
  $("device").classList.toggle("active", Boolean(state.device));
}

// Lista con barra proporcional. `rows` se guardan para exportar a CSV con sus nombres legibles.
function list(id, rows, { name = (r) => r.k, value = (r) => r.n, extra, onClick, active } = {}) {
  const el = $(id);
  csv[id] = { cols: ["Nombre", "Cantidad"], rows: rows.map((r) => [name(r), value(r)]) };
  if (!rows.length) {
    el.innerHTML = `<li class="empty">Sin datos todavía</li>`;
    return;
  }
  const max = Math.max(...rows.map(value), 1);
  el.innerHTML = rows
    .map((r, i) => {
      const on = active?.(r) ? " on" : "";
      return `<li class="${onClick ? "click" : ""}${on}" data-i="${i}"><span class="bar" style="width:${(value(r) / max) * 100}%"></span>
        <span class="name" title="${escapeHtml(name(r))}">${escapeHtml(name(r))}</span>${extra ? extra(r) : ""}<span class="num">${fmt.format(value(r))}</span></li>`;
    })
    .join("");
  if (onClick) el.querySelectorAll("li[data-i]").forEach((li) => li.addEventListener("click", () => onClick(rows[+li.dataset.i])));
}

// Tabla de varias columnas: [{ label, get, fmt? }]
function table(id, rows, cols) {
  csv[id] = { cols: cols.map((c) => c.label), rows: rows.map((r) => cols.map((c) => c.get(r))) };
  if (!rows.length) {
    $(id).innerHTML = `<p class="empty">Sin datos todavía</p>`;
    return;
  }
  $(id).innerHTML = `<table><thead><tr>${cols.map((c, i) => `<th class="${i ? "n" : ""}">${escapeHtml(c.label)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${cols.map((c, i) => `<td class="${i ? "n" : ""}">${escapeHtml(c.fmt ? c.fmt(c.get(r), r) : c.get(r))}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function downloadCsv(id) {
  const d = csv[id];
  if (!d) return;
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const text = [d.cols, ...d.rows].map((r) => r.map(cell).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([`﻿${text}`], { type: "text/csv;charset=utf-8" }));
  a.download = `cumplegratis-${id}-${state.from}_${state.to}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const filterName = (k) => String(k ?? "").replace(":", ": ").replace(/: true$/, ": activado").replace(/: false$/, ": desactivado");

function pageName(path) {
  if (path === "/" || !path) return "Inicio";
  let m = /^\/promos\/([^/]+)/.exec(path);
  if (m) return `Promo · ${promoName(m[1])}`;
  m = /^\/ciudades\/([^/]+)/.exec(path);
  if (m) return `Ciudad · ${cityName(m[1])}`;
  m = /^\/categorias\/([^/]+)/.exec(path);
  if (m) return `Categoría · ${m[1]}`;
  m = /^\/guias\/([^/]+)/.exec(path);
  if (m) return `Guía · ${m[1].replace(/-/g, " ")}`;
  return { "/promos": "Catálogo", "/mi-cumple": "Mi plan", "/ciudades": "Ciudades", "/guias": "Guías", "/privacidad": "Privacidad", "/terminos": "Términos" }[path] ?? path;
}

function delta(now, before, invert = false) {
  if (!before) return now ? `<em class="up">nuevo</em>` : "";
  const d = (now - before) / before;
  if (Math.abs(d) < 0.005) return `<em>=</em>`;
  const good = invert ? d < 0 : d > 0;
  return `<em class="${good ? "up" : "down"}">${d > 0 ? "↑" : "↓"} ${Math.abs(Math.round(d * 100))}%</em>`;
}

function kpis(k, p, live) {
  const items = [
    ["Visitas", "visits", C.acid],
    ["Páginas vistas", "pv", C.sky],
    ["Promos abiertas", "opens", C.hot],
    ["Búsquedas", "searches", C.sun],
    ["Clics a registrarse", "signups", C.lilac],
    ["WhatsApp", "whatsapp", C.green],
    ["Compartidos", "shares", C.pink],
    ["Visitas en la app", "app", C.paper],
  ];
  $("kpis").innerHTML = items
    .map(([l, key, c]) => `<div class="kpi" style="background:${c}"><b>${fmt.format(k[key] ?? 0)}</b><span>${l}</span>${delta(k[key] ?? 0, p[key] ?? 0)}</div>`)
    .join("");
  $("live").textContent = fmt.format(live);
}

// Publicidad: estado manual hasta que AdSense apruebe el sitio.
const ADS_STATUS = "Publicidad: Google está revisando el sitio (solicitado el 6 de octubre). Al aprobarlo se prenden los anuncios.";

function today(d) {
  const t = d.days.today ?? 0, y = d.days.yesterday ?? 0;
  $("today").innerHTML = `
    <div class="hi"><b>${fmt.format(t)}</b><span>Visitas hoy</span>${delta(t, y)}</div>
    <div><b>${fmt.format(y)}</b><span>Ayer</span></div>
    <div><b>${fmt.format(d.google)}</b><span>Desde Google en el periodo</span>${delta(d.google, d.prevGoogle)}</div>
    <div><b>${fmt.format(d.live)}</b><span>En línea ahora</span></div>
    <div class="wide">${escapeHtml(ADS_STATUS)}</div>`;
}

// Frases con lo más útil del periodo; solo afirma lo que dicen los datos.
function insights(d) {
  const out = [];
  const visits = d.kpi.visits ?? 0;
  if (!visits) {
    $("insights").innerHTML = `<li>Todavía no hay visitas en este periodo.</li>`;
    return;
  }
  const share = (n) => Math.round((n / visits) * 100);
  const city = d.cities[0];
  if (city) out.push(`La mayoría viene de <b>${escapeHtml(es(city.k))}</b> (${share(city.visits)}% de las visitas).`);
  const direct = Math.max(0, visits - d.refs.reduce((a, r) => a + r.n, 0));
  out.push(`<b>${fmt.format(d.google)}</b> visitas llegaron desde Google y <b>${fmt.format(direct)}</b> directo (enlace compartido o escrito).`);
  if (d.googleEntries[0]) out.push(`Lo que más encuentran en Google: <b>${escapeHtml(pageName(d.googleEntries[0].k))}</b>.`);
  else if (d.entries[0]) out.push(`La mayoría entra por <b>${escapeHtml(pageName(d.entries[0].k))}</b>.`);
  const top = d.promoPerf[0];
  if (top) out.push(`Promo más vista: <b>${escapeHtml(promoName(top.k))}</b> (${fmt.format(top.views + top.opens)} veces).`);
  const s = d.sessions;
  if (s.sessions && s.bounces / s.sessions > 0.7)
    out.push(`<b>${pct(s.bounces / s.sessions)}</b> se va tras ver una sola página: más enlaces a otras promos y ciudades ayudan a que se queden.`);
  const missing = d.searches.filter((r) => r.results === 0).slice(0, 3);
  if (missing.length) out.push(`Buscaron y no encontraron: ${missing.map((r) => `<b>«${escapeHtml(r.k)}»</b>`).join(", ")}.`);
  $("insights").innerHTML = out.slice(0, 6).map((x) => `<li><span>${x}</span></li>`).join("");
}

function quality(s, ps, v) {
  const bounce = s.sessions ? s.bounces / s.sessions : 0;
  const pbounce = ps.sessions ? ps.bounces / ps.sessions : 0;
  const items = [
    ["Visitantes", fmt.format(v.visitors ?? 0), ""],
    ["Nuevos", fmt.format((v.visitors ?? 0) - (v.back ?? 0)), ""],
    ["Regresan", fmt.format(v.back ?? 0), v.visitors ? `<em>${pct((v.back ?? 0) / v.visitors)}</em>` : ""],
    ["Páginas por visita", (s.ppv ?? 0).toFixed(1), delta(s.ppv ?? 0, ps.ppv ?? 0)],
    ["Se van tras 1 página", pct(bounce), ps.sessions ? delta(bounce, pbounce, true) : ""],
    ["Tiempo por visita", dur(s.secs), delta(s.secs ?? 0, ps.secs ?? 0)],
  ];
  $("quality").innerHTML = items.map(([l, v2, d]) => `<div><b>${v2}</b><span>${l}</span>${d}</div>`).join("");
}

function funnel(f) {
  const steps = [
    ["Entran al sitio", f.visits, C.acid],
    ["Arman su plan (ponen su fecha)", f.plan, C.sun],
    ["Abren una promo", f.promo, C.hot],
    ["Van a registrarse con la marca", f.signup, C.lilac],
  ];
  const top = f.visits || 0;
  $("funnel").innerHTML = steps
    .map(([l, n, c]) => {
      const w = top ? (n ?? 0) / top : 0;
      return `<div class="step"><div class="lbl"><span>${l}</span><b>${fmt.format(n ?? 0)} · ${pct(w)}</b></div><div class="track"><div style="width:${Math.max(w * 100, 1)}%;background:${c}"></div></div></div>`;
    })
    .join("");
}

function seriesChart(rows, hourly) {
  charts.series?.destroy();
  charts.series = new Chart($("series"), {
    type: "bar",
    data: {
      labels: rows.map((r) => (hourly ? r.k.slice(5) : r.k.slice(5).split("-").reverse().join("/"))),
      datasets: [
        { type: "bar", label: "Visitas", data: rows.map((r) => r.visits), backgroundColor: C.acid, borderColor: C.ink, borderWidth: 2, borderRadius: 6, order: 2 },
        { type: "line", label: "Páginas vistas", data: rows.map((r) => r.pv), borderColor: C.hot, backgroundColor: C.hot, borderWidth: 2.5, tension: 0.15, pointRadius: 3, order: 1 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}

function heatmap(rows) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  rows.forEach((r) => (grid[r.d][r.h] = r.n));
  const max = Math.max(1, ...grid.flat());
  let html = `<span class="lbl"></span>` + Array.from({ length: 24 }, (_, h) => `<span class="lbl">${h % 3 === 0 ? h : ""}</span>`).join("");
  for (const d of [1, 2, 3, 4, 5, 6, 0]) {
    html += `<span class="lbl">${DAYS[d]}</span>`;
    html += grid[d].map((n, h) => `<div title="${DAYS[d]} ${h}:00 · ${n} páginas" style="${n ? `background:rgba(91,124,255,${0.15 + (0.85 * n) / max})` : ""}"></div>`).join("");
  }
  $("heat").innerHTML = html;
}

function drawMap(cities) {
  if (!map) {
    map = L.map("map", { scrollWheelZoom: false }).setView([23.6, -102.5], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 18 }).addTo(map);
    markers = L.layerGroup().addTo(map);
  }
  markers.clearLayers();
  const pts = cities.filter((c) => c.lat && c.lon);
  const max = Math.max(1, ...pts.map((c) => c.visits));
  for (const c of pts) {
    L.circleMarker([c.lat, c.lon], { radius: 6 + 26 * Math.sqrt(c.visits / max), color: C.ink, weight: 2, fillColor: state.city === c.k ? C.hot : C.acid, fillOpacity: 0.75 })
      .bindTooltip(`<b>${escapeHtml(es(c.k))}</b>, ${escapeHtml(es(c.region))}<br>${fmt.format(c.visits)} visitas · ${fmt.format(c.pv)} páginas`)
      .on("click", () => setState({ country: c.country ?? "", region: c.region ?? "", city: state.city === c.k ? "" : c.k }))
      .addTo(markers);
  }
  if (pts.length && (state.city || state.region)) map.fitBounds(L.latLngBounds(pts.map((c) => [c.lat, c.lon])).pad(0.4), { maxZoom: 10 });
}

function donut(id, rows, label, colors = [C.acid, C.hot, C.sun, C.sky, C.lilac]) {
  charts[id]?.destroy();
  charts[id] = new Chart($(id), {
    type: "doughnut",
    data: { labels: rows.map(label), datasets: [{ data: rows.map((r) => r.n), backgroundColor: colors, borderColor: C.ink, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
  });
}

function bars(id, labels, data, color, label = "Personas") {
  charts[id]?.destroy();
  charts[id] = new Chart($(id), {
    type: "bar",
    data: { labels, datasets: [{ label, data, backgroundColor: color, borderColor: C.ink, borderWidth: 2, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}

// p75 de LCP/CLS/INP por dispositivo, con los umbrales de Google (bueno / mejorable / malo).
function vitals(rows) {
  const p75 = (a) => {
    const v = a.filter((x) => x !== null && x !== undefined).sort((x, y) => x - y);
    return v.length ? v[Math.min(v.length - 1, Math.floor(v.length * 0.75))] : null;
  };
  const rate = (v, good, poor) => (v === null ? "" : v <= good ? "good" : v <= poor ? "mid" : "bad");
  const groups = [["Todos", rows], ...["mobile", "tablet", "desktop"].map((d) => [DEVICE[d], rows.filter((r) => r.device === d)])].filter(([, r]) => r.length);
  if (!groups.length) {
    $("vitals").innerHTML = `<p class="empty">Sin datos todavía</p>`;
    return;
  }
  $("vitals").innerHTML = `<table><thead><tr><th></th><th class="n">Carga (LCP)</th><th class="n">Saltos (CLS)</th><th class="n">Respuesta (INP)</th></tr></thead><tbody>${groups
    .map(([name, r]) => {
      const lcp = p75(r.map((x) => x.lcp)), cls = p75(r.map((x) => x.cls)), inp = p75(r.map((x) => x.inp));
      return `<tr><td>${name} <small>(${r.length})</small></td>
        <td class="n ${rate(lcp, 2500, 4000)}">${lcp === null ? "—" : `${(lcp / 1000).toFixed(1)} s`}</td>
        <td class="n ${rate(cls, 0.1, 0.25)}">${cls === null ? "—" : cls.toFixed(2)}</td>
        <td class="n ${rate(inp, 200, 500)}">${inp === null ? "—" : `${inp} ms`}</td></tr>`;
    })
    .join("")}</tbody></table><p class="legend"><i class="good"></i>bueno <i class="mid"></i>mejorable <i class="bad"></i>lento</p>`;
}

async function load() {
  document.body.classList.add("loading");
  try {
    const res = await fetch(`/admin/api/stats?${query()}`);
    if (res.status === 401) return location.reload();
    const d = await res.json();
    if (d.error) throw new Error(d.error);

    syncControls(d.options, d.appCities);
    kpis(d.kpi, d.prevKpi, d.live);
    today(d);
    insights(d);
    list("googleEntries", d.googleEntries, { name: (r) => pageName(r.k) });
    quality(d.sessions, d.prevSessions, d.visitors);
    funnel(d.funnel);
    seriesChart(d.series, d.range.hourly);
    heatmap(d.heat);
    drawMap(d.cities);

    list("countries", d.countries, {
      name: (r) => cname(r.k),
      value: (r) => r.visits,
      onClick: (r) => setState({ country: state.country === r.k ? "" : (r.k ?? ""), region: "", city: "" }),
      active: (r) => r.k === state.country,
    });
    list("regions", d.regions, {
      name: (r) => `${es(r.k)}${r.country && r.country !== "MX" ? ` (${r.country})` : ""}`,
      value: (r) => r.visits,
      onClick: (r) => setState({ country: r.country ?? "", region: state.region === r.k ? "" : (r.k ?? ""), city: "" }),
      active: (r) => r.k === state.region,
    });
    list("cities", d.cities, {
      name: (r) => `${es(r.k)}, ${es(r.region)}`,
      value: (r) => r.visits,
      onClick: (r) => setState({ country: r.country ?? "", region: r.region ?? "", city: state.city === r.k ? "" : r.k }),
      active: (r) => r.k === state.city,
    });
    table("pairs", d.pairs, [
      { label: "Están en", get: (r) => `${es(r.city)}, ${es(r.region)}` },
      { label: "Eligieron", get: (r) => cityName(r.app_city) },
      { label: "Personas", get: (r) => r.n, fmt: (v) => fmt.format(v) },
    ]);
    list("pages", d.pages, { name: (r) => pageName(r.k) });
    list("entries", d.entries, { name: (r) => pageName(r.k) });
    const pvByPath = Object.fromEntries(d.pages.map((p) => [p.k, p.n]));
    table("time", d.time, [
      { label: "Página", get: (r) => pageName(r.k) },
      { label: "Tiempo", get: (r) => Math.round((r.secs ?? 0) / Math.max(pvByPath[r.k] ?? r.n, 1)), fmt: (v) => dur(v) },
      { label: "Scroll", get: (r) => Math.round(r.scroll ?? 0), fmt: (v) => `${v}%` },
    ]);
    table("promoPerf", d.promoPerf, [
      { label: "Promo", get: (r) => promoName(r.k) },
      { label: "Vieron su página", get: (r) => r.views, fmt: (v) => fmt.format(v) },
      { label: "La abrieron", get: (r) => r.opens, fmt: (v) => fmt.format(v) },
      { label: "Fueron a registrarse", get: (r) => r.signups, fmt: (v) => fmt.format(v) },
      { label: "Conversión", get: (r) => (r.views + r.opens ? r.signups / (r.views + r.opens) : 0), fmt: (v) => pct(v) },
    ]);
    list("chosen", d.chosen, { name: (r) => cityName(r.k), onClick: (r) => setState({ app_city: state.app_city === r.k ? "" : r.k }), active: (r) => r.k === state.app_city });
    list("searches", d.searches, { extra: (r) => (r.results === 0 ? `<span class="tag">sin resultados</span>` : "") });
    list("missing", d.searches.filter((r) => r.results === 0));
    list("filtersUsed", d.filtersUsed, { name: (r) => filterName(r.k) });
    const direct = Math.max(0, (d.kpi.visits ?? 0) - d.refs.reduce((s, r) => s + r.n, 0));
    list("refs", [...d.refs, ...(direct ? [{ k: "Directo / sin origen", n: direct }] : [])].sort((a, b) => b.n - a.n));
    list("signups", d.signups, { name: (r) => promoName(r.k) });
    donut("devices", d.devices, (r) => DEVICE[r.k] ?? r.k);
    donut("standalone", d.standalone, (r) => (r.k ? "App instalada" : "Navegador"), [C.paper, C.acid]);
    list("oses", d.oses);
    list("browsers", d.browsers);
    const months = Array(12).fill(0);
    d.months.forEach((r) => r.k >= 1 && r.k <= 12 && (months[r.k - 1] = r.n));
    bars("months", MONTHS, months, C.pink);
    vitals(d.vitals);
    list("whatsapp", d.whatsapp, { name: (r) => pageName(r.k) });
    $("updated").textContent = `Actualizado ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  } catch (e) {
    $("updated").textContent = `Error: ${e.message}`;
  } finally {
    document.body.classList.remove("loading");
  }
}

async function loadLive() {
  try {
    const res = await fetch(`/admin/api/live?${query()}`);
    if (!res.ok) return;
    const rows = await res.json();
    if (!rows.length) {
      $("feed").innerHTML = `<li class="empty">Nadie en las últimas 6 horas</li>`;
      return;
    }
    $("feed").innerHTML = rows
      .map((r) => {
        const what =
          r.type === "promo_open" || r.type === "signup_click" ? promoName(r.target)
          : r.type === "city_set" ? cityName(r.target)
          : r.type === "search" ? `«${r.target}»${r.value === 0 ? " (sin resultados)" : ""}`
          : r.type === "birthday" ? MONTHS[(r.value ?? 1) - 1]
          : r.type === "filter" ? filterName(r.target)
          : r.type === "install" ? ""
          : pageName(r.path);
        return `<li><span class="when">${ago(r.ts)}</span><span class="who">${escapeHtml(es(r.city))}, ${escapeHtml(es(r.region))} · ${DEVICE[r.device] ?? ""}</span>
          <span class="what">${escapeHtml(ACTION[r.type] ?? r.type)} <b>${escapeHtml(what)}</b></span></li>`;
      })
      .join("");
  } catch {}
}

async function loadGoogle() {
  const el = $("gsc");
  try {
    const res = await fetch(`/admin/api/gsc?from=${state.from}&to=${state.to}`);
    const g = await res.json();
    if (g.error) throw new Error(g.error);
    if (!g.connected) {
      el.innerHTML = `<p class="muted">Aún no está conectado. Cuando agregues la cuenta de servicio en Search Console, aquí aparecerán las búsquedas de Google con las que te encuentran, cuántas veces apareces, cuántos clics y en qué posición.</p>`;
      return;
    }
    const t = g.total ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    el.innerHTML = `<div class="quality g">
        <div><b>${fmt.format(t.clicks)}</b><span>Clics desde Google</span></div>
        <div><b>${fmt.format(t.impressions)}</b><span>Veces que apareces</span></div>
        <div><b>${pct(t.ctr)}</b><span>Le dan clic</span></div>
        <div><b>${t.position ? t.position.toFixed(1) : "—"}</b><span>Posición promedio</span></div>
      </div>
      <div class="chart"><canvas id="gscChart"></canvas></div>
      <div class="grid two"><div><h3>Búsquedas <button class="csv" data-for="gscQueries">CSV</button></h3><div class="table" id="gscQueries"></div></div>
      <div><h3>Páginas <button class="csv" data-for="gscPages">CSV</button></h3><div class="table" id="gscPages"></div></div></div>
      <p class="muted">Google publica estos datos con 2 o 3 días de retraso.</p>`;
    const cols = (first) => [
      { label: first, get: (r) => (first === "Página" ? r.keys[0].replace("https://cumplegratis.fun", "") || "/" : r.keys[0]) },
      { label: "Clics", get: (r) => r.clicks, fmt: (v) => fmt.format(v) },
      { label: "Apariciones", get: (r) => r.impressions, fmt: (v) => fmt.format(v) },
      { label: "Posición", get: (r) => r.position, fmt: (v) => v.toFixed(1) },
    ];
    table("gscQueries", g.queries, cols("Búsqueda"));
    table("gscPages", g.pages, cols("Página"));
    charts.gsc?.destroy();
    charts.gsc = new Chart($("gscChart"), {
      type: "line",
      data: {
        labels: g.dates.map((r) => r.keys[0].slice(5).split("-").reverse().join("/")),
        datasets: [
          { label: "Apariciones", data: g.dates.map((r) => r.impressions), borderColor: C.sky, yAxisID: "y", tension: 0.3 },
          { label: "Clics", data: g.dates.map((r) => r.clicks), borderColor: C.hot, yAxisID: "y1", tension: 0.3 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false } } } },
    });
  } catch (e) {
    el.innerHTML = `<p class="muted">No se pudo leer Google: ${escapeHtml(e.message)}</p>`;
  }
}

$("presets").addEventListener("click", (e) => {
  const days = Number(e.target.dataset?.days);
  if (days) setState({ from: daysAgo(days), to: mxToday() });
});
$("from").addEventListener("change", (e) => setState({ from: e.target.value }));
$("to").addEventListener("change", (e) => setState({ to: e.target.value }));
$("country").addEventListener("change", (e) => setState({ country: e.target.value, region: "", city: "" }));
$("region").addEventListener("change", (e) => setState({ region: e.target.value, city: "" }));
$("city").addEventListener("change", (e) => setState({ city: e.target.value }));
$("app_city").addEventListener("change", (e) => setState({ app_city: e.target.value }));
$("device").addEventListener("change", (e) => setState({ device: e.target.value }));
$("clear").addEventListener("click", () => setState({ from: daysAgo(30), to: mxToday(), country: "", region: "", city: "", app_city: "", device: "" }));
document.addEventListener("click", (e) => {
  const b = e.target.closest?.("button.csv");
  if (b) downloadCsv(b.dataset.for);
});

Chart.defaults.font.family = '"Bricolage Grotesque", system-ui, sans-serif';
Chart.defaults.color = C.ink;

fetch("/admin/meta.json")
  .then((r) => r.json())
  .then((m) => (meta = m))
  .catch(() => {})
  .finally(() => {
    load();
    loadLive();
    loadGoogle();
  });

// Todo se refresca solo mientras la pestaña está visible; lo "en vivo", más seguido.
setInterval(() => document.visibilityState === "visible" && load(), 60_000);
setInterval(() => document.visibilityState === "visible" && loadLive(), 15_000);
