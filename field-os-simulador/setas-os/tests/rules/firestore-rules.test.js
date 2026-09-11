'use strict';

/**
 * Reglas de Firestore para el cuaderno de campo.
 * Requiere el emulador: se ejecuta vía `firebase emulators:exec`.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');
const fs = require('node:fs');
const path = require('node:path');

const RULES_PATH = path.join(__dirname, '..', '..', 'firebase', 'firestore.rules');

let env;

const RECETA_OK = {
  ingredientes: [{ pct: 60 }, { pct: 40 }],
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'sdlp-os-rules-test',
    firestore: { rules: fs.readFileSync(RULES_PATH, 'utf8') },
  });
});

after(async () => {
  if (env) await env.cleanup();
});

const asOperator = () => env.authenticatedContext('op_1').firestore();

const seed = (path, data) => env.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), path), data);
});

test('un cliente puede crear un lote sin campos de flujo', async () => {
  await assertSucceeds(setDoc(doc(asOperator(), 'lotes_produccion/l_new'), {
    codigo: 'L-1',
    recetaSnapshot: RECETA_OK,
  }));
});

test('un cliente no puede crear un lote con lifecycleState', async () => {
  await assertFails(setDoc(doc(asOperator(), 'lotes_produccion/l_ws'), {
    codigo: 'L-2',
    recetaSnapshot: RECETA_OK,
    lifecycleState: 'incubation',
  }));
});

test('un cliente no puede crear un lote con revision', async () => {
  await assertFails(setDoc(doc(asOperator(), 'lotes_produccion/l_rev'), {
    codigo: 'L-3',
    recetaSnapshot: RECETA_OK,
    revision: 1,
  }));
});

test('un cliente no puede mover lifecycleState de un lote existente', async () => {
  await seed('lotes_produccion/l_1', {
    codigo: 'L-4', recetaSnapshot: RECETA_OK, lifecycleState: 'inoculated', revision: 1,
  });
  await assertFails(updateDoc(doc(asOperator(), 'lotes_produccion/l_1'), {
    lifecycleState: 'fruiting',
  }));
});

test('un cliente no puede mover revision de un lote existente', async () => {
  await seed('lotes_produccion/l_2', {
    codigo: 'L-5', recetaSnapshot: RECETA_OK, lifecycleState: 'inoculated', revision: 1,
  });
  await assertFails(updateDoc(doc(asOperator(), 'lotes_produccion/l_2'), { revision: 99 }));
});

test('un cliente sigue pudiendo editar otros campos del lote', async () => {
  await seed('lotes_produccion/l_3', {
    codigo: 'L-6', recetaSnapshot: RECETA_OK, lifecycleState: 'inoculated', revision: 1,
  });
  // Regresión: las reglas nuevas no deben romper las escrituras que ya existían.
  await assertSucceeds(updateDoc(doc(asOperator(), 'lotes_produccion/l_3'), { status: 'activo' }));
});

test('un lote sin campos de flujo se sigue actualizando', async () => {
  await seed('lotes_produccion/l_legacy', { codigo: 'L-7', recetaSnapshot: RECETA_OK, estado: 'activo' });
  await assertSucceeds(updateDoc(doc(asOperator(), 'lotes_produccion/l_legacy'), { status: 'cerrado' }));
});

test('un cliente no puede crear un evento de campo', async () => {
  await assertFails(setDoc(doc(asOperator(), 'field_events/e_1'), {
    batchId: 'l_1', type: 'batch_state_transition',
  }));
});

test('un cliente no puede modificar ni borrar un evento de campo', async () => {
  await seed('field_events/e_2', { batchId: 'l_1', accountId: 'op_1' });
  await assertFails(updateDoc(doc(asOperator(), 'field_events/e_2'), { batchId: 'otro' }));
});

test('un cliente autenticado puede leer eventos de campo', async () => {
  await seed('field_events/e_3', { batchId: 'l_1', accountId: 'op_1' });
  await assertSucceeds(getDoc(doc(asOperator(), 'field_events/e_3')));
});

test('un cliente sin sesión no puede leer eventos de campo', async () => {
  await seed('field_events/e_4', { batchId: 'l_1', accountId: 'op_1' });
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'field_events/e_4')));
});
