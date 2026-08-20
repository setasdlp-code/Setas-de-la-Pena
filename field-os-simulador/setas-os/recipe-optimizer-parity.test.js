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

test('searchScenarios diversifica el ranked del beam en vez de dejar que un solo par de bases lo acapare', () => {
  // Catálogo con 6 bases y 6 suplementos intercambiables: el beam de mutaciones
  // tiende a converger sobre el/los pocos roles estructurales que puntúan mejor
  // (selectStructuralRoots solo toma 4 semillas), y sin diversidad en el ranking
  // final el top-12 quedaba dominado por variantes casi idénticas de una sola
  // combinación de bases con distinto suplemento secundario.
  const diverseINGS = [
    { id: 'paja_arroz', name: 'Paja de arroz', role: 'base_carbono', cn: 65, n: .7, c: 46, moisture: 12, cra: 2.5, ph: 6.8, dig: 4, tags: [], cs: ['p_ostreatus_gris'], cost: 1800 },
    { id: 'aserrin_eucalipto', name: 'Aserrín de eucalipto', role: 'base_carbono', cn: 350, n: .15, c: 50, moisture: 12, cra: 3, ph: 5.0, dig: 3, tags: [], cs: ['p_ostreatus_gris'], cost: 2000 },
    { id: 'kikuyo', name: 'Kikuyo seco', role: 'base_carbono', cn: 25, n: 1.8, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 1400 },
    { id: 'retamo_espinoso', name: 'Retamo espinoso', role: 'base_carbono', cn: 32, n: 1.5, c: 47, moisture: 11, cra: 3, ph: 6.0, dig: 5, tags: [], cs: ['p_ostreatus_gris'], cost: 400 },
    { id: 'heno_pangola', name: 'Heno de pangola', role: 'base_carbono', cn: 60, n: .8, c: 48, moisture: 12, cra: 4, ph: 6.5, dig: 7, tags: [], cs: ['p_ostreatus_gris'], cost: 6500 },
    { id: 'fibra_palma', name: 'Fibra de palma de aceite', role: 'base_carbono', cn: 70, n: .7, c: 49, moisture: 18, cra: 3, ph: 5.8, dig: 4, tags: [], cs: ['p_ostreatus_gris'], cost: 1800 },
    { id: 'salvado_trigo', name: 'Salvado de trigo', role: 'suplemento_n', cn: 16, n: 2.8, c: 45, moisture: 12, cra: 3, ph: 6.2, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 5200 },
    { id: 'afrecho_cerveceria', name: 'Afrecho de cervecería', role: 'suplemento_n', cn: 11, n: 4.2, c: 46, moisture: 75, cra: 4.5, ph: 5.5, dig: 7, tags: [], cs: ['p_ostreatus_gris'], cost: 2500 },
    { id: 'gallinaza', name: 'Gallinaza compostada', role: 'suplemento_n', cn: 10, n: 3.5, c: 35, moisture: 20, cra: 2.5, ph: 7.5, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 2500 },
    { id: 'lombricompost', name: 'Lombricompost', role: 'suplemento_n', cn: 12, n: 3.0, c: 36, moisture: 35, cra: 3.5, ph: 7.0, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 5000 },
    { id: 'compost_maduro', name: 'Compost maduro', role: 'suplemento_n', cn: 15, n: 2.8, c: 42, moisture: 35, cra: 3.5, ph: 7.0, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 2500 },
    { id: 'harina_maiz', name: 'Harina de Maíz', role: 'suplemento_n', cn: 8, n: 3.2, c: 36, moisture: 12, cra: 3.0, ph: 6.8, dig: 7, tags: [], cs: ['p_ostreatus_gris'], cost: 1000 },
    { id: 'carbonato_calcio', name: 'Carbonato de calcio', role: 'aditivo_ph', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 9.5, dig: 0, tags: [], cs: ['p_ostreatus_gris'], cost: 3000 },
    { id: 'yeso', name: 'Yeso agrícola', role: 'aditivo_estructura', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7.0, dig: 0, tags: [], cs: ['p_ostreatus_gris'], cost: 2200 },
  ];
  const sp = SPP.p_ostreatus_gris;
  const out = scenarios.searchScenarios({
    recipe: [], context: { sKey: 'p_ostreatus_gris', spp: SPP }, targetKey: 'p_ostreatus_gris', spp: SPP,
    ingredients: diverseINGS,
    analyze: recipe => legacy.analyze(recipe, 'p_ostreatus_gris', diverseINGS, SPP),
    score: scoreAdapter('p_ostreatus_gris'), history: [], searchMode: 'hybrid',
    generations: 3, beamWidth: 14, stepPct: 4, useStock: false, profileKey: 'produccion',
    roleCaps: roleCaps(sp), ingredientCaps: ingredientCaps(diverseINGS, sp),
  });

  const roleById = new Map(diverseINGS.map(g => [g.id, g.role]));
  const groupCounts = new Map();
  out.ranked.forEach(c => {
    const k = c.recipe.filter(r => roleById.get(r.id) === 'base_carbono').map(r => r.id).sort().join('+');
    groupCounts.set(k, (groupCounts.get(k) || 0) + 1);
  });
  assert.ok(out.ranked.length > 0, 'esperaba al menos un resultado');
  assert.ok(groupCounts.size >= 3, `esperaba al menos 3 combinaciones de bases distintas, hubo ${groupCounts.size}`);
  for (const [key, count] of groupCounts) assert.ok(count <= 3, `el grupo "${key}" aporta ${count} resultados, más de los 3 permitidos por combinación de bases`);
  for (let i = 1; i < out.ranked.length; i++) {
    assert.ok(out.ranked[i - 1].evaluation.score >= out.ranked[i].evaluation.score, 'el ranked sigue ordenado de mayor a menor score');
  }
});

