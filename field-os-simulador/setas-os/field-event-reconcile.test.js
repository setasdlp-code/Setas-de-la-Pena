'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
require('fake-indexeddb/auto');

const { initializeQueue, persistFieldEvent, getReservation } = require('./field-event-queue.js');
const { reconcileReceipt } = require('./field-event-reconcile.js');

let dbCounter = 0;
const freshDb = () => initializeQueue(`reconcile-test-${dbCounter++}`);

const ACCOUNT = 'acct_1';

const seedPending = async (db, { eventId, batchId }) => {
  await persistFieldEvent(
    db,
    { id: eventId, batchId, type: 'batch_state_transition' },
    { eventId, accountId: ACCOUNT, status: 'pending' },
    ACCOUNT
  );
};

const receiptFor = (eventId, revision) => ({
  eventId,
  acceptedAt: '2026-09-06T15:00:00.000Z',
  batchRevisionAfter: revision,
  serverEventPath: `field_events/${eventId}`,
  workflowState: 'incubation',
});

const read = (db, store, key) => new Promise((resolve, reject) => {
  const req = db.transaction(store, 'readonly').objectStore(store).get(key);
  req.onsuccess = () => resolve(req.result || null);
  req.onerror = () => reject(req.error);
});

test('aplica el recibo, confirma la entrada, actualiza la caché y libera la reserva', async () => {
  const db = await freshDb();
  await seedPending(db, { eventId: 'evt_1', batchId: 'lote_1' });

  const out = await reconcileReceipt(db, {
    accountId: ACCOUNT, eventId: 'evt_1', batchId: 'lote_1', receipt: receiptFor('evt_1', 4),
  });

  assert.deepEqual(out, { applied: true, reason: 'applied' });
  assert.ok(await read(db, 'auth_receipts', 'evt_1'), 'el recibo debe quedar persistido');
  assert.equal((await read(db, 'queue_entries', 'evt_1')).status, 'confirmed');
  assert.equal((await read(db, 'batch_cache', 'lote_1')).revision, 4);
  assert.equal(await getReservation(db, ACCOUNT, 'lote_1'), null, 'la reserva debe liberarse');
});

test('una segunda entrega del mismo recibo no vuelve a avanzar nada', async () => {
  const db = await freshDb();
  await seedPending(db, { eventId: 'evt_2', batchId: 'lote_2' });
  const receipt = receiptFor('evt_2', 4);

  await reconcileReceipt(db, { accountId: ACCOUNT, eventId: 'evt_2', batchId: 'lote_2', receipt });
  const second = await reconcileReceipt(db, { accountId: ACCOUNT, eventId: 'evt_2', batchId: 'lote_2', receipt });

  assert.deepEqual(second, { applied: false, reason: 'already_confirmed' });
  assert.equal((await read(db, 'batch_cache', 'lote_2')).revision, 4, 'la revisión no debe moverse');
});

test('una respuesta demorada no toca la reserva de un evento más nuevo', async () => {
  const db = await freshDb();
  // El evento nuevo es quien tiene la reserva del lote.
  await seedPending(db, { eventId: 'evt_new', batchId: 'lote_3' });
  // La entrada del evento viejo sigue en cola, pendiente.
  await new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readwrite');
    tx.objectStore('queue_entries').put({ eventId: 'evt_old', accountId: ACCOUNT, status: 'pending' });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  const out = await reconcileReceipt(db, {
    accountId: ACCOUNT, eventId: 'evt_old', batchId: 'lote_3', receipt: receiptFor('evt_old', 9),
  });

  assert.deepEqual(out, { applied: false, reason: 'stale_response' });

  // Nada debe haberse escrito: es la propiedad de todo-o-nada en un camino real.
  assert.equal(await read(db, 'auth_receipts', 'evt_old'), null, 'no debe persistir recibo');
  assert.equal((await read(db, 'queue_entries', 'evt_old')).status, 'pending', 'no debe confirmarse');
  assert.equal(await read(db, 'batch_cache', 'lote_3'), null, 'no debe tocar la caché');
  const reservation = await getReservation(db, ACCOUNT, 'lote_3');
  assert.equal(reservation.eventId, 'evt_new', 'la reserva del evento nuevo sigue viva');
});

test('un recibo con revisión anterior no retrocede la caché', async () => {
  const db = await freshDb();
  await seedPending(db, { eventId: 'evt_hi', batchId: 'lote_4' });
  await reconcileReceipt(db, {
    accountId: ACCOUNT, eventId: 'evt_hi', batchId: 'lote_4', receipt: receiptFor('evt_hi', 5),
  });

  await seedPending(db, { eventId: 'evt_lo', batchId: 'lote_4' });
  const out = await reconcileReceipt(db, {
    accountId: ACCOUNT, eventId: 'evt_lo', batchId: 'lote_4', receipt: receiptFor('evt_lo', 3),
  });

  assert.equal(out.applied, true, 'el evento se confirma igual');
  assert.equal((await read(db, 'batch_cache', 'lote_4')).revision, 5, 'la caché no retrocede a 3');
});

test('un evento desconocido se reporta sin escribir nada', async () => {
  const db = await freshDb();
  const out = await reconcileReceipt(db, {
    accountId: ACCOUNT, eventId: 'evt_ghost', batchId: 'lote_5', receipt: receiptFor('evt_ghost', 2),
  });

  assert.deepEqual(out, { applied: false, reason: 'unknown_event' });
  assert.equal(await read(db, 'auth_receipts', 'evt_ghost'), null);
  assert.equal(await read(db, 'batch_cache', 'lote_5'), null);
});

test('un recibo sin revisión entera se rechaza antes de abrir la transacción', async () => {
  const db = await freshDb();
  await assert.rejects(
    () => reconcileReceipt(db, {
      accountId: ACCOUNT, eventId: 'evt_x', batchId: 'lote_6',
      receipt: { eventId: 'evt_x', batchRevisionAfter: '4' },
    }),
    /incomplete_event_record/
  );
});

test('la migración v1 -> v2 conserva las filas existentes y añade batch_cache', async () => {
  const name = `migration-test-${dbCounter++}`;

  // Base v1: sin batch_cache, como la dejó Task 1.
  const v1 = await new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore('field_events', { keyPath: 'id' });
      const qe = db.createObjectStore('queue_entries', { keyPath: 'eventId' });
      qe.createIndex('status', 'status');
      qe.createIndex('nextAttemptAt', 'nextAttemptAt');
      qe.createIndex('accountId', 'accountId');
      const pbt = db.createObjectStore('pending_batch_transitions', { keyPath: 'reservationId' });
      pbt.createIndex('accountBatch', ['accountId', 'batchId']);
      db.createObjectStore('auth_receipts', { keyPath: 'eventId' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  await new Promise((resolve, reject) => {
    const tx = v1.transaction('queue_entries', 'readwrite');
    tx.objectStore('queue_entries').put({ eventId: 'evt_legacy', accountId: ACCOUNT, status: 'pending' });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  assert.ok(!Array.from(v1.objectStoreNames).includes('batch_cache'));
  v1.close();

  const v2 = await initializeQueue(name);
  assert.ok(Array.from(v2.objectStoreNames).includes('batch_cache'), 'v2 añade batch_cache');
  const legacy = await read(v2, 'queue_entries', 'evt_legacy');
  assert.ok(legacy, 'la fila escrita en v1 debe sobrevivir');
  assert.equal(legacy.status, 'pending');
});
