'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  SPECIES_POSTHARVEST_PROFILES,
  calcPostHarvestRespiration,
  calcTranspirationLoss,
  predictShelfLife,
} = require('./post-harvest-engine.js');

test('SPECIES_POSTHARVEST_PROFILES define parámetros fisiológicos para las especies clave', () => {
  const keys = Object.keys(SPECIES_POSTHARVEST_PROFILES);
  assert.ok(keys.length >= 8);
  assert.ok(keys.includes('orellana_gris'));
  assert.ok(keys.includes('orellana_rosa'));
  assert.ok(keys.includes('seta_cardo'));
  assert.ok(keys.includes('shiitake'));
  assert.ok(keys.includes('melena_leon'));

  keys.forEach((k) => {
    const sp = SPECIES_POSTHARVEST_PROFILES[k];
    assert.ok(sp.r4Co2 > 0);
    assert.ok(sp.q10 >= 1.5 && sp.q10 <= 3.5);
    assert.ok(sp.kTransp > 0);
    assert.ok(sp.baseShelfLifeDays4C > 0);
    assert.ok(sp.targetOtr > 10000);
  });
});

test('calcPostHarvestRespiration modela cinética Q10 y calor vital en Watts', () => {
  // A 4°C (temperatura base)
  const resp4 = calcPostHarvestRespiration('orellana_gris', 4.0, 10.0);
  assert.equal(resp4.tempC, 4.0);
  assert.equal(resp4.accelerationFactor, 1.0);
  assert.equal(resp4.respirationMgKgH, 55.0);
  assert.ok(resp4.totalVitalHeatWatts > 0);

  // A 18°C (ambiente Sabana)
  const resp18 = calcPostHarvestRespiration('orellana_gris', 18.0, 10.0);
  assert.equal(resp18.tempC, 18.0);
  // Q10 = 2.8 ^ 1.4 ≈ 4.2x
  assert.ok(resp18.accelerationFactor >= 4.0 && resp18.accelerationFactor <= 4.5);
  assert.ok(resp18.respirationMgKgH > 220);
  assert.ok(resp18.totalVitalHeatWatts > resp4.totalVitalHeatWatts * 4);
});

test('calcTranspirationLoss calcula tasa de pérdida de masa y efecto de humedad de almacenamiento', () => {
  // Melena de León a 4°C al aire libre (isPackaged = false) con 95% HR vs 70% HR
  const loss95Open = calcTranspirationLoss('melena_leon', 4.0, 95, false);
  assert.ok(loss95Open.weightLossPctPerDay < 1.0);
  assert.ok(loss95Open.daysToDesiccationLimit > 5.0);

  // Aire libre seco 70% HR (abuso higrométrico)
  const loss70Open = calcTranspirationLoss('melena_leon', 4.0, 70, false);
  assert.ok(loss70Open.weightLossPctPerDay > loss95Open.weightLossPctPerDay * 4);
  assert.ok(loss70Open.daysToDesiccationLimit < 2.0);

  // Protección del empaque comercial (BOPP microperforado)
  const lossPackaged = calcTranspirationLoss('melena_leon', 4.0, 70, true);
  assert.ok(lossPackaged.weightLossPctPerDay < loss70Open.weightLossPctPerDay * 0.2); // Más del 80% de reducción

  // Seta de Cardo tiene cutícula más resistente (menor kTransp)
  const lossCardo = calcTranspirationLoss('seta_cardo', 4.0, 85, false);
  const lossGris = calcTranspirationLoss('orellana_gris', 4.0, 85, false);
  assert.ok(lossCardo.weightLossPctPerDay < lossGris.weightLossPctPerDay);
});

test('predictShelfLife predice vida útil comercial y contrasta 4°C vs 18°C', () => {
  // Orellana Gris en cadena de frío ideal (4°C, 92% HR)
  const slCold = predictShelfLife('orellana_gris', 4.0, 92);
  assert.ok(slCold.marketableShelfLifeDays >= 8.0, `Esperado >= 8 días, obtenido ${slCold.marketableShelfLifeDays}`);
  assert.equal(slCold.statusBadge, '🟢');
  assert.equal(slCold.scenariosComparison.cuartoFrio_4C, 10.0);

  // Orellana Gris a temperatura ambiente (18°C, 80% HR)
  const slWarm = predictShelfLife('orellana_gris', 18.0, 80);
  assert.ok(slWarm.marketableShelfLifeDays <= 3.0, `Esperado <= 3 días, obtenido ${slWarm.marketableShelfLifeDays}`);
  assert.ok(slWarm.scenariosComparison.lossRatioAmbienteVsFrio >= 65, 'Pérdida de vida comercial debe ser > 65%');
  assert.ok(slWarm.packagingRecommendation.type.includes('bopp'));
  assert.equal(slWarm.packagingRecommendation.antiFogRequired, true);
});
