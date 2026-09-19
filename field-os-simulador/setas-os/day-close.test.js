'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const dayClose = require('./day-close.js');
const sheetApi = require('./batch-sheet.js');

const SHIFT_START = Date.parse('2026-09-19T06:00:00-05:00');
const NOW = Date.parse('2026-09-19T18:00:00-05:00');

// Lote sano: sin anomalías ni bloqueos, para no ensuciar los incidentes abiertos.
const loteSano = {
  id: 'LOTE_OK',
  codigo: 'SHI-260714-01',
  especie: 'Shiitake',
  sKey: 'shiitake',
  estado: 'incubacion',
  sala: 'incubacion_01',
  fechaMezcla: '2026-07-13',
  fechaInoculacion: '2026-07-14',
  numBolsas: 6,
  spawnLotId: 'SPW-2607-02',
  recipeRef: { id: 'R-SHI-07', name: 'Shiitake robles', version: 3 },
  ingredientLots: [{ lotId: 'INV-0912', ingredienteId: 'aserrin_roble', nombre: 'Aserrín de roble', kg: 8 }],
};

// Lote con contaminación crítica (>=20%) y sin sala/receta vinculada: produce
// anomalía crítica + bloqueos, para probar el orden "crítico primero".
const loteCritico = {
  id: 'LOTE_CRIT',
  codigo: 'OYS-260701-02',
  especie: 'Ostra',
  sKey: 'ostra',
  estado: 'incubacion',
  fechaMezcla: '2026-07-01',
  fechaInoculacion: '2026-07-02',
  numBolsas: 4,
};

const bolsasCritico = [
  { id: 'C1', loteId: 'LOTE_CRIT', codigo: 'OYS-260701-02-B01', estado: 'contaminada', motivoDescarte: 'Trichoderma' },
  { id: 'C2', loteId: 'LOTE_CRIT', codigo: 'OYS-260701-02-B02', estado: 'sana' },
  { id: 'C3', loteId: 'LOTE_CRIT', codigo: 'OYS-260701-02-B03', estado: 'sana' },
  { id: 'C4', loteId: 'LOTE_CRIT', codigo: 'OYS-260701-02-B04', estado: 'sana' },
];

const buildSheets = () => [
  sheetApi.buildBatchSheet({ lote: loteSano, bolsas: [], cosechas: [], nowMs: NOW }),
  sheetApi.buildBatchSheet({ lote: loteCritico, bolsas: bolsasCritico, cosechas: [], nowMs: NOW }),
];

const baseEvents = () => ([
  { type: 'inspection', at: '2026-09-19T07:00:00-05:00' },
  { type: 'inspection', at: '2026-09-19T09:00:00-05:00' },
  { type: 'harvest', at: '2026-09-19T10:30:00-05:00' },
  // Anterior al inicio del turno: no debe contar.
  { type: 'inspection', at: '2026-09-18T20:00:00-05:00' },
]);

const baseTasks = () => ([
  { id: 't1', type: 'riego', status: 'completed', dueAt: '2026-09-19T08:00:00-05:00', objectId: 'LOTE_OK' },
  { id: 't2', type: 'colonization_check', status: 'pending', dueAt: '2026-09-20T07:00:00-05:00', objectId: 'LOTE_OK' },
  { id: 't3', type: 'colonization_check', status: 'pending', dueAt: '2026-09-20T09:00:00-05:00', objectId: 'LOTE_CRIT' },
  // Vencida: pending con dueAt < nowMs.
  { id: 't4', type: 'inspection', status: 'pending', dueAt: '2026-09-19T12:00:00-05:00', objectId: 'LOTE_OK' },
  // Pasado mañana: fuera de la ventana de "tomorrow".
  { id: 't5', type: 'riego', status: 'pending', dueAt: '2026-09-21T07:00:00-05:00', objectId: 'LOTE_OK' },
]);

