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

test('el hook se vuelve a enganchar si el runtime .dc reemplaza SetasScoring sin sondeo continuo', () => {
  assert.match(hook, /lastApi/);
  assert.match(hook, /\[100,\s*400,\s*1200,\s*3000\]/);
  assert.match(hook, /setTimeout\(attach/);
  assert.doesNotMatch(hook, /setInterval/);
});

test('Bodega and moisture arrive from the active React snapshot, never compiled code or DOM inputs', () => {
  const jsx = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
  assert.match(jsx, /stockKgById:\{\.\.\.stockMap\}/);
  assert.match(jsx, /ingredientMoistureById:Object.fromEntries\(prodIngs/);
  assert.match(bridge, /batchWetKg: detail.batch.wetKg/);
  assert.doesNotMatch(bridge, /fetch\(|localStorage\.getItem|parseMoistureCatalog|findBatchWetKg/);
});

test('Recetario calibra EB real solo para la misma especie y pondera similitud', () => {
  assert.match(bridge, /setas_v6/);
  assert.match(bridge, /r\.sKey\s*===\s*sKey/);
  assert.match(bridge, /assessHistory/);
  assert.match(bridge, /weightedCalibration/);
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
