'use strict';
// E2E-12 — Alarma del nodo publicada → fila en Hoy → la ficha de sala la explica.
//
// Transporte SIMULADO: el snapshot de `telemetria_salas` lo empuja el test por la
// misma puerta que la suscripción de Firestore (SetasFirebase.subscribeToLiveClimate
// → bridge.onSnapshot). No hay hardware, Firestore real, publicador ni Hub IoT: lo
// que se verifica es lo que la app hace con un estado de nodo SIMULADO. Nada aquí
// prueba que un nodo real publique este contrato.
//
// Además: sin dato del nodo (sin estado / sala sin automatización), estado
// obsoleto y sin enlace, discrepancia de consigna (pide recompilar), origen de las
// bandas y horas fuera de banda en la ficha del lote (con "datos insuficientes").
// Setas OS solo lee: ningún control de escritura en ninguna de estas superficies.
// Ejecutar: node e2e/node-automation.browser.cjs   (SETAS_SHOTS_DIR=/ruta guarda capturas)
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
const shotsDir = process.env.SETAS_SHOTS_DIR || null;

const ROOM = 'cloudlab_844';
const DEVICE = 'setas-cloudlab-01';

(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  let browser;

  // Página con el transporte de Firestore simulado y un ciclo de sala activo para cloudlab_844.
  const openPage = async (width, view, { withLot = false } = {}) => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
    await page.addInitScript(({ withLot, ROOM }) => {
      localStorage.setItem('sdp_seeded', '1');
      localStorage.setItem('sdp_lotes', '[]');
      const HOUR = 3600000;
      const start = Date.now() - 72 * HOUR;
      const cycles = [{
        id: 'rc-e2e', roomId: ROOM, speciesId: 'p_ostreatus_gris', batchIds: ['BIT_NODE'], stage: 'fruiting', state: 'active',
        startAt: new Date(start).toISOString(), targets: { temperature_c: { min: 13, max: 24, source: 'kb-operational' } },
      }];
      if (withLot) {
        cycles.push({
          id: 'rc-e2e-inc', roomId: 'incubacion_01', speciesId: 'p_ostreatus_gris', batchIds: ['BIT_NODE'], stage: 'incubation', state: 'closed',
          startAt: new Date(start - 10 * 24 * HOUR).toISOString(), endAt: new Date(start - 24 * HOUR).toISOString(),
          targets: { temperature_c: { min: 20, max: 24, source: 'kb-operational' } },
        });
        localStorage.setItem('sdp_bit_lotes', JSON.stringify([{
          id: 'BIT_NODE', codigo: 'SDP-NODE-01', sKey: 'p_ostreatus_gris', especie: 'p_ostreatus_gris', estado: 'fructificacion', sala: ROOM,
          fechaInoculacion: new Date(start - 20 * 24 * HOUR).toISOString().slice(0, 10), numBolsas: 1, createdAt: new Date(start - 20 * 24 * HOUR).toISOString(),
        }]));
        // Telemetría SIMULADA del ciclo de fructificación: una lectura cada 30 min, 72 h;
        // las primeras 6 h por debajo de la banda (10 °C < 13). La etapa de incubación no tiene lecturas.
        const readings = [];
        for (let i = 0; i < 144; i += 1) {
          readings.push({
            schema: 'setas.telemetry.v1', room_id: ROOM, device_id: 'e2e-sensor', metric: 'temperature_c', value: i < 12 ? 10 : 16, unit: '°C',
            observed_at: new Date(start + i * HOUR / 2).toISOString(), quality: 'valid', quality_reasons: [], source: 'measured',
          });
        }
        localStorage.setItem('sdp_telemetry_v1', JSON.stringify(readings));
      }
      localStorage.setItem('sdp_room_cycles', JSON.stringify(cycles));
      window.SETAS_LIVE_TELEMETRY = { websocketUrl: '', firestore: true };
      window.__roomDocs = {};
      window.SetasFirebase = { subscribeToLiveClimate: cb => { window.__fsCallback = cb; return () => { window.__fsCallback = null; }; } };
    }, { withLot, ROOM });
    await page.goto(`http://127.0.0.1:${port}/__harness.html?view=${view}`);
    await page.waitForFunction(() => typeof window.__fsCallback === 'function');
    return { page, errors };
  };

  // Publica el último estado del nodo como lo guardaría el publicador, con la edad indicada.
  const publish = (page, { ageMs = 20000, status = {} } = {}) => page.evaluate(({ ROOM, DEVICE, ageMs, status }) => {
    const node_status = {
      schema: 'setas.node-status.v1',
      observed_at: new Date(Date.now() - ageMs).toISOString(),
      commissioned: false,
      control_state: 'auto',
      heating_enabled: true,
      uptime_s: 600,
      relays: { light: false, circulation: true, heat: true, spare: false },
      relay_on_s: { light: 0, circulation: 300, heat: 200 },
      alarms: [],
      setpoints: { consigna_id: 'rc-e2e@20261114T150000Z', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 },
      ...status,
    };
    window.__roomDocs[ROOM] = { room_id: ROOM, device_readings: { [DEVICE]: { position: 'centro', metrics: {}, node_status } } };
    window.__fsCallback({ ...window.__roomDocs });
  }, { ROOM, DEVICE, ageMs, status });

  const shot = async (page, name, width) => { if (shotsDir) await page.screenshot({ path: path.join(shotsDir, `${name}-${width}.png`), fullPage: false }); };

  const noOverflow = async (page, label) => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `desborde horizontal: ${label}`);
  const assertReadOnly = async (loc, label) => assert.equal(await loc.locator('button,input,select,textarea,[role="switch"],[role="button"]').count(), 0, `${label}: ningún control de escritura`);
  const fontPx = async loc => loc.evaluate(el => parseFloat(getComputedStyle(el).fontSize));

  // Abre Clima con la sala indicada ya seleccionada desde la fila de Hoy.
  const openRoomFromRow = async (page, row) => {
    const btn = row.getByRole('button', { name: 'Abrir sala' });
    const box = await btn.boundingBox();
    // Tolerancia de 0,01 px: el layout fraccionario daba 47,99993 px de forma intermitente.
    assert.ok(box && box.height >= 47.99, `"Abrir sala" mide ${box && box.height} px (<48)`);
    await btn.click();
    await expect(page.getByTestId('climate-actuators-panel')).toBeVisible();
    await expect(page.getByTestId('room-card').and(page.locator(`[data-room-id="${ROOM}"]`))).toHaveAttribute('aria-pressed', 'true');
  };

  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    for (const width of [1280, 390]) {
      // ── 1. Alarma publicada → fila en Hoy → la ficha de sala la explica ──
      {
        const { page, errors } = await openPage(width, 'home');
        await expect(page.locator('[data-exception-kind="nodo"]')).toHaveCount(0);
        await publish(page, { status: { control_state: 'alarm', alarms: ['over_temperature'], relays: { light: false, circulation: true, heat: false, spare: false } } });
        const row = page.locator(`[data-exception-kind="nodo"][data-severity="alarma"]`);
        await expect(row).toHaveCount(1);
        await expect(row).toContainText('Cloudlab 844: 1 alarma activa del nodo setas-cloudlab-01');
        const detail = row.getByTestId('today-exception-detail');
        await expect(detail).toContainText('Por qué ahora:');
        await expect(detail).toContainText('Temperatura en o sobre el techo de la banda: calefacción OFF');
        await expect(detail).toContainText('Siguiente:');
        await expect(detail).toContainText('Setas OS solo lee');
        assert.ok(await fontPx(detail) >= 16, 'texto operativo de la fila ≥16 px');
        // Con una excepción visible, Hoy no puede decir que todo está dentro de rango.
        await expect(page.getByText('Sin excepciones fuera de banda')).toHaveCount(0);
        await row.scrollIntoViewIfNeeded();
        await shot(page, 'hoy-alarma-nodo', width);
        await openRoomFromRow(page, row);
        const panel = page.getByTestId('climate-actuators-panel');
        await expect(panel).toHaveAttribute('data-automation-state', 'nodes');
        const card = panel.getByTestId('node-card');
        await expect(card).toHaveAttribute('data-link-state', 'fresh');
        await expect(card.getByTestId('node-link-badge')).toContainText('Al día');
        await expect(card.getByTestId('node-alarms')).toContainText('over_temperature');
        await expect(card.getByTestId('node-alarms')).toContainText('Temperatura en o sobre el techo de la banda: calefacción OFF');
        await expect(card.locator('[data-relay="heat"]')).toContainText('Apagado (comandado)');
        await expect(card.locator('[data-relay="circulation"]')).toContainText('Encendido (comandado)');
        await expect(card.getByTestId('node-control-state')).toContainText('En alarma');
        await expect(card).toContainText('Estado comandado por el firmware, no medición del contacto');
        await expect(card.getByTestId('node-setpoint')).toContainText('techo 24 °C');
        await expect(card.getByTestId('node-setpoint-origin')).toContainText('Consigna aprobada (KB)');
        await expect(card.getByTestId('node-uncommissioned')).toBeVisible();
        await assertReadOnly(panel, 'panel del nodo');
        assert.ok(await fontPx(card.getByTestId('node-control-state')) >= 16, 'texto de la ficha ≥16 px');
        // Origen de las bandas: temperatura viene del ciclo; HR y CO₂ siguen sin fuente.
        const origins = page.getByTestId('climate-band-origins');
        await expect(origins.locator('[data-metric="temperature_c"]')).toContainText('Consigna aprobada (KB) · ciclo activo');
        await expect(origins.locator('[data-metric="rh_pct"]')).toContainText('predeterminado de la app, sin fuente');
        await expect(origins.locator('[data-metric="co2_ppm"]')).toContainText('predeterminado de la app, sin fuente');
        await noOverflow(page, `ficha de sala ${width}`);
        await panel.scrollIntoViewIfNeeded();
        await shot(page, 'sala-alarma-nodo', width);
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }

      // ── 2. Discrepancia de consigna: el texto manda recompilar ──
      {
        const { page, errors } = await openPage(width, 'home');
        await publish(page, { status: { setpoints: { consigna_id: 'rc-viejo@20261001T000000Z', heat_setpoint_c: 12, hysteresis_c: 0.5, temp_max_c: 22 } } });
        const row = page.locator('[data-exception-kind="nodo"]');
        await expect(row).toHaveCount(1);
        await expect(row).toHaveAttribute('data-severity', 'vigilar');
        await expect(row).toContainText('la consigna del nodo setas-cloudlab-01 no coincide con el ciclo activo');
        await expect(row.getByTestId('today-exception-detail')).toContainText('Techo de temperatura: el nodo reporta 22 °C y el ciclo activo pide 24 °C');
        await expect(row.getByTestId('today-exception-detail')).toContainText('Recompilar y volver a cargar el firmware del nodo');
        await openRoomFromRow(page, row);
        const mismatch = page.getByTestId('node-setpoint-mismatch');
        await expect(mismatch).toContainText('Consigna distinta del ciclo de sala');
        await expect(mismatch).toContainText('Recompilar y volver a cargar el firmware del nodo');
        await expect(mismatch).toContainText('Consigna aprobada (KB)');
        await shot(page, 'sala-consigna-distinta', width);
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }

      // ── 3. Obsoleto (alarma con estado de hace 3 min) y sin enlace (hace 30 min) ──
      {
        const { page, errors } = await openPage(width, 'home');
        await publish(page, { ageMs: 3 * 60000, status: { control_state: 'alarm', alarms: ['sensor_invalid'] } });
        const row = page.locator('[data-exception-kind="nodo"][data-severity="alarma"]');
        await expect(row).toContainText('(obsoleto)');
        await openRoomFromRow(page, row);
        const card = page.getByTestId('node-card');
        await expect(card).toHaveAttribute('data-link-state', 'stale');
        await expect(card.getByTestId('node-link-badge')).toContainText('Obsoleto');
        await expect(card.getByTestId('node-stale-note')).toContainText('último estado conocido, no el actual');
        await shot(page, 'sala-nodo-obsoleto', width);
        await publish(page, { ageMs: 30 * 60000, status: { control_state: 'alarm', alarms: ['sensor_invalid'] } });
        await expect(card).toHaveAttribute('data-link-state', 'offline');
        await expect(card.getByTestId('node-link-badge')).toContainText('Sin enlace');
        await expect(card.getByTestId('node-offline-note')).toBeVisible();
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }
      {
        const { page, errors } = await openPage(width, 'home');
        await publish(page, { ageMs: 30 * 60000 });
        const row = page.locator('[data-exception-kind="nodo"]');
        await expect(row).toHaveCount(1);
        await expect(row).toContainText('nodo setas-cloudlab-01 sin enlace');
        await expect(row).toContainText('banco de pruebas, no comisionado');
        await expect(row.getByTestId('today-exception-detail')).toContainText('Sin enlace Setas OS no ve sus relés ni sus alarmas');
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }

      // ── 4. Sin dato: nunca "en rango" ni relés apagados inventados ──
      {
        const { page, errors } = await openPage(width, 'clima');
        const panel = page.getByTestId('climate-actuators-panel');
        // Martha (seleccionada por omisión) no tiene perfil de nodo.
        await expect(panel).toHaveAttribute('data-automation-state', 'no-automation');
        await expect(panel.getByTestId('node-no-automation')).toContainText('Sala sin automatización');
        await page.locator(`[data-testid="room-card"][data-room-id="${ROOM}"]`).click();
        await expect(panel).toHaveAttribute('data-automation-state', 'no-data');
        await expect(panel.getByTestId('node-no-data')).toContainText('Sin datos del nodo');
        assert.equal(await panel.getByTestId('node-card').count(), 0);
        assert.equal(await panel.locator('[data-relay]').count(), 0, 'sin estado no se pintan relés');
        await assertReadOnly(panel, 'panel sin datos');
        // Sala sin ciclo activo (Martha): toda banda declara que no tiene fuente.
        await page.locator('[data-testid="room-card"][data-room-id="martha_01"]').click();
        const origins = page.getByTestId('climate-band-origins');
        for (const metric of ['temperature_c', 'rh_pct', 'co2_ppm']) {
          await expect(origins.locator(`[data-metric="${metric}"]`)).toContainText('predeterminado de la app, sin fuente');
        }
        await shot(page, 'sala-sin-automatizacion', width);
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }

      // ── 5. Ficha de lote: horas fuera de banda por etapa, con "datos insuficientes" ──
      {
        const { page, errors } = await openPage(width, 'bitacora', { withLot: true });
        const card = page.locator('.panel.sdp-lote[data-lote-id="BIT_NODE"]').first();
        await card.waitFor({ state: 'visible' });
        await card.click();
        const panel = page.getByTestId('batch-out-of-band');
        await expect(panel).toBeVisible();
        const stages = panel.getByTestId('batch-oob-stage');
        await expect(stages).toHaveCount(2);
        const incubation = stages.filter({ hasText: 'Incubación' });
        const fruiting = stages.filter({ hasText: 'Fructificación' });
        const incRow = incubation.getByTestId('batch-oob-row');
        await expect(incRow).toHaveAttribute('data-status', 'insufficient');
        await expect(incRow).toContainText('Datos insuficientes');
        await expect(incRow).toContainText('cobertura 0 %');
        await expect(incRow).not.toContainText('fuera de banda');
        const fruRow = fruiting.getByTestId('batch-oob-row');
        await expect(fruRow).toHaveAttribute('data-status', 'ok');
        await expect(fruRow).toContainText('6 h fuera de banda');
        await expect(fruRow).toContainText('cobertura 99 %');
        await expect(fruRow).toContainText('Consigna aprobada (KB)');
        assert.ok(await fontPx(fruRow) >= 16, 'texto de horas fuera de banda ≥16 px');
        await assertReadOnly(panel, 'horas fuera de banda');
        await noOverflow(page, `ficha de lote ${width}`);
        await panel.scrollIntoViewIfNeeded();
        await shot(page, 'lote-horas-fuera-de-banda', width);
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }

      // ── 6. Hub IoT: la pestaña de nodos solo lee el estado real; sin estado no hay nodos "en línea" ──
      {
        const { page, errors } = await openPage(width, 'clima');
        await page.getByRole('button', { name: 'Hub IoT & Firmware' }).click();
        const hub = page.getByRole('dialog', { name: 'Hub de Integración IoT & Telemetría' });
        const tabs = hub.getByRole('tablist', { name: 'Secciones del Hub IoT' });
        const nodesTab = tabs.getByRole('tab', { name: /Nodos de control/ });
        await expect(nodesTab).toContainText('(0)');
        await expect(tabs.getByRole('tab', { name: /Reglas/ })).toHaveCount(0);
        const panel = hub.getByTestId('iot-hub-nodos');
        const rooms = panel.getByTestId('iot-hub-room');
        await expect(rooms).toHaveCount(3);
        await expect(rooms.and(page.locator('[data-room-id="martha_01"]'))).toContainText('Sala sin automatización');
        await expect(rooms.and(page.locator('[data-room-id="incubacion_01"]'))).toContainText('Sala sin automatización');
        await expect(rooms.and(page.locator(`[data-room-id="${ROOM}"]`))).toContainText('Sin datos del nodo');
        assert.equal(await panel.getByTestId('node-card').count(), 0, 'sin estado recibido no hay tarjeta de nodo');
        assert.equal(await panel.locator('[data-relay]').count(), 0, 'sin estado no se pintan relés');
        const text = await panel.innerText();
        assert.doesNotMatch(text, /online|RSSI|MAC:|IP:|Excelente/i, 'la pestaña no muestra datos de red inventados');
        // Con un estado real (simulado por el transporte) el nodo aparece, con su antigüedad y solo lectura.
        await publish(page, { ageMs: 20000 });
        await expect(nodesTab).toContainText('(1)');
        const card = panel.getByTestId('node-card');
        await expect(card).toHaveCount(1);
        await expect(card).toHaveAttribute('data-link-state', 'fresh');
        await expect(card.locator('[data-relay="heat"]')).toContainText('Encendido (comandado)');
        await expect(rooms.and(page.locator(`[data-room-id="${ROOM}"]`))).not.toContainText('Sin datos del nodo');
        await assertReadOnly(card, 'tarjeta de nodo en el Hub');
        // "Ver sala en Clima" lleva a la sala y cierra el Hub.
        await rooms.and(page.locator(`[data-room-id="${ROOM}"]`)).getByRole('button', { name: 'Ver sala en Clima' }).click();
        await expect(hub).toHaveCount(0);
        await expect(page.getByTestId('room-card').and(page.locator(`[data-room-id="${ROOM}"]`))).toHaveAttribute('aria-pressed', 'true');
        assert.deepEqual(errors, [], `errores de página: ${errors.join(' | ')}`);
        await page.close();
      }
    }
    console.log('PASS node-automation: alarma del nodo → fila en Hoy → ficha de sala; sin dato / sin automatización; obsoleto y sin enlace; consigna distinta (recompilar); origen de bandas; horas fuera de banda del lote con datos insuficientes; pestaña de nodos del Hub IoT solo de lectura (sin nodos inventados); solo lectura, a 1280 y 390 px (transporte simulado).');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
