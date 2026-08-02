import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { createFieldServer } from '../server/server.mjs';

const listen = async (server) => {
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  return `http://127.0.0.1:${server.address().port}`;
};

const close = (server) => new Promise((resolveClose, rejectClose) => {
  server.close((error) => error ? rejectClose(error) : resolveClose());
  // see server-photos.test.mjs close() for why this is needed
  server.closeAllConnections();
});

const paths = async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), 'field-os-ledger-'));
  return {
    dataPath: resolve(tempDir, 'state.json'),
    ledgerPath: resolve(tempDir, 'ledger.json'),
    photosDir: resolve(tempDir, 'photos')
  };
};

test('el ledger acepta un evento de registro válido y lo persiste', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const response = await fetch(`${baseUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'registro',
      operator: 'ana',
      payload: { especie: 'Pleurotus ostreatus', count: 12 }
    })
  });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.ok(body.event.id);
  assert.ok(body.event.ts);

  await instance.ledger.flush();
  const onDisk = JSON.parse(await readFile(ledgerPath, 'utf8'));
  assert.equal(onDisk.events.length, 1);
  assert.equal(onDisk.events[0].payload.especie, 'Pleurotus ostreatus');
  await close(instance.server);
});

test('el ledger es append-only: una anulación no borra ni reescribe el evento original', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const original = await fetch(`${baseUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'cosecha',
      operator: 'ana',
      payload: { container_id: 'C-0412', peso_g: 350, destino: 'venta' }
    })
  }).then((response) => response.json());

  const correction = await fetch(`${baseUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'anulacion',
      operator: 'ana',
      payload: { ref_event_id: original.event.id }
    })
  });
  assert.equal(correction.status, 201);

  const all = await fetch(`${baseUrl}/api/ledger`).then((response) => response.json());
  assert.equal(all.events.length, 2);
  assert.equal(all.events[0].id, original.event.id);
  assert.equal(all.events[0].type, 'cosecha');
  assert.equal(all.events[1].type, 'anulacion');
  assert.equal(all.events[1].payload.ref_event_id, original.event.id);
  await close(instance.server);
});

test('el ledger rechaza eventos con forma inválida', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const missingOperator = await fetch(`${baseUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'registro', payload: { especie: 'x', count: 1 } })
  });
  assert.equal(missingOperator.status, 400);

  const badContainerId = await fetch(`${baseUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'observacion',
      operator: 'ana',
      payload: { container_ids: ['not-an-id'], nota: 'x' }
    })
  });
  assert.equal(badContainerId.status, 400);

  const contaminationWithoutCause = await fetch(`${baseUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'evento_rapido',
      operator: 'ana',
      payload: { container_ids: ['C-1'], subtype: 'contaminacion' }
    })
  });
  assert.equal(contaminationWithoutCause.status, 400);

  const events = await fetch(`${baseUrl}/api/ledger`).then((response) => response.json());
  assert.equal(events.events.length, 0);
  await close(instance.server);
});

test('el ledger persiste entre reinicios del servidor', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const first = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const firstUrl = await listen(first.server);
  await fetch(`${firstUrl}/api/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'registro', operator: 'ana', payload: { especie: 'x', count: 1 } })
  });
  await close(first.server);

  const second = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const secondUrl = await listen(second.server);
  const events = await fetch(`${secondUrl}/api/ledger`).then((response) => response.json());
  assert.equal(events.events.length, 1);
  await close(second.server);
});
