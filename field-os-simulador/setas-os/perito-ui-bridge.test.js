'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const bridge = fs.readFileSync(path.join(ROOT, 'perito-ui-bridge.js'), 'utf8');
const hook = fs.readFileSync(path.join(ROOT, 'perito-scoring-hook.js'), 'utf8');
const monitor = fs.readFileSync(path.join(ROOT, 'firebase/error-monitor.js'), 'utf8');
const compiled = fs.readFileSync(path.join(ROOT, 'simulador-app.js'), 'utf8');

test('el bridge queda cargado por el runtime sin tocar el JSX', () => {
  assert.match(monitor, /import\s+["']\.\.\/perito-scoring-hook\.js["']/);
  assert.match(hook, /import\s+["']\.\/perito-ui-bridge\.js["']/);
  assert.match(hook, /ctx\.blendedEB\s*!=\s*null/);
  assert.match(hook, /setas-perito-model/);
});

test('el hook se vuelve a enganchar si el runtime .dc reemplaza SetasScoring', () => {
  assert.match(hook, /lastApi/);
  assert.match(hook, /setInterval/);
  assert.match(hook, /attempts\s*>\s*120/);
  assert.doesNotMatch(hook, /if\s*\(attach\(\)\)\s*return/);
});

test('Bodega usa cantidades reales persistidas y no solo presencia de IDs', () => {
  assert.match(bridge, /sdp_lotes/);
  assert.match(bridge, /cantidadKgDisponible/);
  assert.match(bridge, /stockKgById/);
  assert.match(bridge, /batchWetKg/);
  assert.match(bridge, /ingredientMoistureById/);
});

test('la humedad usada para cobertura cuantitativa puede recuperarse del catálogo activo', () => {
  const start = compiled.indexOf('const INGS = [');
  const end = compiled.indexOf('const CATS =', start);
  assert.ok(start >= 0 && end > start, 'no se encontró el catálogo INGS compilado');
  const block = compiled.slice(start, end);
  const re = /id:\s*['"]([^'"]+)['"][\s\S]{0,650}?moisture:\s*([0-9.]+)/g;
  const found = {};
  let m;
  while ((m = re.exec(block))) found[m[1]] = Number(m[2]);
  assert.equal(found.paja_trigo, 12);
  assert.equal(found.bagazo_caña, 55);
  assert.ok(Object.keys(found).length >= 20, `muy pocos ingredientes con humedad: ${Object.keys(found).length}`);
});

test('Recetario calibra EB real solo para la misma especie y pondera similitud', () => {
  assert.match(bridge, /setas_v6/);
  assert.match(bridge, /r\.sKey\s*===\s*sKey/);
  assert.match(bridge, /ebReal/);
  assert.match(bridge, /recipeSimilarity/);
  assert.match(bridge, /historyCalibration/);
});

test('la presentación elimina falsa precisión de pH, EB y contaminación', () => {
  assert.match(bridge, /medir mezcla hidratada/);
  assert.match(bridge, /inferido, no observado/);
  assert.match(bridge, /eb\.low/);
  assert.match(bridge, /eb\.high/);
  assert.match(bridge, /RIESGO INFERIDO ALTO DE CONTAMINACIÓN/);
  assert.doesNotMatch(bridge, /pH estimado[^'"\n]*toFixed/);
});
