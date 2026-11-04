'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const S = require('./scoring');
const an = {eb:100, sp:{eb_baseline:60, eb_optimal:130}};

test('weak history cannot tighten the low-confidence prediction band', () => {
  const base = S.scoreRecipe(an).uncertainty.eb;
  for (const sd of [undefined, 0, 0.1]) {
    const eb = S.scoreRecipe(an, {historyCalibration:{n:1, meanEB:100, similarity:0.01, sd}}).uncertainty.eb;
    assert.equal(eb.confidence, 'low');
    assert.ok(eb.low <= base.low && eb.high >= base.high);
  }
});

test('recent similar lots alone do not certify a validated prediction band', () => {
  const history = {n:40, recentN:40, similarity:1, meanEB:100, sd:0};
  const result = S.scoreRecipe(an, {historyCalibration:history});
  assert.equal(result.uncertainty.eb.confidence, 'medium');
  assert.equal(result.uncertainty.eb.validation, 'unvalidated');
  assert.match(result.uncertainty.eb.note, /validación independiente/);
  assert.equal(result.calibration.eb, 100);
});

globalThis.SetasScoring = S;
globalThis.finiteEB = require('./historical-calibration').finiteEB;
const {recipeEBForecast, storedPredictionError} = require('./test-support/jsx-extract').extractConsts(['blendEBWithHistory', 'recipeEBForecast', 'storedPredictionError']);

test('historically adjusted central EB and its band share the same inputs', () => {
  const history = {n:8, avg:300, meanEB:300, weight:0.6, similarity:1, sd:0};
  const forecast = recipeEBForecast(an, history);
  assert.equal(forecast.value, 220);
  assert.ok(forecast.low <= forecast.central && forecast.central <= forecast.high);
  assert.equal(forecast.history, history);
  assert.equal(forecast.confidence, 'medium');
  const base = recipeEBForecast(an, {n:8, avg:300, weight:0, similarity:0});
  assert.equal(base.value, an.eb);
  assert.equal(base.history, null);
  assert.equal(base.source, 'theoretical');
});

test('stored prediction error counts only valid prediction/outcome pairs', () => {
  assert.deepEqual(storedPredictionError([{eb:80,ebReal:100},{eb:100,ebReal:90},{eb:'',ebReal:80}]), {mae:15,n:2});
  assert.equal(storedPredictionError([{eb:null,ebReal:80}]), null);
});

test('prediction confidence correction preserves legacy scenario ranking coefficients', () => {
  const P = require('./perito-scenarios');
  const cases = [[null,50],[{n:1,similarity:0.01},50],[{n:3,similarity:0.6},65],
    [{n:25,recentN:19,similarity:0.9},65],[{n:25,recentN:20,similarity:0.9},78]];
  for (const [h, expected] of cases) {
    const evaluation = P.evaluateScenario({recipe:[{id:'base',p:100}],ingredients:[{id:'base',role:'base'}],
      context:{historyCalibration:h && {...h,meanEB:100,sd:0}}, analyze:()=>({...an,tot:100}),
      score:S.scoreRecipe,profile:P.resolveProfile()});
    assert.equal(evaluation.confidenceScore,expected);
    assert.notEqual(evaluation.uncertainty.eb.confidence,'high');
  }
});
