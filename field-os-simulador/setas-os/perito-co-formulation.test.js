'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  generateCoformulationSeeds,
  searchScenarios,
  normalizeRecipe,
  recipeDistance,
} = require('./perito-scenarios.js');
const scoring = require('./scoring.js');
const optimizer = require('./recipe-optimizer.js');

const sampleSpp = {
  p_ostreatus_gris: {
    name: 'Orellana Gris',
    cn_optimal: { ideal: 30, min: 22, max: 45 },
    n_optimal: { ideal: 1.4, min: 0.8, max: 2.2 },
    eb_baseline: 45,
    eb_optimal: 95,
    spawn_rate: 8,
    supplementation_max: 20,
    ph_optimal: { min: 6.0, max: 7.5 },
  },
};

const sampleCatalog = [
  { id: 'aserrin_roble', name: 'Aserrín de Roble', role: 'base_carbono', c: 50, n: 0.1, cn: 500, moisture: 10, cost: 350, ph: 6.5, dig: 7, cra: 3 },
  { id: 'aserrin_eucalipto', name: 'Aserrín de Eucalipto', role: 'base_carbono', c: 48, n: 0.15, cn: 320, moisture: 10, cost: 300, ph: 6.0, dig: 6, cra: 3 },
  { id: 'salvado_trigo', name: 'Salvado de Trigo', role: 'suplemento_n', c: 45, n: 2.5, cn: 18, moisture: 12, cost: 1300, ph: 6.5, dig: 8, cra: 4 },
  { id: 'harina_soya', name: 'Harina de Soya', role: 'suplemento_n', c: 46, n: 6.8, cn: 6.7, moisture: 10, cost: 2800, ph: 6.8, dig: 9, cra: 4 },
  { id: 'cascarilla_arroz', name: 'Cascarilla de Arroz', role: 'aireador', c: 40, n: 0.5, cn: 80, moisture: 10, cost: 400, ph: 7.0, dig: 4, cra: 2 },
  { id: 'carbonato_calcio', name: 'Carbonato de Calcio', role: 'aditivo_ph', c: 0, n: 0, cn: 0, moisture: 0, cost: 600, ph: 8.5, dig: 5, cra: 1 },
  { id: 'yeso', name: 'Yeso', role: 'aditivo_estructura', c: 0, n: 0, cn: 0, moisture: 0, cost: 500, ph: 7.0, dig: 5, cra: 1 },
];

test('co-formulación genera alternativas viables desde receta 40% base', () => {
  const partial = [{ id: 'aserrin_roble', p: 40 }];
  const analyzeAdapter = recipe => optimizer.analyze(recipe, 'p_ostreatus_gris', sampleCatalog, sampleSpp);
  const scoreAdapter = (an, ctx) => scoring.scoreRecipe(an, {
    sKey: 'p_ostreatus_gris',
    spp: sampleSpp,
    ...ctx,
  });

  const result = searchScenarios({
    recipe: partial,
    context: { sKey: 'p_ostreatus_gris', spp: sampleSpp },
    targetKey: 'p_ostreatus_gris',
    spp: sampleSpp,
    ingredients: sampleCatalog,
    analyze: analyzeAdapter,
    score: scoreAdapter,
    searchMode: 'hybrid',
  });

  assert.equal(result.isPartial, true);
  assert.equal(result.partialTotal, 40);
  assert.ok(result.recommended.length >= 2, 'debe generar al menos 2 recomendaciones');

  result.recommended.forEach(c => {
    const tot = c.recipe.reduce((s, r) => s + r.p, 0);
    assert.ok(Math.abs(tot - 100) < 0.1, `receta debe sumar 100%, dio ${tot}`);

    const oak = c.recipe.find(r => r.id === 'aserrin_roble');
    assert.ok(oak && oak.p >= 40, 'debe conservar al menos el 40% inicial de aserrín de roble');

    // Debe tener addedIngredients con deltas positivas
    assert.ok(Array.isArray(c.addedIngredients) && c.addedIngredients.length > 0);
    const hasCompletions = c.addedIngredients.some(x => x.delta > 0);
    assert.ok(hasCompletions, 'debe incluir ingredientes completados');

    // Score de seguridad debe ser aceptable (sin trichoderma desbocado)
    const an = c.evaluation?.analysis;
    assert.ok(an.cn >= 20 && an.cn <= 80, `C:N ${an.cn} debe estar cerca del rango agronómico`);
  });

  // Al menos una de las alternativas alcanza el C:N óptimo (<= 40)
  const hasOptimalCN = result.recommended.some(c => c.evaluation?.analysis?.cn <= 40);
  assert.ok(hasOptimalCN, 'al menos una alternativa debe alcanzar el C:N óptimo de la especie');
});

