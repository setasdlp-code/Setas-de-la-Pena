'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('firebase/firestore.rules define masaBalanceada sin funciones recursivas', () => {
  const rules = read('firebase/firestore.rules');
  assert.match(rules, /function getPct\(ingredientes, i\)/);
  assert.doesNotMatch(rules, /sumPctFrom\(/, 'no debe incluir llamadas recursivas');
});

test('firebase/firestore.rules protege bitacora_bolsas contra inyección de foto base64', () => {
  const rules = read('firebase/firestore.rules');
  assert.match(rules, /match \/bitacora_bolsas\/\{id\}/);
  assert.match(rules, /!\(['"]foto['"] in request\.resource\.data\)/);
});

test('firebase/firestore.rules valida inmutabilidad de recetaSnapshot y tipo de status en lotes_produccion', () => {
  const rules = read('firebase/firestore.rules');
  assert.match(rules, /match \/lotes_produccion\/\{id\}/);
  assert.match(rules, /request\.resource\.data\.recetaSnapshot == resource\.data\.recetaSnapshot/);
  assert.match(rules, /request\.resource\.data\.status is string/);
});

test('firebase/firestore.rules limita escrituras de catálogo e incidencias a usuarios autenticados', () => {
  const rules = read('firebase/firestore.rules');
  assert.match(rules, /match \/ingredientes\/\{id\}[\s\S]*?allow write: if isAdmin\(\);/);
  assert.match(rules, /match \/app_errors\/\{id\}[\s\S]*?allow create: if signedIn\(\);/);
});

test('firebase/firestore.rules no acepta telemetría anónima según un campo source autodeclarado', () => {
  const rules = read('firebase/firestore.rules');
  assert.match(rules, /match \/telemetria_lecturas\/\{id\}[\s\S]*?allow create: if signedIn\(\);/);
  assert.match(rules, /match \/telemetria_salas\/\{id\}[\s\S]*?allow write: if signedIn\(\);/);
  assert.doesNotMatch(rules, /source\s*==\s*['"]esp32_hardware['"]/);
});
