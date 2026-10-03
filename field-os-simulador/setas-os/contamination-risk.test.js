'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  EXPOSURE_THRESHOLDS,
  PATHOGEN_RISK_MODELS,
  normalizeStage,
  getStagnationCo2Threshold,
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

// Hallazgo #14: la condensación solo puede confirmarse con una temperatura
// de SUPERFICIE/SUSTRATO real, no comparando el aire consigo mismo. Antes
// se comparaba la temperatura del aire actual contra el punto de rocío de
// la lectura ANTERIOR, lo que a RH alta disparaba "eventos" con cualquier
// oscilación de sensor de ~0.6°C — sin ningún dato de superficie de por
// medio. Sin sensor de superficie en la serie, el resultado debe ser null
// (sin evidencia), nunca 0 (que afirmaría "sin condensación" sin haberla
// medido).
test('extractClimateExposure: sin sensor de superficie/sustrato, condensationEvents es null (no 0)', () => {
  const series = [
    { t: new Date(NOW - 3 * HOUR).toISOString(), temperature_c: 18, rh_pct: 95 },
    { t: new Date(NOW - 2 * HOUR).toISOString(), temperature_c: 16, rh_pct: 95 },
    { t: new Date(NOW - 1 * HOUR).toISOString(), temperature_c: 16, rh_pct: 95 },
    { t: new Date(NOW).toISOString(), temperature_c: 20, rh_pct: 70 }
  ];
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.equal(exp.condensationEvents, null);
});

test('extractClimateExposure: detecta eventos de condensación cuando la superficie cae bajo el punto de rocío del aire actual', () => {
  // Aire a 20°C/95%HR -> punto de rocío ~19.1°C. Una superficie/sustrato a
  // 18°C (por debajo del punto de rocío del aire que la rodea) SÍ condensa.
  const series = [
    { t: new Date(NOW - 3 * HOUR).toISOString(), temperature_c: 20, rh_pct: 95, substrate_temperature_c: 21 },
    { t: new Date(NOW - 2 * HOUR).toISOString(), temperature_c: 20, rh_pct: 95, substrate_temperature_c: 18 },
    { t: new Date(NOW - 1 * HOUR).toISOString(), temperature_c: 20, rh_pct: 95, substrate_temperature_c: 18 },
    { t: new Date(NOW).toISOString(), temperature_c: 20, rh_pct: 70, substrate_temperature_c: 21 }
  ];
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.equal(exp.condensationEvents, 1); // un solo evento discreto, no uno por lectura sostenida
});

