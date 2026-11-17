'use strict';
// Functional regression coverage for the species reading and navigation layout.
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../field-os-simulador/setas-os/node_modules/@playwright/test'));
const base = process.env.SETAS_WEBSITE_BASE_URL || 'http://127.0.0.1:4187';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  let checked = 0;
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      for (const slug of ['shiitake', 'melena-de-leon', 'eryngii']) {
        await page.goto(`${base}/especies/${slug}`, { waitUntil: 'networkidle' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${slug}: horizontal overflow at ${width}`);
        await page.locator('#print-editorial').focus();
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), '#cocina', `${slug}: section navigation comes first for keyboard users`);
        const links = page.locator('.editorial-toc a');
        for (const link of await links.all()) {
          const href = await link.getAttribute('href');
          assert.equal(await page.locator(href).count(), 1, `${slug}: unique destination for ${href}`);
          await link.click();
          const geometry = await page.evaluate((selector) => ({ target: document.querySelector(selector).getBoundingClientRect().top, toc: document.querySelector('.editorial-toc').getBoundingClientRect().bottom }), href);
          assert.ok(geometry.target >= geometry.toc - 1, `${slug}: ${href} is not covered by sticky navigation at ${width}`);
          assert.ok(geometry.target < 900, `${slug}: ${href} is visible after navigation at ${width}`);
        }
        await page.evaluate(() => scrollTo(0, 2500));
        const toc = await page.locator('.editorial-toc').boundingBox();
        assert.ok(toc.y >= 0 && toc.y <= 12, `${slug}: section navigation remains available while reading`);
        const positions = await page.evaluate(() => ({ register: document.querySelector('.editorial-register').getBoundingClientRect().top + scrollY, reading: document.querySelector('.editorial-reading').getBoundingClientRect().top + scrollY }));
        if (width <= 650) assert.ok(positions.register < positions.reading, `${slug}: practical summary precedes essay`);
        if (width <= 1000) {
          await page.locator('.menu-toggle').click();
          assert.equal(await page.locator('#primary-nav').isVisible(), true);
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#primary-nav').isVisible(), false);
          assert.equal(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement), true);
        }
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('.editorial-toc').isVisible(), false);
        assert.equal(await page.locator('#print-editorial').isVisible(), false);
        assert.equal(await page.locator('.editorial-reading').isVisible(), true);
        await page.emulateMedia({ media: 'screen' });
        checked++;
      }
      await page.close();
    }
    const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 768, height: 900 } });
    for (const slug of ['shiitake', 'melena-de-leon', 'eryngii']) {
      await noJs.goto(`${base}/especies/${slug}`);
      assert.equal(await noJs.locator('#primary-nav').isVisible(), true);
      assert.equal(await noJs.locator('.editorial-toc').isVisible(), true);
      assert.equal(await noJs.locator('#print-editorial').isVisible(), false);
    }
    await noJs.close();
    console.log(`PASS: ${checked} species/viewport journeys; keyboard, section targets, sticky navigation, summary order, tablet menu, print and no-JS fallback`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
