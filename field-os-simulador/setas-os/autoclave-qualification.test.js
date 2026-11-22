'use strict';
// Pruebas de autoclave-qualification.js con series SINTÉTICAS generadas aquí.
// Ninguna representa una corrida real del 1941X ni un resultado de campo.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Q = require('./autoclave-qualification.js');

const NOW = Date.parse('2026-11-20T17:00:00.000Z');
const AMBIENT = 74.5;
const KPA_PER_PSI = 6.894757293168;

// IAPWS R7-97(2012), tablas 35 y 36 (valores de verificación de la región 4).
test('IAPWS-IF97 región 4 reproduce los valores de verificación oficiales', () => {
  const close = (a, b, rel) => assert.ok(Math.abs(a - b) / b < rel, `${a} vs ${b}`);
  close(Q.saturationPressureKpa(300 - 273.15), 3.53658941, 1e-8);
  close(Q.saturationPressureKpa(500 - 273.15), 2638.89776, 1e-8);
  close(Q.saturationPressureKpa(600 - 273.15), 12344.3146, 1e-8);
  close(Q.saturationTemperatureC(100) + 273.15, 372.755919, 2e-9);
  close(Q.saturationTemperatureC(1000) + 273.15, 453.035632, 2e-9);
  close(Q.saturationTemperatureC(10000) + 273.15, 584.149488, 2e-9);
  // Inversas entre sí y fuera de rango → null.
  close(Q.saturationTemperatureC(Q.saturationPressureKpa(121.1)), 121.1, 2e-9);
  assert.equal(Q.saturationTemperatureC(0.1), null);
  assert.equal(Q.saturationPressureKpa(400), null);
});

// ── generador de una corrida sintética ───────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const stamp = (min) => { const d = new Date(Date.UTC(2026, 10, 10, 8, 0) + min * 60000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`; };
const lerp = (t, t0, v0, t1, v1) => v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
function syntheticCsv({ lag = 12, hold = 121.5, productHold = 121.3, pressureBiasPsi = 0, dropFrom = null, dropTo = null, startHot = false } = {}) {
  const rows = ['timestamp,DL1,DL2,DL3,P_psig'];
  for (let m = 0; m <= 180; m++) {
    if (dropFrom !== null && m > dropFrom && m < dropTo) continue; // hueco de datos
    const ch = startHot ? hold : m <= 30 ? lerp(m, 0, 90, 30, hold) : m <= 150 ? hold : lerp(m, 150, hold, 180, 100);
    const prod = (extra) => {
      const reach = 30 + lag + extra;
      return m <= reach ? lerp(m, 0, 30, reach, productHold) : m <= 150 ? productHold : lerp(m, 150, productHold, 180, 105);
    };
    const psig = ch >= 92 ? (Q.saturationPressureKpa(ch) - AMBIENT) / KPA_PER_PSI + pressureBiasPsi : 0;
    rows.push([stamp(m), ch.toFixed(2), prod(0).toFixed(2), prod(3).toFixed(2), psig.toFixed(3)].join(','));
  }
  return rows.join('\n');
}

const PROTOCOL = { ...Q.CANDIDATE_PROTOCOL, thermalTargetC: 121.0, maxGapMin: 2 };
const BASIS = 'Fixture: G. stearothermophilus D121≈1,5–2 min, z=10 °C; meta de reducción declarada en la ficha del protocolo.';

function journal() {
  const events = [];
  let clock = Date.parse('2026-11-01T13:00:00.000Z');
  let seq = 0;
  const add = (type, payload, opts = {}) => {
    clock += 60000;
    const ev = Q.createEvent(events, type, payload, { at: new Date(opts.at ? Date.parse(opts.at) : clock).toISOString(), by: opts.by || 'Sebastián', id: 'EV-' + (++seq), nowMs: NOW });
    if (opts.at) clock = Date.parse(opts.at);
    events.push(ev);
    return ev;
  };
  return { events, add, setClock: (iso) => { clock = Date.parse(iso); } };
}

function qualifiedBase({ g1 = true } = {}) {
  const j = journal();
  j.add('protocol.drafted', { protocolId: 'PQ1-v1', title: 'PQ-1 1941X', params: PROTOCOL, microbiologicalBasis: BASIS });
  j.add('protocol.approved', { protocolId: 'PQ1-v1', reference: 'Acta PQ1-v1' });
  if (g1) j.add('gate.reviewed', { gateId: 'G1', status: 'cerrado', reference: 'Servicio técnico 2026-11', details: { calibrationCertificate: 'CAL-123', inspectionReport: 'INF-55' } });
  j.add('configuration.defined', { configurationId: 'CFG-4x2.5', equipmentId: '1941X', bagCount: 4, wetMassPerBagKg: 2.5, bagType: 'PP filtro', loadArrangement: 'Rejilla base, 4 bolsas verticales', heatSource: 'Estufa propano 2 quemadores' });
  return j;
}

