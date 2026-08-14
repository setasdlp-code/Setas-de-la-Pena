'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const scoring = require('./scoring.js');
const legacy = require('./recipe-optimizer.js');
const scenarios = require('./perito-scenarios.js');

const SPP = {
  p_ostreatus_gris: {
    name: 'Orellana Gris',
    cn_optimal: { min: 25, max: 50, ideal: 35 },
    n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 },
    ph_optimal: { min: 6.0, max: 7.5 },
    eb_baseline: 90,
    eb_optimal: 130,
    supplementation_max: 20,
    spawn_rate: 8,
    moisture: { ideal: 65 },
  },
  shiitake: {
    name: 'Shiitake',
    cn_optimal: { min: 30, max: 45, ideal: 38 },
    n_optimal: { min: 1.0, max: 1.8, ideal: 1.4 },
    ph_optimal: { min: 5.5, max: 6.5 },
    eb_baseline: 70,
    eb_optimal: 110,
    supplementation_max: 20,
    spawn_rate: 10,
    moisture: { ideal: 60 },
  },
};

const INGS = [
  { id: 'paja_trigo', name: 'Paja de trigo', cat: 'paja', cn: 80, n: 0.6, c: 48, moisture: 12, cra: 3, ph: 6.8, dig: 7, role: 'base_carbono', tags: ['Base'], cost: 400, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'aserrin_roble', name: 'Aserrín de roble', cat: 'maderas', cn: 120, n: 0.3, c: 50, moisture: 15, cra: 2, ph: 6.2, dig: 4, role: 'base_carbono', tags: ['Base'], cost: 350, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'salvado_trigo', name: 'Salvado de trigo', cat: 'salvados', cn: 15, n: 2.5, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 8, role: 'suplemento_n', tags: ['Suplemento'], cost: 900, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'harina_pescado', name: 'Harina de pescado', cat: 'harinas', cn: 6, n: 8.0, c: 48, moisture: 8, cra: 2, ph: 6.5, dig: 9, role: 'suplemento_n', tags: ['N-Alto'], cost: 3200, cs: ['p_ostreatus_gris'] },
  { id: 'carbonato_calcio', name: 'Carbonato de calcio', cat: 'adit', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 9.5, dig: 0, role: 'aditivo_ph', tags: ['pH'], cost: 3000, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'yeso', name: 'Yeso agrícola', cat: 'adit', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7.0, dig: 0, role: 'aditivo_estructura', tags: ['Estructura'], cost: 2200, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'cascarilla_arroz', name: 'Cascarilla de arroz', cat: 'aireador', cn: 90, n: 0.4, c: 45, moisture: 10, cra: 1, ph: 6.8, dig: 2, role: 'aireador', tags: ['Aireador'], cost: 250, cs: ['p_ostreatus_gris', 'shiitake'] },
];

const roleCaps = sp => ({
  base_carbono: 100,
  suplemento_n: sp.supplementation_max || 20,
  suplemento_medio: sp.supplementation_max || 20,
  aditivo_ph: 8,
  aditivo_estructura: 15,
  aditivo_micronutriente: 5,
  aireador: 30,
});

const ingredientCaps = (ings, sp) => {
  const caps = {};
  for (const g of ings) {
    if (g.role === 'suplemento_n' || g.role === 'suplemento_medio') caps[g.id] = sp.supplementation_max || 20;
    else if (g.role === 'aditivo_ph') caps[g.id] = 8;
    else if (g.role === 'aditivo_estructura') caps[g.id] = 15;
    else if (g.role === 'aditivo_micronutriente') caps[g.id] = 5;
    else if (g.role === 'aireador') caps[g.id] = 30;
  }
  return caps;
};

function scoreAdapter(targetKey) {
  return (an, ctx) => {
    const sev = scoring.assessSeverity(an);
    const treatment = legacy.calcTreatment(an, targetKey, SPP);
    return scoring.scoreRecipe(an, {
      treatment,
      recipe: ctx.recipe,
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
    });
  };
}

