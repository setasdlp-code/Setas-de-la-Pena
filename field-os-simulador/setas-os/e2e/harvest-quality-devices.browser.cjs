'use strict';
// E2E-13 — Calidad de cosecha en cinco formatos de pantalla: la sección «Calidad»
// del formulario de cosecha (#520) y el panel «Calidad de cosecha» de la ficha de
// lote. Arnés propio de run-browser-tests.cjs (no los proyectos de
// playwright.config.cjs, que exigen sesión). Run: node e2e/harvest-quality-devices.browser.cjs
//
// Formatos: 320×568, 390×844, 844×390 (horizontal), 768×1024 y 1280×720.
// Por formato: objetivos >= 48 px, texto >= 16 px, inputs >= 16 px (sin zoom de iOS),
// sin desborde horizontal y diálogo dentro del alto (dvh).
//   · Panel de la ficha de lote (nuestro): se exige todo, sin excepciones.
//   · Formulario de #520 (no se toca): se exigen desborde, alto de objetivos, pisos de
//     FOS (44 px de ancho, 14 px de texto) y el diálogo dentro del alto; lo que además
//     incumple el criterio de 16/48 px queda fijado en KNOWN_520_FINDINGS por formato.
//
// Solo Chromium: WebKit, Firefox y dispositivos reales (teclado decimal, safe-area,
// guantes) NO están cubiertos por esta prueba.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..');

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '390x844', width: 390, height: 844 },
  { name: '844x390 horizontal', width: 844, height: 390 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1280x720', width: 1280, height: 720 },
];
const MOBILE_MAX = 859; // mismo corte que isMobileViewport en simulador-app.jsx
const MIN_TARGET = 48;
const FOS_FLOOR = 44;
const DS_SMALL_FLOOR = 14; // --size-small de ds-2026
// Incumplimientos del formulario de #520 hallados con esta prueba (se reportan, no se
// corrigen aquí: el formulario de #520 no se toca en esta tarea).
const FINDING = {
  width: 'objetivo con ancho < 48 px (firmeza 1-5)',
  text: 'texto de la sección «Calidad» < 16 px (etiquetas, aviso de suma, anclas de firmeza)',
  input: 'input con fuente < 16 px (iOS hace zoom al enfocar)',
  dialog: 'diálogo desplazado: su borde inferior queda fuera de la pantalla (el fondo se desplaza)',
  save: '«Guardar cosecha» no queda visible sin desplazar',
};
const KNOWN_520_FINDINGS = {
  '320x568': [FINDING.width, FINDING.text],
  '390x844': [FINDING.text],
  '844x390 horizontal': [FINDING.input, FINDING.text], // 769-859 px: el 16 px de inputs solo rige hasta 768 px (sim.css:2034, :2093)
  '768x1024': [FINDING.text],
  '1280x720': [FINDING.dialog, FINDING.text],
};
const MIN_TEXT = 16;
const EPS = 0.5;

// Datos sembrados (gramos). Resultado esperado con los umbrales por defecto
// (3 cosechas con grado completo, cobertura 0,5):
//   oleada 1: C1, C2, C3 con grado verificado y C4 con desfase -> n = 3 de 4, primera 40 %
//   oleada 2: C6 con grado y C7 sin calidad -> oleada incompleta, datos insuficientes
//   oleada 3: C5 sin calidad
//   acumulado: n = 4 de 7 (57 %), primera 900 de 2000 g = 45 %
// Defectos: n = cosechas con defectos evaluados. C1, C3 y C6 traen defectos, C2 lleva la marca
// «sin defectos observados» y C4 tiene lista vacía SIN marca (no evaluada): n = 4 de 7 en el
// acumulado y 3 de 4 en la oleada 1; C4, C5 y C7 no cuentan.
const lote = { id: 'HQ1', codigo: 'SDP-HQ1', especie: 'Orellana Gris', estado: 'activo', numBolsas: 3, fechaInoculacion: '2026-09-10', operador: 'fixture', lifecycleEvents: [] };
const bolsas = [1, 2, 3].map((n) => ({ id: `HQ1-B0${n}`, loteId: 'HQ1', codigo: `SDP-HQ1-B0${n}`, estado: 'sana' }));
const cos = (id, flush, fecha, over) => ({ id, loteId: 'HQ1', bolsaId: 'HQ1-B01', bagId: 'HQ1-B01', fecha, flush, unit: 'g', unidad: 'g', pesoFresco: 500, ...over });
const GRADE = { criterioGrado: 'provisional_unversioned' };
const cosechas = [
  cos('HQ-C1', 1, '2026-10-01', { ...GRADE, pesoPrimera: 300, pesoSegunda: 150, pesoDescarte: 50, firmeza: 3, firmezaMetodo: 'tacto_ordinal', firmezaEscala: 'v0_texto', defectosCampo: ['sporulation'] }),
  cos('HQ-C2', 1, '2026-10-02', { ...GRADE, pesoPrimera: 200, pesoSegunda: 200, pesoDescarte: 100, firmeza: 3, firmezaMetodo: 'tacto_ordinal', firmezaEscala: 'v0_texto', defectosCampo: [], defectosEvaluados: true }), // evaluada sin defectos
  cos('HQ-C3', 1, '2026-10-03', { ...GRADE, pesoPrimera: 100, pesoSegunda: 300, pesoDescarte: 100, firmeza: 5, firmezaMetodo: 'tacto_ordinal', firmezaEscala: 'v0_texto', defectosCampo: ['sporulation', 'mechanical_damage'] }),
  cos('HQ-C4', 1, '2026-10-04', { ...GRADE, pesoPrimera: 400, pesoSegunda: 200, pesoDescarte: 0, defectosCampo: [] }), // lista vacía SIN marca: defectos no evaluados, no cuenta en n
  cos('HQ-C6', 2, '2026-10-20', { ...GRADE, pesoPrimera: 300, pesoSegunda: 100, pesoDescarte: 100, defectosCampo: ['stipe_elongated'] }),
  cos('HQ-C7', 2, '2026-10-21', { pesoFresco: 400 }),
  cos('HQ-C5', 3, '2026-11-05', { pesoFresco: 450 }),
];

