'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const scoring = require('./scoring.js');
const actuators = require('./actuator-controller.js');
const calibration = require('./historical-calibration.js');
const optimizer = require('./recipe-optimizer.js');
const aiLogic = require('./firebase/ai-logic.js');
const peritoScenarios = require('./perito-scenarios.js');
const peritoEconomy = require('./perito-economy.js');
const climateMath = require('./climate-math.js');
const sterilization = require('./sterilization-kinetics.js');
const postHarvest = require('./post-harvest-engine.js');
const flushForecast = require('./flush-forecast-engine.js');

// ── 1. SCORING ENGINE ROBUSTNESS & LIEBIG INVARIANTS ──────────────────
test('scoring: scoreRecipe maneja an null, undefined o vacio sin lanzar excepcion', () => {
  const rNull = scoring.scoreRecipe(null);
  assert.equal(rNull.score, 0);
  assert.equal(rNull.status, 'critical');
  assert.equal(rNull.dimensions.safety.status, 'hold');

  const rUndefined = scoring.scoreRecipe(undefined);
  assert.equal(rUndefined.score, 0);

  const rEmpty = scoring.scoreRecipe({});
  assert.equal(rEmpty.score, 0);
  assert.equal(rEmpty.status, 'critical');
});

test('scoring: detecta inanicion por Ley del Minimo de Liebig en Nitrogeno y retiene viabilidad', () => {
  const sp = {
    name: 'Orellana Gris',
    cn_optimal: { min: 25, max: 50, ideal: 35 },
    n_optimal: { min: 1.0, max: 2.0, ideal: 1.4 },
    ph_optimal: { min: 6.0, max: 7.5 },
    eb_baseline: 90,
    eb_optimal: 130,
    supplementation_max: 20,
  };

  // N = 0.25% está severamente por debajo del 40% del mínimo (0.4 * 1.0 = 0.4%)
  const starvedAn = {
    sp,
    cn: 160,
    avgN: 0.25,
    avgPh: 6.5,
    eb: 30,
    cost: 500,
    tot: 100,
    suppP: 0,
    trichoderma: false,
    incompat: [],
  };

  const result = scoring.scoreRecipe(starvedAn, { treatment: { col: 'thermal' } });
  assert.equal(result.dimensions.safety.status, 'hold', 'Inanición extrema de N debe bloquear viabilidad (hold)');
  assert.ok(result.dimensions.agronomy.score < 50, 'Agronomía debe ser deficiente');
});

test('scoring: scoreYield y scoreRisk no propagan NaN con campos faltantes o no-finitos', () => {
  const anWithNaN = {
    sp: {
      name: 'Test Spp',
      cn_optimal: { min: 25, max: 50, ideal: 35 },
      n_optimal: { min: 1.0, max: 2.0, ideal: 1.4 },
      eb_baseline: NaN,
      eb_optimal: NaN,
      supplementation_max: 20
    },
    cn: NaN,
    avgN: NaN,
    avgPh: NaN,
    eb: NaN,
    suppP: undefined,
    cafeP: undefined,
    densaP: undefined,
    airP: undefined,
    tot: NaN,
    cost: NaN
  };

  const res = scoring.scoreRecipe(anWithNaN, {});
  assert.ok(Number.isFinite(res.score), `El score debe ser finito, recibido: ${res.score}`);
  assert.ok(Number.isFinite(res.breakdown.nutrition));
  assert.ok(Number.isFinite(res.breakdown.yield));
  assert.ok(Number.isFinite(res.breakdown.risk));
  assert.ok(Number.isFinite(res.breakdown.cost));
});

// ── 2. ACTUATOR CONTROLLER ROBUSTNESS & DEW POINT DERIVATION ───────────
test('actuators: deriva punto de rocio automaticamente si falta en telemetria', () => {
  const now = 1000000;
  // Con temp: 18.0 y rh: 98.0, T - Tdp < 0.8°C (riesgo inminente de condensacion)
  const res = actuators.evaluateActuators({
    metrics: { temp: 18.0, rh: 98.0, co2: 600, vpd: 0.04 }, // Sin metrics.dewPoint
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'ON', lastChangeMs: now - 10000, lastOffMs: 0 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: 0 }
    },
    now
  });

  assert.equal(res.humidifier.state, 'OFF');
  assert.match(res.humidifier.reason, /Corte de seguridad anti-condensación/);
});

