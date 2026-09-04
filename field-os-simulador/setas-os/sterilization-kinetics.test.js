'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  TENJO_NOMINAL_ATM_KPA,
  SEA_LEVEL_ATM_KPA,
  T_REF_STERILIZATION,
  calcBoilingTempFromAbsPressure,
  calcSteamSatTemp,
  calcRequiredGaugePressurePsi,
  calcThermalLethalityRate,
  calcTimeCompFactorAt15Psi,
  simulateCorePenetration,
  validateAutoclaveCycle,
} = require('./sterilization-kinetics.js');

test('calcBoilingTempFromAbsPressure calcula punto de ebullición según altitud y presión', () => {
  // A nivel del mar (101.325 kPa), el agua hierve a ~100°C
  const seaBoil = calcBoilingTempFromAbsPressure(SEA_LEVEL_ATM_KPA);
  assert.ok(Math.abs(seaBoil - 100.0) < 0.2, `Esperado ~100°C a nivel del mar, obtenido ${seaBoil}`);

  // En Tenjo a 2.600 msnm (74.5 kPa), el agua hierve a ~91.6°C
  const tenjoBoil = calcBoilingTempFromAbsPressure(TENJO_NOMINAL_ATM_KPA);
  assert.ok(tenjoBoil >= 91.4 && tenjoBoil <= 91.8, `Esperado ~91.6°C en Tenjo, obtenido ${tenjoBoil}`);

  // A 205.8 kPa abs (~19 psig en Tenjo), el vapor alcanza 121.1°C
  const sterilTemp = calcBoilingTempFromAbsPressure(205.78);
  assert.ok(Math.abs(sterilTemp - 121.11) < 0.2, `Esperado ~121.1°C a 205.8 kPa, obtenido ${sterilTemp}`);
});

test('calcRequiredGaugePressurePsi determina la presión manométrica requerida para 121.11°C', () => {
  // A nivel del mar se requieren ~15.1 psig
  const seaGaugePsi = calcRequiredGaugePressurePsi(T_REF_STERILIZATION, SEA_LEVEL_ATM_KPA);
  assert.ok(seaGaugePsi >= 15.0 && seaGaugePsi <= 15.3, `Nivel del mar: ${seaGaugePsi} psig`);

  // En Tenjo (74.5 kPa) se requieren ~19.0 psig debido al déficit barométrico
  const tenjoGaugePsi = calcRequiredGaugePressurePsi(T_REF_STERILIZATION, TENJO_NOMINAL_ATM_KPA);
  assert.ok(tenjoGaugePsi >= 18.9 && tenjoGaugePsi <= 19.2, `Tenjo: ${tenjoGaugePsi} psig`);
});

test('calcSteamSatTemp calcula la temperatura alcanzada con manómetro en Tenjo', () => {
  // Si en Tenjo el autoclave marca 15 psig, solo alcanza ~116.5°C
  const temp15PsiTenjo = calcSteamSatTemp(15.0, TENJO_NOMINAL_ATM_KPA);
  assert.ok(temp15PsiTenjo >= 116.3 && temp15PsiTenjo <= 116.8, `15 psi en Tenjo: ${temp15PsiTenjo}°C`);

  // Con 19.04 psig en Tenjo, se alcanzan los 121.1°C de esterilización estándar
  const temp19PsiTenjo = calcSteamSatTemp(19.04, TENJO_NOMINAL_ATM_KPA);
  assert.ok(Math.abs(temp19PsiTenjo - 121.11) < 0.2, `19.04 psi en Tenjo: ${temp19PsiTenjo}°C`);
});

test('calcThermalLethalityRate y factor de compensación de tiempo a 15 psi', () => {
  // A 121.11°C L = 1.0 (1 minuto equivale a 1 minuto F0)
  const l121 = calcThermalLethalityRate(121.11);
  assert.ok(Math.abs(l121 - 1.0) < 0.01);

  // A 116.57°C (15 psi en Tenjo), L = 10^((116.57 - 121.11)/10) ≈ 0.35
  const comp = calcTimeCompFactorAt15Psi(TENJO_NOMINAL_ATM_KPA);
  assert.ok(comp.rateAt15Psi >= 0.34 && comp.rateAt15Psi <= 0.36);
  assert.ok(comp.factor >= 2.7 && comp.factor <= 3.0); // Requiere ~2.8x más tiempo
  assert.ok(comp.lethalityLossPct > 60.0); // ~64.8% pérdida de poder letal por minuto
  assert.ok(comp.requiredHoldMinFor60MinEquivalent > 160); // 60 min a 121°C equivalen a ~170 min a 116.5°C
});

test('simulateCorePenetration y validateAutoclaveCycle validan esterilidad comercial (F0 >= 12)', () => {
  // Caso 1: Ciclo profesional con 19.04 psig durante 120 min en bolsa de 2.0 kg (o 90 min en 1.5 kg)
  const cycleValid2kg = validateAutoclaveCycle({
    holdTimeMin: 120,
    gaugePressurePsi: 19.04,
    bagKg: 2.0,
    moisturePct: 65,
    ambientPressureKpa: TENJO_NOMINAL_ATM_KPA,
  });

  assert.equal(cycleValid2kg.isSterile, true);
  assert.ok(cycleValid2kg.f0Total >= 12.0, `F0 acumulado debe ser >= 12, obtenido ${cycleValid2kg.f0Total}`);
  assert.equal(cycleValid2kg.riskLevel, 'seguro');
  assert.ok(cycleValid2kg.logReductionStearothermophilus >= 6.0); // > 6 log reductions
  assert.ok(cycleValid2kg.timeline.length > 10);

  // Caso 1b: Ciclo de 90 min en bolsa pequeña de 1.5 kg
  const cycleValid1_5kg = validateAutoclaveCycle({
    holdTimeMin: 90,
    gaugePressurePsi: 19.04,
    bagKg: 1.5,
    moisturePct: 65,
    ambientPressureKpa: TENJO_NOMINAL_ATM_KPA,
  });
  assert.equal(cycleValid1_5kg.isSterile, true);
  assert.ok(cycleValid1_5kg.f0Total >= 12.0);

  // Caso 2: Inercia térmica - 90 min en bolsa pesada de 2.0 kg en Tenjo no logra completar F0 comercial en el núcleo
  const cycleSubSterile = validateAutoclaveCycle({
    holdTimeMin: 90,
    gaugePressurePsi: 19.04,
    bagKg: 2.0,
    moisturePct: 65,
    ambientPressureKpa: TENJO_NOMINAL_ATM_KPA,
  });
  assert.equal(cycleSubSterile.isSterile, false);
  assert.equal(cycleSubSterile.riskLevel, 'moderado');

  // Caso 3: Ciclo deficiente operado a 15 psi por solo 45 min en Tenjo
  const cycleFail = validateAutoclaveCycle({
    holdTimeMin: 45,
    gaugePressurePsi: 15.0,
    bagKg: 2.5,
    moisturePct: 60,
    ambientPressureKpa: TENJO_NOMINAL_ATM_KPA,
  });

  assert.equal(cycleFail.isSterile, false);
  assert.ok(cycleFail.f0Total < 12.0);
  assert.equal(cycleFail.riskLevel, 'critico');
  assert.ok(cycleFail.recommendations.some(r => r.includes('19')));
});
