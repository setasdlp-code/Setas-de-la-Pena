'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'sim.css'), 'utf8');

test('Formulador separates editorial context, numeric data and provenance', () => {
  assert.match(jsx, /Una fórmula para revisar proporciones, disponibilidad de insumos y comportamiento esperado antes de guardarla\./);
  assert.match(jsx, /className="form-summary-strip"/);
  assert.match(jsx, /Manual · lote planificado/);
  assert.match(jsx, /Basado en inventario registrado/);
  assert.match(jsx, /Basado en catálogo de análisis/);
  assert.match(jsx, /Por confirmar · referencia de catálogo/);
  assert.match(css, /\.form-summary-v\s*\{[\s\S]*?font-family:\s*var\(--font-mono\)[\s\S]*?font-variant-numeric:\s*tabular-nums/);
});

test('workflow keeps all five editorial steps visible', () => {
  assert.match(jsx, /01 Especie · 02 Objetivo · 03 Ingredientes · 04 Balance · 05 Revisión/);
  assert.match(jsx, /form-flow-grid form-flow-grid--5/);
});

test('operational status grammar does not alias epistemic states', () => {
  for (const state of ['within-target', 'available', 'attention', 'quarantine', 'failed', 'discarded']) assert.match(css, new RegExp(`\\.fos-status--${state}`));
  assert.doesNotMatch(css, /\.fos-status--(?:verified|verificado|pending|por-confirmar|unavailable|no-disponible|atencion|disponible|descartado)/);
  assert.match(jsx, /catalog-card-footer[\s\S]*?fos-status--available[\s\S]*?Disponible[\s\S]*?Ver especie/);
  assert.match(jsx, /className="form-draft-state">Estado ·/);
});

test('Formulador controls use sans while scientific identity remains editorial', () => {
  assert.match(css, /\.builder-wrap,[\s\S]*?\.formular-workspace\s*\{[\s\S]*?--font-body:var\(--font-sans\)[\s\S]*?font-family:var\(--font-sans\)/);
  assert.match(css, /\.form-species-picker select\s*\{[\s\S]*?var\(--font-sans\)/);
  assert.match(css, /\.form-species-identity em\s*\{[\s\S]*?var\(--font-display\)/);
});

test('responsive editorial layout covers tablet and narrow mobile', () => {
  assert.match(css, /@media\(max-width:\s*1024px\)[\s\S]*?form-flow-grid--5/);
  assert.match(css, /@media\(max-width:\s*560px\)[\s\S]*?form-flow-grid--5/);
});
