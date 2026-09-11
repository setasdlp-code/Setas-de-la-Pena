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
