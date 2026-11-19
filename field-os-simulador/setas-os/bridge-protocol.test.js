'use strict';
// Pruebas de bridge-protocol.js: contrato único de postMessage shell ↔ Banco Climático.
// Documenta el comportamiento actual, incluido que el envío usa targetOrigin '*'
// (hallazgo de auditoría 2026-11-17; cambiarlo es una decisión de seguridad aparte).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { BRIDGE_MESSAGES, isBridgeMessage, sendBridgeMessage } = require('./bridge-protocol.js');

test('BRIDGE_MESSAGES declara source, kind y direction en cada mensaje', () => {
  for (const [name, def] of Object.entries(BRIDGE_MESSAGES)) {
    assert.ok(def.source && def.kind && def.direction, `${name} incompleto`);
    assert.match(def.direction, /^(child-to-parent|parent-to-child)$/);
  }
});

test('isBridgeMessage exige source y kind exactos', () => {
  const def = BRIDGE_MESSAGES.CLIMATE_ALERT;
  assert.equal(isBridgeMessage({ source: def.source, kind: def.kind }, def), true);
  assert.equal(isBridgeMessage({ source: def.source, kind: 'otro' }, def), false);
  assert.equal(isBridgeMessage({ source: 'otro', kind: def.kind }, def), false);
  assert.equal(isBridgeMessage(null, def), false);
  assert.equal(isBridgeMessage({ source: def.source, kind: def.kind }, null), false);
});

test('sendBridgeMessage antepone source/kind al payload y envía con targetOrigin "*"', () => {
  const calls = [];
  const target = { postMessage: (msg, origin) => calls.push([msg, origin]) };
  sendBridgeMessage(target, BRIDGE_MESSAGES.CLIMA_VISIBILITY, { active: true });
  assert.deepEqual(calls, [[{ source: 'setas-os-shell', kind: 'clima-visibility', active: true }, '*']]);
});

test('sendBridgeMessage ignora destino o definición ausentes y traga errores de postMessage', () => {
  assert.doesNotThrow(() => sendBridgeMessage(null, BRIDGE_MESSAGES.CLIMATE_ALERT, {}));
  assert.doesNotThrow(() => sendBridgeMessage({ postMessage() {} }, null, {}));
  const roto = { postMessage() { throw new Error('cross-origin'); } };
  assert.doesNotThrow(() => sendBridgeMessage(roto, BRIDGE_MESSAGES.CLIMATE_ALERT, {}));
});
