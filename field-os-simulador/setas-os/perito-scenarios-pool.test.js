'use strict';
// searchScenarios({includePool:true}) expone todas las candidatas permitidas
// para la vista "Mejor con Bodega", sin cambiar el orden de Escenarios.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const S = require('./perito-scenarios.js');
const { analyze } = require('./substrate-analysis.js');

const sKey = 'p_ostreatus_gris';
const run = (extra = {}) => {
  const ings = cat.INGS.filter(g => !Array.isArray(g.cs) || !g.cs.length || g.cs.includes(sKey));
  return S.searchScenarios({
    recipe: [], context: { sKey, spp: cat.SPP, stockIds: new Set() }, searchMode: 'hybrid',
    targetKey: sKey, spp: cat.SPP, ingredients: ings,
    analyze: rec => analyze(rec, sKey, cat.INGS, T.applyToSpp(cat.SPP, sKey, rec, cat.INGS)),
    score: (an, ctx) => globalThis.SetasScoring.scoreRecipe(an, {
      treatment: RO.calcTreatment(an, sKey, { ...cat.SPP, [sKey]: an.sp }), recipe: ctx.recipe,
    }),
    history: [], generations: 3, beamWidth: 14, stepPct: 4, profileKey: 'produccion', ...extra,
  });
};
const keys = list => (list || []).map(c => S.canonicalRecipeKey(c.recipe));

test('includePool expone todas las candidatas permitidas', () => {
  const out = run({ includePool: true });
  assert.ok(Array.isArray(out.pool));
  assert.ok(out.pool.length > out.ranked.length);
  assert.ok(out.pool.every(c => c.evaluation?.allowed === true));
  assert.ok(out.pool.length >= out.diagnostics.allowedCount);
});

test('includePool no cambia ranked, pareto ni recommended', () => {
  const on = run({ includePool: true });
  const off = run();
  assert.equal('pool' in off, false);
  assert.deepStrictEqual(keys(on.ranked), keys(off.ranked));
  assert.deepStrictEqual(keys(on.pareto), keys(off.pareto));
  assert.deepStrictEqual(keys(on.recommended), keys(off.recommended));
});
