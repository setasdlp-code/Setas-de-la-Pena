'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendRecipes, tryBuildRecipe } = require('./recipe-recommender.js');

const MOCK_SPP = {
  p_ostreatus: {
    name: 'Orellana',
    scientific: 'Pleurotus ostreatus',
    cn_optimal: { min: 25, max: 40, ideal: 30 },
    supplementation_max: 20,
    moisture: { min: 60, max: 70, ideal: 65 },
    temp_fruit: '18–24°C'
  },
  shiitake: {
    name: 'Shiitake',
    scientific: 'Lentinula edodes',
    cn_optimal: { min: 30, max: 45, ideal: 35 },
    supplementation_max: 20,
    moisture: { min: 55, max: 65, ideal: 60 },
    temp_fruit: '16–20°C'
  }
};

const MOCK_INGS = [
  { id: 'aserrin_roble', name: 'Aserrín de Roble', role: 'base_carbono', c: 50, n: 0.1, moisture: 12, cost: 400, cs: ['p_ostreatus', 'shiitake'] },
  { id: 'aserrin_eucalipto', name: 'Aserrín de Eucalipto', role: 'base_carbono', c: 48, n: 0.12, moisture: 12, cost: 350, cs: ['p_ostreatus'] },
  { id: 'salvado_trigo', name: 'Salvado de Trigo', role: 'suplemento_n', c: 45, n: 2.4, moisture: 10, cost: 1200, cs: ['p_ostreatus', 'shiitake'] },
  { id: 'cascarilla_arroz', name: 'Cascarilla de Arroz', role: 'aireador', c: 40, n: 0.3, moisture: 8, cost: 300, cs: ['p_ostreatus', 'shiitake'] }
];

test('tryBuildRecipe filtra ingredientes incompatibles biológicamente con la especie', () => {
  const available = {
    aserrin_eucalipto: 100, // incompatible con shiitake en MOCK_INGS
    salvado_trigo: 50
  };
  const forShiitake = tryBuildRecipe(available, MOCK_SPP.shiitake, MOCK_INGS, 'shiitake');
  assert.equal(forShiitake, null, 'No debe construir receta si la única base disponible es incompatible con la especie');

  const forOrellana = tryBuildRecipe(available, MOCK_SPP.p_ostreatus, MOCK_INGS, 'p_ostreatus');
  assert.ok(forOrellana, 'Debe construir receta para Orellana ya que eucalipto es compatible');
  assert.ok(forOrellana.ingredients.length >= 2);
  assert.ok(forOrellana.cn > 0);
});

test('recommendRecipes ordena candidatos por score decreciente respetando balance y C:N', () => {
  const available = {
    aserrin_roble: 100,
    salvado_trigo: 40,
    cascarilla_arroz: 20
  };
  const recommendations = recommendRecipes(available, null, MOCK_INGS, MOCK_SPP);
  assert.ok(Array.isArray(recommendations));
  assert.ok(recommendations.length > 0);
  for (let i = 1; i < recommendations.length; i++) {
    assert.ok(recommendations[i - 1].score >= recommendations[i].score, 'Las recomendaciones deben estar ordenadas por score desc');
  }
});
