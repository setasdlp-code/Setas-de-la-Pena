'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const RV = require('./recipe-version.js');

test('MASS_BALANCE_TOLERANCE_PP es 0.5', () => assert.equal(RV.MASS_BALANCE_TOLERANCE_PP, 0.5));
test('totalPct acepta p, pct y strings', () => {
  assert.equal(RV.totalPct([{ p: 60 }, { pct: '30' }, { p: '10.0' }]), 100);
});
test('isMassBalancedTotal: dentro de ±0.5 inclusive', () => {
  assert.equal(RV.isMassBalancedTotal(100.5), true);
  assert.equal(RV.isMassBalancedTotal(99.5), true);
  assert.equal(RV.isMassBalancedTotal(100.51), false);
  assert.equal(RV.isMassBalancedTotal(NaN), false);
});

test('el JSX usa la tolerancia del módulo', () => {
  const { extractConsts } = require('./test-support/jsx-extract.js');
  globalThis.SetasRecipeVersion = RV;
  const { isMassBalanced } = extractConsts(['SetasRecipeVersionApi', 'MASS_BALANCE_TOL', 'isMassBalanced']);
  assert.equal(isMassBalanced({ tot: 100.5 }), true);
  assert.equal(isMassBalanced({ tot: 100.6 }), false);
});
