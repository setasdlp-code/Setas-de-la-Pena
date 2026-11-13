'use strict';
// Exercise the real bridge and React cards; shell values intentionally disagree.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    let body = fs.readFileSync(file);
    if (file.endsWith('__harness.html')) body = body.toString().replace('tab: tab,', `hoyCamarasJson: JSON.stringify(['martha','cloudlab','incub','unknown'].map(id => ({id,name:id,liveTemp:99,liveHum:99,liveCo2:9999}))), tab: tab,`);
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(body);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    for (const transport of ['websocket', 'firestore']) for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
      let socket = null;
      const websocketUrl = `ws://127.0.0.1:${server.address().port}/telemetria`;
      await page.routeWebSocket(websocketUrl, ws => { socket = ws; });
      await page.addInitScript(({ websocketUrl, transport }) => {
        localStorage.setItem('sdp_seeded', '1');
        localStorage.setItem('sdp_lotes', '[]');
        window.SETAS_LIVE_TELEMETRY = { websocketUrl: transport === 'websocket' ? websocketUrl : '', firestore: transport === 'firestore' };
        if (transport === 'firestore') {
          window.testRoomDocs = {};
          window.SetasFirebase = { subscribeToLiveClimate: cb => { window.testFirestoreCallback = cb; return () => { window.testFirestoreCallback = null; }; } };
        }
      }, { websocketUrl, transport });
      // Capture the actual bridge instance without replacing its implementation.
      await page.route('**/live-telemetry-bridge.js', async route => {
        const source = fs.readFileSync(path.join(root, 'live-telemetry-bridge.js'), 'utf8');
        await route.fulfill({ contentType: 'application/javascript', body: source + '\nconst originalBridge = SetasLiveBridge.createLiveTelemetryBridge; SetasLiveBridge.createLiveTelemetryBridge = options => (window.testBridge = originalBridge(options));' });
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=clima`);
      const grid = page.getByTestId('salas-grid');
      await expect(grid).toBeVisible();
      const martha = grid.locator('[data-room-id="martha_01"]');
      const cloud = grid.locator('[data-room-id="cloudlab_844"]');
      await expect(martha.locator('[data-metric="temperature_c"] strong')).toHaveText('—');
      await page.waitForFunction(() => window.testBridge);
      if (transport === 'websocket') await expect.poll(() => socket !== null).toBe(true);
      else await page.waitForFunction(() => typeof window.testFirestoreCallback === 'function');
      const send = async packet => {
        if (transport === 'websocket') socket.send(JSON.stringify(packet));
        else await page.evaluate(packet => {
          const metric_readings = {};
          for (const metric of ['temperature_c', 'rh_pct', 'co2_ppm']) {
            if (Number.isFinite(packet[metric])) metric_readings[metric] = {
              metric, value: packet[metric], observed_at: packet.observed_at,
              device_id: packet.device_id, source: 'esp32_hardware',
              co2_pressure_compensated: packet.co2_pressure_compensated === true,
            };
          }
          window.testRoomDocs[packet.room_id] = { room_id: packet.room_id, metric_readings };
          window.testFirestoreCallback({ ...window.testRoomDocs });
        }, packet);
      };
      const at = new Date().toISOString();
      await send({ room_id: 'martha_01', device_id: 'sensor-martha', observed_at: at, temperature_c: 19, rh_pct: 85, co2_ppm: 600, co2_pressure_compensated: true });
      await send({ room_id: 'cloudlab_844', device_id: 'sensor-cloud', observed_at: at, temperature_c: 21 });
      await expect(martha.locator('[data-metric="temperature_c"] strong')).toHaveText('19°C');
      await expect(martha.locator('[data-metric="co2_ppm"] strong')).toHaveText('600 ppm');
      await expect(cloud.locator('[data-metric="temperature_c"] strong')).toHaveText('21°C');
      await expect(cloud.locator('[data-metric="rh_pct"] strong')).toHaveText('—');
      await expect(martha.getByTestId('climate-provenance-temperature_c')).toHaveAttribute('data-provenance', 'measured');
      const replayAt = new Date(Date.now() - 3600000).toISOString();
      await send({ room_id: 'martha_01', device_id: 'sensor-old', observed_at: replayAt, rh_pct: 80 });
      // Wait for this exact replay to reach history before checking current state.
      await expect.poll(() => page.evaluate(replayAt => testBridge.getSeries('martha_01', 'rh_pct').points.some(p => p.t === Date.parse(replayAt)), replayAt)).toBe(true);
      assert.equal(await page.evaluate(() => testBridge.getSample('martha_01').rh_pct), 85);
      // An old packet cannot overwrite the newer reading.
      await expect(martha.locator('[data-metric="rh_pct"] strong')).toHaveText('85%');
      const unknown = grid.getByTestId('sensor-module-card').filter({ hasText: 'unknown' });
      await expect(unknown).toBeDisabled();
      await expect(unknown.locator('[data-metric="temperature_c"] strong')).toHaveText('—');
      await cloud.click();
      await expect(cloud).toHaveAttribute('aria-pressed', 'true');
      // A second node in the same room keeps its own row; the spread uses both.
      await send({ room_id: 'cloudlab_844', device_id: 'sensor-cloud-2', observed_at: at, temperature_c: 19 });
      const perDevice = page.getByTestId('room-device-readings');
      await expect(perDevice.locator('[data-device-id="sensor-cloud"] [data-metric="temperature_c"]')).toHaveText('21°C');
      await expect(perDevice.locator('[data-device-id="sensor-cloud-2"] [data-metric="temperature_c"]')).toHaveText('19°C');
      await expect(perDevice.locator('[data-device-id="sensor-cloud-2"] [data-metric="rh_pct"]')).toHaveText('—');
      await expect(page.getByTestId('room-device-spread').locator('[data-metric="temperature_c"]')).toHaveText('2°C');
      await expect(page.getByTestId('climate-bands-provisional')).toHaveAttribute('data-band-origin', 'room');
      await expect(page.getByTestId('climate-substrate-missing')).toContainText('sin sensor de núcleo');
      await expect(martha.locator('[data-metric="temperature_c"] strong')).toHaveText('19°C');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Module sensors (WebSocket + Firestore subscription): bridge-to-card routing, partial/missing readings, provenance, unknown mapping, and room switching passed on desktop/mobile.');
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
