'use strict';

/**
 * @file field-event-sync.js — Envío de eventos de campo pendientes.
 *
 * El transporte se inyecta: las pruebas no necesitan red ni temporizadores
 * reales, y el motor queda acotado a una sola cuenta para que los eventos de
 * un operario nunca salgan bajo la sesión de otro.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const queue = isNode ? require('./field-event-queue.js') : globalThis.SetasFieldEventQueue;
  const reconcile = isNode ? require('./field-event-reconcile.js') : globalThis.SetasFieldEventReconcile;
  const contracts = isNode ? require('./field-event-contracts.js') : globalThis.SetasFieldEventContracts;

  const MAX_ATTEMPTS = 8;
  const MAX_BACKOFF_MS = 30000;

  // Espera exponencial con jitter completo: si varias pestañas reintentan a la
  // vez, un retardo fijo las volvería a sincronizar en el mismo instante.
  const backoffMs = (attempts, random = Math.random) =>
    Math.round(random() * Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempts));

  const putEntry = (db, entry) => new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readwrite');
    tx.objectStore('queue_entries').put(entry);
    tx.onabort = () => reject(tx.error || new Error('transaction_aborted: putEntry'));
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });

  const createSyncEngine = ({ db, accountId, transport, now = Date.now, random = Math.random }) => {
    if (!db || !accountId || typeof transport !== 'function') {
      throw new Error('createSyncEngine requiere db, accountId y transport');
    }

    let inFlight = null;
    let running = false;

    const settle = async (event, entry, status, extra = {}) => {
      await putEntry(db, { ...entry, status, ...extra });
      // Todo desenlace terminal suelta la reserva, con el guard puesto: si el
      // operario ya creó un evento nuevo para este lote, esta liberación no le
      // corresponde y no debe quitársela.
      await queue.releaseReservation(db, accountId, event.batchId, event.id);
    };

    const deliver = async ({ event, queueEntry }) => {
      let receipt;
      try {
        receipt = await transport(contracts.buildRequestEnvelope(event, accountId));
      } catch (err) {
        // Un fallo sin código es de transporte: se reintenta, no se descarta.
        const code = err && err.code && contracts.ERROR_CODES[err.code] ? err.code : 'network_error';

        if (contracts.isRetryable(code)) {
          const attempts = (queueEntry.attempts || 0) + 1;
          if (attempts >= MAX_ATTEMPTS) {
            await settle(event, queueEntry, 'rejected', { attempts, errorCode: 'network_error' });
            return { eventId: event.id, status: 'rejected', code: 'network_error' };
          }
          // El id no se regenera: reintentar con uno nuevo crearía una segunda
          // transición si la primera sí había llegado al servidor.
          await putEntry(db, {
            ...queueEntry,
            status: 'retry_wait',
            attempts,
            nextAttemptAt: now() + backoffMs(attempts, random),
          });
          return { eventId: event.id, status: 'retry_wait', code };
        }

        // El conflicto termina esta petición. El operario refresca y confirma
        // de nuevo, y ese evento nuevo lleva un id nuevo.
        const status = code === 'revision_conflict' ? 'conflict' : 'rejected';
        await settle(event, queueEntry, status, { errorCode: code });
        return { eventId: event.id, status, code };
      }

      contracts.validateReceipt(receipt);
      const outcome = await reconcile.reconcileReceipt(db, {
        accountId, eventId: event.id, batchId: event.batchId, receipt,
      });
      return { eventId: event.id, status: 'confirmed', reconciled: outcome.reason };
    };

    const drain = async () => {
      const all = await queue.recoverEventsByAccount(db, accountId);
      const due = all.filter(({ queueEntry: q }) =>
        q.status === 'pending' ||
        (q.status === 'retry_wait' && (q.nextAttemptAt || 0) <= now()));

      const results = [];
      for (const pair of due) results.push(await deliver(pair));
      return results;
    };

    return {
      // No reentrante: dos llamadas solapadas (dos pestañas, o un reintento que
      // pisa al temporizador) enviarían el mismo evento dos veces.
      syncOnce() {
        if (inFlight) return inFlight;
        inFlight = drain().finally(() => { inFlight = null; });
        return inFlight;
      },
      start() { running = true; return this.syncOnce(); },
      async stop() { running = false; if (inFlight) await inFlight.catch(() => {}); },
      isRunning: () => running,
    };
  };

  const api = { createSyncEngine, backoffMs, MAX_ATTEMPTS, MAX_BACKOFF_MS };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventSync = api;
})();
