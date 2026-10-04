# Cumplegratis

Todas las promos de cumpleaños de México en un solo lugar: qué regala cada marca, dónde registrarte y hasta cuándo.

Next.js 16 · Motion · GSAP · Lenis · Tailwind 4 · Supabase

```bash
npm install
npm run dev          # http://localhost:3000
npm run data         # une data/raw/*.json → src/data/promos.json (valida cada promo)
```

- `data/raw/` — investigación por categoría (fuente de verdad del catálogo).
- `supabase/schema.sql` — tablas de recordatorios y reportes (solo INSERT desde la web).
- Deploy en GitHub Pages: `.github/workflows/pages.yml` (export estático, sin `/api`).
