import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.SB_PLAYWRIGHT_PATH || 'playwright');
const base = process.env.SB_PREVIEW_URL;
if (!base) throw new Error('Define SB_PREVIEW_URL apuntando al directorio mockups servido por HTTP.');
const browser = await chromium.launch();
try {
  for (const width of [320, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const file of ['home', 'product', 'editorial', 'traceability']) {
      await page.goto(`${base}/${file}.html`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('nav [aria-current="page"]').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${file}: overflow ${width}`);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'sb-skip-link');
      if (file === 'home') {
        await page.getByRole('button', { name: 'Melena de león', exact: true }).click();
        assert.equal(await page.locator('[data-species]:visible').count(), 1);
        assert.equal(await page.locator('[data-species]:visible').getAttribute('data-species'), 'melena');
        await page.getByRole('button', { name: 'Todas', exact: true }).click();
        assert.equal(await page.locator('[data-species]:visible').count(), 4);
      }
      if (file === 'product') {
        await page.locator('input[value="500 g"]').focus();
        await page.keyboard.press('Space');
        await page.getByRole('button', { name: 'Ver mi selección' }).click();
        assert.match(await page.locator('#seleccion').innerText(), /500 g/);
        assert.match(await page.locator('#seleccion').innerText(), /No se ha enviado/);
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.sb-btn').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS ${width}px: navegación, contenido, recursos, filtros, selección con teclado, movimiento reducido`);
  }
} finally { await browser.close(); }
