import { pathToFileURL } from 'node:url';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const modName = process.env.PW_MODULE || 'playwright';
const { chromium } = await import(modName.startsWith('/') ? pathToFileURL(modName).href : modName);

const IGNORED = ['googlesyndication', 'adsbygoogle', 'cloudflareinsights', 'doubleclick'];
const ignored = (s = '') => IGNORED.some((d) => s.includes(d));

const routes = [
  { path: '/', text: ['Tu cumple'] },
  { path: '/promos/', text: ['promos'] },
  { path: '/promos/starbucks/', text: ['Starbucks'] },
  { path: '/mi-cumple/?m=11&d=14', text: ['días', 'Hoy es'] },
  { path: '/ciudades/merida/', text: ['Mérida'] },
  { path: '/cumpleanos/noviembre/', text: ['noviembre'] },
  { path: '/guias/comida-gratis-en-tu-cumpleanos/', text: ['gratis'] },
];

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript(() => {
  try { localStorage.setItem('cg:consent', '"essential"'); } catch {}
});

let failed = 0;

for (const route of routes) {
  const page = await context.newPage();
  const problems = [];
  const url = base + route.path;

  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (ignored(msg.text()) || ignored(msg.location().url)) return;
    problems.push(`consola: ${msg.text()}`);
  });

  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    const status = res ? res.status() : 0;
    if (status !== 200) problems.push(`HTTP ${status}`);

    const found = await page
      .waitForFunction(
        (texts) => {
          const body = document.body ? document.body.textContent : '';
          return texts.some((t) => body.includes(t));
        },
        route.text,
        { timeout: 15000 },
      )
      .then(() => true)
      .catch(() => false);
    if (!found) problems.push(`falta texto (${route.text.join(' | ')})`);
  } catch (err) {
    problems.push(`navegación: ${err.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }

  if (problems.length) {
    failed++;
    console.log(`FALLA ${route.path} — ${problems.join('; ')}`);
  } else {
    console.log(`OK    ${route.path}`);
  }
}

await browser.close();
console.log(`\nResumen: ${routes.length - failed}/${routes.length} OK, ${failed} con fallas`);
process.exit(failed ? 1 : 0);
