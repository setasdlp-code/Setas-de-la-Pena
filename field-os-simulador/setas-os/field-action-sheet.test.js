'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

require('fake-indexeddb/auto');

const {
  buildActionSheetModel,
  confirmTransition,
  DEFAULT_INITIAL_STATE,
} = require('./field-action-sheet.js');
const { initializeQueue, releaseReservation } = require('./field-event-queue.js');

// 1. pending → saved_local; confirmed → confirmed; assert the two statusLabel strings are not equal
test('pending produce saved_local y confirmed produce confirmed con etiquetas distintas (G11)', () => {
  const mPending = buildActionSheetModel({ queueEntry: { status: 'pending' } });
  assert.equal(mPending.status, 'saved_local');

  const mConfirmed = buildActionSheetModel({ queueEntry: { status: 'confirmed' } });
  assert.equal(mConfirmed.status, 'confirmed');

  assert.notEqual(mPending.statusLabel, mConfirmed.statusLabel, 'Las etiquetas de estado deben ser claramente distintas para el operario');
  assert.match(mPending.statusLabel, /equipo|local/i);
  assert.match(mConfirmed.statusLabel, /servidor/i);
});

// 2. retry_wait renders saved_local — never confirmed
test('retry_wait produce saved_local y jamás confirmed', () => {
  const m = buildActionSheetModel({ queueEntry: { status: 'retry_wait' } });
  assert.equal(m.status, 'saved_local');
  assert.notEqual(m.status, 'confirmed');
  assert.notEqual(m.statusLabel, buildActionSheetModel({ queueEntry: { status: 'confirmed' } }).statusLabel);
});

// 3. inFlight: true renders sending regardless of the stored status
test('inFlight: true produce sending sin importar el estado almacenado en la cola', () => {
  for (const stored of ['pending', 'retry_wait', 'confirmed', 'conflict', 'rejected']) {
    const m = buildActionSheetModel({ queueEntry: { status: stored }, inFlight: true });
    assert.equal(m.status, 'sending', `inFlight con estado "${stored}" debe ser sending`);
  }
  const mNoQueue = buildActionSheetModel({ queueEntry: null, inFlight: true });
  assert.equal(mNoQueue.status, 'sending');
});

// 4. No queueEntry → idle and canConfirm is true when transitions exist
test('sin queueEntry produce idle y canConfirm es true cuando hay opciones', () => {
  const m = buildActionSheetModel({
    batch: { id: 'L-1', workflowState: 'inoculated' },
    allowedTransitions: ['incubation'],
    queueEntry: null,
  });
  assert.equal(m.status, 'idle');
  assert.equal(m.canConfirm, true);
  assert.equal(m.canRefresh, false);
});

// 5. A terminal batch (closed) → options is [] and canConfirm is false
test('un lote terminal (closed) no ofrece opciones y canConfirm es false', () => {
  const m = buildActionSheetModel({
    batch: { id: 'L-closed', workflowState: 'closed' },
    allowedTransitions: [],
  });
  assert.deepEqual(m.options, []);
  assert.equal(m.canConfirm, false);
});

// 6. conflict → canRefresh true, canConfirm false
test('conflict activa canRefresh y desactiva canConfirm', () => {
  const m = buildActionSheetModel({
    batch: { id: 'L-1', workflowState: 'inoculated' },
    allowedTransitions: ['incubation'],
    queueEntry: { status: 'conflict' },
  });
  assert.equal(m.status, 'conflict');
  assert.equal(m.canRefresh, true);
  assert.equal(m.canConfirm, false);
});

// 7. buildActionSheetModel called with no db in scope returns a model — assert it is pure
test('buildActionSheetModel es una función pura que no toca IndexedDB', () => {
  const src = fs.readFileSync('field-action-sheet.js', 'utf8');
  assert.ok(!/indexedDB|\.transaction\(|objectStore/.test(src),
    'el módulo no debe contener referencias directas a indexedDB o transacciones');

  // Llamada sin db ni cola inicializada
  const m = buildActionSheetModel({
    batch: { id: 'L-pure', workflowState: 'inoculated' },
    allowedTransitions: ['incubation'],
  });
  assert.ok(m);
  assert.equal(m.title, 'Lote L-pure');
  assert.equal(m.status, 'idle');
});

// 8. confirmTransition without confirmed: true throws and persists nothing
test('confirmTransition sin confirmed: true lanza operator_confirmation_required y no persiste nada', async () => {
  const dbName = 'test-db-confirm-false';
  const db = await initializeQueue(dbName);

  await assert.rejects(
    () => confirmTransition({
      db,
      batch: { id: 'L-1', state: 'inoculated' },
      from: 'inoculated',
      to: 'incubation',
      accountId: 'acc_1',
      operatorId: 'op_1',
      operatorRole: 'operario',
      confirmed: false,
    }),
    /operator_confirmation_required/
  );

  // Verificar que los almacenes continúan estrictamente vacíos
  for (const storeName of ['field_events', 'queue_entries', 'pending_batch_transitions']) {
    const count = await new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
    });
    assert.equal(count, 0, `El almacén ${storeName} debe estar vacío tras rechazo`);
  }

  db.close();
});

