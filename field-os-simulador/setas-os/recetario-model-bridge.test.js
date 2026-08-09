'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const bridge = fs.readFileSync(path.join(ROOT,'recetario-model-bridge.js'),'utf8');
const remote = fs.readFileSync(path.join(ROOT,'recetario-firestore-snapshot.js'),'utf8');
const monitor = fs.readFileSync(path.join(ROOT,'firebase/error-monitor.js'),'utf8');

test('runtime loads local and Firestore Recetario snapshot bridges',()=>{
  assert.match(monitor,/recetario-model-bridge\.js/);
  assert.match(monitor,/recetario-firestore-snapshot\.js/);
});

test('new saved recipes persist a versioned immutable model snapshot',()=>{
  assert.match(bridge,/modelVersion:\s*MODEL_VERSION/);
  assert.match(bridge,/dimensions:\s*model\.dimensions/);
  assert.match(bridge,/uncertainty:\s*model\.uncertainty/);
  assert.match(bridge,/provenance:\s*model\.provenance/);
  assert.match(bridge,/stockContext:/);
  assert.match(bridge,/historyCalibration:/);
  assert.match(bridge,/modelSnapshot:/);
});

test('legacy recipes remain visible without inventing model confidence',()=>{
  assert.match(bridge,/receta legacy/);
  assert.match(bridge,/vuelve a guardar para crear snapshot trazable/);
});

test('Recetario renders viability EB confidence real error and comparable count',()=>{
  assert.match(bridge,/Viabilidad/);
  assert.match(bridge,/eb\.low/);
  assert.match(bridge,/Confianza/);
  assert.match(bridge,/Comparables/);
  assert.match(bridge,/EB real/);
  assert.match(bridge,/error .*pp/);
});

test('Firestore saveReceta receives matching snapshot only for the same recipe signature',()=>{
  assert.match(remote,/SetasDB/);
  assert.match(remote,/saveReceta/);
  assert.match(remote,/sig\(recipe\) === snap\.recipeSignature/);
  assert.match(remote,/modelSnapshot/);
});
