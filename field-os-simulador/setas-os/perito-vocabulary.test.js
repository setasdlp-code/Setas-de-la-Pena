'use strict';
// Vocabulario visible del Perito. CONTEXT.md: "Perito" es una sola función para
// el usuario; "optimizer" y "scenario generator" nombran la implementación, no
// el concepto, y no se usan en textos visibles. Cada receta alternativa
// propuesta es un "Escenario". Antes la Mesa del Perito mostraba "Setas OS ·
// Intelligence & Optimization Suite", "Workbench Perito", "Optimizador
// Generativo", "Comparador & Morphing", "Score Morfeado", "α ∈ [a, b]" y un
// botón "Morph".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
// Solo texto visible: sin comentarios de línea ni de bloque JSX.
const visible = jsx
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');

test('la Mesa del Perito no usa jerga de implementación en inglés ni "optimizador"', () => {
  for (const term of [
    'Intelligence & Optimization Suite', 'Workbench Perito', 'Optimizador Generativo',
    'Comparador & Morphing', 'Morphing', 'Morfead', '> Morph', 'Hibridar', 'Interpolación Convexa',
    'interpolación convexa', 'del optimizador', 'para el optimizador', 'optimizador híbrido',
    'Perito Diagnóstico Vivo', 'α ∈',
  ]) {
    assert.ok(!visible.includes(term), `texto visible con "${term}"`);
  }
});

test('usa los nombres del dominio: Mesa del Perito, Diagnóstico, Escenarios, Comparar recetas', () => {
  for (const label of [
    '>Setas OS · Perito<', '>Mesa del Perito</h1>', '/> Diagnóstico', '/> Escenarios', '/> Comparar recetas',
    'Comparar y mezclar recetas', 'Mezcla gradual entre dos recetas', '>Score de la mezcla<',
    'Excluir de las sugerencias del Perito',
  ]) {
    assert.ok(visible.includes(label), `falta "${label}"`);
  }
});

test('los identificadores internos no cambian (estado, clases y pruebas existentes)', () => {
  assert.match(jsx, /workbenchMode==='optimizador'/);
  assert.match(jsx, /perito-morph-panel/);
  assert.match(jsx, /perito-standalone-panel/);
});
