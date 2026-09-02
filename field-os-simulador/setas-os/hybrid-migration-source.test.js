'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');

test('bridge activa hybrid con targetKey/spp y sin inventar perfil del Formulador', () => {
  const bridge = read('perito-scenarios-bridge.js');
  assert.match(bridge, /searchMode:\s*['"]hybrid['"]/);
  assert.match(bridge, /targetKey:\s*sKey/);
  assert.match(bridge, /\bspp\b/);
  assert.match(bridge, /invLotes:\s*lots/);
  assert.match(bridge, /stockMap:\s*context\.stockKgById/);
  assert.doesNotMatch(bridge, /profileKey:\s*['"]produccion['"]/);
});

test('simulador deja de consumir runAutoOptimizer y enruta los tres flujos al helper hybrid', () => {
  const jsx = read('simulador-app.jsx');
  assert.doesNotMatch(jsx, /\brunAutoOptimizer\s*\(/);
  assert.doesNotMatch(jsx, /\brunAutoOptimizer\s*,/);
  assert.match(jsx, /const runHybridRecipeSearch=/);
  const calls = jsx.match(/runHybridRecipeSearch\(\{/g) || [];
  assert.ok(calls.length >= 3, `esperaba >=3 call sites hybrid, vi ${calls.length}`);
  assert.match(jsx, /r\.ranked\?\.\[0\]\?\.evaluation\?\.analysis/);
  assert.match(jsx, /\(out\.ranked\|\|\[\]\)\.slice\(0,12\)/);
});

test('Auth carga perito-scenarios después de scoring/optimizer y antes del bundle que consume el global', () => {
  const authGate = read('firebase/auth-gate.js');
  const perito = authGate.indexOf('"../perito-scenarios.js"');
  const optimizer = authGate.indexOf('"../recipe-optimizer.js"');
  const app = authGate.indexOf('await import("../simulador-app.js")');
  assert.ok(perito > optimizer, 'perito-scenarios.js debe cargarse después de scoring/recipe optimizer');
  assert.ok(app > perito, 'el bundle React debe esperar perito-scenarios');
});
