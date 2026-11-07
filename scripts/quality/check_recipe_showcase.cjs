'use strict';
// Browse, choose, share, print and recover without JavaScript. No production writes.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const {chromium} = require(path.resolve(__dirname, '../../field-os-simulador/setas-os/node_modules/@playwright/test'));
const base = process.env.SETAS_WEBSITE_BASE_URL || 'http://127.0.0.1:4187/';
const output = process.env.SETAS_SHOWCASE_AUDIT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'setas-showcase-'));
const routes = [['recetas', 9], ['recetas-melena', 7], ['recetas-eryngii', 6]];
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)});
  const errors = [], checks = [];
  try {
    const context = await browser.newContext({reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({width, height:1000});
      for (const [route, count] of routes) {
        await page.goto(base + route, {waitUntil:'networkidle'});
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('.recipe-preview').count(), count);
        assert.equal(await page.locator('.recipe:visible').count(), 0, 'browse shows previews, not full forms');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const search = page.getByRole('searchbox', {name:'Buscar una receta'});
        await search.fill('zzzinexistente');
        assert.equal(await page.locator('.recipe-preview:visible').count(), 0);
        assert.equal(await page.locator('.recipe-empty').isVisible(), true);
        await page.reload({waitUntil:'networkidle'});
        assert.equal(await search.inputValue(), 'zzzinexistente', 'search survives reload through URL');
        await page.getByRole('button', {name:'Ver todas las recetas', exact:true}).click();
        await search.fill('limon');
        assert.ok(await page.locator('.recipe-preview:visible').count() > 0, 'accent-insensitive ingredient lookup');
        await search.fill('');
        const links = await page.locator('.recipe-preview').evaluateAll(nodes => nodes.map(a => a.getAttribute('href')));
        await page.locator('.recipe-preview').first().focus();
        await page.keyboard.press('Enter');
        await page.waitForURL('**' + links[0]);
        assert.equal(await page.locator('.recipe:visible').count(), 1);
        assert.equal(await page.locator(`${links[0]} .recipe-details`).evaluate(el => el.open), true);
        assert.equal(await page.locator('.recipe').evaluateAll(nodes => nodes.filter(el => el === document.activeElement).length), 1, 'keyboard focus reaches selected recipe');
        if (route === 'recetas') assert.equal(await page.locator(`${links[0]} .recipe-focus-safety`).isVisible(), true);
        await page.locator('.recipe-switcher select').selectOption(links.at(-1).slice(1));
        await page.waitForURL('**' + links.at(-1));
        assert.equal(await page.locator('.recipe:visible').getAttribute('id'), links.at(-1).slice(1));
        await page.goBack({waitUntil:'networkidle'});
        assert.equal(new URL(page.url()).hash, links[0]);
        const states = await page.locator('details').evaluateAll(nodes => nodes.map(el => el.open));
        await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
        await page.emulateMedia({media:'print'});
        assert.equal(await page.locator('.recipe:visible').count(), 1, 'focused printing includes only this dish');
        assert.equal(await page.locator('.recipe-gallery').isVisible(), false);
        await page.emulateMedia({media:'screen'});
        await page.evaluate(() => dispatchEvent(new Event('afterprint')));
        assert.deepEqual(await page.locator('details').evaluateAll(nodes => nodes.map(el => el.open)), states);
        await page.locator('.recipe-browse-link').click();
        assert.equal(await page.locator('.recipe-gallery').isVisible(), true);
        assert.equal(await page.locator('#print-recipes').textContent(), 'Imprimir recetas');
        await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
        await page.emulateMedia({media:'print'});
        assert.equal(await page.locator('.recipe:visible').count(), count, 'browse printing includes all dishes');
        await page.emulateMedia({media:'screen'});
        await page.evaluate(() => dispatchEvent(new Event('afterprint')));
        assert.equal(await page.locator('.recipe:visible').count(), 0);
        checks.push({route, width, count, result:'passed'});
      }
    }
    await page.goto(base + 'recetas?recipe=receta-patacones&scale=3#receta-patacones', {waitUntil:'networkidle'});
    assert.equal(await page.locator('#receta-patacones input[value="3"]').isChecked(), true);
    await page.locator('.recipe-switcher select').selectOption('receta-sopa');
    await page.waitForURL('**#receta-sopa');
    assert.equal(new URL(page.url()).searchParams.has('scale'), false, 'switching dishes clears stale shared scale');
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('#receta-sopa input[value="1"]').isChecked(), true);
    const noJS = await browser.newContext({javaScriptEnabled:false, viewport:{width:390,height:900}});
    const staticPage = await noJS.newPage();
    for (const [route,count] of routes) {
      await staticPage.goto(base + route, {waitUntil:'networkidle'});
      assert.equal(await staticPage.locator('.recipe:visible').count(), count);
      assert.equal(await staticPage.locator('.recipe-scale:visible').count(), 0);
    }
    await noJS.close();
    assert.deepEqual(errors, []);
    fs.mkdirSync(output, {recursive:true});
    fs.writeFileSync(path.join(output, 'showcase-audit.json'), JSON.stringify({checks, errors, sharedScale:'passed', noJS:'passed'},null,2));
    console.log(JSON.stringify({result:'passed', checks:checks.length, sharedScale:'passed', noJS:'passed', errors:errors.length, output}));
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
