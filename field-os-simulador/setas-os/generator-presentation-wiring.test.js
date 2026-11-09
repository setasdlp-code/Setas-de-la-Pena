'use strict';
// Cableado de generator-presentation.js en el Formulador. Mismo patrón que
// hybrid-migration-source.test.js: se verifica el fuente del .jsx y el bundle.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
const bundle = fs.readFileSync(path.join(__dirname, 'simulador-app.js'), 'utf8');

test('el generador usa generator-presentation.js', () => {
  assert.match(jsx, /require\('\.\/generator-presentation\.js'\)/);
  assert.match(jsx, /collapseNearDuplicates\(/);
  assert.match(jsx, /partitionRows\(/);
  assert.match(jsx, /generatorHeadline\(/);
  assert.match(jsx, /explainEmptySearch\(/);
});

test('las filas y el diagnóstico llevan los campos que necesita la presentación', () => {
  assert.match(jsx, /structuralGenerated:/);
  assert.match(jsx, /safetyStatus:/);
  assert.match(jsx, /unpricedIds:/);
});

test('los Escenarios «No ejecutar» van en un grupo aparte y se avisa del costo sin precio', () => {
  assert.match(jsx, /data-testid="generator-blocked-group"/);
  assert.match(jsx, /data-testid="generator-unpriced-warning"/);
  assert.match(jsx, /data-testid="generator-empty-reason"/);
});

test('el bundle consume el módulo por su global o por require', () => {
  assert.match(bundle, /SetasGeneratorPresentation/);
});

// El bundle no empaqueta los require(): el shell real (auth-gate.js) y el arnés
// cargan cada módulo con su propio <script>, antes de simulador-app.js. Sin
// esto SetasGeneratorPresentationApi queda null y el generador revienta.
test('el shell y el arnés cargan generator-presentation.js antes del bundle', () => {
  const gate = fs.readFileSync(path.join(__dirname, 'firebase', 'auth-gate.js'), 'utf8');
  assert.match(gate, /"\.\.\/generator-presentation\.js"/);
  const harness = fs.readFileSync(path.join(__dirname, '__harness.html'), 'utf8');
  const mod = harness.indexOf('<script src="generator-presentation.js"></script>');
  assert.ok(mod > 0, '__harness.html debe cargar generator-presentation.js');
  assert.ok(mod < harness.indexOf('<script src="simulador-app.js">'), 'debe cargarse antes de simulador-app.js');
});

test('Bodega no muestra $0/kg para insumos sin precio', () => {
  assert.match(jsx, /r\.pp>0\?`\$\$\{Math\.round\(r\.pp\)\.toLocaleString\('es-CO'\)\}\/kg`:r\.pp===0\?'Sin precio':'—'/);
});
