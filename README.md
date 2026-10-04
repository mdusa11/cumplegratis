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
- Deploy en GitHub Pages: `.github/workflows/pages.yml` (export estático bajo `/cumplegratis`, rebuild diario).

## Deploy en Cloudflare Pages (cumplegratis.fun)

1. Cloudflare → Workers & Pages → Create → Pages → conectar el repo `mdusa11/cumplegratis`.
2. Build command: `npm run build:static` · Output directory: `out` · Variable `NODE_VERSION=22`.
3. Variables: `NEXT_PUBLIC_SITE_URL=https://cumplegratis.fun` (+ las `NEXT_PUBLIC_LEGAL_*` y, opcional, `NEXT_PUBLIC_GSC_VERIFICATION`).
4. Custom domains → `cumplegratis.fun` (y `www` con redirección al dominio raíz).
5. Search Console: propiedad de dominio verificada por DNS (TXT en Cloudflare) y enviar `https://cumplegratis.fun/sitemap.xml`.
6. Rebuild diario (promos vencidas): Deploy Hook de Cloudflare llamado desde un cron (o Cron Trigger).

Modo estático: las rutas `/api` (`route.dynamic.ts`) se excluyen solas; los formularios se ocultan hasta conectar Supabase con un runtime de servidor.