test('actuators: calcDewPoint calcula punto de rocio con precision psicrometrica', () => {
  const dp = actuators.calcDewPoint(20, 80);
  // A 20°C y 80% HR, el punto de rocío es ~16.4°C
  assert.ok(dp >= 16.0 && dp <= 16.8, `Punto de rocío esperado ~16.4, recibido: ${dp}`);

  assert.equal(actuators.calcDewPoint(NaN, 80), null);
  assert.equal(actuators.calcDewPoint(20, -5), null);
  assert.equal(actuators.calcDewPoint(20, 105), null);
});

test('actuators: tolera targets incompletos usando defaults seguros', () => {
  const now = 1000000;
  const res = actuators.evaluateActuators({
    metrics: { temp: 17.5, rh: 80.0, co2: 1200 },
    targets: { rh_pct: { min: 85 } }, // Sin max ni target, sin co2_ppm
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: 0, lastOffMs: now - 150000 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: now - 100000 }
    },
    now
  });

  assert.equal(res.humidifier.state, 'ON');
  assert.equal(res.fae.state, 'ON'); // CO2=1200 > default max 900
});

test('actuators: resetea pulseStartMs a 0 cuando FAE se apaga', () => {
  const now = 1000000;
  const res = actuators.evaluateActuators({
    metrics: { temp: 17.5, rh: 88.0, co2: 700 },
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: 0, lastOffMs: 0 },
      fae: { state: 'ON', pulseStartMs: now - 40000, lastPulseEndMs: 0 }
    },
    now
  });

  assert.equal(res.fae.state, 'OFF');
  assert.equal(res.fae.pulseStartMs, 0, 'pulseStartMs debe resetear a 0 al terminar pulso');
  assert.equal(res.fae.lastPulseEndMs, now);
});

// ── 3. HISTORICAL CALIBRATION ROBUSTNESS ──────────────────────────────
test('calibration: bitacoraEBRows acepta pesoSeco o peseSeco y descarta BE imposible', () => {
  const lotes = [
    { id: 'L1', codigo: 'LOT-1', recipeRef: { sKey: 'p_ostreatus_gris', recipe: [] }, pesoSeco: 2.0 },
    { id: 'L2', codigo: 'LOT-2', recipeRef: { sKey: 'p_ostreatus_gris', recipe: [] }, peseSeco: 2.5 },
    { id: 'L_BAD', codigo: 'LOT-BAD', recipeRef: { sKey: 'p_ostreatus_gris', recipe: [] }, pesoSeco: 1.0 }
  ];
  const cosechas = [
    { loteId: 'L1', pesoFresco: 1800 }, // 1.8 kg fresco / 2.0 kg seco = 90% BE
    { loteId: 'L2', pesoFresco: 2250 }, // 2.25 kg fresco / 2.5 kg seco = 90% BE
    { loteId: 'L_BAD', pesoFresco: 10000 } // 10.0 kg fresco / 1.0 kg seco = 1000% BE (imposible)
  ];

  const rows = calibration.bitacoraEBRows(lotes, cosechas);
  assert.equal(rows.length, 2, 'Debe aceptar L1 y L2 y descartar L_BAD');
  assert.equal(rows[0].be, 90);
  assert.equal(rows[1].be, 90);
});

test('calibration: weightedCalibration descarta filas con ebReal invalido o fuera de rango', () => {
  const rows = [
    { recipe: [{ id: 'paja_trigo', p: 80 }], ebReal: 'invalido' },
    { recipe: [{ id: 'paja_trigo', p: 80 }], ebReal: -20 },
    { recipe: [{ id: 'paja_trigo', p: 80 }], ebReal: 600 }
  ];

  const res = calibration.weightedCalibration([{ id: 'paja_trigo', p: 80 }], rows, () => 0.1);
  assert.equal(res, null, 'Debe retornar null cuando no hay filas con EB real biológicamente válido');
});

// ── 4. CO-FORMULATION LIEBIG BOTTLENECK ANALYSIS ──────────────────────
test('optimizer: analyzeCoFormulation identifica cuellos de botella de Liebig por especie', () => {
  const spp = {
    p_ostreatus_gris: {
      name: 'Orellana Gris',
      cn_optimal: { min: 25, ideal: 30, max: 38 },
      n_optimal: { min: 1.0, ideal: 1.4, max: 1.8 },
      eb_baseline: 60,
      eb_optimal: 95,
      supplementation_max: 20
    }
  };

  const ings = [
    { id: 'paja_trigo', name: 'Paja de trigo', c: 45, n: 0.4, cn: 112, ph: 7.0, dig: 6, cra: 3, role: 'base_carbono', cs: ['p_ostreatus_gris'], moisture: 10, cost: 1100 }
  ];

  // Receta de paja pura al 100% (sin suplemento N) -> N% = 0.4% < 1.0% min
  const recipe = [{ id: 'paja_trigo', p: 100 }];
  const coConfig = [{ key: 'p_ostreatus_gris', weight: 100 }];

  const res = optimizer.analyzeCoFormulation(recipe, coConfig, ings, spp);
  assert.ok(res, 'Debe retornar análisis');
  assert.ok(Array.isArray(res.bottlenecks));
  assert.ok(res.bottlenecks.some(b => b.includes('Deficiencia de Nitrógeno (Ley de Liebig)')), 'Debe advertir deficiencia de Liebig');
});

