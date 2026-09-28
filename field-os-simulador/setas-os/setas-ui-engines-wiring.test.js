'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const jsx = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'simulador-app.js'), 'utf8');

const flushForecast = require('./flush-forecast-engine.js');
const postHarvest = require('./post-harvest-engine.js');
const coCultivation = require('./co-cultivation-matrix.js');
const batchSheet = require('./batch-sheet.js');

test('1. Dynamic Harvest Projection: calculateRemainingFlushes y calculateLotYieldAndFlushes', () => {
  assert.equal(typeof flushForecast.calculateRemainingFlushes, 'function');
  assert.equal(typeof flushForecast.calculateLotYieldAndFlushes, 'function');

  // Lote nuevo sin cosechas
  const lotNew = {
    id: 'lot-ff-01',
    codigo: 'L-O-01',
    speciesKey: 'p_ostreatus_gris',
    numBolsas: 20,
    pesoHumedo: 2.5,
    humedad: 65,
    eb: 95,
    fechaInoculacion: '2026-09-01',
  };

  const resNew = flushForecast.calculateRemainingFlushes(lotNew);
  assert.ok(resNew.totalKg > 0);
  assert.equal(resNew.currentFlush, 0);
  assert.equal(resNew.flushes.length, 3);
  assert.equal(resNew.remainingFlushes.length, 3);
  assert.equal(resNew.remainingExpectedKg, resNew.totalKg);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(resNew.flushes[0].date));

  // Lote con 1ª oleada ya cosechada
  const resPast = flushForecast.calculateRemainingFlushes(lotNew, {
    currentFlush: 1,
    lastFlushDate: '2026-10-03',
  });
  assert.equal(resPast.currentFlush, 1);
  assert.equal(resPast.flushes[0].isHarvested, true);
  assert.equal(resPast.flushes[1].isHarvested, false);
  assert.equal(resPast.remainingFlushes.length, 2);
  assert.ok(resPast.remainingExpectedKg < resPast.totalKg);

  // Lote con todas las oleadas cosechadas
  const resDone = flushForecast.calculateRemainingFlushes(lotNew, { currentFlush: 3 });
  assert.equal(resDone.remainingFlushes.length, 0);
  assert.equal(resDone.remainingExpectedKg, 0);

  // Normalización de nombres en español con tildes y espacios
  const resMelena = flushForecast.calculateRemainingFlushes({ especie: 'Melena de León', numBolsas: 10 });
  assert.match(resMelena.speciesName, /Hericium|Melena/i);
  assert.equal(resMelena.speciesKey, 'lions_mane');

  const resCardo = flushForecast.calculateRemainingFlushes({ especie: 'Seta de Cardo', numBolsas: 10 });
  assert.match(resCardo.speciesName, /eryngii|Cardo/i);
  assert.equal(resCardo.speciesKey, 'p_eryngii');

  const resRosa = flushForecast.calculateRemainingFlushes({ especie: 'Orellana Rosada', numBolsas: 10 });
  assert.match(resRosa.speciesName, /djamor|Rosa/i);
  assert.equal(resRosa.speciesKey, 'p_djamor_rosa');

  // Robustez ante inputs vacíos
  const resEmpty = flushForecast.calculateRemainingFlushes({});
  assert.ok(resEmpty.flushes);
  assert.ok(Array.isArray(resEmpty.remainingFlushes));
});

test('2. Dynamic Harvest Projection en Batch Sheet canónico (batch-sheet.js)', () => {
  const lot = {
    id: 'lote-bs-02',
    codigo: 'L-BS-02',
    especie: 'Orellana Rosa',
    speciesKey: 'p_djamor_rosa',
    numBolsas: 12,
    pesoHumedo: 2.0,
    humedad: 65,
    eb: 85,
    fechaInoculacion: '2026-08-15',
    estado: 'fructificacion',
  };

  const sheet = batchSheet.buildBatchSheet({
    lote: lot,
    bolsas: [{ id: 'b1', loteId: 'lote-bs-02', codigo: 'L-BS-02-B01', estado: 'sana' }],
    cosechas: [
      { id: 'c0', loteId: 'lote-bs-02', flush: null, fecha: null, pesoFresco: 0 },
      { id: 'c1', loteId: 'lote-bs-02', flush: 1, fecha: '2026-09-10', pesoFresco: 4100 },
    ],
  });

  assert.ok(sheet.flushForecast, 'sheet.flushForecast debe estar presente en la ficha');
  assert.equal(sheet.flushForecast.currentFlush, 1);
  assert.equal(sheet.flushForecast.speciesName, 'Orellana Rosa');
  assert.ok(sheet.flushForecast.remainingFlushes.length >= 1);
  assert.ok(sheet.flushForecast.remainingExpectedKg > 0);
  assert.ok(sheet.flushForecast.thermalFactor > 0);

  // Lote con especie con tildes y receta vinculada con EB estimada
  const lotMelena = {
    id: 'lote-bs-melena',
    codigo: 'L-BS-MEL-01',
    especie: 'Melena de León',
    recipeRef: { eb: 140 },
    numBolsas: 10,
    pesoHumedo: 2.0,
    fechaInoculacion: '2026-08-01',
  };
  const sheetMelena = batchSheet.buildBatchSheet({ lote: lotMelena });
  assert.ok(sheetMelena.flushForecast);
  assert.match(sheetMelena.flushForecast.speciesName, /Hericium|Melena/i);
  assert.equal(sheetMelena.flushForecast.eb, 140);
});