const goodIndicators = (over = {}) => ({
  ci: [{ position: 'B1', result: 'pass' }, { position: 'B2', result: 'pass' }, { position: 'B3', result: 'pass' }],
  ib: [{ position: 'B1', result: 'negativo', readHours: 48 }, { position: 'B3', result: 'negativo', readHours: 48 }, { position: 'B2', result: 'negativo', readHours: 48 }],
  controls: [{ position: 'Incubadora', result: 'positivo', firstPositiveHours: 18 }],
  lots: { ci: { lot: 'CI-L1', expiry: '2027-06-30', ifu: 'IFU CI rev 3' }, ib: { lot: 'IB-L9', expiry: '2027-03-31', ifu: 'IFU IB rev 2' } },
  ...over,
});

function addRun(j, runId, day, { csv = syntheticCsv(), indicators = goodIndicators(), plateau = { start: '2026-11-10T08:30', end: '2026-11-10T10:30' } } = {}) {
  const executedAt = `2026-11-${pad(day)}T13:00:00.000Z`;
  j.setClock(`2026-11-${pad(day)}T15:00:00.000Z`);
  const shift = (s) => s.replace('2026-11-10', `2026-11-${pad(day)}`);
  j.add('run.registered', { runId, configurationId: 'CFG-4x2.5', protocolId: 'PQ1-v1', executedAt, operator: 'Cuidador', ambientPressureKpa: AMBIENT, pressureUnit: 'psig', gaugeCorrection: 0, plateau: { kind: 'datetime', start: shift(plateau.start), end: shift(plateau.end) } });
  const parsed = Q.parseLoggerCsv(csv.replace(/2026-11-10/g, `2026-11-${pad(day)}`));
  j.add('run.data_imported', { runId, fileName: runId + '.csv', data: parsed, mapping: { chamber: 'DL1', products: ['DL2', 'DL3'], pressure: 'P_psig' } });
  if (indicators) j.add('run.indicators_recorded', { runId, indicators });
}

// Estudios PQ-2 sintéticos: A/B de 15 días y placas C de 7 días, ya completos al NOW de las pruebas.
function addStudies(j, { abState = () => 'limpia', temp = 23, readDays = [7, 14, 15.1] } = {}) {
  j.setClock('2026-11-19T18:00:00.000Z');
  const start = Date.parse('2026-11-04T15:00:00.000Z');
  const at = (d) => new Date(start + d * 86400000).toISOString();
  j.add('pq2.defined', { studyId: 'AB-1', kind: 'AB', startedAt: at(0), configurationId: 'CFG-4x2.5', thermalRunRef: 'R3', nPerGroup: 2, observationDays: 15, incubationTempC: 23, tempToleranceC: 1, readingIntervalDays: 7 });
  readDays.forEach((d) => j.add('pq2.reading', { studyId: 'AB-1', readAt: at(d), tempC: temp, units: Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map((u) => [u, abState(u, d)])) }));
  j.add('pq2.defined', { studyId: 'C-1', kind: 'C', startedAt: at(5), spawnLot: 'FG-77', medium: 'PDA', plates: 2, blanks: 1, maxJumpDays: 5, observationDays: 7, incubationTempC: 23, tempToleranceC: 1, readingIntervalDays: 4 });
  [[8, 'salto'], [12, 'salto']].forEach(([d, st]) => j.add('pq2.reading', { studyId: 'C-1', readAt: at(d), tempC: 23, units: { P1: st, P2: st, K1: 'sin_crecimiento' } }));
}

const runStatus = (j, id) => Q.evaluateRun(Q.foldEvents(j.events), id, NOW);
const codes = (r) => r.reasons.map((x) => x.code);

