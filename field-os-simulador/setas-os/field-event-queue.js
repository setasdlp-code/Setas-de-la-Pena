'use strict';

/**
 * Field Event Queue - IndexedDB schema, persistence, and lifecycle management
 *
 * Manages ObjectStores:
 * - field_events: immutable event records
 * - queue_entries: mutable delivery state
 * - pending_batch_transitions: reservations (prevents concurrent edits)
 * - auth_receipts: cached server receipts
 */

/**
 * Initialize IndexedDB with schema
 * @param {string} dbName - database name (default: 'setas-field-events')
 * @returns {Promise<IDBDatabase>}
 */
async function initializeQueue(dbName = 'setas-field-events') {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      // field_events: immutable event records
      if (!db.objectStoreNames.contains('field_events')) {
        db.createObjectStore('field_events', { keyPath: 'id' });
      }

      // queue_entries: mutable delivery state
      if (!db.objectStoreNames.contains('queue_entries')) {
        const qe = db.createObjectStore('queue_entries', { keyPath: 'eventId' });
        qe.createIndex('status', 'status');
        qe.createIndex('nextAttemptAt', 'nextAttemptAt');
        qe.createIndex('accountId', 'accountId');
      }

      // pending_batch_transitions: reservations (key: accountId:batchId)
      if (!db.objectStoreNames.contains('pending_batch_transitions')) {
        const pbt = db.createObjectStore('pending_batch_transitions', { keyPath: 'reservationId' });
        pbt.createIndex('accountBatch', ['accountId', 'batchId']);
      }

      // auth_receipts: cached server receipts
      if (!db.objectStoreNames.contains('auth_receipts')) {
        db.createObjectStore('auth_receipts', { keyPath: 'eventId' });
      }
    };
  });
}

/**
 * Persist field event, queue entry, and reservation atomically
 * @param {IDBDatabase} db
 * @param {object} event - FieldEvent
 * @param {object} queueEntry - Queue entry with eventId, accountId, status
 * @param {string} accountId - Account ID for isolation
 * @returns {Promise<void>}
 * @throws {Error} if reservation already exists
 */
async function persistFieldEvent(db, event, queueEntry, accountId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      ['field_events', 'queue_entries', 'pending_batch_transitions'],
      'readwrite'
    );

    const reservationId = `${accountId}:${event.batchId}`;

    // Check for existing reservation
    const reservationStore = tx.objectStore('pending_batch_transitions');
    const existingReq = reservationStore.get(reservationId);

    existingReq.onsuccess = () => {
      if (existingReq.result) {
        tx.abort();
        reject(new Error('batch_already_has_pending_transition'));
        return;
      }

      // Write all three atomically
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
}

/**
 * Get reservation by accountId and batchId
 * @param {IDBDatabase} db
 * @param {string} accountId
 * @param {string} batchId
 * @returns {Promise<{reservationId, eventId, accountId, batchId} | null>}
 */
async function getReservation(db, accountId, batchId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_batch_transitions', 'readonly');
    const store = tx.objectStore('pending_batch_transitions');
    const index = store.index('accountBatch');
    const req = index.get([accountId, batchId]);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Release reservation by accountId and batchId
 * @param {IDBDatabase} db
 * @param {string} accountId
 * @param {string} batchId
 * @returns {Promise<void>}
 */
async function releaseReservation(db, accountId, batchId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_batch_transitions', 'readwrite');
    const store = tx.objectStore('pending_batch_transitions');
    const reservationId = `${accountId}:${batchId}`;
    const req = store.delete(reservationId);

    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve();
  });
}

/**
 * Query queue entries by status
 * @param {IDBDatabase} db
 * @param {string} status - status value (e.g., 'pending', 'confirmed', 'retry_wait')
 * @returns {Promise<Array<{eventId, queueEntry}>>}
 */
async function queryPendingByStatus(db, status) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readonly');
    const store = tx.objectStore('queue_entries');
    const index = store.index('status');
    const req = index.getAll(status);

    req.onsuccess = () => {
      const entries = req.result;
      const results = entries.map(qe => ({
        eventId: qe.eventId,
        queueEntry: qe,
      }));
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Recover all events for an account
 * @param {IDBDatabase} db
 * @param {string} accountId
 * @returns {Promise<Array<{event, queueEntry}>>}
 */
async function recoverEventsByAccount(db, accountId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['field_events', 'queue_entries'], 'readonly');
    const qeStore = tx.objectStore('queue_entries');
    const eventStore = tx.objectStore('field_events');
    const index = qeStore.index('accountId');

    const allQE = index.getAll(accountId);
    allQE.onsuccess = () => {
      const entries = allQE.result;
      const results = [];
      let completed = 0;

      if (entries.length === 0) {
        resolve([]);
        return;
      }

      entries.forEach(qe => {
        const eventReq = eventStore.get(qe.eventId);
        eventReq.onsuccess = () => {
          results.push({
            event: eventReq.result,
            queueEntry: qe,
          });
          completed++;
          if (completed === entries.length) {
            resolve(results);
          }
        };
        eventReq.onerror = () => reject(eventReq.error);
      });
    };
    allQE.onerror = () => reject(allQE.error);
  });
}

module.exports = {
  initializeQueue,
  persistFieldEvent,
  getReservation,
  releaseReservation,
  queryPendingByStatus,
  recoverEventsByAccount,
};
