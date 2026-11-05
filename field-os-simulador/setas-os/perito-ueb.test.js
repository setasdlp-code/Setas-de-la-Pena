'use strict';
// La tarjeta "↑EB · Potencial de EB sin explotar" solo propone un suplemento
// que, simulado con el mismo evaluador del Perito, sube la EB estimada. Antes
// elegía el suplemento N más barato sin simularlo y podía bajar la EB
// (eucalipto 75 / paja de soya 25: −8,4 pts).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const W = require('./perito-workbench-core.js');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const { analyze } = require('./substrate-analysis.js');

const setup = (sKey, recipe, { stockIds = new Set(), useStock = false } = {}) => {
  const resolveSpp = r => T.applyToSpp(cat.SPP, sKey, r, cat.INGS);
  const evaluate = RO.createRecipeEvaluator({ sKey, ings: cat.INGS, resolveSpp, analyzeFn: analyze, blendEB: a => a.eb });
  const spp = resolveSpp(recipe);
  const an = analyze(recipe, sKey, cat.INGS, spp);
  const opt = RO.generateOptimizer(an, sKey, stockIds, recipe, cat.INGS, [], an.eb, useStock, {}, spp, {}, evaluate);
  const ueb = (opt.items || []).find(it => it.icon === '↑EB');
  const sim = ueb?.apply ? W.simulateSuggestionDelta({ recipe, apply: ueb.apply, ingredients: cat.INGS, applyOptToRecipe: RO.applyOptToRecipe, evaluate }) : null;
  return { ueb, sim, an };
};

const CASES = [
  ['p_ostreatus_gris', [{ id: 'aserrin_eucalipto', p: 75 }, { id: 'paja_soya', p: 25 }]],
  ['p_ostreatus_gris', [{ id: 'aserrin_eucalipto', p: 90 }, { id: 'salvado_trigo', p: 10 }]],
  ['p_ostreatus_gris', [{ id: 'paja_trigo', p: 95 }, { id: 'carbonato_calcio', p: 2 }, { id: 'yeso', p: 3 }]],
  ['p_ostreatus_blanco', [{ id: 'aserrin_eucalipto', p: 85 }, { id: 'salvado_trigo', p: 15 }]],
  ['shiitake', [{ id: 'aserrin_roble', p: 90 }, { id: 'salvado_trigo', p: 10 }]],
  ['lions_mane', [{ id: 'aserrin_roble', p: 92 }, { id: 'salvado_trigo', p: 8 }]],
];

test('el caso observado: eucalipto 75 / paja de soya 25 ya no propone bajar la EB', () => {
  const { ueb, sim } = setup(...CASES[0]);
  assert.ok(ueb, 'la tarjeta ↑EB sigue apareciendo');
  if (ueb.apply) assert.ok(sim.diff.deltaEb >= RO.UEB_MIN_GAIN_PTS, `ΔEB ${sim.diff.deltaEb}`);
  else assert.match(ueb.action, /Ningún suplemento/);
});

test('toda tarjeta ↑EB con ajuste sube la EB simulada al menos 1 pt', () => {
  assert.equal(RO.UEB_MIN_GAIN_PTS, 1);
  for (const [sKey, recipe] of CASES) {
    const { ueb, sim } = setup(sKey, recipe);
    if (!ueb?.apply) continue;
    assert.ok(sim.diff.deltaEb >= RO.UEB_MIN_GAIN_PTS, `${sKey} ${JSON.stringify(recipe)}: ${ueb.apply.id} ΔEB ${sim.diff.deltaEb}`);
  }
});
