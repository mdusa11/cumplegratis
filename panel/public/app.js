// Panel de Cumplegratis: lee /api/stats con los filtros y pinta KPIs, gráficas, mapa y rankings.
// Los filtros viven en la URL (se pueden compartir/guardar como marcador) y se recuerdan en este navegador.

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("es-MX");
const countryName = new Intl.DisplayNames(["es-MX"], { type: "region" });
const C = { ink: "#0b0b0b", paper: "#f3f0e8", acid: "#5b7cff", hot: "#ff5a36", sky: "#7cd6ff", sun: "#ffd23f", lilac: "#b9a6ff", pink: "#ff9bd9" };
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DEVICE = { mobile: "Celular", tablet: "Tablet", desktop: "Computadora" };
const FILTERS = ["from", "to", "country", "region", "city", "device"];
// Cloudflare da algunos estados y ciudades en inglés.
const ES = { "Mexico City": "Ciudad de México", "State of Mexico": "Estado de México", "Nuevo Leon": "Nuevo León", Michoacan: "Michoacán", Queretaro: "Querétaro", Yucatan: "Yucatán", "San Luis Potosi": "San Luis Potosí", "Baja California Sur": "Baja California Sur" };
const es = (s) => ES[s] ?? s ?? "Desconocido";

let meta = { promos: {}, cities: {}, states: {} };
let charts = {};
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

function setState(patch) {
  state = { ...state, ...patch };
  const qs = new URLSearchParams(Object.entries(state).filter(([, v]) => v));
  history.replaceState(null, "", `?${qs}`);
  try {
    localStorage.setItem("cg-panel", JSON.stringify(state));
  } catch {}
  load();
}

function syncControls(options) {
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
  const uniq = (a) => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y, "es"));
  fill($("country"), uniq(options.map((o) => o.country)), "Todos los países", state.country, cname);
  fill($("region"), uniq(options.filter((o) => !state.country || o.country === state.country).map((o) => o.region)), "Todos los estados", state.region, es);
  fill(
    $("city"),
    uniq(options.filter((o) => (!state.country || o.country === state.country) && (!state.region || o.region === state.region)).map((o) => o.city)),
    "Todas las ciudades",
    state.city,
    es,
  );
  $("device").classList.toggle("active", Boolean(state.device));
}

