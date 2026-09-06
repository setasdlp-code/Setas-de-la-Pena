import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

// Locate Playwright module
const candidatePaths = [
  process.env.SB_PLAYWRIGHT_PATH,
  'playwright',
  path.resolve(ROOT, '../../field-os-simulador/setas-os/node_modules/playwright'),
  '/Users/sebastianpinzon/.gemini/antigravity/worktrees/Setas de la Peña/update_setas_os_docs/field-os-simulador/setas-os/node_modules/playwright'
].filter(Boolean);

let chromium;
for (const p of candidatePaths) {
  try {
    const mod = require(p);
    chromium = mod.chromium || mod.default?.chromium;
    if (chromium) break;
  } catch (_) {}
}

if (!chromium) {
  throw new Error('Playwright no disponible. Define SB_PLAYWRIGHT_PATH apuntando a un checkout con playwright.');
}

// Local server setup
let server;
let base = process.env.SB_PREVIEW_URL;

if (!base) {
  server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '');
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT + path.sep) || !existsSync(file)) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  base = `http://127.0.0.1:${port}/mockups`;
}

console.log(`=== Chequeo Playwright: Pliego components.html (${base}) ===`);

const browser = await chromium.launch();
try {
  for (const width of [320, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('response', resp => {
      if (resp.status() >= 400) errors.push(`${resp.status()} ${resp.url()}`);
    });

    await page.goto(`${base}/components.html`, { waitUntil: 'networkidle' });

    // 1. Estructura y navegación accesible
    assert.equal(await page.locator('h1').count(), 1, 'Debe haber exactamente un <h1>');
    assert.equal(await page.locator('nav [aria-current="page"]').count(), 1, 'Debe haber exactamente un enlace activo con aria-current="page"');
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `components.html: desbordamiento horizontal en ${width}px`
    );

    // 2. Salto al contenido
    await page.keyboard.press('Tab');
    assert.equal(
      await page.evaluate(() => document.activeElement.className),
      'sb-skip-link',
      'El primer foco debe ser el enlace de salto al contenido'
    );

    // 3. Botonería y estado activo
    const btnTest = page.locator('#btn-test-action');
    await btnTest.click();
    assert.match(await page.locator('#btn-feedback').innerText(), /Pulsación confirmada/);
    const btnDisabled = page.locator('#btn-test-disabled');
    assert.ok(await btnDisabled.isDisabled(), 'El botón inactivo debe tener atributo disabled');

    // 4. Selector de audiencia interactivo con estados ARIA
    const tabHogar = page.locator('#tab-hogar');
    const tabChef = page.locator('#tab-chef');
    const panelHogar = page.locator('#panel-hogar');
    const panelChef = page.locator('#panel-chef');

    assert.equal(await tabHogar.getAttribute('aria-selected'), 'true');
    assert.equal(await tabChef.getAttribute('aria-selected'), 'false');
    assert.ok(await panelHogar.isVisible());
    assert.ok(!(await panelChef.isVisible()));

    // Alternar a Chef
    await tabChef.click();
    assert.equal(await tabHogar.getAttribute('aria-selected'), 'false');
    assert.equal(await tabChef.getAttribute('aria-selected'), 'true');
    assert.ok(!(await panelHogar.isVisible()));
    assert.ok(await panelChef.isVisible());

    // Navegación por teclado (ArrowLeft debe devolver a Hogar)
    await tabChef.focus();
    await page.keyboard.press('ArrowLeft');
    assert.equal(await tabHogar.getAttribute('aria-selected'), 'true');
    assert.ok(await panelHogar.isVisible());

    // 5. Calculadora de merma interactiva y etiqueta de estimación
    const inputCrudo = page.locator('#input-crudo');
    const inputTasa = page.locator('#input-tasa');
    await inputCrudo.fill('500');
    await inputTasa.fill('12');
    await page.locator('#input-tasa').dispatchEvent('input');

    const outputCocido = await page.locator('#output-cocido').innerText();
    const outputMerma = await page.locator('#output-merma').innerText();
    assert.match(outputCocido, /440\s*g/, '500g con 12% merma debe dar 440g cocinados');
    assert.match(outputMerma, /60\s*g/, 'Merma calculada debe ser 60g');

    // Etiqueta de estimación obligatoria
    const disclaimer = await page.locator('.sb-calc-disclaimer').innerText();
    assert.match(disclaimer, /Estimación ilustrativa calculada; no constituye una especificación garantizada de lote/);

    // 6. Cajas epistémicas
    assert.equal(await page.locator('.sb-epistemic-card').count(), 3, 'Deben existir 3 niveles de tarjetas epistémicas');

    // 7. Movimiento reducido
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const btnDuration = await page.locator('.sb-btn').first().evaluate(e => getComputedStyle(e).transitionDuration);
    assert.equal(btnDuration, '0s', 'Las transiciones deben ser instantáneas con prefers-reduced-motion');

    assert.deepEqual(errors, [], 'No debe haber errores de consola ni respuestas 4xx/5xx');
    await page.close();
    console.log(`PASS ${width}px: estructura, navegación, botonería, selector ARIA, calculadora de merma, cajas epistémicas`);
  }
} finally {
  await browser.close();
  if (server) server.close();
}

console.log('ÉXITO: Todos los chequeos Playwright de components.html pasaron al 100%.');
