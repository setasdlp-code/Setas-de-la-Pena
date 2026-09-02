import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Setas OS — Hub de Integración IoT de Bajo Costo (ESP32 / Sonoff / Webhooks)', async (t) => {
  const jsxPath = path.join(__dirname, 'simulador-app.jsx');
  const jsx = fs.readFileSync(jsxPath, 'utf8');

  await t.test('IoTHubModal is integrated in simulador-app.jsx with node list, firmware generator, and webhook tester', () => {
    assert.match(jsx, /const IoTHubModal\s*=\s*\(\{/);
    assert.match(jsx, /Hub de Integración IoT/);
    assert.match(jsx, /Generador de Firmware/);
    assert.match(jsx, /Consola Webhook/);
    assert.match(jsx, /Reglas de Automatización/);
  });

  await t.test('Firmware generator supports ESPHome YAML, Arduino C++ (.ino), and cURL test payloads', () => {
    assert.match(jsx, /generateESPHomeYaml/);
    assert.match(jsx, /generateArduinoIno/);
    assert.match(jsx, /generateCurlPayload/);
    assert.match(jsx, /esphome/);
    assert.match(jsx, /sht3xd|scd30|dht|ds18b20/);
  });

  await t.test('ESPHome firmware never exports fallback or OTA passwords embedded in source', () => {
    assert.match(jsx, /password: !secret fallback_password/);
    assert.match(jsx, /password: !secret ota_password/);
    assert.doesNotMatch(jsx, /password: "setas-recovery"/);
    assert.doesNotMatch(jsx, /password: "setas-ota-secure"/);
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
