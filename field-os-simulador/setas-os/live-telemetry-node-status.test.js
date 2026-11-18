'use strict';
// El puente en vivo expone el último node_status de cada sala (solo lectura) a
// partir del snapshot de `telemetria_salas`. Documentos SIMULADOS.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLiveTelemetryBridge, nodeStatusRowsFromRoomDoc } = require('./live-telemetry-bridge.js');

const NODE_STATUS = {
  schema: 'setas.node-status.v1',
  observed_at: '2026-11-14T15:00:00Z',
  commissioned: false,
  control_state: 'alarm',
  heating_enabled: true,
  uptime_s: 600,
  relays: { light: false, circulation: true, heat: false, spare: false },
  relay_on_s: { light: 0, circulation: 300, heat: 0 },
  alarms: ['sensor_invalid'],
  setpoints: { consigna_id: 'rc-1@20261114T150000Z', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 },
};
// Sensor inválido: el nodo manda solo estado, sin lecturas.
const statusOnlyDoc = () => ({ device_readings: { 'setas-cloudlab-01': { position: 'centro', metrics: {}, node_status: { ...NODE_STATUS } } } });
const withReadingsDoc = () => ({
  device_readings: {
    'setas-cloudlab-01': {
      position: 'centro',
      metrics: { temperature_c: { value: 18, observed_at: '2026-11-14T15:00:00Z', unit: '°C', quality: 'valid', device_id: 'setas-cloudlab-01' } },
      node_status: { ...NODE_STATUS, alarms: [], control_state: 'auto' },
    },
  },
});

const fakeFirestore = sink => (cfg, handlers) => { sink.push(handlers); return { close() {} }; };
const mkBridge = () => {
  const sink = [];
  let now = Date.parse('2026-11-14T15:00:30Z');
  const bridge = createLiveTelemetryBridge({ transports: [{ kind: 'firestore' }], factories: { firestore: fakeFirestore(sink) }, clock: () => now });
  bridge.start();
  return { bridge, handlers: sink[0], setNow: v => { now = v; } };
};

test('nodeStatusRowsFromRoomDoc: solo estados que son objetos, con dispositivo y posición', () => {
  assert.deepEqual(nodeStatusRowsFromRoomDoc(statusOnlyDoc()), [{ device_id: 'setas-cloudlab-01', position: 'centro', node_status: NODE_STATUS }]);
  for (const bad of [null, undefined, 'x', {}, { device_readings: null }, { device_readings: [] }, { device_readings: { a: null } },
    { device_readings: { a: { node_status: 'x' } } }, { device_readings: { a: { node_status: [] } } }, { device_readings: { a: { metrics: {} } } }]) {
    assert.deepEqual(nodeStatusRowsFromRoomDoc(bad), []);
  }
});

test('el estado devuelto es una copia: modificarlo no altera el documento', () => {
  const doc = statusOnlyDoc();
  const rows = nodeStatusRowsFromRoomDoc(doc);
  rows[0].node_status.alarms.push('x');
  assert.deepEqual(doc.device_readings['setas-cloudlab-01'].node_status.alarms, ['sensor_invalid']);
});

test('un snapshot con solo estado (sin lecturas) llega a getSnapshot y getNodeStatuses', () => {
  const { bridge, handlers } = mkBridge();
  handlers.onSnapshot({ cloudlab_844: statusOnlyDoc() });
  const snap = bridge.getSnapshot();
  assert.deepEqual(Object.keys(snap.nodeStatuses), ['cloudlab_844']);
  assert.equal(snap.nodeStatuses.cloudlab_844[0].device_id, 'setas-cloudlab-01');
  assert.deepEqual(snap.nodeStatuses.cloudlab_844[0].node_status.alarms, ['sensor_invalid']);
  assert.equal(bridge.getNodeStatuses('cloudlab_844').length, 1);
  // Sin lecturas no se inventa una sala con datos de clima.
  assert.deepEqual(Object.keys(snap.rooms), []);
});

test('un snapshot con lecturas y estado entrega ambos', () => {
  const { bridge, handlers } = mkBridge();
  handlers.onSnapshot({ cloudlab_844: withReadingsDoc() });
  const snap = bridge.getSnapshot();
  assert.ok(snap.rooms.cloudlab_844.latest.temperature_c);
  assert.deepEqual(snap.nodeStatuses.cloudlab_844[0].node_status.alarms, []);
});

test('sin ningún estado: nodeStatuses vacío y getNodeStatuses devuelve []', () => {
  const { bridge, handlers } = mkBridge();
  assert.deepEqual(bridge.getSnapshot().nodeStatuses, {});
  handlers.onSnapshot({ martha_01: { temperature_c: 17, rh_pct: 90, timestamp_local: '2026-11-14T15:00:00Z' } });
  assert.deepEqual(bridge.getSnapshot().nodeStatuses, {});
  assert.deepEqual(bridge.getNodeStatuses('martha_01'), []);
  assert.deepEqual(bridge.getNodeStatuses('no-existe'), []);
});

test('el snapshot siguiente reemplaza el estado de la sala; si el documento lo pierde, desaparece', () => {
  const { bridge, handlers } = mkBridge();
  handlers.onSnapshot({ cloudlab_844: statusOnlyDoc() });
  const doc2 = statusOnlyDoc();
  doc2.device_readings['setas-cloudlab-01'].node_status.observed_at = '2026-11-14T15:01:00Z';
  doc2.device_readings['setas-cloudlab-01'].node_status.alarms = [];
  handlers.onSnapshot({ cloudlab_844: doc2 });
  assert.equal(bridge.getNodeStatuses('cloudlab_844')[0].node_status.observed_at, '2026-11-14T15:01:00Z');
  handlers.onSnapshot({ cloudlab_844: { device_readings: { 'setas-cloudlab-01': { metrics: {} } } } });
  assert.deepEqual(bridge.getNodeStatuses('cloudlab_844'), []);
});

test('un snapshot que no menciona una sala no borra su estado', () => {
  const { bridge, handlers } = mkBridge();
  handlers.onSnapshot({ cloudlab_844: statusOnlyDoc() });
  handlers.onSnapshot({ martha_01: { temperature_c: 17, rh_pct: 90, timestamp_local: '2026-11-14T15:00:00Z' } });
  assert.equal(bridge.getNodeStatuses('cloudlab_844').length, 1);
});

test('resetRoom limpia también el estado del nodo', () => {
  const { bridge, handlers } = mkBridge();
  handlers.onSnapshot({ cloudlab_844: statusOnlyDoc() });
  bridge.resetRoom('cloudlab_844');
  assert.deepEqual(bridge.getNodeStatuses('cloudlab_844'), []);
  assert.deepEqual(bridge.getSnapshot().nodeStatuses, {});
});

test('el puente no ofrece ninguna ruta de escritura hacia el nodo', () => {
  const { bridge } = mkBridge();
  const names = Object.keys(bridge).join(' ');
  assert.doesNotMatch(names, /send|write|command|actuat|relay|toggle|force/i);
});
