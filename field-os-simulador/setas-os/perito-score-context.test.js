'use strict';
// Contexto único de score del Perito (createRecipeEvaluator).
// Antes el veredicto, el "Índice estimado" de cada sugerencia, el ΔScore de la
// tarjeta y el Morphing puntuaban con contextos distintos, y las predicciones
// usaban los objetivos de la receta ANTERIOR al ajuste. Con paja de trigo 100%
// el Perito anunciaba 84 para "Afinar Nitrógeno" (+SMS 10%) y, al aplicarlo,
// la receta pasaba a 38 / crítico porque el SMS cambia la clase de sustrato.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const W = require('./perito-workbench-core.js');

globalThis.generateOptimizer = RO.generateOptimizer;
globalThis.applyOptToRecipe = RO.applyOptToRecipe;
globalThis.calcTreatment = RO.calcTreatment;
globalThis.createRecipeEvaluator = RO.createRecipeEvaluator;

const X = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'blendEBWithHistory', 'autoImproveRecipe']);
const SK = 'p_ostreatus_gris';
const NO_STOCK = new Set();
const resolveSpp = r => T.applyToSpp(X.SPP, SK, r, X.INGS);

const RECIPES = {
  paja: [{ id: 'paja_trigo', p: 100 }],
  pajaSalvado: [{ id: 'paja_trigo', p: 84 }, { id: 'salvado_trigo', p: 15 }, { id: 'yeso', p: 1 }],
  tusa: [{ id: 'tusa_maiz', p: 70 }, { id: 'salvado_trigo', p: 28 }, { id: 'yeso', p: 1 }, { id: 'carbonato_calcio', p: 1 }],
  alamo: [{ id: 'aserrin_alamo', p: 95 }, { id: 'salvado_trigo', p: 5 }],
};

const makeEvaluator = (histStats = null) => RO.createRecipeEvaluator({
  sKey: SK, ings: X.INGS, resolveSpp, stockIds: NO_STOCK,
  blendEB: a => X.blendEBWithHistory(a, histStats), analyzeFn: X.analyze,
});

// Igual que el componente: objetivos de la receta activa + evaluador.
const perito = (recipe, evaluate, histStats = null) => {
  const spp = resolveSpp(recipe);
  const an = X.analyze(recipe, SK, X.INGS, spp);
  return RO.generateOptimizer(an, SK, NO_STOCK, recipe, X.INGS, [], X.blendEBWithHistory(an, histStats), false, {}, spp, {}, evaluate);
};

test('createRecipeEvaluator: el veredicto con evaluador coincide con evaluate(receta)', () => {
  const evaluate = makeEvaluator();
  for (const recipe of Object.values(RECIPES)) {
    assert.equal(perito(recipe, evaluate).score, evaluate(recipe).score);
  }
});

test('createRecipeEvaluator resuelve los objetivos de cada receta (la clase de sustrato cambia con la composición)', () => {
  const evaluate = makeEvaluator();
  const straw = evaluate(RECIPES.paja);
  const supplemented = evaluate([{ id: 'paja_trigo', p: 90 }, { id: 'sms', p: 10 }]);
  assert.notDeepEqual(straw.spp[SK].cn_optimal, supplemented.spp[SK].cn_optimal);
  assert.equal(straw.an.sp, straw.spp[SK]);
});

test('el score predicho de cada sugerencia es el que la receta tiene después de aplicarla', () => {
  const evaluate = makeEvaluator();
  let checked = 0;
  for (const [name, recipe] of Object.entries(RECIPES)) {
    const o = perito(recipe, evaluate);
    for (const it of o.items.filter(i => i.predictedScore != null)) {
      const next = RO.applyOptToRecipe(recipe, it.apply, [], X.INGS);
      const after = perito(next, makeEvaluator());
      assert.equal(it.predictedScore, after.score, `${name} · ${it.label}: predicho ${it.predictedScore}, real ${after.score}`);
      checked++;
    }
  }
  assert.ok(checked >= 4, `muy pocas predicciones verificadas (${checked})`);
});

test('regresión paja 100%: "Afinar Nitrógeno" ya no anuncia una mejora que deja la receta en crítico', () => {
  const o = perito(RECIPES.paja, makeEvaluator());
  const it = o.items.find(i => i.label === 'Afinar Nitrógeno' && i.apply);
  assert.ok(it, o.items.map(i => i.label).join(' | '));
  const after = perito(RO.applyOptToRecipe(RECIPES.paja, it.apply, [], X.INGS), makeEvaluator());
  assert.equal(it.predictedScore, after.score);
  assert.ok(it.predictedScore < o.score, `debería anunciar un empeoramiento: ${o.score} → ${it.predictedScore}`);
});

