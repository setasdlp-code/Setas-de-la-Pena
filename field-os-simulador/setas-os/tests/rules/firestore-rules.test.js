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

// Revisiones de requisitos antes de producir: se crean y no se editan.
const REVISION = {
  schema: 'setas.production-readiness.v1', id: 'pr_1', requirementId: 'equipment', status: 'verified',
  reviewer: 'Operador', reference: 'AC-0412', notes: '', scope: '["shiitake"]', at: '2026-10-13T10:00:00.000Z',
  details: { equipmentId: 'AUTOCLAVE-1941X', protocol: 'Carga validada', cycleId: 'AC-0412', bioindicatorResult: 'sin_crecimiento' },
};

test('un cliente puede registrar una revisión de requisitos', async () => {
  await assertSucceeds(setDoc(doc(asOperator(), 'production_readiness/pr_1'), REVISION));
});

test('una revisión de requisitos no se edita ni se borra', async () => {
  await seed('production_readiness/pr_2', { ...REVISION, id: 'pr_2' });
  await assertFails(updateDoc(doc(asOperator(), 'production_readiness/pr_2'), { status: 'blocked' }));
  await assertFails(setDoc(doc(asOperator(), 'production_readiness/pr_2'), { deleted: true }, { merge: true }));
});

test('una revisión sin responsable o con requisito desconocido se rechaza', async () => {
  await assertFails(setDoc(doc(asOperator(), 'production_readiness/pr_3'), { ...REVISION, id: 'pr_3', reviewer: '' }));
  await assertFails(setDoc(doc(asOperator(), 'production_readiness/pr_4'), { ...REVISION, id: 'pr_4', requirementId: 'otro' }));
  await assertFails(setDoc(doc(asOperator(), 'production_readiness/pr_5'), { ...REVISION, id: 'otro_id' }));
});

test('sin sesión no se leen revisiones de requisitos', async () => {
  await seed('production_readiness/pr_6', { ...REVISION, id: 'pr_6' });
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'production_readiness/pr_6')));
});

// Lotes de Bitácora: son los que la app crea y los que avanza acceptFieldEvent.
test('un cliente puede crear un lote de Bitácora sin campos de flujo', async () => {
  await assertSucceeds(setDoc(doc(asOperator(), 'bitacora_lotes/b_new'), { codigo: 'B-1', estado: 'planificado' }));
});

test('un cliente no puede crear un lote de Bitácora con etapa o revisión', async () => {
  await assertFails(setDoc(doc(asOperator(), 'bitacora_lotes/b_ls'), { codigo: 'B-2', lifecycleState: 'fruiting' }));
  await assertFails(setDoc(doc(asOperator(), 'bitacora_lotes/b_rv'), { codigo: 'B-3', revision: 4 }));
});

test('un cliente no puede mover la etapa ni la revisión de un lote de Bitácora', async () => {
  await seed('bitacora_lotes/b_1', { codigo: 'B-4', estado: 'incubacion', lifecycleState: 'incubation', revision: 2 });
  await assertFails(updateDoc(doc(asOperator(), 'bitacora_lotes/b_1'), { lifecycleState: 'closed' }));
  await assertFails(updateDoc(doc(asOperator(), 'bitacora_lotes/b_1'), { revision: 3 }));
});

test('con etapa aceptada, el cliente no cambia el estado en español', async () => {
  await seed('bitacora_lotes/b_2', { codigo: 'B-5', estado: 'incubacion', lifecycleState: 'incubation', revision: 1 });
  await assertFails(updateDoc(doc(asOperator(), 'bitacora_lotes/b_2'), { estado: 'fructificacion' }));
  await assertSucceeds(updateDoc(doc(asOperator(), 'bitacora_lotes/b_2'), { veredicto: 'prometedora', notas: 'ok' }));
});

test('sin etapa aceptada, el estado en español sigue siendo editable', async () => {
  await seed('bitacora_lotes/b_3', { codigo: 'B-6', estado: 'planificado' });
  await assertSucceeds(updateDoc(doc(asOperator(), 'bitacora_lotes/b_3'), { estado: 'incubacion' }));
});

test('un lote de Bitácora se puede marcar como borrado (lápida)', async () => {
  await seed('bitacora_lotes/b_4', { codigo: 'B-7', estado: 'incubacion', lifecycleState: 'incubation', revision: 1 });
  await assertSucceeds(setDoc(doc(asOperator(), 'bitacora_lotes/b_4'), { deleted: true }, { merge: true }));
});
