'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  EXPOSURE_THRESHOLDS,
  PATHOGEN_RISK_MODELS,
  extractClimateExposure,
  scorePathogenRisk,
  assessLotRisk,
  assessRoomRisk
} = require('./contamination-risk.js');

const HOUR = 3600 * 1000;
const NOW = Date.parse('2026-09-28T12:00:00Z');

function buildSeries(hoursBack, generator) {
  const points = [];
  for (let h = hoursBack; h >= 0; h--) {
    const t = NOW - h * HOUR;
    points.push(Object.assign({ t: new Date(t).toISOString() }, generator(h)));
  }
  return points;
}

test('extractClimateExposure: serie vacía devuelve ceros y coverageHours 0', () => {
  const exp = extractClimateExposure([], { now: NOW });
  assert.equal(exp.readingCount, 0);
  assert.equal(exp.coverageHours, 0);
  assert.equal(exp.highHumidityHours, 0);
  assert.equal(exp.tempSwingMax, null);
});

test('extractClimateExposure: robusto a NaN, campos faltantes y series no ordenadas', () => {
  const series = [
    { t: new Date(NOW - 1 * HOUR).toISOString(), temperature_c: NaN, rh_pct: 96 },
    { t: new Date(NOW - 3 * HOUR).toISOString(), temperature_c: 22, rh_pct: 'no-numero' },
    { t: new Date(NOW).toISOString() }, // sin campos
    { t: new Date(NOW - 2 * HOUR).toISOString(), temperature_c: 21, rh_pct: 90 }
  ];
  const exp = extractClimateExposure(series, { now: NOW });
  assert.equal(exp.readingCount, 4);
  assert.ok(Number.isFinite(exp.coverageHours));
});

test('extractClimateExposure: ignora lecturas fuera de la ventana', () => {
  const series = [
    { t: new Date(NOW - 200 * HOUR).toISOString(), temperature_c: 30, rh_pct: 99 },
    { t: new Date(NOW - 1 * HOUR).toISOString(), temperature_c: 20, rh_pct: 90 }
  ];
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.equal(exp.readingCount, 1);
});

test('extractClimateExposure: no cuenta a través de huecos de telemetría > 90 min', () => {
  const series = [
    { t: new Date(NOW - 10 * HOUR).toISOString(), temperature_c: 30, rh_pct: 99 },
    // hueco de 5 horas (> 90 min) antes del siguiente punto
    { t: new Date(NOW - 5 * HOUR).toISOString(), temperature_c: 30, rh_pct: 99 },
    { t: new Date(NOW).toISOString(), temperature_c: 30, rh_pct: 99 }
  ];
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  // El hueco de 5h entre el primer y segundo punto no debe contarse como exposición.
  assert.ok(exp.gapCount >= 1);
  assert.ok(exp.coverageHours < 10);
});

