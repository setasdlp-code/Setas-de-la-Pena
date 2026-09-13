'use strict';
// I4/I5 (revisión final SP1): entradas del plan de lanzamiento compartidas por
// "Lanzar Lote" y "Ejecutar Lote" — humedad elegida y spawn descontado.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const LP = require('./launch-plan.js');

const X = extractConsts(['launchMoisture', 'launchSpawn']);

test('launchMoisture: humedad editada a mano manda sobre el objetivo resuelto (I4)', () => {
  assert.equal(X.launchMoisture({ touched: true, manual: 70, target: 65 }), 70);
});

test('launchMoisture: sin edición manual usa el objetivo resuelto, luego el valor del input, luego 65', () => {
  assert.equal(X.launchMoisture({ touched: false, manual: 67, target: 65 }), 65);
  assert.equal(X.launchMoisture({ touched: false, manual: 67, target: null }), 67);
  assert.equal(X.launchMoisture({ touched: false, manual: undefined, target: undefined }), 65);
});

test('launchMoisture cambia de verdad el plan: más humedad → menos materia seca por bolsa', () => {
  const ingredients = [{ id: 'paja_trigo', name: 'Paja', moisture: 10, cost: 1000 }];
  const base = { recipe: [{ id: 'paja_trigo', p: 100 }], bags: 10, kgPerBag: 1.5, ingredients };
  const manual = LP.buildLaunchPlan({ ...base, moistureTarget: X.launchMoisture({ touched: true, manual: 70, target: 65 }) });
  const target = LP.buildLaunchPlan({ ...base, moistureTarget: X.launchMoisture({ touched: false, manual: 70, target: 65 }) });
  assert.equal(manual.items[0].dryKg, 4.5);   // 15 kg × (1 − 0.70)
  assert.equal(target.items[0].dryKg, 5.25);  // 15 kg × (1 − 0.65)
});

test('launchSpawn + buildLaunchPlan: el spawn en bodega se asigna y descuenta (I5)', () => {
  const spawn = X.launchSpawn(4, 1.5, 5);
  assert.equal(spawn.ingredientId, 'spawn_grano');
  assert.ok(Math.abs(spawn.kg - 0.3) < 1e-9);  // 4 × 1.5 kg × 5%
  const lot = (id, ingredienteId, kg) => ({ id, ingredienteId, cantidadKgDisponible: kg, activo: true, fechaIngreso: '2026-08-01' });
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 4, kgPerBag: 1.5, moistureTarget: 65,
    ingredients: [{ id: 'paja_trigo', name: 'Paja', moisture: 10, cost: 1000 }],
    inventoryLots: [lot('S1', 'spawn_grano', 2), lot('P1', 'paja_trigo', 10)],
    spawn,
  });
  assert.deepEqual(plan.spawnItem, { ingredientId: 'spawn_grano', unidad: 'kg', asReceivedKg: 0.3 });
  assert.deepEqual(plan.allocations.filter(a => a.ingredientId === 'spawn_grano').map(a => [a.lotId, a.quantity]), [['S1', 0.3]]);
  assert.equal(plan.shortfalls.length, 0);
});

test('launchSpawn: sin tasa de spawn no hay ítem', () => {
  assert.equal(X.launchSpawn(4, 1.5, 0), null);
  assert.equal(X.launchSpawn(4, 1.5, undefined), null);
});

// ── m2: el aviso de éxito no afirma que todo se descontó si hubo faltantes. ──
const X2 = extractConsts(['launchDiscountSummary']);
test('launchDiscountSummary: sin faltantes afirma el descuento completo', () => {
  assert.equal(X2.launchDiscountSummary({ shortfalls: [] }), 'Las materias primas fueron descontadas de Bodega.');
  assert.equal(X2.launchDiscountSummary(null), 'Las materias primas fueron descontadas de Bodega.');
});
test('launchDiscountSummary: con faltantes dice que se descontó lo disponible y lista lo que faltó', () => {
  const plan = { shortfalls: [
    { ingredientId: 'salvado_trigo', missing: 1.25, unidad: 'kg' },
    { ingredientId: 'bolsa_pp_plana', missing: 3, unidad: 'ud' },
  ] };
  const ings = [{ id: 'salvado_trigo', name: 'Salvado de trigo' }];
  assert.equal(X2.launchDiscountSummary(plan, ings),
    'Se descontó lo disponible; faltaron: Salvado de trigo (1.25 kg), bolsa_pp_plana (3 ud).');
});

// ── m3: el borde del input "Humedad obj." se evalúa contra el rango resuelto. ──
const X3 = extractConsts(['moistureInTargetRange']);
test('moistureInTargetRange: usa min/max del objetivo resuelto cuando existen', () => {
  const m = { min: 63, max: 68, ideal: 65 };
  assert.equal(X3.moistureInTargetRange(65, m), true);
  assert.equal(X3.moistureInTargetRange(63, m), true);
  assert.equal(X3.moistureInTargetRange(62, m), false);
  assert.equal(X3.moistureInTargetRange(70, m), false);   // antes (≥67) salía en verde
});
test('moistureInTargetRange: sin rango (heredado solo con ideal) conserva el umbral ≥67', () => {
  assert.equal(X3.moistureInTargetRange(67, { ideal: 63, min: null, max: null }), true);
  assert.equal(X3.moistureInTargetRange(65, { ideal: 63, min: null, max: null }), false);
  assert.equal(X3.moistureInTargetRange(68, null), true);
});
