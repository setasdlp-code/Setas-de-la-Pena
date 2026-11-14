'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const V = require('./climate-alerts-view.js');
const server = require('./functions/climate-alerts.js');

const MIN = 60 * 1000;
const NOW = Date.parse('2026-11-14T10:00:00-05:00');

test('solo las alertas abiertas se muestran como vigentes; sensor caído primero', () => {
  const docs = [
    { id: 'm__out_of_band_rh_pct', roomId: 'martha_01', kind: 'out_of_band', metric: 'rh_pct', status: 'open', openedAt: NOW, detail: 'HR baja' },
    { id: 'm__sensor_stale', roomId: 'martha_01', kind: 'sensor_stale', status: 'open', openedAt: NOW - MIN },
    { id: 'c__out_of_band_temperature_c', roomId: 'cloudlab_844', kind: 'out_of_band', metric: 'temperature_c', status: 'pending' },
    { id: 'c__sensor_stale', roomId: 'cloudlab_844', kind: 'sensor_stale', status: 'resolved' },
  ];
  const { open } = V.summarizeClimateAlerts(docs);
  assert.deepEqual(open.map(a => [a.roomId, a.title]), [
    ['martha_01', 'Sensor sin lecturas'],
    ['martha_01', 'Humedad relativa fuera de banda'],
  ]);
  assert.deepEqual(V.summarizeClimateAlerts(docs, { roomId: 'cloudlab_844' }).open, []);
});

test('historial: entradas de todas las alertas, más reciente primero, filtrable por sala y acotado', () => {
  const docs = [
    { id: 'a', roomId: 'martha_01', kind: 'sensor_stale', status: 'resolved',
      history: [{ type: 'opened', at: NOW - 60 * MIN }, { type: 'resolved', at: NOW - 30 * MIN }] },
    { id: 'b', roomId: 'cloudlab_844', kind: 'out_of_band', metric: 'co2_ppm', status: 'open',
      history: [{ type: 'opened', at: NOW - 10 * MIN, detail: 'CO₂ alto' }, { type: 'otro', at: NOW }, { type: 'opened' }] },
  ];
  const { history } = V.summarizeClimateAlerts(docs);
  assert.deepEqual(history.map(h => [h.roomId, h.type, h.at]), [
    ['cloudlab_844', 'opened', NOW - 10 * MIN],
    ['martha_01', 'resolved', NOW - 30 * MIN],
    ['martha_01', 'opened', NOW - 60 * MIN],
  ]);
  assert.equal(V.summarizeClimateAlerts(docs, { roomId: 'martha_01' }).history.length, 2);
  assert.equal(V.summarizeClimateAlerts(docs, { historyLimit: 1 }).history.length, 1);
});

test('documentos inválidos o sin sala se ignoran; marcas de tiempo de Firestore se aceptan', () => {
  const ts = { toMillis: () => NOW };
  const { open } = V.summarizeClimateAlerts([null, 'x', { status: 'open' },
    { id: 'z', roomId: 'martha_01', kind: 'sensor_stale', status: 'open', openedAt: ts }]);
  assert.equal(open.length, 1);
  assert.equal(open[0].openedAt, NOW);
  assert.deepEqual(V.summarizeClimateAlerts(undefined), { open: [], history: [] });
});

test('lee lo que escribe la función del servidor', () => {
  const cycle = { id: 'C1', roomId: 'martha_01', state: 'active', targets: { temperature_c: { min: 14, max: 18 } } };
  const live = { temperature_c: 21, last_updated: new Date(NOW) };
  const conditions = server.detectConditions({ cycles: [cycle], liveByRoom: { martha_01: live }, nowMs: NOW });
  let stored = server.planAlerts({ conditions, stored: [], nowMs: NOW }).writes;
  stored = server.planAlerts({ conditions, stored, nowMs: NOW + 10 * MIN }).writes;
  const { open, history } = V.summarizeClimateAlerts(stored);
  assert.equal(open.length, 1);
  assert.equal(open[0].title, 'Temperatura fuera de banda');
  assert.match(open[0].detail, /21 °C/);
  assert.deepEqual(history.map(h => h.type), ['opened']);
});
