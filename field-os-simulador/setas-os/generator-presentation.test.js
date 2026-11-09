'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('./generator-presentation.js');

const R = (...pairs) => pairs.map(([id, p]) => ({ id, p }));

test('recipeL1Pct suma diferencias absolutas en pp', () => {
  assert.equal(P.recipeL1Pct(R(['a', 46.19], ['b', 30.82], ['c', 20], ['d', 2.99]),
                             R(['a', 46.2], ['b', 30.8], ['c', 20], ['d', 3])), 0.04);
  assert.equal(P.recipeL1Pct(R(['a', 50], ['b', 50]), R(['a', 50], ['c', 50])), 100);
});

test('collapseNearDuplicates colapsa en ≤1 pp y conserva el primero', () => {
  const rows = [
    { recipe: R(['a', 46.19], ['b', 53.81]), score: 78 },
    { recipe: R(['a', 46.2], ['b', 53.8]), score: 78 },
    { recipe: R(['a', 45.7], ['b', 54.3]), score: 75 },   // L1 = 0.98 respecto al primero
    { recipe: R(['a', 45.69], ['b', 54.31]), score: 74 }, // L1 = 1.0 respecto al primero
    { recipe: R(['a', 45.6], ['b', 54.4]), score: 73 },   // L1 = 1.18 → se queda
  ];
  const out = P.collapseNearDuplicates(rows);
  assert.deepEqual(out.map(r => r.score), [78, 73]);
});

test('collapseNearDuplicates: 1.01 pp no colapsa', () => {
  const rows = [{ recipe: R(['a', 50], ['b', 50]) }, { recipe: R(['a', 49.495], ['b', 50.505]) }];
  assert.equal(P.collapseNearDuplicates(rows).length, 2);
});

test('isViableRow excluye critical, hold y filas sin status', () => {
  assert.equal(P.isViableRow({ status: 'good', safetyStatus: 'approved' }), true);
  assert.equal(P.isViableRow({ status: 'critical', safetyStatus: 'approved' }), false);
  assert.equal(P.isViableRow({ status: 'good', safetyStatus: 'hold' }), false);
  assert.equal(P.isViableRow({}), false);
});

test('partitionRows conserva el orden', () => {
  const rows = [{ status: 'critical' }, { status: 'good' }, { status: 'excellent' }];
  const { viable, blocked } = P.partitionRows(rows);
  assert.deepEqual(viable.map(r => r.status), ['good', 'excellent']);
  assert.equal(blocked.length, 1);
});

test('unpricedIds: todos los lotes a $0 cuenta; mezcla con precio no cuenta', () => {
  const lots = [
    { ingredienteId: 'eucalipto', precioPorKgCOP: 0, cantidadKgDisponible: 2, activo: true },
    { ingredienteId: 'avena', precioPorKgCOP: 0, cantidadKgDisponible: 5, activo: true },
    { ingredienteId: 'avena', precioPorKgCOP: 2100, cantidadKgDisponible: 20, activo: true },
    { ingredienteId: 'trigo', precioPorKgCOP: 0, cantidadKgDisponible: 0, activo: true },
  ];
  assert.deepEqual(P.unpricedIds(R(['eucalipto', 70], ['avena', 20], ['trigo', 10]), lots), ['eucalipto']);
});

test('explainEmptySearch prioriza base, luego suplemento, luego semillas', () => {
  assert.equal(P.explainEmptySearch({ bases: 0, supps: 2 }, 'Producción').code, 'no_base');
  assert.equal(P.explainEmptySearch({ bases: 1, supps: 0 }, 'Producción').code, 'no_supplement');
  const e = P.explainEmptySearch({ bases: 10, supps: 14, structuralGenerated: 0, rejectionReasons: [], suppLimit: 8 }, 'Rescate');
  assert.equal(e.code, 'no_structural_seed');
  assert.match(e.message, /8 ?%/);
  assert.match(e.message, /Rescate/);
  assert.equal(P.explainEmptySearch({ bases: 3, supps: 3, structuralGenerated: 40, rejectionReasons: [{ code: 'maxSupp', count: 9 }] }, 'X'), null);
});

test('generatorHeadline distingue viables de bloqueados', () => {
  assert.equal(P.generatorHeadline({ viable: 0, blocked: 12, profileLabel: 'Producción' }),
    'Sin Escenario viable para Producción: las 12 combinaciones encontradas están marcadas «No ejecutar».');
  assert.equal(P.generatorHeadline({ viable: 1, blocked: 11, profileLabel: 'Producción' }),
    '1 Escenario viable para Producción · 11 descartados («No ejecutar»).');
  assert.equal(P.generatorHeadline({ viable: 5, blocked: 0, profileLabel: 'Rescate' }),
    '5 Escenarios viables para Rescate.');
});
