'use strict';

/**
 * @file field-event-reconcile.js — Aplicación atómica del recibo del servidor.
 *
 * Persistir el recibo, confirmar la entrada de cola, actualizar la caché del
 * lote y liberar la reserva son cuatro efectos de un mismo hecho. Si se
 * aplicaran por separado, un corte entre dos de ellos dejaría al operario con
 * un lote confirmado y su reserva retenida, o con una reserva liberada y una
 * entrega que nunca se marcó.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const APPLIED = 'applied';
  const UNKNOWN_EVENT = 'unknown_event';
  const ALREADY_CONFIRMED = 'already_confirmed';
  const STALE_RESPONSE = 'stale_response';

  const STORES = ['queue_entries', 'auth_receipts', 'pending_batch_transitions', 'batch_cache'];

  /**
   * @returns {Promise<{applied: boolean, reason: string}>}
   */
  const reconcileReceipt = (db, { accountId, eventId, batchId, receipt }) => {
    if (!accountId || !eventId || !batchId) {
      return Promise.reject(new Error('reconcileReceipt requiere accountId, eventId y batchId'));
    }
    if (!receipt || !Number.isInteger(receipt.batchRevisionAfter)) {
      return Promise.reject(new Error('incomplete_event_record: recibo sin batchRevisionAfter entero'));
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES, 'readwrite');
      const queue = tx.objectStore('queue_entries');
      const reservations = tx.objectStore('pending_batch_transitions');
      const cache = tx.objectStore('batch_cache');

      let outcome = { applied: false, reason: UNKNOWN_EVENT };

      const entryReq = queue.get(eventId);
      entryReq.onerror = () => reject(entryReq.error);
      entryReq.onsuccess = () => {
        const entry = entryReq.result;
        if (!entry) return;

        // Una segunda entrega del mismo recibo no es un error: dos pestañas
        // pueden recibirlo a la vez. Se ignora en silencio en vez de volver a
        // avanzar la revisión.
        if (entry.status === 'confirmed') {
          outcome = { applied: false, reason: ALREADY_CONFIRMED };
          return;
        }

        const resReq = reservations.get(`${accountId}:${batchId}`);
        resReq.onerror = () => reject(resReq.error);
        resReq.onsuccess = () => {
          const reservation = resReq.result;

          // La reserva es de otro evento: esta respuesta llegó tarde, después
          // de que el operario ya creó uno nuevo. No se toca nada.
          if (reservation && reservation.eventId !== eventId) {
            outcome = { applied: false, reason: STALE_RESPONSE };
            return;
          }

          tx.objectStore('auth_receipts').put({ eventId, batchId, accountId, receipt });
          queue.put({ ...entry, status: 'confirmed', confirmedAt: receipt.acceptedAt });

          const cacheReq = cache.get(batchId);
          cacheReq.onerror = () => reject(cacheReq.error);
          cacheReq.onsuccess = () => {
            const cached = cacheReq.result;
            // La revisión sólo avanza. Un recibo viejo que llega después de uno
            // nuevo no debe devolver al operario a un estado ya superado.
            if (!cached || receipt.batchRevisionAfter > cached.revision) {
              cache.put({
                batchId,
                accountId,
                revision: receipt.batchRevisionAfter,
                workflowState: receipt.workflowState ?? (cached ? cached.workflowState : null),
                updatedAt: receipt.acceptedAt,
              });
            }
            if (reservation) reservations.delete(`${accountId}:${batchId}`);
            outcome = { applied: true, reason: APPLIED };
          };
        };
      };

      tx.onabort = () => reject(tx.error || new Error('transaction_aborted: reconcileReceipt'));
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve(outcome);
    });
  };

  const api = { reconcileReceipt, APPLIED, UNKNOWN_EVENT, ALREADY_CONFIRMED, STALE_RESPONSE };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventReconcile = api;
})();
