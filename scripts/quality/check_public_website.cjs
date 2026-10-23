'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const { chromium } = require(path.join(root, 'field-os-simulador/setas-os/node_modules/@playwright/test'));
const out = process.env.SETAS_WEBSITE_AUDIT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'setas-public-website-'));
fs.mkdirSync(out, { recursive: true });
const base = (process.env.SETAS_WEBSITE_BASE_URL || 'http://127.0.0.1:4187/').replace(/\/?$/, '/');
const report = { capturedAt: new Date().toISOString(), baseline: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), checks: [], renders: [], browserErrors: [], syntheticFixtures: 'Solo en rutas interceptadas del navegador de prueba; sin modificar commercial-data.js ni enviar mensajes.' };
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
  try {
    async function contextWith(data, options = {}) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
      if (data !== undefined) await context.route('**/commercial-data.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.SetasCommerce = ${JSON.stringify(data)};` }));
      context.on('page', page => {
        page.on('pageerror', error => report.browserErrors.push(error.message));
        page.on('response', response => { if (response.status() >= 400) report.browserErrors.push(`${response.status()} ${response.url()}`); });
        page.on('requestfailed', request => report.browserErrors.push(`${request.failure()?.errorText} ${request.url()}`));
      });
      return context;
    }
    async function visit(page, file) {
      await page.goto(base + file, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
        document.activeElement?.blur();
      });
      await page.mouse.move(1439, 999);
    }
    async function capture(page, filename, selector) {
      await page.evaluate(() => document.activeElement?.blur());
      await page.mouse.move(1439, 999);
      const target = path.join(out, filename);
      const initialViewport = page.viewportSize();
      if (selector) {
        const bounds = await page.locator(selector).boundingBox();
        await page.setViewportSize({ width: initialViewport.width, height: Math.max(initialViewport.height, Math.ceil(bounds.height) + 48) });
        await page.locator(selector).evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.locator(selector).screenshot({ path: target });
      } else await page.screenshot({ path: target, fullPage: true });
      report.renders.push({ file: filename, url: page.url(), viewport: page.viewportSize(), state: filename.startsWith('mensaje-') ? 'Consulta de ejemplo: cantidad 250 g, municipio Tenjo; no enviada' : 'Estado inicial con datos comerciales sin confirmar', sha256: sha(target) });
      await page.setViewportSize(initialViewport);
    }
    const context = await contextWith();
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
    const page = await context.newPage();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const file of ['index.html', 'shiitake.html', 'recetas.html', 'recetas-eryngii.html', 'recetas-melena.html', 'typography.html', 'especies/shiitake.html', 'especies/melena-de-leon.html', 'especies/eryngii.html']) {
        await visit(page, file);
        const metrics = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth, brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.getAttribute('src')), pairing: document.documentElement.dataset.pairing }));
        assert.ok(metrics.content <= width, `${file} overflow at ${width}`);
        assert.deepEqual(metrics.brokenImages, []);
        if (file !== 'typography.html') assert.equal(metrics.pairing, 'mono');
        report.checks.push({ type: 'responsive', page: file, width, ...metrics });
        if (width === 390 || width === 1440) await capture(page, `${file.replace('.html', '').replaceAll('/', '-')}-${width}.png`);
        if (file === 'shiitake.html' && [390, 1440].includes(width)) await capture(page, `consulta-${width}.png`, '#producto');
      }
    }
    await visit(page, 'especies/eryngii#cocina');
    await page.locator('#cocina a[href="/recetas-eryngii"]').click();
    assert.equal(new URL(page.url()).pathname, '/recetas-eryngii');
    assert.equal(await page.locator('.recipe').count(), 6);
    for (const [slug, grams] of [['medallones',600],['laminas',600],['sudado',600],['atollado',560],['chuzos',560],['pipian',480]]) {
      const recipe = page.locator(`#eryngii-${slug}`);
      for (const factor of [2,3,1]) {
        await recipe.locator(`input[value="${factor}"]`).check();
        const label = await recipe.locator('[data-yield]').innerText();
        assert.ok(label.startsWith(`${4 * factor} porciones`));
        assert.ok(label.includes(new Intl.NumberFormat('es-CO').format(grams * factor) + ' g de eryngii'));
      }
    }
    await page.locator('#eryngii-medallones input[value="3"]').check();
    assert.equal(await page.locator('#eryngii-medallones [data-amounts="1000|1800|2500"]').innerText(), '2.500 ml');
    await page.locator('#eryngii-sudado input[value="2"]').check();
    assert.equal(await page.locator('#eryngii-sudado [data-amounts="400|800|1200"]').innerText(), '800 g');
    assert.equal(await page.locator('.recipe-illustration img').count(),6);
    assert.equal(await page.locator('#eryngii-atollado h2').innerText(),'Desmechado en hojas de lechuga');
    await page.locator('#eryngii-chuzos details summary').click();
    await page.locator('.recipe-shortcuts a[href="#eryngii-chuzos"]').click();
    await page.locator('#eryngii-chuzos .recipe-method').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#eryngii-chuzos details').getAttribute('open'), '');
    await page.locator('#eryngii-chuzos details summary').click();
    await page.locator('.recipe-shortcuts a[href="#eryngii-chuzos"]').click();
    await page.locator('#eryngii-chuzos .recipe-method').waitFor({ state: 'visible' });
    await page.locator('#eryngii-chuzos details summary').click();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('.recipe-details[open]').count(), 6);
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('#eryngii-chuzos details').getAttribute('open'), null);
    await page.locator('.recipes-end a[href="/especies/eryngii"]').click();
    assert.equal(new URL(page.url()).pathname, '/especies/eryngii');
    const eryngiiNoJs = await contextWith(undefined, { javaScriptEnabled: false, viewport: {width:390,height:900} });
    const eryngiiStatic = await eryngiiNoJs.newPage();
    await visit(eryngiiStatic, 'recetas-eryngii');
    assert.equal(await eryngiiStatic.locator('.recipe-details[open]').count(), 6);
    assert.equal(await eryngiiStatic.locator('.recipe-scale:visible').count(), 0);
    assert.ok(await eryngiiStatic.locator('#eryngii-medallones .recipe-ingredients').first().innerText().then(t=>t.includes('480 g')));
    await eryngiiNoJs.close();
    report.checks.push({type:'eryngii-recipes',result:'passed',covers:['editorial roundtrip','six recipes','4/8/12 portions','nonlinear liquids','deep link opens recipe','print restores closed state','ingredients without JS']});
    await visit(page, 'especies/melena-de-leon#cocina');
    await page.locator('#cocina a[href="/recetas-melena"]').click();
    assert.equal(new URL(page.url()).pathname, '/recetas-melena');
    assert.equal(await page.locator('.recipe').count(), 6);
    for (const [slug, grams] of [['posta',600],['encocado',560],['mote',480],['atollado',520],['laminas',500],['envuelto',480]]) {
      const recipe = page.locator(`#melena-${slug}`);
      for (const factor of [2,3,1]) {
        await recipe.locator(`input[value="${factor}"]`).check();
        const label = await recipe.locator('[data-yield]').innerText();
        assert.ok(label.startsWith(`${4 * factor} porciones`));
        assert.ok(label.includes(new Intl.NumberFormat('es-CO').format(grams * factor) + ' g de melena de león fresca limpia'));
      }
    }
    await page.locator('#melena-atollado input[value="3"]').check();
    assert.equal(await page.locator('#melena-atollado [data-amounts="200|400|600"]').first().innerText(), '600 g');
    assert.equal(await page.locator('#melena-atollado [data-amounts="320|640|960"]').innerText(), '960 g');
    await page.locator('#melena-encocado input[value="2"]').check();
    assert.equal(await page.locator('#melena-encocado [data-amounts="600|1000|1500"]').innerText(), '1.000 ml');
    await page.locator('#melena-envuelto details summary').click();
    await page.locator('.recipe-shortcuts a[href="#melena-envuelto"]').click();
    await page.locator('#melena-envuelto .recipe-method').waitFor({ state: 'visible' });
    await page.locator('#melena-envuelto details summary').click();
    await page.locator('.recipe-shortcuts a[href="#melena-envuelto"]').click();
    await page.locator('#melena-envuelto .recipe-method').waitFor({ state: 'visible' });
    await page.locator('#melena-envuelto details summary').click();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('.recipe-details[open]').count(), 6);
    await page.emulateMedia({media:'print'});
    await page.pdf({path:path.join(out,'recetas-melena.pdf'),format:'A4',printBackground:true});
    await page.emulateMedia({media:'screen'});
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await page.locator('.recipes-end a[href="/especies/melena-de-leon"]').click();
    assert.equal(new URL(page.url()).pathname, '/especies/melena-de-leon');
    const melenaNoJs = await contextWith(undefined,{javaScriptEnabled:false,viewport:{width:390,height:900}});
    const melenaStatic = await melenaNoJs.newPage();
    await visit(melenaStatic,'recetas-melena');
    assert.equal(await melenaStatic.locator('.recipe-details[open]').count(),6);
    assert.equal(await melenaStatic.locator('.recipe-scale:visible').count(),0);
    assert.ok(await melenaStatic.locator('#melena-posta .recipe-ingredients').first().innerText().then(t=>t.includes('600 g')));
    await melenaNoJs.close();
    report.checks.push({type:'melena-recipes',result:'passed',covers:['local editorial roundtrip','six recipes','4/8/12 portions','two mushroom cuts','frying bath quantities','repeated anchor','print PDF','no JavaScript']});
    await page.setViewportSize({ width: 1280, height: 800 });
    await visit(page, 'home');
    await page.screenshot({ path: path.join(out, 'catalogo-1280.png') });
    assert.equal(await page.locator('#hero-title').innerText(), 'Cultivo en sombra.');
    assert.equal(await page.locator('.catalog-intro-copy').count(), 0);
    assert.ok(await page.locator('.catalog-landscape img').evaluate(el => el.getBoundingClientRect().width >= 500), 'brand illustration leads the desktop hero');
    assert.ok(await page.locator('#hero-title, #collection-title').evaluateAll(nodes => nodes.every(el => el.getBoundingClientRect().bottom <= innerHeight)), 'tagline and catalogue entry visible on a small laptop');
    await page.setViewportSize({ width: 390, height: 900 });
    await visit(page, 'home');
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('#primary-nav').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#primary-nav').isVisible(), false);
    assert.equal(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement), true);
    await page.locator('.menu-toggle').click();
    await page.locator('#primary-nav a[href="#coleccion"]').click();
    assert.equal(await page.locator('#primary-nav').isVisible(), false);
    assert.equal(new URL(page.url()).hash, '#coleccion');
    report.checks.push({ type: 'catalogue-first-viewport-and-mobile-menu', result: 'passed', covers: ['prominent brand illustration, sole tagline and catalogue entry at 1280×800', 'mobile menu closes with Escape and restores focus', 'menu link reaches catalogue'] });
    await visit(page, 'shiitake.html#producto');
    assert.equal(await page.locator('#order-form').isVisible(), true);
    assert.equal(await page.locator('#channel-notice').isVisible(), true);
    assert.equal(await page.locator('#restaurant-fields').isVisible(), false);
    assert.equal(await page.locator('#presentation-field').isVisible(), false);
    assert.match(await page.locator('#order-subtotal').innerText(), /por confirmar/);
    await page.locator('.purchase-submit').click();
    assert.equal(await page.locator('#order-review').isVisible(), false);
    for (const value of ['0', '-1', '2.5', '', '99999999999999999']) {
      await page.getByLabel('Cantidad solicitada').fill(value);
      await page.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
      await page.locator('.purchase-submit').click();
      assert.equal(await page.locator('#order-review').isVisible(), false, `invalid quantity ${value}`);
      assert.equal(await page.locator('#order-form').evaluate(form => form.checkValidity()), false);
    }
    await page.getByLabel('Cantidad solicitada').fill('500');
    await page.getByLabel('Municipio de entrega', { exact: true }).fill('   ');
    await page.locator('.purchase-submit').click();
    assert.equal(await page.locator('#order-review').isVisible(), false);
    await page.getByLabel('Para restaurante', { exact: true }).check();
    assert.equal(await page.locator('#restaurant-fields').isVisible(), true);
    await page.locator('#order-frequency').fill('Semanal');
    await page.locator('#order-date').fill('Fecha por acordar');
    await page.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await page.getByLabel('Municipio de entrega', { exact: true }).press('Enter');
    assert.equal(await page.locator('#order-review').isVisible(), true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'order-review');
    const message = await page.locator('#order-message').inputValue();
    assert.match(message, /mi restaurante/);
    assert.match(message, /Frecuencia de compra: Semanal/);
    assert.match(message, /Fecha deseada: Fecha por acordar/);
    assert.match(await page.locator('#review-title').innerText(), /Borrador listo/);
    assert.match(message, /Cantidad solicitada: 500 g/);
    assert.match(message, /Precio: por confirmar/);
    assert.match(message, /Municipio de entrega: Tenjo/);
    assert.equal(await page.locator('#order-whatsapp').getAttribute('href'), null);
    assert.equal(await page.locator('#order-whatsapp').isVisible(), false);
    await page.locator('#copy-order').click();
    await page.waitForFunction(() => document.querySelector('#copy-status').textContent.includes('Mensaje copiado'));
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), message);
    await page.getByLabel('Cantidad solicitada').fill('250');
    assert.equal(await page.locator('#order-review').isVisible(), false);
    assert.equal(await page.locator('#order-message').inputValue(), '');
    await page.getByLabel('Para casa', { exact: true }).check();
    assert.equal(await page.locator('#restaurant-fields').isVisible(), false);
    await page.locator('.purchase-submit').click();
    await capture(page, 'mensaje-1440.png', '#producto');
    await page.setViewportSize({ width: 390, height: 1000 });
    await capture(page, 'mensaje-390.png', '#producto');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#order-municipality').inputValue(), '');
    report.checks.push({ type: 'unconfigured-request', result: 'passed', covers: ['validation', 'keyboard submit and focus', 'restaurant/home', 'clipboard copy', 'no WhatsApp without phone', 'invalidated stale message', 'no saved customer data'] });

    for (const entry of ['.card-actions a[href="/shiitake#producto"]']) {
      await visit(page, 'index.html');
      await page.locator(entry).click();
      await page.waitForURL('**/shiitake#producto');
      assert.equal(await page.locator('#order-form').isVisible(), true);
    }
    await visit(page, 'index.html');
    await page.locator('.specimen-button[data-species="shiitake"]').click();
    assert.equal(await page.locator('#dialog-order').isVisible(), true);
    await page.locator('#dialog-order').click();
    await page.waitForURL('**/shiitake#producto');
    await visit(page, 'index.html');
    await page.locator('.specimen-button[data-species="melena"]').click();
    assert.equal(await page.locator('#dialog-order').isVisible(), false);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.species), 'melena');
    report.checks.push({ type: 'purchase-entry', result: 'passed', covers: ['collection card', 'shiitake dialog', 'other species without purchase link', 'dialog keyboard close'] });
    await visit(page, 'index.html');
    assert.equal(await page.locator('.species-card').count(), 3);
    await page.locator('.specimen-button[data-species="eryngii"]').click();
    assert.equal(await page.locator('#dialog-title').innerText(), 'Eryngii');
    assert.equal(await page.locator('#dialog-latin').innerText(), 'Pleurotus eryngii');
    assert.equal(await page.locator('#dialog-order').isVisible(), false);
    assert.equal(await page.locator('#dialog-full-page').isVisible(), true);
    assert.match(await page.locator('#dialog-full-page').getAttribute('href'), /\/especies\/eryngii$/);
    assert.match(await page.locator('#dialog-image').getAttribute('src'), /cardo/);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.species), 'eryngii');
    for (const [key, slug, name] of [['shiitake', 'shiitake', 'Shiitake'], ['melena', 'melena-de-leon', 'Melena de león'], ['eryngii', 'eryngii', 'Eryngii']]) {
      await visit(page, 'home?pairing=bricolage');
      await page.locator(`.card-discover[data-editorial="${key}"]`).click();
      assert.equal(new URL(page.url()).pathname, `/especies/${slug}`);
      assert.equal(new URL(page.url()).searchParams.get('pairing'), 'bricolage');
      assert.equal(await page.locator('h1').innerText(), name);
      assert.equal(await page.locator('.editorial-sources li').count(), 5);
      assert.equal(await page.locator('.editorial-other').count(), 2);
      await page.locator('.editorial-toc a[href="#cocina"]').click();
      assert.equal(new URL(page.url()).hash, '#cocina');
      await page.emulateMedia({ media: 'print' });
      assert.equal(await page.locator('.editorial-utility').isVisible(), false);
      assert.equal(await page.locator('#curiosidades').isVisible(), true);
      await page.emulateMedia({ media: 'screen' });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await visit(page, `especies/${slug}.html`);
      await page.screenshot({ path: path.join(out, `editorial-${slug}-1440.png`) });
      await page.setViewportSize({ width: 390, height: 900 });
      await visit(page, `especies/${slug}.html`);
      await page.screenshot({ path: path.join(out, `editorial-${slug}-390.png`) });
    }
    report.checks.push({ type: 'editorial-species-journeys', result: 'passed', covers: ['all three catalogue links', 'legacy query preserved', 'five sources per page', 'links to other species', 'section navigation', 'print controls hidden', 'desktop and mobile covers'] });
    await visit(page, 'home');
    assert.equal(await page.locator('.chef-steps > li').count(), 2);
    await visit(page, 'recetas.html');
    assert.equal(await page.locator('.recipe-shortcut-meta').count(), 9);
    assert.equal(await page.locator('.recipe-chip').count(), 3);
    report.checks.push({ type: 'integrated-main-ux', result: 'passed', covers: ['no-channel draft notice', 'restaurant frequency and desired date in local message', 'catalogue entry and three species dialogs', 'two chef steps', 'nine recipe shortcut summaries', 'pending-trial labels'] });
    // Fase 4: guía de preparación sobre la colección.
    const visibleSpecies = () => page.locator('.species-card:not([hidden]) h3').allTextContents();
    await visit(page, 'index.html#coleccion');
    assert.equal(await page.locator('#prep-guide').isVisible(), true);
    if (!await page.locator('#prep-guide').evaluate(el => el.open)) await page.locator('#prep-guide summary').click();
    assert.deepEqual(await visibleSpecies(), ['Shiitake', 'Melena de león', 'Eryngii']);
    const prepCases = [['sopa', ['Shiitake', 'Melena de león']], ['saltear', ['Shiitake', 'Eryngii']], ['asar', ['Eryngii']], ['desmenuzar', ['Melena de león']]];
    for (const [prep, expected] of prepCases) {
      await page.locator(`[data-prep="${prep}"]`).click();
      assert.deepEqual(await visibleSpecies(), expected, prep);
      assert.equal(await page.locator(`[data-prep="${prep}"]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#filter-reset').isVisible(), true);
    }
    await page.locator('[data-prep="asar"]').click();
    assert.equal(await page.locator('.species-card:not([hidden]) .card-reason sup a').getAttribute('href'), '#source-culinary');
    await page.locator('[data-prep="sopa"]').click();
    assert.match(await page.locator('#filter-status').textContent(), /2 especies visibles para sopa o caldo/);
    await page.locator('.species-card:not([hidden]) .card-reason a.text-link').first().click();
    await page.waitForURL('**/recetas#receta-sopa');
    await visit(page, 'index.html#coleccion');
    if (!await page.locator('#prep-guide').evaluate(el => el.open)) await page.locator('#prep-guide summary').click();
    await page.locator('[data-prep="saltear"]').click();
    await page.locator('#filter-reset').click();
    assert.deepEqual(await visibleSpecies(), ['Shiitake', 'Melena de león', 'Eryngii']);
    assert.equal(await page.locator('#filter-reset').isVisible(), false);
    assert.equal(await page.locator('#filter-empty').isVisible(), false);
    assert.equal(await page.locator('[data-prep="any"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.card-reason:visible').count(), 0);
    await page.locator('[data-prep="sopa"]').focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await visibleSpecies(), ['Shiitake', 'Melena de león']);
    await page.locator('.species-card:not([hidden]) [data-species="melena"]').first().click();
    assert.equal(await page.locator('#dialog-order').isVisible(), false);
    await page.keyboard.press('Escape');
    await page.locator('.card-consult').click();
    await page.waitForURL('**/shiitake#producto');
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await visit(page, 'index.html#coleccion');
      if (!await page.locator('#prep-guide').evaluate(el => el.open)) await page.locator('#prep-guide summary').click();
      await page.locator('[data-prep="asar"]').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, `guide overflow ${width}`);
      if (width === 390) await capture(page, 'guia-asar-390.png', '#coleccion');
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit(page, 'index.html#coleccion');
    if (!await page.locator('#prep-guide').evaluate(el => el.open)) await page.locator('#prep-guide summary').click();
    await page.locator('[data-prep="sopa"]').click();
    await capture(page, 'guia-sopa-1440.png', '#coleccion');
    report.checks.push({ type: 'preparation-guide', result: 'passed', covers: ['four preparations map to sourced uses', 'exactly three requested species', 'reset restores collection', 'recipe link from guide', 'keyboard', 'melena dialog has no purchase', 'overflow 320/390'] });
    await visit(page, 'index.html?pairing=bricolage');
    await page.locator('.card-consult').click();
    assert.equal(new URL(page.url()).searchParams.get('pairing'), 'bricolage');
    assert.equal(new URL(page.url()).hash, '#producto');
    report.checks.push({ type: 'legacy-query-navigation', result: 'passed' });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit(page, 'shiitake.html');
    const fonts = await page.evaluate(() => ({ heading: getComputedStyle(document.querySelector('h1')).fontFamily, quantity: getComputedStyle(document.querySelector('#order-weight')).fontFamily, input: getComputedStyle(document.querySelector('#order-municipality')).fontFamily }));
    assert.match(fonts.heading, /Gaya/);
    assert.match(fonts.quantity, /IBM Plex Mono/);
    assert.match(fonts.input, /IBM Plex Sans/);
    report.fonts = fonts;
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('details:not([open])').count(), 0);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('#order-form').isVisible(), false);
    assert.equal(await page.locator('#order-review').isVisible(), false);
    await page.pdf({ path: path.join(out, 'shiitake.pdf'), format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' } });
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('details[open]').count(), 0);
    report.checks.push({ type: 'print', result: 'passed', covers: ['details expanded', 'form excluded', 'PDF generated', 'details restored'] });

    for (const fragment of ['receta-arepa', 'receta-sopa', 'receta-patacones']) {
      await visit(page, 'index.html#en-la-cocina');
      await page.locator(`.kitchen-routes a[href="/recetas#${fragment}"]`).click();
      await page.waitForURL(`**/recetas#${fragment}`);
      assert.equal(await page.locator(`#${fragment} details`).evaluate(el => el.open), true);
    }
    await visit(page, 'recetas.html#receta-arepa');
    const recipeSummary = page.locator('#receta-arepa summary');
    await recipeSummary.focus();
    await recipeSummary.press('Enter');
    assert.equal(await page.locator('#receta-arepa details').evaluate(el => el.open), false);
    await page.locator('.recipe-shortcuts a[href="#receta-arepa"]').click();
    assert.equal(await page.locator('#receta-arepa details').evaluate(el => el.open), true);
    const priorDetails = await page.locator('details').evaluateAll(elements => elements.map(el => el.open));
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('details:not([open])').count(), 0);
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: path.join(out, 'recetas.pdf'), format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' } });
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert.deepEqual(await page.locator('details').evaluateAll(elements => elements.map(el => el.open)), priorDetails);
    report.checks.push({ type: 'recipe-navigation-keyboard-print', result: 'passed', covers: ['three home recipe links', 'hash opens recipe', 'keyboard toggles instructions', 'shortcut reopens same hash', 'print expands and restores instructions'] });

    const brokenLinks = [];
    for (const file of ['index.html', 'shiitake.html', 'recetas.html', 'recetas-eryngii.html', 'recetas-melena.html', 'typography.html', 'especies/shiitake.html', 'especies/melena-de-leon.html', 'especies/eryngii.html']) {
      await visit(page, file);
      const ids = await page.locator('[id]').evaluateAll(elements => elements.map(el => el.id));
      assert.equal(ids.length, new Set(ids).size, `${file} duplicate IDs`);
      const links = await page.locator('a[href]').evaluateAll(links => [...new Set(links.map(el => el.href))]);
      for (const link of links.filter(link => link.startsWith(base))) {
        const url = new URL(link);
        const cleanSources = { '/': 'design-system.html', '/home': 'index.html', '/shiitake': 'shiitake.html', '/recetas': 'recetas.html', '/recetas-eryngii': 'recetas-eryngii.html', '/recetas-melena': 'recetas-melena.html', '/manual': 'manual.html', '/typography': 'typography.html', ...Object.fromEntries(['shiitake', 'melena-de-leon', 'eryngii'].map(slug => [`/especies/${slug}`, `especies/${slug}.html`])) };
        const filePath = path.join(root, cleanSources[url.pathname] || decodeURIComponent(url.pathname));
        if (!fs.existsSync(filePath)) { brokenLinks.push(link); continue; }
        if (url.hash && filePath.endsWith('.html') && !fs.readFileSync(filePath, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) brokenLinks.push(link);
      }
    }
    assert.deepEqual(brokenLinks, []);
    report.checks.push({ type: 'links-and-ids', result: 'passed' });
    await context.close();

    const fixture = { whatsapp: '+57 (999) 999-9999', availability: 'available', presentations: [{ id: 'test250', name: 'Presentación de prueba 250', weightGrams: 250, priceCOP: 18000 }, { id: 'test500', name: 'Presentación de prueba 500', weightGrams: 500, priceCOP: 34000 }], deliveryAreas: 'Zona de prueba', deliveryDays: 'Día de prueba', deliveryFeeCOP: 8000, paymentMethods: 'Medio de prueba', batch: 'TEST-NO-VENTA', harvestDate: 'Fecha de prueba' };
    const configured = await contextWith(fixture);
    const known = await configured.newPage();
    await visit(known, 'shiitake.html#producto');
    assert.equal(await known.locator('.purchase-option').count(), 2);
    await known.locator('input[name="presentation"][value="1"]').check();
    await known.getByLabel('Número de presentaciones', { exact: true }).fill('3');
    await known.getByLabel('Municipio de entrega', { exact: true }).fill('Municipio de prueba');
    assert.equal(await known.locator('#order-weight').innerText(), '1.500 g');
    assert.equal((await known.locator('#order-subtotal').innerText()).replace(/\s/g, ''), '$102.000COP');
    await known.locator('.purchase-submit').click();
    const knownMessage = await known.locator('#order-message').inputValue();
    const whatsappUrl = new URL(await known.locator('#order-whatsapp').getAttribute('href'));
    assert.equal(whatsappUrl.origin, 'https://wa.me');
    assert.equal(whatsappUrl.pathname, '/579999999999');
    assert.equal(whatsappUrl.searchParams.get('text'), knownMessage);
    assert.match(knownMessage, /3 presentaciones \(1.500 g en total\)/);
    assert.match(knownMessage, /102\.000/);
    assert.match(knownMessage, /sin envío/);
    assert.match(knownMessage, /8\.000/);
    assert.match(await known.locator('#order-whatsapp').innerText(), /Solicitar pedido/i);
    assert.equal(await known.locator('#product-batch').textContent(), 'TEST-NO-VENTA');
    await known.locator('input[name="presentation"][value="0"]').check();
    assert.equal(await known.locator('#order-review').isVisible(), false);
    assert.equal(await known.locator('#order-whatsapp').getAttribute('href'), null);
    assert.equal((await known.locator('#order-subtotal').innerText()).replace(/\s/g, ''), '$54.000COP');
    await configured.close();
    report.checks.push({ type: 'synthetic-priced-presentations', result: 'passed', covers: ['quantity and price calculation', 'shipping separated', 'E.164 normalization', 'encoded WhatsApp message', 'changed selection invalidates old message', 'lot metadata'] });

    // Fase 1: receta -> cantidad -> consulta (sin enviar nada).
    const recipeCases = [['receta-arepa', 300, /arepa/], ['receta-sopa', 300, /sopa/], ['receta-patacones', 250, /patacones/],
      ['receta-atollado', 500, /atollado/], ['receta-ajiaco', 400, /ajiaco/], ['receta-mote', 300, /mote/],
      ['receta-encocado', 350, /encocado/], ['receta-sudado', 500, /sudado/], ['receta-maduro', 250, /maduro/]];
    const recipeCtx = await contextWith();
    const rp = await recipeCtx.newPage();
    for (const [id, grams, name] of recipeCases) {
      await visit(rp, 'recetas.html');
      const cta = rp.locator(`#${id} .recipe-cta a`);
      assert.match(await rp.locator(`#${id} .recipe-cta`).innerText(), new RegExp(`${grams} g`));
      await cta.click();
      await rp.waitForURL(`**/shiitake?recipe=${id}&scale=1#producto`);
      assert.equal(await rp.locator('#recipe-context').isVisible(), true);
      assert.equal(await rp.locator('#order-quantity').inputValue(), String(grams));
      assert.equal(await rp.locator('#recipe-grams-field').isVisible(), false);
      await rp.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
      await rp.locator('.purchase-submit').click();
      const msg = await rp.locator('#order-message').inputValue();
      assert.match(msg, name);
      assert.match(msg, new RegExp(`Cantidad solicitada: ${grams} g`));
      assert.match(msg, /peso limpio aprovechable.*peso de compra/, "La consulta conserva la distinción entre necesidad neta y compra");
      assert.match(msg, new RegExp(`receta base usa ${grams} g`));
      await rp.getByLabel('Cantidad solicitada').fill('400');
      assert.equal(await rp.locator('#order-review').isVisible(), false);
      assert.equal(await rp.locator('#order-municipality').inputValue(), 'Tenjo');
      assert.equal(await rp.locator('#order-weight').innerText(), '400 g');
    }
    await visit(rp, 'shiitake.html?recipe=receta-arepa&scale=1&pairing=bricolage#producto');
    await rp.getByLabel('Municipio de entrega', { exact: true }).fill('Cota');
    await rp.locator('#recipe-clear').click();
    assert.equal(await rp.locator('#recipe-context').isVisible(), false);
    assert.equal(new URL(rp.url()).searchParams.get('recipe'), null);
    assert.equal(new URL(rp.url()).searchParams.get('pairing'), 'bricolage');
    assert.equal(await rp.locator('#order-municipality').inputValue(), 'Cota');
    await visit(rp, 'recetas.html?pairing=bricolage');
    assert.equal(new URL(await rp.locator('#receta-sopa .recipe-cta a').evaluate(a => a.href)).searchParams.get('pairing'), 'bricolage');
    for (const bad of ['recipe=__proto__&scale=1', 'recipe=receta-x&scale=1', 'recipe=receta-arepa&scale=4', 'recipe=receta-arepa&scale=0', 'recipe=receta-arepa&scale=01', 'recipe=receta-arepa&scale=abc', 'recipe=%3Cimg%20src%3Dx%3E', 'scale=1']) {
      await visit(rp, `shiitake.html?${bad}#producto`);
      assert.equal(await rp.locator('#recipe-context').isVisible(), false, bad);
      assert.equal(await rp.locator('#order-quantity').inputValue(), '250', bad);
      assert.equal(await rp.locator('#order-form').isVisible(), true, bad);
    }
    await capture(rp, 'receta-consulta-sin-contexto-1440.png', '#producto');
    await visit(rp, 'shiitake.html?recipe=receta-arepa&scale=1#producto');
    await rp.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await capture(rp, 'receta-consulta-1440.png', '#producto');
    await rp.setViewportSize({ width: 390, height: 1000 });
    await capture(rp, 'receta-consulta-390.png', '#producto');
    assert.equal(await rp.evaluate(() => document.documentElement.scrollWidth), 390);
    await rp.setViewportSize({ width: 1440, height: 1000 });
    await recipeCtx.close();

    // Fase 2: cantidades ajustables.
    const scaleCtx = await contextWith();
    const sp = await scaleCtx.newPage();
    await visit(sp, 'recetas.html');
    const snapshot = () => sp.evaluate(() => [...document.querySelectorAll('.recipe')].map(a => ({ id: a.id, yield: a.querySelector('[data-yield]').textContent, ings: [...a.querySelectorAll('.recipe-ingredients li')].map(li => [li.dataset.ing, li.textContent]) })));
    const baseSnap = await snapshot();
    // Concordancia modelo/HTML: mismos IDs y mismos textos en ×1.
    const modelBase = await sp.evaluate(() => Object.entries(window.SetasRecipes).map(([id, r]) => ({ id, ids: r.ingredients.map(i => i.id), r1: r.render(1) })));
    for (const m of modelBase) {
      const html = baseSnap.find(b => b.id === m.id);
      assert.deepEqual(html.ings.map(([id]) => id), m.ids, `${m.id} ids`);
      assert.deepEqual(Object.fromEntries(html.ings), m.r1.ingredients, `${m.id} ingredient texts`);
      assert.equal(html.yield, m.r1.yield, `${m.id} yield`);
    }
    const sig = id => sp.locator(`#${id}`);
    const ing = async (id, key) => (await sp.locator(`#${id} [data-ing="${key}"]`).textContent());
    assert.equal(await sp.locator('.recipe-scale').first().isVisible(), true);
    await sp.locator('#receta-arepa input[value="2"]').check();
    assert.equal(await ing('receta-arepa', 'shiitake'), '600 g de shiitake fresco limpio, en láminas');
    assert.equal(await ing('receta-arepa', 'aguacate'), '2 aguacates medianos');
    assert.equal(await ing('receta-arepa', 'cebolla'), '4 cucharadas de cebolla larga picada');
    assert.equal(await ing('receta-arepa', 'sal'), 'Sal y pimienta al gusto');
    assert.equal(await sp.locator('#receta-arepa [data-yield]').textContent(), '4 personas · 8 arepas pequeñas');
    assert.match(await sp.locator('#receta-arepa .recipe-scale-status').innerText(), /doble.*×2.*tiempo/s);
    assert.equal(await ing('receta-sopa', 'shiitake'), '300 g de shiitake fresco limpio, en láminas', 'factor no se hereda');
    assert.equal(new URL(sp.url()).searchParams.get('recipe'), 'receta-arepa');
    assert.equal(new URL(sp.url()).searchParams.get('scale'), '2');
    await sp.locator('#receta-patacones input[value="3"]').check();
    assert.equal(await ing('receta-patacones', 'shiitake'), '750 g de shiitake fresco limpio, en láminas');
    assert.equal(await ing('receta-patacones', 'platanos'), '6 plátanos verdes');
    assert.equal(await sp.locator('#receta-patacones [data-yield]').textContent(), '24 bases pequeñas · 6–12 personas');
    await sp.locator('#receta-sopa input[value="3"]').check();
    assert.equal(await ing('receta-sopa', 'limon'), '3–6 cucharadas de jugo de limón');
    assert.equal(await sp.locator('#receta-sopa [data-yield]').textContent(), '12 entradas o 6 porciones grandes');
    assert.equal(await ing('receta-sopa', 'coco'), '1200 ml de leche de coco culinaria sin azúcar añadida');
    assert.equal(await sp.locator('#receta-sopa [data-ing="yuca"]').count(), 0, "El ingrediente retirado no reaparece al escalar");
    assert.equal(await sp.evaluate(() => window.SetasRecipes["receta-sopa"].ingredients.some(item => item.id === "yuca")), false);
    // Six new formulations: independent scale, decimal units, fixed cooking references and URL grams.
    for (const [id, grams] of recipeCases.slice(3)) {
      const beforeSteps = await sp.locator(`#${id} .recipe-steps`).textContent();
      for (const scale of [3, 2, 1]) {
        await sp.locator(`#${id} input[value="${scale}"]`).check();
        assert.match(await ing(id, 'shiitake'), new RegExp(`^${grams * scale} g de shiitake fresco limpio`));
        const link = new URL(await sp.locator(`#${id} .recipe-cta a`).getAttribute('href'));
        assert.equal(link.searchParams.get('recipe'), id);
        assert.equal(link.searchParams.get('scale'), String(scale));
        assert.equal(await sp.locator(`#${id} .recipe-steps`).textContent(), beforeSteps, 'times in steps do not scale');
      }
    }
    await sp.locator('#receta-encocado input[value="3"]').check();
    assert.equal(await ing('receta-encocado', 'curcuma'), '0,75 cucharaditas de cúrcuma molida');
    assert.equal(await ing('receta-encocado', 'caldo'), '450 ml de caldo vegetal');
    await sp.locator('#receta-atollado input[value="3"]').check();
    assert.equal(await ing('receta-atollado', 'caldo'), '4500 ml de caldo vegetal caliente, y más si hace falta');
    assert.equal(await sp.locator('#receta-atollado [data-yield]').textContent(), '12–18 personas');
    for (const [id] of recipeCases) await sp.locator(`#${id} input[value="1"]`).check();
    assert.deepEqual(await snapshot(), baseSnap, '×1→×3→×1 restaura exactamente');
    assert.equal(new URL(sp.url()).searchParams.get('scale'), null);
    // Teclado: foco en el grupo y flechas.
    await sp.locator('#receta-arepa input[value="1"]').focus();
    await sp.keyboard.press('ArrowRight');
    assert.equal(await sp.locator('#receta-arepa input[value="2"]').isChecked(), true);
    assert.equal(await sp.locator('#receta-arepa input[value="2"]').evaluate(el => el === document.activeElement), true);
    // Consulta con el factor elegido.
    await sp.locator('#receta-arepa .recipe-cta a').click();
    await sp.waitForURL('**/shiitake?recipe=receta-arepa&scale=2#producto');
    assert.equal(await sp.locator('#order-quantity').inputValue(), '600');
    assert.match(await sp.locator('#recipe-context-text').innerText(), /×2.*600 g/);
    await sp.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await sp.locator('.purchase-submit').click();
    const scaledMsg = await sp.locator('#order-message').inputValue();
    assert.match(scaledMsg, /Cantidad solicitada: 600 g/);
    assert.match(scaledMsg, /versión ×2; la receta base usa 300 g/);
    await visit(sp, 'recetas.html?recipe=receta-patacones&scale=3&pairing=bricolage#receta-patacones');
    assert.equal(await sp.locator('#receta-patacones input[value="3"]').isChecked(), true);
    assert.equal(await sp.locator('#receta-arepa input[value="1"]').isChecked(), true);
    assert.equal(await ing('receta-patacones', 'shiitake'), '750 g de shiitake fresco limpio, en láminas');
    const ctaUrl = new URL(await sp.locator('#receta-patacones .recipe-cta a').evaluate(a => a.href));
    assert.equal(ctaUrl.searchParams.get('scale'), '3');
    assert.equal(ctaUrl.searchParams.get('pairing'), 'bricolage');
    assert.match(await sp.locator('#receta-patacones .recipe-cta p').innerText(), /750 g/);
    for (const bad of ['recipe=receta-patacones&scale=9', 'recipe=__proto__&scale=2', 'recipe=receta-x&scale=2', 'scale=2']) {
      await visit(sp, `recetas.html?${bad}`);
      assert.deepEqual(await snapshot(), baseSnap, bad);
    }
    // Impresión con factor elegido.
    await visit(sp, 'recetas.html?recipe=receta-sopa&scale=2#receta-sopa');
    await sp.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await sp.emulateMedia({ media: 'print' });
    assert.equal(await sp.locator('#receta-sopa .recipe-scale').isVisible(), false);
    assert.match(await sp.locator('#receta-sopa .recipe-scale-status').innerText(), /doble.*×2.*estimaciones/is);
    assert.equal(await ing('receta-sopa', 'caldo'), '1200 ml de caldo vegetal');
    assert.equal(await sp.locator('#receta-sopa .recipe-scale-status').isVisible(), true);
    await sp.pdf({ path: path.join(out, 'recetas-x2.pdf'), format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' } });
    await sp.emulateMedia({ media: 'screen' });
    await sp.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await capture(sp, 'recetas-x2-1440.png', '#receta-sopa');
    await sp.setViewportSize({ width: 390, height: 1000 });
    await capture(sp, 'recetas-x2-390.png', '#receta-sopa');
    assert.equal(await sp.evaluate(() => document.documentElement.scrollWidth), 390);
    await sp.setViewportSize({ width: 320, height: 1000 });
    assert.ok(await sp.evaluate(() => document.documentElement.scrollWidth) <= 320);
    await scaleCtx.close();
    const noJsR = await contextWith(undefined, { javaScriptEnabled: false });
    const staticR = await noJsR.newPage();
    await staticR.goto(base + 'recetas.html');
    assert.equal(await staticR.locator('.recipe-scale').first().isVisible(), false);
    assert.equal(await staticR.locator('#receta-arepa [data-ing="shiitake"]').textContent(), '300 g de shiitake fresco limpio, en láminas');
    await noJsR.close();
    report.checks.push({ type: 'recipe-scaling', result: 'passed', covers: ['model/HTML concordance', '×1/×2/×3 per recipe', 'exact restore', 'ranges and optional', 'text items unscaled', 'yield ranges', 'no inherited factor', 'keyboard arrows', 'consultation 600 g', 'reload via URL', 'malformed params', 'print status and PDF', '320/390 overflow', 'no-JS base quantities'] });

    const packs = [{ id: 'p250', name: 'Presentación de prueba 250', weightGrams: 250, priceCOP: 18000 }, { id: 'p500', name: 'Presentación de prueba 500', weightGrams: 500, priceCOP: null }];
    const packCtx = await contextWith({ whatsapp: '+57 999 999 9999', availability: 'available', presentations: packs });
    const pk = await packCtx.newPage();
    await visit(pk, 'shiitake.html?recipe=receta-arepa&scale=1&pairing=mono#producto');
    assert.equal(await pk.locator('#recipe-grams').inputValue(), '300');
    assert.equal(await pk.locator('#order-quantity').inputValue(), '2');
    assert.equal(await pk.locator('#order-weight').innerText(), '500 g');
    assert.match(await pk.locator('#order-difference').innerText(), /200 g más.*sin descontar merma/);
    await pk.locator('input[name="presentation"][value="1"]').check();
    assert.equal(await pk.locator('#order-quantity').inputValue(), '1');
    assert.match(await pk.locator('#order-difference').innerText(), /200 g más/);
    await pk.locator('input[name="presentation"][value="0"]').check();
    await pk.getByLabel('Shiitake fresco limpio para la receta (g)').fill('1000');
    assert.equal(await pk.locator('#order-quantity').inputValue(), '4');
    assert.match(await pk.locator('#order-difference').innerText(), /1 kg declarados.*peso limpio aprovechable por confirmar/);
    assert.doesNotMatch(await pk.locator('#order-difference').innerText(), /coincide|alcanza|suficiente/);
    await pk.getByLabel('Número de presentaciones', { exact: true }).fill('3');
    assert.match(await pk.locator('#order-difference').innerText(), /250 g menos/);
    await pk.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await pk.locator('.purchase-submit').click();
    const packMsg = await pk.locator('#order-message').inputValue();
    assert.match(packMsg, /Necesito unos 1 kg para la receta/);
    assert.match(packMsg, /3 presentaciones \(750 g en total\)/);
    assert.match(packMsg, /Peso declarado de las presentaciones: 750 g declarados · 250 g menos/);
    assert.match(packMsg, /sin envío/);
    assert.equal(new URL(await pk.locator('#order-whatsapp').getAttribute('href')).searchParams.get('text'), packMsg);
    await pk.getByLabel('Shiitake fresco limpio para la receta (g)').fill('0');
    assert.equal(await pk.locator('#order-review').isVisible(), false);
    assert.equal(await pk.locator('#order-whatsapp').getAttribute('href'), null);
    await pk.locator('.purchase-submit').click();
    assert.equal(await pk.locator('#order-review').isVisible(), false);
    await pk.locator('#recipe-clear').click();
    assert.equal(await pk.locator('#order-difference-row').isVisible(), false);
    await pk.getByLabel('Número de presentaciones', { exact: true }).fill('2');
    await pk.locator('.purchase-submit').click();
    assert.doesNotMatch(await pk.locator('#order-message').inputValue(), /receta/i);
    await packCtx.close();
    const bigCtx = await contextWith({ presentations: [{ id: 'big', name: 'Prueba grande', weightGrams: 1000, priceCOP: 40000 }] });
    const big = await bigCtx.newPage();
    await visit(big, 'shiitake.html?recipe=receta-patacones&scale=1#producto');
    assert.equal(await big.locator('#order-quantity').inputValue(), '1');
    assert.match(await big.locator('#order-difference').innerText(), /750 g más/);
    await bigCtx.close();
    report.checks.push({ type: 'recipe-to-inquiry', result: 'passed', covers: ['nine recipes including six new formulations', 'editable quantity invalidates message and keeps municipality', 'remove context keeps pairing', 'pairing link propagation', 'unknown/malformed params', 'pack proposal ceil(g/pack)', 'grams never become packs', 'difference shown', 'unpriced pack', 'quantity larger than pack', 'invalid recipe grams'] });

    const partial = await contextWith({ availability: 'unavailable', whatsapp: 'javascript:alert(1)', presentations: [{ id: 'single', name: 'Prueba sin precio', weightGrams: 250, priceCOP: '18000' }], deliveryFeeCOP: 0 });
    const partialPage = await partial.newPage();
    await visit(partialPage, 'shiitake.html');
    await partialPage.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await partialPage.locator('.purchase-submit').click();
    assert.match(await partialPage.locator('#order-message').inputValue(), /Cuándo esperan tener disponibilidad/);
    assert.equal(await partialPage.locator('#order-whatsapp').getAttribute('href'), null);
    assert.match(await partialPage.locator('#order-subtotal').innerText(), /por confirmar/);
    assert.match(await partialPage.locator('#delivery-fee').innerText(), /Sin costo/);
    await partial.close();
    report.checks.push({ type: 'synthetic-partial-and-out-of-stock', result: 'passed', covers: ['single presentation', 'invalid phone cannot create link', 'non-numeric price remains unknown', 'out-of-stock inquiry', 'zero delivery fee recognized'] });

    const fallback = await contextWith();
    await fallback.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Simulated clipboard denial'); } }, configurable: true }));
    const fallbackPage = await fallback.newPage();
    await visit(fallbackPage, 'shiitake.html');
    await fallbackPage.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await fallbackPage.locator('.purchase-submit').click();
    await fallbackPage.locator('#copy-order').click();
    await fallbackPage.waitForFunction(() => document.querySelector('#copy-status').textContent.includes('Mensaje seleccionado'));
    const selectedRange = await fallbackPage.locator('#order-message').evaluate(el => ({ start: el.selectionStart, end: el.selectionEnd, length: el.value.length, active: document.activeElement.id }));
    assert.equal(selectedRange.start, 0);
    assert.equal(selectedRange.end, selectedRange.length);
    assert.equal(selectedRange.active, 'order-message');
    await fallback.close();
    report.checks.push({ type: 'clipboard-denied-fallback', result: 'passed' });

    const noJs = await contextWith(undefined, { javaScriptEnabled: false });
    const staticPage = await noJs.newPage();
    await staticPage.goto(base + 'home');
    assert.deepEqual(await staticPage.locator('.species-card:not([hidden]) h3').allTextContents(), ['Shiitake', 'Melena de león', 'Eryngii']);
    assert.equal(await staticPage.locator('#prep-guide').isVisible(), false);
    assert.equal(await staticPage.locator('noscript a[href="/shiitake"]').isVisible(), true);
    await staticPage.locator('.card-discover[data-editorial="melena"]').click();
    assert.equal(await staticPage.locator('h1').innerText(), 'Melena de león');
    assert.equal(await staticPage.locator('#print-editorial').isVisible(), false);
    assert.equal(await staticPage.locator('#curiosidades').isVisible(), true);
    await staticPage.goto(base + 'shiitake.html');
    assert.equal(await staticPage.locator('#order-form').isVisible(), false);
    assert.equal(await staticPage.locator('noscript').isVisible(), true);
    assert.equal(await staticPage.locator('#order-whatsapp').getAttribute('href'), null);
    await noJs.close();
    report.checks.push({ type: 'no-js-fallback', result: 'passed' });
    const chefContext = await contextWith();
    const chefPage = await chefContext.newPage();
    await visit(chefPage, 'index.html#para-chefs');
    await chefPage.locator('#para-chefs a[href*="/recetas"]').click();
    await chefPage.locator('#receta-arepa input[value="3"]').check();
    await chefPage.locator('#receta-arepa .recipe-cta a').click();
    await chefPage.waitForLoadState('networkidle');
    assert.equal(await chefPage.locator('input[name="purpose"][value="restaurante"]').isChecked(), true);
    assert.equal(await chefPage.locator('#order-quantity').inputValue(), '900');
    await chefPage.getByLabel('Municipio de entrega', { exact: true }).fill('Tenjo');
    await chefPage.locator('.purchase-submit').click();
    assert.match(await chefPage.locator('#order-message').inputValue(), /mi restaurante/);
    assert.match(await chefPage.locator('#order-message').inputValue(), /900 g/);
    assert.equal(await chefPage.locator('#order-whatsapp').isVisible(), false);
    await capture(chefPage, 'chef-consulta-1440.png', '#producto');
    await visit(chefPage, 'shiitake.html?purpose=invalid#producto');
    assert.equal(await chefPage.locator('input[name="purpose"][value="casa"]').isChecked(), true);
    await visit(chefPage, 'index.html');
    await capture(chefPage, 'chef-recorrido-1440.png', '#para-chefs');
    await chefPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await chefPage.screenshot({ path: path.join(out, 'portada-1440.png') });
    await chefPage.setViewportSize({ width: 390, height: 900 });
    await visit(chefPage, 'index.html');
    await chefPage.screenshot({ path: path.join(out, 'portada-390.png') });
    await chefContext.close();
    report.checks.push({ type: 'chef-journey', result: 'passed', covers: ['chef entry to recipe', '×3 transfers 900 g', 'restaurant purpose retained', 'reviewed message', 'no WhatsApp without phone', 'invalid purpose uses home default'] });
    assert.deepEqual(report.browserErrors, []);
    report.sources = ['index.html', 'shiitake.html', 'shiitake.js', 'website.js', 'website.css', 'species-editorial.css', 'editorial.js', 'especies/shiitake.html', 'especies/melena-de-leon.html', 'especies/eryngii.html', 'home-catalog.css', 'commercial.css', 'commercial-data.js', 'recetas.html', 'recetas.js', 'recipe-data.js', 'typography.html', 'typography-trials.css', 'typography-trials.js'].map(file => ({ file, sha256: sha(path.join(root, file)) }));
    fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ result: 'passed', checks: report.checks.length, renders: report.renders.length, browserErrors: report.browserErrors.length, auditDirectory: out }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
