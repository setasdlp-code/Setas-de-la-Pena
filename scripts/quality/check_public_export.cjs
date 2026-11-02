'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const { chromium } = require(path.join(root, 'field-os-simulador/setas-os/node_modules/@playwright/test'));
const output = process.env.SETAS_EXPORT_AUDIT_DIR || '/workspace/reports/cloudflare-setas';
const publicDir = process.env.SETAS_EXPORT_DIR || path.join(output, 'public');
const base = process.env.SETAS_EXPORT_BASE_URL || 'http://127.0.0.1:4188/';
const files = ['setas.html', 'cocina.html', 'restaurantes.html', 'mundo-micelar.html', 'index.html', 'home.html', 'shiitake.html', 'recetas.html', 'recetas-eryngii.html', 'recetas-melena.html', 'manual.html', 'typography.html',
  'especies/shiitake.html', 'especies/melena-de-leon.html', 'especies/eryngii.html',
  '08_brand/ds-2026/mockups/market/17-culinary-market.html',
  '08_brand/ds-2026/brand-kit/index.html'];
const report = { base, checks: [], errors: [], screenshots: [] };
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'export-audit.json')));
  for (const entry of manifest.files) {
    assert.equal(sha(path.join(publicDir, entry.file)), entry.sha256, entry.file);
    assert.ok(!/(^|\/)(config|node_modules|\.git)(\/|$)/.test(entry.file));
  }
  report.checks.push({ type: 'export-hashes', files: manifest.files.length, result: 'passed' });
  for (const required of ['pilot-log.js', 'pilot-log-render.js']) assert.ok(manifest.files.some(entry => entry.source === required), `export includes ${required}`);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of files) {
        await page.goto(base + file, { waitUntil: 'networkidle' });
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })); });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file} overflow ${width}`);
        assert.deepEqual(await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src)), []);
        const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.href));
        for (const link of links) {
          const url = new URL(link);
          if (!url.href.startsWith(base)) continue;
          const cleanFiles = { '/': 'index.html', '/home': 'home.html', '/setas':'setas.html', '/cocina':'cocina.html', '/restaurantes':'restaurantes.html', '/mundo-micelar':'mundo-micelar.html', '/shiitake': 'shiitake.html', '/recetas': 'recetas.html', '/recetas-eryngii': 'recetas-eryngii.html', '/recetas-melena': 'recetas-melena.html', '/manual': 'manual.html', '/typography': 'typography.html', ...Object.fromEntries(['shiitake', 'melena-de-leon', 'eryngii'].map(slug => [`/especies/${slug}`, `especies/${slug}.html`])) };
          const target = path.join(publicDir, cleanFiles[url.pathname] || decodeURIComponent(url.pathname));
          assert.ok(fs.existsSync(target), link);
          if (url.hash && target.endsWith('.html')) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), link);
        }
        report.checks.push({ type: 'responsive-assets-links', file, width, result: 'passed' });
      }
    }
    await page.goto(base + 'index.html', { waitUntil: 'networkidle' });
    await page.locator('[data-canonical-resource="ds"]').click();
    assert.ok(new URL(page.url()).pathname.endsWith('/mockups/market/17-culinary-market.html'));
    assert.equal(await page.locator('.sdp-ingredient-sheet').count(), 1);
    assert.equal(await page.locator('.sdp-editorial-card').count(), 2);
    report.checks.push({ type: 'canonical-culinary-ds', result: 'passed' });
    await page.goto(base + 'manual.html', { waitUntil: 'networkidle' });
    await page.locator('[data-canonical-resource="manual"]').click();
    assert.ok(new URL(page.url()).pathname.endsWith('/brand-kit/index.html'));
    // Since #436 the manual shows the original firma and the horizontal emblem instead of the Gaya signature switcher.
    for (const src of ['assets/firma-setas-de-la-pena-original.png', 'assets/emblema-horizontal-original.svg']) {
      const firma = page.locator(`#firma img[src="${src}"]`);
      await firma.evaluate(img => img.decode());
      assert.ok(await firma.evaluate(img => img.naturalWidth > 0), src);
    }
    assert.equal(await page.locator('#print-kit').isVisible(), true);
    report.checks.push({ type: 'canonical-brand-manual', result: 'passed', firma: 'original' });
    await page.goto(base + 'home.html?pairing=bricolage#para-chefs');
    await page.locator('#para-chefs a[href*="/recetas"]').click();
    await page.locator('#receta-arepa input[value="3"]').check();
    await page.locator('#receta-arepa .recipe-cta a').click();
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('#order-quantity').inputValue(), '900');
    assert.equal(await page.locator('input[value="restaurante"]').isChecked(), true);
    await page.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await page.locator('.purchase-submit').click();
    assert.match(await page.locator('#order-message').inputValue(), /900 g/);
    assert.match(await page.locator('#order-message').inputValue(), /un servicio de cocina/);
    assert.equal(await page.locator('#order-whatsapp').isVisible(), false);
    await page.locator('.masthead .wordmark').click();
    assert.equal(new URL(page.url()).pathname, '/home');
    assert.equal(new URL(page.url()).searchParams.get('pairing'), 'bricolage');
    report.checks.push({ type: 'export-chef-journey', result: 'passed', grams: 900, purpose: 'restaurante', messageSent: false, homeMapping: true });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + 'home.html', { waitUntil: 'networkidle' });
      await page.evaluate(async () => { await document.fonts.ready; window.scrollTo({ top: 0, behavior: 'instant' }); });
      const file = `export-portada-${width}.png`;
      await page.screenshot({ path: path.join(output, file) });
      report.screenshots.push({ file, width, url: page.url(), sha256: sha(path.join(output, file)) });
    }
    assert.deepEqual(report.errors, []);
    fs.writeFileSync(path.join(output, 'export-verification.json'), JSON.stringify(report, null, 2)+'\n');
    console.log(JSON.stringify({ result: 'passed', checks: report.checks.length, errors: report.errors.length }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
