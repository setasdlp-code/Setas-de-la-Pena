'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const IC = require('./inventory-consumption.js');

const plan = {
  allocations: [
    { ingredientId: 'paja_trigo', lotId: 'L1', quantity: 1, unidad: 'kg' },
    { ingredientId: 'paja_trigo', lotId: 'L2', quantity: 0.5, unidad: 'kg' },
    { ingredientId: 'bolsa_pp_plana', lotId: 'B1', quantity: 2, unidad: 'ud' },
  ],
  shortfalls: [{ ingredientId: 'salvado_trigo', needed: 1, available: 0, missing: 1, unidad: 'kg' }],
};
const lotes = [
  { id: 'L1', ingredienteId: 'paja_trigo', cantidadKgDisponible: 1, activo: true },
  { id: 'L2', ingredienteId: 'paja_trigo', cantidadKgDisponible: 3, activo: true },
  { id: 'B1', ingredienteId: 'bolsa_pp_plana', cantidadKgDisponible: 20, activo: true },
  { id: 'X', ingredienteId: 'otro', cantidadKgDisponible: 9, activo: true },
];

test('buildConsumptionOp usa el loteId como identidad determinista', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', codigo: 'SDP-1', plan, createdAt: 1000 });
  assert.equal(op.opId, 'BIT_1');
  assert.equal(op.status, 'pending');
  assert.equal(op.attempts, 0);
  assert.equal(op.nextAttemptAt, 1000);
  assert.notEqual(op.allocations, plan.allocations);
  assert.throws(() => IC.buildConsumptionOp({ plan, createdAt: 1 }), /loteId/);
});

test('applyLocal descuenta por lote, desactiva agotados y no muta la entrada', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', codigo: 'SDP-1', plan, createdAt: 1000 });
  const { lotes: out, movimientos } = IC.applyLocal(lotes, op, { fecha: '2026-09-13', nota: 'Lote SDP-1' });
  assert.equal(out.find(l => l.id === 'L1').cantidadKgDisponible, 0);
  assert.equal(out.find(l => l.id === 'L1').activo, false);
  assert.equal(out.find(l => l.id === 'L2').cantidadKgDisponible, 2.5);
  assert.equal(out.find(l => l.id === 'B1').cantidadKgDisponible, 18);
  assert.equal(out.find(l => l.id === 'X'), lotes[3]);
  assert.equal(lotes[0].cantidadKgDisponible, 1);
  assert.deepEqual(movimientos.map(m => [m.id, m.loteInventarioId, m.kgMovidos, m.unidad]), [
    ['mov_lote_BIT_1_0', 'L1', 1, 'kg'], ['mov_lote_BIT_1_1', 'L2', 0.5, 'kg'], ['mov_lote_BIT_1_2', 'B1', 2, 'ud']]);
  assert.ok(movimientos.every(m => m.tipo === 'consumo_lote' && m.loteNum === 'SDP-1'));
});

test('enqueue es idempotente por opId', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', plan, createdAt: 1 });
  const a = IC.enqueue([], op);
  assert.equal(a.added, true);
  const b = IC.enqueue(a.queue, { ...op });
  assert.equal(b.added, false);
  assert.equal(b.queue.length, 1);
});

test('toRecord deja fuera el estado local de la cola', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', codigo: 'C', plan, createdAt: 5 });
  assert.deepEqual(Object.keys(IC.toRecord(op)).sort(), ['allocations', 'codigo', 'createdAt', 'loteId', 'opId', 'schema', 'shortfalls']);
});

test('syncDue marca synced al persistir y failed con backoff al fallar', async () => {
  const ok = IC.buildConsumptionOp({ loteId: 'OK', plan, createdAt: 0 });
  const bad = IC.buildConsumptionOp({ loteId: 'BAD', plan, createdAt: 0 });
  const seen = [];
  const queue = await IC.syncDue({
    queue: [ok, bad], now: 10_000,
    persist: async rec => { seen.push(rec.opId); if (rec.opId === 'BAD') throw new Error('offline'); },
  });
  assert.deepEqual(seen, ['OK', 'BAD']);
  assert.equal(queue.find(o => o.opId === 'OK').status, 'synced');
  const b = queue.find(o => o.opId === 'BAD');
  assert.equal(b.status, 'failed');
  assert.equal(b.attempts, 1);
  assert.equal(b.lastError, 'offline');
  assert.equal(b.nextAttemptAt, 10_000 + IC.backoffMs(1));
});

