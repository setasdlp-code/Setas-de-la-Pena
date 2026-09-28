'use strict';

/**
 * Aceptación de eventos de campo contra el emulador de Firestore.
 * Ejecutar con: npm run test:functions
 */

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const { createAcceptFieldEvent } = require('../../functions/accept-field-event.js');
const { createFieldEvent, createFieldEventV2 } = require('../../field-events-model.js');

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';

let app;
let db;
let accept;
let role = 'produccion';

before(() => {
  app = initializeApp({ projectId: 'sdlp-os-fn-test' });
  db = getFirestore(app);
  accept = createAcceptFieldEvent({ db, resolveRole: async () => role });
});

after(async () => {
  if (app) await deleteApp(app);
});

const wipe = async () => {
  for (const col of ['lotes_produccion', 'field_events', 'contenedores']) {
    const snap = await db.collection(col).get();
    await Promise.all(snap.docs.map(d => d.ref.delete()));
  }
};

beforeEach(async () => {
  role = 'produccion';
  await wipe();
});

const seedBatch = (id, extra = {}) =>
  db.collection('lotes_produccion').doc(id).set({ codigo: id, ...extra });

const envelopeFor = (batchId, from, to, revision) => {
  const event = createFieldEvent(batchId, from, to, 'ignored_by_server', '2026-09-06T14:30:00Z', revision);
  return { schemaVersion: 1, accountId: 'acct_1', event };
};

const envelopeForContainer = (containerId, batchId, from, to, entityRev = null, batchRev = null) => {
  const event = createFieldEventV2({
    entityType: 'container',
    entityId: containerId,
    batchId,
    eventType: 'state_transition',
    from,
    to,
    expectedEntityRevision: entityRev,
    expectedBatchRevision: batchRev,
    operatorId: 'ignored_by_server',
    occurredAt: '2026-09-20T14:30:00Z',
  });
  return { schemaVersion: 2, accountId: 'acct_1', event };
};

const AUTH = { uid: 'op_1' };

test('acepta la primera transición y devuelve un recibo válido', async () => {
  await seedBatch('l1');
  const env = envelopeFor('l1', 'inoculated', 'incubation', 0);

  const receipt = await accept(env, AUTH);

  assert.equal(receipt.eventId, env.event.id);
  assert.equal(receipt.batchRevisionAfter, 1);
  assert.equal(receipt.serverEventPath, `field_events/${env.event.id}`);

  const batch = (await db.collection('lotes_produccion').doc('l1').get()).data();
  assert.equal(batch.lifecycleState, 'incubation');
  assert.equal(batch.revision, 1);
  assert.equal(batch.codigo, 'l1', 'no debe borrar campos existentes');
});

test('el reenvío del mismo evento devuelve el recibo original y no avanza dos veces', async () => {
  await seedBatch('l2');
  const env = envelopeFor('l2', 'inoculated', 'incubation', 0);

  const first = await accept(env, AUTH);
  const second = await accept(env, AUTH);

  assert.deepEqual(second, first, 'el recibo debe ser idéntico');
  const batch = (await db.collection('lotes_produccion').doc('l2').get()).data();
  assert.equal(batch.revision, 1, 'la revisión sólo debe avanzar una vez');
});

test('el mismo id con contenido distinto se rechaza', async () => {
  await seedBatch('l3');
  const env = envelopeFor('l3', 'inoculated', 'incubation', 0);
  await accept(env, AUTH);

  const tampered = {
    ...env,
    event: { ...env.event, payload: { ...env.event.payload, to: 'quarantine' } },
  };
  await assert.rejects(() => accept(tampered, AUTH), /content_mismatch/);

  const batch = (await db.collection('lotes_produccion').doc('l3').get()).data();
  assert.equal(batch.lifecycleState, 'incubation', 'el lote no debe cambiar');
});

test('dos transiciones desde la misma revisión: una gana, la otra entra en conflicto', async () => {
  await seedBatch('l4');
  const a = envelopeFor('l4', 'inoculated', 'incubation', 0);
  const b = envelopeFor('l4', 'inoculated', 'quarantine', 0);

  const results = await Promise.allSettled([accept(a, AUTH), accept(b, AUTH)]);
  const ok = results.filter(r => r.status === 'fulfilled');
  const bad = results.filter(r => r.status === 'rejected');

  assert.equal(ok.length, 1, 'exactamente una debe ser aceptada');
  assert.equal(bad.length, 1);
  assert.match(bad[0].reason.message, /revision_conflict/);

  const batch = (await db.collection('lotes_produccion').doc('l4').get()).data();
  assert.equal(batch.revision, 1, 'la revisión avanza exactamente uno');
});

