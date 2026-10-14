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
const files = ['index.html', 'home.html', 'shiitake.html', 'recetas.html', 'manual.html', 'typography.html'];
const report = { base, checks: [], errors: [], screenshots: [] };
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'export-audit.json')));
  for (const entry of manifest.files) {
    assert.equal(sha(path.join(publicDir, entry.file)), entry.sha256, entry.file);
    assert.ok(!/(^|\/)(config|node_modules|\.git)(\/|$)/.test(entry.file));
  }
  report.checks.push({ type: 'export-hashes', files: manifest.files.length, result: 'passed' });
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
          const target = path.join(publicDir, decodeURIComponent(url.pathname));
          assert.ok(fs.existsSync(target), link);
          if (url.hash && target.endsWith('.html')) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), link);
        }
        report.checks.push({ type: 'responsive-assets-links', file, width, result: 'passed' });
      }
    }
    await page.goto(base + 'home.html?pairing=bricolage#para-chefs');
    await page.locator('#para-chefs a[href*="recetas.html"]').click();
    await page.locator('#receta-arepa input[value="3"]').check();
    await page.locator('#receta-arepa .recipe-cta a').click();
    assert.equal(await page.locator('#order-quantity').inputValue(), '900');
    assert.equal(await page.locator('input[value="restaurante"]').isChecked(), true);
    await page.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await page.locator('.purchase-submit').click();
    assert.match(await page.locator('#order-message').inputValue(), /900 g/);
    assert.match(await page.locator('#order-message').inputValue(), /mi restaurante/);
    assert.equal(await page.locator('#order-whatsapp').isVisible(), false);
    await page.locator('.masthead .wordmark').click();
    assert.equal(new URL(page.url()).pathname, '/home.html');
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
