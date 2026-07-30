import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createStateStore } from './store.mjs';
import { createLedgerStore } from './ledger-store.mjs';
import { createPhotoStore, MAX_PHOTO_BYTES } from './photo-store.mjs';
import { createInventoryStore } from './inventory-store.mjs';

const serverDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(serverDir, '..');
const DEFAULT_DATA_PATH = resolve(appDir, 'data', 'state.json');
const DEFAULT_LEDGER_PATH = resolve(appDir, 'data', 'ledger.json');
const DEFAULT_PHOTOS_DIR = resolve(appDir, 'data', 'photos');
const DEFAULT_INVENTORY_PATH = resolve(appDir, 'data', 'inventory.json');
const MAX_BODY_BYTES = 2_000_000;
const MAX_PHOTO_BODY_BYTES = MAX_PHOTO_BYTES + 100_000; // base64 overhead + envelope

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const STATIC_FILES = new Set([
  '/simulador.html',
  '/sesion.html',
  '/recipe-sim-v2.css',
  '/ds-bridge.css',
  '/fieldos-tokens.css'
]);
const STATIC_PREFIXES = ['/assets/', '/_ds/', '/_standalone_imgs/'];

const securityHeaders = {
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY'
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    ...securityHeaders,
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = async (request, maxBytes = MAX_BODY_BYTES) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error('Cuerpo demasiado grande.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch (_) {
    const error = new Error('JSON inválido.');
    error.statusCode = 400;
    throw error;
  }
};

const isAllowedStaticPath = (pathname) => (
  STATIC_FILES.has(pathname) || STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
);

