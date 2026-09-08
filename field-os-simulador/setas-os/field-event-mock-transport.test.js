'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
require('fake-indexeddb/auto');

const { createMockTransport } = require('./field-event-mock-transport.js');
const { initializeQueue, persistFieldEvent, getReservation } = require('./field-event-queue.js');
const { createSyncEngine } = require('./field-event-sync.js');
const { createFieldEvent } = require('./field-events-model.js');
const { validateReceipt } = require('./field-event-contracts.js');

const fakeStorage = () => {
  let v = null;
  return { getItem: () => v, setItem: (_k, s) => { v = s; } };
};

const envelopeFor = (batchId, revision) => ({
  schemaVersion: 1,
  accountId: 'acct_A',
  event: createFieldEvent(batchId, 'inoculated', 'incubation', 'op_1', '2026-09-06T14:30:00Z', revision),
});

test('emite un recibo válido y marcado como simulado', async () => {
  const { transport } = createMockTransport({ storage: fakeStorage() });
  const receipt = await transport(envelopeFor('lote_1', 0));

  assert.equal(validateReceipt(receipt), true);
  assert.equal(receipt.batchRevisionAfter, 1);
  assert.equal(receipt.simulated, true, 'un simulacro nunca debe parecer una confirmación real');
});

test('reenviar el mismo evento devuelve el recibo original y no avanza el lote', async () => {
  const mock = createMockTransport({ storage: fakeStorage() });
  const env = envelopeFor('lote_2', 0);

  const first = await mock.transport(env);
  const second = await mock.transport(env);

  assert.deepEqual(second, first);
  assert.equal(mock.stateOf('lote_2'), 1, 'la revisión sólo avanza una vez');
});

test('una revisión desfasada produce revision_conflict, como el servidor real', async () => {
  const mock = createMockTransport({ storage: fakeStorage() });
  await mock.transport(envelopeFor('lote_3', 0));

  await assert.rejects(() => mock.transport(envelopeFor('lote_3', 0)), /revision_conflict/);
  assert.equal(mock.stateOf('lote_3'), 1);
});

test('rechaza adjuntos igual que el servidor: v1 no los soporta', async () => {
  const { transport } = createMockTransport({ storage: fakeStorage() });
  const env = envelopeFor('lote_4', 0);
  const withAttachment = { ...env, event: { ...env.event, attachmentIds: ['foto'] } };

  await assert.rejects(() => transport(withAttachment), /invalid_envelope/);
});

test('el estado sobrevive a una recarga de la aplicación', async () => {
  const storage = fakeStorage();
  const env = envelopeFor('lote_5', 0);

  const first = await createMockTransport({ storage }).transport(env);
  // Nueva instancia = la página se recargó; el almacenamiento persiste.
  const afterReload = createMockTransport({ storage });

  assert.deepEqual(await afterReload.transport(env), first, 'debe seguir siendo idempotente tras recargar');
  assert.equal(afterReload.stateOf('lote_5'), 1);
});

test('un almacenamiento inaccesible no rompe el transporte', async () => {
  const hostile = {
    getItem: () => { throw new Error('SecurityError'); },
    setItem: () => { throw new Error('QuotaExceededError'); },
  };
  const { transport } = createMockTransport({ storage: hostile });

  // En modo privado el recibo se emite igual; sólo se pierde la memoria entre recargas.
  const receipt = await transport(envelopeFor('lote_6', 0));
  assert.equal(receipt.batchRevisionAfter, 1);
});

test('el ciclo completo contra el motor de sincronización deja el evento confirmado', async () => {
  const db = await initializeQueue('mock-transport-e2e');
  const { transport } = createMockTransport({ storage: fakeStorage() });
  const event = createFieldEvent('lote_7', 'inoculated', 'incubation', 'op_1', '2026-09-06T14:30:00Z', 0);

  await persistFieldEvent(db, event, { eventId: event.id, accountId: 'acct_A', status: 'pending' }, 'acct_A');
  const engine = createSyncEngine({ db, accountId: 'acct_A', transport });
  await engine.syncOnce();

  const entry = await new Promise((resolve, reject) => {
    const req = db.transaction('queue_entries', 'readonly').objectStore('queue_entries').get(event.id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  assert.equal(entry.status, 'confirmed');
  assert.equal(await getReservation(db, 'acct_A', 'lote_7'), null, 'la reserva se libera al confirmar');
});
