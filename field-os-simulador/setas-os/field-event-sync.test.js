'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
require('fake-indexeddb/auto');

const { initializeQueue, persistFieldEvent, getReservation } = require('./field-event-queue.js');
const { createSyncEngine } = require('./field-event-sync.js');

let n = 0;
const freshDb = () => initializeQueue(`sync-test-${n++}`);

const A = 'acct_A';
const B = 'acct_B';

const seed = (db, { eventId, batchId, accountId = A, status = 'pending' }) =>
  persistFieldEvent(
    db,
    { id: eventId, batchId, type: 'batch_state_transition', attachmentIds: [] },
    { eventId, accountId, status },
    accountId
  );

const receipt = (eventId, revision = 1) => ({
  eventId,
  acceptedAt: '2026-09-06T15:00:00.000Z',
  batchRevisionAfter: revision,
  serverEventPath: `field_events/${eventId}`,
});

const read = (db, store, key) => new Promise((resolve, reject) => {
  const req = db.transaction(store, 'readonly').objectStore(store).get(key);
  req.onsuccess = () => resolve(req.result || null);
  req.onerror = () => reject(req.error);
});

const coded = (code) => Object.assign(new Error(code), { code });

test('un evento pendiente se envía una vez y queda confirmado', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_1', batchId: 'lote_1' });
  const sent = [];

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async (env) => { sent.push(env.event.id); return receipt('evt_1'); },
  });
  await engine.syncOnce();

  assert.deepEqual(sent, ['evt_1']);
  assert.equal((await read(db, 'queue_entries', 'evt_1')).status, 'confirmed');
});

test('un fallo de red reintenta con el MISMO id, no con uno nuevo', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_2', batchId: 'lote_2' });
  const sent = [];
  let fail = true;

  const engine = createSyncEngine({
    db, accountId: A, now: () => 1000, random: () => 0.5,
    transport: async (env) => {
      sent.push(env.event.id);
      if (fail) throw coded('network_error');
      return receipt('evt_2');
    },
  });

  await engine.syncOnce();
  const afterFail = await read(db, 'queue_entries', 'evt_2');
  assert.equal(afterFail.status, 'retry_wait');
  assert.equal(afterFail.attempts, 1);
  assert.ok(afterFail.nextAttemptAt > 1000, 'debe programar el próximo intento');

  fail = false;
  const engine2 = createSyncEngine({
    db, accountId: A, now: () => 999999,
    transport: async (env) => { sent.push(env.event.id); return receipt('evt_2'); },
  });
  await engine2.syncOnce();

  assert.deepEqual(sent, ['evt_2', 'evt_2'], 'el id no debe regenerarse');
  assert.equal((await read(db, 'queue_entries', 'evt_2')).status, 'confirmed');
});

test('un conflicto de revisión termina la petición y libera la reserva', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_3', batchId: 'lote_3' });

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async () => { throw coded('revision_conflict'); },
  });
  await engine.syncOnce();

  const entry = await read(db, 'queue_entries', 'evt_3');
  assert.equal(entry.status, 'conflict');
  assert.equal(entry.errorCode, 'revision_conflict');
  assert.equal(await getReservation(db, A, 'lote_3'), null,
    'la reserva debe soltarse para que el operario pueda crear un evento nuevo');
});

test('un error terminal no programa reintento', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_4', batchId: 'lote_4' });
  let calls = 0;

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async () => { calls += 1; throw coded('content_mismatch'); },
  });
  await engine.syncOnce();
  await engine.syncOnce();

  assert.equal(calls, 1, 'no debe reenviarse tras un código terminal');
  const entry = await read(db, 'queue_entries', 'evt_4');
  assert.equal(entry.status, 'rejected');
  assert.equal(entry.nextAttemptAt, undefined);
});

test('no envía eventos de otra cuenta', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_a', batchId: 'lote_a', accountId: A });
  await seed(db, { eventId: 'evt_b', batchId: 'lote_b', accountId: B });
  const sent = [];

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async (env) => { sent.push(env.event.id); return receipt(env.event.id); },
  });
  await engine.syncOnce();

  assert.deepEqual(sent, ['evt_a'], 'el evento de la cuenta B no debe salir');
  assert.equal((await read(db, 'queue_entries', 'evt_b')).status, 'pending');
});

test('dos syncOnce solapados envían cada evento una sola vez', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_5', batchId: 'lote_5' });
  const sent = [];

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async (env) => {
      sent.push(env.event.id);
      await new Promise(r => setTimeout(r, 20));
      return receipt('evt_5');
    },
  });

  await Promise.all([engine.syncOnce(), engine.syncOnce()]);
  assert.deepEqual(sent, ['evt_5'], 'la segunda llamada debe reusar la que está en vuelo');
});

test('agotar los intentos deja el evento rechazado, no reintentando para siempre', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_6', batchId: 'lote_6' });

  // Un intento antes del tope: el siguiente fallo debe cerrarlo.
  await new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readwrite');
    tx.objectStore('queue_entries').put({
      eventId: 'evt_6', accountId: A, status: 'pending', attempts: 7,
    });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async () => { throw coded('network_error'); },
  });
  await engine.syncOnce();

  const entry = await read(db, 'queue_entries', 'evt_6');
  assert.equal(entry.status, 'rejected');
  assert.equal(entry.errorCode, 'network_error');
  assert.equal(await getReservation(db, A, 'lote_6'), null, 'la reserva debe soltarse');
});

test('un fallo sin código se trata como de transporte y se reintenta', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_7', batchId: 'lote_7' });

  const engine = createSyncEngine({
    db, accountId: A, now: () => 5000,
    transport: async () => { throw new Error('socket hang up'); },
  });
  await engine.syncOnce();

  const entry = await read(db, 'queue_entries', 'evt_7');
  assert.equal(entry.status, 'retry_wait', 'un error desconocido no debe descartar el evento');
});
