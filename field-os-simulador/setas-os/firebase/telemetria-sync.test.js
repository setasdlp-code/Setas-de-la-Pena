'use strict';
// buildClimatePayload: una métrica ausente se guarda como null, nunca como 0.
// Antes `Number(reading.rh_pct ?? 0)` escribía 0 % HR en telemetria_salas, y el
// puente en vivo lo servía como la lectura actual de la sala.
const { test } = require('node:test');
const assert = require('node:assert/strict');

const load = () => import('./telemetria-sync.js');

test('HR ausente queda null y no se calcula DPV', async () => {
  const { buildClimatePayload } = await load();
  const p = buildClimatePayload({ roomId: 'sala_1', temperature_c: 18.5, rh_pct: null, co2_ppm: 700 });
  assert.equal(p.temperature_c, 18.5);
  assert.equal(p.rh_pct, null);
  assert.equal(p.co2_ppm, 700);
  assert.equal(p.dpv_kpa, null);
});

test('temperatura ausente, vacía o no numérica queda null', async () => {
  const { buildClimatePayload } = await load();
  for (const t of [undefined, null, '', 'nan', NaN]) {
    const p = buildClimatePayload({ roomId: 'sala_1', temperature_c: t, rh_pct: 90 });
    assert.equal(p.temperature_c, null, `t=${String(t)}`);
    assert.equal(p.dpv_kpa, null, `t=${String(t)}`);
  }
});

test('una lectura sin ninguna métrica numérica no produce documento', async () => {
  const { buildClimatePayload } = await load();
  assert.equal(buildClimatePayload({ roomId: 'sala_1' }), null);
  assert.equal(buildClimatePayload({ roomId: 'sala_1', temperature_c: null, rh_pct: '' }), null);
});

test('un 0 real se conserva y el DPV se calcula con temperatura y HR medidas', async () => {
  const { buildClimatePayload } = await load();
  const p = buildClimatePayload({ roomId: 'sala_1', temperature_c: 20, rh_pct: 90, co2_ppm: 0 });
  assert.equal(p.co2_ppm, 0);
  assert.ok(Math.abs(p.dpv_kpa - 0.234) < 0.002, `dpv=${p.dpv_kpa}`);
});

test('pushClimateReading rechaza una lectura vacía sin escribir', async () => {
  const { pushClimateReading } = await load();
  const res = await pushClimateReading({}, { roomId: 'sala_1', temperature_c: null });
  assert.equal(res.success, false);
});
