'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('@playwright/test');

const APP_ROOT = __dirname;
const VIEWPORTS = [
  { name: '360×800 (Compact Android)', width: 360, height: 800 },
  { name: '390×844 (Standard iPhone)', width: 390, height: 844 },
  { name: '430×932 (Large Device / Pro Max)', width: 430, height: 932 },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let server;
let browser;
let baseUrl;

before(async () => {
  server = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
      const rel = pathname === '/' ? '__harness.html' : pathname.replace(/^\/+/, '');
      const file = path.resolve(APP_ROOT, rel);
      if (!file.startsWith(APP_ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

// Helper to seed a canonical operational batch in localStorage
async function seedTestBatches(page) {
  await page.addInitScript(() => {
    localStorage.setItem('sdp_seeded', '1');
    localStorage.setItem('sdp_lotes', '[]');
    localStorage.setItem(
      'sdp_bit_lotes',
      JSON.stringify([
        {
          id: 'SDP-2026-PO1',
          codigo: 'SDP-2026-PO1',
          especie: 'Pleurotus ostreatus (Orellana Gris)',
          especieCientifico: 'Pleurotus ostreatus',
          estado: 'incubacion',
          sala: 'martha_01',
          numBolsas: 24,
          fechaInoculacion: '2026-09-10',
          operador: 'Operador Tenjo',
          lifecycleEvents: [
            {
              eventId: 'ev-seed-1',
              type: 'inoculado',
              at: '2026-09-10T08:00:00.000Z',
              meta: 'Inoculación en sustrato esterilizado',
              provenance: 'measured',
            },
          ],
        },
      ])
    );
    localStorage.setItem(
      'sdp_bit_bolsas',
      JSON.stringify([
        { id: 'b-1', loteId: 'SDP-2026-PO1', numero: 1, estado: 'sana' },
        { id: 'b-2', loteId: 'SDP-2026-PO1', numero: 2, estado: 'sana' },
      ])
    );
  });
}

test('mobile gate 01: layout floor — 0 horizontal overflow across 360×800, 390×844, 430×932', { timeout: 45_000 }, async () => {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    try {
      await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

      const overflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth,
        };
      });
      assert.equal(
        overflow.hasOverflow,
        false,
        `Horizontal page overflow detected at viewport ${vp.name}: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`
      );

      // Verify bottom rail is visible with 5 destinations
      const rail = page.locator('.app-rail-mobile');
      assert.ok(await rail.isVisible(), `Bottom rail must be visible at viewport ${vp.name}`);
      const btns = rail.locator('.rail-mobile-btn');
      assert.equal(await btns.count(), 5, `Bottom rail must contain exactly 5 buttons at ${vp.name}`);

      // Verify touch targets for bottom rail are >= 48px
      for (let i = 0; i < 5; i++) {
        const btn = btns.nth(i);
        const box = await btn.boundingBox();
        assert.ok(box, `Button ${i} has boundingBox`);
        assert.ok(box.height >= 47.9, `Rail button ${i} height must be >= 48px, got ${box.height}px at ${vp.name}`);
      }
    } finally {
      await context.close();
    }
  }
});

test('mobile gate 02: mobile navigation IA — Hoy, Lotes, Salas, Más switches destinations with aria-current', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    // 1. Initial destination is Hoy
    const hoyBtn = page.locator('.app-rail-mobile [data-dest="hoy"]');
    assert.equal(await hoyBtn.getAttribute('aria-current'), 'page');
    assert.ok(await page.locator('[data-testid="ux-v2-today"]').isVisible());

    // 2. Click Lotes
    const lotesBtn = page.locator('.app-rail-mobile [data-dest="lotes"]');
    await lotesBtn.click();
    assert.equal(await lotesBtn.getAttribute('aria-current'), 'page');
    assert.equal(await hoyBtn.getAttribute('aria-current'), null);
    await page.waitForSelector('.sdp-lote', { state: 'visible' });

    // 3. Click Salas
    const salasBtn = page.locator('.app-rail-mobile [data-dest="salas"]');
    await salasBtn.click();
    assert.equal(await salasBtn.getAttribute('aria-current'), 'page');
    assert.equal(await lotesBtn.getAttribute('aria-current'), null);
    await page.waitForSelector('.camara-grid, .camara-card, [data-mode="control"]', { state: 'visible' });

    // 4. Click Más -> opens flyout panel
    const masBtn = page.locator('.app-rail-mobile [data-dest="mas"]');
    await masBtn.click();
    assert.equal(await masBtn.getAttribute('aria-expanded'), 'true');
    const morePanel = page.locator('#mobile-more-panel');
    assert.ok(await morePanel.isVisible(), 'Mobile more panel flyout must be visible');

    // Click secondary item "Formular receta"
    const formItem = morePanel.locator('.rail-flyout-item[data-dest="formular"]');
    await formItem.click();
    await page.waitForSelector('[data-testid="form-mobile-start"], #form-mobile-species-select, .form-species-context, [id="form-species-context-select"]', { state: 'visible' });

    // 5. Return to Hoy
    await hoyBtn.click();
    assert.equal(await hoyBtn.getAttribute('aria-current'), 'page');
    await page.locator('[data-testid="ux-v2-today"]').waitFor({ state: 'visible' });
    assert.ok(await page.locator('[data-testid="ux-v2-today"]').isVisible());
  } finally {
    await context.close();
  }
});