test('3. Post-Harvest Shelf-Life: predictShelfLife bajo temperaturas controladas y ambiente', () => {
  assert.equal(typeof postHarvest.predictShelfLife, 'function');

  // A 4°C refrigeración comercial vs 18°C ambiente
  const cold = postHarvest.predictShelfLife('orellana_gris', 4.0, 90.0);
  const ambient = postHarvest.predictShelfLife('orellana_gris', 18.0, 70.0);

  assert.ok(cold.marketableDays > ambient.marketableDays, 'La vida útil a 4°C debe ser mayor que a 18°C');
  assert.ok(cold.marketableShelfLifeDays > 5);
  assert.ok(cold.limitingFactor);
  assert.ok(cold.transpiration);
  assert.ok(cold.respiration);

  // Resolución correcta de nombres con tildes y espacios sin caer en Orellana Gris
  const melena = postHarvest.predictShelfLife('Melena de León', 4.0);
  assert.equal(melena.speciesKey, 'melena_leon');
  assert.equal(melena.marketableShelfLifeDays, 8);
  assert.match(melena.limitingFactor, /espinas|browning|pardeamiento/i);

  const rosa = postHarvest.predictShelfLife('Orellana Rosa', 4.0);
  assert.equal(rosa.speciesKey, 'orellana_rosa');
  assert.equal(rosa.marketableShelfLifeDays, 5);

  const cardo = postHarvest.predictShelfLife('Seta de Cardo', 4.0);
  assert.equal(cardo.speciesKey, 'seta_cardo');
  assert.equal(cardo.marketableShelfLifeDays, 18);

  // Todas las especies del catálogo tienen perfil post-cosecha
  const speciesList = ['orellana_gris', 'orellana_blanca', 'orellana_rosa', 'melena_leon', 'shiitake', 'reishi'];
  speciesList.forEach(sp => {
    const p = postHarvest.predictShelfLife(sp, 4.0);
    assert.ok(p.marketableDays > 0, `Especie ${sp} debe tener vida útil positiva`);
    assert.ok(p.limitingFactor);
  });
});

test('4. Post-Harvest Condensation Warning: assessCondensationRiskOnUnpack con física Magnus-Tetens', () => {
  assert.equal(typeof postHarvest.assessCondensationRiskOnUnpack, 'function');

  // Caso crítico: Sale de 4°C a empaque a 18°C / 75% HR (Pto. Rocío ~ 13.4°C > 4°C)
  const riskHigh = postHarvest.assessCondensationRiskOnUnpack(4.0, 18.0, 75.0);
  assert.equal(riskHigh.condensationRisk, true);
  assert.equal(riskHigh.badge, '🔴');
  assert.match(riskHigh.verdict, /ALTO RIESGO DE CONDENSACIÓN/);
  assert.ok(riskHigh.ambientDewPoint > 4.0);
  assert.ok(riskHigh.deltaT < 0);
  assert.match(riskHigh.recommendation, /anti-fog/i);

  // Caso seguro: Producto atemperado a 16°C en ambiente seco (18°C / 50% HR, Pto. Rocío ~ 7.4°C < 16°C)
  const riskSafe = postHarvest.assessCondensationRiskOnUnpack(16.0, 18.0, 50.0);
  assert.equal(riskSafe.condensationRisk, false);
  assert.equal(riskSafe.badge, '🟢');
  assert.match(riskSafe.verdict, /SEGURO/);
  assert.ok(riskSafe.deltaT > 0);

  // Valores límite / numéricos string
  const riskStr = postHarvest.assessCondensationRiskOnUnpack('4', '18', '75');
  assert.equal(riskStr.condensationRisk, true);
});