// ── mediciones dentro de la página ──────────────────────────────────────────
// Elementos visibles de `root` con texto propio cuyo tamaño de fuente es menor que `min`.
const smallText = (rootEl, min) => {
  const out = [];
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.nodeValue.trim()) continue;
    const el = node.parentElement;
    if (!el || seen.has(el) || !el.getClientRects().length) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const size = parseFloat(cs.fontSize);
    if (size < min - 0.01) out.push({ tag: el.tagName.toLowerCase(), cls: el.className && String(el.className).slice(0, 40), text: node.nodeValue.trim().slice(0, 40), size });
  }
  return out;
};
const horizontalOverflow = (rootEl) => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  if (document.documentElement.scrollWidth > vw + 1) out.push({ what: 'documento', scrollWidth: document.documentElement.scrollWidth, vw });
  if (rootEl.scrollWidth > rootEl.clientWidth + 1) out.push({ what: 'contenedor', scrollWidth: rootEl.scrollWidth, clientWidth: rootEl.clientWidth });
  rootEl.querySelectorAll('*').forEach((n) => {
    const r = n.getBoundingClientRect();
    if (!r.width || !n.getClientRects().length) return;
    if (r.right > vw + 1 || r.left < -1) out.push({ what: n.tagName.toLowerCase(), cls: String(n.className || '').slice(0, 40), left: r.left, right: r.right, vw });
  });
  return out.slice(0, 5);
};

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
    for (const vp of VIEWPORTS) {
      const mobile = vp.width <= MOBILE_MAX;
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: mobile });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
      await page.addInitScript((seed) => {
        if (sessionStorage.getItem('hq-seeded')) return;
        localStorage.clear();
        localStorage.setItem('sdp_seeded', '1');
        localStorage.setItem('sdp_lotes', '[]');
        localStorage.setItem('sdp_bit_lotes', JSON.stringify([seed.lote]));
        localStorage.setItem('sdp_bit_bolsas', JSON.stringify(seed.bolsas));
        localStorage.setItem('sdp_bit_cosechas', JSON.stringify(seed.cosechas));
        sessionStorage.setItem('hq-seeded', '1');
      }, { lote, bolsas, cosechas });
      await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`);
      // El arnés de CI usa una fuente de reemplazo más ancha que Inter/IBM Plex: se
      // fija una fuente ancha conocida para que el desborde no dependa de la local.
      await page.addStyleTag({ content: "*{font-family:'DejaVu Sans',sans-serif !important}" });

      // ── ficha de lote: panel «Calidad de cosecha» ──
      await page.locator('.sdp-lote').filter({ has: page.getByText('SDP-HQ1', { exact: true }) }).first().click();
      const panel = page.getByTestId('batch-harvest-quality');
      await expect(panel, `${vp.name}: panel de calidad en la ficha`).toBeVisible();
      await panel.scrollIntoViewIfNeeded();
      await expect(panel.getByTestId('hq-criteria')).toContainText('Criterio provisional, sin versionar');
      const total = panel.getByTestId('hq-total');
      await expect(total.getByTestId('hq-counts')).toContainText('5 con calidad registrada');
      await expect(total.getByTestId('hq-counts')).toContainText('2 sin calidad registrada (de 7)');
      await expect(total.getByTestId('hq-first-grade')).toContainText('Primera: 45 %');
      await expect(total.getByTestId('hq-first-grade')).toContainText('n = 4 de 7 cosechas');
      await expect(total.getByTestId('hq-gap-excluded')).toContainText('HQ-C4');
      await expect(total.getByTestId('hq-firmness')).toContainText('no es una medición instrumental');
      await expect(total.getByTestId('hq-defects')).toContainText('Esporulación 2 de 4');
      await expect(total.getByTestId('hq-defects')).toContainText('n = 4 de 7 cosechas evaluadas');
      await expect(total.getByTestId('hq-defects')).not.toContainText('de 5');
      await expect(total.getByTestId('hq-defects')).toHaveAttribute('data-defects-n', '4');
      const flushes = panel.getByTestId('hq-flush');
      await expect(flushes).toHaveCount(3);
      await expect(flushes.nth(0).getByTestId('hq-first-grade')).toContainText('Primera: 40 %');
      await expect(flushes.nth(0).getByTestId('hq-defects')).toHaveAttribute('data-defects-n', '3');
      await expect(flushes.nth(0).getByTestId('hq-defects')).toContainText('n = 3 de 4 cosechas evaluadas');
      await expect(panel.getByTestId('hq-provenance')).not.toContainText('no distingue');
      await expect(flushes.nth(1).getByTestId('hq-first-grade')).toContainText('Datos insuficientes');
      await expect(flushes.nth(1).getByTestId('hq-first-grade')).not.toContainText('%');
      await expect(flushes.nth(2).getByTestId('hq-no-grades')).toBeVisible();
      await expect(panel.getByTestId('hq-provenance')).toContainText('operator_declared_grade');
      await expect(panel.getByTestId('hq-provenance')).toContainText('operator_ordinal_text_anchored');
      const panelInfo = await panel.evaluate((el, fns) => {
        const small = new Function(`return (${fns.smallText})`)();
        const over = new Function(`return (${fns.horizontalOverflow})`)();
        return {
          small: small(el, fns.MIN_TEXT),
          overflow: over(el),
          controls: el.querySelectorAll('button, input, select, textarea, a[href], summary, [role="button"], [tabindex]').length,
        };
      }, { smallText: smallText.toString(), horizontalOverflow: horizontalOverflow.toString(), MIN_TEXT });
      assert.deepEqual(panelInfo.small, [], `${vp.name}: texto del panel < ${MIN_TEXT}px`);
      assert.deepEqual(panelInfo.overflow, [], `${vp.name}: el panel desborda en horizontal`);
      assert.equal(panelInfo.controls, 0, `${vp.name}: el panel es de solo lectura (sin objetivos táctiles)`);

      // ── formulario de cosecha con la sección «Calidad» de #520 ──
      if (!mobile) await page.getByRole('button', { name: 'Ver tabla de bolsas', exact: true }).click();
      await page.getByRole('button', { name: 'Registrar cosecha para la bolsa SDP-HQ1-B01', exact: true }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Registrar cosecha', exact: true });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel('Peso fresco (g)', { exact: true }).fill('430');
      await dialog.getByLabel('Primera (g)', { exact: true }).fill('300');
      await dialog.getByLabel('Segunda (g)', { exact: true }).fill('100');
      await dialog.getByLabel('Descarte (g)', { exact: true }).fill('300');
      await dialog.locator('[data-defect="sporulation"]').click();
      await dialog.getByRole('button', { name: 'Firmeza 3 de 5', exact: true }).click();
      await expect(dialog.getByTestId('harvest-grade-gap')).toBeVisible();

      const geo = await dialog.evaluate((el, fns) => {
        const small = new Function(`return (${fns.smallText})`)();
        const over = new Function(`return (${fns.horizontalOverflow})`)();
        const r = el.getBoundingClientRect();
        const section = el.querySelector('details.harvest-quality');
        const visible = (n) => n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden';
        const targets = [...section.querySelectorAll('button, summary, input')].filter(visible).map((n) => {
          const b = n.getBoundingClientRect();
          return { label: n.getAttribute('aria-label') || n.getAttribute('data-defect') || n.id || n.textContent.trim().slice(0, 24), w: b.width, h: b.height };
        });
        const dialogButtons = [...el.querySelectorAll('button')].filter(visible).map((n) => ({ label: n.getAttribute('aria-label') || n.textContent.trim().slice(0, 24), h: n.getBoundingClientRect().height }));
        const inputs = [...el.querySelectorAll('input, select, textarea')].filter(visible).map((n) => ({ id: n.id || n.name, size: parseFloat(getComputedStyle(n).fontSize) }));
        const save = [...el.querySelectorAll('button')].find((n) => n.textContent.trim() === 'Guardar cosecha');
        const sb = save.getBoundingClientRect();
        return {
          innerHeight: window.innerHeight,
          top: r.top, bottom: r.bottom, height: r.height,
          maxHeight: parseFloat(getComputedStyle(el).maxHeight),
          saveTop: sb.top, saveBottom: sb.bottom,
          targets, dialogButtons, inputs,
          smallSection: small(section, fns.MIN_TEXT),
          smallDialog: small(el, fns.MIN_TEXT),
          overflow: over(el),
        };
      }, { smallText: smallText.toString(), horizontalOverflow: horizontalOverflow.toString(), MIN_TEXT });

      // El diálogo respeta el alto de la pantalla (dvh): su alto y su max-height caben.
      assert.ok(geo.height <= geo.innerHeight + EPS, `${vp.name}: el diálogo mide ${geo.height}px y la pantalla ${geo.innerHeight}px`);
      assert.ok(geo.maxHeight <= geo.innerHeight + EPS, `${vp.name}: max-height ${geo.maxHeight} > alto ${geo.innerHeight}`);
      assert.deepEqual(geo.overflow, [], `${vp.name}: el formulario desborda en horizontal`);
      assert.ok(geo.targets.length >= 12, `${vp.name}: controles de calidad visibles (${geo.targets.length})`);
      geo.targets.forEach((t) => assert.ok(t.h >= MIN_TARGET - EPS, `${vp.name}: «${t.label}» mide ${t.h}px de alto (< ${MIN_TARGET})`));
      geo.dialogButtons.forEach((t) => assert.ok(t.h >= MIN_TARGET - EPS, `${vp.name}: botón «${t.label}» mide ${t.h}px de alto (< ${MIN_TARGET})`));
      // Pisos duros (también para lo ya conocido): ancho de objetivo >= 44 px (piso de FOS,
      // UX V2 §14) y texto >= 14 px (--size-small de ds-2026).
      geo.targets.forEach((t) => assert.ok(t.w >= FOS_FLOOR - EPS, `${vp.name}: «${t.label}» mide ${t.w}px de ancho (< piso de ${FOS_FLOOR})`));
      assert.deepEqual(geo.smallSection.filter((t) => t.size < DS_SMALL_FLOOR), [], `${vp.name}: texto de la sección «Calidad» < ${DS_SMALL_FLOOR}px`);

      // Lo que el formulario de #520 incumple frente al criterio de 16 px / 48 px. No se
      // oculta ni se salta: se fija por formato. Un incumplimiento nuevo falla; uno que
      // desaparece también falla (hay que quitarlo de KNOWN_520_FINDINGS).
      const found = new Set();
      if (geo.top < -EPS || geo.bottom > geo.innerHeight + EPS) found.add(FINDING.dialog);
      if (geo.saveTop < -EPS || geo.saveBottom > geo.innerHeight + EPS) found.add(FINDING.save);
      if (geo.targets.some((t) => t.w < MIN_TARGET - EPS)) found.add(FINDING.width);
      // El zoom al enfocar es de iOS táctil: en escritorio un input de 13 px no cuenta.
      if (mobile && geo.inputs.some((i) => i.size < MIN_TEXT)) found.add(FINDING.input);
      if (geo.smallSection.some((t) => t.size < MIN_TEXT)) found.add(FINDING.text);
      const expected = new Set(KNOWN_520_FINDINGS[vp.name] || []);
      assert.deepEqual([...found].sort(), [...expected].sort(), `${vp.name}: incumplimientos del formulario #520 distintos de los conocidos`);
      found.forEach((f) => console.log(`CONOCIDO ${vp.name}: ${f}`));
      assert.deepEqual(errors, [], `${vp.name}: errores de página`);
      await context.close();
    }
    console.log(`PASS: calidad de cosecha en ${VIEWPORTS.map((v) => v.name).join(', ')}: panel de la ficha con texto >= ${MIN_TEXT} px, solo lectura y sin desborde; formulario de #520 sin desborde, con objetivos >= ${MIN_TARGET} px de alto, diálogo dentro del alto (dvh) y sus incumplimientos conocidos fijados (ver KNOWN_520_FINDINGS).`);
  } finally { await browser?.close(); await new Promise((resolve) => server.close(resolve)); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