const buildReport = (overrides = {}) => dayClose.buildDayCloseReport(Object.assign({
  events: baseEvents(),
  tasks: baseTasks(),
  sheets: buildSheets(),
  pendingSyncCount: 0,
  shiftStartMs: SHIFT_START,
  nowMs: NOW,
  operatorId: 'OP-1',
}, overrides));

test('sólo cuenta los eventos dentro de la ventana del turno', () => {
  const report = buildReport();
  assert.equal(report.eventsLogged, 3);
  assert.deepEqual(report.eventsByType, { inspection: 2, harvest: 1 });
});

test('las anomalías y bloqueos de las fichas se convierten en incidentes abiertos, crítico primero', () => {
  const report = buildReport();
  assert.ok(report.openIncidents.length > 0);
  assert.equal(report.openIncidents[0].severity, 'critical');
  assert.equal(report.openIncidents[0].objectId, 'LOTE_CRIT');
  // También deben aparecer los bloqueos del lote crítico (sin receta/sala vinculada).
  const detalles = report.openIncidents.map(i => i.detail);
  assert.ok(detalles.some(d => /receta/i.test(d)));
});

test('tomorrow agrupa por tipo y no incluye tareas de pasado mañana', () => {
  const report = buildReport();
  assert.equal(report.tomorrow.length, 1);
  const grupo = report.tomorrow[0];
  assert.equal(grupo.type, 'colonization_check');
  assert.equal(grupo.count, 2);
  assert.deepEqual(grupo.objectIds.sort(), ['LOTE_CRIT', 'LOTE_OK']);
  // t5 (pasado mañana) y t4 (vencida) no deben aparecer.
  assert.ok(!report.tomorrow.some(g => g.type === 'riego'));
  assert.ok(!report.tomorrow.some(g => g.type === 'inspection'));
});

test('tareas completadas, pendientes y vencidas se cuentan correctamente', () => {
  const report = buildReport();
  assert.equal(report.tasksCompleted, 1);
  assert.equal(report.tasksPending, 4);
  assert.equal(report.tasksOverdue, 1);
});

test('readyToClose es false con cambios pendientes y closeDay lanza', () => {
  const report = buildReport({ pendingSyncCount: 3 });
  assert.equal(report.readyToClose, false);
  assert.deepEqual(report.blockers, ['3 cambios sin sincronizar']);
  assert.throws(
    () => dayClose.closeDay(report, { operatorId: 'OP-1', at: NOW }),
    /3 cambios sin sincronizar/
  );
});

test('readyToClose es true sin pendientes y closeDay devuelve el cierre', () => {
  const report = buildReport({ pendingSyncCount: 0 });
  assert.equal(report.readyToClose, true);
  assert.deepEqual(report.blockers, []);
  const cierre = dayClose.closeDay(report, { operatorId: 'OP-1', at: NOW });
  assert.equal(cierre.closed, true);
  assert.equal(cierre.closedBy, 'OP-1');
  assert.equal(cierre.closedAt, new Date(NOW).toISOString());
  assert.equal(cierre.report, report);
});

test('la nota de relevo contiene los incidentes abiertos y dice Ninguno cuando no los hay', () => {
  const conIncidentes = buildReport();
  const nota = dayClose.buildHandoffNote(conIncidentes);
  assert.match(nota, /INCIDENTES ABIERTOS/);
  assert.match(nota, /OYS-260701-02/);
  assert.match(nota, /PARA MAÑANA/);
  assert.match(nota, /CAMBIOS SIN SINCRONIZAR/);

  const sinIncidentes = dayClose.buildDayCloseReport({
    events: [],
    tasks: [],
    sheets: [],
    pendingSyncCount: 0,
    shiftStartMs: SHIFT_START,
    nowMs: NOW,
    operatorId: 'OP-2',
  });
  const notaLimpia = dayClose.buildHandoffNote(sinIncidentes);
  assert.match(notaLimpia, /INCIDENTES ABIERTOS\nNinguno/);
});

test('el objeto de reporte queda congelado', () => {
  const report = buildReport();
  assert.throws(() => { report.operatorId = 'otro'; }, TypeError);
});
