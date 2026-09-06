'use strict';

/**
 * @file field-event-queue.js — Cola offline de eventos de campo (IndexedDB).
 *
 * ObjectStores:
 * - field_events: registros inmutables de eventos
 * - queue_entries: estado mutable de entrega
 * - pending_batch_transitions: reservas por cuenta+lote (evita ediciones concurrentes)
 * - auth_receipts: recibos del servidor cacheados
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const DB_NAME = 'setas-field-events';
  const DB_VERSION = 1;

  const idb = () => (typeof globalThis !== 'undefined' ? globalThis.indexedDB : undefined);

  const reservationKey = (accountId, batchId) => `${accountId}:${batchId}`;

  const initializeQueue = (dbName = DB_NAME) => new Promise((resolve, reject) => {
    const req = idb().open(dbName, DB_VERSION);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains('field_events')) {
        db.createObjectStore('field_events', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('queue_entries')) {
        const qe = db.createObjectStore('queue_entries', { keyPath: 'eventId' });
        qe.createIndex('status', 'status');
        qe.createIndex('nextAttemptAt', 'nextAttemptAt');
        qe.createIndex('accountId', 'accountId');
      }

      if (!db.objectStoreNames.contains('pending_batch_transitions')) {
        const pbt = db.createObjectStore('pending_batch_transitions', { keyPath: 'reservationId' });
        pbt.createIndex('accountBatch', ['accountId', 'batchId']);
      }

      if (!db.objectStoreNames.contains('auth_receipts')) {
        db.createObjectStore('auth_receipts', { keyPath: 'eventId' });
      }
    };
  });

  /**
   * Escribe evento, entrada de cola y reserva en una sola transacción.
   * Falla si el lote ya tiene una transición pendiente para esa cuenta.
   */
  const persistFieldEvent = (db, event, queueEntry, accountId) => new Promise((resolve, reject) => {
    const tx = db.transaction(
      ['field_events', 'queue_entries', 'pending_batch_transitions'],
      'readwrite'
    );

    const reservationId = reservationKey(accountId, event.batchId);
    const existingReq = tx.objectStore('pending_batch_transitions').get(reservationId);

    existingReq.onsuccess = () => {
      if (existingReq.result) {
        tx.abort();
        reject(new Error('batch_already_has_pending_transition'));
        return;
      }
      try {
        tx.objectStore('field_events').add(event);
        tx.objectStore('queue_entries').add(queueEntry);
        tx.objectStore('pending_batch_transitions').put({
          reservationId,
          accountId,
          batchId: event.batchId,
          eventId: event.id,
          reservedAt: new Date().toISOString(),
        });
      } catch (e) {
        reject(e);
      }
    };

    existingReq.onerror = () => {
      tx.abort();
      reject(existingReq.error);
    };

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });

  const getReservation = (db, accountId, batchId) => new Promise((resolve, reject) => {
    const tx = db.transaction('pending_batch_transitions', 'readonly');
    const req = tx.objectStore('pending_batch_transitions')
      .index('accountBatch')
      .get([accountId, batchId]);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });

  /**
   * Libera la reserva sólo si pertenece a `expectedEventId`.
   *
   * El guard existe porque una respuesta demorada o duplicada de un evento
   * antiguo llegaría después de que el operario ya creó uno nuevo: sin
   * comparar el id, esa respuesta liberaría la reserva del evento nuevo y
   * dejaría el lote editable mientras sigue habiendo trabajo en vuelo.
   *
   * @returns {Promise<boolean>} true si se liberó; false si la reserva es de otro evento.
   */
  const releaseReservation = (db, accountId, batchId, expectedEventId) => {
    if (!expectedEventId) {
      return Promise.reject(new Error('expectedEventId es obligatorio para liberar una reserva'));
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_batch_transitions', 'readwrite');
      const store = tx.objectStore('pending_batch_transitions');
      const reservationId = reservationKey(accountId, batchId);
      const getReq = store.get(reservationId);
      let released = false;

      getReq.onsuccess = () => {
        const current = getReq.result;
        if (!current || current.eventId !== expectedEventId) return; // reserva ajena: no tocar
        released = true;
        store.delete(reservationId);
      };
      getReq.onerror = () => reject(getReq.error);

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve(released);
    });
  };

  const queryPendingByStatus = (db, status) => new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readonly');
    const req = tx.objectStore('queue_entries').index('status').getAll(status);

    req.onsuccess = () => resolve(req.result.map(qe => ({ eventId: qe.eventId, queueEntry: qe })));
    req.onerror = () => reject(req.error);
  });

  const recoverEventsByAccount = (db, accountId) => new Promise((resolve, reject) => {
    const tx = db.transaction(['field_events', 'queue_entries'], 'readonly');
    const eventStore = tx.objectStore('field_events');
    const allQE = tx.objectStore('queue_entries').index('accountId').getAll(accountId);

    allQE.onsuccess = () => {
      const entries = allQE.result;
      if (entries.length === 0) {
        resolve([]);
        return;
      }
      const results = new Array(entries.length);
      let completed = 0;

      entries.forEach((qe, i) => {
        const eventReq = eventStore.get(qe.eventId);
        eventReq.onsuccess = () => {
          results[i] = { event: eventReq.result, queueEntry: qe };
          completed += 1;
          if (completed === entries.length) resolve(results);
        };
        eventReq.onerror = () => reject(eventReq.error);
      });
    };
    allQE.onerror = () => reject(allQE.error);
  });

  const api = {
    initializeQueue,
    persistFieldEvent,
    getReservation,
    releaseReservation,
    queryPendingByStatus,
    recoverEventsByAccount,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventQueue = api;
})();
