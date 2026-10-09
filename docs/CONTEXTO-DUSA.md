# Cumplegratis: contexto completo (producto de Dusa Solutions)

Eres parte del equipo de Dusa Solutions (dusasolutions.com), un estudio mexicano que hace apps propias y para clientes. Vas a trabajar en **Cumplegratis**, un producto propio de Dusa. Trátalo como producto de la casa: marca, decisiones y calidad son responsabilidad de Dusa.

## Qué es

Web app / PWA instalable que junta **todas las promociones de cumpleaños de México** en un solo lugar: café gratis, pastel, cine, descuentos, regalos. El usuario pone su fecha de cumpleaños y su ciudad, y la app le arma un plan: a qué programas registrarse, **hasta cuándo** (muchas marcas piden registrarse días o semanas antes) y cómo cobrar cada regalo.

- **Sitio:** https://cumplegratis.fun
- **Lema:** "Tu cumple sale gratis" / "Que ningún regalo se te escape".
- **Público:** México, gente de 18 a 35 años, móvil primero.
- **Competencia:** quecumple.mx (solo CDMX, sin verificar). Nunca se copia ni se usa como fuente.
- **Diferenciadores:**
  - Cobertura en los 32 estados, por ciudad.
  - Cada promo trae su nivel de verificación.
  - Plan personalizado con fechas límite de registro.
  - Funciona sin conexión.

## Números (oct-2026)

- **510 promos:** 182 verificadas en fuente oficial, 99 de fuente confiable y 229 sin confirmar (solo redes o blogs).
- **Cobertura:** 88 cadenas nacionales y ~420 negocios locales o regionales. Los 32 estados tienen promos locales.
- **Catálogo:** 16 categorías en 4 grupos (Comida, Tiendas, Diversión, Servicios).
- **Ciudades:** ~80 con página propia.
- **Guías SEO:** 4.

## Funcionalidades

- **Catálogo** (`/promos`) con filtros:
  - grupo y categoría;
  - tipo de regalo (gratis, 2x1, descuento, con compra);
  - "sin registro previo" y "solo confirmadas";
  - búsqueda por marca y "incluir otras zonas".
- **Ubicación:** GPS o selección manual de estado y ciudad. Cada promo indica si aplica "en tu ciudad", "cerca" (≤60 km), "en tu estado", "nacional" o "fuera de tu zona".
- **Orden:** primero las cadenas famosas verificadas, luego los locales verificados, luego las promos sin confirmar.
- **Tarjetas** con viñetas de requisitos. Al tocarlas se abre una hoja deslizable con el detalle: requisitos, cuándo, cómo cobrarlo, dónde, fuentes y nivel de confianza.
- **Ficha por promo** (`/promos/[slug]`): las promos sin confirmar llevan `noindex`.
- **Mi plan** (`/mi-cumple`): plan por fecha con grupos "Regístrate ya", "Más adelante" y "Sin registro", con checklist guardado en el dispositivo.
- **Modo descubrir:** baraja tipo swipe.
- **Páginas SEO:** `/ciudades/[slug]`, `/categorias/[slug]` y `/guias/[slug]`, cada una con intro única y datos estructurados (Breadcrumb, ItemList, FAQ, Article, Organization con `parentOrganization` = Dusa Solutions).
- **PWA:** instalable, funciona offline, rota a horizontal, con banner de instalación y guía para iOS.
- **Legal:** `/terminos` y `/privacidad`. El responsable es Dusa Solutions (Av. Patria 3995, Lomas de Atemajac, Zapopan, Jal.) y el correo de contacto es dusasolutionsmx@gmail.com; **falta confirmar la razón social**, y revisión de abogado antes de recabar correos.
- **Footer:** "Un producto de Dusa Solutions" con enlace a dusasolutions.com.

## Marca y diseño

- **Estilo:** "Cumpleazo", neo-brutalista Gen Z. Bordes de tinta gruesos (2.5 px), sombras duras desplazadas, tarjetas redondeadas, stickers inclinados, grano sutil.
- **Paleta:**

  | Token | Hex |
  |---|---|
  | ink | `#0b0b0b` |
  | paper | `#f3f0e8` |
  | paper-2 | `#e7e1d3` |
  | acento cobalto (`--color-acid`, constante `ACCENT` en `src/lib/site.ts`) | `#5b7cff` |
  | lilac | `#b9a6ff` |
  | hot | `#ff5a36` |
  | pink | `#ff9bd9` |
  | sky | `#7cd6ff` |
  | sun | `#ffd23f` |

  El acento era verde ácido y se cambió a cobalto. Una alternativa evaluada fue magenta `#ff3d9a`.
- **Tipografía:** Big Shoulders (titulares, en mayúsculas), Bricolage Grotesque (texto) y Space Mono (etiquetas).
- **Íconos:** SVG propios en `src/components/Icon.tsx`, con contorno de tinta y rellenos de la paleta. **No usar emojis en la UI**: se quitaron todos porque le restaban seriedad.
- **Logo:** "CUMPLE" + "GRATIS" en etiqueta cobalto inclinada. El ícono de la app es una vela rosa con llama naranja sobre cobalto; se genera con un script de Playwright.
- **Animaciones:** Motion y GSAP (ScrollTrigger), con scroll suave de Lenis. En tablet y celular se aligeran: sin blur, sin pin de GSAP, sin parallax de mouse.
- **Tono:** español mexicano, cercano, directo ("cobra todo tu mes", "sin rollos"). Nunca prometer algo que la marca no garantiza.

