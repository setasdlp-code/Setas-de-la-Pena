'use strict';

// Consumo de inventario por lote: una operación idempotente (identidad = loteId).
// La bodega de registro es localStorage sdp_lotes (no existe espejo en Firestore);
// el servidor guarda un registro append-only en inventory_consumptions/{loteId}.
(function initInventoryConsumption() {
const QUEUE_KEY = 'sdp_inventory_ops';
const SCHEMA = 'setas.inventory-consumption.v1';
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 3_600_000;
const BANNER_AFTER_FAILURES = 3;
const round3 = x => Math.round(x * 1000) / 1000;

function buildConsumptionOp({ loteId, codigo = null, plan, createdAt }) {
  if (!loteId) throw new Error('loteId requerido para la operación de consumo');
  return {
    schema: SCHEMA, opId: loteId, loteId, codigo,
    allocations: (plan.allocations || []).map(a => ({ ...a })),
    shortfalls: (plan.shortfalls || []).map(s => ({ ...s })),
    createdAt, status: 'pending', attempts: 0, lastError: null, nextAttemptAt: createdAt,
  };
}

function enqueue(queue = [], op) {
  if (queue.some(o => o.opId === op.opId)) return { queue, added: false };
  return { queue: [...queue, op], added: true };
}

function applyLocal(lotes = [], op, { fecha = null, nota = '' } = {}) {
  const take = new Map();
  for (const a of op.allocations) take.set(a.lotId, (take.get(a.lotId) || 0) + a.quantity);
  const updated = lotes.map(l => {
    const t = take.get(l.id);
    if (!t) return l;
    const restante = Math.max(0, round3((Number(l.cantidadKgDisponible) || 0) - t));
    return { ...l, cantidadKgDisponible: restante, activo: restante > 0.0001 };
  });
  const movimientos = op.allocations.map((a, i) => ({
    id: `mov_lote_${op.opId}_${i}`, tipo: 'consumo_lote',
    ingredienteId: a.ingredientId, loteInventarioId: a.lotId, kgMovidos: a.quantity, unidad: a.unidad,
    loteNum: op.codigo, fecha, nota, timestamp: op.createdAt,
  }));
  return { lotes: updated, movimientos };
}

const toRecord = op => ({
  schema: op.schema, opId: op.opId, loteId: op.loteId, codigo: op.codigo,
  allocations: op.allocations, shortfalls: op.shortfalls, createdAt: op.createdAt,
});

const backoffMs = attempts => Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));

async function syncDue({ queue = [], persist, now }) {
  let q = queue;
  for (const op of queue) {
    if (op.status === 'synced' || (op.nextAttemptAt || 0) > now) continue;
    try {
      await persist(toRecord(op));
      q = q.map(o => (o.opId === op.opId ? { ...o, status: 'synced', syncedAt: now, lastError: null } : o));
    } catch (err) {
      const attempts = (op.attempts || 0) + 1;
      q = q.map(o => (o.opId === op.opId
        ? { ...o, status: 'failed', attempts, lastError: String(err?.message || err), nextAttemptAt: now + backoffMs(attempts) }
        : o));
    }
  }
  return q;
}

const isPendingForLote = (queue = [], loteId) => queue.some(o => o.loteId === loteId && o.status !== 'synced');
const failuresForBanner = (queue = []) => queue.filter(o => o.status === 'failed' && o.attempts >= BANNER_AFTER_FAILURES);

const api = { QUEUE_KEY, SCHEMA, BANNER_AFTER_FAILURES, buildConsumptionOp, enqueue, applyLocal, toRecord, syncDue, backoffMs, isPendingForLote, failuresForBanner };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasInventoryConsumption = api;
}
})();
