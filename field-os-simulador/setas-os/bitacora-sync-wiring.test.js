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

test('Setas OS v5.dc.html carga bitacora-sync.js como módulo después de db.js', () => {
  const html = read('Setas OS v5.dc.html');
  const dbIdx = html.indexOf('<script type="module" src="firebase/db.js">');
  const syncIdx = html.indexOf('<script type="module" src="firebase/bitacora-sync.js">');
  assert.ok(dbIdx > -1, 'no se encontró la carga de firebase/db.js');
  assert.ok(syncIdx > dbIdx, 'bitacora-sync.js debe cargarse después de db.js, en el mismo shell');
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

test('los 6 mutadores de Bitácora llaman a setBitSyncErr en su catch (no dejan el error en silencio)', () => {
  const jsx = read('simulador-app.jsx');
  // \s* tolera el bloque catch de crearBitLote (Tarea 2), que envuelve dos
  // awaits y por eso separa "catch(err){" de "setBitSyncErr(" en líneas
  // distintas; los otros 5 sitios usan la forma de una sola línea.
  const calls = jsx.match(/catch\(err\)\{\s*setBitSyncErr\(/g) || [];
  assert.equal(calls.length, 6, `se esperaban 6 llamadas a setBitSyncErr en catch, hubo ${calls.length}`);
});
