'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const MODULE_PATH = path.join(__dirname, 'cultivation-copilot.js');

// cultivation-copilot.js cae a globalThis.SetasXxx si require() falla (para
// funcionar igual en navegador). Como node --test corre todos los tests de
// este archivo en el mismo proceso, un test anterior que sí cargó el motor
// real ya dejó ese global puesto — hay que ocultarlo también, o "simular
// ausencia" solo tapa require() y el fallback global lo desmiente.
const SUBSTRING_TO_GLOBAL = {
  'biological-clock': 'SetasBiologicalClock',
  'contamination-risk': 'SetasContaminationRisk',
  'vision-diagnosis': 'SetasVisionDiagnosis',
  'harvest-calendar': 'SetasHarvestCalendar',
  'flush-forecast-engine': 'SetasFlushForecast',
  'task-engine': 'SetasTaskEngine',
};

const freshCopilot = () => {
  delete require.cache[require.resolve(MODULE_PATH)];
  return require(MODULE_PATH);
};

/**
 * Ejecuta `fn(copilot)` con ciertos módulos (por substring de su ruta)
 * simulando no estar disponibles (require lanza). cultivation-copilot.js
 * resuelve sus dependencias de forma PEREZOSA (en cada llamada, no al
 * cargarse), así que el parcheo de Module.prototype.require debe seguir
 * activo mientras se invocan sus funciones, no solo durante el require()
 * inicial del propio módulo.
 */
const withoutEngines = (missingSubstrings, fn) => {
  delete require.cache[require.resolve(MODULE_PATH)];
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (missingSubstrings.some((s) => id.includes(s))) {
      throw new Error(`simulated missing module: ${id}`);
    }
    return originalRequire.apply(this, arguments);
  };

  const globalsToHide = missingSubstrings.map((s) => SUBSTRING_TO_GLOBAL[s]).filter(Boolean);
  const savedGlobals = {};
  globalsToHide.forEach((g) => {
    savedGlobals[g] = globalThis[g];
    delete globalThis[g];
  });

  try {
    const copilot = require(MODULE_PATH);
    return fn(copilot);
  } finally {
    Module.prototype.require = originalRequire;
    globalsToHide.forEach((g) => {
      if (savedGlobals[g] !== undefined) globalThis[g] = savedGlobals[g];
    });
  }
};

const NOW = '2026-09-28T12:00:00Z';

const buildSeries = ({ startIso = '2026-09-24T00:00:00Z', hours = 80, temp = 26, rh = 96, co2 = 1200 } = {}) => {
  const series = [];
  let t = new Date(startIso).getTime();
  for (let i = 0; i < hours; i++) {
    series.push({ t, temperature_c: temp, rh_pct: rh, co2_ppm: co2 });
    t += 3600000;
  }
  return series;
};

test('normalizeStage mapea estados canónicos ingleses a las etapas del copiloto', () => {
  const copilot = freshCopilot();
  assert.equal(copilot.normalizeStage('incubation'), 'incubation');
  assert.equal(copilot.normalizeStage('induction'), 'induction');
  assert.equal(copilot.normalizeStage('fruiting'), 'fruiting');
  assert.equal(copilot.normalizeStage('quarantine'), 'quarantine');
  assert.equal(copilot.normalizeStage('closed'), 'closed');
  assert.equal(copilot.normalizeStage('discarded'), 'closed');
});

test('normalizeStage mapea estados en español heredado de Bitácora', () => {
  const copilot = freshCopilot();
  assert.equal(copilot.normalizeStage('incubacion'), 'incubation');
  assert.equal(copilot.normalizeStage('fructificacion'), 'fruiting');
  assert.equal(copilot.normalizeStage('CUARENTENA'), 'quarantine');
  assert.equal(copilot.normalizeStage('completado'), 'closed');
  assert.equal(copilot.normalizeStage('descartado'), 'closed');
  assert.equal(copilot.normalizeStage('planificado'), 'planned');
});

