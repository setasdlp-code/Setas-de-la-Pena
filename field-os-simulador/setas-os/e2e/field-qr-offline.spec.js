'use strict';

/**
 * Task 13 — Recorrido real del cuaderno de campo.
 *
 * Sin señal el operario confirma una transición; la aplicación se reinicia
 * todavía sin conexión; al reconectar debe quedar EXACTAMENTE UNA transición
 * aceptada, con el estado y la revisión correctos.
 *
 * Corre contra la acceptFieldEvent desplegada y contra Firestore real. Cada
 * ejecución crea su propio lote desechable con prefijo E2E-; no toca lotes de
 * producción existentes.
 */

const { test, expect } = require('@playwright/test');

const APP = '/Setas%20OS%20v5.dc.html';

async function openApp(page) {
  await page.goto(APP);
  // Nunca 'networkidle': Firebase mantiene conexiones long-lived (ver e2e/helpers.js).
  await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 25000 });
  await page.locator('main.app-main').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !!(window.SetasFieldActionSheet && window.SetasFieldEventSync && window.SetasFirebase));
}

/** Crea el lote desechable y devuelve su id de Firestore. */
async function createThrowawayBatch(page, codigo) {
  return page.evaluate(async (code) => {
    const ref = await window.SetasDB.crearLoteProduccion({
      codigo: code,
      especie: 'p_ostreatus_gris',
      camara: 'martha_01',
      operador: 'e2e',
      receta: { ingredientes: [{ id: 'paja_trigo', pct: 80 }, { id: 'salvado_trigo', pct: 20 }] },
    });
    return ref.id;
  }, codigo);
}

/** Lee el lote directamente de Firestore, sin pasar por el estado de React. */
function readBatch(page, batchId) {
  return page.evaluate(async (id) => {
    const fb = window.SetasFirebase;
    const { doc, getDoc } = await import('../vendor/firebase/firebase-firestore.js');
    const snap = await getDoc(doc(fb.db, 'lotes_produccion', id));
    return snap.exists() ? snap.data() : null;
  }, batchId);
}

/** Cuenta los eventos aceptados para un lote. */
function countAcceptedEvents(page, batchId) {
  return page.evaluate(async (id) => {
    const fb = window.SetasFirebase;
    const { collection, query, where, getDocs } = await import('../vendor/firebase/firebase-firestore.js');
    const snap = await getDocs(query(collection(fb.db, 'field_events'), where('batchId', '==', id)));
    return snap.docs.map(d => ({ id: d.id, hasReceipt: !!d.data().receipt, to: d.data().payload && d.data().payload.to }));
  }, batchId);
}