// 9. confirmTransition twice after a conflict produces two different event ids
test('confirmTransition dos veces tras conflicto genera dos eventId distintos (G9)', async () => {
  const dbName = 'test-db-conflict-ids';
  const db = await initializeQueue(dbName);
  const accountId = 'acc_conflict';
  const batchId = 'L-conf-1';

  // Primera confirmación
  const res1 = await confirmTransition({
    db,
    batch: { id: batchId, state: 'inoculated' },
    from: 'inoculated',
    to: 'incubation',
    accountId,
    operatorId: 'op_1',
    operatorRole: 'operario',
    confirmed: true,
  });
  assert.match(res1.event.id, /^evt_/);

  // Simular conflicto: en producción, el motor de sincronización libera la reserva
  // del evento conflictivo al recibir la respuesta del servidor (field-event-sync.js)
  const released = await releaseReservation(db, accountId, batchId, res1.event.id);
  assert.equal(released, 'released');

  // Segunda confirmación tras refresco
  const res2 = await confirmTransition({
    db,
    batch: { id: batchId, state: 'inoculated' },
    from: 'inoculated',
    to: 'incubation',
    accountId,
    operatorId: 'op_1',
    operatorRole: 'operario',
    confirmed: true,
  });
  assert.match(res2.event.id, /^evt_/);

  assert.notEqual(res1.event.id, res2.event.id, 'Cada confirmación debe producir un nuevo eventId');

  db.close();
});

// 10. confirmTransition for a transition the role may not perform throws unauthorized_action and persists nothing
test('confirmTransition para una transición no autorizada lanza unauthorized_action y no persiste nada', async () => {
  const dbName = 'test-db-unauthorized';
  const db = await initializeQueue(dbName);

  await assert.rejects(
    () => confirmTransition({
      db,
      batch: { id: 'L-unauth', workflowState: 'incubation' },
      from: 'incubation',
      to: 'quarantine',
      accountId: 'acc_1',
      operatorId: 'op_1',
      operatorRole: 'operario', // operario no puede enviar a cuarentena
      confirmed: true,
    }),
    /unauthorized_action/
  );

  // Verificar que nada se escribió en IndexedDB
  for (const storeName of ['field_events', 'queue_entries', 'pending_batch_transitions']) {
    const count = await new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
    });
    assert.equal(count, 0, `El almacén ${storeName} no debe tener registros tras acción no autorizada`);
  }

  db.close();
});

// 11. The module loads in a vm sandbox with only {window, indexedDB, crypto, console}
const loadInBrowserOrder = (file) => {
  const sandbox = { window: {}, indexedDB: {}, crypto, console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return sandbox;
};

test('el módulo carga en el orden real del navegador en un sandbox vm', () => {
  const sandbox = loadInBrowserOrder('field-action-sheet.js');
  assert.ok(sandbox.SetasFieldActionSheet, 'debe publicar SetasFieldActionSheet');
  assert.equal(typeof sandbox.SetasFieldActionSheet.buildActionSheetModel, 'function');
  assert.equal(typeof sandbox.SetasFieldActionSheet.confirmTransition, 'function');
  assert.equal(sandbox.SetasFieldActionSheet.DEFAULT_INITIAL_STATE, 'inoculated');
});

// 12. Garantía de continuidad operativa: lotes existentes sin workflowState ({ estado: "activo" })
test('un lote existente sin workflowState asume DEFAULT_INITIAL_STATE ("inoculated") y ofrece "incubation" al operario', () => {
  const m = buildActionSheetModel({
    batch: { id: 'L-legacy-1', estado: 'activo' },
    operatorRole: 'operario',
  });
  assert.equal(m.state, DEFAULT_INITIAL_STATE);
  assert.equal(m.status, 'idle');
  assert.equal(m.canConfirm, true);
  assert.deepEqual(m.options.map(o => o.to), ['incubation']);
});

// 13. Garantía G10: resolver o abrir la hoja no realiza escrituras en base de datos
test('abrir la hoja de acción y computar el modelo no escribe en IndexedDB (G10)', async () => {
  const dbName = 'test-db-g10-no-write';
  const db = await initializeQueue(dbName);

  // Resolver lote y construir modelo
  const model = buildActionSheetModel({
    batch: { id: 'L-g10', estado: 'activo' },
    operatorRole: 'operario',
    queueEntry: null,
    inFlight: false,
  });
  assert.ok(model);

  // Comprobar que ningún store ha sido tocado
  for (const storeName of ['field_events', 'queue_entries', 'pending_batch_transitions']) {
    const count = await new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
    });
    assert.equal(count, 0, `El almacén ${storeName} debe permanecer intacto tras abrir la hoja`);
  }

  db.close();
});

