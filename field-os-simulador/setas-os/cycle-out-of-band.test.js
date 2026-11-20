'use strict';
// Horas fuera de banda por etapa y métrica. Telemetría SIMULADA y bandas de
// PRUEBA: no son consignas de la granja.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const O = require('./cycle-out-of-band.js');
const risk = require('./contamination-risk.js');

const T0 = Date.parse('2026-11-01T00:00:00Z');
const H = 3600000;
const MIN = 60000;
const iso = ms => new Date(ms).toISOString();
const cycle = (extra = {}) => ({
  id: 'rc-1', roomId: 'cloudlab_844', speciesId: 'p_ostreatus_gris', batchIds: ['L-1'], stage: 'fruiting', state: 'active',
  startAt: iso(T0), targets: { temperature_c: { min: 14, max: 20, source: 'kb-operational' } }, ...extra,
});
const reading = (atMs, value, extra = {}) => ({
  room_id: 'cloudlab_844', device_id: 'dev-a', metric: 'temperature_c', value, unit: '°C', observed_at: iso(atMs), quality: 'valid', ...extra,
});
// Una lectura cada `stepMin` minutos con valores dados por f(i).
const series = (fromMs, count, stepMin, f, extra = {}) => Array.from({ length: count }, (_, i) => reading(fromMs + i * stepMin * MIN, f(i), extra));
const run = (args) => O.buildCycleOutOfBand({ now: T0 + 10 * H, ...args });
const rowOf = (res, metric = 'temperature_c') => res.rows.find(r => r.metric === metric);

test('los parámetros heredados son los de contamination-risk, no inventados', () => {
  assert.equal(O.defaultGapMaxMs(), risk.EXPOSURE_THRESHOLDS.gapMaxMinutes.value * 60 * 1000);
  assert.equal(O.FALLBACK_GAP_MAX_MS, O.defaultGapMaxMs());
  assert.equal(O.MIN_COVERAGE_RATIO, 0.5);
  const res = run({ cycles: [cycle()], readings: [] });
  assert.equal(res.gapMaxMs, 90 * MIN);
  assert.equal(res.minCoverageRatio, 0.5);
});

test('cobertura completa: horas fuera de banda ponderadas por tiempo', () => {
  // 10 h de ventana, una lectura cada 30 min. Las primeras 4 h por debajo de 14.
  const readings = series(T0, 21, 30, i => (i < 8 ? 12 : 16));
  const res = run({ cycles: [cycle()], readings });
  const r = rowOf(res);
  assert.equal(r.status, 'ok');
  assert.equal(r.coveredHours, 10);
  assert.equal(r.coverageRatio, 1);
  assert.equal(r.outOfBandHours, 4);
  assert.equal(r.belowHours, 4);
  assert.equal(r.aboveHours, 0);
  assert.equal(r.stage, 'fruiting');
  assert.equal(r.stageLabel, 'Fructificación');
  assert.deepEqual(r.band, { min: 14, max: 20, source: 'kb-operational' });
});

test('debajo y sobre la banda se separan; el borde de la banda cuenta como dentro', () => {
  const vals = [14, 20, 21, 13.9, 17];
  const readings = series(T0, 5, 60, i => vals[i]);
  const r = rowOf(run({ cycles: [cycle()], readings, now: T0 + 4 * H }));
  // Tramos de 1 h: 14 (dentro), 20 (dentro), 21 (sobre), 13.9 (bajo); la última lectura no aporta tramo.
  assert.equal(r.status, 'ok');
  assert.equal(r.coveredHours, 4);
  assert.equal(r.outOfBandHours, 2);
  assert.equal(r.aboveHours, 1);
  assert.equal(r.belowHours, 1);
});

test('cobertura insuficiente: "insufficient" con la cobertura y SIN horas', () => {
  // Solo 2 h de 10 con datos (cobertura 20 %), todo fuera de banda.
  const readings = series(T0, 5, 30, () => 30);
  const r = rowOf(run({ cycles: [cycle()], readings }));
  assert.equal(r.status, 'insufficient');
  assert.equal(r.outOfBandHours, null);
  assert.equal(r.outOfBandMs, null);
  assert.equal(r.belowHours, null);
  assert.equal(r.aboveHours, null);
  assert.equal(r.coverageRatio, 0.2);
  assert.equal(r.coveredHours, 2);
  assert.equal(r.readingCount, 5);
});

