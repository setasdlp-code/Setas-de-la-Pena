'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  TBASE_TABLE,
  thermalRate,
  accumulateThermalTime,
  stageRequirement,
  projectStageCompletion,
  buildLotBiologicalClock,
  getThermalProfile,
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

test('stageRequirement deriva horas requeridas de incubación y de inducción/fructificación desde flush-forecast-engine', () => {
  const incReq = stageRequirement('p_ostreatus_gris', 'incubation');
  assert.equal(incReq.requiredHours, 20 * 24);
  assert.equal(incReq.provenance.class, 'literature_target');
  assert.notEqual(incReq.confidence, 'high');

  const indReq = stageRequirement('p_ostreatus_gris', 'induction');
  assert.equal(indReq.requiredHours, (32 - 20) * 24);

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

test('buildLotBiologicalClock mapea estados de fructificación/maduración a la etapa "induction"', () => {
  const clockFruiting = buildLotBiologicalClock(
    { id: 'L2', speciesId: 'shiitake', estado: 'fructificacion', startAt: '2026-01-01T00:00:00Z' },
    [],
    { now: '2026-01-02T00:00:00Z' }
  );
  assert.equal(clockFruiting.stage, 'induction');

  const clockMaturation = buildLotBiologicalClock(
    { id: 'L3', speciesId: 'reishi', lifecycleState: 'maturation', stageStartAt: '2026-01-01T00:00:00Z' },
    [],
    { now: '2026-01-02T00:00:00Z' }
  );
  assert.equal(clockMaturation.stage, 'induction');
  assert.ok(clockMaturation.alerts.some((a) => a.code === 'telemetria_insuficiente'));
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
