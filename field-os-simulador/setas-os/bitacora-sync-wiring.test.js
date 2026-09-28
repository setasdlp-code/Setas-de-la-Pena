'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('firebase/bitacora-sync.js expone las 7 funciones de respaldo en window.SetasBitacoraDB', () => {
  const src = read('firebase/bitacora-sync.js');
  ['guardarLote', 'actualizarLote', 'guardarBolsas', 'actualizarBolsa', 'guardarCosecha', 'eliminarCosecha', 'eliminarLoteCascade']
    .forEach(fn => assert.match(src, new RegExp(`export async function ${fn}\\(`), `falta export de ${fn}`));
  assert.match(src, /window\.SetasBitacoraDB\s*=\s*\{/);
});

test('bitacora-sync.js escribe con el id local como id del documento, no addDoc', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.match(src, /setDoc\(doc\(db,\s*["']bitacora_lotes["']/);
  assert.match(src, /setDoc\(doc\(db,\s*["']bitacora_bolsas["']/);
  assert.match(src, /setDoc\(doc\(db,\s*["']bitacora_cosechas["']/);
  assert.doesNotMatch(src, /addDoc\(/);
});

test('bitacora-sync.js excluye la foto del respaldo de bolsas', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.match(src, /const stripFoto\s*=/);
  const guardarBolsasStart = src.indexOf('export async function guardarBolsas');
  const guardarBolsasEnd = src.indexOf('export async function actualizarBolsa');
  const actualizarBolsaStart = guardarBolsasEnd;
  const actualizarBolsaEnd = src.indexOf('export async function guardarCosecha');
  assert.match(src.slice(guardarBolsasStart, guardarBolsasEnd), /stripFoto\(/, 'guardarBolsas debe usar stripFoto');
  assert.match(src.slice(actualizarBolsaStart, actualizarBolsaEnd), /stripFoto\(/, 'actualizarBolsa debe usar stripFoto');
});

test('auth-gate carga db y bitacora-sync solo después de inicializar el runtime de datos', () => {
  const html = read('Setas OS v5.dc.html');
  const gate = read('firebase/auth-gate.js');
  const initIdx = gate.indexOf('await import("./firebase-init.js")');
  const dbIdx = gate.indexOf('import("./db.js")');
  const syncIdx = gate.indexOf('import("./bitacora-sync.js")');

  assert.ok(initIdx > -1, 'auth-gate debe iniciar Firebase data runtime');
  assert.ok(dbIdx > initIdx, 'db.js debe esperar al singleton de Firebase data runtime');
  assert.ok(syncIdx > initIdx, 'bitacora-sync.js debe esperar al singleton de Firebase data runtime');
  assert.equal(html.includes('<script type="module" src="firebase/db.js">'), false, 'db.js no debe descargarse antes del login');
  assert.equal(html.includes('<script type="module" src="firebase/bitacora-sync.js">'), false, 'bitacora-sync.js no debe descargarse antes del login');
});

// ── Cableado de escritura: de fire-and-forget a cola durable ─────────────
//
// Estas pruebas guardaban que los 6 mutadores llegasen a Firestore y que ningún
// fallo quedase en silencio. Esa intención se mantiene intacta; lo que cambió es
// el mecanismo. Antes cada mutador lanzaba la llamada y, si fallaba, escribía un
// mensaje en `bitSyncErr` y nadie reintentaba nunca: un registro hecho sin señal
// se perdía para el servidor. Ahora cada mutador encola la operación y el
// drenador la reintenta hasta que entra. Por eso las aserciones pasan de
// comprobar la llamada directa a comprobar el encolado.

const TIPOS_Y_SITIOS = [
  ['crearBitLote', 'const crearBitLote=', 'guardarLote'],
  ['crearBitLote (bolsas)', 'const crearBitLote=', 'guardarBolsas'],
  ['updateBitLote', 'const updateBitLote=', 'actualizarLote'],
  ['updateBitBolsa', 'const updateBitBolsa=', 'actualizarBolsa'],
  ['addBitCosecha', 'const addBitCosecha=', 'guardarCosecha'],
  ['deleteBitCosecha', 'const deleteBitCosecha=', 'eliminarCosecha'],
  ['deleteBitLote', 'const deleteBitLote=', 'eliminarLoteCascade'],
];

test('cada mutador de Bitácora encola su operación en vez de dispararla y olvidarla', () => {
  const jsx = read('simulador-app.jsx');
  TIPOS_Y_SITIOS.forEach(([nombre, ancla, tipo]) => {
    const start = jsx.indexOf(ancla);
    assert.ok(start > -1, `no se encontró ${ancla}`);
    const body = jsx.slice(start, start + 2600);
    assert.match(body, new RegExp(`encolarSync\\(\\{\\s*type:\\s*'${tipo}'`),
      `${nombre} debe encolar una operación ${tipo}`);
  });
});

test('los 7 tipos encolados existen como funciones reales de bitacora-sync.js', () => {
  // El mismo acoplamiento que ya rompimos una vez entre módulos escritos en
  // paralelo: si alguien renombra una función de respaldo, esto debe fallar.
  const jsx = read('simulador-app.jsx');
  const src = read('firebase/bitacora-sync.js');
  const tipos = [...jsx.matchAll(/encolarSync\(\{\s*type:\s*'([a-zA-Z]+)'/g)].map(m => m[1]);
  assert.ok(tipos.length >= 7, `se esperaban al menos 7 encolados, hubo ${tipos.length}`);
  [...new Set(tipos)].forEach(tipo => {
    assert.match(src, new RegExp(`export async function ${tipo}\\(`), `${tipo} no existe en bitacora-sync.js`);
  });
});

test('ya no queda ninguna escritura fire-and-forget que pierda el cambio al fallar', () => {
  const jsx = read('simulador-app.jsx');
  // El patrón viejo: llamar y, al fallar, sólo dejar un mensaje. Nadie
  // reintentaba, así que el cambio se perdía para el servidor en silencio.
  assert.doesNotMatch(jsx, /catch\(err\)\{\s*setBitSyncErr\(/,
    'una escritura que sólo anota el error y no reintenta vuelve a perder trabajo');
  assert.doesNotMatch(jsx, /await window\.SetasBitacoraDB\.(actualizarLote|actualizarBolsa|guardarCosecha|eliminarCosecha)\(/,
    'las escrituras de Bitácora deben pasar por la cola, no llamarse directamente');
});

test('el drenador reintenta hasta que el cambio entra, y limpia al desmontar', () => {
  const jsx = read('simulador-app.jsx');
  assert.match(jsx, /nextPending\(/, 'el drenador debe pedir la siguiente operación pendiente');
  assert.match(jsx, /markSynced\(/, 'una operación que entra sale de la cola');
  assert.match(jsx, /markFailed\(/, 'una operación que falla se reintenta con retroceso');
  assert.match(jsx, /addEventListener\('online'/, 'debe drenar cuando vuelve la red');
  assert.match(jsx, /clearInterval\(/, 'no puede quedar un intervalo vivo al desmontar');
});

test('la cola sobrevive a recargar el navegador', () => {
  const jsx = read('simulador-app.jsx');
  // El caso real: el operario cierra la app en la sala y la reabre en la
  // oficina. Una cola que sólo vive en memoria pierde justo lo que protege.
  assert.match(jsx, /sdp_sync_queue/, 'la cola debe persistirse');
  assert.match(jsx, /localStorage\.getItem\('sdp_sync_queue'\)/, 'y rehidratarse al arrancar');
});

test('el operario ve siempre si queda algo sin sincronizar', () => {
  const jsx = read('simulador-app.jsx');
  assert.match(jsx, /describeForOperator\(/, 'el indicador sale del módulo, no de un texto inventado');
  assert.match(jsx, /data-testid="sync-indicator"/);
  assert.match(jsx, /aria-live="polite"/, 'el cambio de estado debe anunciarse');
});

test('bitacora-sync.js nunca importa ni llama una API de lectura de Firestore (invariante de un solo sentido)', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.doesNotMatch(src, /\b(getDoc|getDocs|onSnapshot|query|collection|where|orderBy)\s*\(/);
});

test('guardarBolsas y eliminarLoteCascade usan writeBatch, no N escrituras independientes', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.match(src, /import\s*\{[^}]*writeBatch[^}]*\}/, 'writeBatch no está importado');
  const guardarBolsasStart = src.indexOf('export async function guardarBolsas');
  const guardarBolsasEnd = src.indexOf('export async function actualizarBolsa');
  assert.match(src.slice(guardarBolsasStart, guardarBolsasEnd), /writeBatch\(db\)/, 'guardarBolsas debe usar writeBatch');
  const cascadeStart = src.indexOf('export async function eliminarLoteCascade');
  assert.match(src.slice(cascadeStart), /writeBatch\(db\)/, 'eliminarLoteCascade debe usar writeBatch');
});

