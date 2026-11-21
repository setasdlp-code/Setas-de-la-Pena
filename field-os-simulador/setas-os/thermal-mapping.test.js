'use strict';
// Pruebas de thermal-mapping.js con series SINTÉTICAS generadas aquí; no son
// mediciones del prototipo de incubación.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./thermal-mapping.js');
const { parseLoggerCsv } = require('./autoclave-qualification.js');

// Co-ubicación: tres DS18B20 con sesgo fijo +0.3, 0, −0.2 °C sobre una señal común.
function colocation(hours = 50, every = 1) {
  const rows = ['t_min,DS_A,DS_B,DS_C,SHT45'];
  for (let m = 0; m <= hours * 60; m += every) {
    const base = 26 + Math.sin(m / 180);
    rows.push([m, (base + 0.3).toFixed(3), base.toFixed(3), (base - 0.2).toFixed(3), (base + 0.05).toFixed(3)].join(','));
  }
  return parseLoggerCsv(rows.join('\n'));
}
// Ensayo: tope más caliente que la base; `gradient` en °C reales (tras corregir offsets).
function mapping({ hours = 74, gradient = 1.2, spikeEvery = 0, drop = null } = {}) {
  const rows = ['t_min,DS_A,DS_B,DS_C'];
  for (let m = 0; m <= hours * 60; m += 1) {
    if (drop && m > drop[0] && m < drop[1]) { rows.push([m, '', '', ''].join(',')); continue; }
    const warm = m < 120 ? 20 + m / 20 : 26;
    const g = spikeEvery && m % spikeEvery === 0 ? 3 : gradient;
    // A=base, B=centro, C=tope; las lecturas llevan su sesgo de sonda.
    rows.push([m, (warm + 0.3).toFixed(3), (warm + g / 2).toFixed(3), (warm + g - 0.2).toFixed(3)].join(','));
  }
  return parseLoggerCsv(rows.join('\n'));
}
const positions = { base: 'DS_A', centro: 'DS_B', tope: 'DS_C' };

test('offsets por co-ubicación recuperan el sesgo de cada sonda', () => {
  const r = T.computeOffsets(colocation(), { probes: ['DS_A', 'DS_B', 'DS_C', 'SHT45'] });
  assert.equal(r.status, 'ok');
  // Referencia = mediana del grupo; con cuatro sondas cae entre DS_B (0) y SHT45 (+0.05).
  assert.equal(r.probes.DS_A.offsetC, 0.275);
  assert.equal(r.probes.DS_C.offsetC, -0.225);
  const vsRef = T.computeOffsets(colocation(), { probes: ['DS_A', 'DS_B', 'DS_C'], reference: 'DS_B' });
  assert.deepEqual([vsRef.probes.DS_A.offsetC, vsRef.probes.DS_B.offsetC, vsRef.probes.DS_C.offsetC], [0.3, 0, -0.2]);
  const short = T.computeOffsets(colocation(24), { probes: ['DS_A', 'DS_B'] });
  assert.equal(short.status, 'insuficiente');
  assert.match(short.reasons[0], /48–72 h/);
  assert.throws(() => T.computeOffsets(colocation(), { probes: ['DS_A'] }), /al menos dos/);
});

test('con offsets aplicados un gradiente real de 1,2 °C cumple; sin offsets no se interpreta', () => {
  const offsets = { DS_A: 0.3, DS_B: 0, DS_C: -0.2 };
  const ok = T.evaluateMap(mapping(), { positions, offsets, stabilizationMin: 180 });
  assert.equal(ok.status, 'cumple');
  assert.equal(ok.metrics.fraction, 1);
  assert.equal(ok.metrics.maxDeltaC, 1.2);
  assert.equal(ok.metrics.worst.hot, 'tope');
  const noOffsets = T.evaluateMap(mapping(), { positions, offsets: null, stabilizationMin: 180 });
  assert.equal(noOffsets.status, 'insuficiente');
});

test('ΔT > 2 °C en más del 5 % de los intervalos no cumple; justo en el límite cumple', () => {
  const offsets = { DS_A: 0.3, DS_B: 0, DS_C: -0.2 };
  const hot = T.evaluateMap(mapping({ gradient: 2.4 }), { positions, offsets, stabilizationMin: 180 });
  assert.equal(hot.status, 'no_cumple');
  // Picos de 3 °C cada 10 min = 10 % de los intervalos → no cumple; cada 25 min = 4 % → cumple.
  assert.equal(T.evaluateMap(mapping({ spikeEvery: 10 }), { positions, offsets, stabilizationMin: 180 }).status, 'no_cumple');
  assert.equal(T.evaluateMap(mapping({ spikeEvery: 25 }), { positions, offsets, stabilizationMin: 180 }).status, 'cumple');
  assert.equal(T.evaluateMap(mapping({ gradient: 2.0 }), { positions, offsets, stabilizationMin: 180 }).status, 'cumple');
});

