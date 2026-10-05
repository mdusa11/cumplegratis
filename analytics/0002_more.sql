-- Visitante recurrente (id aleatorio persistente), tiempo/scroll por página y rapidez real (Web Vitals).
ALTER TABLE events ADD COLUMN vid TEXT;
ALTER TABLE events ADD COLUMN secs INTEGER;
ALTER TABLE events ADD COLUMN scroll INTEGER;
ALTER TABLE events ADD COLUMN lcp INTEGER;
ALTER TABLE events ADD COLUMN cls REAL;
ALTER TABLE events ADD COLUMN inp INTEGER;
CREATE INDEX IF NOT EXISTS events_sid ON events (sid);
CREATE INDEX IF NOT EXISTS events_vid ON events (vid);
