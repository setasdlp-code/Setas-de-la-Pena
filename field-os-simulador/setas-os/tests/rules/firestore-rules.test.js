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
const { doc, getDoc, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');
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

// Bitácora: un borrado es una lápida (ADR-0009). Un delete físico se rechaza
// en las tres colecciones, para que ningún cliente (viejo o escrito a mano)
// haga desaparecer un documento sin que los demás dispositivos lo vean.
test('un lote de Bitácora no se borra físicamente', async () => {
  await seed('bitacora_lotes/b_del', { codigo: 'B-8', estado: 'planificado' });
  await assertFails(deleteDoc(doc(asOperator(), 'bitacora_lotes/b_del')));
});

test('una bolsa de Bitácora no se borra físicamente, pero sí se marca como borrada', async () => {
  await seed('bitacora_bolsas/bg_del', { loteId: 'b_del', numero: 1 });
  await assertFails(deleteDoc(doc(asOperator(), 'bitacora_bolsas/bg_del')));
  await assertSucceeds(setDoc(doc(asOperator(), 'bitacora_bolsas/bg_del'), { deleted: true }, { merge: true }));
});

test('una cosecha de Bitácora no se borra físicamente, pero sí se marca como borrada', async () => {
  await seed('bitacora_cosechas/c_del', { loteId: 'b_del', pesoFresco: 800 });
  await assertFails(deleteDoc(doc(asOperator(), 'bitacora_cosechas/c_del')));
  await assertSucceeds(setDoc(doc(asOperator(), 'bitacora_cosechas/c_del'), { deleted: true }, { merge: true }));
});

test('bolsas y cosechas siguen pudiendo crearse y leerse; la foto sigue prohibida', async () => {
  await assertSucceeds(setDoc(doc(asOperator(), 'bitacora_bolsas/bg_new'), { loteId: 'b_1', numero: 2 }));
  await assertFails(setDoc(doc(asOperator(), 'bitacora_bolsas/bg_foto'), { loteId: 'b_1', foto: 'data:image/png;base64,AAAA' }));
  await assertSucceeds(setDoc(doc(asOperator(), 'bitacora_cosechas/c_new'), { loteId: 'b_1', pesoFresco: 500 }));
  await assertSucceeds(getDoc(doc(asOperator(), 'bitacora_cosechas/c_new')));
  await assertSucceeds(getDoc(doc(asOperator(), 'bitacora_bolsas/bg_new')));
});

// Balance de masa: la suma se recalcula con hasta 12 ingredientes. Antes solo
// contaba los 8 primeros y rechazaba recetas legítimas más largas.
const ingredientes = (n, total = 100) => Array.from({ length: n }, () => ({ pct: total / n }));

test('una receta balanceada se acepta con 8, 9 y 12 ingredientes', async () => {
  for (const n of [8, 9, 12]) {
    await assertSucceeds(setDoc(doc(asOperator(), `lotes_produccion/m_ok_${n}`), {
      codigo: `M-${n}`, recetaSnapshot: { ingredientes: ingredientes(n) },
    }));
  }
});

test('una receta con 13 ingredientes se rechaza aunque los 12 primeros sumen 100', async () => {
  const rec = [...ingredientes(12), { pct: 0 }];
  await assertFails(setDoc(doc(asOperator(), 'lotes_produccion/m_13'), {
    codigo: 'M-13', recetaSnapshot: { ingredientes: rec },
  }));
});

test('una receta que no suma 100 se rechaza con 9 y con 12 ingredientes', async () => {
  for (const n of [9, 12]) {
    await assertFails(setDoc(doc(asOperator(), `lotes_produccion/m_bad_${n}`), {
      codigo: `MB-${n}`, recetaSnapshot: { ingredientes: ingredientes(n, 90) },
    }));
  }
});

test('el ingrediente 9 o posterior cuenta: una mezcla que solo suma 100 sin él se rechaza', async () => {
  const rec = [...ingredientes(8, 100), { pct: 20 }];
  await assertFails(setDoc(doc(asOperator(), 'lotes_produccion/m_over'), {
    codigo: 'M-OVER', recetaSnapshot: { ingredientes: rec },
  }));
});

test('las recetas usan el mismo balance de masa', async () => {
  await assertSucceeds(setDoc(doc(asOperator(), 'recetas/r_12'), { ingredientes: ingredientes(12) }));
  await assertFails(setDoc(doc(asOperator(), 'recetas/r_13'), { ingredientes: [...ingredientes(12), { pct: 0 }] }));
  await assertFails(setDoc(doc(asOperator(), 'recetas/r_bad'), { ingredientes: ingredientes(10, 80) }));
});

// role() no debe fallar cuando la cuenta no tiene documento en usuarios/.
test('una cuenta sin documento en usuarios/ no es admin, y las reglas no se rompen', async () => {
  await seed('recetas/r_admin', { ingredientes: ingredientes(2) });
  await assertFails(deleteDoc(doc(asOperator(), 'recetas/r_admin')));
  await assertFails(setDoc(doc(asOperator(), 'usuarios/otro'), { rol: 'admin' }));
});

test('un admin con documento en usuarios/ sigue pudiendo borrar recetas', async () => {
  await seed('usuarios/adm_1', { rol: 'admin' });
  await seed('recetas/r_admin2', { ingredientes: ingredientes(2) });
  await assertSucceeds(deleteDoc(doc(env.authenticatedContext('adm_1').firestore(), 'recetas/r_admin2')));
});

test('la cuenta de sincronización escribe en public_lotes sin documento en usuarios/', async () => {
  const svc = env.authenticatedContext('svc_1', { sync_service: true }).firestore();
  await assertSucceeds(setDoc(doc(svc, 'public_lotes/SDP-X'), { codigo: 'SDP-X', estado: 'incubacion' }));
  await assertFails(setDoc(doc(asOperator(), 'public_lotes/SDP-Y'), { codigo: 'SDP-Y', estado: 'incubacion' }));
});

// ── Bandeja de correos de compra ────────────────────────────────────────────
const CORREO = { estado: 'nueva', remitente: 'pedidos@homecenter.com.co', asunto: 'Pedido', cuerpo: 'Cal 25 kg' };

test('un cliente no puede crear un correo de compra (sólo la función programada)', async () => {
  await assertFails(setDoc(doc(asOperator(), 'correos_compra/mail_x'), CORREO));
});

test('un cliente puede marcar un correo nuevo como importado o descartado', async () => {
  await seed('correos_compra/mail_a', CORREO);
  await seed('correos_compra/mail_b', CORREO);
  await assertSucceeds(updateDoc(doc(asOperator(), 'correos_compra/mail_a'), { estado: 'importada', compraId: 'compra_1', revisadoEn: new Date() }));
  await assertSucceeds(updateDoc(doc(asOperator(), 'correos_compra/mail_b'), { estado: 'descartada', compraId: null }));
});

test('un correo ya importado no vuelve a la bandeja ni se reescribe', async () => {
  await seed('correos_compra/mail_c', { ...CORREO, estado: 'importada' });
  await assertFails(updateDoc(doc(asOperator(), 'correos_compra/mail_c'), { estado: 'nueva' }));
  await assertFails(updateDoc(doc(asOperator(), 'correos_compra/mail_c'), { estado: 'descartada' }));
});

test('al marcar un correo no se puede cambiar su contenido', async () => {
  await seed('correos_compra/mail_d', CORREO);
  await assertFails(updateDoc(doc(asOperator(), 'correos_compra/mail_d'), { estado: 'importada', cuerpo: 'otro' }));
  await assertFails(deleteDoc(doc(asOperator(), 'correos_compra/mail_d')));
});

test('sin sesión no se leen correos de compra', async () => {
  await seed('correos_compra/mail_e', CORREO);
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'correos_compra/mail_e')));
  await assertSucceeds(getDoc(doc(asOperator(), 'correos_compra/mail_e')));
});