export const createFieldServer = async ({
  dataPath = process.env.FIELD_OS_DATA_PATH || DEFAULT_DATA_PATH,
  ledgerPath = process.env.FIELD_OS_LEDGER_PATH || DEFAULT_LEDGER_PATH,
  photosDir = process.env.FIELD_OS_PHOTOS_DIR || DEFAULT_PHOTOS_DIR,
  inventoryPath = process.env.FIELD_OS_INVENTORY_PATH || DEFAULT_INVENTORY_PATH
} = {}) => {
  const store = await createStateStore(dataPath);
  const ledger = await createLedgerStore(ledgerPath);
  const photos = createPhotoStore(photosDir);
  const inventory = await createInventoryStore(inventoryPath);

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);

      if (pathname === '/api/health' && request.method === 'GET') {
        sendJson(response, 200, { ok: true, persistence: 'central-file', version: 1 });
        return;
      }

      if (pathname === '/api/state' && request.method === 'GET') {
        sendJson(response, 200, { entries: store.snapshot() });
        return;
      }

      if (pathname === '/api/state' && (request.method === 'PUT' || request.method === 'POST')) {
        const payload = await readJsonBody(request);
        const entries = await store.replace(payload.entries || {});
        sendJson(response, 200, { ok: true, entries });
        return;
      }

      if (pathname === '/api/ledger' && request.method === 'GET') {
        sendJson(response, 200, { events: ledger.all() });
        return;
      }

      if (pathname === '/api/ledger' && request.method === 'POST') {
        const payload = await readJsonBody(request);
        const event = await ledger.append(payload);
        sendJson(response, 201, { ok: true, event });
        return;
      }

      if (pathname === '/api/photos' && request.method === 'POST') {
        const payload = await readJsonBody(request, MAX_PHOTO_BODY_BYTES);
        const saved = await photos.save(payload.data, { containerHint: payload.containerHint });
        sendJson(response, 201, { ok: true, photo_ref: saved.photoRef });
        return;
      }

      if (pathname === '/api/inventory' && request.method === 'GET') {
        sendJson(response, 200, { items: inventory.all() });
        return;
      }

      if (pathname === '/api/inventory' && (request.method === 'PUT' || request.method === 'POST')) {
        const payload = await readJsonBody(request);
        const item = await inventory.upsert(payload);
        sendJson(response, 200, { ok: true, item });
        return;
      }

      if (pathname === '/api/inventory' && request.method === 'DELETE') {
        const payload = await readJsonBody(request);
        const removed = await inventory.remove(payload.lote);
        if (!removed) {
          sendJson(response, 404, { error: 'Lote no encontrado.' });
          return;
        }
        sendJson(response, 200, { ok: true });
        return;
      }

      if (pathname.startsWith('/photos/') && request.method === 'GET') {
        const filename = pathname.slice('/photos/'.length);
        const filePath = photos.resolvePath(filename);
        if (!filePath) {
          sendJson(response, 400, { error: 'Nombre de archivo inválido.' });
          return;
        }
        const fileStat = await stat(filePath).catch(() => null);
        if (!fileStat || !fileStat.isFile()) {
          sendJson(response, 404, { error: 'No encontrado.' });
          return;
        }
        const extension = extname(filePath).toLowerCase();
        response.writeHead(200, {
          ...securityHeaders,
          'cache-control': 'private, max-age=31536000, immutable',
          'content-length': fileStat.size,
          'content-type': MIME_TYPES[extension] || 'application/octet-stream'
        });
        createReadStream(filePath).pipe(response);
        return;
      }

      if (!['GET', 'HEAD'].includes(request.method || '')) {
        sendJson(response, 405, { error: 'Método no permitido.' });
        return;
      }

      const staticPath = pathname === '/' ? '/simulador.html' : pathname;
      if (!isAllowedStaticPath(staticPath)) {
        sendJson(response, 404, { error: 'No encontrado.' });
        return;
      }

      const filePath = resolve(appDir, `.${staticPath}`);
      if (!filePath.startsWith(`${appDir}${sep}`)) {
        sendJson(response, 400, { error: 'Ruta inválida.' });
        return;
      }

      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw Object.assign(new Error('No encontrado.'), { code: 'ENOENT' });

      const extension = extname(filePath).toLowerCase();
      response.writeHead(200, {
        ...securityHeaders,
        // Los nombres de los bundles son estables; revalidar evita servir una versión anterior.
        'cache-control': 'no-cache',
        'content-length': fileStat.size,
        'content-type': MIME_TYPES[extension] || 'application/octet-stream'
      });
      if (request.method === 'HEAD') response.end();
      else createReadStream(filePath).pipe(response);
    } catch (error) {
      if (error.code === 'ENOENT') {
        sendJson(response, 404, { error: 'No encontrado.' });
        return;
      }
      const statusCode = error.statusCode || (error instanceof TypeError ? 400 : 500);
      sendJson(response, statusCode, { error: statusCode === 500 ? 'Error interno.' : error.message });
      if (statusCode === 500) console.error(error);
    }
  });

  return { server, store, ledger, photos, inventory };
};

export const startFieldServer = async ({
  host = process.env.HOST || '127.0.0.1',
  port = Number.parseInt(process.env.PORT || '4173', 10),
  dataPath = process.env.FIELD_OS_DATA_PATH || DEFAULT_DATA_PATH,
  ledgerPath = process.env.FIELD_OS_LEDGER_PATH || DEFAULT_LEDGER_PATH,
  photosDir = process.env.FIELD_OS_PHOTOS_DIR || DEFAULT_PHOTOS_DIR,
  inventoryPath = process.env.FIELD_OS_INVENTORY_PATH || DEFAULT_INVENTORY_PATH
} = {}) => {
  const instance = await createFieldServer({ dataPath, ledgerPath, photosDir, inventoryPath });
  await new Promise((resolveListen, rejectListen) => {
    instance.server.once('error', rejectListen);
    instance.server.listen(port, host, resolveListen);
  });
  const address = instance.server.address();
  console.log(`Field OS disponible en http://${host}:${address.port}`);
  console.log(`Persistencia: ${resolve(dataPath)}`);
  return instance;
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const instance = await startFieldServer();
  const shutdown = async () => {
    await instance.store.flush();
    await instance.ledger.flush();
    await instance.inventory.flush();
    instance.server.close(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