test('extractClimateExposure: alta RH sin sensor de superficie no cuenta como condensación aunque oscile el aire (evita el falso saturamiento del hallazgo #14)', () => {
  const series = buildSeries(20, (h) => ({ temperature_c: h % 2 === 0 ? 20 : 20.6, rh_pct: 96 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.equal(exp.condensationEvents, null);
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

// Hallazgo #5: una serie horaria que cubre exactamente la ventana completa
// (72 lecturas horarias en una ventana de 72h) no debe reportar más de 72h
// de cobertura. Antes la última lectura recibía un segmento simétrico
// adicional, dando 73h de cobertura sobre una ventana de 72h
// (coverageRatio 1.014, por encima del 100%).
test('extractClimateExposure: coverageRatio nunca supera 1.0 aunque la serie cubra toda la ventana (hallazgo #5)', () => {
  const series = buildSeries(72, () => ({ temperature_c: 20, rh_pct: 85 })); // 73 lecturas horarias, 0..72h
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  assert.ok(exp.coverageHours <= 72, `coverageHours (${exp.coverageHours}) no debe superar windowHours (72)`);
  assert.ok(exp.coverageRatio <= 1, `coverageRatio (${exp.coverageRatio}) no debe superar 1.0`);
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

// ---------------------------------------------------------------------
// Hallazgo #6 — normalizeStage: la comparación de etapa era sensible a
// mayúsculas/idioma, por lo que un `stage` en español ('incubacion') no
// coincidía con el valor canónico en inglés del catálogo, atenuando el
// score de Trichoderma como si el lote NO estuviera en una etapa
// susceptible. Además, nada mapeaba 'maturation'/'resting'.
// ---------------------------------------------------------------------
test('normalizeStage (contamination-risk): normaliza español/mayúsculas/acentos al mismo valor canónico', () => {
  assert.equal(normalizeStage('incubacion'), 'incubation');
  assert.equal(normalizeStage('INCUBACIÓN'), 'incubation');
  assert.equal(normalizeStage('Incubation'), 'incubation');
  assert.equal(normalizeStage('maduracion'), 'maturation');
  assert.equal(normalizeStage('descanso'), 'resting');
  assert.equal(normalizeStage('reposo'), 'resting');
  assert.equal(normalizeStage('estado-desconocido'), null);
});

test('scorePathogenRisk: stage "incubacion" (español) puntúa igual que "incubation" para trichoderma (hallazgo #6)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 29, rh_pct: 80, co2_ppm: 2500 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const en = scorePathogenRisk('trichoderma', exp, { stage: 'incubation' });
  const es = scorePathogenRisk('trichoderma', exp, { stage: 'incubacion' });
  assert.equal(es.score, en.score);
});

test('scorePathogenRisk: trichoderma es susceptible en maturation y resting (hallazgo #6)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 29, rh_pct: 80, co2_ppm: 2500 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const baseline = scorePathogenRisk('trichoderma', exp, { stage: 'incubation' });
  const maturation = scorePathogenRisk('trichoderma', exp, { stage: 'maturation' });
  const resting = scorePathogenRisk('trichoderma', exp, { stage: 'resting' });
  assert.equal(maturation.score, baseline.score);
  assert.equal(resting.score, baseline.score);
});

// ---------------------------------------------------------------------
// Hallazgo #12 — bacillus: el catálogo lo describe como grano/sustrato
// húmedo por esterilización deficiente o exceso de agua EN LA MEZCLA (un
// problema de incubación), no condensación de fructificación. El modelo ya
// no debe considerar 'fruiting' su etapa susceptible.
// ---------------------------------------------------------------------
test('PATHOGEN_RISK_MODELS.bacillus: susceptibleStages es incubation, ya no fruiting (hallazgo #12)', () => {
  assert.deepEqual(PATHOGEN_RISK_MODELS.bacillus.susceptibleStages, ['incubation']);
  const factorIds = PATHOGEN_RISK_MODELS.bacillus.factors.map((f) => f.id);
  assert.ok(!factorIds.includes('condensationEvents'), 'condensationEvents ya no debe ser el driver principal de bacillus');
});

test('scorePathogenRisk: bacillus en incubación puntúa por encima de bacillus en fruiting (hallazgo #12)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 29, rh_pct: 99, co2_ppm: 3000 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const incubation = scorePathogenRisk('bacillus', exp, { stage: 'incubation' });
  const fruiting = scorePathogenRisk('bacillus', exp, { stage: 'fruiting' });
  assert.ok(incubation.score >= fruiting.score);
});

// ---------------------------------------------------------------------
// Hallazgo #13 — Mycogone perniciosa: reportado mayoritariamente como
// patógeno de Agaricus; este catálogo de especies no cultiva Agaricus, así
// que su score no debería dominar el ranking de un lote de otra especie sin
// evidencia propia.
// ---------------------------------------------------------------------
test('scorePathogenRisk: mycogone se atenúa para especies no-Agaricus (hallazgo #13)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 22, rh_pct: 99, co2_ppm: 2500 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const pleurotus = scorePathogenRisk('mycogone', exp, { stage: 'fruiting', speciesId: 'p_ostreatus_gris' });
  const agaricus = scorePathogenRisk('mycogone', exp, { stage: 'fruiting', speciesId: 'a_bisporus' });
  assert.ok(pleurotus.score < agaricus.score);
});

test('assessLotRisk: mycogone ya no domina el ranking de un lote de fructificación de una especie no-Agaricus (hallazgo #13)', () => {
  const series = buildSeries(72, () => ({ temperature_c: 22, rh_pct: 99, co2_ppm: 2500 }));
  const result = assessLotRisk({ lot: { id: 'lote-pleurotus', stage: 'fruiting', speciesId: 'p_ostreatus_gris' }, series, now: NOW, windowHours: 72 });
  const mycogone = result.pathogens.find((p) => p.pathogenId === 'mycogone');
  assert.ok(mycogone.score < result.overallScore || result.pathogens[0].pathogenId !== 'mycogone');
});

// ---------------------------------------------------------------------
// Hallazgo #15 — estancamiento por CO2: 2000 ppm se contaba como riesgo sin
// distinguir etapa ni especie, pero la KB prescribe 1500-2500 ppm para
// desarrollo de tallo de eryngii, y CO2 alto es normal en incubación.
// ---------------------------------------------------------------------
test('getStagnationCo2Threshold: usa 3000 ppm para eryngii y 2000 ppm por defecto (hallazgo #15)', () => {
  assert.equal(getStagnationCo2Threshold('p_eryngii').value, 3000);
  assert.equal(getStagnationCo2Threshold('p_ostreatus_gris').value, 2000);
  assert.equal(getStagnationCo2Threshold(undefined).value, 2000);
});

test('scorePathogenRisk: el factor stagnationHours no cuenta en incubación aunque el CO2 sea alto (hallazgo #15)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 20, rh_pct: 80, co2_ppm: 6000 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const r = scorePathogenRisk('trichoderma', exp, { stage: 'incubation' });
  const stagnationFactor = r.factors.find((f) => f.id === 'stagnationHours');
  assert.equal(stagnationFactor.contribution, 0);
  assert.ok(stagnationFactor.note && stagnationFactor.note.length > 0);
});

test('scorePathogenRisk: el factor stagnationHours sí cuenta en fructificación con CO2 alto (hallazgo #15)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 20, rh_pct: 80, co2_ppm: 6000 }));
  const exp = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const r = scorePathogenRisk('trichoderma', exp, { stage: 'fruiting' });
  const stagnationFactor = r.factors.find((f) => f.id === 'stagnationHours');
  assert.ok(stagnationFactor.contribution > 0);
});

test('extractClimateExposure: con speciesId eryngii, 2500 ppm ya no cuenta como estancamiento (dentro del rango objetivo de KB)', () => {
  const series = buildSeries(48, () => ({ temperature_c: 20, rh_pct: 80, co2_ppm: 2500 }));
  const expDefault = extractClimateExposure(series, { now: NOW, windowHours: 72 });
  const expEryngii = extractClimateExposure(series, { now: NOW, windowHours: 72, speciesId: 'p_eryngii' });
  assert.ok(expDefault.stagnationHours > 0);
  assert.equal(expEryngii.stagnationHours, 0);
});
