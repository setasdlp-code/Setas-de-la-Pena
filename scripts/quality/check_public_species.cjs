'use strict';
// Species notebook regressions: plate controls, shared fragments and progressive enhancement.
// Use the ordinary public source server, or SETAS_WEBSITE_BASE_URL for a local export.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const { chromium } = require(path.join(root, 'field-os-simulador/setas-os/node_modules/@playwright/test'));
const base = (process.env.SETAS_WEBSITE_BASE_URL || 'http://127.0.0.1:4187/').replace(/\/?$/, '/');
const out = process.env.SETAS_SPECIES_AUDIT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'setas-species-'));
fs.mkdirSync(out, { recursive: true });
const species = ['shiitake', 'melena-de-leon', 'eryngii'];
const report = { base, layouts: [], checks: [], browserErrors: [] };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.browserErrors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.browserErrors.push(`${response.status()} ${response.url()}`); });
    for (const slug of species) {
      for (const width of [320, 390, 768, 1000, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(base + `especies/${slug}`, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
        });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug} overflow ${width}`);
        assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.src)), []);
        const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
        assert.equal(ids.length, new Set(ids).size, `${slug} duplicate IDs`);
        const localLinks = await page.locator('a[href^="#"]').evaluateAll(nodes => nodes.map(node => decodeURIComponent(node.getAttribute('href').slice(1))));
        localLinks.forEach(id => assert.ok(ids.includes(id), `${slug}: missing #${id}`));
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('.editorial-other').count(), 2);
        assert.equal(await page.locator('.editorial-plate [data-plate-note]:visible').count(), 1);

        for (const index of [0, 1, 2]) {
          const point = page.locator('.editorial-plate [data-point]').nth(index);
          await point.focus();
          await page.keyboard.press('Enter');
          assert.equal(await point.getAttribute('aria-pressed'), 'true');
          const target = await point.getAttribute('aria-controls');
          assert.equal(await page.locator('.editorial-plate [data-plate-note]:visible').getAttribute('id'), target);
          const bounds = await point.boundingBox();
          assert.ok(bounds.width >= 44 && bounds.height >= 44, `${slug} small plate control`);
          assert.ok(await point.evaluate(node => getComputedStyle(node).outlineStyle !== 'none'), 'keyboard focus visible');
        }
        if ([390, 1440].includes(width)) {
          await page.goto(base + `especies/${slug}`, { waitUntil: 'networkidle' });
          await page.screenshot({ path: path.join(out, `${slug}-${width}.png`), fullPage: true });
        }

        const conservation = page.locator('.editorial-toc a[href="#conservacion"]');
        await conservation.focus();
        await page.keyboard.press('Enter');
        await page.waitForURL('**#conservacion');
        await page.waitForFunction(() => document.querySelector('#conservacion').getBoundingClientRect().top >= document.querySelector('.editorial-toc').getBoundingClientRect().bottom - 1);
        await page.locator('.hero-lead a[href^="#fuente-"]').first().focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#fuentes').evaluate(node => node.open), true, 'citation opens references');
        await page.locator('#fuentes > summary').click();
        await page.locator('.editorial-toc a[href="#fuentes"]').click();
        assert.equal(await page.locator('#fuentes').evaluate(node => node.open), true, 'same fragment opens references again');

        const previousDetails = await page.locator('details').evaluateAll(nodes => nodes.map(node => node.open));
        const previousPlate = await page.locator('[data-plate-note]').evaluateAll(nodes => nodes.map(node => node.hidden));
        await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
        assert.equal(await page.locator('details:not([open])').count(), 0);
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('.editorial-plate [data-plate-note]:visible').count(), 3, 'paper contains every plate note');
        assert.ok(await page.locator('#fuentes ol').isVisible());
        assert.equal(await page.locator('.editorial-utility').isVisible(), false);
        await page.emulateMedia({ media: 'screen' });
        await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
        assert.deepEqual(await page.locator('details').evaluateAll(nodes => nodes.map(node => node.open)), previousDetails);
        assert.deepEqual(await page.locator('[data-plate-note]').evaluateAll(nodes => nodes.map(node => node.hidden)), previousPlate);
        report.layouts.push({ slug, width, result: 'passed' });
      }
      for (const fragment of ['identidad', 'vida', 'curiosidades', 'fuente-1', 'fuentes-title', 'explore-title']) {
        await page.goto(base + `especies/${slug}#${fragment}`, { waitUntil: 'networkidle' });
        assert.ok(await page.locator(`#${fragment}`).isVisible(), `${slug} old #${fragment}`);
        await page.waitForFunction(id => document.getElementById(id).getBoundingClientRect().top >= document.querySelector('.editorial-toc').getBoundingClientRect().bottom - 1, fragment);
      }
      const recipeLink = page.locator('.editorial-recipe-entry');
      const recipe = await recipeLink.getAttribute('href');
      await recipeLink.click();
      assert.equal(new URL(page.url()).pathname + new URL(page.url()).hash, recipe);
      assert.ok(await page.locator(new URL(page.url()).hash).isVisible(), 'featured recipe opens its preparation');
      report.checks.push({ slug, type: 'legacy-fragments-and-featured-recipe', result: 'passed' });
    }
    await context.close();

    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const staticPage = await staticContext.newPage();
    for (const slug of species) {
      await staticPage.goto(base + `especies/${slug}`, { waitUntil: 'networkidle' });
      assert.equal(await staticPage.locator('.editorial-plate [data-plate-note]:visible').count(), 3);
      assert.equal(await staticPage.locator('[data-point]:visible').count(), 0);
      assert.equal(await staticPage.locator('#print-editorial').isVisible(), false);
      assert.equal(await staticPage.locator('details:not([open])').count(), 0, 'full reference text starts open without JS');
      await staticPage.emulateMedia({ media: 'print' });
      assert.ok(await staticPage.locator('#fuentes ol').isVisible());
      assert.ok(await staticPage.locator('.taxonomy dd').first().isVisible());
      // «Lo que se investiga» vive en /mundo-micelar (decisión del 8 nov; revisión de marca 23 nov, n.º 7).
      assert.equal(await staticPage.locator('.research-section, #investigacion').count(), 0);
      assert.ok(await staticPage.locator('#fuentes a[href="/mundo-micelar#investigacion"]').isVisible());
      await staticPage.pdf({ path: path.join(out, `${slug}-without-js.pdf`), format: 'A4', printBackground: true });
      await staticPage.emulateMedia({ media: 'screen' });
      assert.ok(await staticPage.locator('.editorial-recipe-entry').isVisible());
      report.checks.push({ slug, type: 'without-javascript', result: 'passed' });
    }
    await staticContext.close();
    assert.deepEqual(report.browserErrors, []);
    report.result = 'passed';
    fs.writeFileSync(path.join(out, 'species-verification.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ result: report.result, layouts: report.layouts.length, checks: report.checks.length, browserErrors: report.browserErrors.length, out }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
