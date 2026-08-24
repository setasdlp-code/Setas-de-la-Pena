'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTelemetry, validateTelemetry, readingBelongsToCycle, aggregateTelemetry } = require('./telemetry-contract.js');

const reading = (overrides = {}) => ({
  room_id: 'ROOM_1', device_id: 'SCD30_1', metric: 'co2_ppm', value: 850,
  observed_at: '2026-08-24T10:00:00-05:00', ...overrides,
});

const cycle = {
  roomId: 'ROOM_1', startAt: '2026-08-24T08:00:00-05:00', endAt: '2026-08-24T20:00:00-05:00'
};

test('telemetría válida se normaliza con esquema, unidad y timestamp ISO', () => {
  const r = normalizeTelemetry(reading());
  assert.equal(r.schema, 'setas.telemetry.v1');
  assert.equal(r.unit, 'ppm');
  assert.equal(r.quality, 'valid');
  assert.match(r.observed_at, /Z$/);
  assert.deepEqual(validateTelemetry(r), []);
});

test('valor físicamente imposible queda en cuarentena y no se confunde con target', () => {
  const r = normalizeTelemetry(reading({ value: 90000 }));
  assert.equal(r.quality, 'quarantined');
  assert.ok(r.quality_reasons.includes('outside_physical_range'));
  assert.equal(validateTelemetry(r).length, 0);
});

test('telemetría rechaza timestamp, métrica o unidad inválidos', () => {
  const errors = validateTelemetry(reading({ metric: 'vpd', unit: 'kPa', observed_at: 'bad-date' }));
  assert.ok(errors.some(e => e.includes('unsupported metric')));
  assert.ok(errors.includes('invalid observed_at'));
  const unitErrors = validateTelemetry(reading({ unit: 'mg/L' }));
  assert.ok(unitErrors.some(e => e.includes('expected unit ppm')));
});

test('agregación usa solo lecturas valid y respeta la ventana del RoomCycle', () => {
  const readings = [
    reading({ value: 800, observed_at: '2026-08-24T09:00:00-05:00' }),
    reading({ value: 1000, observed_at: '2026-08-24T11:00:00-05:00' }),
    reading({ value: 5000, quality: 'suspect', observed_at: '2026-08-24T12:00:00-05:00' }),
    reading({ value: 900, room_id: 'ROOM_2' }),
  ];
  assert.equal(readingBelongsToCycle(readings[0], cycle), true);
  assert.equal(readingBelongsToCycle(readings[3], cycle), false);
  const agg = aggregateTelemetry(readings.filter(r => readingBelongsToCycle(r, cycle)));
  assert.equal(agg.co2_ppm.count, 3);
  assert.equal(agg.co2_ppm.validCount, 2);
  assert.equal(agg.co2_ppm.mean, 900);
  assert.equal(agg.co2_ppm.qualityCounts.suspect, 1);
});
