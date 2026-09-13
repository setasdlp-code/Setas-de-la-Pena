'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const qr = require('./field-qr-events.js');

const sheet = (...actions) => ({ actions: actions.map(action => ({ action, blockedBy: null })) });
const batchSheetApi = {
  buildCultivoEvento: args => ({ id: 'evt-1', ...args }),
};

test('observación permitida persiste exactamente una vez y espera el adaptador async', async () => {
  const calls = [];
  const result = await qr.persistQuickEvent({
    tipo: 'observacion', lote: { id: 'L-1', operador: 'op-1' },
    nota: 'micelio uniforme', sheet: sheet('inspection'), batchSheetApi,
    eventDb: { registrarEvento: async event => { calls.push(event); } },
  });
  assert.equal(result.status, 'persisted_local_or_server');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].nota, 'micelio uniforme');
});

test('rechazo del adaptador se propaga y no se presenta como persistido', async () => {
  await assert.rejects(() => qr.persistQuickEvent({
    tipo: 'riego', lote: { id: 'L-1' }, sheet: sheet('riego'), batchSheetApi,
    eventDb: { registrarEvento: async () => { throw new Error('network_error'); } },
  }), /network_error/);
});

test('la hoja puede volver con estado pendiente aunque el adaptador siga esperando señal', async () => {
  let resolve;
  const result = await qr.persistQuickEvent({
    tipo: 'riego', lote: { id: 'L-1' }, sheet: sheet('riego'), batchSheetApi,
    awaitPersistence: false,
    eventDb: { registrarEvento: () => new Promise(r => { resolve = r; }) },
  });
  assert.equal(result.status, 'pending');
  assert.equal(typeof result.syncPromise?.then, 'function');
  resolve();
  await result.syncPromise;
});

test('el reintento reutiliza el mismo evento e id', async () => {
  const calls = [];
  const event = { id: 'evt-stable', batchId: 'L-1', tipo: 'riego', nota: 'ok' };
  const eventDb = { registrarEvento: async value => { calls.push(value); } };
  await qr.persistQuickEvent({ tipo: 'riego', lote: { id: 'L-1' }, sheet: sheet('riego'), batchSheetApi, eventDb, event });
  await qr.persistQuickEvent({ tipo: 'riego', lote: { id: 'L-1' }, sheet: sheet('riego'), batchSheetApi, eventDb, event });
  assert.equal(calls.length, 2);
  assert.equal(calls[0], event);
  assert.equal(calls[1], event);
});

test('estado o rol sin acción permitida no escribe ni abre una captura', async () => {
  let writes = 0;
  await assert.rejects(() => qr.persistQuickEvent({
    tipo: 'contaminacion', lote: { id: 'L-1' }, sheet: sheet('inspection'), batchSheetApi,
    eventDb: { registrarEvento: async () => { writes += 1; } },
  }), /qr_action_not_allowed/);
  assert.equal(writes, 0);
});

test('contaminación y cosecha parcial esperan captura estructurada y no hacen prewrite', async () => {
  let writes = 0;
  for (const tipo of ['contaminacion', 'cosecha_parcial']) {
    const result = await qr.persistQuickEvent({
      tipo, lote: { id: 'L-1' },
      sheet: sheet(tipo === 'contaminacion' ? 'contamination' : 'harvest'), batchSheetApi,
      eventDb: { registrarEvento: async () => { writes += 1; } },
    });
    assert.equal(result.status, 'capture_required');
    assert.equal(result.event, null);
  }
  assert.equal(writes, 0, 'cancelar la captura antes de enviar no puede crear un evento incompleto');
});
