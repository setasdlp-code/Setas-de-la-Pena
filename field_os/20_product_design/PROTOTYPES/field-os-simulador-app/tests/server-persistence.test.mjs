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

test('la API central persiste y recupera estado entre reinicios', async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), 'field-os-store-'));
  const dataPath = resolve(tempDir, 'state.json');
  const first = await createFieldServer({ dataPath });
  const firstUrl = await listen(first.server);

  const health = await fetch(`${firstUrl}/api/health`).then((response) => response.json());
  assert.equal(health.ok, true);
  assert.equal(health.persistence, 'central-file');

  const saved = await fetch(`${firstUrl}/api/state`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ entries: { sdp_seeded: '1', sdp_lotes: '[{"id":"L-1"}]' } })
  });
  assert.equal(saved.status, 200);

  const updated = await fetch(`${firstUrl}/api/state`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ entries: { sdp_seeded: '1', sdp_lotes: '[{"id":"L-2"}]' } })
  });
  assert.equal(updated.status, 200);
  await close(first.server);

  const diskState = JSON.parse(await readFile(dataPath, 'utf8'));
  assert.equal(diskState.entries.sdp_seeded, '1');
  assert.equal(diskState.entries.sdp_lotes, '[{"id":"L-2"}]');

  const backupState = JSON.parse(await readFile(`${dataPath}.backup`, 'utf8'));
  assert.equal(backupState.entries.sdp_lotes, '[{"id":"L-1"}]');

  const second = await createFieldServer({ dataPath });
  const secondUrl = await listen(second.server);
  const restored = await fetch(`${secondUrl}/api/state`).then((response) => response.json());
  assert.equal(restored.entries.sdp_lotes, '[{"id":"L-2"}]');
  await close(second.server);
});

test('la API rechaza claves fuera del espacio de Field OS', async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), 'field-os-store-'));
  const instance = await createFieldServer({ dataPath: resolve(tempDir, 'state.json') });
  const baseUrl = await listen(instance.server);

  const response = await fetch(`${baseUrl}/api/state`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ entries: { password: 'no' } })
  });
  assert.equal(response.status, 400);
  await close(instance.server);
});
