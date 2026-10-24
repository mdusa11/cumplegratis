-- Recordatorios por correo (doble opt-in). Solo lo mínimo: correo, día y mes (sin año), ciudad opcional.
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,                       -- siempre en minúsculas
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 31),
  state TEXT NOT NULL CHECK (state IN ('pending','active','unsubscribed')),
  city TEXT,
  token TEXT NOT NULL UNIQUE,                       -- 32 bytes aleatorios en hex: confirma y da de baja
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  unsubscribed_at INTEGER,                          -- para borrar la fila 30 días después de la baja
  last_sent TEXT,                                   -- '2026:30' = ya se mandó la etapa de 30 días del cumple de 2026
  -- Cambio de fecha pedido desde el formulario: no se aplica hasta que el dueño del correo lo confirma desde su bandeja.
  pending_month INTEGER,
  pending_day INTEGER,
  pending_city TEXT,
  change_sent_at INTEGER
);
CREATE INDEX IF NOT EXISTS reminders_md ON reminders (month, day);
CREATE INDEX IF NOT EXISTS reminders_state ON reminders (state, created_at);

-- Límite de altas por IP: solo un hash con la hora, se purga solo; la IP nunca toca la tabla de recordatorios.
CREATE TABLE IF NOT EXISTS reminder_rate (
  h TEXT NOT NULL,
  hour INTEGER NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (h, hour)
);
