'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  TBASE_TABLE,
  FRUITING_CARDINALS,
  normalizeStage,
  thermalRate,
  accumulateThermalTime,
  stageRequirement,
  projectStageCompletion,
  buildLotBiologicalClock,
  getThermalProfile,
  toBogotaDateStr,
} = require('./biological-clock.js');

const PROFILE = { tBase: 10, tOpt: 25, tMax: 32 };

test('TBASE_TABLE está congelada y trae provenance heurístico de baja confianza para cada especie', () => {
  assert.ok(Object.isFrozen(TBASE_TABLE));
  const keys = ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'p_eryngii', 'shiitake', 'lions_mane', 'nameko', 'enoki', 'reishi'];
  keys.forEach((k) => {
    assert.ok(TBASE_TABLE[k], `falta ${k}`);
    assert.equal(TBASE_TABLE[k].provenance.class, 'heuristic');
    assert.ok(TBASE_TABLE[k].provenance.source);
  });
  assert.equal(TBASE_TABLE.reishi.tBaseC, 15);
  assert.equal(TBASE_TABLE.lions_mane.tBaseC, 12);
});

test('thermalRate es 0 por debajo de tBase y por encima de tMax', () => {
  assert.equal(thermalRate(5, PROFILE), 0);
  assert.equal(thermalRate(10, PROFILE), 0);
  assert.equal(thermalRate(32, PROFILE), 0);
  assert.equal(thermalRate(40, PROFILE), 0);
});

test('thermalRate asciende linealmente de tBase a tOpt, con tasa 1 en tOpt', () => {
  assert.equal(thermalRate(25, PROFILE), 1);
  const mid = thermalRate(17.5, PROFILE); // punto medio entre 10 y 25
  assert.ok(Math.abs(mid - 0.5) < 1e-9);
});

test('thermalRate desciende linealmente de tOpt a tMax', () => {
  const midDecline = thermalRate(28.5, PROFILE); // punto medio entre 25 y 32
  assert.ok(Math.abs(midDecline - 0.5) < 1e-9);
});

test('thermalRate maneja NaN, perfiles nulos y temperaturas no finitas sin lanzar', () => {
  assert.equal(thermalRate(NaN, PROFILE), 0);
  assert.equal(thermalRate(20, null), 0);
  assert.equal(thermalRate(20, {}), 0);
  assert.equal(thermalRate(Infinity, PROFILE), 0);
});

test('accumulateThermalTime devuelve estructura vacía con serie vacía o con un solo punto', () => {
  const empty = accumulateThermalTime([], PROFILE);
  assert.equal(empty.effectiveDegreeHours, 0);
  assert.equal(empty.confidence, 'low');
  assert.equal(empty.basis, 'sin_telemetria');

  const one = accumulateThermalTime([{ t: '2026-01-01T00:00:00Z', temperature_c: 20 }], PROFILE);
  assert.equal(one.effectiveDegreeHours, 0);
  assert.equal(one.hoursObserved, 0);
});

test('accumulateThermalTime integra correctamente una serie constante a tOpt (rate=1)', () => {
  const series = [];
  const base = Date.parse('2026-01-01T00:00:00Z');
  for (let h = 0; h <= 24; h += 1) {
    series.push({ t: new Date(base + h * 3600000).toISOString(), temperature_c: 25 });
  }
  const acc = accumulateThermalTime(series, PROFILE);
  assert.equal(acc.effectiveDegreeHours, 24);
  assert.equal(acc.hoursObserved, 24);
  assert.equal(acc.gapHours, 0);
  assert.equal(acc.meanTempC, 25);
});

test('accumulateThermalTime prefiere substrate_temperature_c sobre temperature_c', () => {
  const series = [
    { t: '2026-01-01T00:00:00Z', temperature_c: 5, substrate_temperature_c: 25 },
    { t: '2026-01-01T01:00:00Z', temperature_c: 5, substrate_temperature_c: 25 },
  ];
  const acc = accumulateThermalTime(series, PROFILE);
  assert.equal(acc.usedSubstrateTemp, true);
  assert.equal(acc.effectiveDegreeHours, 1); // 1 hora a tasa 1 (tOpt), no 0 (rate a 5°C)
});

test('accumulateThermalTime ignora huecos mayores a maxGapMinutes y los reporta en gapHours', () => {
  const series = [
    { t: '2026-01-01T00:00:00Z', temperature_c: 25 },
    { t: '2026-01-01T01:00:00Z', temperature_c: 25 },
    // hueco de 6 horas (> 90 min default)
    { t: '2026-01-01T07:00:00Z', temperature_c: 25 },
    { t: '2026-01-01T08:00:00Z', temperature_c: 25 },
  ];
  const acc = accumulateThermalTime(series, PROFILE);
  assert.equal(acc.hoursObserved, 2); // solo los dos segmentos de 1h se integran
  assert.equal(acc.gapHours, 6);
  assert.equal(acc.effectiveDegreeHours, 2);
});

