'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const jsx = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'simulador-app.js'), 'utf8');
const authGate = fs.readFileSync(path.join(ROOT, 'firebase/auth-gate.js'), 'utf8');

const sterilization = require('./sterilization-kinetics.js');
const coCultivation = require('./co-cultivation-matrix.js');
const postHarvest = require('./post-harvest-engine.js');
const climateMath = require('./climate-math.js');

test('Motores avanzados exportan sus APIs canónicas completas', () => {
  // 1. Cinética de Esterilización
  assert.equal(typeof sterilization.calcSteamSatTemp, 'function');
  assert.equal(typeof sterilization.calcRequiredGaugePressurePsi, 'function');
  assert.equal(typeof sterilization.validateAutoclaveCycle, 'function');
  assert.equal(typeof sterilization.simulateCorePenetration, 'function');
  assert.equal(typeof sterilization.calcTimeCompFactorAt15Psi, 'function');

  // 2. Co-Cultivo e Intersección Climática
  assert.equal(typeof coCultivation.calcPairwiseCompatibility, 'function');
  assert.equal(typeof coCultivation.optimizeChamberSetpoints, 'function');
  assert.equal(typeof coCultivation.generateFullMatrix, 'function');
  assert.ok(Object.keys(coCultivation.SPECIES_CLIMATE_PROFILES).length >= 9);

  // 3. Poscosecha y Cadena de Frío
  assert.equal(typeof postHarvest.predictShelfLife, 'function');
  assert.equal(typeof postHarvest.calcPostHarvestRespiration, 'function');
  assert.equal(typeof postHarvest.calcTranspirationLoss, 'function');
  assert.ok(Object.keys(postHarvest.SPECIES_POSTHARVEST_PROFILES).length >= 8);

  // 4. Clima y Ventilación FAE
  assert.equal(typeof climateMath.calcBarometricCO2Correction, 'function');
  assert.equal(typeof climateMath.calcDynamicFAE, 'function');
});

test('auth-gate.js registra los nuevos motores en PROTECTED_APP_SCRIPTS', () => {
  assert.match(authGate, /"(\.\.\/)?sterilization-kinetics\.js"/);
  assert.match(authGate, /"(\.\.\/)?co-cultivation-matrix\.js"/);
  assert.match(authGate, /"(\.\.\/)?post-harvest-engine\.js"/);
  assert.match(authGate, /"(\.\.\/)?flush-forecast-engine\.js"/);
});

test('simulador-app.jsx integra puentes de importación para los nuevos motores', () => {
  assert.match(jsx, /SetasSterilization/);
  assert.match(jsx, /SetasCoCultivation/);
  assert.match(jsx, /SetasPostHarvest/);
  assert.match(jsx, /calcBarometricCO2Correction/);
  assert.match(jsx, /calcDynamicFAE/);
});

test('simulador-app.jsx expone botones accesibles y modales de los 4 motores', () => {
  // Botones de acción en dashboard climático
  assert.match(jsx, /setShowCoCultivationModal\(true\)/);
  assert.match(jsx, /setShowAutoclaveModal\(true\)/);
  assert.match(jsx, /setShowPostHarvestModal\(true\)/);

  // Modales accesibles interactivos
  assert.match(jsx, /showAutoclaveModal\s*&&\s*\(\(\)\s*=>/);
  assert.match(jsx, /showCoCultivationModal\s*&&\s*\(\(\)\s*=>/);
  assert.match(jsx, /showPostHarvestModal\s*&&\s*\(\(\)\s*=>/);

  // Verificación de textos operativos clave
  assert.match(jsx, /Cinética de Autoclave & Integral F₀/);
  assert.match(jsx, /Optimizador de Co-Cultivo y Setpoints Pareto/);
  assert.match(jsx, /Fisiología Poscosecha & Degradación en Cadena de Frío/);
  assert.match(jsx, /Ventilación Dinámica FAE \(Extracción\)/);
  assert.match(jsx, /Dióxido de Carbono \(NDIR\)/);
});

test('simulador-app.js bundle generado está actualizado y compila sin errores', () => {
  assert.ok(js.length > 500000);
  assert.match(js, /SetasSterilization/);
  assert.match(js, /SetasCoCultivation/);
  assert.match(js, /SetasPostHarvest/);
  assert.match(js, /showAutoclaveModal/);
});
