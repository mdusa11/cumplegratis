-- Analítica propia de Cumplegratis: eventos anónimos (sin IP, sin cookies). Ubicación aproximada de Cloudflare (request.cf).
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,           -- epoch ms (UTC)
  type TEXT NOT NULL,            -- pageview | promo_open | city_set | search | share | whatsapp | signup_click | install
  path TEXT,
  target TEXT,                   -- slug de promo, ciudad elegida, texto buscado…
  value INTEGER,                 -- p.ej. número de resultados de una búsqueda
  sid TEXT,                      -- id aleatorio por pestaña (sessionStorage); no identifica a nadie
  ref TEXT,                      -- dominio de origen (google.com, whatsapp…)
  device TEXT,                   -- mobile | tablet | desktop
  os TEXT,
  browser TEXT,
  standalone INTEGER,            -- 1 si abrió la app instalada
  country TEXT,
  region TEXT,
  city TEXT,
  lat REAL,
  lon REAL,
  app_state TEXT,                -- estado/ciudad que el visitante eligió en el sitio
  app_city TEXT
);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS events_type_ts ON events (type, ts);