test('accumulateThermalTime respeta un maxGapMinutes configurado explícitamente', () => {
  const series = [
    { t: '2026-01-01T00:00:00Z', temperature_c: 25 },
    { t: '2026-01-01T02:00:00Z', temperature_c: 25 }, // hueco de 2h
  ];
  const accDefault = accumulateThermalTime(series, PROFILE); // default 90 min -> se excluye
  assert.equal(accDefault.gapHours, 2);

  const accWide = accumulateThermalTime(series, PROFILE, { maxGapMinutes: 180 }); // se incluye
  assert.equal(accWide.gapHours, 0);
  assert.equal(accWide.hoursObserved, 2);
});

test('accumulateThermalTime descarta puntos con temperatura NaN o timestamp inválido, y ordena series desordenadas', () => {
  const series = [
    { t: '2026-01-01T02:00:00Z', temperature_c: 25 },
    { t: '2026-01-01T00:00:00Z', temperature_c: 25 },
    { t: 'fecha-invalida', temperature_c: 25 },
    { t: '2026-01-01T01:00:00Z', temperature_c: NaN },
    { t: null, temperature_c: 25 },
  ];
  const acc = accumulateThermalTime(series, PROFILE);
  assert.equal(acc.pointCount, 2); // solo los dos puntos válidos (00:00 y 02:00)
  assert.equal(acc.gapHours, 2); // el hueco de 2h entre ellos excede maxGapMinutes por defecto (90 min)
});

test('accumulateThermalTime contabiliza heatStressHours y coldHours', () => {
  const series = [
    { t: '2026-01-01T00:00:00Z', temperature_c: 35 }, // > tMax (32)
    { t: '2026-01-01T01:00:00Z', temperature_c: 35 },
    { t: '2026-01-01T02:00:00Z', temperature_c: 35 },
    { t: '2026-01-01T03:00:00Z', temperature_c: 2 }, // < tBase (10)
    { t: '2026-01-01T04:00:00Z', temperature_c: 2 },
    { t: '2026-01-01T05:00:00Z', temperature_c: 2 },
  ];
  const acc = accumulateThermalTime(series, PROFILE);
  assert.ok(acc.heatStressHours >= 1.9 && acc.heatStressHours <= 2.1);
  assert.ok(acc.coldHours >= 1.9 && acc.coldHours <= 2.1);
});

test('stageRequirement deriva horas requeridas de incubación y de inducción/fructificación desde flush-forecast-engine, escaladas por thermalRate(tRef)', () => {
  // p_ostreatus_gris: tBase=10 (TBASE_TABLE), tOpt=25/tMax=32 (flush-forecast,
  // curva micelial), tRef=24 (flush-forecast). thermalRate(24, {10,25,32}) =
  // (24-10)/(25-10) = 14/15 — NO 1, porque tRef ≠ tOpt (finding #1).
  const incReq = stageRequirement('p_ostreatus_gris', 'incubation');
  assert.equal(incReq.requiredHours, 448); // 20*24*(14/15) = 448, no 480
  assert.equal(incReq.provenance.class, 'heuristic'); // finding #17: no es literature_target
  assert.equal(incReq.confidence, 'low'); // finding #17: capado en 'low', no 'medium'

  const indReq = stageRequirement('p_ostreatus_gris', 'induction');
  assert.equal(indReq.requiredHours, 268.8); // 12*24*(14/15) = 268.8, no 288

  const fruitingAlias = stageRequirement('p_ostreatus_gris', 'fruiting');
  assert.equal(fruitingAlias.requiredHours, indReq.requiredHours);
});

test('stageRequirement nunca devuelve confidence "high" y cae a heurística si faltan campos', () => {
  const req = stageRequirement('especie_inexistente_xyz', 'incubation');
  assert.notEqual(req.confidence, 'high');
  assert.ok(req.requiredHours > 0);
});

test('projectStageCompletion reporta "sin_datos" cuando no hay fechas válidas o telemetría', () => {
  const noSeries = projectStageCompletion({
    speciesId: 'p_ostreatus_gris',
    stage: 'incubation',
    stageStartAt: '2026-01-01T00:00:00Z',
    series: [],
    now: '2026-01-05T00:00:00Z',
  });
  assert.equal(noSeries.status, 'sin_datos');

  const badDates = projectStageCompletion({
    speciesId: 'p_ostreatus_gris',
    stage: 'incubation',
    stageStartAt: 'no-es-fecha',
    series: [],
    now: '2026-01-05T00:00:00Z',
  });
  assert.equal(badDates.status, 'sin_datos');
});

