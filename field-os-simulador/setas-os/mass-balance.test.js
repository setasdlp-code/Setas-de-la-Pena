'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const RV = require('./mass-balance.js');

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
  globalThis.SetasMassBalance = RV;
  const { isMassBalanced } = extractConsts(['SetasMassBalanceApi', 'MASS_BALANCE_TOL', 'isMassBalanced']);
  assert.equal(isMassBalanced({ tot: 100.5 }), true);
  assert.equal(isMassBalanced({ tot: 100.6 }), false);
});

test('balance distributes rounding across many rows and preserves locks exactly', () => {
  const rows=[{id:'fixed',p:13.3333},...Array.from({length:17},(_,i)=>({id:`i${i}`,p:1}))];
  const original=JSON.stringify(rows);
  for(const mode of ['equal','proportional']){
    const result=RV.balanceRecipe(rows,{lockedIds:['fixed'],mode});
    assert.equal(result.ok,true);
    assert.equal(result.recipe[0].p,13.3333);
    assert.ok(Math.abs(RV.totalPct(result.recipe)-100)<1e-6);
    assert.ok(result.recipe.every(r=>r.p>=0));
    assert.deepEqual(result,RV.balanceRecipe(rows,{lockedIds:['fixed'],mode}));
  }
  assert.equal(JSON.stringify(rows),original);
});

test('impossible locks and last-ingredient excess return an actionable error without altering inputs', () => {
  for(const [rows,options] of [
    [[{id:'a',p:80},{id:'b',p:40},{id:'c',p:10}],{lockedIds:['a','b']}],
    [[{id:'a',p:80},{id:'b',p:10}],{lockedIds:['a','b']}],
    [[{id:'a',p:110},{id:'b',p:10}],{mode:'last'}],
    [[{id:'a',p:-1},{id:'b',p:20}],{}],
    [[{id:'a',p:50},{id:'a',p:50}],{}],
  ]){
    const result=RV.balanceRecipe(rows,options);
    assert.equal(result.ok,false);
    assert.equal(result.recipe,rows);
    assert.ok(result.message.length>20);
  }
});

test('zero free shares, last mode and sub-hundredth remainder still close the balance', () => {
  for(const [rows,options] of [
    [[{id:'fixed',p:99.999},{id:'b',p:0}],{lockedIds:['fixed']}],
    [[{id:'a',p:0},{id:'b',p:0},{id:'c',p:0}],{}],
    [[{id:'a',p:35},{id:'b',p:10}],{mode:'last'}],
  ]){
    const result=RV.balanceRecipe(rows,options);
    assert.equal(result.ok,true);
    assert.ok(Math.abs(RV.totalPct(result.recipe)-100)<1e-6);
    assert.ok(result.recipe.every(r=>r.p>=0));
  }
});
