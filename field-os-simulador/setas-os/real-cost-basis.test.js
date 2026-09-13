'use strict';
// I6 (revisión final SP1): el costo real de bodega se compara con an.cost, que
// es COP/kg de mezcla SECA — debe calcularse en la misma base (÷(1−m)).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');

const X = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'precioPonderado', 'realCostPerKgSeco']);

const ings = [
  { id: 'paja', cost: 1000, moisture: 60, cn: 80, c: 45, n: 0.6, ph: 7, dig: 5, cra: 3, role: 'base_carbono', cs: ['p_eryngii'] },
  { id: 'salvado', cost: 2000, moisture: 20, cn: 18, c: 45, n: 2.5, ph: 6.5, dig: 7, cra: 3, role: 'suplemento_n', cs: ['p_eryngii'] },
];
const recipe = [{ id: 'paja', p: 50 }, { id: 'salvado', p: 50 }];
const lote = (ingredienteId, precioPorKgCOP, kg = 10) => ({ activo: true, ingredienteId, precioPorKgCOP, cantidadKgDisponible: kg });

test('realCostPerKgSeco convierte el precio de bodega (tal cual se recibe) a base seca', () => {
  // paja: 1000/(1−0.60)=2500 × 50% = 1250 ; salvado: 2000/(1−0.20)=2500 × 50% = 1250
  assert.equal(X.realCostPerKgSeco(recipe, [lote('paja', 1000), lote('salvado', 2000)], ings), 2500);
});

test('con precios de bodega iguales al catálogo coincide con an.cost (misma base)', () => {
  const an = X.analyze(recipe, 'p_eryngii', ings, X.SPP);
  assert.equal(X.realCostPerKgSeco(recipe, [lote('paja', 1000), lote('salvado', 2000)], ings), Math.round(an.cost));
});

test('ingredientes sin lote usan el costo de catálogo, también en base seca', () => {
  // paja con lote a 800: 800/0.4=2000×0.5=1000 ; salvado catálogo 2000/0.8=2500×0.5=1250
  assert.equal(X.realCostPerKgSeco(recipe, [lote('paja', 800)], ings), 2250);
});

test('sin ningún precio de bodega devuelve null; receta vacía también', () => {
  assert.equal(X.realCostPerKgSeco(recipe, [], ings), null);
  assert.equal(X.realCostPerKgSeco([], [lote('paja', 800)], ings), null);
});