test('un evento almacenado sin recibo se rechaza como registro incompleto', async () => {
  await seedBatch('l5');
  const env = envelopeFor('l5', 'inoculated', 'incubation', 0);
  await db.collection('field_events').doc(env.event.id).set({ ...env.event });

  await assert.rejects(() => accept(env, AUTH), /incomplete_event_record/);
});

test('el operatorId del payload se ignora: manda la sesión', async () => {
  await seedBatch('l6');
  const env = envelopeFor('l6', 'inoculated', 'incubation', 0);
  const spoofed = { ...env, event: { ...env.event, operatorId: 'otra_persona' } };

  await accept(spoofed, AUTH);

  const stored = (await db.collection('field_events').doc(env.event.id).get()).data();
  assert.equal(stored.operatorId, 'op_1');
});

test('rechaza adjuntos: v1 no los soporta', async () => {
  await seedBatch('l7');
  const env = envelopeFor('l7', 'inoculated', 'incubation', 0);
  const withAttachment = { ...env, event: { ...env.event, attachmentIds: ['foto_1'] } };

  await assert.rejects(() => accept(withAttachment, AUTH), /attachmentIds/);
});

test('un lote inexistente se rechaza', async () => {
  const env = envelopeFor('no_existe', 'inoculated', 'incubation', 0);
  await assert.rejects(() => accept(env, AUTH), /batch_not_found/);
});

test('una transición no permitida por la máquina de estados se rechaza', async () => {
  await seedBatch('l8', { lifecycleState: 'incubation', revision: 2 });
  const env = envelopeFor('l8', 'incubation', 'planned', 2);
  await assert.rejects(() => accept(env, AUTH), /invalid_state_transition/);
});

test('un rol sin permiso para descartar se rechaza', async () => {
  await seedBatch('l9', { lifecycleState: 'quarantine', revision: 1 });
  role = 'operario';
  const env = envelopeFor('l9', 'quarantine', 'discarded', 1);
  await assert.rejects(() => accept(env, AUTH), /unauthorized_action/);
});

test('una llamada sin sesión se rechaza', async () => {
  const env = envelopeFor('l10', 'inoculated', 'incubation', 0);
  await assert.rejects(() => accept(env, null), /unauthenticated/);
});

test('un lote recién creado admite el recorrido principal inoculado -> incubación', async () => {
  // db.js crea el lote con estado 'activo' en el momento de la inoculación
  // (knowledge_base/06_operations/batch_tracking.md:32), así que el primer
  // registro del operario en campo debe ser exactamente esta transición.
  const { normalizeLifecycleState } = require('../../batch-sheet.js');
  await seedBatch('l11', { estado: 'activo' });
  assert.equal(normalizeLifecycleState('activo', 'inoculated'), 'inoculated');

  const receipt = await accept(envelopeFor('l11', 'inoculated', 'incubation', 0), AUTH);
  assert.equal(receipt.batchRevisionAfter, 1);

  const batch = (await db.collection('lotes_produccion').doc('l11').get()).data();
  assert.equal(batch.estado, 'activo', 'el campo heredado no se toca');
  assert.equal(batch.lifecycleState, 'incubation');
});

test('un lote heredado en español se interpreta con su propio alias', async () => {
  const { normalizeLifecycleState } = require('../../batch-sheet.js');
  await seedBatch('l12', { estado: 'incubacion' });
  assert.equal(normalizeLifecycleState('incubacion', 'inoculated'), 'incubation');

  // Mandar el `from` equivocado debe fallar, no aceptarse por aproximación.
  await assert.rejects(
    () => accept(envelopeFor('l12', 'inoculated', 'incubation', 0), AUTH),
    /invalid_state_transition/
  );

  const receipt = await accept(envelopeFor('l12', 'incubation', 'maturation', 0), AUTH);
  assert.equal(receipt.batchRevisionAfter, 1);
  assert.equal((await db.collection('lotes_produccion').doc('l12').get()).data().lifecycleState, 'maturation');
});

