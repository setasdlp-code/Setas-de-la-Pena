'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
require('fake-indexeddb/auto');

const { initializeQueue, persistFieldEvent, getReservation } = require('./field-event-queue.js');
const { createSyncEngine } = require('./field-event-sync.js');
const { createAccountSession, recoverAccount } = require('./field-event-account.js');

let n = 0;
const freshDb = () => initializeQueue(`account-test-${n++}`);
const A = 'acct_A';
const B = 'acct_B';

const seed = (db, { eventId, batchId, accountId, status = 'pending', extra = {} }) =>
  persistFieldEvent(
    db,
    { id: eventId, batchId, type: 'batch_state_transition', attachmentIds: [] },
    { eventId, accountId, status, ...extra },
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

const countAll = (db, store) => new Promise((resolve, reject) => {
  const req = db.transaction(store, 'readonly').objectStore(store).count();
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

test('cerrar sesión conserva el trabajo pendiente', async () => {
  const db = await freshDb();
  for (const i of [1, 2, 3]) await seed(db, { eventId: `evt_${i}`, batchId: `lote_${i}`, accountId: A });

  const session = createAccountSession({
    db, createEngine: (acct) => createSyncEngine({ db, accountId: acct, transport: async () => { throw new Error('offline'); } }),
  });
  await session.switchTo(A);
  await session.switchTo(null);

  assert.equal(session.current(), null);
  assert.equal(await countAll(db, 'field_events'), 3, 'los eventos deben sobrevivir');
  assert.equal(await countAll(db, 'queue_entries'), 3);
  assert.equal(await countAll(db, 'pending_batch_transitions'), 3, 'las reservas también');
});

test('volver a entrar recupera exactamente los eventos de esa cuenta', async () => {
  const db = await freshDb();
  for (const i of [1, 2, 3]) await seed(db, { eventId: `evt_${i}`, batchId: `lote_${i}`, accountId: A });
  await seed(db, { eventId: 'evt_otro', batchId: 'lote_otro', accountId: B });

  const session = createAccountSession({
    db, createEngine: (acct) => createSyncEngine({ db, accountId: acct, transport: async () => { throw new Error('offline'); } }),
  });
  const { recovered } = await session.switchTo(A);

  assert.equal(recovered.length, 3);
  assert.deepEqual(recovered.map(r => r.queueEntry.eventId).sort(), ['evt_1', 'evt_2', 'evt_3']);
});

test('un retry_wait vencido durante la sesión cerrada vuelve a pending', async () => {
  const db = await freshDb();
  await seed(db, {
    eventId: 'evt_wait', batchId: 'lote_w', accountId: A,
    status: 'retry_wait', extra: { attempts: 2, nextAttemptAt: 500 },
  });

  await recoverAccount(db, A, () => 10000);

  assert.equal((await read(db, 'queue_entries', 'evt_wait')).status, 'pending',
    'no debe quedarse esperando un backoff que ya venció');
});

test('un retry_wait aún vigente conserva su espera', async () => {
  const db = await freshDb();
  await seed(db, {
    eventId: 'evt_future', batchId: 'lote_f', accountId: A,
    status: 'retry_wait', extra: { attempts: 2, nextAttemptAt: 90000 },
  });

  await recoverAccount(db, A, () => 1000);

  assert.equal((await read(db, 'queue_entries', 'evt_future')).status, 'retry_wait');
});

test('cambiar de cuenta no envía los eventos de la anterior', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_a', batchId: 'lote_a', accountId: A });
  await seed(db, { eventId: 'evt_b', batchId: 'lote_b', accountId: B });
  const sent = [];

  const session = createAccountSession({
    db,
    createEngine: (acct) => createSyncEngine({
      db, accountId: acct,
      transport: async (env) => { sent.push(`${acct}:${env.event.id}`); return receipt(env.event.id); },
    }),
  });

  await session.switchTo(A);
  await session.engine().syncOnce();
  await session.switchTo(B);
  await session.engine().syncOnce();

  assert.deepEqual(sent, ['acct_A:evt_a', 'acct_B:evt_b'],
    'cada motor sólo envía lo suyo');
});

test('una respuesta en vuelo de la cuenta anterior se reconcilia bajo esa cuenta', async () => {
  const db = await freshDb();
  await seed(db, { eventId: 'evt_slow', batchId: 'lote_slow', accountId: A });
  await seed(db, { eventId: 'evt_b', batchId: 'lote_b', accountId: B });

  let release;
  const gate = new Promise(r => { release = r; });

  const engineA = createSyncEngine({
    db, accountId: A,
    transport: async () => { await gate; return receipt('evt_slow', 7); },
  });

  const inFlight = engineA.syncOnce();
  // El operario cambia de cuenta mientras la petición sigue viva.
  const session = createAccountSession({
    db, createEngine: (acct) => createSyncEngine({ db, accountId: acct, transport: async () => { throw new Error('offline'); } }),
  });
  await session.switchTo(B);
  release();
  await inFlight;

  assert.equal((await read(db, 'queue_entries', 'evt_slow')).status, 'confirmed');
  assert.equal((await read(db, 'batch_cache', 'lote_slow')).accountId, A,
    'la caché debe quedar bajo la cuenta que originó el evento');
  assert.equal(await read(db, 'batch_cache', 'lote_b'), null, 'la cuenta B no debe verse afectada');
});

test('recuperar una cuenta sin eventos devuelve una lista vacía', async () => {
  const db = await freshDb();
  const recovered = await recoverAccount(db, 'acct_vacia');
  assert.deepEqual(recovered, []);
});

test('la ruta de cierre de sesión no borra nada', async () => {
  const src = require('node:fs').readFileSync('field-event-account.js', 'utf8');
  assert.ok(!/\.delete\(|\.clear\(/.test(src),
    'este módulo no debe contener ninguna operación destructiva');
});
