'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const queueApi = require('./sync-queue.js');

const NOW = Date.parse('2026-09-07T10:00:00-05:00');

test('los OP_TYPES coinciden exactamente con las funciones exportadas por firebase/bitacora-sync.js', () => {
  const src = fs.readFileSync(path.join(__dirname, 'firebase', 'bitacora-sync.js'), 'utf8');
  queueApi.OP_TYPES.forEach(type => {
    assert.match(
      src,
      new RegExp(`export async function ${type}\\(`),
      `bitacora-sync.js debe exportar 'export async function ${type}(...)'`,
    );
  });
});

test('createOperation valida tipo, key y args, y produce una operación congelada', () => {
  const op = queueApi.createOperation({ type: 'actualizarLote', key: 'lote:LOTE_1', args: ['LOTE_1', { estado: 'incubacion' }], at: NOW });
  assert.equal(op.status, 'pending');
  assert.equal(op.attempts, 0);
  assert.equal(op.nextAttemptAt, NOW);
  assert.equal(op.lastError, null);
  assert.ok(Object.isFrozen(op));

  assert.throws(() => queueApi.createOperation({ type: 'noExiste', key: 'x', args: [] }), /desconocido/);
  assert.throws(() => queueApi.createOperation({ type: 'actualizarLote', key: '', args: [] }), /key/);
  assert.throws(() => queueApi.createOperation({ type: 'actualizarLote', key: 'x', args: 'no-array' }), /array/);
});

test('createOperation es determinista cuando no se pasa id', () => {
  const a = queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW });
  const b = queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW });
  assert.equal(a.id, b.id);
});

test('una foto en base64 en los args no llega a la cola', () => {
  const op = queueApi.createOperation({
    type: 'actualizarBolsa',
    key: 'bolsa:B17',
    args: ['B17', { estado: 'contaminada', foto: 'data:image/jpeg;base64,AAAAAAAA' }],
    at: NOW,
  });
  assert.equal(op.args[1].foto, undefined);
  assert.equal(op.args[1].estado, 'contaminada');
});

test('registrar dos veces el mismo cambio de bolsa fusiona y conserva la posición original', () => {
  let queue = [];
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'actualizarBolsa', key: 'bolsa:B1', args: ['B1', { estado: 'sana' }], at: NOW, id: 'op1' }));
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'actualizarLote', key: 'lote:LOTE_2', args: ['LOTE_2', { estado: 'incubacion' }], at: NOW + 1, id: 'op2' }));
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'actualizarBolsa', key: 'bolsa:B1', args: ['B1', { colonizacion: 100 }], at: NOW + 2, id: 'op3' }));

  assert.equal(queue.length, 2, 'no debe duplicar la operación sobre la misma bolsa');
  assert.equal(queue[0].key, 'bolsa:B1', 'conserva la posición de la primera aparición');
  assert.deepEqual(queue[0].args[1], { estado: 'sana', colonizacion: 100 }, 'fusiona los campos, gana el más reciente');
  assert.equal(queue[1].key, 'lote:LOTE_2');
});

test('un borrado descarta las operaciones previas de esa key y se añade al final', () => {
  let queue = [];
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'actualizarLote', key: 'lote:LOTE_1', args: ['LOTE_1', { estado: 'incubacion' }], at: NOW, id: 'op1' }));
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarBolsas', key: 'bolsas:LOTE_1', args: [[{ id: 'B1' }]], at: NOW + 1, id: 'op2' }));
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'eliminarLoteCascade', key: 'lote:LOTE_1', args: ['LOTE_1', ['B1'], []], at: NOW + 2, id: 'op3' }));

  assert.equal(queue.length, 2);
  assert.equal(queue.find(op => op.key === 'lote:LOTE_1').type, 'eliminarLoteCascade');
  assert.equal(queue[queue.length - 1].type, 'eliminarLoteCascade');
});

test('la cola llena lanza en vez de descartar en silencio', () => {
  let queue = [];
  for (let i = 0; i < queueApi.MAX_QUEUE; i += 1) {
    queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarCosecha', key: `cosecha:${i}`, args: [{ id: `C${i}` }], at: NOW, id: `op${i}` }));
  }
  assert.equal(queue.length, queueApi.MAX_QUEUE);
  assert.throws(
    () => queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarCosecha', key: 'cosecha:overflow', args: [{ id: 'COVER' }], at: NOW, id: 'opOverflow' })),
    /llena/,
  );
});

test('nextPending respeta status y nextAttemptAt; markSynced saca la operación de la cola', () => {
  let queue = [];
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW, id: 'op1' }));
  assert.equal(queueApi.nextPending(queue, NOW).id, 'op1');
  assert.equal(queueApi.nextPending(queue, NOW - 1000), null, 'no debe adelantarse a nextAttemptAt');

  queue = queueApi.markSynced(queue, 'op1');
  assert.equal(queue.length, 0);
  assert.equal(queueApi.nextPending(queue, NOW), null);
});