## Stack y código

- **Repo:** GitHub `mdusa11/cumplegratis` (público).
- **Stack:** Next.js 16 (App Router, `params` async) + React + Tailwind v4 (`@theme`, variante `desk:` = escritorio con mouse) + Motion + GSAP + Lenis + canvas-confetti.
- **Modos de build** (en `next.config.ts`):
  - `npm run build:static`: export estático a `out/`. **Este es el de producción.**
  - `npm run build`: con servidor, incluye `/api` en archivos `route.dynamic.ts`.
  - `GITHUB_PAGES=true`: copia vieja en mdusa11.github.io/cumplegratis, por convertir en redirección.
- **Hosting:** Cloudflare, cuenta de Dusa Solutions.
  - Worker `cumplegratis` con assets estáticos (`wrangler.jsonc` → `out/`), conectado a GitHub: cada push a `main` construye y publica.
  - Build: `npm run build:static`. Deploy: `npx wrangler deploy`.
  - El dominio `cumplegratis.fun` se compró en Hostinger y los nameservers apuntan a Cloudflare.
  - `public/_headers` define caché y seguridad.
- **Datos:**
  - Los agentes de investigación escriben `data/raw/*.json` y `npm run data` (`scripts/build-data.mjs`) valida, deduplica por marca, une ciudades y estados, calcula vigencias, quita las vencidas y genera `src/data/promos.json`.
  - `_extra-*.json` completa la ubicación de promos existentes y `_fixes.json` quita o corrige promos, siempre con un motivo.
  - `_presence-*.json` guarda las sucursales reales de cada cadena nacional por estado y ciudad (62 de 88 cadenas; el resto son servicios o se cobran en línea). Así una cadena sale "en tu ciudad", "en tu estado", "en línea" o no sale. Las marcadas `partial` tienen lista incompleta y no se ocultan donde no se encontraron.
- **Vigencias:** si una promo dice "vigente hasta X", se oculta sola al vencer, pero requiere un rebuild diario (pendiente de automatizar en Cloudflare).
- **Archivos clave:**

  | Archivo | Contenido |
  |---|---|
  | `src/lib/promos.ts` | categorías, orden y reglas |
  | `src/lib/places.ts` | 32 estados y ~80 ciudades con coordenadas |
  | `src/lib/availability.ts` | lógica de ubicación |
  | `src/lib/plan.ts` | plan por fecha |
  | `src/lib/site.ts` | URL, acento, estudio y datos legales |
  | `src/lib/guides.ts` | guías SEO |

## Reglas del producto (no negociables)

1. **Verdad ante todo.** Cada promo lleva fuentes y nivel de confianza. Nunca se ocultan ni se reescriben fechas de vigencia; si venció, se quita.
2. **No es una promo:** un "paquete de fiesta" de pago ("el festejado gratis si contratas el paquete") ni un beneficio de otro país.
3. **Sin afiliación:** las marcas no están afiliadas y el aviso lo dice. No usar logotipos de marcas.
4. **Privacidad:** no se piden datos personales sin aviso de privacidad completo. La fecha y la ciudad viven en el dispositivo (localStorage).
5. **Rendimiento:** debe sentirse fluido en celulares y tablets Android de gama media.

## Pendientes

1. **Search Console:** verificar el dominio por DNS en Cloudflare y enviar `sitemap.xml`. Lo mismo en Bing Webmaster.
2. **Copia vieja:** convertir la versión de GitHub Pages en redirección a cumplegratis.fun, para que Google no indexe contenido duplicado.
3. **Rebuild diario** en Cloudflare, para que caduquen las promos vencidas.
4. **Datos legales reales** (razón social, domicilio, correo) y revisión de abogado.
5. **Monetización:**
   - AdSense ligero con banner de consentimiento de cookies, aviso de privacidad actualizado y `ads.txt`.
   - Después, promos locales patrocinadas (negocios que pagan por aparecer destacados, siempre marcados como "patrocinado").
6. **Backend** (Supabase, ya hay esquema en `supabase/schema.sql`) para recordatorios por correo y reportes de la comunidad ("¿te funcionó?", "sugiere una promo"). Hoy esos formularios están ocultos en el modo estático.
7. **Datos:** subir más promos de ciudades flacas (Tepic, Chetumal, Ciudad Victoria, Ciudad Obregón, Nogales, Tapachula, San Cristóbal, Manzanillo, Campeche, Ciudad del Carmen, Guanajuato capital) y re-verificar las 229 sin confirmar.
8. **Marketing:** sumar Cumplegratis al portafolio de apps propias en dusasolutions.com y al calendario de contenido de Dusa (Instagram/TikTok). Ideas de contenido:
   - "¿Cumples en octubre? Esto te regalan".
   - Ranking de las 10 promos más generosas.
   - "Cuánto ahorras en tu cumple".
   - Promos por ciudad.

## Cómo trabajar

- Corre `npm run data` después de tocar `data/raw/`. Antes de publicar, corre `npx tsc --noEmit`, `npx eslint src` y `npm run build:static`.
- Haz commits pequeños en español. Cada push a `main` se publica solo en cumplegratis.fun.
- Revisa los cambios visuales en 360, 390, 768, 1024 y 1440 px. No debe haber scroll horizontal.
