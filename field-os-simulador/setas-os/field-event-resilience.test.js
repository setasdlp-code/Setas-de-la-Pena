'use strict';

/**
 * Resiliencia del cuaderno de campo: interrupciones, duplicados y reinicios.
 *
 * El reinicio se simula cerrando y reabriendo la base y reconstruyendo el motor
 * desde lo persistido — nunca reutilizando estado en memoria, que es justo lo
 * que un cierre de la aplicación se lleva.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
require('fake-indexeddb/auto');

const { initializeQueue, persistFieldEvent, getReservation } = require('./field-event-queue.js');
const { createSyncEngine } = require('./field-event-sync.js');
const { reconcileReceipt } = require('./field-event-reconcile.js');
const { createAccountSession } = require('./field-event-account.js');
const { createFieldEvent } = require('./field-events-model.js');

let n = 0;
const A = 'acct_A';
const B = 'acct_B';

const read = (db, store, key) => new Promise((resolve, reject) => {
  const req = db.transaction(store, 'readonly').objectStore(store).get(key);
  req.onsuccess = () => resolve(req.result || null);
  req.onerror = () => reject(req.error);
});

const seed = (db, event, accountId = A, status = 'pending') =>
  persistFieldEvent(db, event, { eventId: event.id, accountId, status }, accountId);

const newEvent = (batchId, revision = 0) =>
  createFieldEvent(batchId, 'inoculated', 'incubation', 'op_1', '2026-09-06T14:30:00Z', revision);

/**
 * Servidor de prueba con el mismo contrato de idempotencia que
 * functions/accept-field-event.js: un id ya aceptado devuelve su recibo
 * original y no vuelve a avanzar la revisión.
 */
const makeServer = () => {
  const accepted = new Map();
  const revisions = new Map();
  return {
    accepted,
    revisionOf: (batchId) => revisions.get(batchId) || 0,
    accept(envelope) {
      const { event } = envelope;
      if (accepted.has(event.id)) return accepted.get(event.id);

      const current = revisions.get(event.batchId) || 0;
      if (event.expectedBatchRevision !== current) {
        throw Object.assign(new Error('revision_conflict'), { code: 'revision_conflict' });
      }
      const next = current + 1;
      revisions.set(event.batchId, next);
      const receipt = {
        eventId: event.id,
        acceptedAt: '2026-09-06T15:00:00.000Z',
        batchRevisionAfter: next,
        serverEventPath: `field_events/${event.id}`,
      };
      accepted.set(event.id, receipt);
      return receipt;
    },
  };
};

test('el servidor confirma pero se pierde la respuesta: el reintento no duplica la transición', async () => {
  const name = `res-lost-${n++}`;
  let db = await initializeQueue(name);
  const server = makeServer();
  const event = newEvent('lote_1', 0);
  await seed(db, event);

  // Primer intento: el servidor acepta y la respuesta se pierde en el camino.
  let dropResponse = true;
  const engine = createSyncEngine({
    db, accountId: A,
    transport: async (env) => {
      const receipt = server.accept(env);
      if (dropResponse) throw Object.assign(new Error('network_error'), { code: 'network_error' });
      return receipt;
    },
  });
  await engine.syncOnce();

  assert.equal((await read(db, 'queue_entries', event.id)).status, 'retry_wait');
  assert.equal(server.revisionOf('lote_1'), 1, 'el servidor sí avanzó');

  // Reinicio de la aplicación antes del reintento.
  db.close();
  db = await initializeQueue(name);

  dropResponse = false;
  const engine2 = createSyncEngine({
    db, accountId: A, now: () => 9e12,
    transport: async (env) => server.accept(env),
  });
  await engine2.syncOnce();

  assert.equal(server.revisionOf('lote_1'), 1, 'la revisión no debe avanzar dos veces');
  assert.equal(server.accepted.size, 1, 'debe existir un solo evento aceptado');
  assert.equal((await read(db, 'queue_entries', event.id)).status, 'confirmed');
  assert.equal((await read(db, 'batch_cache', 'lote_1')).revision, 1);
});

test('dos peticiones desde la misma revisión: una gana y la otra entra en conflicto', async () => {
  const db = await initializeQueue(`res-race-${n++}`);
  const server = makeServer();

  const first = newEvent('lote_2', 0);
  await seed(db, first);
  const engine = createSyncEngine({ db, accountId: A, transport: async (e) => server.accept(e) });
  await engine.syncOnce();

  // Otro dispositivo ya avanzó el lote; este evento sigue creyendo en la revisión 0.
  const stale = newEvent('lote_2', 0);
  await seed(db, stale);
  await engine.syncOnce();

  assert.equal((await read(db, 'queue_entries', first.id)).status, 'confirmed');
  assert.equal((await read(db, 'queue_entries', stale.id)).status, 'conflict');
  assert.equal(server.revisionOf('lote_2'), 1, 'la revisión avanza exactamente uno');
  assert.equal(await getReservation(db, A, 'lote_2'), null,
    'el conflicto suelta la reserva para que el operario pueda reintentar con un evento nuevo');
});

