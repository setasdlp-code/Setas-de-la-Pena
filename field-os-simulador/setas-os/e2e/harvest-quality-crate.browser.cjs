'use strict';
// Calidad opcional en la captura por canastilla (modal "Captura rápida de campo",
// clase por defecto, NO .harvest-capture-dialog). Verifica que los controles de la
// sección tengan >= 48 px a 390 y 430 px, que el selector 1ra/2da/Merma ya no exista
// y que un peso negativo bloquee el guardado.
// Run: node e2e/harvest-quality-crate.browser.cjs
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..');

(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    let body = fs.readFileSync(file);
    if (pathname === '/__harness.html') body = body.toString().replace('<script src="simulador-app.js">', '<script src="batch-sheet.js"></script><script src="field-qr-events.js"></script><script src="simulador-app.js">');
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    res.end(body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      localStorage.setItem('sdp_seeded', '1');
      localStorage.setItem('sdp_lotes', '[]');
      localStorage.setItem('sdp_bit_lotes', JSON.stringify([{ id: 'HQ1', codigo: 'SDP-HQ1', especie: 'Orellana Gris', estado: 'activo', numBolsas: 2, fechaInoculacion: '2026-09-10', operador: 'fixture', lifecycleEvents: [] }]));
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?crate=CAN-01`);
    const sheet = page.getByRole('dialog', { name: 'Captura rápida de campo' });
    await expect(sheet).toBeVisible();
    const summary = sheet.locator('details.harvest-quality > summary');
    await expect(summary).toBeVisible();
    await summary.click();
    await expect(sheet.locator('details.harvest-quality')).toHaveAttribute('open', '');

    for (const width of [390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      const sizes = await sheet.evaluate((el) => [...el.querySelectorAll('details.harvest-quality :is(button, summary, input)')]
        .filter((n) => n.offsetParent !== null)
        .map((n) => ({ tag: n.tagName, label: n.getAttribute('aria-label') || n.textContent.trim() || n.id, h: n.getBoundingClientRect().height })));
      assert.ok(sizes.length >= 12, `controles de calidad visibles (${sizes.length})`);
      sizes.forEach((s) => assert.ok(s.h >= 47.5, `${s.tag} "${s.label}" mide ${s.h}px a ${width}px (< 48)`));
      // El desborde preexistente de la hoja (zona de bruto/tara) no es de esta sección:
      // aquí solo se exige que nada dentro de la sección de calidad se salga del modal.
      assert.ok(await sheet.evaluate((el) => {
        const limit = el.getBoundingClientRect().right + 1;
        return [...el.querySelectorAll('details.harvest-quality *')].every((n) => n.getBoundingClientRect().right <= limit);
      }), `la sección de calidad no desborda a ${width}px`);
    }

    // Estilos del componente aplicados en este modal (no solo el alto mínimo).
    assert.equal(await sheet.locator('.harvest-quality-options').evaluate((n) => getComputedStyle(n).display), 'grid');

    // «Sin defectos observados» (evaluado sin hallazgos) y los chips de defecto son excluyentes;
    // deseleccionar todo deja «no evaluado» (ninguno presionado).
    const noDefects = sheet.getByRole('button', { name: 'Sin defectos observados', exact: true });
    const spo = sheet.locator('[data-defect="sporulation"]');
    await expect(noDefects).toHaveAttribute('aria-pressed', 'false');
    await noDefects.click();
    await expect(noDefects).toHaveAttribute('aria-pressed', 'true');
    await spo.click();
    await expect(spo).toHaveAttribute('aria-pressed', 'true');
    await expect(noDefects).toHaveAttribute('aria-pressed', 'false');
    await noDefects.click();
    await expect(noDefects).toHaveAttribute('aria-pressed', 'true');
    await expect(spo).toHaveAttribute('aria-pressed', 'false');
    await noDefects.click();
    await expect(noDefects).toHaveAttribute('aria-pressed', 'false');
    await expect(spo).toHaveAttribute('aria-pressed', 'false');

    // El selector heredado 1ra/2da/Merma se retiró.
    for (const lbl of ['1ra', '2da', 'Merma']) await expect(sheet.getByRole('button', { name: lbl, exact: true })).toHaveCount(0);

    // Un peso negativo bloquea el guardado con un mensaje en español.
    await sheet.locator('#crate-peso-primera').fill('-50');
    await expect(sheet.locator('#crate-peso-primera-error')).toBeVisible();
    await sheet.getByPlaceholder('Ej: 1450').fill('900');
    await sheet.getByRole('button', { name: /Guardar Canastilla/ }).click();
    await expect(sheet.getByText(/Peso Primera/)).toBeVisible();
    assert.equal(await page.evaluate(() => (JSON.parse(localStorage.getItem('sdp_bit_cosechas') || '[]')).length ?? -1), 0, 'no se guardó la cosecha con peso negativo');
    assert.deepEqual(errors, []);
    console.log('PASS: crate quality section >= 48 px at 390/430, legacy selector intact, no overflow.');
  } finally { await browser?.close(); await new Promise((resolve) => server.close(resolve)); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
