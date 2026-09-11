'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('firebase/eventos-cultivo-sync.js expone registrarEvento en window.SetasEventosCultivoDB', () => {
  const src = read('firebase/eventos-cultivo-sync.js');
  assert.match(src, /export async function registrarEvento\(/);
  assert.match(src, /window\.SetasEventosCultivoDB\s*=\s*\{\s*registrarEvento\s*\}/);
});

test('eventos-cultivo-sync.js escribe con el id local del evento como id del documento, no addDoc', () => {
  const src = read('firebase/eventos-cultivo-sync.js');
  assert.match(src, /setDoc\(doc\(db,\s*["']eventos_cultivo["'],\s*evento\.id\)/);
  assert.doesNotMatch(src, /addDoc\(/);
});

test('eventos-cultivo-sync.js nunca lee de Firestore (invariante de un solo sentido)', () => {
  const src = read('firebase/eventos-cultivo-sync.js');
  assert.doesNotMatch(src, /\b(getDoc|getDocs|onSnapshot|query|collection|where|orderBy)\s*\(/);
});

test('auth-gate carga eventos-cultivo-sync.js junto con bitacora-sync y public-trace-sync', () => {
  const gate = read('firebase/auth-gate.js');
  const initIdx = gate.indexOf('await import("./firebase-init.js")');
  const syncIdx = gate.indexOf('import("./eventos-cultivo-sync.js")');
  assert.ok(syncIdx > initIdx, 'eventos-cultivo-sync.js debe esperar al singleton de Firebase data runtime');
});

test('reportarEventoCultivo construye el evento con batchSheetApi.buildCultivoEvento y lo respalda vía SetasEventosCultivoDB', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const reportarEventoCultivo = ');
  const end = jsx.indexOf('// Registra la acción elegida en la ficha');
  assert.ok(start > -1, 'no se encontró reportarEventoCultivo');
  const body = jsx.slice(start, end);
  assert.match(body, /batchSheetApi\.buildCultivoEvento\(/);
  assert.match(body, /window\.SetasEventosCultivoDB\.registrarEvento\(evento\)/);
  assert.match(body, /else\s*\{\s*console\.warn\(/, 'debe avisar por consola si SetasEventosCultivoDB no está disponible');
});

test('reportarEventoCultivo refleja riego y observación en la bitácora del lote vía updateBitLote', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const reportarEventoCultivo = ');
  const end = jsx.indexOf('// Registra la acción elegida en la ficha');
  const body = jsx.slice(start, end);
  assert.match(body, /appendBatchEvent\(lote\.lifecycleEvents \|\| \[\]/);
  assert.match(body, /updateBitLote\(lote\.id,\s*\{\s*lifecycleEvents:\s*nextLog\s*\}\)/);
});

test('reportarEventoCultivo abre setShowDiagModal para contaminación y setShowBitCosecha para cosecha parcial', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const reportarEventoCultivo = ');
  const end = jsx.indexOf('// Registra la acción elegida en la ficha');
  const body = jsx.slice(start, end);
  assert.match(body, /tipo === 'contaminacion'/);
  assert.match(body, /setShowDiagModal\(true\)/);
  assert.match(body, /tipo === 'cosecha_parcial'/);
  assert.match(body, /setShowBitCosecha\(true\)/);
});

test('el action sheet móvil ofrece los 4 botones de "Reportar evento"', () => {
  const jsx = read('simulador-app.jsx');
  assert.match(jsx, /data-testid="qr-reportar-evento"/);
  ['evento-observacion', 'evento-riego', 'evento-contaminacion', 'evento-cosecha_parcial'].forEach(action => {
    assert.match(jsx, new RegExp(`data-action="${action}"`), `falta el botón data-action="${action}"`);
  });
});

test('firestore.rules declara eventos_cultivo como log de solo creación, atribuido al operador autenticado', () => {
  const rules = read('firebase/firestore.rules');
  const start = rules.indexOf('match /eventos_cultivo/{id}');
  assert.ok(start > -1, 'no se encontró la regla de eventos_cultivo');
  const end = rules.indexOf('match /ingredientes/{id}');
  const body = rules.slice(start, end);
  assert.match(body, /request\.resource\.data\.operatorId == request\.auth\.uid/);
  assert.match(body, /allow update, delete: if false;/);
});
