'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('./inventory-entries.js');
const { consumirInventarioFIFO } = require('./inventario.js');

const lot = (id, kg, extra = {}) => ({
  id, compraId: 'c1', ingredienteId: 'aserrin', cantidadKgTotal: kg,
  precioPorKgCOP: 800, fechaIngreso: '2026-10-01', cantidadKgDisponible: kg, activo: true, ...extra,
});
const ctx = (deviceId, at, nonce) => ({ deviceId, at, nonce });

test('migración: lotes sin libro producen una apertura por lote', () => {
  const entries = E.captureChanges([], [lot('L1', 10), lot('L2', 4)], ctx('devA', '2026-10-06T10:00:00.000Z'));
  assert.equal(entries.length, 2);
  assert.ok(entries.every(e => e.kind === 'open' && E.isValidEntry(e)));
  assert.deepEqual(E.project(entries), [lot('L1', 10), lot('L2', 4)]);
});

test('sin cambios no hay asientos nuevos', () => {
  const entries = E.captureChanges([], [lot('L1', 10)], ctx('devA', 't0'));
  assert.deepEqual(E.captureChanges(entries, E.project(entries), ctx('devA', 't1')), []);
});

test('dos consumos simultáneos en dispositivos distintos se suman', () => {
  const ledger = E.captureChanges([], [lot('L1', 10)], ctx('devA', '2026-10-06T10:00:00.000Z'));
  // Ambos dispositivos parten del mismo libro.
  const onA = consumirInventarioFIFO(E.project(ledger), [{ id: 'aserrin', krKg: 2 }]);
  const onB = consumirInventarioFIFO(E.project(ledger), [{ id: 'aserrin', krKg: 3 }]);
  const fromA = E.captureChanges(ledger, onA, ctx('devA', '2026-10-06T11:00:00.000Z'));
  const fromB = E.captureChanges(ledger, onB, ctx('devB', '2026-10-06T11:00:00.000Z'));
  const merged = E.mergeEntries([...ledger, ...fromA], [...ledger, ...fromB]);
  assert.equal(E.project(merged)[0].cantidadKgDisponible, 5);
});

test('consumir más de lo que hay entre dos dispositivos queda como sobregiro', () => {
  const ledger = E.captureChanges([], [lot('L1', 4)], ctx('devA', 't0'));
  const fromA = E.captureChanges(ledger, [lot('L1', 4, { cantidadKgDisponible: 1 })], ctx('devA', 't1'));
  const fromB = E.captureChanges(ledger, [lot('L1', 4, { cantidadKgDisponible: 0 })], ctx('devB', 't1'));
  const merged = E.mergeEntries([...ledger, ...fromA], fromB);
  const [p] = E.project(merged);
  assert.equal(p.cantidadKgDisponible, 0);
  assert.equal(p.sobregiroKg, 3);
  assert.deepEqual(E.overdrawn([p]).map(l => l.id), ['L1']);
});

test('un recuento sobre un lote sobregirado deja exactamente lo contado', () => {
  let ledger = E.captureChanges([], [lot('L1', 4)], ctx('devA', 't0'));
  ledger = E.mergeEntries(ledger, [
    { schema: E.SCHEMA, id: 'd1', kind: 'delta', lotId: 'L1', at: 't1', deviceId: 'devA', kg: -3 },
    { schema: E.SCHEMA, id: 'd2', kind: 'delta', lotId: 'L1', at: 't1', deviceId: 'devB', kg: -4 },
  ]);
  const [p] = E.project(ledger);
  const recount = E.captureChanges(ledger, [{ ...p, cantidadKgDisponible: 2.5 }], ctx('devA', 't2'));
  const [after] = E.project([...ledger, ...recount]);
  assert.equal(after.cantidadKgDisponible, 2.5);
  assert.equal(after.sobregiroKg, undefined);
});

test('cambio de atributos: gana el asiento más reciente', () => {
  const ledger = E.captureChanges([], [lot('L1', 10)], ctx('devA', 't0'));
  const a = E.captureChanges(ledger, [lot('L1', 10, { precioPorKgCOP: 900 })], ctx('devA', 't2'));
  const b = E.captureChanges(ledger, [lot('L1', 10, { precioPorKgCOP: 950 })], ctx('devB', 't1'));
  assert.equal(a[0].kind, 'patch');
  const [p] = E.project(E.mergeEntries([...ledger, ...a], b));
  assert.equal(p.precioPorKgCOP, 900);
  assert.equal(p.cantidadKgDisponible, 10);
});

test('un campo eliminado se registra como null y desaparece en la proyección', () => {
  const ledger = E.captureChanges([], [lot('L1', 10, { nota: 'x' })], ctx('devA', 't0'));
  const { nota, ...sinNota } = lot('L1', 10);
  const patch = E.captureChanges(ledger, [sinNota], ctx('devA', 't1'));
  assert.deepEqual(patch[0].fields, { nota: null });
  assert.equal('nota' in E.project([...ledger, ...patch])[0], false);
});

test('asientos de un lote cuya apertura no llegó se ignoran hasta que llegue', () => {
  const delta = { schema: E.SCHEMA, id: 'd1', kind: 'delta', lotId: 'L9', at: 't1', deviceId: 'devB', kg: -1 };
  assert.deepEqual(E.project([delta]), []);
  const open = E.captureChanges([], [lot('L9', 5)], ctx('devB', 't0'));
  assert.equal(E.project([...open, delta])[0].cantidadKgDisponible, 4);
});

test('mergeEntries: el mismo id del servidor reemplaza al local y quita syncedAt', () => {
  const [local] = E.captureChanges([], [lot('L1', 10)], ctx('devA', 't0'));
  const remote = { ...local, kg: 12, deviceId: 'devB', syncedAt: { seconds: 1 } };
  const merged = E.mergeEntries([local], [remote]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].kg, 12);
  assert.equal('syncedAt' in merged[0], false);
});

test('ids de asientos: el nonce separa capturas del mismo instante', () => {
  const ledger = E.captureChanges([], [lot('L1', 10)], ctx('devA', 't0'));
  const a = E.captureChanges(ledger, [lot('L1', 10, { cantidadKgDisponible: 9 })], ctx('devA', 't1', '1'));
  const b = E.captureChanges([...ledger, ...a], [lot('L1', 10, { cantidadKgDisponible: 8 })], ctx('devA', 't1', '2'));
  assert.notEqual(a[0].id, b[0].id);
  assert.equal(E.project([...ledger, ...a, ...b])[0].cantidadKgDisponible, 8);
});

test('captureChanges exige dispositivo y fecha', () => {
  assert.throws(() => E.captureChanges([], [], { at: 't' }), /deviceId/);
  assert.throws(() => E.captureChanges([], [], { deviceId: 'd' }), /at/);
});