// Regresión (hallazgo C): antes un estado desconocido/vacío caía a
// 'incubation' "por conservador", lo que en realidad proyectaba el lote
// como si estuviera en incubación real (reloj biológico + riesgo de
// contaminación por etapa) sin ninguna base. Ahora cae a 'desconocido', que
// buildLotInsights/recommendActions tratan como "sin acciones basadas en
// etapa" en vez de inventar una etapa.
test('normalizeStage cae a "desconocido" ante un estado desconocido o vacío (ya no a incubation)', () => {
  const copilot = freshCopilot();
  assert.equal(copilot.normalizeStage(undefined), 'desconocido');
  assert.equal(copilot.normalizeStage(null), 'desconocido');
  assert.equal(copilot.normalizeStage(''), 'desconocido');
  assert.equal(copilot.normalizeStage('estado-inventado-xyz'), 'desconocido');
});

// Regresión (hallazgo C): 'maturation' y 'resting' son ahora etapas propias,
// no se funden en 'induction'/'fruiting' como antes.
test('normalizeStage mapea maturation y resting como etapas explícitas, no fundidas en induction/fruiting', () => {
  const copilot = freshCopilot();
  assert.equal(copilot.normalizeStage('maturation'), 'maturation');
  assert.equal(copilot.normalizeStage('maduracion'), 'maturation');
  assert.equal(copilot.normalizeStage('resting'), 'resting');
  assert.equal(copilot.normalizeStage('descanso'), 'resting');
});

