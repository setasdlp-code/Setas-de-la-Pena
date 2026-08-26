'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const jsx = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'sim.css'), 'utf8');

const { consumirInventarioFIFO } = require('./inventario.js');

test('simulador-app.jsx includes unified production launch buttons and modal workflow', () => {
  assert.match(jsx, /openProdLauncher/);
  assert.match(jsx, /ejecutarLanzamientoProduccion/);
  assert.match(jsx, /data-testid="prod-launch-modal"/);
  assert.match(jsx, /🚀 Lanzar Producción/);
  assert.match(jsx, /showProdLaunchModal/);
});

test('sim.css defines styles for launch buttons, summary stats and breakdown table', () => {
  assert.match(css, /\.btn-launch-prod/);
  assert.match(css, /\.prod-launch-modal/);
  assert.match(css, /\.prod-launch-summary/);
  assert.match(css, /\.prod-launch-table/);
});

test('consumirInventarioFIFO deducts batch ingredients accurately across stock lots', () => {
  const lotesIniciales = [
    { id: 'L1', ingredienteId: 'salvado_trigo', cantidadKgDisponible: 10.0, activo: true, fechaIngreso: '2026-08-01' },
    { id: 'L2', ingredienteId: 'salvado_trigo', cantidadKgDisponible: 15.0, activo: true, fechaIngreso: '2026-08-10' },
    { id: 'L3', ingredienteId: 'yeso_agricola', cantidadKgDisponible: 5.0, activo: true, fechaIngreso: '2026-08-05' },
    { id: 'L4', ingredienteId: 'spawn_grano', cantidadKgDisponible: 8.0, activo: true, fechaIngreso: '2026-08-15' }
  ];

  // Batch requires: 12 kg salvado (10 from L1, 2 from L2), 1 kg yeso, 1.2 kg spawn
  const insumosRequeridos = [
    { id: 'salvado_trigo', krKg: 12.0 },
    { id: 'yeso_agricola', krKg: 1.0 },
    { id: 'spawn_grano', krKg: 1.2 }
  ];

  const actualizados = consumirInventarioFIFO(lotesIniciales, insumosRequeridos);

  const l1 = actualizados.find(l => l.id === 'L1');
  const l2 = actualizados.find(l => l.id === 'L2');
  const l3 = actualizados.find(l => l.id === 'L3');
  const l4 = actualizados.find(l => l.id === 'L4');

  assert.equal(l1.cantidadKgDisponible, 0);
  assert.equal(l2.cantidadKgDisponible, 13.0);
  assert.equal(l3.cantidadKgDisponible, 4.0);
  assert.equal(l4.cantidadKgDisponible, 6.8);
});