test('parseLoggerCsv: coma, punto y coma con coma decimal, día primero, minutos y zona horaria', () => {
  const a = Q.parseLoggerCsv('timestamp,DL1\n2026-11-10 08:00:00,90.5\n2026-11-10 08:01:00,\n');
  assert.equal(a.timeKind, 'datetime');
  assert.deepEqual(a.values.DL1, [90.5, null]);
  const b = Q.parseLoggerCsv('Fecha;Cámara\n10/11/2026 08:00;90,5\n10/11/2026 08:01;91,25\n');
  assert.deepEqual(b.values['Cámara'], [90.5, 91.25]);
  assert.equal(b.t[1] - b.t[0], 1);
  assert.equal(b.t[0], a.t[0]);
  const c = Q.parseLoggerCsv('t_min\tDL1\n0\t90\n0.5\t95\n');
  assert.equal(c.timeKind, 'elapsed');
  assert.deepEqual(c.t, [0, 0.5]);
  const s = Q.parseLoggerCsv('t_s,DL1\n0,90\n30,95\n');
  assert.deepEqual(s.t, [0, 0.5]);
  // 13:00Z = 08:00 en Bogotá (UTC−5).
  const z = Q.parseLoggerCsv('timestamp,DL1\n2026-11-10T13:00:00Z,90\n');
  assert.equal(z.t[0], a.t[0]);
  assert.throws(() => Q.parseLoggerCsv('timestamp,DL1\n2026-11-10 08:01:00,90\n2026-11-10 08:00:00,91\n'), /no avanza/);
  assert.throws(() => Q.parseLoggerCsv('timestamp,DL1\nayer,90\n'), /no reconocido/);
  assert.match(Q.parseLoggerCsv('timestamp,DL1\n2026-11-10 08:00:00,abc\n').warnings[0], /no numérica/);
});

test('el protocolo candidato no es aprobable sin objetivo térmico ni hueco máximo declarados', () => {
  const problems = Q.protocolProblems(Q.CANDIDATE_PROTOCOL);
  assert.ok(problems.some((p) => /thermalTargetC/.test(p)));
  assert.ok(problems.some((p) => /maxGapMin/.test(p)));
  assert.deepEqual(Q.protocolProblems(PROTOCOL), []);
  const j = journal();
  j.add('protocol.drafted', { protocolId: 'P0', params: PROTOCOL, microbiologicalBasis: '' });
  assert.throws(() => j.add('protocol.approved', { protocolId: 'P0', reference: 'Acta' }), /fundamento microbiológico/);
});

test('F₀ a temperatura constante de referencia es la duración de la meseta', () => {
  const j = qualifiedBase();
  const rows = ['t_min,DL1,DL2,DL3,P'];
  for (let m = 0; m <= 40; m++) {
    const ch = m < 5 ? 100 + m * 4.5 : 122; const prod = m < 10 ? 100 + m * 2.1 : 121.1;
    rows.push([m, ch, prod, prod, ((Q.saturationPressureKpa(ch) - AMBIENT) / KPA_PER_PSI).toFixed(4)].join(','));
  }
  j.setClock('2026-11-08T19:00:00.000Z');
  j.add('run.registered', { runId: 'R-F0', configurationId: 'CFG-4x2.5', protocolId: 'PQ1-v1', executedAt: '2026-11-08T13:00:00.000Z', operator: 'Cuidador', ambientPressureKpa: AMBIENT, pressureUnit: 'psig', gaugeCorrection: 0, plateau: { kind: 'elapsed', start: 10, end: 35 } });
  j.add('run.data_imported', { runId: 'R-F0', fileName: 'f0.csv', data: Q.parseLoggerCsv(rows.join('\n')), mapping: { chamber: 'DL1', products: ['DL2', 'DL3'], pressure: 'P' } });
  const r = runStatus(j, 'R-F0');
  assert.equal(r.metrics.f0.probes.DL2.totalMin, 25);
  assert.equal(r.metrics.f0.crossAtMin, 15);
  assert.ok(Math.abs(r.metrics.deltaT.maxAbsC) < 0.01);
  assert.equal(r.status, 'pendiente'); // faltan indicadores
});

