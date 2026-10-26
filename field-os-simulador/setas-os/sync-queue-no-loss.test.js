'use strict';

// Garantía "sin pérdida silenciosa" de la cola de sincronización: ni la cola
// saturada, ni los reintentos agotados, ni un QuotaExceededError al guardar
// pueden hacer desaparecer una operación sin que el operario lo vea.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const queueApi = require('./sync-queue.js');

const NOW = Date.parse('2026-09-07T10:00:00-05:00');
const op = (i, extra = {}) => queueApi.createOperation({
  type: 'guardarCosecha', key: `cosecha:${i}`, args: [{ id: `C${i}` }], at: NOW + i, id: `op${i}`, ...extra,
});
const fill = n => {
  let q = [];
  for (let i = 0; i < n; i += 1) q = queueApi.enqueue(q, op(i));
  return q;
};

test('cola saturada: el desbordamiento lanza y la cola existente queda intacta (nada se borra)', () => {
  const full = fill(queueApi.MAX_QUEUE);
  const snapshot = JSON.stringify(full);
  assert.throws(() => queueApi.enqueue(full, op(9999)), /llena/);
  assert.equal(JSON.stringify(full), snapshot);
  assert.equal(full.length, queueApi.MAX_QUEUE);
});

test('cola saturada: un eliminar* sobre una key existente sigue cabiendo y fusionar updates no crece la cola', () => {
  const full = fill(queueApi.MAX_QUEUE - 1);
  let q = queueApi.enqueue(full, queueApi.createOperation({ type: 'actualizarLote', key: 'lote:L1', args: ['L1', { a: 1 }], at: NOW }));
  assert.equal(q.length, queueApi.MAX_QUEUE);
  q = queueApi.enqueue(q, queueApi.createOperation({ type: 'actualizarLote', key: 'lote:L1', args: ['L1', { b: 2 }], at: NOW + 1 }));
  assert.equal(q.length, queueApi.MAX_QUEUE);
  assert.deepEqual({ ...q[q.length - 1].args[1] }, { a: 1, b: 2 });
  q = queueApi.enqueue(q, queueApi.createOperation({ type: 'eliminarCosecha', key: 'cosecha:0', args: ['C0'], at: NOW + 2 }));
  assert.equal(q.length, queueApi.MAX_QUEUE);
});

test('cola saturada de operaciones stuck: siguen conservadas y contadas como "sin sincronizar"', () => {
  let q = fill(queueApi.MAX_QUEUE);
  q = q.map(o => Object.freeze({ ...o, status: 'stuck', attempts: queueApi.MAX_ATTEMPTS, lastError: 'boom' }));
  assert.throws(() => queueApi.enqueue(q, op(9999)), /llena/);
  const st = queueApi.stats(q, NOW);
  assert.equal(st.stuck, queueApi.MAX_QUEUE);
  assert.equal(st.total, queueApi.MAX_QUEUE);
  assert.match(queueApi.describeForOperator(st), /requiere revisión/);
});

test('reintentos agotados: la operación pasa a stuck con su lastError y args, sin salir de la cola', () => {
  let q = queueApi.enqueue([], op(1));
  const original = q[0];
  for (let i = 0; i < queueApi.MAX_ATTEMPTS; i += 1) {
    assert.equal(q.length, 1);
    q = queueApi.markFailed(q, 'op1', new Error('permission-denied'), NOW + i);
  }
  assert.equal(q.length, 1);
  assert.equal(q[0].status, 'stuck');
  assert.equal(q[0].attempts, queueApi.MAX_ATTEMPTS);
  assert.equal(q[0].lastError, 'permission-denied');
  assert.deepEqual(q[0].args, original.args);
  assert.equal(queueApi.nextPending(q, NOW + 1e12), null);
  assert.equal(queueApi.stats(q, NOW).stuck, 1);
});

test('reintentos agotados: un fallo posterior sobre una stuck no la borra y retryStuck la revive intacta', () => {
  let q = queueApi.enqueue([], op(1));
  for (let i = 0; i < queueApi.MAX_ATTEMPTS + 2; i += 1) q = queueApi.markFailed(q, 'op1', 'x', NOW);
  assert.equal(q.length, 1);
  assert.equal(q[0].status, 'stuck');
  q = queueApi.retryStuck(q, NOW + 5);
  assert.equal(q[0].status, 'pending');
  assert.equal(q[0].attempts, 0);
  assert.equal(queueApi.nextPending(q, NOW + 5).id, 'op1');
});

test('exportable: una stuck sobrevive a serialize/deserialize (lo que se guarda en sdp_sync_queue y en el respaldo)', () => {
  let q = queueApi.enqueue([], op(1));
  for (let i = 0; i < queueApi.MAX_ATTEMPTS; i += 1) q = queueApi.markFailed(q, 'op1', 'offline', NOW);
  const back = queueApi.deserialize(queueApi.serialize(q));
  assert.equal(back.length, 1);
  assert.equal(back[0].status, 'stuck');
  assert.equal(back[0].lastError, 'offline');
  assert.deepEqual(back[0].args, [{ id: 'C1' }]);
});

test('QuotaExceededError al guardar: serialize es puro, la cola en memoria no se altera y el fallo es detectable', () => {
  const q = queueApi.enqueue([], op(1));
  const before = JSON.stringify(q);
  const storage = {
    setItem() {
      const e = new Error('The quota has been exceeded.');
      e.name = 'QuotaExceededError';
      throw e;
    },
  };
  let caught = null;
  try { storage.setItem('sdp_sync_queue', queueApi.serialize(q)); } catch (e) { caught = e; }
  assert.equal(caught && caught.name, 'QuotaExceededError');
  assert.equal(JSON.stringify(q), before);
  assert.equal(queueApi.deserialize(queueApi.serialize(q)).length, 1);
});

test('QuotaExceededError: en la app, encolar y el volcado de device-sync avisan al operario (bitQuotaWarn)', () => {
  const src = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  const persist = /localStorage\.setItem\('sdp_sync_queue',[^;]*\);\}catch\(e\)\{bitQuotaWarn\(\);\}/g;
  assert.ok((src.match(persist) || []).length >= 2, 'encolarSync y la pasada de device-sync deben llamar bitQuotaWarn');
  assert.match(src, /No se pudo encolar el cambio/, 'la cola llena debe mostrar aviso al operario');
});
