'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    let body = fs.readFileSync(file);
    if (file.endsWith('__harness.html')) body = body.toString().replace('<script src="simulador-app.js">', '<script src="formulator-api.js"></script><script src="simulador-app.js">');
    res.end(body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    for (const compatible of [true, false]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = []; page.on('pageerror', e => { errors.push(e.message); console.error('pageerror:',e.message); });
      await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
      await page.addInitScript(compatible => {
        localStorage.setItem('sdp_seeded', '1');
        localStorage.setItem('setas_global_workmode', 'produccion');
        localStorage.setItem('sdp_lotes', JSON.stringify([{
          id: 'AUDIT_STOCK', ingredienteId: compatible ? 'paja_trigo' : 'aserrin_roble', activo: true,
          cantidadKgDisponible: 10, cantidadKgInicial: 10, precioKg: 300, fechaCompra: '2026-10-07',
        }]));
        localStorage.setItem('setas_formulator_draft_v1', JSON.stringify({ version: 1, recipe: [{ id: 'paja_trigo', p: 45 }], sKey: 'p_ostreatus_gris', hasPickedSpecies: true, lockedIds: [] }));
      }, compatible);
      await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
      await page.waitForFunction(() => window.SetasFormulatorAPI?.adapterType() === 'native');
      const panel = page.getByRole('tabpanel', { name: /Mesa de Mezcla/ });
      await panel.getByRole('button', { name: 'Formular con Stock', exact: true }).click();
      if (compatible) {
        await expect.poll(() => page.evaluate(() => window.SetasFormulatorAPI.getRecipe())).toEqual([{ id: 'paja_trigo', p: 100 }]);
        await expect(panel.locator('.rec-pct-input').first()).toHaveValue('100');
      } else {
        await expect(page.getByText('Sin combinación viable con stock actual', { exact: true })).toBeVisible();
        assert.deepEqual(await page.evaluate(() => window.SetasFormulatorAPI.getRecipe()), [{ id: 'paja_trigo', p: 45 }]);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
    await page.addInitScript(() => {
      localStorage.setItem('sdp_seeded', '1');
      localStorage.setItem('setas_global_workmode', 'investigacion');
      localStorage.setItem('setas_formulator_draft_v1', JSON.stringify({ version: 1, recipe: [{ id: 'paja_trigo', p: 45 }], sKey: 'p_ostreatus_gris', hasPickedSpecies: true, lockedIds: ['paja_trigo'] }));
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
    await page.waitForFunction(() => window.SetasFormulatorAPI?.adapterType() === 'native');
    assert.equal((await page.evaluate(() => window.SetasFormulatorAPI.applyRecipe([{ id: 'paja_trigo', p: 45 }, { id: 'salvado_trigo', p: 55 }]))).ok, true);
    await expect.poll(() => page.evaluate(() => window.SetasFormulatorAPI.getRecipe().length)).toBe(2);
    assert.equal((await page.evaluate(() => window.SetasFormulatorAPI.undoRecipe())).ok, true);
    await expect.poll(() => page.evaluate(() => window.SetasFormulatorAPI.getRecipe())).toEqual([{ id: 'paja_trigo', p: 45 }]);
    assert.deepEqual(await page.evaluate(() => [...window.SetasFormulatorAPI.getLockedIds()]), ['paja_trigo']);
    await page.close();
    console.log('PASS: Bodega carga p; rechaza incompatible; undo restaura borrador y bloqueo en React.');
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
