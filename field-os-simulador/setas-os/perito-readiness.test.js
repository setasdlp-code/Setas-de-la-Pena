'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assessReadiness } = require('./perito-readiness.js');
const snapshot = () => ({ inputRevision: 1, species: { key: 'p_ostreatus_gris' }, recipe: [{id:'base',p:100}], batch: {wetKg:10,targetMoisturePct:60}, inventory: {available:true,stockKgById:{base:10}}, ingredientMoistureById:{base:20}, ingredients:[{id:'base',name:'Base'}], processCapabilities:null, approval:null });
const model = {dimensions:{safety:{status:'approved'}},confidence:'low'};
const check=(result,id)=>result.checks.find(c=>c.id===id);
test('favorable model never substitutes for process verification or human approval',()=>{
 const result=assessReadiness(snapshot(),model,null);
 assert.equal(result.status,'verify');
 assert.equal(check(result,'process').status,'unknown');
 assert.equal(check(result,'approval').status,'unknown');
 assert.equal(check(result,'stock').status,'ready');
});
test('quantity shortage uses wet/dry conversion and responds to batch size',()=>{
 const input=snapshot(); input.batch.wetKg=30;
 const result=assessReadiness(input,model,null);
 assert.equal(result.status,'blocked');
 assert.equal(check(result,'stock').status,'blocked');
 assert.equal(result.stock.limiting[0].requiredWetKg,15);
 assert.equal(result.stock.limiting[0].missingWetKg,5);
 assert.equal(assessReadiness(snapshot(),model,null).stock.limiting.length,0);
});
test('missing moisture, inventory, or batch remains unknown, never zero or sufficient',()=>{
 for(const change of [s=>s.ingredientMoistureById.base=null,s=>s.batch.wetKg=null,s=>s.inventory.available=false,s=>s.batch.targetMoisturePct=null]){
  const input=snapshot();change(input);
  const result=assessReadiness(input,model,null);
  assert.equal(check(result,'stock').status,'unknown');
  assert.equal(result.stock,null);
 }
});
test('composition rejects invalid totals, duplicates and unknown ingredients',()=>{
 for(const recipe of [[{id:'base',p:90}],[{id:'base',p:50},{id:'base',p:50}],[{id:'absent',p:100}],[{id:'base',p:NaN}]]){
  const input=snapshot();input.recipe=recipe;
  assert.equal(check(assessReadiness(input,model,null),'composition').status,'blocked');
 }
});
test('evidence distinguishes comparable history from extrapolation',()=>{
 assert.equal(check(assessReadiness(snapshot(),model,{n:3,matched:false}),'evidence').status,'unknown');
 assert.equal(check(assessReadiness(snapshot(),model,{n:3,matched:true}),'evidence').status,'ready');
});
test('assessment is deterministic, preserves inputs and identifies evaluated revision',()=>{
 const input=snapshot();const before=JSON.stringify(input);
 const result=assessReadiness(input,model,null);
 assert.equal(result.inputRevision,1);
 assert.deepEqual(result,assessReadiness(input,model,null));
 assert.equal(JSON.stringify(input),before);
});