// 14. Alineación estricta cliente-servidor: no leer 'estado' para evitar divergencia con el servidor
test('un lote con estado heredado no diverge del servidor y resuelve a DEFAULT_INITIAL_STATE', () => {
  const m = buildActionSheetModel({
    batch: { id: 'L-legacy-incubacion', estado: 'incubacion' }, // sin workflowState
    operatorRole: 'operario',
  });
  // El servidor asume batch.workflowState || DEFAULT_INITIAL_STATE ('inoculated').
  // El cliente no debe inventar 'incubation', pues provocaría invalid_state_transition en el servidor.
  assert.equal(m.state, DEFAULT_INITIAL_STATE);
  assert.deepEqual(m.options.map(o => o.to), ['incubation']);
});

test('un recibo simulado no se presenta como confirmación del servidor', () => {
  const base = { batch: { workflowState: 'incubation' }, batchId: 'L-1', queueEntry: { status: 'confirmed' } };

  const real = buildActionSheetModel(base);
  const mock = buildActionSheetModel({ ...base, simulated: true });

  assert.equal(real.statusLabel, 'Confirmado por el servidor');
  assert.notEqual(mock.statusLabel, real.statusLabel,
    'el prototipo no debe afirmar que el servidor tiene el evento');
  assert.match(mock.statusLabel, /simulado/i);
  assert.equal(mock.simulated, true);
});

test('la marca de simulado sólo aplica al estado confirmado', () => {
  // Un evento en cola no está "simulado": de verdad está guardado en el equipo.
  const pending = buildActionSheetModel({
    batch: { workflowState: 'incubation' }, queueEntry: { status: 'pending' }, simulated: true,
  });
  assert.equal(pending.statusLabel, 'Guardado en este equipo');
  assert.equal(pending.simulated, false);
});

test('cliente y servidor resuelven el estado con la misma regla', () => {
  // El servidor es accept-field-event.js:77 -> workflowState || DEFAULT_INITIAL_STATE.
  const serverResolves = (b) => b.workflowState || 'inoculated';

  for (const batch of [
    { estado: 'activo' },
    { workflowState: 'fruiting' },
    { state: 'fruiting' },
    { state: 'fruiting', workflowState: 'incubation' },
    {},
  ]) {
    const model = buildActionSheetModel({ batch, batchId: 'L-1' });
    assert.equal(model.state, serverResolves(batch),
      `divergencia para ${JSON.stringify(batch)}: la hoja ofrecería transiciones que el servidor rechaza`);
  }
});

test('en simulacro el titular y el cuerpo tampoco afirman confirmación del servidor', () => {
  // El rótulo pequeño no basta: el titular en mayúsculas es lo que el operario
  // lee de un vistazo, y decía CONFIRMADO POR EL SERVIDOR sobre un evento que
  // ningún servidor había visto.
  const sim = buildActionSheetModel({ batch: { workflowState: 'incubation' }, queueEntry: { status: 'confirmed' }, simulated: true });
  const real = buildActionSheetModel({ batch: { workflowState: 'incubation' }, queueEntry: { status: 'confirmed' } });

  for (const text of [sim.statusHeading, sim.statusDetail, sim.statusLabel]) {
    assert.ok(!/POR EL SERVIDOR|validada en el servidor/i.test(text),
      `el modo simulado no debe afirmar respaldo del servidor: "${text}"`);
  }
  assert.match(sim.statusHeading, /SIMULACRO/);
  assert.match(real.statusHeading, /POR EL SERVIDOR/);
  assert.notEqual(sim.statusDetail, real.statusDetail);
});

test('cada estado trae su propio titular y detalle', () => {
  for (const status of ['saved_local', 'conflict', 'rejected']) {
    const entry = { saved_local: 'pending', conflict: 'conflict', rejected: 'rejected' }[status];
    const m = buildActionSheetModel({ batch: { workflowState: 'incubation' }, queueEntry: { status: entry } });
    assert.ok(m.statusHeading.length > 0, `${status} necesita titular`);
    assert.ok(m.statusDetail.length > 0, `${status} necesita detalle`);
  }
});