test('tres corridas conformes cierran G2 y liberan solo la carga calificada', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10); addRun(j, 'R2', 11); addRun(j, 'R3', 12);
  const state = Q.foldEvents(j.events);
  const r1 = Q.evaluateRun(state, 'R1', NOW);
  assert.equal(r1.status, 'conforme', JSON.stringify(r1.reasons));
  assert.equal(r1.metrics.f0.coldProbe, 'DL3');
  assert.ok(r1.metrics.f0.minTotalMin >= 15);
  assert.ok(r1.metrics.lag.maxLagMin > 10 && r1.metrics.lag.maxLagMin < 20);
  assert.ok(r1.metrics.deltaT.maxAbsC < 0.05);
  const series = Q.evaluateSeries(state, 'CFG-4x2.5', NOW);
  assert.equal(series.status, 'conforme');
  assert.deepEqual(series.windowTotals, { ci: 9, ib: 9, controls: 3 });
  assert.equal(series.lagRangeMin, 0);

  // Sin G2, G3 y G4 cerradas no hay liberación aunque la serie sea conforme.
  let rel = Q.assessRelease(Q.foldEvents(j.events), { configurationId: 'CFG-4x2.5', plannedBags: 4, plannedWetKgPerBag: 2.5 }, NOW);
  assert.equal(rel.status, 'unknown');
  assert.match(rel.detail, /G2.*G3.*G4/);

  addStudies(j);
  assert.throws(() => j.add('gate.reviewed', { gateId: 'G3', status: 'cerrado', reference: 'PQ-2 A/B' }), /estudio PQ-2 de controles A\/B/);
  j.add('gate.reviewed', { gateId: 'G2', status: 'cerrado', reference: 'Serie PQ-1 R1–R3', details: { configurationId: 'CFG-4x2.5' } });
  j.add('gate.reviewed', { gateId: 'G3', status: 'cerrado', reference: 'PQ-2 A/B 0/2 y 0/2 a 15 d', details: { studyId: 'AB-1' } });
  j.add('gate.reviewed', { gateId: 'G4', status: 'cerrado', reference: 'PDA lote FG-77', details: { studyId: 'C-1' } });
  rel = Q.assessRelease(Q.foldEvents(j.events), { configurationId: 'CFG-4x2.5', plannedBags: 4, plannedWetKgPerBag: 2.5 }, NOW);
  assert.equal(rel.status, 'released', rel.detail);
  assert.match(rel.detail, /No autoriza producción comercial/);
  // G5 se informa pero no bloquea el piloto.
  assert.equal(rel.gates.find((g) => g.id === 'G5').status, 'abierto');

  const bigger = Q.assessRelease(Q.foldEvents(j.events), { configurationId: 'CFG-4x2.5', plannedBags: 6, plannedWetKgPerBag: 2.5 }, NOW);
  assert.equal(bigger.status, 'unknown');
  assert.match(bigger.detail, /No extrapolar/);

  // Una corrida posterior no conforme reabre G2 en la práctica y bloquea.
  addRun(j, 'R4', 20, { indicators: goodIndicators({ ib: [{ position: 'B1', result: 'positivo', readHours: 48 }, { position: 'B3', result: 'negativo', readHours: 48 }, { position: 'B2', result: 'negativo', readHours: 48 }] }) });
  rel = Q.assessRelease(Q.foldEvents(j.events), { configurationId: 'CFG-4x2.5', plannedBags: 4, plannedWetKgPerBag: 2.5 }, NOW);
  assert.equal(rel.status, 'blocked');
  assert.equal(rel.gates.find((g) => g.id === 'G2').status, 'abierto');
});

test('G2 no puede cerrarse sin serie PQ-1 conforme', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10); addRun(j, 'R2', 11);
  assert.throws(() => j.add('gate.reviewed', { gateId: 'G2', status: 'cerrado', reference: 'x', details: { configurationId: 'CFG-4x2.5' } }), /serie PQ-1.*en curso/);
});

test('hueco de datos en la meseta invalida la corrida', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { csv: syntheticCsv({ dropFrom: 60, dropTo: 66 }) });
  const r = runStatus(j, 'R1');
  assert.equal(r.status, 'invalida');
  assert.ok(codes(r).includes('channel_gap'));
});

test('presión incoherente con la temperatura de cámara falla ΔT', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { csv: syntheticCsv({ pressureBiasPsi: 1.2 }) });
  const r = runStatus(j, 'R1');
  assert.equal(r.status, 'no_conforme');
  assert.ok(codes(r).includes('delta_t'));
  assert.ok(r.metrics.deltaT.maxAbsC > 1);
});

test('control positivo sin crecimiento invalida la corrida y bloquea la serie', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { indicators: goodIndicators({ controls: [{ position: 'Incubadora', result: 'negativo' }] }) });
  assert.equal(runStatus(j, 'R1').status, 'invalida');
  const series = Q.evaluateSeries(Q.foldEvents(j.events), 'CFG-4x2.5', NOW);
  assert.equal(series.status, 'no_go');
  const late = qualifiedBase();
  addRun(late, 'R1', 10, { indicators: goodIndicators({ controls: [{ position: 'Incubadora', result: 'positivo', firstPositiveHours: 30 }] }) });
  assert.ok(codes(runStatus(late, 'R1')).includes('control_failed'));
});

test('IB procesado con crecimiento o integrador sin virar → no conforme', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { indicators: goodIndicators({ ci: [{ position: 'B1', result: 'fail' }, { position: 'B2', result: 'pass' }, { position: 'B3', result: 'pass' }] }) });
  assert.equal(runStatus(j, 'R1').status, 'no_conforme');
});

