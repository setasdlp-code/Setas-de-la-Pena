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
const { createFieldEvent } = require('../../field-events-model.js');

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
  for (const col of ['lotes_produccion', 'field_events']) {
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

const AUTH = { uid: 'op_1' };

test('acepta la primera transición y devuelve un recibo válido', async () => {
  await seedBatch('l1');
  const env = envelopeFor('l1', 'inoculated', 'incubation', 0);

  const receipt = await accept(env, AUTH);

  assert.equal(receipt.eventId, env.event.id);
  assert.equal(receipt.batchRevisionAfter, 1);
  assert.equal(receipt.serverEventPath, `field_events/${env.event.id}`);

  const batch = (await db.collection('lotes_produccion').doc('l1').get()).data();
  assert.equal(batch.workflowState, 'incubation');
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
  assert.equal(batch.workflowState, 'incubation', 'el lote no debe cambiar');
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
  await seedBatch('l8', { workflowState: 'incubation', revision: 2 });
  const env = envelopeFor('l8', 'incubation', 'planned', 2);
  await assert.rejects(() => accept(env, AUTH), /invalid_state_transition/);
});

test('un rol sin permiso para descartar se rechaza', async () => {
  await seedBatch('l9', { workflowState: 'quarantine', revision: 1 });
  role = 'operario';
  const env = envelopeFor('l9', 'quarantine', 'discarded', 1);
  await assert.rejects(() => accept(env, AUTH), /unauthorized_action/);
});

test('una llamada sin sesión se rechaza', async () => {
  const env = envelopeFor('l10', 'inoculated', 'incubation', 0);
  await assert.rejects(() => accept(env, null), /unauthenticated/);
});

test('un lote heredado sin workflowState arranca en el estado inicial del servidor', async () => {
  await seedBatch('l11', { estado: 'activo' });
  const env = envelopeFor('l11', 'inoculated', 'incubation', 0);

  const receipt = await accept(env, AUTH);
  assert.equal(receipt.batchRevisionAfter, 1);

  const batch = (await db.collection('lotes_produccion').doc('l11').get()).data();
  assert.equal(batch.estado, 'activo', 'el campo heredado no se toca');
  assert.equal(batch.workflowState, 'incubation');
});