test('buildLotInsights compone reloj biológico y riesgo de contaminación con confianza nunca alta', () => {
  const copilot = freshCopilot();
  const series = buildSeries();
  const insights = copilot.buildLotInsights({
    lot: { id: 'L-001', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01' },
    series,
    now: NOW,
  });
  assert.equal(insights.lotId, 'L-001');
  assert.equal(insights.stage, 'incubation');
  assert.ok(insights.biologicalClock, 'debe incluir biologicalClock');
  assert.ok(insights.contaminationRisk, 'debe incluir contaminationRisk');
  assert.notEqual(insights.confidence, 'high');
  assert.ok(['low', 'medium'].includes(insights.confidence));
  assert.ok(Array.isArray(insights.alerts));
});

test('buildLotInsights degrada con gracia si un lote no trae datos (objeto vacío)', () => {
  const copilot = freshCopilot();
  const insights = copilot.buildLotInsights({ lot: {}, series: [], now: NOW });
  assert.equal(insights.lotId, null);
  assert.equal(insights.stage, 'desconocido');
  // Etapa desconocida: no se invoca biological-clock.js (hallazgo C) — ese
  // motor no distingue "desconocido" de "sin dato" y por defecto asumiría
  // 'incubation', reintroduciendo justo el problema que se corrige aquí.
  assert.equal(insights.biologicalClock, null);
  assert.notEqual(insights.confidence, 'high');
});

// Regresión (hallazgo C): un lote con estado no reconocido no debe generar
// ninguna acción basada en etapa (ni "etapa: listo_probable" ni "clima" por
// estrés térmico), aunque sí puede seguir generando otras sugerencias
// (p.ej. de contaminación) porque esas no dependen de biological-clock.js.
test('recommendActions no genera acciones de etapa/clima para un lote con estado desconocido', () => {
  const copilot = freshCopilot();
  const lots = [{ id: 'L-DESCONOCIDO', especie: 'p_ostreatus_gris', estado: 'estado-que-no-existe', fechaInoculacion: '2026-09-01', sala: 'm1' }];
  const actions = copilot.recommendActions({ lots, now: NOW });
  assert.ok(!actions.some((a) => a.kind === 'etapa'));
  assert.ok(!actions.some((a) => a.kind === 'clima'));
});

// Regresión (hallazgo C): 'resting' (reposo entre oleadas) es 'no_aplica'
// para biological-clock.js (LIFECYCLE_STAGE_MAP), y ese status nunca debe
// producir la acción de etapa "listo_probable".
test('buildLotInsights: lote en resting produce status biológico no_aplica y ninguna acción de etapa', () => {
  const copilot = freshCopilot();
  const insights = copilot.buildLotInsights({
    lot: { id: 'L-RESTING', especie: 'p_ostreatus_gris', estado: 'resting', fechaInoculacion: '2026-08-01' },
    series: [],
    now: NOW,
  });
  assert.equal(insights.stage, 'resting');
  assert.ok(insights.biologicalClock, 'biological-clock sigue disponible para resting (a diferencia de desconocido)');
  assert.equal(insights.biologicalClock.projection.status, 'no_aplica');

  const actions = copilot.recommendActions({
    lots: [{ id: 'L-RESTING', especie: 'p_ostreatus_gris', estado: 'resting', fechaInoculacion: '2026-08-01' }],
    now: NOW,
  });
  assert.ok(!actions.some((a) => a.kind === 'etapa' && a.lotId === 'L-RESTING'));
});

test('buildLotInsights funciona en modo degradado sin biological-clock ni vision-diagnosis', () => {
  withoutEngines(['biological-clock', 'vision-diagnosis'], (copilot) => {
    const series = buildSeries();
    const insights = copilot.buildLotInsights({ lot: { id: 'L-1', especie: 'p_ostreatus_gris' }, series, now: NOW });
    assert.equal(insights.biologicalClock, null);
    assert.ok(insights.contaminationRisk, 'contamination-risk sigue disponible');
    assert.ok(insights.enginesMissing.includes('biological-clock'));
    assert.ok(insights.enginesMissing.includes('vision-diagnosis'));
    assert.ok(!insights.enginesUsed.includes('biological-clock'));
  });
});

test('recommendActions genera acción de contaminación cuando el riesgo es alto/crítico', () => {
  const copilot = freshCopilot();
  const series = buildSeries({ temp: 27, rh: 97 }); // caluroso + húmedo: dispara riesgo
  const lots = [{ id: 'L-001', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'm1', series }];
  const actions = copilot.recommendActions({ lots, now: NOW });
  const contam = actions.find((a) => a.kind === 'contaminacion');
  assert.ok(contam, 'debe sugerir una acción de contaminación');
  assert.ok(['critical', 'high'].includes(contam.priority));
  assert.ok(contam.why.includes('score'));
});

test('recommendActions genera acción de cosecha para eventos en_ventana del calendario', () => {
  const copilot = freshCopilot();
  const lots = [{ id: 'L-002', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01', sala: 'incub_01' }];
  const actions = copilot.recommendActions({ lots, now: NOW });
  const harvest = actions.find((a) => a.kind === 'cosecha');
  assert.ok(harvest, 'debe sugerir una acción de cosecha');
  assert.equal(harvest.source, 'harvest-calendar');
  assert.match(harvest.why, /kg esperados/);
});

test('recommendActions genera acción de datos cuando falta telemetría suficiente', () => {
  const copilot = freshCopilot();
  const lots = [{ id: 'L-003', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'sala-sin-sensores' }];
  const actions = copilot.recommendActions({ lots, now: NOW });
  const datos = actions.find((a) => a.kind === 'datos' && a.lotId === 'L-003');
  assert.ok(datos, 'debe sugerir revisar sensores');
  assert.equal(datos.priority, 'low');
});

test('recommendActions excluye lotes cerrados (completado/descartado)', () => {
  const copilot = freshCopilot();
  const lots = [
    { id: 'L-004', especie: 'p_ostreatus_gris', estado: 'completado', fechaInoculacion: '2026-06-01' },
    { id: 'L-005', especie: 'p_ostreatus_gris', estado: 'descartado', fechaInoculacion: '2026-06-01' },
  ];
  const actions = copilot.recommendActions({ lots, now: NOW });
  assert.ok(!actions.some((a) => a.lotId === 'L-004' || a.lotId === 'L-005'));
});

test('recommendActions con entrada vacía devuelve []', () => {
  const copilot = freshCopilot();
  assert.deepEqual(copilot.recommendActions({}), []);
  assert.deepEqual(copilot.recommendActions({ lots: [], now: NOW }), []);
});

test('recommendActions respeta el tope (limit/cap, default 12)', () => {
  const copilot = freshCopilot();
  const lots = Array.from({ length: 20 }, (_, i) => ({
    id: `L-${i}`,
    especie: 'p_ostreatus_gris',
    estado: 'incubacion',
    fechaInoculacion: '2026-09-01',
    sala: `sala-sin-datos-${i}`,
  }));
  const actions = copilot.recommendActions({ lots, now: NOW });
  assert.ok(actions.length <= 12);
});

test('recommendActions produce ids estables/deterministas para la misma entrada', () => {
  const copilot = freshCopilot();
  const lots = [{ id: 'L-006', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'm1' }];
  const a1 = copilot.recommendActions({ lots, now: NOW }).map((a) => a.id);
  const a2 = copilot.recommendActions({ lots, now: NOW }).map((a) => a.id);
  assert.deepEqual(a1, a2);
});

test('recommendActions está ordenado por prioridad y luego por fecha de vencimiento', () => {
  const copilot = freshCopilot();
  const series = buildSeries({ temp: 27, rh: 97 });
  const lots = [
    { id: 'L-007', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'm1', series },
    { id: 'L-008', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01', sala: 'incub_01' },
  ];
  const actions = copilot.recommendActions({ lots, now: NOW });
  const rank = { critical: 0, high: 1, normal: 2, low: 3 };
  for (let i = 1; i < actions.length; i++) {
    assert.ok(rank[actions[i - 1].priority] <= rank[actions[i].priority], 'debe estar ordenado por prioridad');
  }
});

test('recommendActions nunca produce confidence "high"', () => {
  const copilot = freshCopilot();
  const series = buildSeries({ temp: 27, rh: 97 });
  const lots = [
    { id: 'L-009', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'm1', series },
    { id: 'L-010', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01', sala: 'incub_01' },
  ];
  const actions = copilot.recommendActions({ lots, now: NOW });
  actions.forEach((a) => {
    assert.notEqual(a.confidence, 'high');
    assert.ok(['low', 'medium'].includes(a.confidence));
  });
});

test('recommendActions sugiere siembra ante déficit de demanda usando SetasFlushForecast.calculateSowingRequirement', () => {
  const copilot = freshCopilot();
  const lots = [{ id: 'L-011', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-07-01' }];
  const commitments = [{ speciesId: 'p_ostreatus_gris', kgPerWeek: 500, fromWeek: '2026-W40', toWeek: '2026-W44' }];
  const actions = copilot.recommendActions({ lots, commitments, now: NOW });
  const demanda = actions.find((a) => a.kind === 'demanda');
  assert.ok(demanda, 'debe sugerir una acción de demanda ante el déficit');
  assert.equal(demanda.confidence, 'low');
});

test('recommendActions funciona en modo degradado sin harvest-calendar (require falla)', () => {
  withoutEngines(['harvest-calendar', 'flush-forecast-engine'], (copilot) => {
    const lots = [{ id: 'L-012', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01' }];
    const actions = copilot.recommendActions({ lots, now: NOW });
    assert.ok(!actions.some((a) => a.kind === 'cosecha'), 'sin harvest-calendar no debe haber acciones de cosecha');
  });
});

// Regresión (Parte B): GENERATED_BY_SOURCES de task-engine.js ahora incluye
// 'copiloto' directamente, así que toTasks ya no necesita el workaround
// { source: 'perito', ref: 'copiloto' }.
test('toTasks convierte acciones en tareas de task-engine.js con generatedBy.source "copiloto"', () => {
  const copilot = freshCopilot();
  const lots = [{ id: 'L-013', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01' }];
  const actions = copilot.recommendActions({ lots, now: NOW });
  const tasks = copilot.toTasks(actions, { now: NOW });
  assert.ok(tasks.length > 0);
  tasks.forEach((t) => {
    assert.equal(t.status, 'pending');
    assert.ok(t.generatedBy);
    assert.equal(t.generatedBy.source, 'copiloto');
  });
});

test('toTasks devuelve [] si SetasTaskEngine no está disponible (modo degradado)', () => {
  withoutEngines(['task-engine'], (copilot) => {
    const lots = [{ id: 'L-014', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01' }];
    const actions = copilot.recommendActions({ lots, now: NOW });
    const tasks = copilot.toTasks(actions, { now: NOW });
    assert.deepEqual(tasks, []);
  });
});

test('toTasks con lista de acciones vacía devuelve []', () => {
  const copilot = freshCopilot();
  assert.deepEqual(copilot.toTasks([], { now: NOW }), []);
  assert.deepEqual(copilot.toTasks(undefined, { now: NOW }), []);
});

test('buildCopilotBriefing arma titular, acciones, resumen de cosecha y riesgo por sala', () => {
  const copilot = freshCopilot();
  const series = buildSeries();
  const lots = [
    { id: 'L-015', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'm1' },
    { id: 'L-016', especie: 'p_ostreatus_gris', estado: 'fructificacion', fechaInoculacion: '2026-08-01', sala: 'incub_01' },
  ];
  const briefing = copilot.buildCopilotBriefing({ lots, seriesByRoom: { m1: series }, now: NOW });
  assert.equal(typeof briefing.headline, 'string');
  assert.ok(briefing.headline.length > 0);
  assert.ok(Array.isArray(briefing.actions));
  assert.ok(briefing.harvestCalendar);
  assert.ok(Number.isFinite(briefing.harvestCalendar.kgNext14d));
  assert.ok(briefing.riskByRoom && typeof briefing.riskByRoom === 'object');
  assert.ok(Array.isArray(briefing.enginesUsed));
  assert.ok(Array.isArray(briefing.enginesMissing));
  assert.notEqual(briefing.confidence, 'high');
  assert.ok(briefing.disclaimer && briefing.disclaimer.length > 0);
});

test('buildCopilotBriefing con entrada totalmente vacía no lanza y da headline neutro', () => {
  const copilot = freshCopilot();
  const briefing = copilot.buildCopilotBriefing({});
  assert.equal(typeof briefing.headline, 'string');
  assert.deepEqual(briefing.actions, []);
  assert.notEqual(briefing.confidence, 'high');
});

test('buildCopilotBriefing reporta enginesMissing cuando todos los motores faltan y sigue sin lanzar', () => {
  withoutEngines(['biological-clock', 'contamination-risk', 'vision-diagnosis', 'harvest-calendar', 'flush-forecast-engine', 'task-engine'], (copilot) => {
    const lots = [{ id: 'L-017', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01' }];
    const briefing = copilot.buildCopilotBriefing({ lots, now: NOW });
    assert.equal(briefing.enginesUsed.length, 0);
    assert.equal(briefing.enginesMissing.length, 6);
    assert.equal(typeof briefing.headline, 'string');
  });
});

test('buildCopilotBriefing headline distingue crítico vs alto vs rutina', () => {
  const copilot = freshCopilot();
  const seriesHot = buildSeries({ temp: 27, rh: 97 });
  const lotsCritico = [{ id: 'L-018', especie: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: '2026-09-01', sala: 'm1', series: seriesHot }];
  const briefingHigh = copilot.buildCopilotBriefing({ lots: lotsCritico, now: NOW });
  assert.match(briefingHigh.headline, /prioridad alta|crítica/);

  const briefingEmpty = copilot.buildCopilotBriefing({ lots: [], now: NOW });
  assert.match(briefingEmpty.headline, /Sin sugerencias/);
});

test('el módulo expone SetasCultivationCopilot en globalThis además de module.exports', () => {
  freshCopilot();
  assert.ok(globalThis.SetasCultivationCopilot);
  assert.equal(typeof globalThis.SetasCultivationCopilot.buildCopilotBriefing, 'function');
});