// ── 5. AI LOGIC & ROBUST JSON EXTRACTION ──────────────────────────────
test('aiLogic: extractValidDiagnosisJson y extractValidInvoiceJson toleran trailing commas', () => {
  const textWithTrailingCommas = `
\`\`\`json
{
  "patogeno": "Trichoderma spp.",
  "tipo": "hongo_competidor",
  "urgencia": "alta",
  "confianza": "alta",
  "descripcion_visual": "Esporulación verde esmeralda,",
  "accion_recomendada": "Retirar bolsa sellada",
  "posible_causa": "Filtro roto o sobrecalentamiento",
  "estado_bolsa_sugerido": "contaminada",
}
\`\`\`
`;

  const diag = aiLogic.extractValidDiagnosisJson(textWithTrailingCommas);
  assert.equal(diag.patogeno, 'Trichoderma spp.');
  assert.equal(diag.estado_bolsa_sugerido, 'contaminada');

  const invoiceWithTrailingCommas = `
{
  "proveedor": "Agroinsumos La Sabana",
  "fecha": "2026-09-08",
  "items": [
    { "ingrediente": "Yeso agrícola", "kg": 50, "precio": 800, },
  ],
}
`;
  const inv = aiLogic.extractValidInvoiceJson(invoiceWithTrailingCommas);
  assert.equal(inv.proveedor, 'Agroinsumos La Sabana');
  assert.equal(inv.items.length, 1);
  assert.equal(inv.items[0].precio, 800);
});

// ── 6. EXTENDED LOGIC ENGINE BOUNDARIES & RESILIENCE ──────────────────
test('perito-scenarios: normalizeRecipe garantiza suma 100% exacta sin deriva de redondeo con 19 insumos', () => {
  // 19 insumos con proporciones idénticas (100 / 19 = 5.26315...)
  const rawRecipe = Array.from({ length: 19 }, (_, i) => ({ id: `ing_${i + 1}`, p: 1 }));
  const norm = peritoScenarios.normalizeRecipe(rawRecipe);
  assert.equal(norm.length, 19);
  const sum = norm.reduce((s, r) => s + r.p, 0);
  assert.equal(Math.round(sum * 100) / 100, 100, `Suma normalizada debe ser 100.00, recibido: ${sum}`);
});

test('perito-scenarios: noveltyScore maneja historial con entradas nulas sin NaN', () => {
  const recipe = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];
  const score = peritoScenarios.noveltyScore(recipe, [null, undefined, { recipe: null }]);
  assert.ok(Number.isFinite(score));
  assert.equal(score, 100);
});

test('perito-scenarios: generacion de semillas rechaza NaN y evita recetas corruptas', () => {
  const spp = {
    p_ostreatus: {
      name: 'Orellana',
      cn_optimal: { min: 25, ideal: 30, max: 38 },
      eb_baseline: 60,
      eb_optimal: 95,
      supplementation_max: 20
    }
  };
  // Insumo corrupto con c: NaN
  const badIngredients = [
    { id: 'bad_base', role: 'base_carbono', c: NaN, n: 0.5, cn: 50, moisture: 10 },
    { id: 'supp_1', role: 'suplemento_n', c: 45, n: 3.0, cn: 15, moisture: 10 }
  ];
  const seeds = peritoScenarios.generateStructuralSeeds({
    targetKey: 'p_ostreatus',
    ingredients: badIngredients,
    spp
  });
  // No debe producir semillas con NaN en sus porcentajes
  for (const s of seeds) {
    for (const r of s.recipe) {
      assert.ok(Number.isFinite(r.p), `Porcentaje debe ser finito, recibido: ${r.p}`);
    }
  }
});