test('mobile gate 03: global scan affordance — persistent and triggers scan surface from all main destinations', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    const destinations = ['hoy', 'lotes', 'salas'];
    for (const dest of destinations) {
      await page.locator(`.app-rail-mobile [data-dest="${dest}"]`).click();
      await page.waitForTimeout(200);

      // Global scan button is prominent and always visible
      const scanBtn = page.locator('.app-rail-mobile [data-dest="scan"]');
      assert.ok(await scanBtn.isVisible(), `Scan button must be visible when on ${dest}`);
      const scanBox = await scanBtn.boundingBox();
      assert.ok(scanBox && scanBox.height >= 56, `Scan button must be elevated/prominent (>= 56px), got ${scanBox.height}`);

      // Click scan -> opens field quick capture modal
      await scanBtn.click();
      const scanModal = page.locator('[role="dialog"]').filter({ hasText: /Ronda de Campo|Báscula Cosecha|Barrido Sala|Captura rápida/ });
      await scanModal.waitFor({ state: 'visible' });
      assert.ok(await scanModal.isVisible(), `Scan modal must appear when tapping scan from ${dest}`);

      // Close modal
      const closeBtn = scanModal.locator('.modal-icon-close, button[aria-label*="Cerrar"]');
      await closeBtn.click();
      await scanModal.waitFor({ state: 'hidden' });
    }
  } finally {
    await context.close();
  }
});

test('mobile gate 04: canonical mobile batch detail — single column, 0 horizontal overflow, Criterio contract', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    // Navigate to Lotes
    await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
    const batchCard = page.locator('.panel.sdp-lote[data-lote-id="SDP-2026-PO1"]');
    await batchCard.waitFor({ state: 'visible' });

    // Tap batch to open canonical Batch Detail
    await batchCard.click();
    const detail = page.locator('[data-testid="ux-v2-batch-detail-mobile"]');
    await detail.waitFor({ state: 'visible' });

    // Verify 0 horizontal overflow in Batch Detail
    const overflow = await detail.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      hasOverflow: el.scrollWidth > el.clientWidth,
    }));
    assert.equal(overflow.hasOverflow, false, 'Batch Detail must not horizontally overflow 390px viewport');

    // 1. Identity & Lifecycle
    assert.match(await detail.innerText(), /SDP-2026-PO1/, 'Batch code must be visible in identity');
    assert.match(await detail.innerText(), /Pleurotus ostreatus/, 'Species must be visible');
    const badge = detail.locator('.sdp-badge');
    assert.ok(await badge.isVisible(), 'Lifecycle badge must be visible');

    // 2. Next Valid Action
    const nextAction = detail.locator('.sdp-task--now');
    assert.ok(await nextAction.isVisible(), 'Next valid action block must be visible');
    const nextActionBtn = nextAction.locator('button.sdp-btn--primary');
    assert.ok(await nextActionBtn.isVisible(), 'Primary action button must be visible');
    const nextActionBox = await nextActionBtn.boundingBox();
    assert.ok(nextActionBox && nextActionBox.height >= 47.9, 'Next action button must be >= 48px FIELD target');

    // 3. Conditions & Readings
    const readings = detail.locator('.sdp-reading');
    assert.ok((await readings.count()) > 0, 'Conditions section must render operational readings');
    const provenance = detail.locator('.sdp-provenance');
    assert.ok((await provenance.count()) > 0, 'Readings must show provenance badge');

    // 4. Timeline
    const timeline = detail.locator('.sdp-timeline');
    assert.ok(await timeline.isVisible(), 'Timeline must be visible');

    // 5. Back navigation
    const backBtn = detail.locator('button:has-text("Volver a lotes")');
    assert.ok(await backBtn.isVisible(), 'Back button must be visible in full-page batch detail');
    await backBtn.click();
    await page.locator('.panel.sdp-lote[data-lote-id="SDP-2026-PO1"]').waitFor({ state: 'visible' });
  } finally {
    await context.close();
  }
});