test('sin ninguna lectura: insuficiente con cobertura 0, no "0 horas fuera de banda"', () => {
  const r = rowOf(run({ cycles: [cycle()], readings: [] }));
  assert.equal(r.status, 'insufficient');
  assert.equal(r.coverageRatio, 0);
  assert.equal(r.outOfBandHours, null);
  assert.equal(r.readingCount, 0);
});

test('el corte de cobertura es configurable y se respeta en el borde', () => {
  const readings = series(T0, 11, 30, () => 30); // 5 h cubiertas de 10 = 0,5
  assert.equal(rowOf(run({ cycles: [cycle()], readings })).status, 'ok');
  assert.equal(rowOf(run({ cycles: [cycle()], readings, minCoverageRatio: 0.51 })).status, 'insufficient');
  assert.equal(rowOf(run({ cycles: [cycle()], readings, minCoverageRatio: 0.2 })).status, 'ok');
});

test('un hueco mayor que el máximo no cuenta ni dentro ni fuera de banda', () => {
  // 0-2 h fuera de banda con lecturas cada 30 min, hueco de 6 h sin datos, 8-10 h dentro de banda.
  const a = series(T0, 5, 30, () => 25);
  const b = series(T0 + 8 * H, 5, 30, () => 16);
  const r = rowOf(run({ cycles: [cycle()], readings: [...a, ...b], minCoverageRatio: 0.3 }));
  assert.equal(r.status, 'ok');
  assert.equal(r.coveredHours, 4);
  assert.equal(r.outOfBandHours, 2);
  assert.equal(r.coverageRatio, 0.4);
});

test('lecturas no válidas, de otra sala, fuera de ventana o de otra métrica no cuentan', () => {
  const good = series(T0, 21, 30, () => 16);
  const noise = [
    ...series(T0, 21, 30, () => 40, { quality: 'suspect' }),
    ...series(T0, 21, 30, () => 40, { quality: 'quarantined' }),
    ...series(T0, 21, 30, () => 40, { room_id: 'martha_01' }),
    ...series(T0 - 5 * H, 5, 30, () => 40), // antes del ciclo
    ...series(T0, 21, 30, () => 99, { metric: 'rh_pct', unit: '%RH' }),
  ];
  const r = rowOf(run({ cycles: [cycle()], readings: [...noise, ...good] }));
  assert.equal(r.status, 'ok');
  assert.equal(r.outOfBandHours, 0);
  assert.equal(r.readingCount, 21);
});

test('lecturas posteriores a "ahora" no se cuentan', () => {
  const readings = [...series(T0, 21, 30, () => 16), ...series(T0 + 10 * H, 10, 30, () => 40)];
  const r = rowOf(run({ cycles: [cycle()], readings }));
  assert.equal(r.outOfBandHours, 0);
  assert.equal(r.coveredHours, 10);
});

test('solo se calculan métricas con banda en el ciclo, con las bandas del CICLO', () => {
  const targets = { temperature_c: { min: 14, max: 20, source: 'manual' }, rh_pct: { min: 80, max: 90, source: 'kb-literature' }, co2_ppm: { target: 700 } };
  const readings = [
    ...series(T0, 21, 30, () => 16),
    ...series(T0, 21, 30, () => 95, { metric: 'rh_pct', unit: '%RH' }),
    ...series(T0, 21, 30, () => 600, { metric: 'co2_ppm', unit: 'ppm' }),
  ];
  const res = run({ cycles: [cycle({ targets })], readings });
  assert.deepEqual(res.rows.map(r => r.metric).sort(), ['rh_pct', 'temperature_c']);
  assert.equal(rowOf(res, 'rh_pct').outOfBandHours, 10);
  assert.equal(rowOf(res, 'rh_pct').band.source, 'kb-literature');
  assert.equal(rowOf(res, 'temperature_c').outOfBandHours, 0);
});

test('banda con solo un límite (sustrato: solo max)', () => {
  const targets = { substrate_temperature_c: { max: 28, source: 'kb-operational' } };
  const readings = series(T0, 21, 30, i => (i < 10 ? 30 : 25), { metric: 'substrate_temperature_c' });
  const r = rowOf(run({ cycles: [cycle({ targets })], readings }), 'substrate_temperature_c');
  assert.equal(r.status, 'ok');
  assert.equal(r.outOfBandHours, 5);
  assert.equal(r.belowHours, 0);
  assert.equal(r.band.min, null);
});

