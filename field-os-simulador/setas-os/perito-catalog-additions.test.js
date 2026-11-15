'use strict';
// Insumos y presets añadidos para el microlote DOC-0127. Un insumo nuevo entra
// al pool de búsqueda del Perito; estos tests exigen que no altere los
// Escenarios ni las sugerencias de shiitake (ADR-0004: nada cambia el ranking
// sin evidencia validada).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const S = require('./perito-scenarios.js');
const { analyze } = require('./substrate-analysis.js');

const WITHOUT = cat.INGS.filter((g) => g.id !== 'cal_hidratada');
const BASE = [{ id: 'aserrin_roble', p: 79 }, { id: 'salvado_trigo', p: 20 }, { id: 'carbonato_calcio', p: 1 }];

const scenarios = (ingredients, recipe) => {
  const sKey = 'shiitake';
  const ings = ingredients.filter((g) => !Array.isArray(g.cs) || !g.cs.length || g.cs.includes(sKey));
  const out = S.searchScenarios({
    recipe, context: { sKey, spp: cat.SPP, stockIds: new Set() }, searchMode: 'hybrid', targetKey: sKey, spp: cat.SPP, ingredients: ings,
    analyze: (rec) => analyze(rec, sKey, ingredients, T.applyToSpp(cat.SPP, sKey, rec, ingredients)),
    score: (an, ctx) => globalThis.SetasScoring.scoreRecipe(an, { treatment: RO.calcTreatment(an, sKey, { ...cat.SPP, [sKey]: an.sp }), recipe: ctx.recipe }),
    history: [], generations: 3, beamWidth: 14, stepPct: 4, useStock: false, stockIds: new Set(), invLotes: [], stockMap: {}, profileKey: 'produccion',
  });
  return JSON.stringify((out.ranked || []).slice(0, 8).map((r) => r.recipe));
};

test('la cal hidratada no cambia los Escenarios de shiitake', () => {
  for (const recipe of [[], BASE]) assert.equal(scenarios(cat.INGS, recipe), scenarios(WITHOUT, recipe));
});

test('la cal hidratada no cambia las sugerencias del Perito sobre la fórmula de roble', () => {
  const tips = (ings) => {
    const an = analyze(BASE, 'shiitake', ings);
    return JSON.stringify(RO.generateOptimizer(an, 'shiitake', new Set(), BASE, ings, [], an.eb, false, {}, cat.SPP, {}, null).items);
  };
  assert.equal(tips(cat.INGS), tips(WITHOUT));
});

test('los presets existentes conservan su EB', () => {
  for (const [id, p] of Object.entries(cat.PRESETS)) {
    if (id === 'shiitake_microlote_pellets_v1') continue;
    assert.equal(analyze(p.i, p.s, cat.INGS).eb, analyze(p.i, p.s, WITHOUT).eb, id);
  }
});

test('la receta DOC-0127 se formula sin incompatibles y suma 100 %', () => {
  const p = cat.PRESETS.shiitake_microlote_pellets_v1;
  const an = analyze(p.i, 'shiitake');
  assert.deepEqual(an.incompat, []);
  assert.ok(Math.abs(an.tot - 100) < 1e-6);
  assert.ok(p.i.some((r) => r.id === 'pellets_weber_hickory'));
  // 80/20 de base seca + 1 % de cal sobre esa base.
  const [pel, sal, cal] = p.i.map((r) => r.p);
  assert.ok(Math.abs(pel / sal - 4) < 0.01 && Math.abs(cal / (pel + sal) - 0.01) < 0.001);
});

test('la cal hidratada es distinta del carbonato y declara que su pH no es el de la mezcla', () => {
  const g = cat.INGS.find((x) => x.id === 'cal_hidratada');
  assert.equal(g.role, 'aditivo_ph');
  assert.deepEqual(g.cs, ['shiitake']);
  assert.match(g.notes, /no el del sustrato/);
});
