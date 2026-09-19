'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const taskEngine = require('./task-engine.js');

const NOW = Date.parse('2026-09-19T10:00:00-05:00');

test('createTask produce la forma canónica y congela la tarea', () => {
  const t = taskEngine.createTask({
    type: 'inspection',
    objectType: 'batch',
    objectId: 'LOTE_1',
    dueAt: '2026-09-20T10:00:00-05:00',
    priority: 'normal',
    reason: 'Inspección de rutina',
    generatedBy: { source: 'sop', ref: 'inoculated' },
  });
  assert.equal(t.type, 'inspection');
  assert.equal(t.objectType, 'batch');
  assert.equal(t.objectId, 'LOTE_1');
  assert.equal(t.status, 'pending');
  assert.equal(t.completedByEventId, null);
  assert.equal(t.generatedBy.source, 'sop');
  assert.ok(Object.isFrozen(t));
  assert.throws(() => { t.status = 'done'; });
});

test('createTask deriva un id determinista objectId-type-fecha', () => {
  const t = taskEngine.createTask({
    type: 'harvest',
    objectType: 'batch',
    objectId: 'LOTE_9',
    dueAt: '2026-09-22T10:00:00-05:00',
    priority: 'high',
    reason: 'Cosecha esperada',
  });
  assert.equal(t.id, 'LOTE_9-harvest-2026-09-22');
});

test('createTask valida cada campo obligatorio y lanza en español', () => {
  const base = { type: 'inspection', objectType: 'batch', objectId: 'L1', dueAt: '2026-09-20', priority: 'normal', reason: 'motivo' };
  assert.throws(() => taskEngine.createTask({ ...base, type: 'volar' }), /Tipo de tarea desconocido/);
  assert.throws(() => taskEngine.createTask({ ...base, objectType: 'nave' }), /objectType desconocido/);
  assert.throws(() => taskEngine.createTask({ ...base, objectId: null }), /objectId es requerido/);
  assert.throws(() => taskEngine.createTask({ ...base, dueAt: null }), /dueAt es requerido/);
  assert.throws(() => taskEngine.createTask({ ...base, dueAt: 'no-es-fecha' }), /dueAt no es una fecha parseable/);
  assert.throws(() => taskEngine.createTask({ ...base, priority: 'urgentisima' }), /priority desconocida/);
  assert.throws(() => taskEngine.createTask({ ...base, reason: '' }), /reason es requerido/);
  assert.throws(() => taskEngine.createTask({ ...base, generatedBy: { source: 'marciano' } }), /generatedBy.source desconocido/);
});

test('tasksFromTransition genera las tres tareas SOP de inoculación con los dueAt correctos', () => {
  const at = '2026-09-10T00:00:00-05:00';
  const tasks = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'inoculated', at, nowMs: NOW });
  assert.equal(tasks.length, 3);

  const insp7 = tasks.find(t => t.type === 'inspection' && t.reason.includes('D+7'));
  const insp14 = tasks.find(t => t.type === 'inspection' && t.reason.includes('D+14'));
  const col21 = tasks.find(t => t.type === 'colonization_check');

  assert.equal(insp7.dueAt, '2026-09-17T05:00:00.000Z');
  assert.equal(insp14.dueAt, '2026-09-24T05:00:00.000Z');
  assert.equal(col21.dueAt, '2026-10-01T05:00:00.000Z');
  assert.equal(col21.priority, 'high');
  assert.equal(col21.generatedBy.source, 'sop');
  assert.equal(col21.generatedBy.ref, 'inoculated');
});

test('un estado sin reglas SOP no genera tareas', () => {
  assert.deepEqual(taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'planned', at: NOW }), []);
  assert.deepEqual(taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'cooling', at: NOW }), []);
});

test('mergeTasks es idempotente: registrar dos veces la misma transición no duplica', () => {
  const at = '2026-09-10T00:00:00-05:00';
  const first = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'inoculated', at });
  const second = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'inoculated', at });
  const merged = taskEngine.mergeTasks(first, second);
  assert.equal(merged.length, 3);
});

test('mergeTasks no reabre una tarea ya done ni la pisa con una pending', () => {
  const at = '2026-09-10T00:00:00-05:00';
  const original = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'incubation', at });
  const done = taskEngine.completeTask(original, original[0].id, 'ev-1');
  const incoming = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'incubation', at });
  const merged = taskEngine.mergeTasks(done, incoming);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].status, 'done');
  assert.equal(merged[0].completedByEventId, 'ev-1');
});

test('mergeTasks conserva la pending existente en lugar de la nueva', () => {
  const at = '2026-09-10T00:00:00-05:00';
  const existing = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'resting', at });
  const incoming = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'resting', at });
  const merged = taskEngine.mergeTasks(existing, incoming);
  assert.equal(merged[0], existing[0]); // misma referencia: no se reemplazó
});

test('tasksFromFollowUps convierte intenciones de seguimiento en tareas', () => {
  const followUps = [
    { type: 'reinspection', offsetDays: 2, priority: 'high', reason: 'Recontaminación detectada', generatedBy: { source: 'incident', ref: 'inc-1' } },
  ];
  const tasks = taskEngine.tasksFromFollowUps(followUps, { objectId: 'LOTE_1', at: '2026-09-10T00:00:00-05:00' });
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].type, 'reinspection');
  assert.equal(tasks[0].objectType, 'batch');
  assert.equal(tasks[0].generatedBy.source, 'incident');
});