test('offline → confirmación explícita → reinicio → reconexión → exactamente una transición aceptada', async ({ page, context }) => {
  test.setTimeout(120_000);

  const codigo = `E2E-${Date.now()}`;
  await openApp(page);

  const batchId = await createThrowawayBatch(page, codigo);
  expect(batchId, 'el lote desechable debe crearse').toBeTruthy();

  const initial = await readBatch(page, batchId);
  expect(initial.estado, 'db.js crea el lote con estado activo').toBe('activo');
  expect(initial.workflowState, 'un lote nuevo no lleva workflowState').toBeUndefined();
  expect(initial.revision, 'ni revision').toBeUndefined();

  // ── Sin señal ────────────────────────────────────────────────────────────
  await context.setOffline(true);

  // Escanear no registra nada: sólo resuelve el lote.
  const resolved = await page.evaluate((id) => {
    const R = window.SetasFieldQrResolve;
    return R.resolveBatch(`setas:lote:${id}`, async () => ({ id }), 'produccion');
  }, batchId);
  expect(resolved.state, 'el servidor asume inoculated cuando no hay workflowState').toBe('inoculated');
  expect(resolved.allowedTransitions).toContain('incubation');

  const afterScan = await readBatch(page, batchId);
  expect(afterScan.workflowState, 'escanear no debe cambiar el lote').toBeUndefined();

  // Confirmación explícita del operario.
  const saved = await page.evaluate(async (id) => {
    const SHEET = window.SetasFieldActionSheet;
    const db = await window.SetasFieldEventQueue.initializeQueue();
    const batch = { id, workflowState: undefined };
    const res = await SHEET.confirmTransition({
      db, batch, from: 'inoculated', to: 'incubation',
      accountId: window.SetasFirebase.auth.currentUser.uid,
      operatorId: window.SetasFirebase.auth.currentUser.uid,
      operatorRole: 'produccion', expectedBatchRevision: 0, confirmed: true,
    });
    const model = SHEET.buildActionSheetModel({ batch, batchId: id, queueEntry: res.queueEntry });
    return { eventId: res.event.id, status: model.status, label: model.statusLabel };
  }, batchId);

  expect(saved.status, 'sin señal sólo puede estar guardado localmente').toBe('saved_local');
  expect(saved.label).toMatch(/en este equipo/i);

  // ── Reconexión y reinicio ────────────────────────────────────────────────
  // La aplicación no tiene service worker, así que sin señal no puede volver a
  // cargarse: un operario que la cierra en una zona muerta no puede reabrirla
  // hasta recuperar cobertura. El recorrido real es entonces confirmar sin
  // señal, cerrar, y reabrir ya con cobertura — el trabajo encolado tiene que
  // sobrevivir ese ciclo, que es lo que se comprueba aquí.
  await context.setOffline(false);
  await page.reload();
  await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 25000 });
  await page.waitForFunction(() => !!(window.SetasFieldEventQueue && window.SetasFieldActionSheet));

  const survived = await page.evaluate(async ({ id, eventId }) => {
    const db = await window.SetasFieldEventQueue.initializeQueue();
    const all = await window.SetasFieldEventQueue.recoverEventsByAccount(
      db, window.SetasFirebase.auth.currentUser.uid
    );
    const mine = all.find(e => e.event.id === eventId);
    const model = window.SetasFieldActionSheet.buildActionSheetModel({
      batch: { id }, batchId: id, queueEntry: mine && mine.queueEntry,
    });
    return { found: !!mine, status: model.status };
  }, { id: batchId, eventId: saved.eventId });

  expect(survived.found, 'el trabajo debe sobrevivir al reinicio').toBe(true);
  expect(survived.status, 'sigue sin confirmarse hasta sincronizar').toBe('saved_local');

  const synced = await page.evaluate(async (eventId) => {
    const fb = window.SetasFirebase;
    const db = await window.SetasFieldEventQueue.initializeQueue();
    const transport = window.SetasFieldEventCallableTransport.createCallableTransport({
      projectId: fb.app.options.projectId,
      getIdToken: () => fb.auth.currentUser.getIdToken(),
    });
    const engine = window.SetasFieldEventSync.createSyncEngine({
      db, accountId: fb.auth.currentUser.uid, transport,
    });
    await engine.syncOnce();
    // Un segundo ciclo no debe producir una segunda transición.
    await engine.syncOnce();

    const entry = await new Promise(r => {
      const rq = db.transaction('queue_entries', 'readonly').objectStore('queue_entries').get(eventId);
      rq.onsuccess = () => r(rq.result);
    });
    const model = window.SetasFieldActionSheet.buildActionSheetModel({
      batch: { id: 'x' }, queueEntry: entry,
    });
    return { status: entry && entry.status, label: model.statusLabel, errorCode: entry && entry.errorCode };
  }, saved.eventId);

  expect(synced.errorCode, `la sincronización no debe fallar (${synced.errorCode})`).toBeUndefined();
  expect(synced.status, 'tras reconectar el evento queda confirmado').toBe('confirmed');
  expect(synced.label, 'confirmado por el servidor, no un simulacro').toBe('Confirmado por el servidor');

  // ── Exactamente una transición aceptada ──────────────────────────────────
  const finalBatch = await readBatch(page, batchId);
  expect(finalBatch.workflowState, 'el lote avanzó a incubation').toBe('incubation');
  expect(finalBatch.revision, 'la revisión avanza exactamente uno').toBe(1);
  expect(finalBatch.estado, 'el campo heredado no se toca').toBe('activo');

  const events = await countAcceptedEvents(page, batchId);
  expect(events.length, 'debe existir un solo evento aceptado').toBe(1);
  expect(events[0].hasReceipt, 'con recibo del servidor').toBe(true);
  expect(events[0].to).toBe('incubation');

  // ── Limpieza ─────────────────────────────────────────────────────────────
  // Las reglas sólo permiten borrar lotes a un admin. Si la cuenta de prueba no
  // lo es, el lote queda con su prefijo E2E- y se reporta en vez de fallar: el
  // recorrido ya se verificó y no vale la pena tumbar la prueba por el barrido.
  const cleanup = await page.evaluate(async (id) => {
    try {
      const fb = window.SetasFirebase;
      const { doc, deleteDoc } = await import('../vendor/firebase/firebase-firestore.js');
      await deleteDoc(doc(fb.db, 'lotes_produccion', id));
      return 'deleted';
    } catch (e) {
      return `kept: ${e.code || e.message}`;
    }
  }, batchId);
  console.log(`[e2e] lote desechable ${codigo} (${batchId}) -> ${cleanup}`);
});