function list(id, rows, { name = (r) => r.k, value = (r) => r.n, extra, onClick, active } = {}) {
  const el = $(id);
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

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function pageName(path) {
  if (path === "/" || !path) return "Inicio";
  let m = /^\/promos\/([^/]+)/.exec(path);
  if (m) return `Promo · ${meta.promos[m[1]] ?? m[1]}`;
  m = /^\/ciudades\/([^/]+)/.exec(path);
  if (m) return `Ciudad · ${meta.cities[m[1]] ?? m[1]}`;
  m = /^\/categorias\/([^/]+)/.exec(path);
  if (m) return `Categoría · ${m[1]}`;
  m = /^\/guias\/([^/]+)/.exec(path);
  if (m) return `Guía · ${m[1].replace(/-/g, " ")}`;
  return { "/promos": "Catálogo", "/mi-cumple": "Mi plan", "/ciudades": "Ciudades", "/guias": "Guías", "/privacidad": "Privacidad", "/terminos": "Términos" }[path] ?? path;
}

function kpis(k, live) {
  const items = [
    ["Visitas", k.visits, C.acid],
    ["Páginas vistas", k.pv, C.sky],
    ["Promos abiertas", k.opens, C.hot],
    ["Búsquedas", k.searches, C.sun],
    ["Clics a registrarse", k.signups, C.lilac],
    ["WhatsApp", k.whatsapp, "#2fb36b"],
    ["Compartidos", k.shares, C.pink],
    ["Desde la app", k.app, C.paper],
  ];
  $("kpis").innerHTML = items.map(([l, v, c]) => `<div class="kpi" style="background:${c}"><b>${fmt.format(v ?? 0)}</b><span>${l}</span></div>`).join("");
  $("live").textContent = fmt.format(live);
}

function seriesChart(rows, hourly) {
  charts.series?.destroy();
  charts.series = new Chart($("series"), {
    type: "line",
    data: {
      labels: rows.map((r) => (hourly ? r.k.slice(5) : r.k.slice(5).split("-").reverse().join("/"))),
      datasets: [
        { label: "Visitas", data: rows.map((r) => r.visits), borderColor: C.acid, backgroundColor: C.acid + "33", fill: true, tension: 0.3, borderWidth: 3 },
        { label: "Páginas vistas", data: rows.map((r) => r.pv), borderColor: C.hot, borderWidth: 2, tension: 0.3, pointRadius: 0 },
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
    html += grid[d]
      .map((n, h) => `<div title="${DAYS[d]} ${h}:00 · ${n} páginas" style="${n ? `background:rgba(91,124,255,${0.15 + (0.85 * n) / max})` : ""}"></div>`)
      .join("");
  }
  $("heat").innerHTML = html;
}

function drawMap(cities) {
  if (!map) {
    map = L.map("map", { scrollWheelZoom: false }).setView([23.6, -102.5], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    markers = L.layerGroup().addTo(map);
  }
  markers.clearLayers();
  const pts = cities.filter((c) => c.lat && c.lon);
  const max = Math.max(1, ...pts.map((c) => c.visits));
  for (const c of pts) {
    const r = 6 + 26 * Math.sqrt(c.visits / max);
    L.circleMarker([c.lat, c.lon], { radius: r, color: C.ink, weight: 2, fillColor: state.city === c.k ? C.hot : C.acid, fillOpacity: 0.75 })
      .bindTooltip(`<b>${escapeHtml(es(c.k))}</b>, ${escapeHtml(es(c.region))}<br>${fmt.format(c.visits)} visitas · ${fmt.format(c.pv)} páginas`)
      .on("click", () => setState({ country: c.country ?? "", region: c.region ?? "", city: state.city === c.k ? "" : c.k }))
      .addTo(markers);
  }
  if (pts.length && (state.city || state.region)) map.fitBounds(L.latLngBounds(pts.map((c) => [c.lat, c.lon])).pad(0.4), { maxZoom: 10 });
}

function donut(id, rows, label) {
  charts[id]?.destroy();
  charts[id] = new Chart($(id), {
    type: "doughnut",
    data: { labels: rows.map(label), datasets: [{ data: rows.map((r) => r.n), backgroundColor: [C.acid, C.hot, C.sun, C.sky, C.lilac], borderColor: C.ink, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
  });
}

function monthsChart(rows) {
  const data = Array(12).fill(0);
  rows.forEach((r) => r.k >= 1 && r.k <= 12 && (data[r.k - 1] = r.n));
  charts.months?.destroy();
  charts.months = new Chart($("months"), {
    type: "bar",
    data: { labels: MONTHS, datasets: [{ label: "Personas", data, backgroundColor: C.pink, borderColor: C.ink, borderWidth: 2, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}

async function load() {
  document.body.classList.add("loading");
  try {
    const qs = new URLSearchParams(Object.entries(state).filter(([, v]) => v));
    const res = await fetch(`/api/stats?${qs}`);
    if (res.status === 401) return location.reload();
    const d = await res.json();
    if (d.error) throw new Error(d.error);

    syncControls(d.options);
    kpis(d.kpi, d.live);
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
    list("pages", d.pages, { name: (r) => pageName(r.k) });
    list("promos", d.promos, { name: (r) => meta.promos[r.k] ?? r.k });
    list("chosen", d.chosen, { name: (r) => meta.cities[r.k] ?? meta.states[r.k] ?? r.k });
    list("searches", d.searches, { extra: (r) => (r.results === 0 ? `<span class="tag">sin resultados</span>` : "") });
    list("missing", d.searches.filter((r) => r.results === 0));
    const direct = Math.max(0, (d.kpi.visits ?? 0) - d.refs.reduce((s, r) => s + r.n, 0));
    list("refs", [...d.refs, ...(direct ? [{ k: "Directo / sin origen", n: direct }] : [])].sort((a, b) => b.n - a.n));
    donut("devices", d.devices, (r) => DEVICE[r.k] ?? r.k);
    list("oses", d.oses);
    list("browsers", d.browsers);
    monthsChart(d.months);
    list("signups", d.signups);
    list("whatsapp", d.whatsapp, { name: (r) => pageName(r.k) });
    $("updated").textContent = `Actualizado ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  } catch (e) {
    $("updated").textContent = `Error: ${e.message}`;
  } finally {
    document.body.classList.remove("loading");
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
$("device").addEventListener("change", (e) => setState({ device: e.target.value }));
$("clear").addEventListener("click", () => setState({ from: daysAgo(30), to: mxToday(), country: "", region: "", city: "", device: "" }));

Chart.defaults.font.family = '"Bricolage Grotesque", system-ui, sans-serif';
Chart.defaults.color = C.ink;

fetch("/meta.json")
  .then((r) => r.json())
  .then((m) => (meta = m))
  .catch(() => {})
  .finally(load);

// Se refresca solo cada minuto mientras la pestaña está visible.
setInterval(() => document.visibilityState === "visible" && load(), 60_000);
