'use strict';
// E2E-13 — Calidad de cosecha: escaneo/acción de cosecha → bloque de calidad → ficha de lote.
// Arnés local: React real, sin Firebase ni escrituras de producción. Corre a 320, 390,
// escritorio, tablet vertical y teléfono horizontal (los proyectos `mobile-390` y
// `desktop-chromium` de playwright.config.cjs usan los mismos descriptores de iPhone 13 y
// Desktop Chrome; esos proyectos exigen sesión, este arnés no).
// Run: node e2e/harvest-quality.browser.cjs
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, devices, expect } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const { defaultBrowserType, ...IPHONE } = devices['iPhone 13'];

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 568, phone: true },
  { name: 'mobile-390', width: 390, height: 844, phone: true },
  { name: 'phone-landscape-844', width: 844, height: 390, phone: true },
  { name: 'tablet-768', width: 768, height: 1024, phone: true },
  { name: 'desktop-chromium', width: 1280, height: 720, phone: false },
];

// Lote en fructificación (la cosecha es una acción válida), sin criterio documentado
// para Orellana Gris, dos cosechas antiguas sin bloque de calidad (migración).
const LOTES = [
  { id: 'Q1', codigo: 'SDP-Q1', especie: 'Shiitake', estado: 'fructificacion', numBolsas: 3, fechaInoculacion: '2026-09-10', operador: 'fixture', lifecycleEvents: [] },
  { id: 'Q2', codigo: 'SDP-Q2', especie: 'Orellana Gris', estado: 'fructificacion', numBolsas: 1, fechaInoculacion: '2026-09-10', operador: 'fixture', lifecycleEvents: [] },
];
const BOLSAS = [
  { id: 'Q1-B1', loteId: 'Q1', codigo: 'SDP-Q1-B01', num: 1, estado: 'sana' },
  { id: 'Q1-B2', loteId: 'Q1', codigo: 'SDP-Q1-B02', num: 2, estado: 'sana' },
  { id: 'Q1-B3', loteId: 'Q1', codigo: 'SDP-Q1-B03', num: 3, estado: 'sana' },
  { id: 'Q2-B1', loteId: 'Q2', codigo: 'SDP-Q2-B01', num: 1, estado: 'sana' },
];
const COSECHAS_ANTIGUAS = [
  { id: 'COS-OLD-1', loteId: 'Q1', bolsaId: 'Q1-B2', flush: 1, fecha: '2026-10-20', pesoFresco: 500, unit: 'g', calidad: 4 },
  { id: 'COS-OLD-2', loteId: 'Q1', bolsaId: 'Q1-B3', flush: 2, fecha: '2026-10-27', pesoFresco: 600, unit: 'g', calidad: null },
];

const serve = () => http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  let body = fs.readFileSync(file);
  if (pathname === '/__harness.html') {
    // ?scan=1 abre la hoja de captura QR al arrancar (flujo de campo); sin él, la app abre normal.
    body = body.toString()
      .replace('<script src="simulador-app.js">', '<script src="batch-sheet.js"></script><script src="field-qr-events.js"></script><script src="simulador-app.js">')
      .replace('hoyPreviewEventos: 0', url.searchParams.get('scan') === '1' ? 'scanNonce: 1, hoyPreviewEventos: 0' : 'hoyPreviewEventos: 0');
  }
  res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
  res.end(body);
});

const stored = (page, key) => page.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), key);

// Todo texto visible del contenedor mide al menos 16 px (lectura operativa, UX V2 §14).
const smallText = (locator) => locator.evaluateAll((els) => {
  const out = [];
  els.forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const p = n.parentElement;
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !p.getClientRects().length) continue;
      if (parseFloat(cs.fontSize) < 16) out.push(`${p.tagName.toLowerCase()}:${parseFloat(cs.fontSize)}px:${n.textContent.trim().slice(0, 30)}`);
    }
  });
  return out;
});

