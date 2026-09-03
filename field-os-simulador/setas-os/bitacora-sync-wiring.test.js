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

test('crearBitLote respalda el lote y sus bolsas nuevas en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const crearBitLote=');
  const end = jsx.indexOf('const updateBitLote=');
  const body = jsx.slice(start, end);
  assert.match(body, /SetasBitacoraDB\.guardarLote\(lote\)/);
  assert.match(body, /SetasBitacoraDB\.guardarBolsas\(bolsas\)/);
});

test('updateBitLote respalda los cambios del lote en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const updateBitLote=');
  const end = jsx.indexOf('const updateBitBolsa=');
  assert.match(jsx.slice(start, end), /SetasBitacoraDB\.actualizarLote\(loteId,\s*fields\)/);
});

test('updateBitBolsa respalda los cambios de la bolsa en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const updateBitBolsa=');
  const end = jsx.indexOf('const addBitCosecha=');
  assert.match(jsx.slice(start, end), /SetasBitacoraDB\.actualizarBolsa\(bolsaId,\s*fields\)/);
});

test('addBitCosecha respalda la cosecha nueva en Firestore con el mismo id local', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const addBitCosecha=');
  const end = jsx.indexOf('const deleteBitCosecha=');
  const body = jsx.slice(start, end);
  assert.match(body, /const e=\{\.\.\.cosecha,id:'COS_'\+Date\.now\(\)\}/, 'el fixture del cuerpo cambió — revisar antes de continuar');
  assert.match(body, /SetasBitacoraDB\.guardarCosecha\(e\)/);
});

test('deleteBitCosecha elimina la cosecha también en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const deleteBitCosecha=');
  const end = jsx.indexOf('const deleteBitLote=');
  assert.match(jsx.slice(start, end), /SetasBitacoraDB\.eliminarCosecha\(id\)/);
});

test('deleteBitLote elimina el lote, sus bolsas y sus cosechas también en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const deleteBitLote=');
  assert.ok(start > -1, 'no se encontró deleteBitLote');
  // deleteBitLote es una función corta (~8 líneas); una ventana fija de 1200
  // caracteres cubre su cuerpo completo sin depender de encontrar el nombre
  // exacto de la siguiente función declarada después en el archivo.
  const body = jsx.slice(start, start + 1200);
  assert.match(body, /SetasBitacoraDB\.eliminarLoteCascade\(loteId,\s*bolsaIds,\s*cosechaIds\)/);
});

test('bitSyncErr existe como estado y se renderiza como aviso no bloqueante', () => {
  const jsx = read('simulador-app.jsx');
  assert.match(jsx, /const \[bitSyncErr,setBitSyncErr\]=React\.useState\(''\)/);
  assert.match(jsx, /\{bitSyncErr&&<span[^>]*title=\{bitSyncErr\}/);
});

test('los 6 mutadores de Bitácora surfacean el fallo vía setBitSyncErr (no dejan el error en silencio)', () => {
  const jsx = read('simulador-app.jsx');
  // 5 sitios usan try/catch(err){setBitSyncErr(...)} de una sola llamada
  // await. crearBitLote es distinto desde el fix de allSettled: dos
  // llamadas independientes, sin catch — el fallo se detecta revisando
  // results.find(r=>r.status==='rejected') y de ahí llama a setBitSyncErr.
  const catchCalls = jsx.match(/catch\(err\)\{\s*setBitSyncErr\(/g) || [];
  assert.equal(catchCalls.length, 5, `se esperaban 5 sitios con catch(err){setBitSyncErr(, hubo ${catchCalls.length}`);
  const start = jsx.indexOf('const crearBitLote=');
  const end = jsx.indexOf('const updateBitLote=');
  const crearBitLoteBody = jsx.slice(start, end);
  assert.match(crearBitLoteBody, /status==='rejected'/, 'crearBitLote debe detectar el fallo entre las promesas de allSettled');
  assert.match(crearBitLoteBody, /setBitSyncErr\(/, 'crearBitLote debe surfacear el fallo detectado');
});

test('bitacora-sync.js nunca importa ni llama una API de lectura de Firestore (invariante de un solo sentido)', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.doesNotMatch(src, /\b(getDoc|getDocs|onSnapshot|query|collection|where|orderBy)\s*\(/);
});

test('los 6 sitios de cableado en simulador-app.jsx conservan el guard if(window.SetasBitacoraDB)', () => {
  const jsx = read('simulador-app.jsx');
  const guards = jsx.match(/if\(window\.SetasBitacoraDB\)\{/g) || [];
  assert.equal(guards.length, 6, `se esperaban 6 guards if(window.SetasBitacoraDB){, hubo ${guards.length}`);
});

// ── Hallazgos menores de la revisión final, ahora corregidos ──────────

test('guardarBolsas y eliminarLoteCascade usan writeBatch, no N escrituras independientes', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.match(src, /import\s*\{[^}]*writeBatch[^}]*\}/, 'writeBatch no está importado');
  const guardarBolsasStart = src.indexOf('export async function guardarBolsas');
  const guardarBolsasEnd = src.indexOf('export async function actualizarBolsa');
  assert.match(src.slice(guardarBolsasStart, guardarBolsasEnd), /writeBatch\(db\)/, 'guardarBolsas debe usar writeBatch');
  const cascadeStart = src.indexOf('export async function eliminarLoteCascade');
  assert.match(src.slice(cascadeStart), /writeBatch\(db\)/, 'eliminarLoteCascade debe usar writeBatch');
});

test('crearBitLote intenta guardar la receta y las bolsas de forma independiente (allSettled, no await secuencial)', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const crearBitLote=');
  const end = jsx.indexOf('const updateBitLote=');
  const body = jsx.slice(start, end);
  assert.match(body, /Promise\.allSettled\(/, 'un fallo en guardarLote no debe impedir el intento de guardarBolsas');
  assert.doesNotMatch(body, /await window\.SetasBitacoraDB\.guardarLote\(lote\);\s*\n\s*await window\.SetasBitacoraDB\.guardarBolsas/, 'no debe quedar el await secuencial anterior');
});

test('los 6 sitios de cableado avisan por consola si SetasBitacoraDB no está disponible', () => {
  const jsx = read('simulador-app.jsx');
  // Ventana amplia: el sitio de crearBitLote es más largo que los otros 5
  // (usa Promise.allSettled con un comentario explicativo).
  const warns = jsx.match(/if\(window\.SetasBitacoraDB\)\{[\s\S]{0,900}?\}else\{console\.warn\(/g) || [];
  assert.equal(warns.length, 6, `se esperaban 6 sitios con aviso por consola, hubo ${warns.length}`);
});
