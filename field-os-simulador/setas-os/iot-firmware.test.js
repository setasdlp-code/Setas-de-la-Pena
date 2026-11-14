'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_IOT_NODES, generateESPHomeYaml, generateArduinoIno, generateCurlPayload,
} = require('./iot-firmware.js');

test('el módulo también se publica como global para el navegador', () => {
  assert.equal(globalThis.SetasIotFirmware.generateESPHomeYaml, generateESPHomeYaml);
});

test('los nodos por defecto tienen identidad, sala y sensores', () => {
  assert.ok(DEFAULT_IOT_NODES.length > 0);
  const ids = DEFAULT_IOT_NODES.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length, 'ids de nodo repetidos');
  DEFAULT_IOT_NODES.forEach((n) => {
    assert.ok(n.roomId, `${n.id}: sin roomId`);
    assert.ok(n.sensors, `${n.id}: sin sensores`);
  });
});

test('ESPHome: las contraseñas de recuperación y OTA salen como !secret, nunca en claro', () => {
  const yaml = generateESPHomeYaml({});
  assert.match(yaml, /password: !secret fallback_password/);
  assert.match(yaml, /password: !secret ota_password/);
  assert.doesNotMatch(yaml, /password: "setas-recovery"/);
  assert.doesNotMatch(yaml, /password: "setas-ota-secure"/);
});

test('ESPHome: usa el nombre de dispositivo pedido y declara plataformas de sensor', () => {
  const yaml = generateESPHomeYaml({ deviceName: 'setas-prueba-07' });
  assert.match(yaml, /setas-prueba-07/);
  assert.match(yaml, /platform: (sht3xd|scd30|dht|dallas|ds18b20)/);
});

test('Arduino: el sketch lleva la sala y el endpoint de telemetría pedidos', () => {
  const ino = generateArduinoIno({ roomId: 'sala_x', serverHost: '10.0.0.9', serverPort: '9000' });
  assert.match(ino, /const char\* roomId = "sala_x";/);
  assert.match(ino, /http:\/\/10\.0\.0\.9:9000\/api\/telemetry/);
});

test('curl: el payload es JSON válido con los campos del contrato de telemetría', () => {
  const cmd = generateCurlPayload({ roomId: 'sala_x', temp: 17.5, rh: 90, co2: 800, subTemp: 18 });
  const body = JSON.parse(cmd.slice(cmd.indexOf("-d '") + 4, cmd.lastIndexOf("'")));
  assert.equal(body.room_id, 'sala_x');
  assert.equal(body.temperature_c, 17.5);
  assert.equal(body.rh_pct, 90);
  assert.equal(body.co2_ppm, 800);
  assert.equal(body.substrate_temperature_c, 18);
  assert.ok(!Number.isNaN(Date.parse(body.observed_at)));
});
