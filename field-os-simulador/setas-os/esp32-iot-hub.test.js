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
    assert.match(jsx, /Nodos de control/);
    assert.match(jsx, /Generador de Firmware/);
    assert.match(jsx, /Consola Webhook/);
    assert.match(jsx, /Conexión en Vivo/);
  });

  await t.test('la pestaña de nodos es de solo lectura y sale del estado real, no de nodos de ejemplo', () => {
    const modal = fs.readFileSync(path.join(__dirname, 'views', 'iot-hub-modal.jsx'), 'utf8');
    // Sin lista fija ni métricas, IP, MAC o RSSI inventados, y sin estado "online" propio.
    assert.doesNotMatch(jsx, /DEFAULT_IOT_NODES|Nodos en Finca|iot-node-badge/);
    assert.doesNotMatch(modal, /RSSI|MAC:|IP:|● \{n\.status\}/);
    // El modal recibe las salas ya armadas por node-automation.js (buildRoomAutomation).
    assert.match(modal, /nodeRooms = null/);
    assert.match(modal, /<NodeAutomationCard key=/);
    assert.match(jsx, /nodeRooms=\{Array\.from\(new Set\(\[\.\.\.Object\.keys\(ROOMS_CONFIG\)/);
    assert.match(jsx, /buildRoomNodeAutomation\(id\)/);
    // Sin estado recibido el texto es honesto (los textos viven en node-automation.js).
    assert.match(modal, /Sin nodos registrados/);
    assert.match(modal, /view\.noDataLabel/);
  });

  await t.test('el Hub no tiene pestaña ni controles de reglas de automatización (el control vive en el firmware del nodo)', () => {
    const modal = fs.readFileSync(path.join(__dirname, 'views', 'iot-hub-modal.jsx'), 'utf8');
    assert.doesNotMatch(jsx, /Reglas de Automatización|Reglas Actualizadas|Guardar Parámetros de Automatización|iot-rule-|autoFaeDuration|autoRhMin|autoCo2Max|autoSubTempMax/);
    assert.doesNotMatch(modal, /'reglas'/);
    assert.match(modal, /const keys=\['nodos','firmware','webhook','conexion'\];/);
  });

  await t.test('el Hub consume los generadores de firmware desde iot-firmware.js', () => {
    assert.match(jsx, /require\('\.\/iot-firmware\.js'\)/);
    assert.match(jsx, /generateESPHomeYaml/);
    assert.match(jsx, /generateArduinoIno/);
    assert.match(jsx, /generateCurlPayload/);
    // El comportamiento de los generadores se prueba en iot-firmware.test.js.
  });


  await t.test('el generador de firmware no ofrece relés y rotula su salida como plantilla de telemetría', () => {
    assert.doesNotMatch(jsx, /fwRelays|toggleRelay|Actuadores \/ Relés|Relé Ch[12]/);
    assert.match(jsx, /data-testid="iot-template-note"/);
    assert.match(jsx, /Plantilla de telemetría: solo sensores, sin relés/);
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
