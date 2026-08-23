'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'sim.css'), 'utf8');

test('las filas de receta no bloqueadas se marcan como ajustables cuando el balance no cierra', () => {
  assert.match(jsx, /className=\{`rec-row\$\{isLocked\?' rec-locked':''\}\$\{!balanced&&!isLocked\?' is-adjustable':''\}`\}/);
});

test('sim.css define un estilo visible (no solo color) para .is-adjustable', () => {
  assert.match(css, /\.sim-root \.rec-row\.is-adjustable\{/);
});