test('IB negativos antes de completar la lectura quedan pendientes; indicadores vencidos invalidan', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { indicators: goodIndicators({ ib: [{ position: 'B1', result: 'negativo', readHours: 24 }, { position: 'B3', result: 'negativo', readHours: 48 }, { position: 'B2', result: 'negativo', readHours: 48 }] }) });
  assert.equal(runStatus(j, 'R1').status, 'pendiente');
  const k = qualifiedBase();
  addRun(k, 'R1', 10, { indicators: goodIndicators({ lots: { ci: { lot: 'a', expiry: '2026-11-01', ifu: 'x' }, ib: { lot: 'b', expiry: '2027-01-01', ifu: 'y' } } }) });
  assert.ok(codes(runStatus(k, 'R1')).includes('ci_expired'));
});

test('el producto que no llega al objetivo o F₀ insuficiente → no conforme', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { csv: syntheticCsv({ productHold: 120.6 }) });
  const r = runStatus(j, 'R1');
  assert.equal(r.status, 'no_conforme');
  assert.ok(codes(r).includes('product_not_reached'));
  const k = qualifiedBase();
  addRun(k, 'R1', 10, { plateau: { start: '2026-11-10T08:30', end: '2026-11-10T08:55' } });
  const r2 = runStatus(k, 'R1');
  assert.ok(codes(r2).includes('f0_not_reached'), JSON.stringify(r2.reasons));
});

test('la meseta redefinida después de cargar datos invalida la corrida', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10);
  j.add('run.plateau_changed', { runId: 'R1', start: '2026-11-10T08:45', end: '2026-11-10T10:30', reason: 'Corrección' });
  assert.ok(codes(runStatus(j, 'R1')).includes('plateau_changed_after_data'));
});

test('corrida con G1 abierta o antes de aprobar el protocolo no cuenta', () => {
  const j = qualifiedBase({ g1: false });
  addRun(j, 'R1', 10);
  assert.ok(codes(runStatus(j, 'R1')).includes('g1_open_at_run'));
  // Registrar tarde un cierre cuya evidencia es anterior sí cuenta (fecha efectiva).
  const k = qualifiedBase({ g1: false });
  k.setClock('2026-11-09T12:00:00.000Z');
  k.add('gate.reviewed', { gateId: 'G1', status: 'cerrado', reference: 'Servicio', effectiveAt: '2026-11-03T15:00:00.000Z', details: { calibrationCertificate: 'CAL', inspectionReport: 'INF' } });
  addRun(k, 'R1', 10);
  assert.equal(runStatus(k, 'R1').status, 'conforme');
  const p = journal();
  p.add('gate.reviewed', { gateId: 'G1', status: 'cerrado', reference: 'S', details: { calibrationCertificate: 'C', inspectionReport: 'I' } });
  p.add('protocol.drafted', { protocolId: 'PQ1-v1', params: PROTOCOL, microbiologicalBasis: BASIS });
  p.add('configuration.defined', { configurationId: 'CFG-4x2.5', equipmentId: '1941X', bagCount: 4, wetMassPerBagKg: 2.5, loadArrangement: 'x' });
  addRun(p, 'R1', 10);
  assert.ok(codes(runStatus(p, 'R1')).includes('protocol_unapproved'));
  p.add('protocol.approved', { protocolId: 'PQ1-v1', reference: 'Acta tardía' });
  assert.ok(codes(runStatus(p, 'R1')).includes('protocol_after_run'));
});

test('el registro empezado con la cámara caliente no demuestra el retardo', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { csv: syntheticCsv({ startHot: true }) });
  assert.ok(codes(runStatus(j, 'R1')).includes('chamber_censored'));
});

test('retardos poco reproducibles entre corridas → serie no conforme', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10, { csv: syntheticCsv({ lag: 5 }) });
  addRun(j, 'R2', 11, { csv: syntheticCsv({ lag: 10 }) });
  addRun(j, 'R3', 12, { csv: syntheticCsv({ lag: 22 }) });
  const series = Q.evaluateSeries(Q.foldEvents(j.events), 'CFG-4x2.5', NOW);
  assert.equal(series.streak, 3);
  assert.equal(series.status, 'no_go');
  assert.ok(series.lagRangeMin > 10);
});