// --- FieldEvent v2: Contenedores ------------------------------------------

test('acepta un evento v2 de contenedor, avanza la revisión del contenedor y proyecta en el lote', async () => {
  await seedBatch('l_v2_1');
  const env = envelopeForContainer('BAG-001', 'l_v2_1', 'inoculated', 'incubation', 0, 0);

  const receipt = await accept(env, AUTH);

  assert.equal(receipt.eventId, env.event.id);
  assert.equal(receipt.entityRevisionAfter, 1);
  assert.equal(receipt.batchRevisionAfter, 1);
  assert.equal(receipt.serverEventPath, `field_events/${env.event.id}`);

  const containerDoc = (await db.collection('contenedores').doc('BAG-001').get()).data();
  assert.equal(containerDoc.lifecycleState, 'incubation');
  assert.equal(containerDoc.revision, 1);
  assert.equal(containerDoc.batchId, 'l_v2_1');
  assert.equal(containerDoc.lastEventId, env.event.id);

  const batchDoc = (await db.collection('lotes_produccion').doc('l_v2_1').get()).data();
  assert.equal(batchDoc.revision, 1);
  assert.equal(batchDoc.lastEventId, env.event.id);
});

test('el reenvío del mismo evento v2 devuelve el recibo original de forma idempotente', async () => {
  await seedBatch('l_v2_2');
  const env = envelopeForContainer('BAG-002', 'l_v2_2', 'inoculated', 'incubation', 0, 0);

  const first = await accept(env, AUTH);
  const second = await accept(env, AUTH);

  assert.deepEqual(second, first);
  const containerDoc = (await db.collection('contenedores').doc('BAG-002').get()).data();
  assert.equal(containerDoc.revision, 1, 'la revisión del contenedor sólo debe avanzar una vez');
  const batchDoc = (await db.collection('lotes_produccion').doc('l_v2_2').get()).data();
  assert.equal(batchDoc.revision, 1, 'la revisión del lote sólo debe avanzar una vez');
});

test('conflicto de revisión optimista en el contenedor (expectedEntityRevision)', async () => {
  await seedBatch('l_v2_3');
  const env1 = envelopeForContainer('BAG-003', 'l_v2_3', 'inoculated', 'incubation', 0);
  await accept(env1, AUTH);

  // Intentar avanzar esperando revisión 0 cuando el contenedor ya está en revisión 1
  const envConflict = envelopeForContainer('BAG-003', 'l_v2_3', 'incubation', 'fruiting', 0);
  await assert.rejects(() => accept(envConflict, AUTH), /revision_conflict/);
});

test('dos contenedores distintos del mismo lote avanzan concurrentemente sin bloquearse', async () => {
  await seedBatch('l_v2_4');
  const envA = envelopeForContainer('BAG-004A', 'l_v2_4', 'inoculated', 'incubation', 0);
  const envB = envelopeForContainer('BAG-004B', 'l_v2_4', 'inoculated', 'incubation', 0);

  const [resA, resB] = await Promise.all([accept(envA, AUTH), accept(envB, AUTH)]);

  assert.equal(resA.entityRevisionAfter, 1);
  assert.equal(resB.entityRevisionAfter, 1);

  const docA = (await db.collection('contenedores').doc('BAG-004A').get()).data();
  const docB = (await db.collection('contenedores').doc('BAG-004B').get()).data();
  assert.equal(docA.revision, 1);
  assert.equal(docB.revision, 1);

  const batchDoc = (await db.collection('lotes_produccion').doc('l_v2_4').get()).data();
  assert.equal(batchDoc.revision, 2, 'el lote proyecta ambos eventos y suma 2 revisiones');
});

test('evento v2 sin entityId se rechaza', async () => {
  await seedBatch('l_v2_5');
  const badEnv = {
    schemaVersion: 2,
    accountId: 'acct_1',
    event: {
      id: 'evt_bad',
      schemaVersion: 2,
      entityType: 'container',
      batchId: 'l_v2_5',
      attachmentIds: [],
    },
  };
  await assert.rejects(() => accept(badEnv, AUTH), /invalid_envelope/);
});
