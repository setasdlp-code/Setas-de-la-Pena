'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');

test('las escrituras a localStorage no se descartan con catch vacío', () => {
  const silent = jsx.match(/localStorage\.setItem\([^;\n]*\);\s*\}catch\(e\)\{\}/g) || [];
  assert.deepEqual(silent, [], 'usar persistLocal(key, value), que avisa si el guardado falla');
});

test('persistLocal avisa al operador y devuelve false si el navegador rechaza el guardado', () => {
  const m = jsx.match(/const persistLocal=\(key,value\)=>\{([\s\S]*?)\n  \};/);
  assert.ok(m, 'persistLocal debe existir');
  assert.match(m[1], /localStorage\.setItem\(key,value\);return true;/);
  assert.match(m[1], /setNoticeDlg\(\{title:'No se pudo guardar'/);
  assert.match(m[1], /return false;/);
});
