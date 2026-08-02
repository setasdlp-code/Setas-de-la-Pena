import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const appDir = resolve(import.meta.dirname, '..');
const source = readFileSync(resolve(appDir, 'recipe-recommender.js'), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(source, context, { filename: 'recipe-recommender.js' });
const { recommendRecipes } = context.window.RecipeTools;

const ingredients = [
  { id: 'paja', name: 'Paja', role: 'base_carbono', c: 45, n: 0.5, cost: 800 },
  { id: 'salvado', name: 'Salvado', role: 'suplemento_n', c: 40, n: 3, cost: 2_000 },
  { id: 'cascarilla', name: 'Cascarilla', role: 'aireador', c: 42, n: 0.7, cost: 1_200 }
];

const species = {
  ostreatus: {
    name: 'Orellana Gris',
    scientific: 'Pleurotus ostreatus',
    cn_optimal: { min: 25, ideal: 35, max: 50 },
    n_optimal: { min: 0.8, ideal: 1.4, max: 2 },
    moisture: { ideal: 67 },
    ph_optimal: { min: 6, max: 7.5 },
    temp_fruit: '12–22°C'
  }
};

test('genera una receta determinista con base, suplemento y aireador', () => {
  const results = recommendRecipes(
    { paja: 100, salvado: 50, cascarilla: 50 },
    'ostreatus',
    ingredients,
    species
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].ingredients.length, 3);
  assert.equal(
    results[0].ingredients.reduce((sum, item) => sum + item.pct, 0),
    100
  );
  assert.ok(Number.isFinite(results[0].cn));
  assert.ok(Number.isFinite(results[0].costPerKg));
});

test('no recomienda una receta cuando falta una base de carbono', () => {
  const results = recommendRecipes(
    { salvado: 50, cascarilla: 50 },
    'ostreatus',
    ingredients,
    species
  );

  assert.deepEqual(Array.from(results), []);
});

test('ignora ingredientes con inventario cero', () => {
  const results = recommendRecipes(
    { paja: 100, salvado: 0, cascarilla: 0 },
    'ostreatus',
    ingredients,
    species
  );

  assert.equal(results.length, 1);
  assert.deepEqual(
    Array.from(results[0].ingredients, item => item.id),
    ['paja']
  );
});
