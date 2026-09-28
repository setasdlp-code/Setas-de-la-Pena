'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const LP = require('./launch-plan.js');

const INGS = [
  { id: 'paja_trigo', name: 'Paja de trigo', moisture: 12, cost: 2500 },
  { id: 'salvado_trigo', name: 'Salvado de trigo', moisture: 12, cost: 5000 },
  { id: 'carbonato_calcio', name: 'Carbonato de calcio', moisture: 0, cost: 3000 },
  { id: 'borra_cafe', name: 'Borra de café', moisture: 68, cost: 1200 },
];
const lot = (id, ingredienteId, qty, fecha, extra = {}) => ({ id, ingredienteId, cantidadKgDisponible: qty, activo: true, fechaIngreso: fecha, ...extra });

test('ingrediente pequeño se planifica en kg reales, nunca como gramos leídos como kg (D2)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 98 }, { id: 'carbonato_calcio', p: 2 }],
    bags: 2, kgPerBag: 1.5, moistureTarget: 65, ingredients: INGS, inventoryLots: [],
  });
  const cal = plan.items.find(i => i.ingredientId === 'carbonato_calcio');
  // seco total = 3 × 0.35 = 1.05 kg; cal 2% = 0.021 kg con humedad 0
  assert.equal(cal.asReceivedKg, 0.021);
  assert.equal(plan.totals.dryKg, 1.05);
});

test('kg tal cual se recibe = seco / (1 − humedad del insumo)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'borra_cafe', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 60, ingredients: INGS, inventoryLots: [],
  });
  assert.equal(plan.items[0].dryKg, 0.4);
  assert.equal(plan.items[0].asReceivedKg, 1.25);   // 0.4 / 0.32
  assert.equal(plan.items[0].intrinsicWaterKg, 0.85);
  assert.equal(plan.totals.waterToAddKg, 0);         // agua total 0.6 < agua intrínseca 0.85
});

test('el plan existe aunque no haya lotes: lista completa y faltantes explícitos (D1)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], bags: 10, kgPerBag: 1.5, moistureTarget: 65,
    ingredients: INGS, inventoryLots: [],
  });
  assert.equal(plan.items.length, 2);
  assert.equal(plan.shortfalls.length, 2);
  assert.equal(plan.allocations.length, 0);
  assert.ok(plan.shortfalls.every(s => s.available === 0 && s.missing === s.needed));
});

test('FIFO por fechaIngreso con respaldo a fechaCompra', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 2, kgPerBag: 2.5, moistureTarget: 60, ingredients: INGS,
    inventoryLots: [
      lot('nuevo', 'paja_trigo', 10, '2026-08-01'),
      { id: 'viejo', ingredienteId: 'paja_trigo', cantidadKgDisponible: 1, activo: true, fechaCompra: '2026-06-01' },
      lot('inactivo', 'paja_trigo', 50, '2026-01-01', { activo: false }),
    ],
  });
  // seco 2 kg → 2 / 0.88 = 2.273 kg tal cual
  assert.deepEqual(plan.allocations.map(a => [a.lotId, a.quantity]), [['viejo', 1], ['nuevo', 1.273]]);
  assert.equal(plan.shortfalls.length, 0);
});

test('bolsas se asignan en unidades contra lotes en unidades (D4)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 6, kgPerBag: 1.5, moistureTarget: 65, ingredients: INGS,
    inventoryLots: [lot('b1', 'bolsa_unicorn_microfiltro', 4, '2026-08-01'), lot('b2', 'bolsa_unicorn_microfiltro', 100, '2026-08-02'), lot('p', 'paja_trigo', 100, '2026-08-01')],
    bagUnit: { ingredientId: 'bolsa_unicorn_microfiltro', units: 6 },
    unitIngredientIds: ['bolsa_unicorn_microfiltro'],
  });
  assert.deepEqual(plan.unitItems, [{ ingredientId: 'bolsa_unicorn_microfiltro', unidad: 'ud', units: 6 }]);
  const bagAlloc = plan.allocations.filter(a => a.unidad === 'ud');
  assert.deepEqual(bagAlloc.map(a => [a.lotId, a.quantity]), [['b1', 4], ['b2', 2]]);
});

