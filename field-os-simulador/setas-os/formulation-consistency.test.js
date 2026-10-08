'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const RO = require('./recipe-optimizer');
const T = require('./species-targets');
const Scoring = require('./scoring');
globalThis.calcTreatment = RO.calcTreatment;
globalThis.SetasScoring = Scoring;
globalThis.SetasPeritoScenarios = require('./perito-scenarios');
const X = require('./test-support/jsx-extract').extractConsts(['SPP', 'INGS', 'analyze', 'scoreAn', 'hybridRoleCaps', 'hybridIngredientCaps', 'runHybridRecipeSearch']);
const sk = 'p_ostreatus_gris';
const resolve = r => T.applyToSpp(X.SPP, sk, r, X.INGS);
const search = stockMap => X.runHybridRecipeSearch({ targetKey: sk, ingredients: X.INGS, useStock: true, stockMap, spp: resolve([]) });

test('suplementación efectiva gobierna tratamiento y seguridad', () => {
  const recipe = [{ id: 'paja_trigo', p: 30 }, { id: 'paja_soya', p: 70 }];
  const a = X.analyze(recipe, sk, X.INGS, resolve(recipe));
  const snapshot = JSON.stringify(a);
  assert.equal(a.suppEffectiveP, 42);
  assert.equal(RO.calcTreatment(a, sk, resolve(recipe)).col, 'autoclave');
  for (const col of ['cwlp', 'thermal']) {
    const score = Scoring.scoreRecipe(a, { treatment: { col }, recipe });
    assert.equal(score.dimensions.safety.status, 'hold');
    assert.ok(score.breakdown.risk < 100);
  }
  assert.equal(JSON.stringify(a), snapshot);
  assert.equal(RO.calcTreatment({ ...a, suppEffectiveP: undefined, suppP: 42 }, sk, resolve(recipe)).col, 'autoclave');
  const evaluate = RO.createRecipeEvaluator({ sKey: sk, ings: X.INGS, resolveSpp: resolve, analyzeFn: X.analyze });
  assert.equal(evaluate(recipe).treatment.col, 'autoclave');
});

test('cada candidato se analiza y puntúa con su propia clase', () => {
  for (const stock of [{ paja_trigo: 10 }, { paja_trigo: 10, salvado_trigo: 10 }]) {
    const out = search(stock);
    assert.ok(out.ranked.length);
    for (const c of out.ranked) {
      const spp = resolve(c.recipe);
      const a = X.analyze(c.recipe, sk, X.INGS, spp);
      const score = X.scoreAn(a, { recipe: c.recipe, treatment: RO.calcTreatment(a, sk, spp), stockIds: new Set(Object.keys(stock)) });
      assert.equal(c.evaluation.analysis.targets.resolvedClass, a.targets.resolvedClass);
      assert.equal(c.evaluation.analysis.eb, a.eb);
      assert.equal(c.evaluation.score, score.score);
    }
  }
});

// Handler real, buscador real; solo se capturan el estado React y el aviso.
function stockAction(stockMap) {
  const src = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  const start = src.indexOf('  const formularConStockBodega=()=>{');
  const end = src.indexOf('\n  // Mismo EB mezclado', start);
  assert.ok(start >= 0 && end > start);
  let loaded = null, notice;
  const handler = new Function('stockMap', 'setNoticeDlg', 'runHybridRecipeSearch', 'sKey', 'invLotes', 'INGS', 'optProfile', 'SetasSpeciesTargetsApi', 'SPP', 'setRecipe', 'calcMaxBatchFromStock', 'sp', src.slice(start, end) + '\nreturn formularConStockBodega;')(
    stockMap, n => notice = n, X.runHybridRecipeSearch, sk, [], X.INGS, 'produccion', T, X.SPP, r => loaded = r, () => ({ maxBolsas: 10, maxKgWet: 15 }), X.SPP[sk]);
  handler();
  return { loaded, notice };
}

test('Bodega carga porcentajes canónicos analizables', () => {
  const { loaded } = stockAction({ paja_trigo: 10 });
  assert.ok(loaded?.length);
  assert.equal(loaded.reduce((s, r) => s + r.p, 0), 100);
  assert.ok(X.analyze(loaded, sk, X.INGS, resolve(loaded)));
});

test('Bodega conserva el rechazo del buscador', () => {
  assert.equal(search({ aserrin_roble: 10, carbonato_calcio: 1 }).ranked.length, 0);
  const { loaded, notice } = stockAction({ aserrin_roble: 10, carbonato_calcio: 1 });
  assert.equal(loaded, null);
  assert.match(notice.title, /Sin combinación viable/);
});

test('el descuento por café no evita autoclave al superar el límite efectivo', () => {
  const a = X.analyze([{ id: 'paja_trigo', p: 30 }, { id: 'paja_soya', p: 70 }], sk, X.INGS, resolve([]));
  for (const [suppEffectiveP, col] of [[19.999, 'thermal'], [20, 'thermal'], [20.001, 'autoclave']]) {
    assert.equal(RO.calcTreatment({ ...a, suppEffectiveP, cafeP: 10, trichoderma: false }, sk, resolve([])).col, col);
  }
});
