'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cat = require('./substrate-catalog.js');
const { analyze, EB_MODEL_VERSION } = require('./substrate-analysis.js');
const scoring = require('./scoring.js');
const F = require('./eb-forecast-record.js');

const BASE = [{ id: 'aserrin_roble', p: 79 }, { id: 'salvado_trigo', p: 20 }, { id: 'carbonato_calcio', p: 1 }];
// Igual que recipeEBForecast(an, null) en simulador-app.jsx: el pronóstico visible sin historial.
const visible = (an) => ({ ...scoring.scoreRecipe(an, { historyCalibration: null, __bridgeRecompute: true }).uncertainty.eb, value: an.eb, history: null });
const capture = (recipe = BASE, extra = {}) => {
  const an = analyze(recipe, 'shiitake');
  const fc = visible(an);
  return { an, fc, snap: F.captureForecast({ forecast: fc, analysis: an, recipe, sKey: 'shiitake', ings: cat.INGS, at: '2026-11-14T00:00:00Z', modelVersion: EB_MODEL_VERSION, ...extra }) };
};

test('guarda la banda visible de scoring, no la banda por CV de analyze()', () => {
  const { an, fc, snap } = capture();
  assert.equal(snap.schema, 'setas.eb-forecast.v1');
  assert.deepEqual([snap.shown.low, snap.shown.high], [fc.low, fc.high]);
  assert.equal(snap.shown.central, Math.round(fc.value));
  assert.notDeepEqual([snap.shown.low, snap.shown.high], [an.ebLow, an.ebHigh]);
  assert.equal(snap.confidence.scale, 'B');
  assert.equal(snap.modelVersion, EB_MODEL_VERSION);
});

test('sobrevive a una serialización (recarga) sin cambios', () => {
  const { snap } = capture();
  assert.deepEqual(JSON.parse(JSON.stringify(snap)), snap);
});

test('exige fecha y versión; sin banda no captura', () => {
  const an = analyze(BASE, 'shiitake');
  assert.throws(() => F.captureForecast({ forecast: visible(an), analysis: an, recipe: BASE, sKey: 'shiitake', ings: cat.INGS }));
  assert.equal(F.captureForecast({ forecast: {}, analysis: an, recipe: BASE, sKey: 'shiitake', ings: cat.INGS, at: 'x', modelVersion: 'v' }), null);
});

test('la huella cambia si cambia un valor efectivo de insumo con la misma receta', () => {
  const a = F.recipeFingerprint({ recipe: BASE, ings: cat.INGS, sp: cat.SPP.shiitake });
  const ings = cat.INGS.map((g) => (g.id === 'aserrin_roble' ? { ...g, n: 0.48 } : g));
  assert.notEqual(a, F.recipeFingerprint({ recipe: BASE, ings, sp: cat.SPP.shiitake }));
  assert.equal(a, F.recipeFingerprint({ recipe: [...BASE].reverse(), ings: cat.INGS, sp: cat.SPP.shiitake }));
});

test('declara supuestos: pH calculado y composición estimada del pellet', () => {
  const { snap } = capture(cat.PRESETS.shiitake_microlote_pellets_v1.i);
  const codes = snap.assumptions.map((a) => a.code);
  assert.ok(codes.includes('ph-calculated'));
  assert.ok(snap.assumptions.some((a) => a.code === 'estimated-composition' && a.ingredientId === 'pellets_weber_hickory'));
});

test('escritura única: un lote con pronóstico no lo reemplaza ni lo borra', () => {
  const { snap } = capture();
  const lote = { id: 'L1', forecastSnapshot: snap };
  assert.deepEqual(F.protectForecast(lote, { forecastSnapshot: { otro: 1 }, notas: 'x' }), { notas: 'x' });
  assert.deepEqual(F.protectForecast(lote, { forecastSnapshot: null }), {});
  assert.deepEqual(F.protectForecast({ id: 'L2' }, { forecastSnapshot: snap }), { forecastSnapshot: snap });
});

test('sin resultado final elegible no hay error; con cierre sí', () => {
  const { snap } = capture();
  const lote = { id: 'L1', peseSeco: 10, estado: 'fructificacion', forecastSnapshot: snap };
  const cos = [{ id: 'C1', loteId: 'L1', pesoFresco: 4000 }];
  const parcial = F.evaluateForecast(lote, cos);
  assert.equal(parcial.status, 'pendiente');
  assert.equal(parcial.errorAbs, null);
  const cerrado = F.evaluateForecast({ ...lote, estado: 'completado' }, cos);
  assert.equal(cerrado.status, 'evaluado');
  assert.equal(cerrado.actualEB, 40);
  assert.equal(cerrado.errorAbs, Math.abs(40 - snap.shown.central));
  assert.equal(cerrado.inBand, 40 >= snap.shown.low && 40 <= snap.shown.high);
  assert.equal(F.evaluateForecast({ id: 'L3' }, []).status, 'sin-pronostico');
});

test('cero solo cuenta con cierre confirmado', () => {
  const { snap } = capture();
  const lote = { id: 'L1', peseSeco: 10, estado: 'completado', forecastSnapshot: snap };
  assert.equal(F.evaluateForecast(lote, []).status, 'pendiente');
  const ok = F.evaluateForecast({ ...lote, outcome: { status: 'completed-zero-yield', verified: true } }, []);
  assert.equal(ok.status, 'evaluado');
  assert.equal(ok.actualEB, 0);
});