test('varias etapas: una fila por ciclo y métrica con su etapa, en orden de inicio', () => {
  const inc = cycle({ id: 'rc-inc', stage: 'incubation', startAt: iso(T0 - 20 * H), endAt: iso(T0), state: 'closed', targets: { temperature_c: { min: 20, max: 24, source: 'kb-operational' } } });
  const readings = [
    ...series(T0 - 20 * H, 41, 30, () => 26),
    ...series(T0, 21, 30, () => 16),
  ];
  const res = run({ cycles: [cycle(), inc], readings });
  assert.deepEqual(res.rows.map(r => [r.stage, r.status, r.outOfBandHours]), [['incubation', 'ok', 20], ['fruiting', 'ok', 0]]);
});

test('un ciclo cerrado usa su fin como ventana, no "ahora"', () => {
  const closed = cycle({ state: 'closed', endAt: iso(T0 + 4 * H) });
  const readings = series(T0, 9, 30, () => 30);
  const r = rowOf(run({ cycles: [closed], readings, now: T0 + 100 * H }));
  assert.equal(r.windowMs, 4 * H);
  assert.equal(r.coverageRatio, 1);
  assert.equal(r.outOfBandHours, 4);
});

test('ciclos planificados, cancelados o sin ventana no generan filas; sin bandas se informa', () => {
  const res = run({
    cycles: [cycle({ id: 'p', state: 'planned' }), cycle({ id: 'c', state: 'cancelled' }), cycle({ id: 'nb', targets: { co2_ppm: { target: 700 } } }), cycle({ id: 'fut', startAt: iso(T0 + 50 * H) })],
    readings: [],
  });
  assert.deepEqual(res.rows, []);
  assert.deepEqual(res.skippedCycles.map(s => [s.cycleId, s.reason]), [['nb', 'sin bandas en el ciclo'], ['fut', 'sin ventana de tiempo']]);
  assert.equal(res.hasCycles, true);
});

test('lote sin ciclos: hasCycles=false y sin filas', () => {
  const res = run({ cycles: [], readings: series(T0, 5, 30, () => 30) });
  assert.equal(res.hasCycles, false);
  assert.deepEqual(res.rows, []);
});

test('varios dispositivos: fuera de banda si CUALQUIERA está fuera; no se suman dos veces', () => {
  // dev-a dentro todo el tiempo; dev-b fuera durante las primeras 4 h.
  const a = series(T0, 21, 30, () => 16, { device_id: 'dev-a' });
  const b = series(T0, 21, 30, i => (i < 8 ? 25 : 16), { device_id: 'dev-b' });
  const r = rowOf(run({ cycles: [cycle()], readings: [...a, ...b] }));
  assert.equal(r.coveredHours, 10);
  assert.equal(r.outOfBandHours, 4);
  assert.equal(r.readingCount, 42);
});

test('varios dispositivos: la cobertura es la unión de lo que cubre cada uno', () => {
  const a = series(T0, 11, 30, () => 16, { device_id: 'dev-a' }); // 0-5 h
  const b = series(T0 + 5 * H, 11, 30, () => 16, { device_id: 'dev-b' }); // 5-10 h
  const r = rowOf(run({ cycles: [cycle()], readings: [...a, ...b] }));
  assert.equal(r.coveredHours, 10);
  assert.equal(r.coverageRatio, 1);
});

test('entradas desordenadas o duplicadas no rompen el resultado', () => {
  const readings = series(T0, 21, 30, i => (i < 8 ? 12 : 16)).reverse();
  const r = rowOf(run({ cycles: [cycle()], readings: [...readings, ...readings] }));
  assert.equal(r.outOfBandHours, 4);
  assert.ok(r.coverageRatio <= 1);
});

test('no lanza con entradas vacías o basura', () => {
  assert.doesNotThrow(() => O.buildCycleOutOfBand());
  assert.deepEqual(O.buildCycleOutOfBand().rows, []);
  assert.doesNotThrow(() => run({ cycles: [null, {}, cycle()], readings: [null, {}, 'x', reading(T0, 'abc')] }));
});