test('completeTask exige eventId y deja la trazabilidad completedByEventId', () => {
  const tasks = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'incubation', at: '2026-09-10' });
  assert.throws(() => taskEngine.completeTask(tasks, tasks[0].id, null), /eventId es requerido/);
  assert.throws(() => taskEngine.completeTask(tasks, 'no-existe', 'ev-1'), /Tarea no encontrada/);
  const next = taskEngine.completeTask(tasks, tasks[0].id, 'ev-42');
  assert.equal(next[0].status, 'done');
  assert.equal(next[0].completedByEventId, 'ev-42');
  assert.equal(tasks[0].status, 'pending'); // no muta el arreglo original
});

test('cancelTask marca cancelled y actualiza el motivo', () => {
  const tasks = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'incubation', at: '2026-09-10' });
  const next = taskEngine.cancelTask(tasks, tasks[0].id, 'Lote descartado');
  assert.equal(next[0].status, 'cancelled');
  assert.equal(next[0].reason, 'Lote descartado');
});

test('openTasksFor devuelve sólo pending del objeto, ordenadas por dueAt', () => {
  const tasks = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'inoculated', at: '2026-09-10' })
    .concat(taskEngine.tasksFromTransition({ batchId: 'LOTE_2', toState: 'inoculated', at: '2026-09-10' }));
  const abierto = taskEngine.openTasksFor(tasks, 'LOTE_1');
  assert.equal(abierto.length, 3);
  assert.ok(Date.parse(abierto[0].dueAt) <= Date.parse(abierto[1].dueAt));
  assert.ok(abierto.every(t => t.objectId === 'LOTE_1'));
});

test('buildTodayFromTasks: crítica antes que vencida, vencida antes que la de hoy, y resuelve what/where/why/action', () => {
  const index = {
    batches: { LOTE_1: { code: 'SHI-01', species: 'Shiitake', stateLabel: 'Incubación', room: 'sala_a' } },
    rooms: { sala_a: { name: 'Sala A' } },
  };
  const tasks = [
    taskEngine.createTask({
      type: 'inspection', objectType: 'batch', objectId: 'LOTE_1',
      dueAt: '2026-09-19T09:00:00-05:00', priority: 'normal', reason: 'Vencida ayer',
    }),
    taskEngine.createTask({
      type: 'harvest', objectType: 'batch', objectId: 'LOTE_1',
      dueAt: '2026-09-19T10:20:00-05:00', priority: 'normal', reason: 'Para hoy',
    }),
    taskEngine.createTask({
      type: 'colonization_check', objectType: 'batch', objectId: 'LOTE_1',
      dueAt: '2026-09-25T10:00:00-05:00', priority: 'critical', reason: 'Colonización crítica',
    }),
  ];
  const rows = taskEngine.buildTodayFromTasks(tasks, index, NOW);
  assert.equal(rows[0].priority, 'critical');
  assert.equal(rows[1].bucket, 'overdue');
  assert.equal(rows[2].bucket, 'now');

  const overdueRow = rows.find(r => r.bucket === 'overdue');
  assert.equal(overdueRow.what, 'Inspeccionar');
  assert.equal(overdueRow.where, 'SHI-01 · Sala A');
  assert.match(overdueRow.why, /Vencida ayer/);
  assert.match(overdueRow.why, /vencida/);
  assert.equal(overdueRow.action, 'Registrar inspección');
});

test('buildTodayFromTasks no rompe con un lote que no está en el index', () => {
  const tasks = [
    taskEngine.createTask({
      type: 'inspection', objectType: 'batch', objectId: 'LOTE_FANTASMA',
      dueAt: '2026-09-19T09:00:00-05:00', priority: 'normal', reason: 'Sin lote en el index',
    }),
  ];
  const rows = taskEngine.buildTodayFromTasks(tasks, { batches: {}, rooms: {} }, NOW);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].where, 'LOTE_FANTASMA');
});

test('buildTodayFromTasks sólo incluye tareas pending', () => {
  let tasks = taskEngine.tasksFromTransition({ batchId: 'LOTE_1', toState: 'incubation', at: '2026-09-10' });
  tasks = taskEngine.completeTask(tasks, tasks[0].id, 'ev-1');
  const rows = taskEngine.buildTodayFromTasks(tasks, { batches: {}, rooms: {} }, NOW);
  assert.equal(rows.length, 0);
});

test('taskStats cuenta correctamente total/pending/done/cancelled/overdue/dueToday', () => {
  let tasks = [
    taskEngine.createTask({
      type: 'inspection', objectType: 'batch', objectId: 'LOTE_1',
      dueAt: '2026-09-17T09:00:00-05:00', priority: 'normal', reason: 'Vencida',
    }),
    taskEngine.createTask({
      type: 'harvest', objectType: 'batch', objectId: 'LOTE_1',
      dueAt: '2026-09-19T14:00:00-05:00', priority: 'high', reason: 'Hoy',
    }),
    taskEngine.createTask({
      type: 'colonization_check', objectType: 'batch', objectId: 'LOTE_2',
      dueAt: '2026-09-25T10:00:00-05:00', priority: 'normal', reason: 'Futura',
    }),
  ];
  tasks = taskEngine.completeTask(tasks, tasks[2].id, 'ev-9');
  const stats = taskEngine.taskStats(tasks, NOW);
  assert.equal(stats.total, 3);
  assert.equal(stats.pending, 2);
  assert.equal(stats.done, 1);
  assert.equal(stats.cancelled, 0);
  assert.equal(stats.overdue, 1);
  assert.equal(stats.dueToday, 1);
});
