'use strict';
// computeBestWithBodega de punta a punta: dos búsquedas reales (solo Bodega y
// catálogo) con el analyze canónico, igual que runHybridRecipeSearch en la app.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const S = require('./perito-scenarios.js');
const B = require('./formulador-best.js');
const { analyze } = require('./substrate-analysis.js');

// Réplica de runHybridRecipeSearch (simulador-app.jsx) para node.
const makeSearch = sKey => ({ seed, recipe, targetKey, useStock, invLotes = [], stockMap = {}, ingredients, spp, includePool }) => {
  const stockIds = new Set([
    ...Object.keys(stockMap).filter(k => Number(stockMap[k]) > 0),
    ...invLotes.filter(l => l.activo !== false && Number(l.cantidadKgDisponible) > 0).map(l => l.ingredienteId),
  ]);
  const ings = ingredients.filter(g => (!useStock || stockIds.has(g.id)) && (!Array.isArray(g.cs) || !g.cs.length || g.cs.includes(targetKey)));
  return S.searchScenarios({
    recipe: seed || recipe || [], context: { sKey: targetKey, spp, stockIds }, searchMode: 'hybrid', targetKey, spp, ingredients: ings,
    analyze: rec => analyze(rec, sKey, ingredients, T.applyToSpp(spp, sKey, rec, ingredients)),
    score: (an, ctx) => globalThis.SetasScoring.scoreRecipe(an, {
      treatment: RO.calcTreatment(an, sKey, { ...spp, [sKey]: an.sp }), recipe: ctx.recipe, stockIds: useStock ? stockIds : undefined,
    }),
    history: [], generations: 3, beamWidth: 14, stepPct: 4, useStock, stockIds, invLotes, stockMap, profileKey: 'produccion', includePool,
  });
};
const lot = (ingredienteId, kg, precioPorKgCOP) => ({ id: `L-${ingredienteId}`, ingredienteId, cantidadKgDisponible: kg, precioPorKgCOP, activo: true });
const BATCH = { numBags: 20, kgPerBag: 2.5, moisturePct: 65 };
const run = (sKey, invLotes) => {
  const search = makeSearch(sKey);
  const params = { search, sKey, spp: cat.SPP, ingredients: cat.INGS, invLotes, stockMap: {}, calcTreatment: RO.calcTreatment, batch: BATCH };
  return { out: B.computeBestWithBodega(params), search };
};

const GRIS_LOTS = [
  lot('aserrin_eucalipto', 200, 250), lot('salvado_trigo', 40, 1400), lot('retamo_espinoso', 4, 150),
  lot('carbonato_calcio', 5, 900), lot('yeso', 5, 700),
];

test('Gris con Bodega: las dos recetas salen de Bodega y cumplen su criterio', () => {
  const { out, search } = run('p_ostreatus_gris', GRIS_LOTS);
  const stockIds = new Set(GRIS_LOTS.map(l => l.ingredienteId));
  assert.equal(out.noStock, false);
  const { produccion, barata } = out.stock;
  assert.ok(produccion && barata);
  for (const p of [produccion, barata]) assert.ok(p.recipe.every(r => stockIds.has(r.id)), `fuera de Bodega: ${p.key}`);

  const pool = search({ targetKey: 'p_ostreatus_gris', useStock: true, invLotes: GRIS_LOTS, ingredients: cat.INGS, spp: cat.SPP, includePool: true }).pool
    .map(c => B.annotateCandidate(c, { ingredients: cat.INGS, invLotes: GRIS_LOTS, ebOptimal: cat.SPP.p_ostreatus_gris.eb_optimal, calcTreatment: RO.calcTreatment, sKey: 'p_ostreatus_gris', spp: cat.SPP }))
    .filter(a => a.safe);
  assert.ok(pool.every(a => produccion.eb >= a.eb - B.EB_TIE_PTS));
  assert.ok(pool.filter(a => a.costPerKgSeta != null).every(a => barata.costPerKgSeta <= a.costPerKgSeta));
  assert.ok(Number.isInteger(out.stock.bags.produccion) && out.stock.bags.produccion >= 0);

  assert.ok(out.improvements.length <= 3);
  const stockKg = B.stockKgById(GRIS_LOTS);
  for (const it of out.improvements) {
    assert.ok(it.toBuy.length > 0);
    const per = B.kgPerBagById(it.annotated.recipe, cat.INGS, BATCH);
    assert.ok(it.toBuy.some(t => !stockIds.has(t.id) || (stockKg[t.id] || 0) < per[t.id] * BATCH.numBags));
  }
});

test('Shiitake: la receta de Bodega se marca con autoclave', () => {
  const { out } = run('shiitake', [lot('aserrin_roble', 200, 400), lot('salvado_trigo', 40, 1400), lot('carbonato_calcio', 5, 900)]);
  assert.ok(out.stock.produccion);
  assert.equal(out.stock.produccion.requiresAutoclave, true);
});

test('Bodega vacía: sin recetas de Bodega pero con sugerencias del catálogo', () => {
  const { out } = run('p_ostreatus_gris', []);
  assert.equal(out.noStock, true);
  assert.equal(out.stock.produccion, null);
  assert.ok(out.improvements.length > 0);
});

test('cada receta de Bodega dice qué falta para el lote planeado', () => {
  const { out } = run('p_ostreatus_gris', GRIS_LOTS);
  const p = out.stock.produccion;
  assert.deepStrictEqual(out.stock.short.produccion, B.shortfall(p.recipe, cat.INGS, out.stockKg, BATCH));
  assert.ok(Array.isArray(out.stock.short.barata));
});

test('el catálogo también se explora desde la receta de Bodega', () => {
  const calls = [];
  const search = makeSearch('p_ostreatus_gris');
  B.computeBestWithBodega({
    search: p => { calls.push({ useStock: p.useStock, seeded: (p.recipe || []).length > 0 }); return search({ ...p, seed: p.recipe }); },
    sKey: 'p_ostreatus_gris', spp: cat.SPP, ingredients: cat.INGS, invLotes: GRIS_LOTS, stockMap: {}, calcTreatment: RO.calcTreatment, batch: BATCH,
  });
  assert.deepStrictEqual(calls, [{ useStock: true, seeded: false }, { useStock: false, seeded: false }, { useStock: false, seeded: true }]);
});