test('el retroceso exponencial crece y topa en 5 minutos', () => {
  let queue = [queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW, id: 'op1' })];

  queue = queueApi.markFailed(queue, 'op1', new Error('sin red'), NOW);
  assert.equal(queue[0].attempts, 1);
  assert.equal(queue[0].nextAttemptAt, NOW + 2000);
  assert.equal(queue[0].lastError, 'sin red');

  queue = queueApi.markFailed(queue, 'op1', new Error('sin red'), NOW);
  assert.equal(queue[0].attempts, 2);
  assert.equal(queue[0].nextAttemptAt, NOW + 4000);

  queue = queueApi.markFailed(queue, 'op1', new Error('sin red'), NOW);
  assert.equal(queue[0].nextAttemptAt, NOW + 8000);

  // Fuerza attempts altos para comprobar que la fórmula topa en 5 minutos
  // (independientemente de que la operación además quede 'stuck').
  queue = [{ ...queue[0], attempts: 19 }];
  queue = queueApi.markFailed(queue, 'op1', new Error('sin red'), NOW);
  assert.equal(queue[0].nextAttemptAt, NOW + 300000, 'no debe superar el tope de 5 minutos');
});

test('tras MAX_ATTEMPTS la operación queda stuck y nextPending deja de devolverla; retryStuck la revive', () => {
  let queue = [queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW, id: 'op1' })];

  for (let i = 0; i < queueApi.MAX_ATTEMPTS; i += 1) {
    queue = queueApi.markFailed(queue, 'op1', new Error('sin red'), NOW);
  }

  assert.equal(queue[0].status, 'stuck');
  assert.equal(queue[0].attempts, queueApi.MAX_ATTEMPTS);
  assert.equal(queueApi.nextPending(queue, NOW + 999999999), null, 'una operación stuck nunca se devuelve');

  queue = queueApi.retryStuck(queue, NOW);
  assert.equal(queue[0].status, 'pending');
  assert.equal(queue[0].attempts, 0);
  assert.equal(queueApi.nextPending(queue, NOW).id, 'op1');
});

test('describeForOperator concuerda en singular y plural, y distingue el caso stuck', () => {
  assert.equal(queueApi.describeForOperator({ pending: 0, stuck: 0 }), 'Sincronizado');
  assert.equal(queueApi.describeForOperator({ pending: 1, stuck: 0 }), '1 cambio pendiente');
  assert.equal(queueApi.describeForOperator({ pending: 3, stuck: 0 }), '3 cambios pendientes');
  assert.equal(queueApi.describeForOperator({ pending: 1, stuck: 1 }), '1 sin sincronizar · requiere revisión');
  assert.equal(queueApi.describeForOperator({ pending: 4, stuck: 2 }), '2 sin sincronizar · requiere revisión');
});

test('stats reporta pendientes, stuck, total y la edad de la operación pendiente más antigua', () => {
  let queue = [];
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW - 5000, id: 'op1' }));
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_2', args: [{ id: 'LOTE_2' }], at: NOW - 1000, id: 'op2' }));

  const s = queueApi.stats(queue, NOW);
  assert.equal(s.pending, 2);
  assert.equal(s.stuck, 0);
  assert.equal(s.total, 2);
  assert.equal(s.oldestPendingAt, NOW - 5000);
  assert.equal(s.oldestPendingAgeMs, 5000);
});

test('serialize/deserialize hacen un viaje de ida y vuelta fiel', () => {
  let queue = [];
  queue = queueApi.enqueue(queue, queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW, id: 'op1' }));
  const raw = queueApi.serialize(queue);
  const back = queueApi.deserialize(raw);
  assert.deepEqual(back, queue);
});

test('deserialize de un JSON corrupto devuelve [] en vez de lanzar', () => {
  assert.deepEqual(queueApi.deserialize('{esto no es json'), []);
  assert.deepEqual(queueApi.deserialize(''), []);
  assert.deepEqual(queueApi.deserialize(undefined), []);
  assert.deepEqual(queueApi.deserialize('{"no":"es un array"}'), []);
});

test('deserialize descarta entradas con forma inválida y conserva las válidas', () => {
  const valid = queueApi.createOperation({ type: 'guardarLote', key: 'lote:LOTE_1', args: [{ id: 'LOTE_1' }], at: NOW, id: 'op1' });
  const raw = JSON.stringify([
    valid,
    { id: 'op-roto', type: 'tipoQueNoExiste', key: 'x', args: [], at: NOW, attempts: 0, status: 'pending', nextAttemptAt: NOW },
    { id: 'op-sin-key', type: 'guardarLote', args: [], at: NOW, attempts: 0, status: 'pending', nextAttemptAt: NOW },
    null,
    'basura',
  ]);
  const back = queueApi.deserialize(raw);
  assert.equal(back.length, 1);
  assert.deepEqual(back[0], valid);
});

test('OP_TYPES y MAX_ATTEMPTS/MAX_QUEUE están congelados', () => {
  assert.ok(Object.isFrozen(queueApi.OP_TYPES));
  assert.equal(queueApi.MAX_ATTEMPTS, 5);
  assert.equal(queueApi.MAX_QUEUE, 500);
});