function runHybrid(targetKey, profileKey) {
  const sp = SPP[targetKey];
  return scenarios.searchScenarios({
    recipe: [],
    context: { sKey: targetKey, spp: SPP },
    targetKey,
    spp: SPP,
    ingredients: INGS,
    analyze: recipe => legacy.analyze(recipe, targetKey, INGS, SPP),
    score: scoreAdapter(targetKey),
    history: [],
    searchMode: 'hybrid',
    generations: 3,
    beamWidth: 14,
    stepPct: 4,
    useStock: false,
    profileKey,
    roleCaps: roleCaps(sp),
    ingredientCaps: ingredientCaps(INGS, sp),
  });
}

function keys(rows) {
  return rows.map(r => scenarios.canonicalRecipeKey(r.recipe));
}

for (const targetKey of ['p_ostreatus_gris', 'shiitake']) {
  for (const profileKey of ['rescate', 'produccion', 'premium']) {
    test(`oracle parity ${targetKey}/${profileKey}: no pierde top legacy y no regresa score`, () => {
      const legacyOut = legacy.runAutoOptimizer(targetKey, [], 0, INGS, false, profileKey, {}, SPP);
      const hybridOut = runHybrid(targetKey, profileKey);

      assert.equal(legacyOut.noStock, false);

      // Feasibility parity: this fixture's C:N solver can be infeasible for
      // some species/profile combos (e.g. a tight maxSupp cap with only
      // high-C:N bases and a single weak-N supplement). When legacy itself
      // finds nothing, the ported engine must agree there is nothing to
      // find — that is parity too, not a gap to paper over with a looser
      // fixture. Only when legacy DOES find something do we require hybrid
      // to match or beat it.
      if (legacyOut.results.length === 0) {
        assert.equal(hybridOut.ranked.length, 0, 'hybrid encontró recetas donde legacy no encontró ninguna (infeasible según el solver estructural)');
        return;
      }
      assert.ok(hybridOut.ranked.length > 0, 'hybrid debe producir al menos una receta');

      // Coverage gate: every recipe that survived the legacy top-12/dedupe must
      // still exist in the structural universe ported to the new engine.
      const seedKeys = new Set(
        scenarios.generateStructuralSeeds({
          targetKey,
          ingredients: INGS,
          spp: SPP,
          useStock: false,
          profileKey,
        }).map(s => scenarios.canonicalRecipeKey(s.recipe))
      );
      for (const row of legacyOut.results) {
        const key = scenarios.canonicalRecipeKey(row.recipe);
        assert.ok(seedKeys.has(key), `legacy top-12 recipe missing from structural universe: ${key}`);
      }

      // Quality gate: hybrid may legitimately reorder or improve candidates,
      // but its best scalar candidate must never be worse than the legacy best.
      assert.ok(
        hybridOut.ranked[0].evaluation.score >= legacyOut.results[0].score,
        `hybrid best ${hybridOut.ranked[0].evaluation.score} < legacy best ${legacyOut.results[0].score}`
      );

      // Mass invariant for the public ranked output.
      for (const candidate of hybridOut.ranked) {
        const total = candidate.recipe.reduce((sum, r) => sum + Number(r.p || 0), 0);
        assert.ok(Math.abs(total - 100) <= 0.06, `mass balance ${total} for ${scenarios.canonicalRecipeKey(candidate.recipe)}`);
      }

      // Determinism gate for ranking, score and canonical composition.
      const rerun = runHybrid(targetKey, profileKey);
      assert.deepEqual(
        hybridOut.ranked.map(c => [scenarios.canonicalRecipeKey(c.recipe), c.evaluation.score]),
        rerun.ranked.map(c => [scenarios.canonicalRecipeKey(c.recipe), c.evaluation.score])
      );

      // Pareto preservation: re-running Pareto on the returned front must not
      // remove an element as dominated.
      assert.deepEqual(
        keys(scenarios.paretoFront(hybridOut.pareto)).sort(),
        keys(hybridOut.pareto).sort()
      );
    });
  }
}

// This test intentionally depends on runAutoOptimizer while it is the parity
// oracle. After this gate passes in the complete checkout, freeze the observed
// legacy top-12 compositions/scores as static golden fixtures; only then remove
// runAutoOptimizer and migrate/delete its direct unit test.