test('projectStageCompletion calcula progreso y detecta "listo_probable" al alcanzar el requerimiento', () => {
  const start = '2026-01-01T00:00:00Z';
  const now = '2026-01-22T00:00:00Z'; // 21 días a 25°C (tOpt) >= 20*24=480h requeridas
  const series = [];
  for (let h = 0; h <= 21 * 24; h += 1) {
    series.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 25 });
  }
  const projection = projectStageCompletion({
    speciesId: 'p_ostreatus_gris',
    stage: 'incubation',
    stageStartAt: start,
    series,
    now,
  });
  assert.equal(projection.status, 'listo_probable');
  assert.ok(projection.progressPct >= 100);
  assert.notEqual(projection.confidence, 'high');
  assert.match(projection.resumen, /Orellana Gris/);
});

test('projectStageCompletion marca "retrasado" cuando la temperatura está sistemáticamente fría', () => {
  const start = '2026-01-01T00:00:00Z';
  const now = '2026-01-05T00:00:00Z';
  const series = [];
  for (let h = 0; h <= 4 * 24; h += 1) {
    series.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 9 }); // por debajo de tBase (10)
  }
  const projection = projectStageCompletion({
    speciesId: 'p_ostreatus_gris',
    stage: 'incubation',
    stageStartAt: start,
    series,
    now,
  });
  assert.equal(projection.progressPct, 0);
  assert.equal(projection.status, 'retrasado');
});

test('projectStageCompletion calcula deltaDaysVsCalendar (positivo = retraso) cuando avanza más lento que el nominal', () => {
  const start = '2026-01-01T00:00:00Z';
  const now = '2026-01-11T00:00:00Z';
  const series = [];
  // Temperatura moderada (18°C): tasa térmica < 1, por lo tanto el reloj térmico avanza más lento que el calendario.
  for (let h = 0; h <= 10 * 24; h += 1) {
    series.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 18 });
  }
  const projection = projectStageCompletion({
    speciesId: 'p_ostreatus_gris',
    stage: 'incubation',
    stageStartAt: start,
    series,
    now,
    lookbackHours: 72,
  });
  assert.ok(Number.isFinite(projection.deltaDaysVsCalendar));
  assert.ok(projection.deltaDaysVsCalendar > 0, `se esperaba retraso positivo, obtenido ${projection.deltaDaysVsCalendar}`);
});

test('buildLotBiologicalClock mapea lifecycleState a etapa y genera alerta por estrés térmico sostenido', () => {
  const start = '2026-01-01T00:00:00Z';
  const now = '2026-01-03T00:00:00Z';
  const series = [];
  for (let h = 0; h <= 2 * 24; h += 1) {
    series.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 34 }); // > tMax (32) todo el tiempo
  }
  const lot = { id: 'LOTE-1', speciesId: 'p_ostreatus_gris', lifecycleState: 'incubation', stageStartAt: start };
  const clock = buildLotBiologicalClock(lot, series, { now });

  assert.equal(clock.lotId, 'LOTE-1');
  assert.equal(clock.stage, 'incubation');
  assert.ok(clock.projection.heatStressHours > 6);
  assert.ok(clock.alerts.some((a) => a.code === 'heat_stress_sostenido'));
});

test('buildLotBiologicalClock mapea "fructificacion" a "induction", y "maturation" a su PROPIA etapa (no a "induction")', () => {
  const clockFruiting = buildLotBiologicalClock(
    { id: 'L2', speciesId: 'shiitake', estado: 'fructificacion', startAt: '2026-01-01T00:00:00Z' },
    [],
    { now: '2026-01-02T00:00:00Z' }
  );
  assert.equal(clockFruiting.stage, 'induction');

  // finding #3: 'maturation' ya no colapsa en 'induction'. Como ninguna
  // especie del catálogo define nominalMaturationDays, queda sin proyectar
  // (status 'no_aplica'), no como si fuera inducción/fructificación.
  const clockMaturation = buildLotBiologicalClock(
    { id: 'L3', speciesId: 'reishi', lifecycleState: 'maturation', stageStartAt: '2026-01-01T00:00:00Z' },
    [],
    { now: '2026-01-02T00:00:00Z' }
  );
  assert.equal(clockMaturation.stage, 'maturation');
  assert.equal(clockMaturation.projection.status, 'no_aplica');
  assert.ok(!clockMaturation.alerts.some((a) => a.code === 'telemetria_insuficiente'));
});