test('searchScenarios diversifica recommended por base, no solo ranked (que el operador nunca ve)', () => {
  // recommended son las tarjetas de escenario que perito-scenarios-bridge.js
  // realmente le muestra al operador — se construían agrupando por c.type
  // (conservadora/rendimiento/economia/experimental/alternativa) en vez de por
  // combinación de bases. Con una base claramente dominante en casi todas las
  // dimensiones (más barata, mejor C:N), el Pareto colapsa a 1-2 types y
  // recommended termina repitiendo esa misma base en todas sus tarjetas —
  // incluso cuando ranked (nunca mostrado al usuario) sí era diverso.
  const skewedINGS = [
    { id: 'paja_trigo', name: 'Paja de trigo', role: 'base_carbono', cn: 80, n: .6, c: 48, moisture: 12, ph: 6.8, dig: 7, cra: 3, cs: ['p_ostreatus_gris'], cost: 300 },
    { id: 'aserrin_roble', name: 'Aserrín de roble', role: 'base_carbono', cn: 120, n: .3, c: 50, moisture: 15, ph: 6.2, dig: 4, cra: 2, cs: ['p_ostreatus_gris'], cost: 900 },
    { id: 'bagazo_cana', name: 'Bagazo de caña', role: 'base_carbono', cn: 100, n: .4, c: 49, moisture: 55, ph: 6.0, dig: 5, cra: 3, cs: ['p_ostreatus_gris'], cost: 850 },
    { id: 'salvado_trigo', name: 'Salvado de trigo', role: 'suplemento_n', cn: 15, n: 2.5, c: 45, moisture: 12, ph: 6.5, dig: 8, cra: 4, cs: ['p_ostreatus_gris'], cost: 900 },
    { id: 'harina_pescado', name: 'Harina de pescado', role: 'suplemento_n', cn: 6, n: 8.0, c: 48, moisture: 8, ph: 6.5, dig: 9, cra: 2, cs: ['p_ostreatus_gris'], cost: 3200 },
  ];
  const sp = SPP.p_ostreatus_gris;
  const out = scenarios.searchScenarios({
    recipe: [], context: { sKey: 'p_ostreatus_gris', spp: SPP }, targetKey: 'p_ostreatus_gris', spp: SPP,
    ingredients: skewedINGS,
    analyze: recipe => legacy.analyze(recipe, 'p_ostreatus_gris', skewedINGS, SPP),
    score: scoreAdapter('p_ostreatus_gris'), history: [], searchMode: 'hybrid',
    generations: 3, beamWidth: 14, stepPct: 4, useStock: false, profileKey: 'produccion',
    roleCaps: roleCaps(sp), ingredientCaps: ingredientCaps(skewedINGS, sp),
  });

  const roleById = new Map(skewedINGS.map(g => [g.id, g.role]));
  const baseGroupOf = c => c.recipe.filter(r => roleById.get(r.id) === 'base_carbono').map(r => r.id).sort().join('+');
  const rankedGroups = new Set(out.ranked.map(baseGroupOf));
  const recommendedGroups = new Set(out.recommended.map(baseGroupOf));

  assert.ok(rankedGroups.size >= 2, `fixture inválido: ranked debería ya ser diverso (${rankedGroups.size} bases)`);
  assert.ok(out.recommended.length > 0, 'esperaba al menos una recomendación');
  assert.ok(
    recommendedGroups.size >= Math.min(2, rankedGroups.size),
    `recommended no explora bases distintas aunque ranked sí las tiene disponibles: ${recommendedGroups.size} base(s) en recommended vs ${rankedGroups.size} en ranked`
  );
});

// This test intentionally depends on runAutoOptimizer while it is the parity
// oracle. After this gate passes in the complete checkout, freeze the observed
// legacy top-12 compositions/scores as static golden fixtures; only then remove
// runAutoOptimizer and migrate/delete its direct unit test.
