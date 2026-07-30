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
});

const paths = async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), 'field-os-inventory-'));
  return {
    dataPath: resolve(tempDir, 'state.json'),
    ledgerPath: resolve(tempDir, 'ledger.json'),
    photosDir: resolve(tempDir, 'photos'),
    inventoryPath: resolve(tempDir, 'inventory.json')
  };
};

test('crea un ítem y deriva su estado a partir de cantidad vs mínimo', async () => {
  const paths_ = await paths();
  const instance = await createFieldServer(paths_);
  const baseUrl = await listen(instance.server);

  const low = await fetch(`${baseUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Salvado-L11', insumo: 'Salvado de trigo', unidad: 'kg', cantidad: 2, minimo: 5 })
  });
  assert.equal(low.status, 200);
  const lowBody = await low.json();
  assert.equal(lowBody.item.status, 'Reponer');

  const ok = await fetch(`${baseUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Paja-L03', insumo: 'Paja de trigo', unidad: 'kg', cantidad: 40, minimo: 10 })
  }).then((r) => r.json());
  assert.equal(ok.item.status, 'OK');

  const all = await fetch(`${baseUrl}/api/inventory`).then((r) => r.json());
  assert.equal(all.items.length, 2);
  await close(instance.server);
});

test('el estado se re-deriva, nunca queda desincronizado, cuando cambia la cantidad', async () => {
  const paths_ = await paths();
  const instance = await createFieldServer(paths_);
  const baseUrl = await listen(instance.server);

  await fetch(`${baseUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Cal-L02', insumo: 'Cal hidratada', unidad: 'kg', cantidad: 1, minimo: 5 })
  });
  const restocked = await fetch(`${baseUrl}/api/inventory`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Cal-L02', insumo: 'Cal hidratada', unidad: 'kg', cantidad: 20, minimo: 5 })
  }).then((r) => r.json());
  assert.equal(restocked.item.status, 'OK');
  assert.equal(restocked.item.cantidad, 20);
  await close(instance.server);
});

test('rechaza ítems con forma inválida', async () => {
  const paths_ = await paths();
  const instance = await createFieldServer(paths_);
  const baseUrl = await listen(instance.server);

  const badLote = await fetch(`${baseUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: '../etc', insumo: 'x', unidad: 'kg', cantidad: 1, minimo: 1 })
  });
  assert.equal(badLote.status, 400);

  const negativeQty = await fetch(`${baseUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'X-1', insumo: 'x', unidad: 'kg', cantidad: -5, minimo: 1 })
  });
  assert.equal(negativeQty.status, 400);

  const all = await fetch(`${baseUrl}/api/inventory`).then((r) => r.json());
  assert.equal(all.items.length, 0);
  await close(instance.server);
});

test('elimina un ítem existente y rechaza uno inexistente', async () => {
  const paths_ = await paths();
  const instance = await createFieldServer(paths_);
  const baseUrl = await listen(instance.server);

  await fetch(`${baseUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Bolsas-L07', insumo: 'Bolsas filtrantes', unidad: 'u', cantidad: 300, minimo: 50 })
  });

  const missing = await fetch(`${baseUrl}/api/inventory`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'No-Existe' })
  });
  assert.equal(missing.status, 404);

  const removed = await fetch(`${baseUrl}/api/inventory`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Bolsas-L07' })
  });
  assert.equal(removed.status, 200);

  const all = await fetch(`${baseUrl}/api/inventory`).then((r) => r.json());
  assert.equal(all.items.length, 0);
  await close(instance.server);
});

test('persiste entre reinicios del servidor', async () => {
  const paths_ = await paths();
  const first = await createFieldServer(paths_);
  const firstUrl = await listen(first.server);
  await fetch(`${firstUrl}/api/inventory`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lote: 'Paja-L03', insumo: 'Paja de trigo', unidad: 'kg', cantidad: 40, minimo: 10 })
  });
  await close(first.server);

  const onDisk = JSON.parse(await readFile(paths_.inventoryPath, 'utf8'));
  assert.equal(onDisk.items.length, 1);

  const second = await createFieldServer(paths_);
  const secondUrl = await listen(second.server);
  const all = await fetch(`${secondUrl}/api/inventory`).then((r) => r.json());
  assert.equal(all.items.length, 1);
  assert.equal(all.items[0].lote, 'Paja-L03');
  await close(second.server);
});