test('getThermalProfile normaliza especie desconocida y nunca deja tOpt/tMax menores o iguales a tBase', () => {
  const profile = getThermalProfile('especie_rara_no_catalogada');
  assert.ok(profile.tOpt > profile.tBase);
  assert.ok(profile.tMax > profile.tOpt);
  assert.equal(profile.tBaseProvenance.class, 'heuristic');
});

test('accumulateThermalTime nunca devuelve confidence "high"', () => {
  const series = [];
  for (let h = 0; h <= 200; h += 1) {
    series.push({ t: new Date(Date.parse('2026-01-01T00:00:00Z') + h * 3600000).toISOString(), temperature_c: 25 });
  }
  const acc = accumulateThermalTime(series, PROFILE);
  assert.notEqual(acc.confidence, 'high');
  assert.ok(acc.confidence === 'low' || acc.confidence === 'medium');
});

// ---------------------------------------------------------------------
// Regresiones de revisión (una por finding)
// ---------------------------------------------------------------------

test('REGRESIÓN #1: stageRequirement escala por thermalRate(tRef, curva micelial), no por rate=1 (tOpt); un lote sostenido exactamente a tRef no aparece retrasado', () => {
  const req = stageRequirement('p_ostreatus_gris', 'incubation');
  assert.equal(req.requiredHours, 448); // 20*24*thermalRate(24,{tBase:10,tOpt:25,tMax:32}) = 20*24*(14/15)

  const start = '2026-01-01T00:00:00Z';
  const nominalDays = 20; // nominalIncubationDays de p_ostreatus_gris
  const now = new Date(new Date(start).getTime() + nominalDays * 86400000).toISOString();
  const series = [];
  for (let h = 0; h <= nominalDays * 24; h += 1) {
    // Sostenido exactamente a tRef (24°C), NO a tOpt (25°C).
    series.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 24 });
  }
  const projection = projectStageCompletion({ speciesId: 'p_ostreatus_gris', stage: 'incubation', stageStartAt: start, series, now });
  assert.ok(projection.progressPct >= 99 && projection.progressPct <= 101, `se esperaba ~100% al cumplir los días nominales a tRef, obtenido ${projection.progressPct}`);
  assert.notEqual(projection.status, 'retrasado');
});

test('REGRESIÓN #2: buildLotBiologicalClock no usa fechaInoculacion como stageStartAt para etapas post-incubación', () => {
  const lot = {
    id: 'L-IND-1',
    speciesId: 'p_ostreatus_gris',
    lifecycleState: 'induction',
    fechaInoculacion: '2026-01-01T00:00:00Z', // marca el inicio de INCUBACIÓN, no de inducción
    // sin stageStartAt/startAt explícito
  };
  const clock = buildLotBiologicalClock(lot, [], { now: '2026-01-25T00:00:00Z' });
  assert.equal(clock.stage, 'induction');
  assert.equal(clock.projection.status, 'sin_datos');
  assert.match(clock.projection.resumen, /fechaInoculacion/);
});

test('REGRESIÓN #3: LIFECYCLE_STAGE_MAP distingue "maturation" de "induction" y marca "no_aplica" para reposo, planificación y estados de excepción/terminales', () => {
  assert.equal(normalizeStage('maturation'), 'maturation');
  assert.equal(normalizeStage('maduracion'), 'maturation');
  assert.equal(normalizeStage('inoculated'), 'incubation');
  assert.equal(normalizeStage('resting'), 'no_aplica');
  assert.equal(normalizeStage('reposo'), 'no_aplica');
  assert.equal(normalizeStage('quarantine'), 'no_aplica');
  assert.equal(normalizeStage('cuarentena'), 'no_aplica');
  assert.equal(normalizeStage('planned'), 'no_aplica');
  assert.equal(normalizeStage('mix_prepared'), 'no_aplica');
  assert.equal(normalizeStage('thermal_treatment'), 'no_aplica');
  assert.equal(normalizeStage('cooling'), 'no_aplica');
  assert.equal(normalizeStage('closed'), 'no_aplica');
  assert.equal(normalizeStage('discarded'), 'no_aplica');
  assert.equal(normalizeStage('failed'), 'no_aplica');

  const clockResting = buildLotBiologicalClock(
    { id: 'L-R', speciesId: 'p_ostreatus_gris', lifecycleState: 'resting', stageStartAt: '2026-01-01T00:00:00Z' },
    [],
    { now: '2026-01-02T00:00:00Z' }
  );
  assert.equal(clockResting.stage, 'no_aplica');
  assert.equal(clockResting.projection.status, 'no_aplica');
  assert.equal(clockResting.alerts.length, 0);
});

