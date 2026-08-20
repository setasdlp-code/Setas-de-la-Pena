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