test('optimizer: analyze previene division por cero o NaN cuando cn_optimal min === max === ideal', () => {
  const sppSinglePoint = {
    singular_spp: {
      name: 'Singular',
      cn_optimal: { min: 30, ideal: 30, max: 30 }, // max === min
      n_optimal: { min: 1.5, ideal: 1.5, max: 1.5 },
      eb_baseline: 70,
      eb_optimal: 100,
      supplementation_max: 20
    }
  };
  const ings = [
    { id: 'paja', name: 'Paja', c: 45, n: 1.5, cn: 30, moisture: 10, ph: 7.0, dig: 6, cra: 3, role: 'base_carbono' }
  ];
  const recipe = [{ id: 'paja', p: 100 }];
  const an = optimizer.analyze(recipe, 'singular_spp', ings, sppSinglePoint);
  assert.ok(an);
  assert.ok(Number.isFinite(an.eb), `EB debe ser finito, recibido: ${an.eb}`);
  assert.ok(Number.isFinite(an.ebLow));
  assert.ok(Number.isFinite(an.ebHigh));
  assert.ok(Number.isFinite(an.ebIndex));
});

test('optimizer: analyzeCoFormulation detecta extremos de pH desfavorables entre especies', () => {
  const spp = {
    acid_lover: {
      name: 'Especie Ácida',
      cn_optimal: { min: 25, ideal: 30, max: 40 },
      n_optimal: { min: 1.0, ideal: 1.4, max: 1.8 },
      ph_optimal: { min: 5.0, max: 6.0 }, // Requiere 5.0 - 6.0
      eb_baseline: 60,
      eb_optimal: 90
    }
  };
  const ings = [
    { id: 'cal', name: 'Cal', c: 1, n: 0.1, cn: 10, ph: 8.5, dig: 1, cra: 1, role: 'base_carbono' }
  ];
  const recipe = [{ id: 'cal', p: 100 }];
  const res = optimizer.analyzeCoFormulation(recipe, [{ key: 'acid_lover', weight: 100 }], ings, spp);
  assert.ok(res.bottlenecks.some(b => b.includes('Sustrato excesivamente alcalino')));
});

test('perito-economy: calculateLotEconomics con costo de sustrato 0 COP retorna 0 COP/kg en vez de null', () => {
  const res = peritoEconomy.calculateLotEconomics({
    recipe: [{ id: 'residuo_gratis', p: 100 }],
    batchWetKg: 10,
    targetMoisturePct: 60,
    moistureById: { residuo_gratis: 10 },
    priceById: { residuo_gratis: 0 }, // Subproducto donado / 0 COP
    ebLow: 80,
    ebHigh: 100,
  });

  assert.equal(res.substrateCostCOP, 0);
  assert.equal(res.priceCoveragePct, 100);
  assert.equal(res.costPerFreshKgCOP.low, 0);
  assert.equal(res.costPerFreshKgCOP.high, 0);
});

test('actuators: deriva punto de rocio y activa corte anti-condensacion aun con HR > 100% por ruido de sensor', () => {
  const now = 1000000;
  // Sensor con leve deriva reporta 100.2% HR
  const res = actuators.evaluateActuators({
    metrics: { temp: 18.0, rh: 100.2, co2: 600 },
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'ON', lastChangeMs: now - 10000, lastOffMs: 0 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: 0 }
    },
    now
  });

  assert.equal(res.humidifier.state, 'OFF');
  assert.match(res.humidifier.reason, /Corte de seguridad anti-condensación/);
});

test('calibration: weightedCalibration tolera funcion de distancia que devuelva NaN', () => {
  const rows = [
    { recipe: [{ id: 'paja_trigo', p: 80 }], ebReal: 90, fecha: '2026-05-01' },
    { recipe: [{ id: 'paja_trigo', p: 80 }], ebReal: 85, fecha: '2026-06-01' }
  ];
  // distance function returns NaN
  const res = calibration.weightedCalibration(
    [{ id: 'paja_trigo', p: 80 }],
    rows,
    () => NaN
  );

  assert.ok(res);
  assert.ok(Number.isFinite(res.meanEB));
  assert.ok(Number.isFinite(res.similarity));
  assert.ok(Number.isFinite(res.sd));
});

test('calibration: bitacoraEBRows acepta alias peso_seco y dryWeightKg', () => {
  const lotes = [
    { id: 'L_UNDERSCORE', codigo: 'LOT-U', recipeRef: { sKey: 'p_ostreatus_gris', recipe: [] }, peso_seco: 2.0 },
    { id: 'L_CAMEL', codigo: 'LOT-C', recipeRef: { sKey: 'p_ostreatus_gris', recipe: [] }, dryWeightKg: 2.5 }
  ];
  const cosechas = [
    { loteId: 'L_UNDERSCORE', pesoFresco: 1800 },
    { loteId: 'L_CAMEL', pesoFresco: 2250 }
  ];

  const rows = calibration.bitacoraEBRows(lotes, cosechas);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].be, 90);
  assert.equal(rows[1].be, 90);
});

