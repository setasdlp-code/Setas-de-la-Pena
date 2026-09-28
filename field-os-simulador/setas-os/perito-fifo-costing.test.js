'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { allocateFifo, calculateFifoRecipeCost } = require('./perito-scenarios.js');

test('allocateFifo consume lotes estrictamente por orden de antigüedad (FIFO)', () => {
  const lots = [
    { id: 'lot_recent', ingredienteId: 'salvado', fechaIngreso: '2026-03-01', cantidadKgDisponible: 10, precioPorKgCOP: 2000, activo: true },
    { id: 'lot_oldest', ingredienteId: 'salvado', fechaIngreso: '2026-01-01', cantidadKgDisponible: 4, precioPorKgCOP: 1200, activo: true },
    { id: 'lot_middle', ingredienteId: 'salvado', fechaIngreso: '2026-02-01', cantidadKgDisponible: 5, precioPorKgCOP: 1500, activo: true },
  ];

  // Pedimos 6 kg: debe tomar 4 kg de lot_oldest (@1200) y 2 kg de lot_middle (@1500)
  const res = allocateFifo(lots, 'salvado', 6);
  assert.equal(res.missingKg, 0);
  assert.equal(res.allocations.length, 2);
  assert.equal(res.allocations[0].lotId, 'lot_oldest');
  assert.equal(res.allocations[0].quantity, 4);
  assert.equal(res.allocations[1].lotId, 'lot_middle');
  assert.equal(res.allocations[1].quantity, 2);
  // Costo: 4*1200 + 2*1500 = 4800 + 3000 = 7800
  assert.equal(res.physicalCostCOP, 7800);
});

test('allocateFifo reporta missingKg cuando el stock es insuficiente', () => {
  const lots = [
    { id: 'lot_1', ingredienteId: 'salvado', fechaIngreso: '2026-01-01', cantidadKgDisponible: 3, precioPorKgCOP: 1000, activo: true },
  ];
  const res = allocateFifo(lots, 'salvado', 5);
  assert.equal(res.allocations.length, 1);
  assert.equal(res.allocations[0].quantity, 3);
  assert.equal(res.missingKg, 2);
  assert.equal(res.physicalCostCOP, 3000);
});

test('calculateFifoRecipeCost: cobertura física total declara proveniencia physical y realCost conocido', () => {
  const recipe = [{ id: 'aserrin', p: 80 }, { id: 'salvado', p: 20 }];
  const ingredients = [
    { id: 'aserrin', cost: 500, moisture: 10 },
    { id: 'salvado', cost: 1200, moisture: 10 },
  ];
  const lots = [
    { id: 'lot_a', ingredienteId: 'aserrin', fechaIngreso: '2026-01-01', cantidadKgDisponible: 100, precioPorKgCOP: 400, activo: true },
    { id: 'lot_s', ingredienteId: 'salvado', fechaIngreso: '2026-01-01', cantidadKgDisponible: 100, precioPorKgCOP: 1100, activo: true },
  ];

  const costResult = calculateFifoRecipeCost(recipe, ingredients, lots, { batchDryKg: 10 });
  assert.equal(costResult.costProvenance, 'physical');
  assert.equal(costResult.realCostKnown, true);
  assert.notEqual(costResult.realCost, null);
  assert.equal(costResult.procurementEstimate, 0);
  assert.ok(costResult.physicalCost > 0);
  assert.equal(costResult.stockCoveragePct, 100);
});

test('calculateFifoRecipeCost: cobertura parcial declara proveniencia mixed y NUNCA etiqueta costo híbrido como realCost', () => {
  const recipe = [{ id: 'aserrin', p: 80 }, { id: 'salvado', p: 20 }];
  const ingredients = [
    { id: 'aserrin', cost: 500, moisture: 10 },
    { id: 'salvado', cost: 1200, moisture: 10 },
  ];
  // Solo hay stock de aserrín, no de salvado
  const lots = [
    { id: 'lot_a', ingredienteId: 'aserrin', fechaIngreso: '2026-01-01', cantidadKgDisponible: 100, precioPorKgCOP: 400, activo: true },
  ];

  const costResult = calculateFifoRecipeCost(recipe, ingredients, lots, { batchDryKg: 10 });
  assert.equal(costResult.costProvenance, 'mixed');
  assert.equal(costResult.realCostKnown, false);
  // Regla P0: NUNCA etiquetar un número híbrido como realCost
  assert.equal(costResult.realCost, null);
  assert.ok(costResult.physicalCost > 0);
  assert.ok(costResult.procurementEstimate > 0);
  assert.ok(costResult.stockCoveragePct > 0 && costResult.stockCoveragePct < 100);
});

test('calculateFifoRecipeCost: sin bodega declara proveniencia catalog y realCost null', () => {
  const recipe = [{ id: 'aserrin', p: 80 }, { id: 'salvado', p: 20 }];
  const ingredients = [
    { id: 'aserrin', cost: 500, moisture: 10 },
    { id: 'salvado', cost: 1200, moisture: 10 },
  ];

  const costResult = calculateFifoRecipeCost(recipe, ingredients, [], { batchDryKg: 10 });
  assert.equal(costResult.costProvenance, 'catalog');
  assert.equal(costResult.realCostKnown, false);
  assert.equal(costResult.realCost, null);
  assert.equal(costResult.physicalCost, 0);
  assert.ok(costResult.procurementEstimate > 0);
  assert.equal(costResult.stockCoveragePct, 0);
});
