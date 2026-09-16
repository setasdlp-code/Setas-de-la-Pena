'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  SPECIES_CLIMATE_PROFILES,
  calcPairwiseCompatibility,
  generateFullMatrix,
  optimizeChamberSetpoints,
} = require('./co-cultivation-matrix.js');

test('SPECIES_CLIMATE_PROFILES define los 9 perfiles climáticos 4D de Setas OS', () => {
  const keys = Object.keys(SPECIES_CLIMATE_PROFILES);
  assert.equal(keys.length, 9);
  assert.ok(keys.includes('orellana_gris'));
  assert.ok(keys.includes('shiitake'));
  assert.ok(keys.includes('melena_leon'));
  assert.ok(keys.includes('enoki'));
  assert.ok(keys.includes('reishi'));

  keys.forEach((k) => {
    const sp = SPECIES_CLIMATE_PROFILES[k];
    assert.equal(sp.tempC.length, 4);
    assert.equal(sp.rhPct.length, 4);
    assert.equal(sp.co2Ppm.length, 4);
    assert.equal(sp.lux.length, 4);
  });
});

test('calcPairwiseCompatibility calcula compatibilidad monocultivo (100%) y pares compatibles', () => {
  // Monocultivo
  const mono = calcPairwiseCompatibility('orellana_gris', 'orellana_gris');
  assert.equal(mono.score, 100);

  // Orellana Gris y Orellana Blanca son altamente compatibles
  const orellanas = calcPairwiseCompatibility('orellana_gris', 'orellana_blanca');
  assert.ok(orellanas.score >= 70, `Score esperado >= 70, obtenido ${orellanas.score}`);
  assert.equal(orellanas.verdict, 'ALTA COMPATIBILIDAD');

  // Shiitake y Melena de León comparten clima templado húmedo
  const shiitakeMelena = calcPairwiseCompatibility('shiitake', 'melena_leon');
  assert.ok(shiitakeMelena.score >= 60, `Score esperado >= 60, obtenido ${shiitakeMelena.score}`);
});

test('calcPairwiseCompatibility detecta incompatibilidades térmicas y cuellos de botella de Liebig', () => {
  // Orellana Rosa (23-28°C) vs Enoki (11-15°C)
  const rosaEnoki = calcPairwiseCompatibility('orellana_rosa', 'enoki');
  assert.ok(rosaEnoki.score <= 40, `Score esperado <= 40, obtenido ${rosaEnoki.score}`);
  assert.equal(rosaEnoki.verdict, 'INCOMPATIBLE');
  assert.equal(rosaEnoki.bottleneckAxis, 'temperatura');

  // Orellana Gris (necesita CO2 < 800 ppm) vs Reishi (requiere CO2 > 2000 ppm)
  const grisReishi = calcPairwiseCompatibility('orellana_gris', 'reishi');
  assert.ok(grisReishi.score < 50);
  assert.ok(grisReishi.penalties.some(p => p.includes('ventilación') || p.includes('CO2')));
});

test('optimizeChamberSetpoints calcula setpoints Pareto minimax para grupos de especies', () => {
  // Policultivo compatible: Orellana Gris + Seta de Cardo
  const opt = optimizeChamberSetpoints(['orellana_gris', 'seta_cardo']);
  assert.ok(opt.groupScore >= 65);
  assert.ok(opt.setpoints.tempC >= 15 && opt.setpoints.tempC <= 20, `Temp setpoint: ${opt.setpoints.tempC}`);
  assert.ok(opt.setpoints.rhPct >= 85 && opt.setpoints.rhPct <= 92, `RH setpoint: ${opt.setpoints.rhPct}`);
  assert.ok(opt.setpoints.co2Ppm >= 600 && opt.setpoints.co2Ppm <= 1000, `CO2 setpoint: ${opt.setpoints.co2Ppm}`);

  // Policultivo conflictivo: Orellana Rosa + Enoki
  const conflict = optimizeChamberSetpoints(['orellana_rosa', 'enoki']);
  assert.ok(conflict.groupScore < 50);
  assert.equal(conflict.badge, '🔴');
  assert.ok(conflict.bottlenecks.length > 0);
});

test('generateFullMatrix genera matriz 9x9 coherente y simétrica en score', () => {
  const matrix = generateFullMatrix();
  const keys = Object.keys(SPECIES_CLIMATE_PROFILES);

  keys.forEach((kA) => {
    keys.forEach((kB) => {
      const cellAB = matrix[kA][kB];
      const cellBA = matrix[kB][kA];
      assert.equal(cellAB.score, cellBA.score, `Matriz no simétrica entre ${kA} y ${kB}`);
    });
  });
});

test('co-cultivation-matrix resuelve alias taxonómicos canónicos y calcula VPD de cámara', () => {
  const { resolveSpeciesKey, calcPairwiseCompatibility, optimizeChamberSetpoints } = require('./co-cultivation-matrix.js');

  // Alias canónicos de Setas OS
  assert.equal(resolveSpeciesKey('p_ostreatus_gris'), 'orellana_gris');
  assert.equal(resolveSpeciesKey('lions_mane'), 'melena_leon');
  assert.equal(resolveSpeciesKey('p_eryngii'), 'seta_cardo');

  // Compatibilidad usando claves canónicas del formulador
  const pair = calcPairwiseCompatibility('p_ostreatus_gris', 'lions_mane');
  assert.ok(pair.score > 0, 'Debe resolver compatibilidad con claves canónicas');
  assert.equal(pair.speciesA, 'Orellana Gris (P. ostreatus)');
  assert.equal(pair.speciesB, 'Melena de León (Hericium erinaceus)');

  // Optimización de setpoints con cálculo de VPD de cámara
  const opt = optimizeChamberSetpoints(['p_ostreatus_gris', 'p_eryngii'], {
    weights: { p_ostreatus_gris: 1.2, p_eryngii: 0.8 }
  });
  assert.ok(opt.setpoints.vpdKpa != null, 'Debe calcular VPD de cámara');
  assert.ok(opt.setpoints.vpdKpa >= 0.10 && opt.setpoints.vpdKpa <= 0.45, `VPD seguro esperado, obtenido ${opt.setpoints.vpdKpa} kPa`);

  // Verificación de ponderación de biomasa sin truncamiento artificial de satisfacción
  const optWeights = optimizeChamberSetpoints(['orellana_rosa', 'enoki'], {
    weights: { orellana_rosa: 1.5, enoki: 0.5 }
  });
  // En humedad relativa, ambas especies son compatibles en 85-90% RH (satisfacción 100%, no truncada a 50%)
  assert.ok(optWeights.satisfaction.humedad >= 90, `Humedad esperada >= 90%, obtenida ${optWeights.satisfaction.humedad}%`);
});
