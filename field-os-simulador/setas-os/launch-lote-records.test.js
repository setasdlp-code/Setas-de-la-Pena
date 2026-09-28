'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const LP = require('./launch-plan.js');

const form = { codigo: 'SDP-260913-ERY-R01', especie: 'Seta de Cardo', especieCientifico: 'Pleurotus eryngii', cepa: '', fechaMezcla: '2026-09-13', fechaInoculacion: '2026-09-13', numBolsas: 3, pesoHumedo: 1.5, humedad: 65, sala: 'martha_01', operador: 'Op', notas: '' };
const plan = { allocations: [{ ingredientId: 'paja_trigo', lotId: 'L1', quantity: 1.2, unidad: 'kg' }], shortfalls: [] };

test('buildLoteRecords produce el lote de Bitácora con trazabilidad de lotes de insumo', () => {
  const { lote, bolsas } = LP.buildLoteRecords({
    form, plan, analysis: { cn: 30.04, eb: 81.6, cost: 5123.4, dynSpawn: 6 }, treatmentName: 'Esterilización en Autoclave',
    recipe: [{ id: 'paja_trigo', p: 100 }], sKey: 'p_eryngii', recipeName: 'Prueba', score: 77, now: 1_700_000_000_000,
  });
  assert.equal(lote.id, 'BIT_1700000000000');
  assert.equal(lote.codigo, form.codigo);
  assert.equal(lote.numBolsas, 3);
  assert.equal(lote.peseSeco, 1.575);          // 3 × 1.5 × (1 − 0.65)
  assert.equal(lote.tratamiento, 'Esterilización en Autoclave');
  assert.equal(lote.estado, 'incubacion');
  assert.equal(lote.veredicto, '');
  assert.deepEqual(lote.ingredientLots, plan.allocations);
  assert.notEqual(lote.ingredientLots, plan.allocations);
  assert.equal(lote.recipeRef.sKey, 'p_eryngii');
  assert.equal(bolsas.length, 3);
  assert.ok(bolsas.every(b => b.loteId === lote.id && b.estado === 'sana' && b.pesoInicial === 1.5));
  assert.equal(new Set(bolsas.map(b => b.id)).size, 3);
});
