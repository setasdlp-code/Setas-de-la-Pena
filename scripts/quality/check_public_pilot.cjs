'use strict';
// Comprobaciones del cuaderno de cocina abierto: estado comercial de piloto
// (aviso de primera cosecha) y registro del cultivo de shiitake.
// Usa el mismo servidor que check_public_website.cjs:
//   python3 scripts/serve_public_website.py --source --port 4187 --directory .
// Los datos de prueba solo existen en rutas interceptadas del navegador; no se envía nada.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const { chromium } = require(path.join(root, 'field-os-simulador/setas-os/node_modules/@playwright/test'));
const base = (process.env.SETAS_WEBSITE_BASE_URL || 'http://127.0.0.1:4187/').replace(/\/?$/, '/');
const checks = [];
const browserErrors = [];

const commerce = overrides => ({
  whatsapp: null, availability: 'pilot', availabilityNote: null, presentations: [],
  deliveryAreas: null, deliveryDays: null, deliveryFeeCOP: null, paymentMethods: null,
  batch: null, harvestDate: null, ...overrides
});

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
  try {
    async function contextWith({ data, pilotLog, ...options } = {}) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
      if (data !== undefined) await context.route('**/commercial-data.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.SetasCommerce = ${JSON.stringify(data)};` }));
      if (pilotLog !== undefined) await context.route('**/pilot-log.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.SetasPilotLog = ${JSON.stringify(pilotLog)};` }));
      context.on('page', page => {
        page.on('pageerror', error => browserErrors.push(error.message));
        page.on('response', response => { if (response.status() >= 400) browserErrors.push(`${response.status()} ${response.url()}`); });
      });
      return context;
    }
    async function open(options, file) {
      const context = await contextWith(options);
      const page = await context.newPage();
      await page.goto(base + file, { waitUntil: 'networkidle' });
      return { context, page };
    }
    async function fillAndSubmit(page, purpose = 'casa') {
      await page.locator(`#order-form input[name="purpose"][value="${purpose}"]`).check();
      await page.locator('#order-quantity').fill('250');
      await page.locator('#order-municipality').fill('Tenjo');
      await page.locator('.purchase-submit').click();
      return page.locator('#order-message').inputValue();
    }
    const pass = (type, name) => checks.push({ type, case: name, result: 'passed' });

    // --- Estado comercial de piloto ---
    {
      const { context, page } = await open({ data: commerce() }, 'shiitake#producto');
      assert.match((await page.locator('.purchase-submit').textContent()).trim(), /^Preparar mensaje de aviso/);
      assert.equal((await page.locator('[data-availability]').first().textContent()).trim(), 'Antes de la primera cosecha');
      assert.equal(await page.locator('#channel-notice').isVisible(), true);
      assert.match(await page.locator('#channel-notice').innerText(), /el canal aún no está abierto/);
      const msg = await fillAndSubmit(page);
      assert.match(msg, /aviso de la primera cosecha de shiitake/);
      assert.doesNotMatch(msg, /disponibilidad/i);
      pass('pilot-notice', 'pilot-sin-canal');
      await context.close();
    }
    {
      const { context, page } = await open({ data: commerce({ whatsapp: '+570000000000' }) }, 'shiitake#producto');
      assert.match((await page.locator('.purchase-submit').textContent()).trim(), /^Pedir aviso/);
      await fillAndSubmit(page);
      const link = page.locator('#order-whatsapp');
      assert.equal(await link.isVisible(), true);
      assert.equal((await link.textContent()).trim(), 'Pedir aviso por WhatsApp ↗');
      assert.ok((await link.getAttribute('href')).startsWith('https://wa.me/570000000000?text='));
      pass('pilot-notice', 'pilot-con-canal');
      await context.close();
    }
    {
      const { context, page } = await open({}, 'shiitake#producto');
      assert.equal((await page.locator('#order-form input[name="purpose"][value="restaurante"] + span').textContent()).trim(), 'Para un servicio');
      assert.equal((await page.locator('.purchase-purpose legend').textContent()).trim(), '¿Para casa o para un servicio?');
      const msg = await fillAndSubmit(page, 'restaurante');
      assert.match(msg, /para un servicio de cocina/);
      assert.match((await page.locator('#primary-nav .nav-inquiry').textContent()).replace(/\s+/g, ' '), /^Aviso de cosecha/);
      pass('pilot-notice', 'etiqueta-servicio');
      await context.close();
    }
    {
      const { context, page } = await open({}, 'shiitake?purpose=restaurante#producto');
      assert.equal(await page.locator('#order-form input[name="purpose"][value="restaurante"]').isChecked(), true);
      assert.equal(await page.locator('#restaurant-fields').isVisible(), true);
      pass('pilot-notice', 'purpose-heredado');
      await context.close();
    }
    {
      const before = browserErrors.length;
      const { context, page } = await open({ data: commerce({ availability: 'pilto' }) }, 'shiitake#producto');
      assert.equal(browserErrors.length, before);
      assert.equal((await page.locator('[data-availability]').first().textContent()).trim(), 'Disponibilidad por confirmar');
      pass('pilot-notice', 'availability-desconocida');
      await context.close();
    }
    {
      const { context, page } = await open({ data: commerce({ availability: 'unconfirmed' }) }, 'shiitake#producto');
      assert.match((await page.locator('.purchase-submit').textContent()).trim(), /^Preparar borrador/);
      const msg = await fillAndSubmit(page);
      assert.match(msg, /disponibilidad/);
      pass('pilot-notice', 'unconfirmed-sin-cambios');
      await context.close();
    }

    if (process.env.SETAS_PILOT_SKIP_LOG !== '1') {
      // --- Registro del cultivo ---
      const entry = (date, extra = {}) => ({ date, milestone: `Hito ${date}`, status: 'observado', text: `Texto ${date}`, kitchen: { home: 'Idea para casa', service: 'Dato para servicio' }, ...extra });
      {
        const { context, page } = await open({}, 'especies/shiitake#registro');
        assert.equal(await page.locator('#registro').isVisible(), true);
        assert.match(await page.locator('#registro').innerText(), /Todavía no hay registros publicados/);
        assert.equal(await page.locator('.pilot-log-entry').count(), 0);
        pass('pilot-log', 'registro-vacio');
        await context.close();
      }
      {
        const { context, page } = await open({ pilotLog: { species: 'shiitake', entries: [entry('2026-11-10'), entry('2026-12-01')] } }, 'especies/shiitake#registro');
        assert.equal(await page.locator('.pilot-log-entry').count(), 2);
        assert.equal(await page.locator('.pilot-log-entry').first().locator('time').getAttribute('datetime'), '2026-12-01');
        assert.equal(await page.locator('.pilot-log-empty').isVisible(), false);
        pass('pilot-log', 'registro-orden');
        await context.close();
      }
      {
        const { context, page } = await open({ pilotLog: { species: 'shiitake', entries: [entry('2026-11-10', { kitchen: { home: 'Idea para casa' } })] } }, 'especies/shiitake#registro');
        assert.match(await page.locator('.pilot-log-entry').innerText(), /Para un servicio: por medir/);
        pass('pilot-log', 'servicio-por-medir');
        await context.close();
      }
      {
        const { context, page } = await open({ pilotLog: { species: 'shiitake', entries: [entry('2026-11-10', { status: 'listo' })] } }, 'especies/shiitake#registro');
        assert.equal((await page.locator('.pilot-log-status').textContent()).trim(), 'Estado: por confirmar');
        assert.doesNotMatch(await page.locator('#registro').innerText(), /listo/);
        pass('pilot-log', 'estado-invalido');
        await context.close();
      }
      {
        const { context, page } = await open({ pilotLog: { species: 'shiitake', entries: [entry('2026-11-10', { milestone: '' }), entry('2026-11-20')] } }, 'especies/shiitake#registro');
        assert.equal(await page.locator('.pilot-log-entry').count(), 1);
        pass('pilot-log', 'entrada-incompleta');
        await context.close();
      }
      {
        const { context, page } = await open({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } }, 'especies/shiitake#registro');
        assert.match(await page.locator('#registro').innerText(), /Todavía no hay registros publicados/);
        pass('pilot-log', 'registro-sin-js');
        await context.close();
      }
      for (const width of [320, 390, 1440]) {
        const { context, page } = await open({ pilotLog: { species: 'shiitake', entries: [entry('2026-11-10')] }, viewport: { width, height: 900 } }, 'especies/shiitake#registro');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `registro overflow at ${width}`);
        await context.close();
      }
      pass('pilot-log', 'sin-desbordamiento-320-390-1440');
    }

    assert.deepEqual(browserErrors, []);
    console.log(JSON.stringify({ checks: checks.length, browserErrors: browserErrors.length, cases: checks.map(c => c.case) }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
