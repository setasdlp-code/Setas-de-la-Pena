'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createCallableTransport, endpointFor } = require('./field-event-callable-transport.js');

const RECEIPT = {
  eventId: 'evt_1',
  acceptedAt: '2026-09-07T10:00:00.000Z',
  batchRevisionAfter: 3,
  serverEventPath: 'field_events/evt_1',
};

const envelope = { schemaVersion: 1, accountId: 'acct_1', event: { id: 'evt_1', attachmentIds: [] } };

const okFetch = (body, init = {}) => async () => ({
  ok: init.ok !== false,
  status: init.status || 200,
  json: async () => body,
});

const make = (fetchImpl, opts = {}) => createCallableTransport({
  getIdToken: async () => 'token_abc',
  projectId: 'sdlp-os',
  fetchImpl,
  ...opts,
});

test('construye la URL del callable a partir del proyecto y la región', () => {
  assert.equal(endpointFor('sdlp-os', 'us-central1'),
    'https://us-central1-sdlp-os.cloudfunctions.net/acceptFieldEvent');
});

test('envía el sobre bajo `data` y con el token de la sesión', async () => {
  let seen = null;
  const transport = make(async (url, init) => {
    seen = { url, init };
    return { ok: true, status: 200, json: async () => ({ result: RECEIPT }) };
  });

  const receipt = await transport(envelope);

  assert.deepEqual(receipt, RECEIPT);
  assert.match(seen.url, /us-central1-sdlp-os\.cloudfunctions\.net\/acceptFieldEvent$/);
  assert.equal(seen.init.headers.Authorization, 'Bearer token_abc');
  assert.deepEqual(JSON.parse(seen.init.body), { data: envelope });
});

test('propaga el código del contrato que envía la función', async () => {
  const transport = make(okFetch(
    { error: { message: 'el lote avanzó', status: 'FAILED_PRECONDITION', details: { code: 'revision_conflict' } } },
    { ok: false, status: 400 }
  ));

  await assert.rejects(transport(envelope), (err) => {
    assert.equal(err.code, 'revision_conflict', 'el motor decide reintentar según este código');
    return true;
  });
});

test('un código desconocido se trata como transporte, no como terminal', async () => {
  // Un 500 inesperado o un proxy que responde cualquier cosa no debe hacer que
  // se descarte trabajo del operario que un reintento habría resuelto.
  const transport = make(okFetch(
    { error: { message: 'boom', details: { code: 'algo_que_no_existe' } } },
    { ok: false, status: 500 }
  ));

  await assert.rejects(transport(envelope), (err) => {
    assert.equal(err.code, 'network_error');
    return true;
  });
});

test('un error sin details tampoco se da por terminal', async () => {
  const transport = make(okFetch({ error: { message: 'Internal' } }, { ok: false, status: 500 }));
  await assert.rejects(transport(envelope), (err) => {
    assert.equal(err.code, 'network_error');
    return true;
  });
});

test('un fallo de red es reintentable', async () => {
  const transport = make(async () => { throw new Error('Failed to fetch'); });
  await assert.rejects(transport(envelope), (err) => {
    assert.equal(err.code, 'network_error');
    return true;
  });
});

test('un fallo al obtener el token es reintentable, no una pérdida del evento', async () => {
  const transport = createCallableTransport({
    getIdToken: async () => { throw new Error('token expirado'); },
    projectId: 'sdlp-os',
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ result: RECEIPT }) }),
  });

  await assert.rejects(transport(envelope), (err) => {
    assert.equal(err.code, 'network_error');
    return true;
  });
});

test('una respuesta ilegible es transporte, no aceptación', async () => {
  const transport = make(async () => ({
    ok: true, status: 200, json: async () => { throw new Error('Unexpected token <'); },
  }));

  await assert.rejects(transport(envelope), (err) => {
    assert.equal(err.code, 'network_error');
    return true;
  });
});

test('un recibo incompleto se rechaza en vez de confirmarse', async () => {
  const transport = make(okFetch({ result: { eventId: 'evt_1' } }));
  await assert.rejects(transport(envelope), /incomplete_event_record/);
});

test('exige getIdToken y projectId', () => {
  assert.throws(() => createCallableTransport({ projectId: 'p', fetchImpl: async () => {} }), /getIdToken/);
  assert.throws(() => createCallableTransport({ getIdToken: async () => 't', fetchImpl: async () => {} }), /projectId/);
});