test('co-formulación diversifica suplementos y no sobredimensiona un solo insumo', () => {
  const catalogWithByproducts = [
    ...sampleCatalog,
    { id: 'afrecho_cerveceria', name: 'Afrecho de Cervecería', role: 'suplemento_n', c: 46, n: 4.2, cn: 11, moisture: 75, cost: 1125, ph: 5.5, dig: 7, cra: 4.5 },
    { id: 'borra_cafe', name: 'Borra de Café', role: 'suplemento_medio', c: 45, n: 1.8, cn: 25, moisture: 60, cost: 300, ph: 5.0, dig: 6, cra: 3 },
    { id: 'bagazo_caña', name: 'Bagazo de Caña', role: 'base_carbono', c: 42, n: 0.7, cn: 60, moisture: 55, cost: 1200, ph: 5.5, dig: 7, cra: 4 },
  ];

  const partial = [{ id: 'aserrin_roble', p: 40 }];
  const analyzeAdapter = recipe => optimizer.analyze(recipe, 'p_ostreatus_gris', catalogWithByproducts, sampleSpp);
  const scoreAdapter = (an, ctx) => scoring.scoreRecipe(an, {
    sKey: 'p_ostreatus_gris',
    spp: sampleSpp,
    ...ctx,
  });

  const result = searchScenarios({
    recipe: partial,
    context: { sKey: 'p_ostreatus_gris', spp: sampleSpp },
    targetKey: 'p_ostreatus_gris',
    spp: sampleSpp,
    ingredients: catalogWithByproducts,
    analyze: analyzeAdapter,
    score: scoreAdapter,
    searchMode: 'hybrid',
  });

  // Las tarjetas recomendadas no deben compartir todas el mismo suplemento
  const usedSupps = new Set();
  result.recommended.forEach(c => {
    (c.addedIngredients || []).forEach(x => {
      const g = catalogWithByproducts.find(ing => ing.id === x.id);
      if (g && (g.role === 'suplemento_n' || g.role === 'suplemento_medio')) {
        usedSupps.add(x.id);
      }
    });
  });

  assert.ok(usedSupps.size >= 2, `debe explorar al menos 2 familias de suplementos, obtuvo ${[...usedSupps].join(', ')}`);

  // Afrecho de cervecería no debe exceder el tope seguro de 12%
  result.recommended.forEach(c => {
    const afrecho = (c.recipe || []).find(r => r.id === 'afrecho_cerveceria');
    if (afrecho) {
      assert.ok(afrecho.p <= 12.1, `afrecho de cervecería (${afrecho.p}%) no debe superar 12%`);
    }
  });

  // Si se ancló aserrín de roble, no debe recomendar bagazo de caña en todas las tarjetas
  const hasOnlyBagasse = result.recommended.every(c => (c.recipe || []).some(r => r.id === 'bagazo_caña'));
  assert.ok(!hasOnlyBagasse, 'no debe sustituir la base anclada con bagazo de caña indiscriminadamente');
});

test('co-formulación respeta límite de suplementación de la especie', () => {
  const partial = [{ id: 'aserrin_roble', p: 30 }, { id: 'salvado_trigo', p: 15 }];
  const analyzeAdapter = recipe => optimizer.analyze(recipe, 'p_ostreatus_gris', sampleCatalog, sampleSpp);
  const scoreAdapter = (an, ctx) => scoring.scoreRecipe(an, {
    sKey: 'p_ostreatus_gris',
    spp: sampleSpp,
    ...ctx,
  });

  const result = searchScenarios({
    recipe: partial,
    context: { sKey: 'p_ostreatus_gris', spp: sampleSpp },
    targetKey: 'p_ostreatus_gris',
    spp: sampleSpp,
    ingredients: sampleCatalog,
    analyze: analyzeAdapter,
    score: scoreAdapter,
    searchMode: 'hybrid',
  });

  assert.equal(result.isPartial, true);
  assert.equal(result.partialTotal, 45);

  result.recommended.forEach(c => {
    const an = c.evaluation?.analysis;
    assert.ok(an.suppP <= sampleSpp.p_ostreatus_gris.supplementation_max + 0.1,
      `suplementación ${an.suppP}% no debe exceder el máximo de la especie (20%)`);
  });
});

test('bridge expone archivos estáticos y contratos para co-formulación', () => {
  const bridgeSrc = fs.readFileSync(path.join(__dirname, 'perito-scenarios-bridge.js'), 'utf8');
  assert.match(bridgeSrc, /Asistente de Co-formulación/);
  assert.match(bridgeSrc, /Completar mi receta/);
  assert.match(bridgeSrc, /data-scenario-action="save-receta"/);
  assert.match(bridgeSrc, /data-scenario-action="create-batch"/);
  assert.match(bridgeSrc, /c\.addedIngredients/);
});
