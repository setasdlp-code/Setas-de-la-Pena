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
  assert.match(jsx, /\(out\.ranked\|\|\[\]\)\.slice\(0,6\)/);
});

test('HTML carga perito-scenarios antes del bundle que consume el global', () => {
  const html = read('Setas OS v5.dc.html');
  const perito = html.indexOf('<script src="perito-scenarios.js"></script>');
  const optimizer = html.indexOf('<script src="recipe-optimizer.js"></script>');
  assert.ok(perito > optimizer, 'perito-scenarios.js debe cargarse después de scoring/recipe optimizer y antes del app runtime');
});
