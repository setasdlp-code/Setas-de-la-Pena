'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harvestByFlush, buildCycleEvidence, buildHistoricalEvidence } = require('./cycle-evidence.js');

const cycle = {
  id: 'RC_1', roomId: 'ROOM_1', speciesId: 'lions_mane', stage: 'fruiting', state: 'closed',
  startAt: '2026-08-24T08:00:00-05:00', endAt: '2026-08-24T20:00:00-05:00'
};
const lote = {
  id: 'BIT_1', codigo: 'SDP-TEST-001', peseSeco: 2, costoIngKg: 1500,
  fechaInoculacion: '2026-08-01'
};
const bolsas = [
  { id: 'B1', estado: 'sana', col100: '2026-08-16' },
  { id: 'B2', estado: 'contaminada', col100: '2026-08-18' },
];
const cosechas = [
  { id: 'C1', flush: 1, pesoFresco: 600 },
  { id: 'C2', flush: 1, pesoFresco: 400 },
  { id: 'C3', flush: 2, pesoFresco: 500 },
];
const telemetry = [
  { room_id: 'ROOM_1', device_id: 'S1', metric: 'temperature_c', value: 18, observed_at: '2026-08-24T10:00:00-05:00' },
  { room_id: 'ROOM_1', device_id: 'S1', metric: 'rh_pct', value: 93, observed_at: '2026-08-24T10:00:00-05:00' },
  { room_id: 'ROOM_2', device_id: 'S2', metric: 'temperature_c', value: 25, observed_at: '2026-08-24T10:00:00-05:00' },
];

test('CycleEvidence reutiliza Bitácora y solo agrega telemetría del ciclo correcto', () => {
  const ev = buildCycleEvidence({
    cycle, lote, bolsas, cosechas, telemetry,
    recipeSnapshot: { id: 'R1', versionId: 'R1v2' },
    ingredientLots: [{ ingredientId: 'aserrin_roble', inventoryLotId: 'INV_1' }],
    recordedAt: '2026-08-24T21:00:00-05:00',
  });
  assert.equal(ev.schema, 'setas.cycle-evidence.v1');
  assert.equal(ev.metrics.total_fresh_kg, 1.5);
  assert.equal(ev.metrics.be_pct, 75);
  assert.equal(ev.metrics.contamination_pct, 50);
  assert.equal(ev.telemetrySummary.totalReadings, 2);
  assert.equal(ev.environment.temperature_c.mean, 18);
  assert.equal(ev.confidence, 'medium');
});

test('harvestByFlush consolida registros por flush sin inventar peso comercial', () => {
  const rows = harvestByFlush(cosechas);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].grossKg, 1);
  assert.equal(rows[0].commercialKg, null);
  assert.equal(rows[1].grossKg, 0.5);
});

test('HistoricalEvidence filtra por especie/receta y nunca sube a high por observación sola', () => {
  const mk = (id, speciesId = 'lions_mane', recipeVersionId = 'R1v2') => ({
    schema: 'setas.cycle-evidence.v1', sourceId: id, speciesId,
    recipeSnapshot: { versionId: recipeVersionId }, ingredientLots: [{ inventoryLotId: 'INV_1' }],
    metrics: { total_fresh_kg: 1, be_pct: 80 }, telemetrySummary: { metricsWithValidData: 2 },
  });
  const hist = buildHistoricalEvidence([mk('1'), mk('2'), mk('3'), mk('4', 'shiitake')], {
    speciesId: 'lions_mane', recipeVersionId: 'R1v2'
  });
  assert.equal(hist.summary.sampleSize, 3);
  assert.equal(hist.confidence, 'medium');
  assert.notEqual(hist.confidence, 'high');
});
