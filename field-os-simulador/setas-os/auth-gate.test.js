'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('firebase/auth-gate.js importa dependencias de firebase-init y vendor auth', () => {
  const src = read('firebase/auth-gate.js');
  assert.match(src, /import\s+\{\s*auth\s*\}\s+from\s+["']\.\/firebase-init\.js["']/);
  assert.match(src, /import\s+\{\s*onAuthStateChanged,\s*signInWithEmailAndPassword,\s*signOut\s*\}\s+from\s+["']\.\.\/vendor\/firebase\/firebase-auth\.js["']/);
});

test('auth-gate.js define diccionario completo de traducciones de error de Firebase Auth', () => {
  const src = read('firebase/auth-gate.js');
  const erroresEsperados = [
    'auth/invalid-credential',
    'auth/invalid-email',
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/too-many-requests',
    'auth/network-request-failed'
  ];
  for (const errCode of erroresEsperados) {
    assert.match(src, new RegExp(errCode), `Falta código de error ${errCode} en auth-gate.js`);
  }
});

test('auth-gate.js construye la UI del gate con IDs únicos y atributos de accesibilidad', () => {
  const src = read('firebase/auth-gate.js');
  assert.match(src, /setas-auth-gate/);
  assert.match(src, /setas-auth-form/);
  assert.match(src, /setas-auth-status/);
  assert.match(src, /setas-auth-email/);
  assert.match(src, /setas-auth-password/);
  assert.match(src, /setas-auth-err/);
  assert.match(src, /setas-auth-submit/);
  assert.match(src, /setas-auth-signout/);

  // Atributos de accesibilidad
  assert.match(src, /role=["']status["']/);
  assert.match(src, /aria-live=["']polite["']/);
  assert.match(src, /role=["']alert["']/);
  assert.match(src, /aria-live=["']assertive["']/);
});

test('auth-gate.js maneja el flujo de login y captura de errores', () => {
  const src = read('firebase/auth-gate.js');
  assert.match(src, /signInWithEmailAndPassword\(auth,\s*el\.email\.value\.trim\(\),\s*el\.password\.value\)/);
  assert.match(src, /traducirError\(ex\.code\)/);
});

test('auth-gate.js expone window.__setasSignOut y vincula signOut con el botón', () => {
  const src = read('firebase/auth-gate.js');
  assert.match(src, /window\.__setasSignOut\s*=\s*\(\)\s*=>\s*signOut\(auth\)/);
  assert.match(src, /signOut\(auth\)/);
});
