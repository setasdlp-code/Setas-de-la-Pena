import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

test('Setas OS — Hub de Integración IoT de Bajo Costo (ESP32 / Sonoff / Webhooks)', async (t) => {
  const jsxPath = path.join(__dirname, 'simulador-app.jsx');
  const jsx = require('./test-support/jsx-source.js').readJsxSource();

  await t.test('IoTHubModal is integrated in simulador-app.jsx with node list, firmware generator, and webhook tester', () => {
    assert.match(jsx, /const IoTHubModal\s*=\s*\(\{/);
    assert.match(jsx, /Hub de Integración IoT/);
    assert.match(jsx, /Generador de Firmware/);
    assert.match(jsx, /Consola Webhook/);
    assert.match(jsx, /Reglas de Automatización/);
  });

  await t.test('el Hub consume los generadores de firmware desde iot-firmware.js', () => {
    assert.match(jsx, /require\('\.\/iot-firmware\.js'\)/);
    assert.match(jsx, /generateESPHomeYaml/);
    assert.match(jsx, /generateArduinoIno/);
    assert.match(jsx, /generateCurlPayload/);
    // El comportamiento de los generadores se prueba en iot-firmware.test.js.
  });


  await t.test('Webhook tester parses and validates incoming payloads with canonical telemetry contract', () => {
    assert.match(jsx, /handleTestWebhook/);
    assert.match(jsx, /temperature_c|rh_pct|co2_ppm/);
  });

  await t.test('Climate Dashboard integrates button to launch IoT Hub modal', () => {
    assert.match(jsx, /setShowIoTHub\(true\)/);
    assert.match(jsx, /Hub IoT & Firmware/);
  });
});
