'use strict';

/**
 * El service worker no se puede ejecutar en Node, así que estas pruebas fijan
 * las propiedades que, si se rompen, dejan a un operario sin aplicación en una
 * zona sin cobertura — o peor, sirviéndole datos viejos de Firebase como si
 * fueran actuales.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const HERE = __dirname;
const SW_SRC = fs.readFileSync(path.join(HERE, 'sw.js'), 'utf8');
const SHELL = fs.readFileSync(path.join(HERE, 'Setas OS v5.dc.html'), 'utf8');

/** Ejecuta sw.js con un `self` falso y devuelve los handlers registrados. */
function loadServiceWorker() {
  const handlers = {};
  const self = {
    addEventListener: (type, fn) => { handlers[type] = fn; },
    location: { origin: 'https://sdlp-os.web.app' },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const sandbox = { self, caches: { open: async () => ({}), keys: async () => [], delete: async () => {} }, fetch: async () => ({}), URL, Response: { error: () => ({}) }, console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(SW_SRC, sandbox, { filename: 'sw.js' });
  return { handlers, sandbox };
}

test('el service worker se registra desde el shell', () => {
  assert.match(SHELL, /navigator\.serviceWorker\.register\(\s*'\.\/sw\.js'\s*\)/,
    'sin registro el fichero no hace nada');
  assert.match(SHELL, /'serviceWorker' in navigator/,
    'debe comprobar soporte antes de registrar');
  assert.match(SHELL, /\.catch\(/,
    'un fallo al registrar no debe romper el arranque');
});

test('registra install, activate y fetch', () => {
  const { handlers } = loadServiceWorker();
  for (const ev of ['install', 'activate', 'fetch']) {
    assert.equal(typeof handlers[ev], 'function', `falta el handler de ${ev}`);
  }
});

test('la versión de caché la estampa build.js, no una mano', () => {
  // Un número escrito a mano se olvida en el despliegue y alguien queda con el
  // shell viejo indefinidamente.
  const { sourceHash, SRC } = require('./build.js');
  const hash = sourceHash(fs.readFileSync(SRC, 'utf8')).slice(0, 12);
  assert.match(SW_SRC, /\/\/ build:cache-version/, 'falta la marca que busca build.js');
  assert.ok(SW_SRC.includes(`const CACHE_VERSION = '${hash}'`),
    'sw.js está desactualizado respecto a simulador-app.jsx — corre `node build.js` y súbelo');
});

test('no hay lista de assets escrita a mano que pueda desincronizarse', () => {
  // El precacheo se limita al arranque; el resto se guarda al pedirse. Una lista
  // enumerando los 34 scripts de auth-gate.js se rompería al añadir un módulo.
  const boot = SW_SRC.match(/const BOOT = \[([^\]]*)\]/);
  assert.ok(boot, 'debe existir un conjunto mínimo de arranque');
  const count = [...boot[1].matchAll(/'/g)].length / 2;
  assert.ok(count <= 6, `BOOT enumera ${count} recursos; si crece, es una lista que se desincronizará`);
});

test('nada que no sea del mismo origen se intercepta', () => {
  // Cachear una respuesta de Firestore o de la función de aceptación serviría
  // estado viejo como si fuera actual, que es peor que estar sin conexión.
  assert.match(SW_SRC, /url\.origin !== self\.location\.origin/,
    'debe descartar todo lo que no sea del mismo origen');
  assert.match(SW_SRC, /request\.method !== 'GET'/,
    'sólo GET: nunca debe tocarse una escritura');
});

test('no se guardan respuestas opacas ni erróneas', () => {
  assert.match(SW_SRC, /res\.ok && res\.type === 'basic'/,
    'cachear un error deja el recurso roto hasta que cambie la versión');
});

test('la navegación va primero a la red', () => {
  // Al revés, un despliegue tardaría una visita extra en verse.
  const nav = SW_SRC.slice(SW_SRC.indexOf('if (isNavigation)'));
  const fetchAt = nav.indexOf('await fetch(');
  const cacheAt = nav.indexOf('cache.match(');
  assert.ok(fetchAt > -1 && cacheAt > -1 && fetchAt < cacheAt,
    'la caché debe ser el respaldo, no la primera opción');
});

test('activate borra las cachés de versiones anteriores', () => {
  assert.match(SW_SRC, /names\.filter\(n => n !== CACHE\)\.map\(n => caches\.delete\(n\)\)/,
    'sin purga se acumulan shells viejos hasta llenar la cuota');
});
