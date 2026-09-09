'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('./flush-forecast-engine.js');

test('Setas OS — Motor de Pronóstico de Cosechas & Oleadas (flush-forecast-engine)', async (t) => {

  await t.test('1. Corrige el error de materia seca vs húmeda: no sobreestima la cosecha en ~2.85x', () => {
    // Caso de prueba real: 100 bolsas de 1.5 kg de sustrato húmedo con 65% humedad y 90% EB
    // Materia seca = 100 * 1.5 * (1 - 0.65) = 52.5 kg seco
    // Rendimiento real esperado a 90% EB = 52.5 * 0.90 = 47.25 kg frescos
    // El bug anterior calculaba: 100 * 1.5 * 0.90 = 135 kg (factor 2.857x de error)
    const result = engine.calculateLotYieldAndFlushes({
      bags: 100,
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      sKey: 'p_ostreatus_gris',
    });

    assert.equal(result.totalDryKg, 52.5, 'La materia seca total debe ser 52.5 kg');
    assert.equal(result.totalKg, 47.25, 'El rendimiento fresco total debe ser 47.25 kg, NO 135 kg');
    assert.equal(result.dryKgPerBag, 0.525, 'La materia seca por bolsa de 1.5 kg debe ser 0.525 kg');
    assert.ok(result.totalKg < 50, 'El rendimiento real no puede exceder la masa biológica seca disponible');
  });

  await t.test('2. Aplica la matriz biológica diferencial de oleadas por especie', () => {
    // Orellana Rosa: concentración hiper-dominante en 1ª oleada (75%), descarte en 3ª
    const djamor = engine.calculateLotYieldAndFlushes({
      bags: 100,
      kgPerBag: 2.0,
      moisture: 67,
      eb: 100,
      sKey: 'p_djamor_rosa',
    });
    assert.equal(djamor.flushes[0].pct, 0.75, 'Orellana Rosa debe concentrar 75% en F1');
    assert.equal(djamor.flushes[1].pct, 0.20, 'Orellana Rosa debe aportar 20% en F2');
    assert.equal(djamor.flushes[2].pct, 0.05, 'Orellana Rosa debe aportar 5% en F3');

    // Seta de Cardo (P. eryngii): 2 oleadas comerciales (80% / 20%)
    const eryngii = engine.calculateLotYieldAndFlushes({
      bags: 50,
      kgPerBag: 1.5,
      moisture: 63,
      eb: 85,
      sKey: 'p_eryngii',
    });
    assert.equal(eryngii.flushes.length, 2, 'P. eryngii tiene 2 oleadas comerciales');
    assert.equal(eryngii.flushes[0].pct, 0.80, 'P. eryngii tiene 80% en F1');
    assert.equal(eryngii.flushes[1].pct, 0.20, 'P. eryngii tiene 20% en F2');

    // Nameko: rendimiento balanceado y alta persistencia en 2da oleada (50% / 38% / 12%)
    const nameko = engine.calculateLotYieldAndFlushes({
      bags: 80,
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      sKey: 'nameko',
    });
    assert.equal(nameko.flushes[0].pct, 0.50);
    assert.equal(nameko.flushes[1].pct, 0.38);
    assert.equal(nameko.flushes[2].pct, 0.12);
  });

  await t.test('3. Modela la cinética térmica de colonización (Q10 = 2.0 / Efecto Tenjo)', () => {
    // A 24°C (referencia controlada), el factor es 1.0
    const t24 = engine.calcThermalDelayFactor('p_ostreatus_gris', 24);
    assert.equal(t24.factor, 1.0, 'A 24°C el factor térmico debe ser neutro (1.0)');

    // A 14°C (temperatura ambiente típica fría de Tenjo sin calefacción), factor = 2.0 (duplica días)
    const t14 = engine.calcThermalDelayFactor('p_ostreatus_gris', 14);
    assert.equal(t14.factor, 2.0, 'A 14°C el tiempo de incubación se duplica por cinética Q10=2.0');
    assert.ok(t14.isColdDelayed, 'Debe marcar retraso por frío');

    // A 16°C, factor = 2^(0.8) ≈ 1.74
    const t16 = engine.calcThermalDelayFactor('p_ostreatus_gris', 16);
    assert.equal(t16.factor, 1.74, 'A 16°C el factor térmico debe ser ~1.74');

    // Orellana Rosa a temperatura fría emite alerta biológica
    const djamorCold = engine.calcThermalDelayFactor('p_djamor_rosa', 14);
    assert.ok(djamorCold.coldWarning != null, 'P. djamor a 14°C debe emitir advertencia de aborto');
  });

  await t.test('4. Calcula los requerimientos de siembra sin subestimación', () => {
    // Si se necesitan 15 kg de Orellana fresca con EB 90%, bolsas de 1.5 kg (65% humedad)
    // Rendimiento por bolsa = 1.5 * 0.35 * 0.90 * 0.95 (5% merma) ≈ 0.4488 kg/bolsa
    // Bolsas requeridas = ceil(15 / 0.4488) = 34 bolsas
    // El cálculo anterior dividía 15 / 1.5 = 10 bolsas (¡un déficit real de 24 bolsas!)
    const req = engine.calculateSowingRequirement(15, 'p_ostreatus_gris', {
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      contamRate: 0.05,
      spawnRate: 8,
    });

    assert.equal(req.bagsNeeded, 34, 'Deben calcularse 34 bolsas para 15 kg reales');
    assert.ok(req.wetSubstrateKg > 40, 'El sustrato húmedo necesario debe ser >40 kg');
    assert.ok(req.spawnNeededKg > 3.5, 'El spawn requerido al 8% debe ser ~4 kg');
    assert.match(req.message, /Inocular 34 bolsas de 1\.5 kg/);
  });

  await t.test('5. Empareja oferta semanal contra compromisos comerciales B2B', () => {
    const lots = [
      {
        id: 'LOTE-001',
        bags: 100,
        kgPerBag: 1.5,
        moisture: 65,
        eb: 90,
        fechaInoculacion: '2026-08-01',
        sKey: 'p_ostreatus_gris',
      },
      {
        id: 'LOTE-002',
        bags: 80,
        kgPerBag: 1.5,
        moisture: 65,
        eb: 90,
        fechaInoculacion: '2026-08-15',
        sKey: 'p_ostreatus_gris',
      },
    ];

    const commitments = [
      { week: '2026-W36', cliente: 'Restaurante Criterión', kg: 20 },
      { week: '2026-W37', cliente: 'Restaurante Harry Sasson', kg: 40 },
    ];

    const coverage = engine.matchWeeklyCoverage(lots, commitments);

    assert.ok(Number.isFinite(coverage.totalProjectedKg), 'Debe sumar kg proyectados');
    assert.ok(coverage.weeks.length > 0, 'Debe desglosar las semanas');
    assert.ok(['superavit', 'cobertura', 'deficit'].includes(coverage.weeks[0].status));
    assert.ok(['🟢', '🟡', '🔴'].includes(coverage.weeks[0].badge));
  });

  await t.test('6. Calibra empíricamente el perfil de flushes desde registros reales de Bitácora', () => {
    const cosechas = [
      { flush: 1, pesoFresco: 15000 },
      { flush: 1, pesoFresco: 14000 },
      { flush: 2, pesoFresco: 9000 },
      { flush: 2, pesoFresco: 8500 },
      { flush: 3, pesoFresco: 3000 },
    ];

    const cal = engine.calibrateFlushProfileFromHarvests('p_ostreatus_gris', cosechas);
    assert.equal(cal.isCalibrated, true, 'Debe calibrar si hay registros válidos');
    assert.ok(cal.profile.flushes[0].pct > 0.45 && cal.profile.flushes[0].pct < 0.65);
    assert.equal(cal.sampleCount, 5);
  });

  await t.test('7. Predictor de costo unitario de sustrato por kg de hongo fresco (Funcionalidad 2)', () => {
    // Si el sustrato seco cuesta $1.800 COP/kg y la EB es 100%, el costo de sustrato por kg hongo es $1.800 COP
    const c100 = engine.predictSubstrateCostPerFreshKg(1800, 100);
    assert.equal(c100.costSubstratePerFreshKg, 1800);

    // Si la EB es 75%, el costo sube a 1800 / 0.75 = $2.400 COP por kg hongo
    const c75 = engine.predictSubstrateCostPerFreshKg(1800, 75);
    assert.equal(c75.costSubstratePerFreshKg, 2400);

    // Si la EB es 120%, el costo baja a 1800 / 1.20 = $1.500 COP por kg hongo
    const c120 = engine.predictSubstrateCostPerFreshKg(1800, 120);
    assert.equal(c120.costSubstratePerFreshKg, 1500);
  });

  await t.test('8. Modelo de Temperatura Cardinal (CTMI) y estrés térmico en Tenjo', () => {
    // A 28°C (por encima de tOpt=24°C para p_ostreatus_gris), debe detectar estrés térmico
    const t28 = engine.calcThermalDelayFactor('p_ostreatus_gris', 28);
    assert.ok(t28.isHeatStressed, 'A 28°C debe marcar estrés térmico');
    assert.ok(t28.factor > 1.0, 'El factor debe ser mayor a 1.0 por desaceleración enzimática');
    assert.match(t28.heatWarning, /Estrés térmico/);

    // A 32°C (por encima de tMax=30°C), debe marcar arresto térmico
    const t32 = engine.calcThermalDelayFactor('p_ostreatus_gris', 32);
    assert.equal(t32.thermalArrest, true, 'A 32°C debe marcar arresto térmico');
    assert.equal(t32.factor, 3.5, 'Factor limitado a 3.5 por paro térmico biológico');

    // Normalización de alias biológicos (ej. hericium_erinaceus / melena_leon -> lions_mane)
    const lm = engine.calcThermalDelayFactor('hericium_erinaceus', 22);
    assert.equal(lm.speciesKey, 'lions_mane', 'Debe normalizar hericium_erinaceus a lions_mane');
  });

  await t.test('9. Cálculo de requerimientos de siembra con objetivo de primera oleada (targetFlush)', () => {
    // Si se necesitan 15 kg exclusivamente en la 1ra oleada (p_ostreatus_gris rinde 55% en F1)
    const reqF1 = engine.calculateSowingRequirement(15, 'p_ostreatus_gris', {
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      targetFlush: 1,
    });
    // Con F1 (55%), cada bolsa produce 0.4488 * 0.55 ≈ 0.2469 kg frescos en F1
    // Bolsas requeridas = ceil(15 / 0.2469) = 61 bolsas (en vez de 34 bolsas para todo el ciclo)
    assert.ok(reqF1.bagsNeeded > 55, 'Para cumplir entrega en F1 deben sembrarse más bolsas que para ciclo completo');
    assert.equal(reqF1.targetFlush, 1);
  });

  await t.test('10. Proyección dinámica de oleadas restantes para lote activo en sala', () => {
    const activeLot = engine.calculateLotYieldAndFlushes({
      bags: 100,
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      sKey: 'p_ostreatus_gris',
      currentFlush: 1,
      lastFlushDate: '2026-09-01',
    });

    // Como currentFlush = 1, F1 está cosechada y restan F2 y F3
    assert.equal(activeLot.flushes.length, 3, 'El perfil conserva las 3 oleadas para trazabilidad');
    assert.equal(activeLot.flushes[0].isHarvested, true, 'F1 ya fue cosechada');
    assert.equal(activeLot.remainingFlushes.length, 2, 'Solo deben quedar 2 oleadas activas (F2 y F3)');
    assert.equal(activeLot.remainingFlushes[0].flush, 2);
    assert.equal(activeLot.remainingFlushes[1].flush, 3);
    assert.ok(activeLot.remainingFlushes[0].date.includes('2026-09-'));
  });

  await t.test('11. Emparejamiento de oferta con desglose por especie (bySpecies)', () => {
    const lots = [
      {
        id: 'LOTE-GRIS-1',
        bags: 100,
        kgPerBag: 1.5,
        moisture: 65,
        eb: 90,
        fechaInoculacion: '2026-08-01',
        sKey: 'p_ostreatus_gris',
      },
      {
        id: 'LOTE-ROSA-1',
        bags: 100,
        kgPerBag: 1.5,
        moisture: 67,
        eb: 85,
        fechaInoculacion: '2026-08-01',
        sKey: 'p_djamor_rosa',
      },
    ];

    const commitments = [
      { week: '2026-W36', cliente: 'Restaurante Criterión', kg: 15, sKey: 'p_ostreatus_gris' },
    ];

    const coverage = engine.matchWeeklyCoverage(lots, commitments);
    assert.ok(coverage.bySpecies != null, 'Debe incluir balance global bySpecies');
    assert.ok(coverage.bySpecies['p_ostreatus_gris'] != null);
    assert.ok(coverage.bySpecies['p_djamor_rosa'] != null);
    assert.ok(coverage.weeks[0].bySpecies != null, 'Cada semana debe desglosar bySpecies');
  });

  await t.test('12. parseDateSafe y getISOWeekKey manejan cadenas ISO completas y timestamps sin desbordamiento', () => {
    // String ISO con timestamp
    assert.equal(engine.getISOWeekKey('2026-05-15T10:30:00.000Z'), '2026-W20');
    assert.equal(engine.getISOWeekKey('2026-01-01'), '2026-W01');
    assert.equal(engine.getISOWeekKey('2026-12-31'), '2026-W53');

    // Fechas nulas o inválidas retornan fallback seguro sin lanzar excepción
    assert.equal(engine.getISOWeekKey(null), '2026-W01');
    assert.equal(engine.getISOWeekKey('fecha-invalida'), '2026-W01');

    // calculateLotYieldAndFlushes no lanza RangeError con strings ISO de Firestore
    const isoLot = engine.calculateLotYieldAndFlushes({
      bags: 50,
      kgPerBag: 1.5,
      fechaInoculacion: '2026-04-10T08:30:00.000Z',
      sKey: 'p_ostreatus_gris',
    });
    assert.ok(isoLot.flushes[0].date.startsWith('2026-05-'));
  });

  await t.test('13. calculateSowingRequirement programa siembra según tiempo de desarrollo de la oleada objetivo', () => {
    // Para F1 (días = 32)
    const reqF1 = engine.calculateSowingRequirement(10, 'p_ostreatus_gris', {
      targetFlush: 1,
      targetDate: '2026-10-01',
      ambientTemp: 24, // factor = 1.0 -> 32 días
    });
    assert.equal(reqF1.recommendedSowDate, '2026-08-30');

    // Para F2 (días = 46)
    const reqF2 = engine.calculateSowingRequirement(10, 'p_ostreatus_gris', {
      targetFlush: 2,
      targetDate: '2026-10-01',
      ambientTemp: 24, // factor = 1.0 -> 46 días
    });
    assert.equal(reqF2.recommendedSowDate, '2026-08-16', 'F2 debe sembrarse 46 días antes de la entrega, no 32 días');
  });

  await t.test('14. matchWeeklyCoverage excluye oleadas ya cosechadas cuando se solicita excludeHarvested', () => {
    const activeLot = engine.calculateLotYieldAndFlushes({
      id: 'LOTE-ACTIVO-1',
      bags: 100,
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      sKey: 'p_ostreatus_gris',
      fechaInoculacion: '2026-07-01',
      currentFlush: 1, // F1 ya cosechada
      lastFlushDate: '2026-08-05',
    });

    const comms = [{ week: '2026-W34', kg: 10 }];

    // Sin filtro: incluye todas las oleadas históricas y futuras
    const allCov = engine.matchWeeklyCoverage([activeLot], comms);
    assert.ok(allCov.totalProjectedKg > 40);

    // Con filtro excludeHarvested: solo proyecta oleadas futuras pendientes
    const futureCov = engine.matchWeeklyCoverage([activeLot], comms, { excludeHarvested: true });
    assert.ok(futureCov.totalProjectedKg < allCov.totalProjectedKg, 'Debe descontar los kg de F1 ya cosechados');
  });

});
