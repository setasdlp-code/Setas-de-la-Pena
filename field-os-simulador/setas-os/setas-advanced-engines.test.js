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
const flushForecast = require('./flush-forecast-engine.js');

test('Motores avanzados exportan sus APIs canónicas completas', () => {
  // 1. Cinética de Esterilización
  assert.equal(typeof sterilization.calcSteamSatTemp, 'function');
  assert.equal(typeof sterilization.calcRequiredGaugePressurePsi, 'function');
  assert.equal(typeof sterilization.validateAutoclaveCycle, 'function');
  assert.equal(typeof sterilization.simulateCorePenetration, 'function');
  assert.equal(typeof sterilization.calcTimeCompFactorAt15Psi, 'function');
  assert.equal(typeof sterilization.calcOptimalHoldTime, 'function');

  // 2. Co-Cultivo e Intersección Climática
  assert.equal(typeof coCultivation.calcPairwiseCompatibility, 'function');
  assert.equal(typeof coCultivation.optimizeChamberSetpoints, 'function');
  assert.equal(typeof coCultivation.generateFullMatrix, 'function');
  assert.equal(typeof coCultivation.resolveSpeciesKey, 'function');
  assert.ok(Object.keys(coCultivation.SPECIES_CLIMATE_PROFILES).length >= 9);
  assert.ok(Object.keys(coCultivation.SPECIES_KEY_ALIASES).length >= 9);

  // 3. Poscosecha y Cadena de Frío
  assert.equal(typeof postHarvest.predictShelfLife, 'function');
  assert.equal(typeof postHarvest.calcPostHarvestRespiration, 'function');
  assert.equal(typeof postHarvest.calcTranspirationLoss, 'function');
  assert.equal(typeof postHarvest.simulateColdChainBreak, 'function');
  assert.equal(typeof postHarvest.assessCondensationRiskOnUnpack, 'function');
  assert.equal(typeof postHarvest.resolveSpeciesKey, 'function');
  assert.ok(Object.keys(postHarvest.SPECIES_POSTHARVEST_PROFILES).length >= 8);

  // 4. Clima y Ventilación FAE
  assert.equal(typeof climateMath.calcBarometricCO2Correction, 'function');
  assert.equal(typeof climateMath.calcDynamicFAE, 'function');
  assert.equal(typeof climateMath.calcAbsoluteHumidity, 'function');
  assert.equal(typeof climateMath.calcWetBulbTemp, 'function');
  assert.equal(typeof climateMath.calcAirEnthalpy, 'function');
  assert.equal(typeof climateMath.calcHumidificationDemand, 'function');
  assert.equal(typeof climateMath.resolveSpeciesKey, 'function');
  assert.ok(Object.keys(climateMath.SPECIES_KEY_ALIASES).length >= 9);

  // 5. Pronóstico de Cosechas y Oleadas
  assert.equal(typeof flushForecast.calculateLotYieldAndFlushes, 'function');
  assert.equal(typeof flushForecast.calculateRemainingFlushes, 'function');
  assert.equal(typeof flushForecast.calculateSowingRequirement, 'function');
  assert.equal(typeof flushForecast.matchWeeklyCoverage, 'function');
  assert.equal(typeof flushForecast.calibrateFlushProfileFromHarvests, 'function');
  assert.equal(typeof flushForecast.predictSubstrateCostPerFreshKg, 'function');
  assert.equal(typeof flushForecast.calcThermalDelayFactor, 'function');
  assert.equal(typeof flushForecast.getISOWeekKey, 'function');
  assert.equal(typeof flushForecast.parseDateSafe, 'function');
  assert.ok(Object.keys(flushForecast.SPECIES_FLUSH_PROFILES).length >= 9);
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
  assert.match(jsx, /calculateRemainingFlushes/);
  assert.match(jsx, /assessCondensationRiskOnUnpack/);
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

test('Dynamic Harvest Projection se integra en Batch Sheet canónico y BatchDetailV2', () => {
  const batchSheetModule = require('./batch-sheet.js');
  const mockLote = {
    id: 'lote-test-01',
    codigo: 'L-TEST-01',
    especie: 'Orellana Gris',
    speciesKey: 'p_ostreatus_gris',
    numBolsas: 10,
    pesoHumedo: 2.0,
    humedad: 65,
    eb: 90,
    fechaInoculacion: '2026-08-01',
    estado: 'fructificacion',
  };

  const sheet = batchSheetModule.buildBatchSheet({
    lote: mockLote,
    bolsas: [{ id: 'b-1', loteId: 'lote-test-01', codigo: 'L-TEST-01-B01', estado: 'sana' }],
    cosechas: [{ id: 'c-1', loteId: 'lote-test-01', flush: 1, fecha: '2026-09-02', pesoFresco: 3500 }],
  });

  assert.ok(sheet.flushForecast, 'La ficha canónica debe calcular y exponer sheet.flushForecast');
  assert.equal(sheet.flushForecast.currentFlush, 1);
  assert.ok(Array.isArray(sheet.flushForecast.flushes));
  assert.ok(sheet.flushForecast.flushes.length >= 3);
  assert.ok(sheet.flushForecast.flushes[0].isHarvested, 'Flush 1 debe marcarse como cosechado');
  assert.ok(!sheet.flushForecast.flushes[1].isHarvested, 'Flush 2 debe estar pendiente');
  assert.ok(sheet.flushForecast.remainingFlushes.length >= 1);
  assert.ok(sheet.flushForecast.remainingExpectedKg > 0);

  // Verificación en fuentes JSX y bundle JS
  assert.match(jsx, /data-testid="batch-harvest-forecast"/);
  assert.match(jsx, /Pronóstico Dinámico de Cosechas & Oleadas/);
  assert.match(jsx, /BatchSheetModal/);
  assert.match(js, /"data-testid":\s*"batch-harvest-forecast"/);
  assert.match(js, /Pronóstico Dinámico de Cosechas & Oleadas/);
});

test('Post-Harvest Shelf-Life & Condensation Warning se integran en Harvest Modal', () => {
  // Verificación funcional del motor
  const shelf = postHarvest.predictShelfLife('orellana_gris', 4.0, 90.0);
  assert.ok(shelf.marketableDays > 5);
  assert.ok(shelf.limitingFactor);

  const riskHigh = postHarvest.assessCondensationRiskOnUnpack(4.0, 18.0, 75.0);
  assert.equal(riskHigh.condensationRisk, true);
  assert.match(riskHigh.verdict, /ALTO RIESGO DE CONDENSACIÓN/);

  const riskSafe = postHarvest.assessCondensationRiskOnUnpack(15.0, 18.0, 50.0);
  assert.equal(riskSafe.condensationRisk, false);

  // Verificación en fuentes JSX y bundle JS
  assert.match(jsx, /data-testid="harvest-postharvest-advisor"/);
  assert.match(jsx, /Poscosecha & Cadena de Frío/);
  assert.match(jsx, /enginePredictShelfLife|predictShelfLife/);
  assert.match(jsx, /engineAssessCondensationRiskOnUnpack|assessCondensationRiskOnUnpack/);
  assert.match(js, /"data-testid":\s*"harvest-postharvest-advisor"/);
});

test('Co-Cultivation Advisor se integra en Fruiting Room Cockpit y Asignación de Sala', () => {
  // Verificación funcional del optimizador
  const opt = coCultivation.optimizeChamberSetpoints(['orellana_gris', 'melena_leon']);
  assert.ok(opt.groupScore > 0 && opt.groupScore <= 100);
  assert.ok(opt.setpoints.tempC > 0);
  assert.ok(opt.setpoints.rhPct > 0);
  assert.ok(opt.setpoints.co2Ppm > 0);

  // Verificación en Fruiting Room Cockpit
  assert.match(jsx, /data-testid="fruiting-cocultivation-advisor"/);
  assert.match(jsx, /Asesor de Co-Cultivo Multiespecie/);
  assert.match(jsx, /Setpoints Pareto Minimax Recomendados/);
  assert.match(jsx, /Cuellos de Botella Biológicos/);
  assert.match(js, /"data-testid":\s*"fruiting-cocultivation-advisor"/);

  // Verificación en Asignación de Sala
  assert.match(jsx, /data-testid="room-assignment-cocultivation-advisor"/);
  assert.match(jsx, /Asesor de Co-Cultivo al Asignar/);
  assert.match(js, /"data-testid":\s*"room-assignment-cocultivation-advisor"/);
  assert.match(js, /Asesor de Co-Cultivo al Asignar/);
});

test('simulador-app.js bundle generado está actualizado y compila sin errores', () => {
  assert.ok(js.length > 500000);
  assert.match(js, /SetasSterilization/);
  assert.match(js, /SetasCoCultivation/);
  assert.match(js, /SetasPostHarvest/);
  assert.match(js, /showAutoclaveModal/);
});