test('reemplazar datos exige una desviación cerrada que lo explique', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10);
  j.add('run.data_imported', { runId: 'R1', fileName: 'otra.csv', data: Q.parseLoggerCsv(syntheticCsv().replace(/2026-11-10/g, '2026-11-10')), mapping: { chamber: 'DL1', products: ['DL2', 'DL3'], pressure: 'P_psig' } });
  assert.ok(codes(runStatus(j, 'R1')).includes('data_replaced'));
  j.add('run.deviation_recorded', { runId: 'R1', deviationId: 'DV-1', description: 'Se cargó primero el archivo del banco', status: 'abierta' });
  assert.equal(runStatus(j, 'R1').status, 'pendiente');
  j.add('run.deviation_recorded', { runId: 'R1', deviationId: 'DV-1', description: 'Se cargó primero el archivo del banco', status: 'cerrada', resolution: 'Archivo correcto verificado por serial DL' });
  assert.equal(runStatus(j, 'R1').status, 'conforme');
});

test('el registro es sólo-anexar e inmutable donde importa', () => {
  const j = qualifiedBase();
  assert.throws(() => j.add('configuration.defined', { configurationId: 'CFG-4x2.5', equipmentId: '1941X', bagCount: 6, wetMassPerBagKg: 2, loadArrangement: 'x' }), /inmutable/);
  assert.throws(() => j.add('protocol.drafted', { protocolId: 'PQ1-v1', params: PROTOCOL, microbiologicalBasis: BASIS }), /ya está aprobado/);
  assert.throws(() => j.add('gate.reviewed', { gateId: 'G1', status: 'cerrado', reference: 'x', details: {} }), /certificado de calibración/);
  assert.throws(() => j.add('gate.reviewed', { gateId: 'G5', status: 'cerrado', reference: 'x', details: { plannedBlocksPerWeek: 40 } }), /alternativa/);
  assert.throws(() => j.add('run.registered', { runId: 'RX', configurationId: 'CFG-4x2.5', protocolId: 'PQ1-v1', executedAt: '2026-11-10T13:00:00.000Z', operator: 'x', pressureUnit: 'psig', gaugeCorrection: 0, plateau: { kind: 'elapsed', start: 1, end: 2 } }), /presión ambiente/);
  assert.throws(() => Q.createEvent(j.events, 'gate.reviewed', { gateId: 'G3', status: 'abierto', notes: 'n' }, { at: '2026-10-01T00:00:00.000Z', by: 'x', id: 'late', nowMs: NOW }), /sólo-anexar/);
});

test('errores de captura se rechazan antes de guardar la corrida', () => {
  const j = qualifiedBase();
  const register = (runId, plateau, executedAt = '2026-11-10T13:00:00.000Z') => j.add('run.registered', { runId, configurationId: 'CFG-4x2.5', protocolId: 'PQ1-v1', executedAt, operator: 'C', ambientPressureKpa: AMBIENT, pressureUnit: 'psig', gaugeCorrection: 0, plateau: { kind: 'datetime', ...plateau } });
  const data = Q.parseLoggerCsv(syntheticCsv());
  const imp = (runId, mapping = { chamber: 'DL1', products: ['DL2', 'DL3'], pressure: 'P_psig' }) => j.add('run.data_imported', { runId, fileName: 'x.csv', data, mapping });
  j.setClock('2026-11-10T19:00:00.000Z');
  register('RA', { start: '2026-11-10T08:30', end: '2026-11-10T13:30' });
  assert.throws(() => imp('RA'), /fuera del registro/);
  register('RB', { start: '2026-11-10T08:30', end: '2026-11-10T10:30' });
  assert.throws(() => imp('RB', { chamber: 'DL1', products: ['DL2'], pressure: 'P_psig' }), /2 sonda/);
  register('RC', { start: '2026-11-10T08:30', end: '2026-11-10T10:30' }, '2026-11-08T13:00:00.000Z');
  assert.throws(() => imp('RC'), /no coincide con la fecha/);
});

test('PQ-2 A/B: 0/n en ambos grupos tras la duración fijada; contaminación, temperatura y huecos', () => {
  const ok = qualifiedBase(); addStudies(ok);
  const st = Q.foldEvents(ok.events);
  assert.equal(Q.evaluateStudy(st, 'AB-1', NOW).status, 'conforme');
  assert.equal(Q.evaluateStudy(st, 'C-1', NOW).status, 'conforme');
  assert.deepEqual(Q.evaluateStudy(st, 'C-1', NOW).metrics.jumpDays, { P1: 3, P2: 3 });

  const dirty = qualifiedBase(); addStudies(dirty, { abState: (u, d) => (u === 'B2' && d >= 14 ? 'contaminada' : 'limpia') });
  const e = Q.evaluateStudy(Q.foldEvents(dirty.events), 'AB-1', NOW);
  assert.equal(e.status, 'no_conforme');
  assert.equal(e.metrics.contaminatedB, 1);
  assert.throws(() => dirty.add('gate.reviewed', { gateId: 'G3', status: 'cerrado', reference: 'x', details: { studyId: 'AB-1' } }), /no conforme/);

  const warm = qualifiedBase(); addStudies(warm, { temp: 25 });
  assert.ok(Q.evaluateStudy(Q.foldEvents(warm.events), 'AB-1', NOW).reasons.some((r) => r.code === 'temp_out'));
  const sparse = qualifiedBase(); addStudies(sparse, { readDays: [7, 15.1] });
  assert.equal(Q.evaluateStudy(Q.foldEvents(sparse.events), 'AB-1', NOW).status, 'invalida');
  const early = qualifiedBase(); addStudies(early, { readDays: [7, 14] });
  assert.equal(Q.evaluateStudy(Q.foldEvents(early.events), 'AB-1', NOW).status, 'pendiente');
});

