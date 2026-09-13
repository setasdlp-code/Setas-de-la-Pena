'use strict';
// C1 (revisión final SP1): el optimizador del Formulador (sugerencias,
// Auto-mejorar y búsqueda híbrida) debe leer los mismos objetivos resueltos por
// especie × sustrato que analyze/diagnose — nunca mezclar con el SPP heredado.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');

// Globales que las funciones extraídas del JSX resuelven en tiempo de llamada
// (en el navegador llegan desestructuradas de SetasRecipeOptimizer).
globalThis.generateOptimizer = RO.generateOptimizer;
globalThis.applyOptToRecipe = RO.applyOptToRecipe;
globalThis.calcTreatment = RO.calcTreatment;

const X = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'blendEBWithHistory',
  'hybridRoleCaps', 'hybridIngredientCaps', 'autoImproveRecipe', 'runHybridRecipeSearch']);

const FORMULA_A = [
  { id: 'aserrin_roble', p: 45 }, { id: 'salvado_trigo', p: 25 }, { id: 'cascarilla_soya', p: 15 },
  { id: 'cascarilla_arroz', p: 10 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 }];
const CN_FLAG = /C:N demasiado (bajo|alto)/;
const sppA = () => T.applyToSpp(X.SPP, 'p_eryngii', FORMULA_A, X.INGS);

test('recipe-optimizer.analyze devuelve moistureTarget y targets igual que el analyze del JSX', () => {
  const spp = sppA();
  const ro = RO.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp);
  const jsx = X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp);
  assert.equal(ro.moistureTarget, 65);
  assert.equal(ro.moistureTarget, jsx.moistureTarget);
  assert.equal(ro.targets, jsx.targets);
  assert.equal(ro.targets.cn.source, 'literature');
  const legacy = RO.analyze(FORMULA_A, 'p_eryngii', X.INGS, X.SPP);
  assert.equal(legacy.moistureTarget, 63);
  assert.equal(legacy.targets, null);
});

test('generateOptimizer con objetivos resueltos no marca "C:N demasiado bajo/alto" en la Fórmula A del KB', () => {
  const spp = sppA();
  const an = X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp);
  const o = RO.generateOptimizer(an, 'p_eryngii', new Set(), FORMULA_A, X.INGS, [], null, false, {}, spp, {});
  assert.ok(!o.items.some(it => it.priority === 'critical'), o.items.map(i => `${i.priority}:${i.label}`).join(' | '));
  assert.ok(!o.items.some(it => CN_FLAG.test(it.label || '')), o.items.map(i => i.label).join(' | '));
  // Control: con el SPP heredado (C:N ideal 50) la misma receta sí se marca —
  // el test distingue de verdad entre las dos fuentes.
  const anLegacy = X.analyze(FORMULA_A, 'p_eryngii', X.INGS, X.SPP);
  const oLegacy = RO.generateOptimizer(anLegacy, 'p_eryngii', new Set(), FORMULA_A, X.INGS, [], null, false, {}, X.SPP, {});
  assert.ok(oLegacy.items.some(it => it.priority === 'critical' && CN_FLAG.test(it.label)));
});

test('la cantidad sugerida para afinar C:N apunta al ideal resuelto (28), no al heredado', () => {
  const spp = sppA();
  const an = X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp);
  const applyCn = s => {
    const o = RO.generateOptimizer(an, 'p_eryngii', new Set(), FORMULA_A, X.INGS, [], null, false, {}, s, {});
    const it = o.items.find(i => /Afinar C:N/.test(i.label) && i.apply);
    assert.ok(it, 'debe existir la sugerencia de afinar C:N');
    return X.analyze(RO.applyOptToRecipe(FORMULA_A, it.apply, [], X.INGS), 'p_eryngii', X.INGS, spp).cn;
  };
  assert.ok(Math.abs(applyCn(spp) - spp.p_eryngii.targets.cn.ideal) <= 0.5);
  // Mezclar an resuelto con SPP heredado (el bug) deja el C:N lejos del ideal.
  assert.ok(Math.abs(applyCn(X.SPP) - spp.p_eryngii.targets.cn.ideal) > 0.5);
});

test('autoImproveRecipe (Auto-mejorar) mantiene la Fórmula A dentro del rango C:N resuelto', () => {
  const spp = sppA();
  const { min, max } = spp.p_eryngii.targets.cn;
  const out = X.autoImproveRecipe({
    recipe: FORMULA_A, sKey: 'p_eryngii', ings: X.INGS, optimizerINGS: X.INGS, spp,
    stockIds: new Set(), lockedIds: [], useStock: false, usageCounts: {}, histStats: null,
  });
  const cn = X.analyze(out, 'p_eryngii', X.INGS, spp).cn;
  assert.ok(cn >= min && cn <= max, `C:N ${cn.toFixed(1)} fuera de ${min}–${max}`);
  const an = X.analyze(out, 'p_eryngii', X.INGS, spp);
  const o = RO.generateOptimizer(an, 'p_eryngii', new Set(), out, X.INGS, [], null, false, {}, spp, {});
  assert.ok(!o.items.some(it => CN_FLAG.test(it.label || '')));
});

test('runHybridRecipeSearch usa el spp que recibe para analizar, tratar y limitar suplementos', () => {
  const spp = sppA();
  let seen = null;
  globalThis.SetasPeritoScenarios = {
    searchScenarios: args => { seen = { args, an: args.analyze(FORMULA_A) }; return { ranked: [], pareto: [], recommended: [] }; },
  };
  try {
    X.runHybridRecipeSearch({ targetKey: 'p_eryngii', ingredients: X.INGS, spp });
    assert.equal(seen.args.spp, spp);
    assert.equal(seen.args.context.spp, spp);
    assert.equal(seen.an.targets.cn.source, 'literature');
    assert.equal(seen.args.roleCaps.suplemento_n, spp.p_eryngii.supplementation_max);
    // Sin spp explícito conserva el SPP heredado (compatibilidad).
    X.runHybridRecipeSearch({ targetKey: 'p_eryngii', ingredients: X.INGS });
    assert.equal(seen.args.spp, X.SPP);
    assert.equal(seen.an.targets, null);
  } finally {
    delete globalThis.SetasPeritoScenarios;
  }
});
