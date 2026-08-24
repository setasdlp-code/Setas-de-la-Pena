'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  INGREDIENT_MARKET_COSTS,
  validateMarketCosts,
  optimizerCostFor,
} = require('./ingredient-market-costs.js');

test('market cost registry is internally consistent', () => {
  assert.deepEqual(validateMarketCosts(), []);
});

test('palm kernel meal has a verified canonical market price', () => {
  const x = INGREDIENT_MARKET_COSTS.torta_palmiste;
  assert.equal(x.status, 'verified_market_price');
  assert.equal(x.canonicalCopKg, 1400);
  assert.equal(x.optimizerEligible, true);
  assert.equal(optimizerCostFor('torta_palmiste'), 1400);
});

test('oat hull planning proxy never enters optimizer economics', () => {
  const x = INGREDIENT_MARKET_COSTS.cascarilla_avena;
  assert.equal(x.status, 'planning_proxy');
  assert.equal(x.planningCopKg, 1200);
  assert.equal(x.canonicalCopKg, null);
  assert.equal(x.optimizerEligible, false);
  assert.equal(optimizerCostFor('cascarilla_avena'), null);
});

test('ambiguous corn gluten identity is not canonical', () => {
  const x = INGREDIENT_MARKET_COSTS.corn_gluten_feed;
  assert.equal(x.status, 'quote_required');
  assert.equal(x.canonicalCopKg, null);
  assert.equal(x.optimizerEligible, false);
});

test('fresh waste streams require full logistics/drying cost', () => {
  for (const id of ['bagazo_zanahoria','residuo_pina','bagazo_manzana','orujo_naranja']) {
    const x = INGREDIENT_MARKET_COSTS[id];
    assert.equal(x.canonicalCopKg, null);
    assert.match(x.costBasis, /transport/);
    assert.match(x.costBasis, /drying/);
  }
});