test('ΔScore de la tarjeta coincide con el "Índice estimado", también con EB histórico', () => {
  const histStats = { n: 3, avg: 120, weight: 0.5 };
  const evaluate = makeEvaluator(histStats);
  for (const recipe of [RECIPES.tusa, RECIPES.paja, RECIPES.pajaSalvado]) {
    const o = perito(recipe, evaluate, histStats);
    for (const it of o.items.filter(i => i.predictedScore != null)) {
      const sim = W.simulateSuggestionDelta({
        recipe, apply: it.apply, lockedIds: [], ingredients: X.INGS,
        applyOptToRecipe: RO.applyOptToRecipe, evaluate,
        baseAn: evaluate(recipe).an, baseScore: o.score,
      });
      assert.equal(sim.diff.newScore, it.predictedScore, it.label);
      assert.equal(sim.diff.deltaScore, Math.round((it.predictedScore - o.score) * 10) / 10, it.label);
    }
  }
});

test('simulateSuggestionDelta con evaluador toma la base del evaluador si no se la pasan', () => {
  const evaluate = makeEvaluator();
  const apply = { mode: 'set', id: 'salvado_trigo', value: 10 };
  const sim = W.simulateSuggestionDelta({ recipe: RECIPES.pajaSalvado, apply, ingredients: X.INGS, applyOptToRecipe: RO.applyOptToRecipe, evaluate });
  const next = RO.applyOptToRecipe(RECIPES.pajaSalvado, apply, [], X.INGS);
  assert.equal(sim.diff.newScore, evaluate(next).score);
  assert.equal(sim.diff.deltaScore, Math.round((evaluate(next).score - evaluate(RECIPES.pajaSalvado).score) * 10) / 10);
});

test('Morphing: con α=0 el score morfeado es el del veredicto y la trayectoria usa los objetivos de cada mezcla', () => {
  const evaluate = makeEvaluator();
  const base = RECIPES.paja;
  const target = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];
  const atZero = W.morphRecipes(base, target, 0, []);
  assert.equal(evaluate(atZero).score, perito(base, evaluate).score);
  const traj = W.analyzeMorphTrajectory({
    recipeA: base, recipeB: target, species: X.SPP[SK],
    analyzeFn: r => evaluate(r)?.an || null, requestedAlpha: 0,
  });
  // Paja sola tiene C:N ~90: admisible para su clase (paja sin suplementar),
  // no para los rangos de bolsa suplementada que trae SPP heredado.
  assert.equal(traj.trajectory[0].isFeasible, true, traj.trajectory[0].violations.join(' | '));
});

test('autoImproveRecipe con resolveSpp nunca empeora el score real de la receta', () => {
  const evaluate = makeEvaluator();
  for (const [name, recipe] of Object.entries(RECIPES)) {
    const out = X.autoImproveRecipe({
      recipe, sKey: SK, ings: X.INGS, optimizerINGS: X.INGS, spp: resolveSpp(recipe), resolveSpp,
      stockIds: NO_STOCK, lockedIds: [], useStock: false, usageCounts: {}, histStats: null,
    });
    assert.ok(evaluate(out).score >= evaluate(recipe).score, `${name}: ${evaluate(recipe).score} → ${evaluate(out).score}`);
  }
});

test('generateOptimizer sin evaluador conserva el contexto histórico (oráculo de paridad)', () => {
  const recipe = RECIPES.tusa;
  const spp = resolveSpp(recipe);
  const an = X.analyze(recipe, SK, X.INGS, spp);
  const o = RO.generateOptimizer(an, SK, NO_STOCK, recipe, X.INGS, [], 120, false, {}, spp, {});
  // El veredicto sigue usando blendedEB, y la predicción sigue sin él.
  const withoutHist = RO.generateOptimizer(an, SK, NO_STOCK, recipe, X.INGS, [], null, false, {}, spp, {});
  assert.notEqual(o.score, withoutHist.score);
  const pick = r => r.items.filter(i => i.predictedScore != null).map(i => i.predictedScore);
  assert.deepEqual(pick(o), pick(withoutHist));
});

test('regresión Auto-mejorar: no lleva una paja casi sin suplementar de 87 a "No ejecutar"', () => {
  // Con los objetivos fijos de la receta inicial, Auto-mejorar aceptaba un paso
  // que cruzaba el umbral de suplementación (clase "bolsa suplementada") y la
  // receta caía de 87 a 25. Ocurría en 42 de 612 combinaciones base + suplemento.
  const sKey = 'p_ostreatus_blanco';
  const recipe = [{ id: 'paja_cebada', p: 97 }, { id: 'paja_soya', p: 3 }];
  const resolve = r => T.applyToSpp(X.SPP, sKey, r, X.INGS);
  const evaluate = RO.createRecipeEvaluator({ sKey, ings: X.INGS, resolveSpp: resolve, stockIds: NO_STOCK, blendEB: a => a.eb, analyzeFn: X.analyze });
  const out = X.autoImproveRecipe({
    recipe, sKey, ings: X.INGS, optimizerINGS: X.INGS, spp: resolve(recipe), resolveSpp: resolve,
    stockIds: NO_STOCK, lockedIds: [], useStock: false, usageCounts: {}, histStats: null,
  });
  assert.ok(evaluate(out).score >= evaluate(recipe).score, `${evaluate(recipe).score} → ${evaluate(out).score}`);
});
