'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  validateNodeStatus, normalizeNodeStatus, nodeStatusesFromRoomDoc, summarizeNodeStatus, NODE_STATUS_SCHEMA,
} = require('./telemetry-contract.js');
const profiles = require('./node-control-profiles.json');

const profile = profiles.profiles.cloudlab_844;
const status = (over = {}) => ({
  schema: NODE_STATUS_SCHEMA, observed_at: '2026-11-14T15:00:00Z', commissioned: false,
  control_state: 'auto', heating_enabled: true, uptime_s: 600,
  relays: { light: false, circulation: true, heat: true, spare: false },
  relay_on_s: { light: 0, circulation: 300, heat: 200 },
  alarms: [],
  setpoints: { consigna_id: 'rc-test-1@20261114T150000Z', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 },
  ...over,
});

test('estado válido del firmware pasa con el perfil de la sala', () => {
  assert.deepEqual(validateNodeStatus(status(), profile), []);
  assert.equal(normalizeNodeStatus(status()).provenance, 'reported');
});

test('relés y alarmas deben ser los del perfil (contrato por configuración)', () => {
  assert.match(validateNodeStatus(status({ relays: { humidifier: true } }), profile).join(), /relay not in room profile/);
  assert.match(validateNodeStatus(status({ alarms: ['made_up'] }), profile).join(), /alarm not in room profile/);
  // Sin perfil solo se valida la forma.
  assert.deepEqual(validateNodeStatus(status({ relays: { humidifier: true }, relay_on_s: {} })), []);
});

test('formas inválidas se rechazan', () => {
  const bad = [
    [status({ schema: 'otro' }), /schema/],
    [status({ observed_at: 'ayer' }), /observed_at/],
    [status({ control_state: 'manual' }), /control_state/],
    [status({ relays: {} }), /relays required/],
    [status({ relays: { heat: 'on' } }), /must be boolean/],
    [status({ relay_on_s: { heat: -5 } }), /non-negative/],
    [status({ relay_on_s: { fan2: 5 } }), /unknown relay/],
    [status({ alarms: 'sensor_invalid' }), /alarms must be an array/],
    [status({ alarms: ['sensor_invalid', 'sensor_invalid'], control_state: 'alarm' }), /duplicate/],
    [status({ control_state: 'alarm', alarms: [] }), /requires an active alarm/],
    [status({ setpoints: undefined }), /setpoints required/],
    [status({ setpoints: { consigna_id: 'a b<' } }), /consigna_id/],
    [status({ setpoints: { consigna_id: 'x', heat_setpoint_c: 500 } }), /heat_setpoint_c/],
    [status({ setpoints: { consigna_id: 'x', hysteresis_c: 0 } }), /hysteresis_c must be positive/],
    [status({ setpoints: { consigna_id: 'x', light_on_hour: 7.5 } }), /light_on_hour/],
    [status({ uptime_s: -1 }), /uptime_s/],
    [null, /object/],
  ];
  for (const [s, re] of bad) assert.match(validateNodeStatus(s, profile).join(' | '), re);
});

test('alarma de sensor inválido con estado alarm es válida', () => {
  assert.deepEqual(validateNodeStatus(status({ control_state: 'alarm', alarms: ['sensor_invalid'], relays: { light: false, circulation: false, heat: false, spare: false } }), profile), []);
});

test('el firmware emite exactamente los relés y alarmas que declara el perfil', () => {
  const pkg = fs.readFileSync(path.join(__dirname, '..', '..', 'esphome', 'modulo-fructificacion.package.yaml'), 'utf8');
  const relays = [...pkg.matchAll(/relays\["(\w+)"\]/g)].map(m => m[1]).sort();
  const alarms = [...pkg.matchAll(/alarms\.add\("(\w+)"\)/g)].map(m => m[1]).sort();
  const states = [...pkg.matchAll(/estado = "(\w+)"/g)].map(m => m[1]);
  assert.deepEqual(relays, profile.relays.map(r => r.id).sort());
  assert.deepEqual(alarms, Object.keys(profile.alarms).sort());
  for (const s of ['starting', 'alarm', 'locked', 'disabled', 'auto']) assert.ok(states.includes(s), s);
  assert.match(pkg, /doc\["schema"\] = "setas\.node-status\.v1"/);
});

test('estado del documento de sala y resumen por ciclo (fracción comandada)', () => {
  const doc = { device_readings: { 'setas-cloudlab-01': { position: null, metrics: {}, node_status: status() } } };
  const list = nodeStatusesFromRoomDoc(doc);
  assert.equal(list.length, 1);
  assert.equal(list[0].device_id, 'setas-cloudlab-01');
  const history = [
    status({ observed_at: '2026-11-14T10:00:00Z', uptime_s: 100, relay_on_s: { heat: 0 } }),
    status({ observed_at: '2026-11-14T10:01:40Z', uptime_s: 200, relay_on_s: { heat: 50 } }),
    status({ observed_at: '2026-11-14T10:03:20Z', uptime_s: 300, relay_on_s: { heat: 50 }, control_state: 'alarm', alarms: ['sensor_invalid'] }),
    // reinicio: el contador vuelve a cero y corta el tramo
    status({ observed_at: '2026-11-14T10:05:00Z', uptime_s: 10, relay_on_s: { heat: 0 } }),
    status({ observed_at: '2026-11-14T10:06:40Z', uptime_s: 110, relay_on_s: { heat: 100 } }),
    status({ observed_at: '2026-11-15T10:00:00Z', uptime_s: 999999, relay_on_s: { heat: 0 } }), // fuera del ciclo
  ];
  const s = summarizeNodeStatus(history, { startAt: '2026-11-14T00:00:00Z', endAt: '2026-11-14T23:59:59Z' });
  assert.equal(s.samples, 5);
  assert.equal(s.restarts, 1);
  assert.equal(s.covered_seconds, 300);
  assert.equal(s.on_fraction, 150 / 300);
  assert.equal(s.alarm_samples, 1);
  assert.deepEqual(s.alarm_counts, { sensor_invalid: 1 });
  assert.equal(s.commissioned, false);
  assert.equal(s.provenance, 'reported');
  assert.equal(summarizeNodeStatus([], null).on_fraction, null);
});
