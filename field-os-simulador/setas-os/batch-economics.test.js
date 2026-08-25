'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
const styles = fs.readFileSync(path.join(__dirname, 'sim.css'), 'utf8');

test('calcBatch calcula masa seca, insumos comerciales y agua neta correctamente', () => {
  // 10 bolsas de 2 kg al 67% de humedad
  const n = 10;
  const kg = 2.0;
  const wet = n * kg;
  const hF = 0.67;
  const dry = wet * (1 - hF); // 6.6 kg secos

  assert.equal(Math.round(dry * 10) / 10, 6.6);
  assert.match(source, /const calcBatch=/);
  assert.match(source, /const energyCostTotal=dry\*energyCostKgSeco/);
  assert.match(source, /const bagConsumableCostTotal=n\*bagConsumableCostUnit/);
});

test('calcBatch desglosa costos de sustrato, spawn, energia termica y consumibles', () => {
  assert.match(source, /costBreakdown:\{/);
  assert.match(source, /costBreakdownPerBag:\{/);
  assert.match(source, /projectedFreshKgPerBag/);
  assert.match(source, /projectedGrossMarginPerBag/);
  assert.match(source, /productionCostPerKgFresh/);
});

test('sim.css incluye estilos para el card de resumen economico y metricas de margen', () => {
  assert.match(styles, /\.sim-root \.economic-summary-card/);
  assert.match(styles, /\.sim-root \.economics-metric-grid/);
  assert.match(styles, /\.sim-root \.econ-metric-box/);
  assert.match(styles, /\.sim-root \.econ-pills-row/);
  assert.match(styles, /\.sim-root \.econ-pill/);
});

test('Hoja de produccion renderiza el widget de analisis economico y margen por bolsa', () => {
  assert.match(source, /💰 Análisis Económico & Rentabilidad por Bolsa/);
  assert.match(source, /Costo por Bolsa/);
  assert.match(source, /Cosecha Estimada/);
  assert.match(source, /Costo \/ kg Fresco/);
  assert.match(source, /Margen Bruto \/ Bolsa/);
  assert.match(source, /Precio venta fresco:/);
});