test('lote marcado en kg nunca se usa para un ítem en unidades', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 65, ingredients: INGS,
    inventoryLots: [lot('b', 'bolsa_pp_plana', 20, '2026-08-01', { unidad: 'kg' }), lot('p', 'paja_trigo', 5, '2026-08-01')],
    bagUnit: { ingredientId: 'bolsa_pp_plana', units: 1 }, unitIngredientIds: ['bolsa_pp_plana'],
  });
  assert.equal(plan.shortfalls.find(s => s.ingredientId === 'bolsa_pp_plana').missing, 1);
});

test('spawn es un ítem másico aparte con su propia asignación', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 1, kgPerBag: 2, moistureTarget: 65, ingredients: INGS,
    inventoryLots: [lot('s', 'spawn_grano', 1, '2026-08-01'), lot('p', 'paja_trigo', 5, '2026-08-01')],
    spawn: { ingredientId: 'spawn_grano', kg: 0.16 },
  });
  assert.deepEqual(plan.spawnItem, { ingredientId: 'spawn_grano', unidad: 'kg', asReceivedKg: 0.16 });
  assert.ok(plan.allocations.some(a => a.lotId === 's' && a.quantity === 0.16));
});

test('humedad medida por insumo y redondeo de báscula se respetan', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 65, ingredients: INGS, inventoryLots: [],
    moistureOverrides: { paja_trigo: 20 }, scaleG: 5,
  });
  // seco 0.35 / 0.80 = 0.4375 kg → báscula de 5 g → 0.44 kg
  assert.equal(plan.items[0].asReceivedKg, 0.44);
});

test('entradas inválidas fallan con mensaje claro', () => {
  assert.throws(() => LP.buildLaunchPlan({ recipe: [{ id: 'x', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 65, ingredients: INGS }), /Ingrediente desconocido: x/);
  assert.throws(() => LP.buildLaunchPlan({ recipe: [], bags: 0, kgPerBag: 1, moistureTarget: 65, ingredients: INGS }), /bags/);
  assert.throws(() => LP.buildLaunchPlan({ recipe: [], bags: 1, kgPerBag: 1, moistureTarget: 100, ingredients: INGS }), /moistureTarget/);
});

test('buildLoteRecords: sin analysis ni treatmentName usa los valores por defecto', () => {
  const form = { codigo: 'SDP-260913-OST-R02', especie: 'Orellana Gris', especieCientifico: 'Pleurotus ostreatus', cepa: '', fechaMezcla: '2026-09-13', fechaInoculacion: '2026-09-13', numBolsas: 2, pesoHumedo: 1.2, humedad: 60, sala: 'martha_02', operador: 'Op', notas: '' };
  const plan = { allocations: [], shortfalls: [{ ingredientId: 'paja_trigo', needed: 1, available: 0, missing: 1, unidad: 'kg' }] };
  const { lote, bolsas } = LP.buildLoteRecords({ form, plan, sKey: 'p_ostreatus_gris', now: 1_700_000_100_000 });
  assert.equal(lote.spawnPct, 8);
  assert.equal(lote.tratamiento, 'Pasteurización Térmica');
  assert.equal(lote.costoIngKg, 0);
  assert.equal(lote.recipeRef.cn, '—');
  assert.deepEqual(lote.ingredientLots, []);
  assert.equal(bolsas.length, 2);
});

test('unidadDe: explícita gana; si falta, ids de contenedores son ud', () => {
  assert.equal(LP.unidadDe({ ingredienteId: 'bolsa_pp_plana' }, ['bolsa_pp_plana']), 'ud');
  assert.equal(LP.unidadDe({ ingredienteId: 'bolsa_pp_plana', unidad: 'kg' }, ['bolsa_pp_plana']), 'kg');
  assert.equal(LP.unidadDe({ ingredienteId: 'paja_trigo' }, []), 'kg');
});
