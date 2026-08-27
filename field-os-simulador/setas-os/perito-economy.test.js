'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Economy = require('./perito-economy.js');

const ROOT = __dirname;
const economySource = fs.readFileSync(path.join(ROOT, 'perito-economy.js'), 'utf8');
const bridge = fs.readFileSync(path.join(ROOT, 'perito-economy-bridge.js'), 'utf8');
const monitor = fs.readFileSync(path.join(ROOT, 'firebase/error-monitor.js'), 'utf8');
const recetario = fs.readFileSync(path.join(ROOT, 'recetario-model-bridge.js'), 'utf8');

test('precio de Bodega usa promedio ponderado de lotes activos', () => {
  const prices = Economy.priceMapFromLots([
    { activo:true, ingredienteId:'a', cantidadKgDisponible:2, precioPorKgCOP:1000 },
    { activo:true, ingredienteId:'a', cantidadKgDisponible:6, precioPorKgCOP:2000 },
    { activo:false, ingredienteId:'a', cantidadKgDisponible:20, precioPorKgCOP:1 },
  ]);
  assert.equal(prices.a, 1750);
});

test('costo de receta usa precios reales y declara cobertura de precios', () => {
  const x = Economy.recipeCostPerKgAsFormulated(
    [{id:'a',p:60},{id:'b',p:40}],
    {a:1000,b:3000}
  );
  assert.equal(x.copPerKg, 1800);
  assert.equal(x.priceCoveragePct, 100);
  assert.equal(x.complete, true);
});

test('costo de lote convierte materia seca a masa comprada según humedad', () => {
  const x = Economy.calculateLotEconomics({
    recipe:[{id:'seco',p:50},{id:'humedo',p:50}],
    batchWetKg:10,
    targetMoisturePct:60,
    moistureById:{seco:0,humedo:50},
    priceById:{seco:1000,humedo:1000},
    ebLow:80,
    ebHigh:120,
  });
  // 10 kg finales al 60% H2O => 4 kg secos. 2 kg secos + 4 kg húmedos comprados.
  assert.equal(x.batchDryKg, 4);
  assert.equal(Math.round(x.substrateCostCOP), 6000);
  assert.equal(x.expectedFreshKg.low, 3.2);
  assert.equal(x.expectedFreshKg.high, 4.8);
  assert.equal(Math.round(x.costPerFreshKgCOP.low), 1250);
  assert.equal(Math.round(x.costPerFreshKgCOP.high), 1875);
});

test('la UI carga economía y separa costos excluidos', () => {
  assert.match(monitor, /perito-economy-bridge\.js/);
  assert.match(bridge, /sdp_lotes/);
  assert.match(economySource, /precioPorKgCOP/);
  assert.match(bridge, /Costo de sustrato \/ kg hongo/);
  assert.match(bridge, /Excluye spawn, energía, mano de obra, empaque y depreciación/);
  assert.match(bridge, /ctx\.realCost = recipeCost\.copPerKg/);
  assert.match(bridge, /SetasScoring\.scoreRecipe\(detail\.an, ctx\)/);
});

test('Recetario conserva economía en el snapshot versionado', () => {
  assert.match(recetario, /perito-model-v2\.2/);
  assert.match(recetario, /setas-perito-economy/);
  assert.match(recetario, /economics:/);
  assert.match(recetario, /sustrato\/kg hongo/);
  assert.match(recetario, /Comparables/);
});