test('PQ-2 se fija antes de empezar y las lecturas son completas y ordenadas', () => {
  const j = qualifiedBase(); addStudies(j);
  const base = { kind: 'AB', startedAt: '2026-11-05T15:00:00.000Z', configurationId: 'CFG-4x2.5', thermalRunRef: 'R3', nPerGroup: 2, incubationTempC: 23, tempToleranceC: 1, readingIntervalDays: 7 };
  assert.throws(() => j.add('pq2.defined', { ...base, studyId: 'AB-2', observationDays: 30 }), /15–21/);
  assert.throws(() => j.add('pq2.defined', { ...base, studyId: 'AB-1', observationDays: 15 }), /inmutable/);
  assert.throws(() => j.add('pq2.defined', { ...base, studyId: 'AB-3', observationDays: 15, tempToleranceC: '' }), /tolerancia/);
  assert.throws(() => j.add('pq2.reading', { studyId: 'AB-1', readAt: '2026-11-19T17:40:00.000Z', tempC: 23, units: { A1: 'limpia', A2: 'limpia', B1: 'limpia' } }), /estado de B2/);
  assert.throws(() => j.add('pq2.reading', { studyId: 'AB-1', readAt: '2026-11-10T16:00:00.000Z', tempC: 23, units: { A1: 'limpia', A2: 'limpia', B1: 'limpia', B2: 'limpia' } }), /en orden/);
});

test('PQ-2 C: blanco con crecimiento invalida; salto tardío no cumple', () => {
  const j = qualifiedBase();
  j.setClock('2026-11-19T18:00:00.000Z');
  j.add('pq2.defined', { studyId: 'C-2', kind: 'C', startedAt: '2026-11-10T15:00:00.000Z', spawnLot: 'FG-78', plates: 1, blanks: 1, maxJumpDays: 5, observationDays: 7, incubationTempC: 23, tempToleranceC: 1, readingIntervalDays: 4 });
  j.add('pq2.reading', { studyId: 'C-2', readAt: '2026-11-13T15:00:00.000Z', tempC: 23, units: { P1: 'sin_salto', K1: 'sin_crecimiento' } });
  j.add('pq2.reading', { studyId: 'C-2', readAt: '2026-11-16T15:00:00.000Z', tempC: 23, units: { P1: 'salto', K1: 'sin_crecimiento' } });
  j.add('pq2.reading', { studyId: 'C-2', readAt: '2026-11-17T16:00:00.000Z', tempC: 23, units: { P1: 'salto', K1: 'con_crecimiento' } });
  const e = Q.evaluateStudy(Q.foldEvents(j.events), 'C-2', NOW);
  assert.equal(e.status, 'invalida');
  assert.ok(e.reasons.some((r) => r.code === 'jump_late'));
  assert.ok(e.reasons.some((r) => r.code === 'blank_growth'));
});

test('una lectura PQ-2 contaminada después del cierre reabre G3 en la liberación', () => {
  const j = qualifiedBase();
  addRun(j, 'R1', 10); addRun(j, 'R2', 11); addRun(j, 'R3', 12);
  addStudies(j);
  j.add('gate.reviewed', { gateId: 'G2', status: 'cerrado', reference: 'x', details: { configurationId: 'CFG-4x2.5' } });
  j.add('gate.reviewed', { gateId: 'G3', status: 'cerrado', reference: 'x', details: { studyId: 'AB-1' } });
  j.add('gate.reviewed', { gateId: 'G4', status: 'cerrado', reference: 'x', details: { studyId: 'C-1' } });
  const load = { configurationId: 'CFG-4x2.5', plannedBags: 4, plannedWetKgPerBag: 2.5 };
  assert.equal(Q.assessRelease(Q.foldEvents(j.events), load, NOW).status, 'released');
  j.add('pq2.reading', { studyId: 'AB-1', readAt: '2026-11-19T17:50:00.000Z', tempC: 23, units: { A1: 'contaminada', A2: 'limpia', B1: 'limpia', B2: 'limpia' } });
  const rel = Q.assessRelease(Q.foldEvents(j.events), load, NOW);
  assert.equal(rel.status, 'unknown');
  assert.match(rel.gates.find((g) => g.id === 'G3').effectiveNote, /ya no es conforme/);
});

