-- Sugerencias del formulario «¿Falta una?» (sin WhatsApp). Sin IP ni datos personales; el límite por IP usa reminder_rate (solo un hash).
CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('nueva','cambio')),
  brand TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  city TEXT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'nueva' CHECK (status IN ('nueva','aprobada','descartada')),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS suggestions_status ON suggestions (status, created_at);
