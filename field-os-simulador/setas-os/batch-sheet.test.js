'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const sheetApi = require('./batch-sheet.js');
const workflow = require('./setas-os-workflow.js');

const NOW = Date.parse('2026-09-07T10:00:00-05:00');

const lote = {
  id: 'LOTE_1',
  codigo: 'SHI-260714-03',
  especie: 'Shiitake',
  sKey: 'shiitake',
  estado: 'incubacion',
  sala: 'incubacion_01',
  fechaMezcla: '2026-07-13',
  fechaInoculacion: '2026-07-14',
  numBolsas: 6,
  peseSeco: 10,
  spawnLotId: 'SPW-2607-02',
  recipeRef: { id: 'R-SHI-07', name: 'Shiitake robles', version: 3 },
  ingredientLots: [{ lotId: 'INV-0912', ingredienteId: 'aserrin_roble', nombre: 'Aserrín de roble', kg: 8 }],
};

const bolsas = [
  { id: 'B1', loteId: 'LOTE_1', codigo: 'SHI-260714-03-B01', estado: 'sana', col100: '2026-08-05' },
  { id: 'B2', loteId: 'LOTE_1', codigo: 'SHI-260714-03-B02', estado: 'sana', col100: '2026-08-06' },
  { id: 'B3', loteId: 'LOTE_1', codigo: 'SHI-260714-03-B03', estado: 'contaminada', motivoDescarte: 'Trichoderma', foto: 'data:image/jpeg;base64,AAA' },
  { id: 'B4', loteId: 'LOTE_1', codigo: 'SHI-260714-03-B04', estado: 'sana' },
  { id: 'B5', loteId: 'LOTE_1', codigo: 'SHI-260714-03-B05', estado: 'sana' },
  { id: 'B6', loteId: 'LOTE_1', codigo: 'SHI-260714-03-B06', estado: 'sana' },
  { id: 'OTRO', loteId: 'LOTE_2', codigo: 'OTR-01-B01', estado: 'sana' },
];

const cosechas = [
  { id: 'C1', loteId: 'LOTE_1', flush: 1, fecha: '2026-09-01', pesoFresco: '1200', calidad: 4, codigo: 'SHI-260714-03-B01' },
  { id: 'C2', loteId: 'LOTE_2', flush: 1, fecha: '2026-09-02', pesoFresco: '900' },
];

const build = (overrides = {}) => sheetApi.buildBatchSheet(Object.assign({
  lote, bolsas, cosechas, nowMs: NOW,
}, overrides));

test('la ficha canónica expone todos los campos exigidos por la arquitectura', () => {
  const s = build();
  assert.equal(s.schema, 'setas.batch-sheet.v1');
  assert.equal(s.code, 'SHI-260714-03');
  assert.equal(s.species, 'Shiitake');
  assert.equal(s.state, 'incubation');
  assert.equal(s.stateLabel, 'Incubación');
  assert.equal(s.room.id, 'incubacion_01');
  assert.equal(s.bagsActive, 5); // 6 bolsas del lote, una contaminada
  assert.equal(s.bagsTotal, 6);
  assert.equal(s.recipe.id, 'R-SHI-07');
  assert.equal(s.recipe.version, 3);
  assert.equal(s.spawnLot.id, 'SPW-2607-02');
  assert.equal(s.consumedInventory[0].lotId, 'INV-0912');
  assert.ok(s.timeline.length > 0);
  assert.equal(s.harvests.length, 1); // no arrastra la cosecha de LOTE_2
  assert.ok(s.costs.incurredTotalCop > 0);
  assert.ok(s.anomalies.some(a => a.kind === 'contamination'));
  assert.ok(Array.isArray(s.blocks));
  assert.equal(s.photos.length, 1);
  assert.ok(s.nextAction);
});

test('los días en la etapa se cuentan desde la última transición, no desde la inoculación', () => {
  const withTransition = build({
    events: [{ type: 'batch_state_transition', batchId: 'LOTE_1', from: 'inoculated', to: 'incubation', at: '2026-09-01T08:00:00-05:00', operatorId: 'op-1' }],
  });
  assert.equal(withTransition.daysInStage, 6);
  assert.equal(withTransition.ageDays, 55); // edad total desde inoculación
  assert.equal(build().daysInStage, 55); // sin transiciones, cae a la inoculación
});