test('bestReleaseForLoad resume la calificación para una autorización humana', () => {
  assert.deepEqual(Q.bestReleaseForLoad([], { plannedBags: 4, plannedWetKgPerBag: 2.5 }, NOW).status, 'unknown');
  const j = qualifiedBase();
  addRun(j, 'R1', 10); addRun(j, 'R2', 11); addRun(j, 'R3', 12);
  addStudies(j);
  j.add('gate.reviewed', { gateId: 'G2', status: 'cerrado', reference: 'x', details: { configurationId: 'CFG-4x2.5' } });
  j.add('gate.reviewed', { gateId: 'G3', status: 'cerrado', reference: 'x', details: { studyId: 'AB-1' } });
  j.add('gate.reviewed', { gateId: 'G4', status: 'cerrado', reference: 'x', details: { studyId: 'C-1' } });
  const ok = Q.bestReleaseForLoad(j.events, { plannedBags: 4, plannedWetKgPerBag: 2.5 }, NOW);
  assert.deepEqual([ok.status, ok.configurationId], ['released', 'CFG-4x2.5']);
  assert.equal(Q.bestReleaseForLoad(j.events, { plannedBags: 10, plannedWetKgPerBag: 1 }, NOW).status, 'unknown');
  // El diálogo de autorización la usa y exige reconocer un ciclo sin calificar.
  const app = require('node:fs').readFileSync(require.resolve('./simulador-app.jsx'), 'utf8');
  assert.match(app, /SetasAutoclaveQualification\.bestReleaseForLoad\(/);
  assert.match(app, /Confirmar que el ciclo del autoclave no está calificado para esta carga/);
  assert.match(app, /autoclaveQualification:autoclave/);
});

test('readEvents rechaza datos dañados sin sobrescribir', () => {
  const store = (v) => ({ getItem: () => v });
  assert.deepEqual(Q.readEvents(store(null)), []);
  assert.throws(() => Q.readEvents(store('{')), /dañado/);
  assert.throws(() => Q.readEvents(store('[{"schema":"x"}]')), /formato válido/);
  const j = qualifiedBase();
  assert.equal(Q.readEvents(store(JSON.stringify(j.events))).length, j.events.length);
  // Un evento con referencias rotas (respaldo editado a mano) no llega a la interfaz.
  const orphan = { schema: Q.SCHEMA, id: 'X', type: 'run.indicators_recorded', at: '2026-11-19T00:00:00.000Z', by: 'x', payload: { runId: 'NOPE', indicators: {} } };
  assert.throws(() => Q.readEvents(store(JSON.stringify([...j.events, orphan]))), /formato válido/);
});

test('summarize señala la siguiente compuerta abierta', () => {
  const j = qualifiedBase();
  const s = Q.summarize(j.events, NOW);
  assert.equal(s.next.id, 'G2');
  assert.equal(s.configurations[0].series.status, 'sin_corridas');
});

// ── cableado en la app (fuente) ───────────────────────────────────────────
test('la app monta el panel, alimenta Preparación y rotula el simulador como modelo', () => {
  const fs = require('node:fs');
  const app = fs.readFileSync(require.resolve('./simulador-app.jsx'), 'utf8');
  const sources = require('./jsx-sources.cjs');
  assert.ok(sources.indexOf('autoclave-qualification.js') < sources.indexOf('views/autoclave-qualification-panel.jsx'));
  assert.ok(sources.indexOf('views/autoclave-qualification-panel.jsx') < sources.indexOf('simulador-app.jsx'));
  assert.match(app, /<AutoclaveQualificationPanel events=\{autoclaveQual\.events\}/);
  assert.match(app, /autoclaveReleases=Object\.fromEntries/);
  assert.match(app, /SetasPrototype\.persist\(localStorage,\[\[SetasAutoclaveQualification\.KEY,events\]\]\)/);
  assert.match(app, /data-testid="autoclave-sim-notice"/);
  assert.match(app, /Simulación de modelo, no una corrida/);
  // El registro viaja en el respaldo portable de ensayos.
  assert.ok(require('./prototype-readiness.js').KEYS.includes(Q.KEY));
});
