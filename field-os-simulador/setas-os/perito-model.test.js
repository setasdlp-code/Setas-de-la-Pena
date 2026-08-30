'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreRecipe } = require('./scoring.js');

const SP = {
  cn_optimal: { min: 25, max: 50, ideal: 35 },
  n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 },
  ph_optimal: { min: 6.0, max: 7.5 },
  eb_baseline: 90,
  eb_optimal: 130,
  supplementation_max: 20,
};

const baseAn = (overrides = {}) => ({
  sp: SP,
  cn: 35,
  avgN: 1.4,
  avgPh: 6.7,
  eb: 110,
  cost: 1000,
  tot: 100,
  suppP: 10,
  cafeP: 0,
  densaP: 0,
  airP: 20,
  trichoderma: false,
  incompat: [],
  ...overrides,
});

const baseCtx = (overrides = {}) => ({
  treatment: { col: 'thermal' },
  stockIds: new Set(),
  recipe: [{ id: 'base', p: 80 }, { id: 'supp', p: 20 }],
  ...overrides,
});

test('separa seguridad, aptitud agronómica y economía', () => {
  const r = scoreRecipe(baseAn(), baseCtx());
  assert.ok(r.dimensions.safety.score >= 0);
  assert.ok(r.dimensions.agronomy.score >= 0);
  assert.ok(r.dimensions.economy.score >= 0);
  assert.equal(typeof r.dimensions.safety.status, 'string');
});

test('pH se reporta como tendencia de confianza baja, no como medición', () => {
  const r = scoreRecipe(baseAn({ avgPh: 5.5 }), baseCtx());
  assert.equal(r.uncertainty.ph.trend, 'tendencia ácida');
  assert.equal(r.uncertainty.ph.confidence, 'low');
  assert.equal(r.provenance.ph.requiresMeasurement, true);
});

test('EB con historia comparable gana confianza y se mezcla con datos reales', () => {
  const r = scoreRecipe(baseAn({ eb: 100 }), baseCtx({
    historyCalibration: { n: 12, meanEB: 140, sd: 8, similarity: 0.9 },
  }));
  assert.equal(r.calibration.source, 'history-blend');
  assert.ok(r.calibration.eb > 100 && r.calibration.eb < 140);
  // ADR-0007: n=12 ya no basta para 'high' — se requieren 20 lotes RECIENTES
  // (recentN), no solo 12 filas alguna vez registradas. Sin recentN en el
  // fixture, la ausencia de dato de recencia se trata como 0, no como 12.
  assert.equal(r.uncertainty.eb.confidence, 'medium');
  assert.equal(r.provenance.eb.sampleSize, 12);
});

test('ADR-0007: EB solo llega a high con n>=20 lotes recientes, no con n>=8 histórico', () => {
  const insufficientRecent = scoreRecipe(baseAn({ eb: 100 }), baseCtx({
    historyCalibration: { n: 25, recentN: 19, meanEB: 140, sd: 8, similarity: 0.9 },
  }));
  assert.equal(insufficientRecent.uncertainty.eb.confidence, 'medium',
    '19 lotes recientes es insuficiente aunque el pool total (n) sea grande');

  const sufficientRecent = scoreRecipe(baseAn({ eb: 100 }), baseCtx({
    historyCalibration: { n: 25, recentN: 20, meanEB: 140, sd: 8, similarity: 0.9 },
  }));
  assert.equal(sufficientRecent.uncertainty.eb.confidence, 'high',
    '20 lotes recientes con similitud >=0.8 sí alcanza high');
});

test('stock cuantitativo detecta cantidad insuficiente aunque el ID exista', () => {
  const r = scoreRecipe(baseAn(), baseCtx({
    batchDryKg: 10,
    stockKgById: { base: 8, supp: 0.2 },
    ingredientMoistureById: { base: 0, supp: 0 },
  }));
  assert.equal(r.stockDetail.mode, 'quantity');
  assert.ok(r.breakdown.stock < 100);
  assert.ok(r.stockDetail.limiting.some((x) => x.id === 'supp'));
});

test('riesgo inferido no se presenta como contaminación observada', () => {
  const r = scoreRecipe(baseAn({ trichoderma: true }), baseCtx());
  assert.equal(r.uncertainty.risk.observed, false);
  assert.equal(r.provenance.risk.type, 'rule-inference');
  assert.equal(r.dimensions.safety.status, 'hold');
});

// ADR-0007 (Escala C — provenance/derivación): la confianza de `stock` califica
// CÓMO se derivó el puntaje de stock, no cuánta evidencia lo respalda. El caso
// 'unconstrained' (sin datos de stock) y 'none' (receta vacía) reportaban 'high'
// porque el ternario original solo distinguía 'presence' del resto: la ausencia
// de datos se leía como confianza máxima.
test('ADR-0007 Escala C: sin datos de stock la confianza es low, no high', () => {
  const r = scoreRecipe(baseAn(), baseCtx({ stockIds: new Set() }));
  assert.equal(r.provenance.stock.confidence, 'low');
  assert.equal(r.provenance.stock.type, 'no-stock-data');
});

test('ADR-0007 Escala C: receta vacía no reporta confianza de stock alta', () => {
  const r = scoreRecipe(baseAn(), baseCtx({ recipe: [], stockIds: new Set() }));
  assert.equal(r.provenance.stock.confidence, 'low');
  assert.equal(r.provenance.stock.type, 'no-stock-data');
});

test('ADR-0007 Escala C: solo presencia de IDs sigue siendo low/presence-only', () => {
  const r = scoreRecipe(baseAn(), baseCtx({ stockIds: new Set(['base']) }));
  assert.equal(r.provenance.stock.confidence, 'low');
  assert.equal(r.provenance.stock.type, 'presence-only');
});

test('ADR-0007 Escala C: cantidades reales sí justifican high/quantity-aware', () => {
  const r = scoreRecipe(baseAn(), baseCtx({
    stockCoverageById: { base: 1, supp: 1 },
  }));
  assert.equal(r.provenance.stock.confidence, 'high');
  assert.equal(r.provenance.stock.type, 'quantity-aware');
});
