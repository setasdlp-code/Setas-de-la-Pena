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

// Un lote de compra recibe consumo desde una sola allocation por op (el FIFO
// de buildLaunchPlan no reparte un mismo ingrediente entre lotes cuando uno
// alcanza), pero op.allocations puede quedar desactualizada frente al stock
// real si otra operación de consumo se aplicó entre que se planificó este
// lote de producción y que se confirmó (dos lanzamientos casi simultáneos
// planificados contra la misma foto de invLotes). Clampar aquí, contra el
// `lotes` que realmente se recibe (el más fresco disponible en el momento de
// aplicar, no el capturado al planificar), evita que el registro de consumo
// —lo que se persiste y sincroniza a Firestore— declare haber tomado más kg
// de los que el lote de compra tenía disponibles en ese momento.
function applyLocal(lotes = [], op, { fecha = null, nota = '' } = {}) {
  const disponiblePorLote = new Map(lotes.map(l => [l.id, Number(l.cantidadKgDisponible) || 0]));
  const appliedAllocations = [];
  const shortfalls = [];
  for (const a of op.allocations) {
    const disponible = disponiblePorLote.get(a.lotId) || 0;
    const aplicado = round3(Math.min(a.quantity, Math.max(0, disponible)));
    disponiblePorLote.set(a.lotId, round3(disponible - aplicado));
    appliedAllocations.push({ ...a, quantity: aplicado });
    if (aplicado < a.quantity - 0.0001) {
      shortfalls.push({ ingredientId: a.ingredientId, lotId: a.lotId, unidad: a.unidad, faltante: round3(a.quantity - aplicado) });
    }
  }
  const updated = lotes.map(l => {
    const restante = disponiblePorLote.has(l.id) ? disponiblePorLote.get(l.id) : (Number(l.cantidadKgDisponible) || 0);
    if (restante === (Number(l.cantidadKgDisponible) || 0)) return l;
    return { ...l, cantidadKgDisponible: restante, activo: restante > 0.0001 };
  });
  const movimientos = appliedAllocations
    .filter(a => a.quantity > 0.0001)
    .map((a, i) => ({
      id: `mov_lote_${op.opId}_${i}`, tipo: 'consumo_lote',
      ingredienteId: a.ingredientId, loteInventarioId: a.lotId, kgMovidos: a.quantity, unidad: a.unidad,
      loteNum: op.codigo, fecha, nota, timestamp: op.createdAt,
    }));
  const appliedOp = { ...op, allocations: appliedAllocations, shortfalls: [...(op.shortfalls || []), ...shortfalls] };
  return { lotes: updated, movimientos, appliedOp, shortfalls };
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

// syncDue trabaja sobre una instantánea de la cola; mientras espera a Firestore
// pueden encolarse ops nuevas. La cola re-leída después del await es la base:
// de syncedQueue solo se toma el resultado de sincronización de cada op (por
// opId). Ops que solo existen en latestQueue quedan intactas; ops que ya no
// están en latestQueue no se resucitan.
const SYNC_FIELDS = ['status', 'attempts', 'lastError', 'nextAttemptAt', 'syncedAt'];
function mergeSyncResults(latestQueue = [], syncedQueue = []) {
  const byId = new Map((syncedQueue || []).map(o => [o.opId, o]));
  return (latestQueue || []).map(op => {
    const s = byId.get(op.opId);
    if (!s) return op;
    const out = { ...op };
    for (const k of SYNC_FIELDS) if (k in s) out[k] = s[k];
    return out;
  });
}

const isPendingForLote = (queue = [], loteId) => queue.some(o => o.loteId === loteId && o.status !== 'synced');
const failuresForBanner = (queue = []) => queue.filter(o => o.status === 'failed' && o.attempts >= BANNER_AFTER_FAILURES);

const api = { QUEUE_KEY, SCHEMA, BANNER_AFTER_FAILURES, buildConsumptionOp, enqueue, applyLocal, toRecord, syncDue, mergeSyncResults, backoffMs, isPendingForLote, failuresForBanner };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasInventoryConsumption = api;
}
})();
