'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  calcVPsat,
  calcVPact,
  calcVPD,
  calcDewPoint,
  evalClimateHealth,
  generateSvgPolyline
} = require('./climate-math.js');

test('calcVPsat y calcVPact calculan presiones de vapor correctamente', () => {
  const sat20 = calcVPsat(20);
  assert.ok(sat20 > 2.33 && sat20 < 2.35); // ~2.338 kPa a 20°C

  const sat0 = calcVPsat(0);
  assert.ok(sat0 > 0.60 && sat0 < 0.62); // 0.61078 kPa a 0°C

  const act20_90 = calcVPact(20, 90);
  assert.ok(act20_90 > 2.10 && act20_90 < 2.11);
});

test('calcVPD calcula el déficit de presión de vapor en kPa', () => {
  // A 18°C y 90% HR: VPsat ≈ 2.064 kPa, VPact ≈ 1.858 kPa => VPD ≈ 0.21 kPa
  const vpd = calcVPD(18, 90);
  assert.equal(vpd, 0.21);

  // A 22°C y 85% HR: VPsat ≈ 2.645 kPa => VPD ≈ 0.40 kPa
  const vpd2 = calcVPD(22, 85);
  assert.equal(vpd2, 0.40);

  // A 100% HR => VPD es 0.00 kPa
  assert.equal(calcVPD(18, 100), 0);
});

test('calcDewPoint calcula el punto de rocío correctamente', () => {
  // A 18°C y 90% HR => Tdp ≈ 16.3°C
  const dp = calcDewPoint(18, 90);
  assert.equal(dp, 16.3);

  // A 20°C y 50% HR => Tdp ≈ 9.3°C
  const dp2 = calcDewPoint(20, 50);
  assert.equal(dp2, 9.3);
});

test('evalClimateHealth detecta riesgos de condensación y desviaciones de CO2 y VPD', () => {
  // Caso 1: Rango óptimo en fructificación
  const healthOpt = evalClimateHealth({
    tC: 17.5,
    rhPct: 90,
    co2Ppm: 650,
    targets: {
      temperature_c: { min: 14, max: 20, target: 17 },
      rh_pct: { min: 85, max: 95, target: 90 },
      co2_ppm: { min: 400, max: 900, target: 600 }
    }
  });
  assert.equal(healthOpt.severity, 'optimal');
  assert.equal(healthOpt.condensationRisk, false);
  assert.equal(healthOpt.alerts.length, 0);

  // Caso 2: Peligro de condensación y CO2 alto
  const healthCrit = evalClimateHealth({
    tC: 18.0,
    rhPct: 98, // Delta T aire-rocío < 0.8°C
    co2Ppm: 1200,
    targets: {
      temperature_c: { min: 14, max: 20, target: 17 },
      rh_pct: { min: 85, max: 95, target: 90 },
      co2_ppm: { min: 400, max: 900, target: 600 }
    }
  });
  assert.equal(healthCrit.condensationRisk, true);
  assert.equal(healthCrit.severity, 'critical');
  assert.ok(healthCrit.alerts.some(a => a.metric === 'co2_ppm'));
  assert.ok(healthCrit.alerts.some(a => a.metric === 'rh_pct'));
});

test('generateSvgPolyline produce string de puntos escalado', () => {
  const points = generateSvgPolyline([16, 17, 18, 17.5], null, { width: 100, height: 50, padding: 0 });
  assert.ok(points.length > 0);
  assert.match(points, /^0\.0,50\.0 33\.3,25\.0 66\.7,0\.0 100\.0,12\.5$/);
});

test('calcBarometricCO2Correction corrige sub-lectura de sensores NDIR en altitud', () => {
  const { calcBarometricCO2Correction, TENJO_NOMINAL_PRESSURE_HPA } = require('./climate-math.js');

  // Lectura de 700 ppm en sensor NDIR no compensado en Tenjo (745 hPa) a 18°C
  const corr = calcBarometricCO2Correction(700, TENJO_NOMINAL_PRESSURE_HPA, 18.0);
  assert.equal(corr.rawPpm, 700);
  assert.ok(corr.baroFactor >= 1.35 && corr.baroFactor <= 1.37, `Factor barométrico ~1.36x, obtenido ${corr.baroFactor}`);
  assert.ok(corr.correctedPpm >= 940 && corr.correctedPpm <= 960, `Esperado ~950 ppm, obtenido ${corr.correctedPpm}`);
  assert.ok(corr.deltaPpm > 240);

  // A nivel del mar (1013.25 hPa) y 20°C el factor es exactamente 1.0
  const seaCorr = calcBarometricCO2Correction(800, 1013.25, 20.0);
  assert.equal(seaCorr.correctedPpm, 800);
  assert.equal(seaCorr.totalCorrectionFactor, 1.0);
});

test('calcDynamicFAE calcula caudales CFM y ciclo de trabajo de extractores según biomasa', () => {
  const { calcDynamicFAE } = require('./climate-math.js');

  // 15 kg de Orellana Gris en carpa 2.4x2.4x2.0 (11.5 m3), target 800 ppm, extractor 140 CFM
  const fae = calcDynamicFAE(15.0, 'orellana_gris', {
    targetPpm: 800,
    outdoorPpm: 420,
    roomVolumeM3: 11.52,
    fanRatedCfm: 140,
    cyclePeriodMin: 10
  });

  assert.equal(fae.biomassKg, 15.0);
  assert.equal(fae.respirationRateMgKgH, 1400); // Tasa orellana gris
  assert.ok(fae.requiredCfm > 20 && fae.requiredCfm < 30, `Esperado ~24 CFM, obtenido ${fae.requiredCfm}`);
  assert.ok(fae.effectiveAch >= 3.0);
  assert.ok(fae.dutyCyclePct >= 15 && fae.dutyCyclePct <= 22);
  assert.ok(fae.schedule.onTimeSec > 60 && fae.schedule.onTimeSec < 150);
  assert.ok(fae.schedule.recommendation.includes('Encender'));

  // Carga pesada (80 kg) que satura extractor
  const heavyFae = calcDynamicFAE(80.0, 'orellana_gris', {
    targetPpm: 700,
    outdoorPpm: 420,
    fanRatedCfm: 140
  });
  assert.ok(heavyFae.dutyCyclePct >= 95);
  assert.ok(heavyFae.schedule.recommendation.includes('continuo') || heavyFae.schedule.recommendation.includes('100%'));
});