test('los estados legados se mapean al ciclo de vida canónico y nunca inventan nombres', () => {
  assert.equal(sheetApi.normalizeLifecycleState('incubacion'), 'incubation');
  assert.equal(sheetApi.normalizeLifecycleState('fructificacion'), 'fruiting');
  assert.equal(sheetApi.normalizeLifecycleState('completado'), 'closed');
  assert.equal(sheetApi.normalizeLifecycleState('descartado'), 'discarded');
  assert.equal(sheetApi.normalizeLifecycleState('cuarentena'), 'quarantine');
  assert.equal(sheetApi.normalizeLifecycleState('nada_de_esto'), 'planned');
  Object.values(sheetApi.LEGACY_STATE_ALIASES).forEach(state => {
    assert.ok(workflow.isKnownState(state), `${state} debe existir en la máquina de estados`);
  });
  Object.keys(sheetApi.ACTION_PRIORITY).forEach(state => {
    assert.ok(workflow.isKnownState(state), `${state} debe existir en la máquina de estados`);
  });
});

test('el QR resuelve el lote por código, id, URL de trazabilidad y payload JSON', () => {
  const index = { lotes: [lote], bolsas };
  assert.equal(sheetApi.resolveScan('SHI-260714-03', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('LOTE_1', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('https://setasdelapena.com/trace/SHI-260714-03', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('https://setasdelapena.co/c/SHI-260714-03', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('setas:lote:SHI-260714-03', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('setas:bag:SHI-260714-03-B02', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('setas:bag:SHI-260714-03-B02', index).bagId, 'B2');
  assert.equal(sheetApi.resolveScan('SDP-CERT-SHI-260714-03', index).batchId, 'LOTE_1');
  assert.equal(sheetApi.resolveScan('{"batch":"SHI-260714-03"}', index).batchId, 'LOTE_1');
});

test('el QR de la etiqueta impresa resuelve por el parámetro de la URL de trazabilidad', () => {
  const index = { lotes: [lote], bolsas };
  // Es la URL que generateQrSvgDataUrl() imprime en la etiqueta térmica: el
  // código va en la query, no en la ruta. Leer el último segmento daría
  // "trace.html" y ninguna etiqueta impresa resolvería jamás.
  const base = 'https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html';
  assert.equal(sheetApi.resolveScan(`${base}?codigo=SHI-260714-03`, index).batchId, 'LOTE_1');
  // Etiqueta de cosecha: el flush viaja al lado del código y no debe estorbar.
  assert.equal(sheetApi.resolveScan(`${base}?codigo=SHI-260714-03&flush=2`, index).batchId, 'LOTE_1');
  // El código llega percent-encoded desde encodeURIComponent().
  assert.equal(sheetApi.resolveScan(`${base}?codigo=SHI%2D260714%2D03`, index).batchId, 'LOTE_1');
  // Una bolsa impresa con su propio código sigue resolviendo a la bolsa.
  const bag = sheetApi.resolveScan(`${base}?codigo=SHI-260714-03-B02`, index);
  assert.equal(bag.kind, 'bag');
  assert.equal(bag.bagId, 'B2');
  // Sin parámetro conocido se conserva el comportamiento por ruta.
  assert.equal(sheetApi.resolveScan('https://setasdelapena.com/trace/SHI-260714-03?utm=qr', index).batchId, 'LOTE_1');
  // Una URL de trazabilidad de otro lote no debe colarse como coincidencia.
  assert.equal(sheetApi.resolveScan(`${base}?codigo=OTRO-999`, index).reason, 'no_match');
});

test('el QR de una bolsa resuelve a su lote y conserva la bolsa escaneada', () => {
  const index = { lotes: [lote], bolsas };
  const bag = sheetApi.resolveScan('SHI-260714-03-B02', index);
  assert.equal(bag.kind, 'bag');
  assert.equal(bag.batchId, 'LOTE_1');
  assert.equal(bag.bagId, 'B2');

  // Etiqueta impresa de una bolsa que aún no existe como registro: cae al lote.
  const unknownBag = sheetApi.resolveScan('SHI-260714-03-B99', index);
  assert.equal(unknownBag.kind, 'batch');
  assert.equal(unknownBag.batchId, 'LOTE_1');
  assert.equal(unknownBag.reason, 'resolved_by_prefix');
});

test('un QR que no resuelve devuelve un motivo explícito, no un menú genérico', () => {
  const miss = sheetApi.resolveScan('QUIEN-SABE-99', { lotes: [lote], bolsas });
  assert.equal(miss.kind, 'unknown');
  assert.equal(miss.batchId, null);
  assert.equal(miss.reason, 'no_match');
  assert.equal(sheetApi.resolveScan('', { lotes: [lote] }).reason, 'empty_payload');
});

test('la ficha ofrece de 3 a 5 acciones contextuales, nunca un formulario universal', () => {
  const s = build();
  assert.ok(s.actions.length >= 3 && s.actions.length <= 5, `acciones=${s.actions.length}`);
  const names = s.actions.map(a => a.action);
  assert.ok(names.includes('colonization'));
  assert.ok(names.includes('contamination'));
  assert.ok(names.includes('photo'));
  assert.ok(names.includes('move'));
  assert.equal(names.includes('harvest'), false, 'incubación no debe ofrecer cosecha');
});

test('la cosecha aparece sólo cuando el estado la permite', () => {
  const fruiting = build({ lote: Object.assign({}, lote, { estado: 'fructificacion' }) });
  assert.equal(fruiting.actions[0].action, 'harvest');
  assert.deepEqual(fruiting.actions[0].requires, ['pesoFresco', 'flush']);
});

test('el rol operario no recibe la acción de descartar', () => {
  const quarantined = build({ lote: Object.assign({}, lote, { estado: 'cuarentena' }), role: 'operario' });
  assert.equal(quarantined.actions.some(a => a.action === 'discard'), false);
  const direccion = build({ lote: Object.assign({}, lote, { estado: 'cuarentena' }), role: 'direccion' });
  assert.ok(direccion.actions.some(a => a.action === 'discard'));
});

test('los bloqueos se declaran y el avance de etapa se marca bloqueado con su motivo', () => {
  const contaminated = build({
    bolsas: bolsas.map(b => (b.loteId === 'LOTE_1' ? Object.assign({}, b, { estado: 'contaminada' }) : b)),
  });
  assert.ok(contaminated.blocks.some(b => b.code === 'contamination_threshold'));
  const advance = contaminated.actions.find(a => a.action === 'advance_stage');
  assert.equal(advance.blockedBy, 'contamination_threshold');
  assert.throws(
    () => sheetApi.applyAction({ sheet: contaminated, action: 'advance_stage', operatorId: 'op-1' }),
    /bloqueada por: contamination_threshold/
  );
});

test('un lote sin receta, sala ni semilla enlazadas lo declara como bloqueo y baja la completitud', () => {
  const suelto = build({ lote: { id: 'L9', codigo: 'L-9', estado: 'incubacion' }, bolsas: [], cosechas: [] });
  const codes = suelto.blocks.map(b => b.code);
  assert.deepEqual(codes.sort(), ['recipe_unlinked', 'room_unlinked', 'spawn_unlinked']);
  assert.equal(suelto.traceability.recipeLinked, false);
  assert.ok(suelto.completenessPct < build().completenessPct);
});

test('cada evento registrado es inmutable y encadenado al anterior', () => {
  let log = sheetApi.appendBatchEvent([], { batchId: 'LOTE_1', action: 'note', operatorId: 'op-1', at: '2026-09-07T09:00:00-05:00', payload: { nota: 'ok' } });
  log = sheetApi.appendBatchEvent(log, { batchId: 'LOTE_1', action: 'photo', operatorId: 'op-1', at: '2026-09-07T09:05:00-05:00', payload: { foto: 'data:...' } });

  assert.equal(log.length, 2);
  assert.equal(log[1].seq, 2);
  assert.equal(log[1].prevHash, log[0].hash);
  assert.ok(Object.isFrozen(log[0]));
  assert.equal(sheetApi.verifyEventChain(log).valid, true);

  const tampered = [Object.assign({}, log[0], { operatorId: 'otro' }), log[1]];
  const check = sheetApi.verifyEventChain(tampered);
  assert.equal(check.valid, false);
  assert.equal(check.reason, 'payload_tampered');
});

test('registrar exige los campos mínimos de la acción', () => {
  assert.throws(
    () => sheetApi.appendBatchEvent([], { batchId: 'LOTE_1', action: 'harvest', operatorId: 'op-1', payload: { flush: 1 } }),
    /Faltan campos obligatorios para "harvest": pesoFresco/
  );
  assert.throws(
    () => sheetApi.appendBatchEvent([], { batchId: 'LOTE_1', action: 'note', payload: { nota: 'x' } }),
    /operatorId es requerido/
  );
});

test('la acción rápida de contaminación exige foto, extensión, ubicación y decisión', () => {
  const event = sheetApi.contaminationEvent({
    batchId: 'LOTE_1', operatorId: 'op-1', foto: 'data:image/jpeg;base64,AAA',
    extension: '2_bolsas', ubicacion: 'base de la bolsa', decision: 'descartar_bolsa', bagIds: ['B3'],
  });
  const log = sheetApi.appendBatchEvent([], event);
  assert.equal(log[0].action, 'contamination');
  assert.equal(log[0].payload.decision, 'descartar_bolsa');

  assert.throws(() => sheetApi.contaminationEvent({ batchId: 'LOTE_1', operatorId: 'op-1', foto: 'x', extension: 'x', ubicacion: 'x', decision: 'inventada' }), /decision debe ser una de/);
  assert.throws(
    () => sheetApi.appendBatchEvent([], { batchId: 'LOTE_1', action: 'contamination', operatorId: 'op-1', payload: { foto: 'x', extension: 'y' } }),
    /Faltan campos obligatorios para "contamination": ubicacion, decision/
  );
});

test('registrar una acción de transición avanza el estado y deja el evento inmutable', () => {
  const s = build();
  const result = sheetApi.applyAction({ sheet: s, action: 'advance_stage', operatorId: 'op-1', at: '2026-09-07T11:00:00-05:00' });
  assert.equal(result.transitioned, true);
  assert.equal(result.state, 'maturation'); // primera transición válida desde incubation
  assert.equal(result.log.length, 2);
  assert.equal(result.log[1].type, 'batch_state_transition');
  assert.equal(sheetApi.verifyEventChain(result.log).valid, true);
});

test('una acción fuera del estado se rechaza en vez de registrarse', () => {
  const s = build();
  assert.throws(
    () => sheetApi.applyAction({ sheet: s, action: 'harvest', operatorId: 'op-1', payload: { pesoFresco: 100, flush: 1 } }),
    /no es válida para un lote en estado "incubation"/
  );
});

test('la línea de tiempo ordena de lo más reciente a lo más antiguo y vincula cada evento al lote', () => {
  const s = build();
  const times = s.timeline.map(e => (e.at ? Date.parse(e.at) : NaN)).filter(Number.isFinite);
  const sorted = [...times].sort((a, b) => b - a);
  assert.deepEqual(times, sorted);
  assert.ok(s.timeline.some(e => e.type === 'harvest'));
  assert.ok(s.timeline.some(e => e.type === 'contamination'));
  assert.ok(s.timeline.some(e => e.type === 'inoculated'));
});

test('buildCultivoEvento construye el documento de un evento reportado por QR', () => {
  const ev = sheetApi.buildCultivoEvento({ batchId: 'LOTE_1', tipo: 'riego', operatorId: 'op-1', at: '2026-09-07T09:00:00-05:00' });
  assert.equal(ev.batchId, 'LOTE_1');
  assert.equal(ev.bagId, null);
  assert.equal(ev.tipo, 'riego');
  assert.equal(ev.operatorId, 'op-1');
  assert.equal(ev.nota, '');
  assert.equal(ev.at, '2026-09-07T09:00:00-05:00');
  assert.equal(ev.source, 'qr_scan');
  assert.match(ev.id, /^EVC_LOTE_1_\d+$/);

  const withBag = sheetApi.buildCultivoEvento({ batchId: 'LOTE_1', bagId: 'B2', tipo: 'contaminacion', operatorId: 'op-1', nota: '  moho visible  ' });
  assert.equal(withBag.bagId, 'B2');
  assert.equal(withBag.nota, 'moho visible');
});

test('buildCultivoEvento rechaza tipo desconocido, falta de operador y observación sin nota', () => {
  assert.throws(() => sheetApi.buildCultivoEvento({ batchId: 'LOTE_1', tipo: 'inventado', operatorId: 'op-1' }), /tipo debe ser uno de/);
  assert.throws(() => sheetApi.buildCultivoEvento({ batchId: 'LOTE_1', tipo: 'riego' }), /operatorId es requerido/);
  assert.throws(() => sheetApi.buildCultivoEvento({ batchId: 'LOTE_1', tipo: 'observacion', operatorId: 'op-1' }), /nota es requerida/);
  assert.throws(() => sheetApi.buildCultivoEvento({ tipo: 'riego', operatorId: 'op-1' }), /batchId es requerido/);
  assert.deepEqual(sheetApi.CULTIVO_EVENT_TIPOS, ['observacion', 'riego', 'contaminacion', 'cosecha_parcial']);
});

test('la ficha ofrece "riego" como acción de campo válida en incubación', () => {
  assert.ok(sheetApi.ACTION_CATALOG.riego);
  assert.deepEqual(sheetApi.ACTION_CATALOG.riego.requires, []);
});

test('el marcador de indicadores resume la salud de trazabilidad de la operación', () => {
  const sheets = [
    build(),
    build({ lote: { id: 'L9', codigo: 'L-9', estado: 'incubacion' }, bolsas: [], cosechas: [] }),
    build({ lote: Object.assign({}, lote, { id: 'L3', estado: 'completado' }) }),
  ];
  const board = sheetApi.batchScoreboard(sheets, {
    invalidTransitionAttempts: 2, qrStartedOps: 8, totalFieldOps: 10,
    inspectionDurationsMs: [30000, 45000, 60000],
  });
  assert.equal(board.batches, 3);
  assert.equal(board.batchesWithoutRecipeOrRoomPct, 33.3);
  assert.equal(board.invalidTransitionAttempts, 2);
  assert.equal(board.qrStartedOpsPct, 80);
  assert.equal(board.medianInspectionMs, 45000);
  assert.ok(board.closedBatchTraceabilityPct > 0);
  assert.ok(board.avgTraceabilityCompletenessPct > 0);
  assert.equal(sheetApi.batchScoreboard([]).batches, 0);
});

test('aislar una bolsa la mueve a "aislada", ajusta contadores y propone reinspección a D+3', () => {
  const s = build();
  const consequences = sheetApi.actionConsequences(s, 'contamination',
    { foto: 'data:x', extension: '1_bolsa', ubicacion: 'base', decision: 'aislar', bagIds: ['B1'] },
    { operatorId: 'op-1', bolsas: bolsas.filter(b => b.loteId === 'LOTE_1') });

  assert.equal(consequences.bagUpdates.length, 1);
  assert.equal(consequences.bagUpdates[0].bagId, 'B1');
  assert.equal(consequences.bagUpdates[0].fields.estado, 'aislada');
  // 6 bolsas: B3 ya contaminada, B1 pasa a aislada → activas 4, aisladas 1.
  assert.equal(consequences.batchPatch.bagsActive, 4);
  assert.equal(consequences.batchPatch.bagsIsolated, 1);
  assert.equal(consequences.followUps.length, 1);
  assert.equal(consequences.followUps[0].type, 'reinspection');
  assert.equal(consequences.followUps[0].offsetDays, 3);
  assert.equal(consequences.followUps[0].priority, 'high');
  assert.match(consequences.followUps[0].reason, /aislar/);
  assert.equal(consequences.transition, null);
  assert.ok(Object.isFrozen(consequences));

  const result = sheetApi.applyConsequences(s, consequences, {});
  assert.equal(result.log.length, 1);
  assert.equal(result.log[0].action, 'contamination');
  assert.equal(result.state, 'incubation'); // aislar no transiciona el lote
});

test('descartar el lote completo mueve todas las bolsas activas y propone una transición terminal válida', () => {
  const s = build();
  const loteBolsas = bolsas.filter(b => b.loteId === 'LOTE_1');
  const consequences = sheetApi.actionConsequences(s, 'contamination',
    { foto: 'data:x', extension: 'general', ubicacion: 'toda la bolsa', decision: 'descartar_lote', bagIds: [] },
    { operatorId: 'op-1', bolsas: loteBolsas });

  // Las 5 bolsas no descartadas aún (B3 ya estaba contaminada, también se mueve).
  assert.equal(consequences.bagUpdates.length, 6);
  assert.ok(consequences.bagUpdates.every(u => u.fields.estado === 'descartada'));
  assert.equal(consequences.batchPatch.bagsActive, 0);
  // incubation sólo llega a un terminal vía 'failed' (no tiene 'discarded' directo).
  assert.equal(consequences.transition, 'failed');
  assert.ok(workflow.isTerminalState(consequences.transition));

  const result = sheetApi.applyConsequences(s, consequences, {});
  assert.equal(result.state, 'failed');
  assert.equal(result.log.length, 2);
  assert.equal(result.log[1].type, 'batch_state_transition');
  assert.equal(sheetApi.verifyEventChain(result.log).valid, true);
});

test('colonización al 100% no deja seguimiento y propone avanzar etapa; por debajo deja D+7', () => {
  const s = build();
  const full = sheetApi.actionConsequences(s, 'colonization', { porcentaje: 100 }, { operatorId: 'op-1' });
  assert.deepEqual(full.followUps, []);
  assert.equal(full.transition, 'maturation'); // primera transición válida desde incubation

  const partial = sheetApi.actionConsequences(s, 'colonization', { porcentaje: 60 }, { operatorId: 'op-1' });
  assert.equal(partial.transition, null);
  assert.equal(partial.followUps.length, 1);
  assert.equal(partial.followUps[0].type, 'colonization_check');
  assert.equal(partial.followUps[0].offsetDays, 7);
});

test('actionConsequences rechaza una acción inválida para el estado y una acción bloqueada nombrando el bloqueo', () => {
  const s = build();
  assert.throws(
    () => sheetApi.actionConsequences(s, 'harvest', { pesoFresco: 100, flush: 1 }, { operatorId: 'op-1' }),
    /no es válida para un lote en estado "incubation"/
  );

  const contaminated = build({
    bolsas: bolsas.map(b => (b.loteId === 'LOTE_1' ? Object.assign({}, b, { estado: 'contaminada' }) : b)),
  });
  assert.throws(
    () => sheetApi.actionConsequences(contaminated, 'advance_stage', {}, { operatorId: 'op-1' }),
    /bloqueada por: contamination_threshold/
  );
});

test('applyConsequences deja el log encadenado y verificable', () => {
  const s = build();
  const consequences = sheetApi.actionConsequences(s, 'move', { salaDestinoId: 'incubacion_02' }, { operatorId: 'op-1' });
  assert.equal(consequences.batchPatch.sala, 'incubacion_02');
  const result = sheetApi.applyConsequences(s, consequences, { log: [] });
  assert.equal(sheetApi.verifyEventChain(result.log).valid, true);
  assert.equal(result.log[0].action, 'move');
});

test('la ficha expone bagsIsolated y la anomalía de aislamiento', () => {
  const withIsolated = build({
    bolsas: bolsas.map(b => (b.id === 'B1' ? Object.assign({}, b, { estado: 'aislada' }) : b)),
  });
  assert.equal(withIsolated.bagsIsolated, 1);
  assert.equal(withIsolated.bagsActive, 4); // B1 aislada y B3 contaminada no cuentan
  assert.ok(withIsolated.anomalies.some(a => a.kind === 'isolation' && a.severity === 'warning'));
  assert.equal(build().bagsIsolated, 0);
});

// --- Regresión BUG A: actionConsequences debe respetar ACTION_CATALOG.transitionsTo
// por defecto para acciones sin caso especial (prepare_mix, start_thermal_treatment,
// complete_thermal_treatment, inoculate, discard). ---
test('actionConsequences propone transitionsTo por defecto para prepare_mix, tratamiento térmico e inoculación', () => {
  const planned = build({ lote: Object.assign({}, lote, { lifecycleState: 'planned', estado: undefined }) });
  const mixCons = sheetApi.actionConsequences(planned, 'prepare_mix', { recetaId: 'R-1' }, { operatorId: 'op-1' });
  assert.equal(mixCons.transition, 'mix_prepared');
  const mixApplied = sheetApi.applyConsequences(planned, mixCons, {});
  assert.equal(mixApplied.state, 'mix_prepared');

  const mixed = build({ lote: Object.assign({}, lote, { lifecycleState: 'mix_prepared', estado: undefined }) });
  const thermCons = sheetApi.actionConsequences(mixed, 'start_thermal_treatment', {}, { operatorId: 'op-1' });
  assert.equal(thermCons.transition, 'thermal_treatment');

  const treating = build({ lote: Object.assign({}, lote, { lifecycleState: 'thermal_treatment', estado: undefined }) });
  const completeCons = sheetApi.actionConsequences(treating, 'complete_thermal_treatment', {}, { operatorId: 'op-1' });
  assert.equal(completeCons.transition, 'cooling');

  const cooling = build({ lote: Object.assign({}, lote, { lifecycleState: 'cooling', estado: undefined }) });
  const inoculateCons = sheetApi.actionConsequences(cooling, 'inoculate', { spawnLotId: 'SPW-1' }, { operatorId: 'op-1' });
  assert.equal(inoculateCons.transition, 'inoculated');
  const inoculateApplied = sheetApi.applyConsequences(cooling, inoculateCons, {});
  assert.equal(inoculateApplied.state, 'inoculated');
});

test('actionConsequences propone transitionsTo por defecto para discard', () => {
  const planned = build({ lote: Object.assign({}, lote, { lifecycleState: 'planned', estado: undefined }) });
  const cons = sheetApi.actionConsequences(planned, 'discard', { motivo: 'material vencido' }, { operatorId: 'op-1', role: 'direccion' });
  assert.equal(cons.transition, 'discarded');
  const applied = sheetApi.applyConsequences(planned, cons, {});
  assert.equal(applied.state, 'discarded');
});

// --- Regresión BUG B: los followUps deben emitir generatedBy con forma {source, ref}
// usando un source válido del vocabulario de task-engine (source: 'incident' para
// seguimiento de contaminación), no un string plano. ---
test('followUps de contamination emiten generatedBy con forma {source, ref}', () => {
  const s = build();
  const consequences = sheetApi.actionConsequences(s, 'contamination', {
    foto: 'x', extension: '1_bolsa', ubicacion: 'y', decision: 'aislar', bagIds: ['B1'],
  }, { operatorId: 'op-1', bolsas });
  assert.equal(consequences.followUps.length, 1);
  assert.deepEqual(consequences.followUps[0].generatedBy, { source: 'incident', ref: s.batchId });
});

// --- Regresión BUG D: 'advance_stage' debe estar disponible en 'inoculated' tanto
// en batch-sheet.ACTION_PRIORITY como en la máquina de estados. ---
test('advance_stage está disponible como acción de campo en estado inoculated', () => {
  assert.ok(sheetApi.ACTION_PRIORITY.inoculated.includes('advance_stage'));
  const inoculated = build({ lote: Object.assign({}, lote, { lifecycleState: 'inoculated', estado: undefined }) });
  assert.ok(inoculated.actions.some(a => a.action === 'advance_stage'));
  const cons = sheetApi.actionConsequences(inoculated, 'advance_stage', {}, { operatorId: 'op-1' });
  assert.equal(cons.transition, 'incubation');
});

// ── FASE 1: RESOLUCIÓN DE CANASTILLAS, CONTRATO UNIFORME Y DESAMBIGUACIÓN ──────

test('resolveScan devuelve exactamente las 10 claves canónicas en todas las ramas', () => {
  const EXPECTED_KEYS = [
    'kind', 'batchId', 'batchCode', 'bagId', 'crateId', 'crateCode',
    'taraGramos', 'taraSource', 'raw', 'reason'
  ];

  const samples = [
    sheetApi.resolveScan(''),
    sheetApi.resolveScan('QUIEN-SABE-99', { lotes: [lote], bolsas }),
    sheetApi.resolveScan('SHI-260714-03', { lotes: [lote], bolsas }),
    sheetApi.resolveScan('SHI-260714-03-B02', { lotes: [lote], bolsas }),
    sheetApi.resolveScan('CAN-01', { lotes: [lote], bolsas }),
    sheetApi.resolveScan('CAN-99', { lotes: [lote], bolsas }),
    sheetApi.resolveScan('CAN-SHI-260714-03-F1', { lotes: [lote], bolsas }),
    sheetApi.resolveScan('CAN-LOTE-FANTASMA-F1', { lotes: [lote], bolsas }),
  ];

  for (const s of samples) {
    const keys = Object.keys(s);
    assert.deepEqual(keys, EXPECTED_KEYS, `El resultado para raw="${s.raw}" no tiene exactamente las 10 claves uniformes`);
    assert.equal(typeof s.raw, 'string');
  }
});

test('resolveScan resuelve canastilla registrada por esquema, URL, código crudo y JSON', () => {
  const index = { lotes: [lote], bolsas };

  // Esquema explícito
  const fromScheme = sheetApi.resolveScan('setas:crate:CAN-01', index);
  assert.equal(fromScheme.kind, 'crate');
  assert.equal(fromScheme.crateId, 'crate_CAN-01');
  assert.equal(fromScheme.crateCode, 'CAN-01');
  assert.equal(fromScheme.taraGramos, null);
  assert.equal(fromScheme.taraSource, 'unverified');
  assert.equal(fromScheme.raw, 'setas:crate:CAN-01');

  // Código crudo
  const fromRaw = sheetApi.resolveScan('CAN-01', index);
  assert.equal(fromRaw.kind, 'crate');
  assert.equal(fromRaw.crateCode, 'CAN-01');

  // Case insensitivity y whitespace
  const fromMessy = sheetApi.resolveScan('  can-01  ', index);
  assert.equal(fromMessy.kind, 'crate');
  assert.equal(fromMessy.crateCode, 'CAN-01');

  // URL con query param explícito ?crate=
  const fromQuery = sheetApi.resolveScan('https://setasdelapena.co/trace.html?crate=CAN-01', index);
  assert.equal(fromQuery.kind, 'crate');
  assert.equal(fromQuery.crateCode, 'CAN-01');

  // URL limpia /c/CAN-01
  const fromPath = sheetApi.resolveScan('https://setasdelapena.co/c/CAN-01', index);
  assert.equal(fromPath.kind, 'crate');
  assert.equal(fromPath.crateCode, 'CAN-01');

  // Payload JSON
  const fromJson = sheetApi.resolveScan('{"crate":"CAN-01"}', index);
  assert.equal(fromJson.kind, 'crate');
  assert.equal(fromJson.crateCode, 'CAN-01');
});

test('resolveScan maneja canastillas no registradas e inactivas', () => {
  const customCrates = [
    { id: 'crate_CAN-01', codigo: 'CAN-01', taraGramos: null, taraSource: 'unverified', activa: true },
    { id: 'crate_CAN-02', codigo: 'CAN-02', taraGramos: null, taraSource: 'unverified', activa: false }, // Inactiva
  ];
  const index = { lotes: [lote], bolsas, crates: customCrates };

  // Canastilla inactiva en catálogo
  const inactive = sheetApi.resolveScan('CAN-02', index);
  assert.equal(inactive.kind, 'unknown');
  assert.equal(inactive.reason, 'inactive_crate');
  assert.equal(inactive.crateId, 'crate_CAN-02');

  // Canastilla con formato válido CAN-XXXX pero no registrada en catálogo
  const unregistered = sheetApi.resolveScan('CAN-99', index);
  assert.equal(unregistered.kind, 'crate_unregistered');
  assert.equal(unregistered.crateCode, 'CAN-99');
  assert.equal(unregistered.reason, 'unregistered_crate');

  // Esquema explícito con código sintácticamente inválido
  const invalid = sheetApi.resolveScan('setas:crate:INVALID_123', index);
  assert.equal(invalid.kind, 'unknown');
  assert.equal(invalid.reason, 'unregistered_crate');

  // Comportamiento deliberado cuando crates se pasa vacío: todas son unregistered
  const emptyCratesIndex = { lotes: [lote], bolsas, crates: [] };
  const allUnreg = sheetApi.resolveScan('CAN-01', emptyCratesIndex);
  assert.equal(allUnreg.kind, 'crate_unregistered');
  assert.equal(allUnreg.crateCode, 'CAN-01');
});

test('resolveScan detecta colisiones y desambigua según intención explícita', () => {
  // Configuración con lote y canastilla homónimos (ambos con código "CAN-01")
  const homonymousLot = { id: 'L_CAN01', codigo: 'CAN-01', estado: 'fructificacion' };
  const customCrates = [
    { id: 'crate_CAN-01', codigo: 'CAN-01', taraGramos: null, taraSource: 'unverified', activa: true },
  ];
  const index = { lotes: [homonymousLot], bolsas: [], crates: customCrates };

  // Código crudo homónimo: debe rechazar por ambigüedad
  const rawCollision = sheetApi.resolveScan('CAN-01', index);
  assert.equal(rawCollision.kind, 'unknown');
  assert.equal(rawCollision.reason, 'ambiguous_identifier');

  // URL con ?codigo=CAN-01: genérico, debe rechazar por ambigüedad
  const urlGenericCollision = sheetApi.resolveScan('https://setasdelapena.co/trace.html?codigo=CAN-01', index);
  assert.equal(urlGenericCollision.kind, 'unknown');
  assert.equal(urlGenericCollision.reason, 'ambiguous_identifier');

  // URL limpia /c/CAN-01: genérico, debe rechazar por ambigüedad
  const pathGenericCollision = sheetApi.resolveScan('https://setasdelapena.co/c/CAN-01', index);
  assert.equal(pathGenericCollision.kind, 'unknown');
  assert.equal(pathGenericCollision.reason, 'ambiguous_identifier');

  // Desambiguación 1: Esquema explícito setas:crate:CAN-01 → resuelve a crate
  const explicitCrate = sheetApi.resolveScan('setas:crate:CAN-01', index);
  assert.equal(explicitCrate.kind, 'crate');
  assert.equal(explicitCrate.crateId, 'crate_CAN-01');

  // Desambiguación 2: Query param explícito ?crate=CAN-01 → resuelve a crate
  const queryCrate = sheetApi.resolveScan('https://setasdelapena.co/trace.html?crate=CAN-01', index);
  assert.equal(queryCrate.kind, 'crate');
  assert.equal(queryCrate.crateId, 'crate_CAN-01');

  // Desambiguación 3: Esquema explícito setas:lote:CAN-01 → resuelve a batch
  const explicitLot = sheetApi.resolveScan('setas:lote:CAN-01', index);
  assert.equal(explicitLot.kind, 'batch');
  assert.equal(explicitLot.batchId, 'L_CAN01');

  // Desambiguación 4: Query param explícito ?lote=CAN-01 → resuelve a batch
  const queryLot = sheetApi.resolveScan('https://setasdelapena.co/trace.html?lote=CAN-01', index);
  assert.equal(queryLot.kind, 'batch');
  assert.equal(queryLot.batchId, 'L_CAN01');
});

test('resolveScan verifica entregas históricas (CAN-<lote>-F<flush>) contra lotes reales', () => {
  const index = { lotes: [lote], bolsas }; // lote.codigo = 'SHI-260714-03', id = 'LOTE_1'

  // Entrega con lote existente en catálogo: resuelve al lote maestro
  const existingFlush1 = sheetApi.resolveScan('CAN-SHI-260714-03-F1', index);
  assert.equal(existingFlush1.kind, 'batch');
  assert.equal(existingFlush1.batchId, 'LOTE_1');
  assert.equal(existingFlush1.batchCode, 'SHI-260714-03');

  // Entrega con flush largo (-FLUSH2)
  const existingFlush2 = sheetApi.resolveScan('CAN-SHI-260714-03-FLUSH2', index);
  assert.equal(existingFlush2.kind, 'batch');
  assert.equal(existingFlush2.batchId, 'LOTE_1');

  // Entrega histórica con lote inexistente: NO asume por regex, rechaza explícitamente
  const nonexistent = sheetApi.resolveScan('CAN-LOTE-FANTASMA-F1', index);
  assert.equal(nonexistent.kind, 'unknown');
  assert.equal(nonexistent.reason, 'historical_batch_not_found');
  assert.equal(nonexistent.batchId, null);
});