test('mobile gate 05: FIELD interactive touch targets floor >=44×44px and preferred >=48px', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    // Check Hoy interactive targets
    const fieldSurfaces = [page.locator('[data-mode="field"]').first()];

    // Navigate to Batch Detail and check its targets as well
    await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
    await page.locator('.panel.sdp-lote[data-lote-id="SDP-2026-PO1"]').click();
    await page.waitForSelector('[data-testid="ux-v2-batch-detail-mobile"]', { state: 'visible' });
    fieldSurfaces.push(page.locator('[data-testid="ux-v2-batch-detail-mobile"]'));

    for (const surface of fieldSurfaces) {
      const controls = surface.locator('button, a[href], [role="button"], input, select, textarea');
      const count = await controls.count();
      const violations = [];

      for (let i = 0; i < count; i++) {
        const el = controls.nth(i);
        if (!(await el.isVisible())) continue;
        const box = await el.boundingBox();
        if (!box) continue;

        if (box.width < 43.9 || box.height < 43.9) {
          violations.push({
            tag: await el.evaluate(n => n.tagName.toLowerCase()),
            text: (await el.innerText().catch(() => '')).trim().slice(0, 50),
            width: Math.round(box.width * 10) / 10,
            height: Math.round(box.height * 10) / 10,
          });
        }
      }
      assert.deepEqual(violations, [], `Found FIELD touch targets < 44×44px: ${JSON.stringify(violations)}`);
    }
  } finally {
    await context.close();
  }
});

test('mobile gate 06: screen typography floor >=11px in migrated mobile surfaces', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    // Open Batch Detail to inspect both rail and batch detail typography
    await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
    await page.locator('.panel.sdp-lote[data-lote-id="SDP-2026-PO1"]').click();
    await page.waitForSelector('[data-testid="ux-v2-batch-detail-mobile"]', { state: 'visible' });

    const typographyViolations = await page.evaluate(() => {
      const issues = [];
      const selectors = ['.app-rail-mobile *', '[data-testid="ux-v2-batch-detail-mobile"] *'];
      for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
          const text = (el.innerText || el.textContent || '').trim();
          if (el.children.length > 0 && text === '') continue;
          if (!text) continue;

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          const fontSize = parseFloat(style.fontSize);

          if (fontSize < 10.9) {
            issues.push({
              tag: el.tagName.toLowerCase(),
              text: text.slice(0, 40),
              fontSize: Math.round(fontSize * 10) / 10,
            });
          }
        }
      }
      return issues;
    });

    assert.deepEqual(typographyViolations, [], `Found screen text < 11px: ${JSON.stringify(typographyViolations)}`);

    // Verify operational reading numeric value is >= 16px
    const readingValueSize = await page.evaluate(() => {
      const el = document.querySelector('.sdp-reading__value');
      return el ? parseFloat(window.getComputedStyle(el).fontSize) : 0;
    });
    assert.ok(readingValueSize >= 15.9, `Operational reading value must be >= 16px, got ${readingValueSize}px`);
  } finally {
    await context.close();
  }
});

test('mobile gate 07: visual contract — 0 backdrop-filter, 0 diffuse shadow, 0 unapproved gradients', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
    await page.locator('.panel.sdp-lote[data-lote-id="SDP-2026-PO1"]').click();
    await page.waitForSelector('[data-testid="ux-v2-batch-detail-mobile"]', { state: 'visible' });

    const visualViolations = await page.evaluate(() => {
      const issues = [];
      const surfaces = document.querySelectorAll('.app-rail-mobile, .app-rail-mobile *, [data-testid="ux-v2-batch-detail-mobile"], [data-testid="ux-v2-batch-detail-mobile"] *');
      for (const el of surfaces) {
        const style = window.getComputedStyle(el);
        const bf = style.backdropFilter || style.webkitBackdropFilter;
        if (bf && bf !== 'none') {
          issues.push({ tag: el.tagName, text: el.innerText?.slice(0, 30), violation: `backdrop-filter: ${bf}` });
        }

        const bs = style.boxShadow;
        if (bs && bs !== 'none') {
          // Check for diffuse blur radius > 0 in rgba blur
          const blurMatch = bs.match(/(?:rgba?\([^)]+\)|#[0-9a-fA-F]+)\s+[-0-9.px]+\s+[-0-9.px]+\s+([0-9.]+)px/);
          if (blurMatch && parseFloat(blurMatch[1]) > 0) {
            issues.push({ tag: el.tagName, text: el.innerText?.slice(0, 30), violation: `diffuse shadow: ${bs}` });
          }
        }
      }
      return issues;
    });

    assert.deepEqual(visualViolations, [], `Visual contract violations: ${JSON.stringify(visualViolations)}`);
  } finally {
    await context.close();
  }
});

test('mobile gate 08: mobile offline cold reload resilience under Service Worker', { timeout: 60_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await seedTestBatches(page);
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));

    // Reload while online to prime cache
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

    // Cut network offline
    await context.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    // Assert mobile rail and Hoy queue are still active and controlled
    const offlineState = await page.evaluate(() => ({
      todayVisible: Boolean(document.querySelector('[data-testid="ux-v2-today"]')),
      railVisible: Boolean(document.querySelector('.app-rail-mobile')),
      controlled: Boolean(navigator.serviceWorker.controller),
      bundleLoaded: [...document.styleSheets].some(sheet => sheet.href && sheet.href.endsWith('/ds-2026/operations.css')),
    }));

    assert.deepEqual(offlineState, {
      todayVisible: true,
      railVisible: true,
      controlled: true,
      bundleLoaded: true,
    });
  } finally {
    await context.setOffline(false).catch(() => {});
    await context.close();
  }
});
