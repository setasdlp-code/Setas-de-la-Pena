import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { createFieldServer } from '../server/server.mjs';

const ONE_PIXEL_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const listen = async (server) => {
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  return `http://127.0.0.1:${server.address().port}`;
};

const close = (server) => new Promise((resolveClose, rejectClose) => {
  server.close((error) => error ? rejectClose(error) : resolveClose());
  // fetch() keeps its HTTP/1.1 connection alive by default, which otherwise
  // blocks close()'s callback until the idle socket times out — force it
  // shut so the promise settles immediately instead of racing the test
  // runner's own shutdown (surfaced as ERR_TEST_FAILURE on Node 22 in CI).
  server.closeAllConnections();
});

const paths = async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), 'field-os-photos-'));
  return {
    dataPath: resolve(tempDir, 'state.json'),
    ledgerPath: resolve(tempDir, 'ledger.json'),
    photosDir: resolve(tempDir, 'photos')
  };
};

test('sube una foto válida y la sirve de vuelta con bytes idénticos', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const upload = await fetch(`${baseUrl}/api/photos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: ONE_PIXEL_PNG, containerHint: 'C-0412' })
  });
  assert.equal(upload.status, 201);
  const { photo_ref: photoRef } = await upload.json();
  assert.match(photoRef, /^\d{4}-\d{2}-\d{2}-C-0412-.+\.png$/);

  const served = await fetch(`${baseUrl}/photos/${photoRef}`);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get('content-type'), 'image/png');
  const servedBytes = Buffer.from(await served.arrayBuffer());
  const expectedBytes = Buffer.from(ONE_PIXEL_PNG.split(',')[1], 'base64');
  assert.ok(servedBytes.equals(expectedBytes));
  await close(instance.server);
});

test('rechaza contenido que no sniffea como imagen soportada', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const fakeText = `data:image/png;base64,${Buffer.from('no soy una imagen').toString('base64')}`;
  const upload = await fetch(`${baseUrl}/api/photos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: fakeText })
  });
  assert.equal(upload.status, 415);
  await close(instance.server);
});

test('rechaza fotos por encima del límite de tamaño', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const oversized = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff]),
    Buffer.alloc(5_100_000, 1)
  ]).toString('base64');
  const upload = await fetch(`${baseUrl}/api/photos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: `data:image/jpeg;base64,${oversized}` })
  });
  assert.equal(upload.status, 413);
  await close(instance.server);
});

test('rechaza nombres de archivo con recorrido de ruta al servir fotos', async () => {
  const { dataPath, ledgerPath, photosDir } = await paths();
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir });
  const baseUrl = await listen(instance.server);

  const traversal = await fetch(`${baseUrl}/photos/${encodeURIComponent('../../etc/passwd')}`);
  assert.equal(traversal.status, 400);
  await close(instance.server);
});
