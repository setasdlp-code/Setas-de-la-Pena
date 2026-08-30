'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const Optimizer = require('./recipe-optimizer.js');
const scoring = require('./scoring.js');

const sampleRecipe = [
  { id: 'paja_trigo', p: 80 },
  { id: 'salvado_trigo', p: 17 },
  { id: 'yeso_agricola', p: 3 }
];

test('analyzeCoFormulation computes weighted C:N, N% targets and joint EB predictions', () => {
  const spp = {
    p_ostreatus_gris: {
      name: 'Orellana Gris',
      cn_optimal: { min: 25, ideal: 30, max: 38 },
      n_optimal: { min: 1.1, ideal: 1.4, max: 1.8 },
      eb_baseline: 60,
      eb_optimal: 95,
      supplementation_max: 20
    },
    p_djamor_rosada: {
      name: 'Orellana Rosada',
      cn_optimal: { min: 28, ideal: 34, max: 42 },
      n_optimal: { min: 0.9, ideal: 1.15, max: 1.5 },
      eb_baseline: 55,
      eb_optimal: 85,
      supplementation_max: 15
    }
  };

  const ings = [
    { id: 'paja_trigo', name: 'Paja de trigo', c: 45, n: 0.6, cn: 75, ph: 7.0, dig: 6, cra: 3, role: 'base_carbono', cs: ['p_ostreatus_gris', 'p_djamor_rosada'], moisture: 10, cost: 1100 },
    { id: 'salvado_trigo', name: 'Salvado de trigo', c: 42, n: 2.5, cn: 16.8, ph: 6.8, dig: 7, cra: 2, role: 'suplemento_n', cs: ['p_ostreatus_gris', 'p_djamor_rosada'], moisture: 12, cost: 1800 },
    { id: 'yeso_agricola', name: 'Yeso agrícola', c: 0, n: 0, cn: 0, ph: 7.2, dig: 5, cra: 1, role: 'aditivo_ph', cs: ['p_ostreatus_gris', 'p_djamor_rosada'], moisture: 0, cost: 800 }
  ];

  const coConfig = [
    { key: 'p_ostreatus_gris', weight: 60 },
    { key: 'p_djamor_rosada', weight: 40 }
  ];

  const result = Optimizer.analyzeCoFormulation(sampleRecipe, coConfig, ings, spp);

  assert.ok(result, 'El resultado de analyzeCoFormulation no debe ser nulo');
  assert.equal(result.speciesResults.length, 2, 'Debe retornar los 2 resultados individuales por especie');

  // Weighted C:N ideal: (30 * 0.6) + (34 * 0.4) = 18 + 13.6 = 31.6
  assert.equal(result.weightedTargets.cn.ideal, 31.6, 'C:N ideal ponderado debe ser 31.6');
  assert.ok(result.jointEB > 0, 'EB conjunta debe ser positiva');
  assert.equal(result.allIncompatibilities.length, 0, 'No debe haber incompatibilidades en este fixture');
});

test('analyzeCoFormulation flags cross-species incompatibility if an ingredient is restricted for one species', () => {
  const spp = {
    p_ostreatus_gris: { name: 'Orellana Gris', cn_optimal: { min: 25, ideal: 30, max: 38 }, n_optimal: { min: 1.1, ideal: 1.4, max: 1.8 } },
    h_erinaceus: { name: 'Melena de León', cn_optimal: { min: 35, ideal: 42, max: 50 }, n_optimal: { min: 0.7, ideal: 0.9, max: 1.3 } }
  };

  const ings = [
    { id: 'paja_trigo', name: 'Paja de trigo', c: 45, n: 0.6, cn: 75, ph: 7.0, dig: 6, cra: 3, role: 'base_carbono', cs: ['p_ostreatus_gris'], moisture: 10, cost: 1100 },
    { id: 'salvado_trigo', name: 'Salvado de trigo', c: 42, n: 2.5, cn: 16.8, ph: 6.8, dig: 7, cra: 2, role: 'suplemento_n', cs: ['p_ostreatus_gris', 'h_erinaceus'], moisture: 12, cost: 1800 }
  ];

  const coConfig = { p_ostreatus_gris: 50, h_erinaceus: 50 };
  const recipe = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];

  const result = Optimizer.analyzeCoFormulation(recipe, coConfig, ings, spp);

  assert.ok(result.allIncompatibilities.length > 0, 'Debe detectar que Paja de trigo es incompatible con Melena de León');
  assert.ok(result.allIncompatibilities[0].includes('Melena de León'));
});