test('5. Co-Cultivation Advisor: optimizeChamberSetpoints y Ley del Mínimo de Liebig', () => {
  assert.equal(typeof coCultivation.optimizeChamberSetpoints, 'function');

  // Monocultivo
  const mono = coCultivation.optimizeChamberSetpoints(['orellana_gris']);
  assert.equal(mono.groupScore, 100);
  assert.equal(mono.setpoints.tempC, 18.0);
  assert.equal(mono.bottlenecks.length, 0);

  // Co-cultivo compatible (Orellana Gris + Orellana Blanca)
  const duo = coCultivation.optimizeChamberSetpoints(['orellana_gris', 'orellana_blanca']);
  assert.ok(duo.groupScore >= 80);
  assert.ok(duo.setpoints.tempC >= 15 && duo.setpoints.tempC <= 20);
  assert.ok(duo.setpoints.rhPct >= 80 && duo.setpoints.rhPct <= 95);
  assert.ok(duo.setpoints.co2Ppm > 0);

  // Co-cultivo con nombres en español con tildes (Melena de León + Orellana Rosa)
  const duoDisplay = coCultivation.optimizeChamberSetpoints(['Melena de León', 'Orellana Rosa']);
  assert.ok(duoDisplay !== null, 'Debe resolver especies con nombres en español y tildes');
  assert.ok(duoDisplay.groupScore <= 80, 'Incompatibilidad debe reflejarse en score');
  assert.ok(duoDisplay.penalties.length > 0 || duoDisplay.bottlenecks.length > 0);

  // Incompatibilidad térmica extrema (Enoki criófilo 5-12°C vs Orellana Rosa termófila 20-28°C)
  const extremeThermal = coCultivation.optimizeChamberSetpoints(['Enoki', 'Orellana Rosa']);
  assert.ok(extremeThermal.groupScore < 50, 'Enoki y Orellana Rosa deben ser incompatibles');
  assert.match(extremeThermal.verdict, /ALTO RIESGO DE MERMA/);

  // Deduplicación de claves: múltiples lotes de la misma especie no se tratan como co-cultivo
  const dedup = coCultivation.optimizeChamberSetpoints(['orellana_gris', 'orellana_gris', 'orellana_gris']);
  assert.equal(dedup.groupScore, 100);
  assert.match(dedup.verdict, /MONOCULTIVO/);

  // Co-cultivo conflictivo (Orellana FAE alto <800 ppm vs Reishi alto CO2 >2000 ppm)
  const conflict = coCultivation.optimizeChamberSetpoints(['orellana_gris', 'reishi']);
  assert.ok(conflict.groupScore < 70, 'Conflicto de ventilación debe reducir compatibilidad');
  assert.ok(conflict.penalties.some(p => /ventilación|CO2/i.test(p)));

  // Entrada vacía
  assert.equal(coCultivation.optimizeChamberSetpoints([]), null);
});

test('6. Verificación de Cableado UI y Atributos de Trazabilidad en JSX y Bundle JS', () => {
  // 1. Dynamic harvest projection in Batch Detail
  assert.match(jsx, /data-testid="batch-harvest-forecast"/);
  assert.match(jsx, /Pronóstico Dinámico de Cosechas & Oleadas/);
  assert.match(jsx, /flushesForecast\.remainingExpectedKg/);
  assert.match(jsx, /flushesForecast\.thermalFactor/);
  assert.match(js, /"data-testid":\s*"batch-harvest-forecast"/);

  // 2. Post-Harvest Shelf-Life & Condensation Warning in Harvest Modal
  assert.match(jsx, /data-testid="harvest-postharvest-advisor"/);
  assert.match(jsx, /Poscosecha & Cadena de Frío/);
  assert.match(jsx, /postHarvestCondensation\.verdict/);
  assert.match(jsx, /postHarvestCondensation\.recommendation/);
  assert.match(js, /"data-testid":\s*"harvest-postharvest-advisor"/);

  // 3. Co-Cultivation Advisor in Fruiting Room Cockpit
  assert.match(jsx, /data-testid="fruiting-cocultivation-advisor"/);
  assert.match(jsx, /Asesor de Co-Cultivo Multiespecie/);
  assert.match(jsx, /coCultRoomOpt\.setpoints/);
  assert.match(js, /"data-testid":\s*"fruiting-cocultivation-advisor"/);
  // DS-2026 accessible button target check
  assert.match(jsx, /minHeight:\s*44/);

  // 4. Co-Cultivation Advisor in Room Assignment (prodLaunchModal)
  assert.match(jsx, /data-testid="room-assignment-cocultivation-advisor"/);
  assert.match(jsx, /coCultAssignOpt\.setpoints/);
  assert.match(js, /"data-testid":\s*"room-assignment-cocultivation-advisor"/);

  // 5. BatchSheetModal export and render
  assert.match(jsx, /BatchSheetModal/);
  assert.match(js, /BatchSheetModal/);
  assert.match(jsx, /showBatchSheetModal/);
});