test('huecos cuentan como no demostrados y el ensayo corto es insuficiente', () => {
  const offsets = { DS_A: 0.3, DS_B: 0, DS_C: -0.2 };
  // 99 de 4261 intervalos sin datos (2,3 %) todavía cumple; 599 (14 %) ya no.
  const gap = T.evaluateMap(mapping({ drop: [600, 700] }), { positions, offsets, stabilizationMin: 180 });
  assert.equal(gap.metrics.missing, 99);
  assert.equal(gap.status, 'cumple');
  assert.ok(gap.metrics.fraction < 1);
  const bigGap = T.evaluateMap(mapping({ drop: [600, 1200] }), { positions, offsets, stabilizationMin: 180 });
  assert.equal(bigGap.status, 'no_cumple');
  assert.equal(T.evaluateMap(mapping({ hours: 48 }), { positions, offsets, stabilizationMin: 180 }).status, 'insuficiente');
  assert.throws(() => T.evaluateMap(mapping(), { positions: { base: 'DS_A', centro: 'DS_A', tope: 'DS_C' }, offsets, stabilizationMin: 180 }), /distintas/);
});

test('registros: los offsets se miden antes y el ensayo los referencia; unidad cumple con vacío y carga simulada', () => {
  const records = [];
  const off = T.createOffsetsRecord(records, { id: 'OFF-1', data: colocation(), probes: ['DS_A', 'DS_B', 'DS_C'], reference: 'DS_B' }, { by: 'Sebastián', at: '2026-11-10T12:00:00.000Z' });
  records.push(off);
  assert.throws(() => T.createOffsetsRecord(records, { id: 'OFF-2', data: colocation(20), probes: ['DS_A', 'DS_B'] }, { by: 'x' }), /48–72 h/);
  assert.throws(() => T.createMapRecord(records, { id: 'M-0', unitId: 'Estra-1', testType: 'vacio', offsetSetId: 'NOPE', data: mapping(), positions, stabilizationMin: 180 }, { by: 'x' }), /offsets/);
  const vac = T.createMapRecord(records, { id: 'M-1', unitId: 'Estra-1', testType: 'vacio', offsetSetId: 'OFF-1', data: mapping(), positions, stabilizationMin: 180 }, { by: 'x', at: '2026-11-14T12:00:00.000Z' });
  assert.equal(vac.status, 'cumple');
  records.push(vac);
  assert.equal(T.unitSummary(records)[0].status, 'pendiente');
  records.push(T.createMapRecord(records, { id: 'M-2', unitId: 'Estra-1', testType: 'carga_simulada', offsetSetId: 'OFF-1', data: mapping({ gradient: 1.6 }), positions, stabilizationMin: 180 }, { by: 'x', at: '2026-11-18T12:00:00.000Z' }));
  assert.equal(T.unitSummary(records)[0].status, 'cumple_ensayos_sin_biologico');
  assert.equal(T.reevaluate(records, records[1]).status, 'cumple');
  // Lectura con formato válido de vuelta desde almacenamiento.
  const store = (v) => ({ getItem: () => v });
  assert.equal(T.readRecords(store(JSON.stringify(records))).length, 3);
  assert.throws(() => T.readRecords(store('{')), /dañado/);
  assert.throws(() => T.readRecords(store('[{"schema":"x"}]')), /formato válido/);
});

test('offsets medidos después del inicio del ensayo se rechazan (fecha-hora)', () => {
  const co = parseLoggerCsv(['timestamp,DS_A,DS_B', ...Array.from({ length: 49 * 60 + 1 }, (_, m) => { const d = new Date(Date.UTC(2026, 10, 12, 0, m)); return `${d.toISOString().slice(0, 16).replace('T', ' ')}:00,26.3,26`; })].join('\n'));
  const records = [T.createOffsetsRecord([], { id: 'OFF-1', data: co, probes: ['DS_A', 'DS_B'] }, { by: 'x' })];
  const rows = ['timestamp,DS_A,DS_B,DS_C', ...Array.from({ length: 10 }, (_, m) => `2026-11-13 00:0${m}:00,26,26,26`)];
  assert.throws(() => T.createMapRecord(records, { id: 'M-1', unitId: 'U', testType: 'vacio', offsetSetId: 'OFF-1', data: parseLoggerCsv(rows.join('\n')), positions, stabilizationMin: 0 }, { by: 'x' }), /antes del ensayo/);
});

test('la app monta el panel de mapa térmico y lo incluye en el respaldo', () => {
  const app = require('node:fs').readFileSync(require.resolve('./simulador-app.jsx'), 'utf8');
  const sources = require('./jsx-sources.cjs');
  assert.ok(sources.indexOf('autoclave-qualification.js') < sources.indexOf('views/incubation-thermal-panel.jsx'), 'el panel usa el lector CSV y AQForm');
  assert.ok(sources.indexOf('views/autoclave-qualification-panel.jsx') < sources.indexOf('views/incubation-thermal-panel.jsx'));
  assert.ok(sources.indexOf('thermal-mapping.js') < sources.indexOf('simulador-app.jsx'));
  assert.match(app, /<IncubationThermalPanel records=\{thermalMapping\.records\}/);
  assert.match(app, /SetasPrototype\.persist\(localStorage,\[\[SetasThermalMapping\.KEY,records\]\]\)/);
  assert.ok(require('./prototype-readiness.js').KEYS.includes(T.KEY));
});