test('syncDue no reintenta antes de nextAttemptAt ni reenvía synced', async () => {
  const q0 = [
    { ...IC.buildConsumptionOp({ loteId: 'WAIT', plan, createdAt: 0 }), status: 'failed', attempts: 1, nextAttemptAt: 50_000 },
    { ...IC.buildConsumptionOp({ loteId: 'DONE', plan, createdAt: 0 }), status: 'synced' },
  ];
  let calls = 0;
  await IC.syncDue({ queue: q0, now: 10_000, persist: async () => { calls++; } });
  assert.equal(calls, 0);
});

test('backoff exponencial con tope de 1 h', () => {
  assert.equal(IC.backoffMs(1), 30_000);
  assert.equal(IC.backoffMs(2), 60_000);
  assert.equal(IC.backoffMs(20), 3_600_000);
});

test('isPendingForLote y failuresForBanner', () => {
  const q = [
    { ...IC.buildConsumptionOp({ loteId: 'A', plan, createdAt: 0 }) },
    { ...IC.buildConsumptionOp({ loteId: 'B', plan, createdAt: 0 }), status: 'failed', attempts: 3 },
    { ...IC.buildConsumptionOp({ loteId: 'C', plan, createdAt: 0 }), status: 'synced' },
  ];
  assert.equal(IC.isPendingForLote(q, 'A'), true);
  assert.equal(IC.isPendingForLote(q, 'C'), false);
  assert.deepEqual(IC.failuresForBanner(q).map(o => o.opId), ['B']);
});

// ── I2: la cola re-leída tras el await de syncDue manda; syncDue solo aporta
// el resultado de sincronización de las ops que procesó. ──
test('mergeSyncResults: una op encolada durante la sincronización sobrevive', () => {
  const a = IC.buildConsumptionOp({ loteId: 'A', plan, createdAt: 0 });
  const snapshot = [a];
  const synced = [{ ...a, status: 'synced', syncedAt: 5_000, lastError: null }];
  const nueva = IC.buildConsumptionOp({ loteId: 'NUEVA', plan, createdAt: 4_000 });
  const latest = [a, nueva];
  const merged = IC.mergeSyncResults(latest, synced);
  assert.deepEqual(merged.map(o => o.opId), ['A', 'NUEVA']);
  assert.deepEqual(merged[1], nueva);
  assert.equal(snapshot.length, 1);
});

test('mergeSyncResults: aplica status/attempts/lastError/nextAttemptAt/syncedAt por opId', () => {
  const ok = IC.buildConsumptionOp({ loteId: 'OK', plan, createdAt: 0 });
  const bad = IC.buildConsumptionOp({ loteId: 'BAD', plan, createdAt: 0 });
  const synced = [
    { ...ok, status: 'synced', syncedAt: 9_000, lastError: null },
    { ...bad, status: 'failed', attempts: 1, lastError: 'offline', nextAttemptAt: 40_000 },
  ];
  const merged = IC.mergeSyncResults([bad, ok], synced);
  assert.deepEqual(merged.map(o => o.opId), ['BAD', 'OK']);
  const o = merged.find(x => x.opId === 'OK');
  assert.equal(o.status, 'synced');
  assert.equal(o.syncedAt, 9_000);
  assert.equal(o.lastError, null);
  const b = merged.find(x => x.opId === 'BAD');
  assert.equal(b.status, 'failed');
  assert.equal(b.attempts, 1);
  assert.equal(b.lastError, 'offline');
  assert.equal(b.nextAttemptAt, 40_000);
  assert.equal('syncedAt' in b, false);
  assert.deepEqual(b.allocations, bad.allocations);
});

test('mergeSyncResults: una op ausente de la cola más reciente no se resucita', () => {
  const a = IC.buildConsumptionOp({ loteId: 'A', plan, createdAt: 0 });
  const merged = IC.mergeSyncResults([], [{ ...a, status: 'synced', syncedAt: 1 }]);
  assert.deepEqual(merged, []);
});

test('syncDue + mergeSyncResults: una op encolada mientras persist está en vuelo no se pierde', async () => {
  let store = [IC.buildConsumptionOp({ loteId: 'A', plan, createdAt: 0 })];
  const synced = await IC.syncDue({
    queue: store, now: 1_000,
    persist: async () => { store = IC.enqueue(store, IC.buildConsumptionOp({ loteId: 'B', plan, createdAt: 500 })).queue; },
  });
  store = IC.mergeSyncResults(store, synced);
  assert.deepEqual(store.map(o => [o.opId, o.status]), [['A', 'synced'], ['B', 'pending']]);
});