test('entrega duplicada desde dos pestañas: la segunda no vuelve a avanzar', async () => {
  const db = await initializeQueue(`res-dup-${n++}`);
  const event = newEvent('lote_3', 0);
  await seed(db, event);

  const receipt = {
    eventId: event.id, acceptedAt: '2026-09-06T15:00:00.000Z',
    batchRevisionAfter: 1, serverEventPath: `field_events/${event.id}`,
  };
  const args = { accountId: A, eventId: event.id, batchId: 'lote_3', receipt };

  const [one, two] = [await reconcileReceipt(db, args), await reconcileReceipt(db, args)];

  assert.equal(one.applied, true);
  assert.deepEqual(two, { applied: false, reason: 'already_confirmed' });
  assert.equal((await read(db, 'batch_cache', 'lote_3')).revision, 1);
});

test('reinicio durante la persistencia local: nunca queda un evento sin su reserva', async () => {
  const name = `res-persist-${n++}`;
  let db = await initializeQueue(name);
  const event = newEvent('lote_4', 0);
  await seed(db, event);

  db.close();
  db = await initializeQueue(name);

  const stored = await read(db, 'field_events', event.id);
  const entry = await read(db, 'queue_entries', event.id);
  const reservation = await getReservation(db, A, 'lote_4');

  // persistFieldEvent escribe los tres en una sola transacción: o están todos
  // o no está ninguno. Un evento huérfano bloquearía el lote sin nada que lo libere.
  const present = [stored, entry, reservation].filter(Boolean).length;
  assert.ok(present === 0 || present === 3, `estado parcial tras reinicio: ${present}/3`);
  assert.equal(present, 3);
});

test('reinicio durante el envío: el evento se reenvía con el mismo id', async () => {
  const name = `res-send-${n++}`;
  let db = await initializeQueue(name);
  const server = makeServer();
  const event = newEvent('lote_5', 0);
  await seed(db, event);

  const engine = createSyncEngine({
    db, accountId: A,
    transport: async () => { throw Object.assign(new Error('network_error'), { code: 'network_error' }); },
  });
  await engine.syncOnce();

  db.close();
  db = await initializeQueue(name);

  const sent = [];
  const session = createAccountSession({
    db,
    createEngine: (acct) => createSyncEngine({
      db, accountId: acct, now: () => 9e12,
      transport: async (env) => { sent.push(env.event.id); return server.accept(env); },
    }),
  });
  await session.switchTo(A);
  await session.engine().syncOnce();

  assert.deepEqual(sent, [event.id], 'el id debe sobrevivir al reinicio');
  assert.equal((await read(db, 'queue_entries', event.id)).status, 'confirmed');
});

test('reinicio durante la reconciliación: repetirla es inocua y la revisión no retrocede', async () => {
  const name = `res-recon-${n++}`;
  let db = await initializeQueue(name);
  const event = newEvent('lote_6', 0);
  await seed(db, event);

  const receipt = {
    eventId: event.id, acceptedAt: '2026-09-06T15:00:00.000Z',
    batchRevisionAfter: 3, serverEventPath: `field_events/${event.id}`,
  };
  await reconcileReceipt(db, { accountId: A, eventId: event.id, batchId: 'lote_6', receipt });

  db.close();
  db = await initializeQueue(name);

  // La aplicación reintenta la reconciliación al arrancar, sin saber si alcanzó a terminar.
  const again = await reconcileReceipt(db, { accountId: A, eventId: event.id, batchId: 'lote_6', receipt });
  assert.equal(again.applied, false);
  assert.equal(again.reason, 'already_confirmed');
  assert.equal((await read(db, 'batch_cache', 'lote_6')).revision, 3);

  // Y un recibo más viejo que llega tarde tampoco la hace retroceder.
  const older = { ...receipt, batchRevisionAfter: 1 };
  await reconcileReceipt(db, { accountId: A, eventId: event.id, batchId: 'lote_6', receipt: older });
  assert.equal((await read(db, 'batch_cache', 'lote_6')).revision, 3);
});

test('cambio de cuenta con trabajo pendiente y una petición en vuelo', async () => {
  const db = await initializeQueue(`res-acct-${n++}`);
  const server = makeServer();
  const slow = newEvent('lote_7', 0);
  await seed(db, slow, A);
  await seed(db, newEvent('lote_8', 0), B);

  let release;
  const gate = new Promise(r => { release = r; });
  const engineA = createSyncEngine({
    db, accountId: A,
    transport: async (env) => { await gate; return server.accept(env); },
  });
  const inFlight = engineA.syncOnce();

  const session = createAccountSession({
    db, createEngine: (acct) => createSyncEngine({
      db, accountId: acct,
      transport: async () => { throw Object.assign(new Error('network_error'), { code: 'network_error' }); },
    }),
  });
  await session.switchTo(B);
  release();
  await inFlight;

  assert.equal((await read(db, 'queue_entries', slow.id)).status, 'confirmed');
  assert.equal((await read(db, 'batch_cache', 'lote_7')).accountId, A,
    'la respuesta se acredita a la cuenta que la originó');
  assert.equal(await read(db, 'batch_cache', 'lote_8'), null, 'la cuenta B no se ve afectada');
});