test('extractClimateExposure: cuenta horas de humedad alta y saturación correctamente', () => {
  const series = buildSeries(10, (h) => ({ temperature_c: 20, rh_pct: h < 5 ? 99 : 80 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.ok(exp.saturationHours > 0);
  assert.ok(exp.highHumidityHours >= exp.saturationHours);
});

test('extractClimateExposure: cuenta horas cálidas y calientes', () => {
  const series = buildSeries(10, (h) => ({ temperature_c: h < 3 ? 29 : 22, rh_pct: 85 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.ok(exp.hotHours > 0);
  assert.ok(exp.warmHours >= exp.hotHours);
});

test('extractClimateExposure: detecta estancamiento por CO2 alto', () => {
  const series = buildSeries(10, (h) => ({ temperature_c: 20, rh_pct: 85, co2_ppm: h < 4 ? 2500 : 700 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.ok(exp.stagnationHours > 0);
});

test('extractClimateExposure: detecta eventos de condensación al caer T bajo el punto de rocío previo', () => {
  // 18°C/95%HR -> dew point ~17.1°C. Bajar a 16°C debe disparar condensación.
  const series = [
    { t: new Date(NOW - 3 * HOUR).toISOString(), temperature_c: 18, rh_pct: 95 },
    { t: new Date(NOW - 2 * HOUR).toISOString(), temperature_c: 16, rh_pct: 95 },
    { t: new Date(NOW - 1 * HOUR).toISOString(), temperature_c: 16, rh_pct: 95 },
    { t: new Date(NOW).toISOString(), temperature_c: 20, rh_pct: 70 }
  ];
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.equal(exp.condensationEvents, 1); // un solo evento discreto, no uno por lectura sostenida
});

test('extractClimateExposure: calcula tempSwingMax dentro de ventanas de 24h', () => {
  const series = [
    { t: new Date(NOW - 20 * HOUR).toISOString(), temperature_c: 15, rh_pct: 85 },
    { t: new Date(NOW - 10 * HOUR).toISOString(), temperature_c: 27, rh_pct: 85 },
    { t: new Date(NOW).toISOString(), temperature_c: 16, rh_pct: 85 }
  ];
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.ok(exp.tempSwingMax >= 11.9 && exp.tempSwingMax <= 12.1);
});

test('extractClimateExposure: coverageRatio refleja fracción de la ventana con datos', () => {
  const series = buildSeries(36, () => ({ temperature_c: 20, rh_pct: 85 })); // ~36h de 72h
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.ok(exp.coverageRatio > 0.3 && exp.coverageRatio < 0.7);
});

test('extractClimateExposure: now inválido no rompe y devuelve ceros', () => {
  const exp = extractClimateExposure([{ t: NOW, temperature_c: 20, rh_pct: 90 }], { now: NaN });
  assert.equal(exp.readingCount, 0);
});

test('PATHOGEN_RISK_MODELS: cada patógeno tiene provenance en todos sus factores', () => {
  for (const pid of Object.keys(PATHOGEN_RISK_MODELS)) {
    const model = PATHOGEN_RISK_MODELS[pid];
    assert.ok(model.factors.length > 0);
    for (const f of model.factors) {
      assert.ok(f.provenance && (f.provenance.class === 'literature_target' || f.provenance.class === 'heuristic'));
      assert.ok(f.provenance.source);
    }
  }
});

test('EXPOSURE_THRESHOLDS: cada umbral declara provenance', () => {
  for (const key of Object.keys(EXPOSURE_THRESHOLDS)) {
    const t = EXPOSURE_THRESHOLDS[key];
    assert.ok(t.provenance && (t.provenance.class === 'literature_target' || t.provenance.class === 'heuristic'));
  }
});

test('scorePathogenRisk: patógeno desconocido devuelve sin_datos y confidence low', () => {
  const exp = extractClimateExposure([], { now: NOW });
  const result = scorePathogenRisk('patogeno_inexistente', exp, {});
  assert.equal(result.level, 'sin_datos');
  assert.equal(result.confidence, 'low');
  assert.equal(result.score, 0);
});

test('scorePathogenRisk: nunca devuelve confidence high', () => {
  const series = buildSeries(48, () => ({ temperature_c: 29, rh_pct: 99, co2_ppm: 3000 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  for (const pid of Object.keys(PATHOGEN_RISK_MODELS)) {
    const r = scorePathogenRisk(pid, exp, { stage: 'incubation' });
    assert.notEqual(r.confidence, 'high');
    assert.ok(['low', 'medium'].includes(r.confidence));
  }
});

test('scorePathogenRisk: exposición alta y sostenida sube el score de trichoderma vs exposición nula', () => {
  const hotSeries = buildSeries(48, () => ({ temperature_c: 29, rh_pct: 80, co2_ppm: 2500 }));
  const coldSeries = buildSeries(48, () => ({ temperature_c: 18, rh_pct: 85, co2_ppm: 600 }));
  const expHot = extractClimateExposure(hotSeries, { now: NOW, windowHours: 72 });
  const expCold = extractClimateExposure(coldSeries, { now: NOW, windowHours: 72 });
  const rHot = scorePathogenRisk('trichoderma', expHot, { stage: 'incubation' });
  const rCold = scorePathogenRisk('trichoderma', expCold, { stage: 'incubation' });
  assert.ok(rHot.score > rCold.score);
  assert.ok(rHot.factors.length > 0);
  // factores ordenados desc por contribución
  for (let i = 1; i < rHot.factors.length; i++) {
    assert.ok(rHot.factors[i - 1].contribution >= rHot.factors[i].contribution);
  }
});

test('scorePathogenRisk: etapa no susceptible atenúa el score respecto a la etapa susceptible', () => {
  const series = buildSeries(48, () => ({ temperature_c: 29, rh_pct: 80, co2_ppm: 2500 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const susceptible = scorePathogenRisk('trichoderma', exp, { stage: 'incubation' });
  const notSusceptible = scorePathogenRisk('trichoderma', exp, { stage: 'fruiting' });
  assert.ok(susceptible.score >= notSusceptible.score);
});

test('scorePathogenRisk: historial de sala con mismo patógeno incrementa el score', () => {
  const series = buildSeries(20, () => ({ temperature_c: 22, rh_pct: 96 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const withoutHistory = scorePathogenRisk('cobweb', exp, { stage: 'fruiting' });
  const withHistory = scorePathogenRisk('cobweb', exp, {
    stage: 'fruiting',
    roomHistory: { contaminationEventsLast30d: 2, pathogenIds: ['cobweb'] }
  });
  assert.ok(withHistory.score >= withoutHistory.score);
  assert.ok(withHistory.factors.some((f) => f.id === 'roomHistory'));
});

test('scorePathogenRisk: preventiveActions no está vacío y son strings', () => {
  const series = buildSeries(20, () => ({ temperature_c: 29, rh_pct: 99, co2_ppm: 2500 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const r = scorePathogenRisk('bacillus', exp, { stage: 'fruiting' });
  assert.ok(r.preventiveActions.length > 0);
  for (const a of r.preventiveActions) assert.equal(typeof a, 'string');
});

test('assessLotRisk: sin serie devuelve nivel sin_datos y confidence low', () => {
  const result = assessLotRisk({ lot: { id: 'lote-1', stage: 'incubation' }, series: [], now: NOW });
  assert.equal(result.overallLevel, 'sin_datos');
  assert.equal(result.confidence, 'low');
  assert.equal(result.lotId, 'lote-1');
});

test('assessLotRisk: cobertura baja produce confidence low con nota explícita', () => {
  // Solo un puñado de lecturas en una ventana de 72h => cobertura < 50%
  const series = [
    { t: new Date(NOW - 2 * HOUR).toISOString(), temperature_c: 29, rh_pct: 99 },
    { t: new Date(NOW - 1 * HOUR).toISOString(), temperature_c: 29, rh_pct: 99 }
  ];
  const result = assessLotRisk({ lot: { id: 'lote-2', stage: 'fruiting' }, series, now: NOW, windowHours: 72 });
  assert.equal(result.confidence, 'low');
  assert.ok(result.disclaimer.includes('Cobertura de telemetría baja'));
});

test('assessLotRisk: cobertura alta (>=50%) permite confidence medium', () => {
  const series = buildSeries(72, () => ({ temperature_c: 22, rh_pct: 85, co2_ppm: 700 }));
  const result = assessLotRisk({ lot: { id: 'lote-3', stage: 'fruiting' }, series, now: NOW, windowHours: 72 });
  assert.equal(result.confidence, 'medium');
});

test('assessLotRisk: overallScore es el máximo entre patógenos y pathogens viene ordenado desc', () => {
  const series = buildSeries(72, () => ({ temperature_c: 29, rh_pct: 99, co2_ppm: 3000 }));
  const result = assessLotRisk({ lot: { id: 'lote-4', stage: 'fruiting' }, series, now: NOW, windowHours: 72 });
  assert.equal(result.overallScore, result.pathogens[0].score);
  for (let i = 1; i < result.pathogens.length; i++) {
    assert.ok(result.pathogens[i - 1].score >= result.pathogens[i].score);
  }
  assert.ok(result.topFactors.length > 0);
});

test('assessRoomRisk: sin lotes devuelve sin_datos', () => {
  const result = assessRoomRisk({ roomId: 'sala-1', lots: [], now: NOW });
  assert.equal(result.overallLevel, 'sin_datos');
  assert.equal(result.confidence, 'low');
});

test('assessRoomRisk: agrega varios lotes y usa la serie de sala como fallback', () => {
  const roomSeries = buildSeries(72, () => ({ temperature_c: 29, rh_pct: 99, co2_ppm: 2500 }));
  const result = assessRoomRisk({
    roomId: 'sala-2',
    lots: [
      { id: 'lote-a', stage: 'incubation' },
      { id: 'lote-b', stage: 'fruiting' }
    ],
    series: roomSeries,
    now: NOW,
    windowHours: 72
  });
  assert.equal(result.lots.length, 2);
  assert.ok(result.overallScore > 0);
  assert.equal(result.overallScore, Math.max(...result.lots.map((l) => l.overallScore)));
});

test('assessRoomRisk: un lote con su propia serie distinta de la de sala se respeta', () => {
  const roomSeries = buildSeries(72, () => ({ temperature_c: 18, rh_pct: 80, co2_ppm: 600 }));
  const hotLotSeries = buildSeries(72, () => ({ temperature_c: 29, rh_pct: 99, co2_ppm: 3000 }));
  const result = assessRoomRisk({
    roomId: 'sala-3',
    lots: [
      { id: 'lote-frio', stage: 'fruiting' },
      { id: 'lote-caliente', stage: 'incubation', series: hotLotSeries }
    ],
    series: roomSeries,
    now: NOW,
    windowHours: 72
  });
  const frio = result.lots.find((l) => l.lotId === 'lote-frio');
  const caliente = result.lots.find((l) => l.lotId === 'lote-caliente');
  assert.ok(caliente.overallScore > frio.overallScore);
});