const assertFieldContract = async (dialog, vp, label) => {
  assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), `${label}: desborde horizontal a ${vp.width}px`);
  const box = await dialog.boundingBox();
  assert.ok(box.width <= vp.width + 0.5, `${label}: el diálogo excede el ancho a ${vp.width}px`);
  assert.ok(box.height <= vp.height + 0.5, `${label}: el diálogo excede el alto (dvh) a ${vp.height}px`);
  for (const control of await dialog.locator('button:visible, input:visible, select:visible, summary:visible').all()) {
    const b = await control.boundingBox();
    assert.ok(b.height >= 47.5, `${label}: objetivo táctil de ${b.height}px a ${vp.width}px`);
  }
  assert.deepEqual(await smallText(dialog), [], `${label}: texto operativo < 16 px a ${vp.width}px`);
  for (const input of await dialog.locator('input:visible').all()) {
    assert.ok(parseFloat(await input.evaluate(el => getComputedStyle(el).fontSize)) >= 16, `${label}: input < 16px (zoom automático de iOS) a ${vp.width}px`);
  }
};

const runViewport = async (browser, server, vp) => {
  const context = await browser.newContext(vp.phone ? { ...IPHONE, viewport: { width: vp.width, height: vp.height } } : { viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
  await page.addInitScript(([lotes, bolsas, cosechas]) => {
    if (!sessionStorage.getItem('fixture-init')) {
      localStorage.clear();
      localStorage.setItem('sdp_seeded', '1');
      localStorage.setItem('sdp_lotes', '[]');
      localStorage.setItem('sdp_bit_lotes', JSON.stringify(lotes));
      localStorage.setItem('sdp_bit_bolsas', JSON.stringify(bolsas));
      localStorage.setItem('sdp_bit_cosechas', JSON.stringify(cosechas));
      sessionStorage.setItem('fixture-init', '1');
    }
    window.SetasEventosCultivoDB = { registrarEvento: async () => {} };
    window.SetasBitacoraDB = { actualizarLote: async () => {} };
  }, [LOTES, BOLSAS, COSECHAS_ANTIGUAS]);
  const label = vp.name;
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?scan=1`);

  // 1) Escanear → resolver objeto → acciones válidas → Cosecha parcial (acción existente).
  let scan = page.getByRole('dialog', { name: 'Captura rápida de campo' });
  await expect(scan).toBeVisible();
  await scan.getByLabel('Código impreso en la etiqueta').fill('SDP-Q1');
  await scan.getByRole('button', { name: 'Abrir', exact: true }).click();
  const actionSheet = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Cerrar hoja de acción' }) });
  await expect(actionSheet).toBeVisible();
  await actionSheet.locator('[data-action="evento-cosecha_parcial"]').click();

  // 2) Mínimo de la cosecha (flujo existente): bolsa + peso. Sin pantallas nuevas.
  const harvest = page.getByRole('dialog', { name: 'Registrar cosecha', exact: true });
  await expect(harvest).toBeVisible();
  await harvest.getByLabel('Bolsa', { exact: true }).selectOption({ label: 'SDP-Q1-B01' });
  await harvest.getByLabel('Peso fresco (g)', { exact: true }).fill('430');
  await expect(harvest.getByTestId('btn-save-and-rate-quality')).toBeVisible();
  // Sin conexión: nunca se espera la red. La cosecha y su calidad se guardan en el equipo y se encolan.
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await harvest.getByTestId('btn-save-and-rate-quality').click();

  // 3) Paso opcional de calidad (mismo diálogo, otro contenido).
  const step = page.getByRole('dialog', { name: 'Calidad de la cosecha', exact: true });
  await expect(step).toBeVisible();
  await expect(step.getByTestId('hq-step')).toBeVisible();
  const harvestId = (await stored(page, 'sdp_bit_cosechas')).find(c => c.bolsaId === 'Q1-B1').id;
  assert.equal(await page.getByRole('dialog', { name: 'Registrar cosecha', exact: true }).count(), 0, `${label}: el paso de calidad reemplaza el contenido, no abre otra pantalla`);
  await expect(step.getByTestId('hq-criteria')).toHaveAttribute('data-criteria-status', 'documented');
  await expect(step.locator('#hq-save-note')).toContainText('Sin conexión');
  await expect(step.getByTestId('hq-save')).toBeDisabled();   // nada capturado → nada que guardar
  assert.equal(await step.getByLabel('Primera (g)').getAttribute('inputmode'), 'decimal');
  assert.equal(await step.locator('#hq-cap-diameter').getAttribute('inputmode'), 'decimal');
  await assertFieldContract(step, vp, `${label} paso de calidad`);

  // 3a) Desfase: se muestra y no se corrige.
  await step.getByLabel('Primera (g)').fill('300');
  await step.getByLabel('Segunda (g)').fill('140');
  await step.getByLabel('Descarte (g)').fill('30');
  await expect(step.getByTestId('hq-balance')).toHaveAttribute('data-consistency', 'mismatch');
  await expect(step.getByTestId('hq-balance')).toContainText('desfase +40 g');
  await expect(step.getByTestId('hq-save')).toHaveText('Guardar con desfase de +40 g');
  await expect(step.getByLabel('Segunda (g)')).toHaveValue('140');   // no se corrigió en silencio
  // 3b) Se corrige a mano: la coma y el punto valen igual.
  await step.getByLabel('Segunda (g)').fill('100,0');
  await expect(step.getByTestId('hq-balance')).toHaveAttribute('data-consistency', 'consistent');
  await expect(step.getByTestId('hq-save')).toHaveText('Guardar calidad');
  await step.locator('#hq-cap-diameter').fill('62,5');
  await step.getByRole('group', { name: 'Grado de toda la cosecha' }).getByRole('button', { name: 'Primera' }).click();
  await step.getByRole('group', { name: 'Firmeza' }).getByRole('button', { name: 'Firme' }).click();
  await step.getByRole('group', { name: 'Color' }).getByRole('button', { name: 'Coherente con el lote' }).click();
  await step.getByRole('group', { name: 'Defectos observados' }).getByRole('button', { name: 'Daño mecánico' }).click();
  await step.getByRole('group', { name: 'Severidad de Daño mecánico (opcional)' }).getByRole('button', { name: 'Leve' }).click();
  await assertFieldContract(step, vp, `${label} paso de calidad completo`);
  if (process.env.SETAS_HQ_SCREENSHOT_DIR) await step.screenshot({ path: path.join(process.env.SETAS_HQ_SCREENSHOT_DIR, `quality-step-${vp.name}.png`) });
  await step.getByTestId('hq-save').click();
  await expect(page.getByRole('dialog', { name: 'Calidad de la cosecha', exact: true })).toHaveCount(0);

  // 4) Persistencia local + cola de sincronización (idempotente por id de cosecha).
  const saved = (await stored(page, 'sdp_bit_cosechas')).find(c => c.id === harvestId);
  assert.equal(saved.pesoFresco, 430);
  assert.equal(saved.quality.schema, 'setas.harvest-quality.v1');
  assert.deepEqual(saved.quality.kgByGrade, { primera: 0.3, segunda: 0.1, descarte: 0.03 });
  assert.equal(saved.quality.capDiameterMm, 62.5);
  assert.equal(saved.quality.grade, 'primera');
  assert.equal(saved.quality.firmness, 'firme');
  assert.equal(saved.quality.color, 'coherente');
  assert.deepEqual(saved.quality.defects, [{ code: 'dano_mecanico', severity: 'leve' }]);
  assert.equal(saved.quality.species.criteriaStatus, 'documented');
  assert.equal(saved.quality.consistencyAtCapture.status, 'consistent');
  assert.equal(saved.calidad, null, 'la calificación heredada de 1-5 estrellas no se toca');
  const queue = await stored(page, 'sdp_sync_queue');
  const harvestOps = queue.filter(op => op.type === 'guardarCosecha' && op.key === `cosecha:${harvestId}`);
  assert.ok(harvestOps.length >= 1, `${label}: la cosecha debe quedar en cola`);
  assert.deepEqual(harvestOps[harvestOps.length - 1].args[0].quality, saved.quality, 'la última operación en cola lleva el bloque de calidad');
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));

  // 5) Ficha del lote: panel compacto junto a las cosechas. n visible; con n bajo, «datos insuficientes».
  await page.reload();
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`);
  await page.locator('.sdp-lote').filter({ has: page.getByText('SDP-Q1', { exact: true }) }).first().click();
  const panel = page.getByTestId('batch-harvest-quality');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('hq-coverage')).toContainText('Con calidad: 1 de 3 cosechas');
  await expect(panel.getByTestId('hq-coverage')).toContainText('sin calidad: 2');
  await expect(panel.getByTestId('hq-cumulative')).toHaveAttribute('data-status', 'insufficient');
  await expect(panel.getByTestId('hq-cumulative')).toContainText('Datos insuficientes');
  await expect(panel.getByTestId('hq-cumulative')).not.toContainText(/Primera \d+ %/);   // ningún porcentaje de primera con n bajo
  await expect(panel.getByTestId('hq-defect-summary')).toContainText('n=1 cosechas evaluadas');
  await expect(panel.getByTestId('hq-defect-summary')).toContainText('Daño mecánico 1/1');
  await expect(panel.getByTestId('hq-defect-summary')).toContainText('datos insuficientes para frecuencias');
  if (process.env.SETAS_HQ_SCREENSHOT_DIR) await panel.screenshot({ path: path.join(process.env.SETAS_HQ_SCREENSHOT_DIR, `quality-panel-${vp.name}.png`) });
  assert.deepEqual(await smallText(panel.locator('.hq-line, .hq-flushes, .hq-pending')), [], `${label}: texto del panel < 16 px`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${label}: la ficha desborda horizontalmente`);

  // 6) Camino mínimo (≤ 3 toques) sobre las cosechas antiguas sin bloque: siguen siendo válidas y se califican después.
  const pending = panel.getByTestId('hq-pending').getByRole('button');
  await expect(pending).toHaveCount(2);
  for (const b of await pending.all()) assert.ok((await b.boundingBox()).height >= 47.5, `${label}: botón Calificar < 48px`);
  let taps = 0;
  const tap = async (locator) => { await locator.click(); taps += 1; };
  await pending.first().click();
  let quick = page.getByRole('dialog', { name: 'Calidad de la cosecha', exact: true });
  await expect(quick).toBeVisible();
  await tap(quick.getByRole('group', { name: 'Grado de toda la cosecha' }).getByRole('button', { name: 'Primera' }));
  await tap(quick.getByRole('group', { name: 'Defectos observados' }).getByRole('button', { name: 'Sin defectos' }));
  await tap(quick.getByTestId('hq-save'));
  assert.equal(taps, 3, `${label}: calificar una cosecha debe tomar 3 toques`);
  await expect(quick).toHaveCount(0);
  await panel.getByTestId('hq-pending').getByRole('button').first().click();
  quick = page.getByRole('dialog', { name: 'Calidad de la cosecha', exact: true });
  await quick.getByRole('group', { name: 'Grado de toda la cosecha' }).getByRole('button', { name: 'Segunda' }).click();
  await quick.getByRole('group', { name: 'Defectos observados' }).getByRole('button', { name: 'Sin defectos' }).click();
  await quick.getByTestId('hq-save').click();
  await expect(quick).toHaveCount(0);
  const olds = (await stored(page, 'sdp_bit_cosechas')).filter(c => c.id.startsWith('COS-OLD'));
  assert.ok(olds.every(c => c.quality && c.quality.schemaVersion === 1), `${label}: las cosechas antiguas reciben bloque sin perder sus datos`);
  assert.equal(olds.find(c => c.id === 'COS-OLD-1').pesoFresco, 500);
  assert.equal(olds.find(c => c.id === 'COS-OLD-1').calidad, 4);

  // 7) n suficiente (3 cosechas con calidad, cobertura 100 %): ahora sí hay un porcentaje, con su n.
  await expect(panel.getByTestId('hq-cumulative')).toHaveAttribute('data-status', 'ok');
  await expect(panel.getByTestId('hq-cumulative')).toContainText('n=3 cosechas');
  await expect(panel.getByTestId('hq-cumulative')).toContainText('Primera');
  await expect(panel.getByTestId('hq-coverage')).toContainText('Con calidad: 3 de 3 cosechas');
  await expect(panel.getByTestId('hq-defect-summary')).toContainText('n=3 cosechas evaluadas');
  await expect(panel.getByTestId('hq-pending')).toHaveCount(0);
  await expect(panel.getByTestId('hq-flushes')).toContainText('Oleada 1');
  await expect(panel.getByTestId('hq-flushes')).toContainText('Oleada 2');

  // 8) Especie sin criterio documentado: se captura como juicio del operario y se marca.
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?scan=1`);
  scan = page.getByRole('dialog', { name: 'Captura rápida de campo' });
  await scan.getByLabel('Código impreso en la etiqueta').fill('SDP-Q2');
  await scan.getByRole('button', { name: 'Abrir', exact: true }).click();
  await page.locator('[data-action="evento-cosecha_parcial"]').click();
  const h2 = page.getByRole('dialog', { name: 'Registrar cosecha', exact: true });
  await h2.getByLabel('Bolsa', { exact: true }).selectOption({ label: 'SDP-Q2-B01' });
  await h2.getByLabel('Peso fresco (g)', { exact: true }).fill('200');
  await h2.getByTestId('btn-save-and-rate-quality').click();
  const step2 = page.getByRole('dialog', { name: 'Calidad de la cosecha', exact: true });
  await expect(step2.getByTestId('hq-criteria')).toHaveAttribute('data-criteria-status', 'undocumented');
  await expect(step2.getByTestId('hq-criteria')).toContainText('Sin criterio documentado para Orellana Gris');
  await step2.getByRole('group', { name: 'Grado de toda la cosecha' }).getByRole('button', { name: 'Primera' }).click();
  await step2.getByTestId('hq-save').click();
  const q2 = (await stored(page, 'sdp_bit_cosechas')).find(c => c.bolsaId === 'Q2-B1');
  assert.equal(q2.quality.species.criteriaStatus, 'undocumented');
  assert.equal(q2.quality.gradeBasis, 'operator_judgement');
  assert.equal(q2.quality.defects, null, 'defectos sin evaluar quedan null, no []');
  assert.equal(q2.quality.capDiameterMm, null, 'diámetro no medido queda null, no 0');
  assert.deepEqual(q2.quality.kgByGrade, { primera: null, segunda: null, descarte: null });

  // 9) «Omitir» no escribe nada: la cosecha sigue siendo válida sin bloque.
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?scan=1`);
  scan = page.getByRole('dialog', { name: 'Captura rápida de campo' });
  await scan.getByLabel('Código impreso en la etiqueta').fill('SDP-Q1');
  await scan.getByRole('button', { name: 'Abrir', exact: true }).click();
  await page.locator('[data-action="evento-cosecha_parcial"]').click();
  const h3 = page.getByRole('dialog', { name: 'Registrar cosecha', exact: true });
  await h3.getByLabel('Bolsa', { exact: true }).selectOption({ label: 'SDP-Q1-B02' });
  await h3.getByLabel('Peso fresco (g)', { exact: true }).fill('0');
  await h3.getByTestId('btn-save-and-rate-quality').click();
  await page.getByRole('dialog', { name: 'Calidad de la cosecha', exact: true }).getByTestId('hq-skip').click();
  const skipped = (await stored(page, 'sdp_bit_cosechas')).filter(c => c.bolsaId === 'Q1-B2' && !c.id.startsWith('COS-OLD'));
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].pesoFresco, 0, 'el cero medido se conserva');
  assert.equal(Object.hasOwn(skipped[0], 'quality'), false);

  assert.deepEqual(errors, [], `${label}: errores de página`);
  await context.close();
  return label;
};

(async () => {
  const server = serve();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    for (const vp of VIEWPORTS) {
      const name = await runViewport(browser, server, vp);
      console.log(`PASS ${name}: escaneo → cosecha parcial → calidad (offline, desfase visible, null/0, migración) → ficha del lote.`);
    }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
