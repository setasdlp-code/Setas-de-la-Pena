'use strict';
// Snapshot de referencia del Formulador/Perito (plan PR 1, 2026-11-05).
// Captura, para un conjunto fijo de recetas, lo que el Perito calcula hoy:
// análisis, score, tratamiento, sugerencias y su ΔEB. Cada cambio posterior a
// los motores debe regenerarlo (UPDATE_BASELINE=1) y nombrar cada diferencia en
// su commit. No mide si el modelo acierta — eso es `npm run perito:regression`,
// que necesita lotes reales.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const W = require('./perito-workbench-core.js');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const { analyze } = require('./substrate-analysis.js');

const FIXTURE = path.join(__dirname, 'formulador-baseline.fixture.json');
const r1 = v => (Number.isFinite(v) ? Math.round(v * 10) / 10 : v ?? null);

const firstMedio = cat.INGS.find(g => g.role === 'suplemento_medio' && g.cs?.includes('p_ostreatus_gris'));
const pescadoOk = cat.INGS.find(g => g.id === 'harina_pescado')?.cs?.includes('p_ostreatus_blanco');

const RECIPES = [
  { name: 'gris-euc-salvado', sKey: 'p_ostreatus_gris', recipe: [{ id: 'aserrin_eucalipto', p: 80 }, { id: 'salvado_trigo', p: 20 }] },
  {
    name: 'shiitake-lote1-proxy', sKey: 'shiitake',
    proxyOf: 'DOC-0127 pellets 80 / salvado 20 / Ca(OH)2 1 — pellets y cal hidratada no están en el catálogo',
    recipe: [{ id: 'aserrin_roble', p: 80 }, { id: 'salvado_trigo', p: 20 }, { id: 'carbonato_calcio', p: 1 }],
  },
  { name: 'gris-paja-balanceada', sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 85 }, { id: 'salvado_trigo', p: 12 }, { id: 'carbonato_calcio', p: 2 }, { id: 'yeso', p: 1 }] },
  { name: 'gris-suplemento-medio', sKey: 'p_ostreatus_gris', recipe: [{ id: 'aserrin_eucalipto', p: 75 }, { id: firstMedio.id, p: 25 }] },
  { name: 'blanca-n-alto', sKey: 'p_ostreatus_blanco', recipe: [{ id: 'aserrin_eucalipto', p: 70 }, { id: pescadoOk ? 'harina_pescado' : 'salvado_trigo', p: 30 }] },
];

const snapshotOf = ({ name, sKey, recipe, proxyOf }) => {
  const resolveSpp = r => T.applyToSpp(cat.SPP, sKey, r, cat.INGS);
  const evaluate = RO.createRecipeEvaluator({ sKey, ings: cat.INGS, resolveSpp, analyzeFn: analyze, blendEB: a => a.eb });
  const spp = resolveSpp(recipe);
  const an = analyze(recipe, sKey, cat.INGS, spp);
  const base = evaluate(recipe);
  const opt = RO.generateOptimizer(an, sKey, new Set(), recipe, cat.INGS, [], an.eb, false, {}, spp, {}, evaluate);
  const items = (opt.items || []).map(it => {
    const sim = it.apply ? W.simulateSuggestionDelta({ recipe, apply: it.apply, ingredients: cat.INGS, applyOptToRecipe: RO.applyOptToRecipe, evaluate }) : null;
    return {
      icon: it.icon ?? null,
      priority: it.priority ?? null,
      action: it.action ?? null,
      apply: it.apply ?? null,
      deltaEb: sim ? r1(sim.diff.deltaEb) : null,
      deltaEbRange: sim && sim.diff.deltaEbRange ? sim.diff.deltaEbRange.map(r1) : null,
    };
  });
  const ue = base.scoreObj.uncertainty?.eb || {};
  return {
    name, sKey, recipe, ...(proxyOf ? { proxyOf } : {}),
    analyze: { eb: r1(an.eb), ebLow: r1(an.ebLow), ebHigh: r1(an.ebHigh), cn: r1(an.cn), avgN: r1(an.avgN), cost: r1(an.cost), suppEffectiveP: r1(an.suppEffectiveP) },
    score: { score: r1(base.score), eb: { low: r1(ue.low), high: r1(ue.high), central: r1(ue.central), confidence: ue.confidence ?? null } },
    treatment: base.treatment?.col ?? null,
    items,
  };
};

test('snapshot del Formulador coincide con la referencia', () => {
  const actual = JSON.parse(JSON.stringify(RECIPES.map(snapshotOf)));
  if (process.env.UPDATE_BASELINE === '1') {
    fs.writeFileSync(FIXTURE, JSON.stringify(actual, null, 2) + '\n');
    return;
  }
  const expected = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  assert.deepStrictEqual(actual, expected);
});
