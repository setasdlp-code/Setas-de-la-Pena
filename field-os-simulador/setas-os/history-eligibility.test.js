'use strict';
// Synthetic, in-memory fixtures only. Never loaded by the operational app.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const H = require('./historical-calibration.js');
const recipe = [{id:'paja_trigo', p:100}];
const trial = (ebReal, extra={}) => ({id:'T1', sKey:'p_ostreatus_gris', recipe, ebReal, outcome:{status:ebReal === 0 ? 'completed-zero-yield' : 'completed-success', verified:true}, ...extra});
const lote = (extra={}) => ({id:'B1', peseSeco:2, estado:'fructificacion', recipeRef:{sKey:'p_ostreatus_gris', recipe}, ...extra});
const harvest = {id:'H1', loteId:'B1', pesoFresco:1000};
test('regression: null, blank and non-finite EB never become calibrated zero', () => {
  for (const value of [null, undefined, '', '  ', NaN, Infinity, -Infinity, 'Infinity', false, [], '80kg']) {
    assert.equal(H.weightedCalibration(recipe, [trial(value)], () => 0), null, String(value));
  }
});
test('regression: a partial harvest cannot enter final bitacoraEBRows', () => {
  assert.deepEqual(H.bitacoraEBRows([lote()], [harvest]), []);
});
test('only verified final states calibrate; zero is distinct from missing', () => {
  for (const extra of [{outcome:undefined}, {outcome:{status:'partial',verified:true}}, {outcome:{status:'completed-success',verified:false}}]) {
    assert.equal(H.weightedCalibration(recipe, [trial(80,extra)], () => 0), null);
  }
  assert.equal(H.weightedCalibration(recipe,[trial(0)],()=>0).meanEB,0);
  assert.equal(H.weightedCalibration(recipe,[trial(80)],()=>0).meanEB,80);
  assert.equal(H.weightedCalibration(recipe,[trial(0,{outcome:{status:'completed-success',verified:true}})],()=>0),null);
});
test('batch completion has canonical precedence and explicit zero requires verification', () => {
  assert.equal(H.bitacoraEBRows([lote({estado:'completado'})],[harvest])[0].be,50);
  assert.deepEqual(H.bitacoraEBRows([lote({estado:'completado',lifecycleState:'fruiting'})],[harvest]),[]);
  assert.equal(H.bitacoraEBRows([lote({lifecycleState:'closed'})],[harvest])[0].be,50);
  assert.deepEqual(H.bitacoraEBRows([lote({estado:'completado'})],[]),[]);
  const zero=lote({estado:'completado',outcome:{status:'completed-zero-yield',verified:true}});
  assert.equal(H.bitacoraEBRows([zero],[])[0].be,0);
  assert.deepEqual(H.bitacoraEBRows([{...zero,estado:'fructificacion'}],[]),[]);
});
test('partial and missing observations remain available, with counts and reasons', () => {
  const rows=H.bitacoraAsTrialRows('p_ostreatus_gris',[lote(),lote({id:'B2'})],[harvest],{includeIncomplete:true});
  const report=H.assessHistory(rows);
  assert.equal(report.total,2);
  assert.equal(report.eligibleN,0);
  assert.deepEqual(report.observations.map(x=>x.status),['partial','missing']);
  assert.equal(report.exclusionReasons['incomplete-outcome'],1);
  assert.equal(report.exclusionReasons['missing-or-invalid-eb'],1);
  assert.equal(rows[0].ebReal,50);
  assert.equal(H.weightedCalibration(recipe,rows,()=>0),null);
});
test('duplicates cannot inflate sample size across sources; conflicts fail closed', () => {
  const a=trial(80,{loteId:'B1'});
  const b=trial(80,{id:'other',batchId:'B1',source:'bitacora'});
  const h=H.weightedCalibration(recipe,[a,a,b],()=>0);
  assert.equal(h.n,1);
  assert.equal(h.eligibility.exclusionReasons['duplicate-source-record'],2);
  assert.equal(H.weightedCalibration(recipe,[a,{...b,ebReal:90}],()=>0),null);
  assert.equal(H.weightedCalibration(recipe,[trial(80,{id:null})],()=>0),null);
});
test('duplicate batch and harvest copies do not multiply EB or counts', () => {
  const batch=lote({estado:'completado'});
  const rows=H.bitacoraEBRows([batch,batch],[harvest,harvest]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].be,50);
  assert.deepEqual(H.bitacoraEBRows([batch],[harvest,{...harvest,pesoFresco:2000}]),[]);
  for(const pesoFresco of [null,'',Infinity,'100g',-1]) {
    assert.deepEqual(H.bitacoraEBRows([batch],[{...harvest,pesoFresco}]),[]);
  }
});
test('historicalEB applies the same guard and deduplication as weightedCalibration', () => {
  const a={...trial(80),be:80};
  assert.equal(H.historicalEB(a.sKey,[a,a],recipe).n,1);
  assert.equal(H.historicalEB(a.sKey,[{...a,be:null}],recipe).n,0);
  assert.equal(H.historicalEB(a.sKey,[{...a,outcome:undefined}],recipe).n,0);
});
test('empty-history and excluded-only scoring stay deterministic and theoretical', () => {
  const scoring=require('./scoring.js');
  const an={eb:80,cn:45,n:1,ph:6,moisture:65,cost:1000,tot:100};
  const empty=H.weightedCalibration(recipe,[],()=>0);
  const excluded=H.weightedCalibration(recipe,[trial(null)],()=>0);
  assert.equal(empty,null);
  assert.deepEqual(scoring.scoreRecipe(an,{recipe,historyCalibration:empty}),scoring.scoreRecipe(an,{recipe,historyCalibration:excluded}));
  assert.deepEqual(H.historicalEB('p_ostreatus_gris',[],recipe),H.historicalEB('p_ostreatus_gris',[],recipe));
});
test('contradictory duplicate lifecycle cannot leave a stale final result eligible', () => {
 const closed=lote({estado:'completado'});
 const partial={...closed,lifecycleState:'fruiting'};
 for(const rows of [[closed,partial],[partial,closed]]) {
   assert.deepEqual(H.bitacoraEBRows(rows,[harvest]),[]);
   const report=H.assessHistory(H.bitacoraObservations(rows,[harvest]),'be');
   assert.equal(report.exclusionReasons['conflicting-source-records'],2);
 }
});