test('aiLogic: extractValidFormulationJson parsea recomendaciones estructuradas', () => {
  const raw = `
Recomendación para optimizar formulación:
\`\`\`json
{
  "diagnostico_agronomico": "Relación C:N baja para Pleurotus ostreatus, riesgo de sobrecalentamiento",
  "meta_cn_sugerida": 32.0,
  "ajuste_suplementacion": "Reducir salvado de trigo al 10% y añadir cascarilla de arroz",
  "ingredientes_sugeridos": ["cascarilla_arroz"],
  "restricciones_sugeridas": { "maxSupp": 12 },
  "confianza": "alta"
}
\`\`\`
  `;
  const parsed = aiLogic.extractValidFormulationJson(raw);
  assert.equal(parsed.meta_cn_sugerida, 32.0);
  assert.equal(parsed.confianza, 'alta');
  assert.equal(parsed.ingredientes_sugeridos[0], 'cascarilla_arroz');
});

test('aiLogic: tryParseJsonWithCleaning prioriza bloque de codigo y tolera llaves en texto posterior', () => {
  const messyText = `
Aquí está el resultado:
\`\`\`json
{
  "patogeno": "Bacteriosis",
  "tipo": "bacteria",
  "urgencia": "media"
}
\`\`\`
Notas adicionales: favor revisar bolsas con ID {lote_123} y {lote_456}.
  `;
  const parsed = aiLogic.extractValidDiagnosisJson(messyText);
  assert.equal(parsed.patogeno, 'Bacteriosis');
  assert.equal(parsed.urgencia, 'media');
});

// ── 7. NULL PARAMETER TOLERANCE & SENSOR DRIFT DEFENSE ────────────────
test('actuators: evaluateActuators tolera argumento null sin excepcion', () => {
  const res = actuators.evaluateActuators(null);
  assert.ok(res);
  assert.ok(res.humidifier);
  assert.ok(res.fae);
  assert.equal(res.humidifier.state, 'OFF');
});

test('climateMath: calcHumidificationDemand y calcDynamicFAE toleran parametros null', () => {
  const demand = climateMath.calcHumidificationDemand(null);
  assert.ok(demand);
  assert.equal(demand.indoor.tempC, 18.0);
  assert.equal(demand.faeM3h, 25.0);

  const fae = climateMath.calcDynamicFAE(100, 'orellana_gris', null);
  assert.ok(fae);
  assert.ok(Number.isFinite(fae.requiredCfm));

  // Null inputs en lecturas sensoriales deben retornar null en vez de coerción a 0
  assert.equal(climateMath.calcAbsoluteHumidity(null, null), null);
  assert.equal(climateMath.calcWetBulbTemp(null, null), null);
  assert.equal(climateMath.calcAirEnthalpy(null, null), null);
});

test('sterilization: simulateCorePenetration, calcOptimalHoldTime y validateAutoclaveCycle toleran null', () => {
  const sim = sterilization.simulateCorePenetration(null);
  assert.ok(sim);
  assert.equal(sim.isSterile, false);

  const opt = sterilization.calcOptimalHoldTime(null);
  assert.ok(opt);
  assert.equal(opt.isAchievable, true);

  const val = sterilization.validateAutoclaveCycle(null);
  assert.ok(val);
  assert.ok(val.verdict);
});

test('postHarvest: predictShelfLife tolera options null', () => {
  const shelf = postHarvest.predictShelfLife('orellana_gris', 4, 90, null);
  assert.ok(shelf);
  assert.equal(shelf.marketableShelfLifeDays, 10);
});

test('flushForecast: calculateLotYieldAndFlushes, calculateSowingRequirement, matchWeeklyCoverage y predictSubstrateCostPerFreshKg toleran nulls', () => {
  const lotYield = flushForecast.calculateLotYieldAndFlushes(null, null);
  assert.ok(lotYield);
  assert.ok(lotYield.totalKg > 0);

  const req = flushForecast.calculateSowingRequirement(15, 'p_ostreatus_gris', null);
  assert.ok(req);
  assert.equal(req.bagsNeeded, 34);

  const coverage = flushForecast.matchWeeklyCoverage(null, null, null);
  assert.ok(coverage);
  assert.equal(coverage.totalProjectedKg, 0);

  const cost = flushForecast.predictSubstrateCostPerFreshKg(1800, 100, null);
  assert.ok(cost);
  assert.equal(cost.costSubstratePerFreshKg, 1800);
});
