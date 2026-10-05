-- Analítica propia de Cumplegratis: eventos anónimos (sin IP, sin cookies). Ubicación aproximada de Cloudflare (request.cf).
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,           -- epoch ms (UTC)
  type TEXT NOT NULL,            -- pageview | leave | promo_open | city_set | search | filter | share | whatsapp | signup_click | install | birthday
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
  app_city TEXT,
  vid TEXT,                      -- id aleatorio persistente del navegador (visitante que regresa); no identifica a nadie
  secs INTEGER,                  -- leave: segundos con la página visible
  scroll INTEGER,                -- leave: % máximo de scroll
  lcp INTEGER,                   -- leave: Largest Contentful Paint (ms)
  cls REAL,                      -- leave: Cumulative Layout Shift
  inp INTEGER                    -- leave: interacción más lenta (ms)
);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS events_type_ts ON events (type, ts);
CREATE INDEX IF NOT EXISTS events_sid ON events (sid);
CREATE INDEX IF NOT EXISTS events_vid ON events (vid);
