'use strict';
// Plan PR 1, tarea 6: una sola banda de EB en todas las vistas del Formulador.
// La banda mostrada es la de Escala B (scoring.js buildUncertainty, vía
// recipeEBForecast). analyze() también calcula ebLow/ebHigh con otra regla; si
// una vista los lee directo, la misma receta muestra dos rangos distintos.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');

test('las vistas no leen la banda de analyze() directamente, solo vía ebBandFor', () => {
  const helperStart = src.indexOf('const ebBandFor=');
  assert.ok(helperStart >= 0, 'falta el helper ebBandFor');
  const helperEnd = src.indexOf('};', helperStart);
  const outside = src.slice(0, helperStart) + src.slice(helperEnd);
  const hits = outside.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /\.eb(Low|High)\b/.test(l));
  assert.deepEqual(hits.map(([n, l]) => `${n}: ${l.trim().slice(0, 100)}`), []);
});