test('stageRequirement deja "maturation" sin proyectar (requiredHours null) cuando la especie no define nominalMaturationDays', () => {
  const req = stageRequirement('shiitake', 'maturation');
  assert.equal(req.stage, 'maturation');
  assert.equal(req.requiredHours, null);
  assert.equal(req.confidence, 'low');
});

test('stageRequirement devuelve "no_aplica" (sin requiredHours) para estados que no son etapas del reloj biológico', () => {
  const req = stageRequirement('p_ostreatus_gris', 'resting');
  assert.equal(req.stage, 'no_aplica');
  assert.equal(req.requiredHours, null);
});

test('REGRESIÓN #4: toBogotaDateStr usa UTC-5 fijo y no corta el día calendario en el corte UTC 00:00', () => {
  // 2026-01-01T23:00:00Z = 2026-01-01T18:00 en Bogotá (UTC-5): mismo día en Bogotá.
  assert.equal(toBogotaDateStr(new Date('2026-01-01T23:00:00Z')), '2026-01-01');
  // 2026-01-02T04:59:00Z = 2026-01-01T23:59 en Bogotá: aún 1 de enero en Bogotá aunque ya sea 2 en UTC.
  assert.equal(toBogotaDateStr(new Date('2026-01-02T04:59:00Z')), '2026-01-01');
  // 2026-01-02T05:00:00Z = 2026-01-02T00:00 en Bogotá: recién empieza el 2 de enero.
  assert.equal(toBogotaDateStr(new Date('2026-01-02T05:00:00Z')), '2026-01-02');
});

test('REGRESIÓN #11: fructificación de P. eryngii usa su propio cardinal (14–16°C), no la curva micelial (tOpt 24°C)', () => {
  const cardinal = FRUITING_CARDINALS.p_eryngii;
  assert.ok(cardinal);
  assert.equal(cardinal.provenance.class, 'literature_target');
  assert.match(cardinal.provenance.source, /knowledge_base\/01_species\/pleurotus_eryngii\.md/);

  const start = '2026-01-01T00:00:00Z';
  const now = '2026-01-13T00:00:00Z'; // 12 días
  const series = [];
  for (let h = 0; h <= 12 * 24; h += 1) {
    // 15°C: óptimo real de fructificación de eryngii (KB), muy por debajo del
    // tOpt micelial (24°C) que el motor de pronóstico usa para colonización.
    series.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 15 });
  }
  const projection = projectStageCompletion({ speciesId: 'p_eryngii', stage: 'induction', stageStartAt: start, series, now });
  assert.equal(projection.usedFruitingCardinalFallback, false);
  assert.notEqual(projection.status, 'retrasado');
});

test('REGRESIÓN #11b: sin cardinal de fructificación citado en la KB, cae a la curva micelial con confidence forzado "low" y sin alerta retraso_termico', () => {
  const start = '2026-01-01T00:00:00Z';
  const now = '2026-01-13T00:00:00Z';
  const coldSeries = [];
  for (let h = 0; h <= 12 * 24; h += 1) {
    // 5°C: por debajo de tBase (10) incluso de la curva micelial de respaldo
    // de nameko -> rate=0 sostenido -> status 'retrasado' garantizado.
    coldSeries.push({ t: new Date(new Date(start).getTime() + h * 3600000).toISOString(), temperature_c: 5 });
  }
  const lot = { id: 'L-NK', speciesId: 'nameko', lifecycleState: 'induction', startAt: start };
  const clock = buildLotBiologicalClock(lot, coldSeries, { now });
  assert.equal(clock.projection.usedFruitingCardinalFallback, true);
  assert.equal(clock.projection.confidence, 'low');
  assert.equal(clock.projection.status, 'retrasado');
  assert.ok(!clock.alerts.some((a) => a.code === 'retraso_termico'), 'no debería emitirse retraso_termico en fallback sin cita KB para etapa no incubación');
});

test('REGRESIÓN #17: tOpt/tMax de flush-forecast y la duración nominal de etapa se etiquetan "heuristic" (no "literature_target"), y la confianza de stageRequirement queda capada en "low"', () => {
  const profile = getThermalProfile('p_ostreatus_gris');
  assert.equal(profile.tOptTMaxSource.class, 'heuristic');

  const req = stageRequirement('p_ostreatus_gris', 'incubation');
  assert.equal(req.provenance.class, 'heuristic');
  assert.equal(req.confidence, 'low');

  const reqInduction = stageRequirement('p_ostreatus_gris', 'induction');
  assert.equal(reqInduction.confidence, 'low');
});
