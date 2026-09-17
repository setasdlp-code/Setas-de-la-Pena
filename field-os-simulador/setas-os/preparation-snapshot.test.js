'use strict';
// Synthetic arithmetic fixtures only; never loaded into operational storage.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const LP=require('./launch-plan.js');
const base={recipe:[{id:'a',p:80},{id:'b',p:20}],lockedIds:['a'],speciesKey:'test',bags:10,kgPerBag:1,moistureTarget:60,scaleG:0.1,spawnPct:8,ingredients:[{id:'a',name:'A',moisture:10},{id:'b',name:'B',moisture:0}]};
test('one snapshot carries dry percentages, measured provenance, wet weights, water and spawn basis',()=>{
 const before=LP.buildPreparationSnapshot(base);
 const after=LP.buildPreparationSnapshot({...base,moistureOverrides:{a:20}});
 assert.deepEqual(after.recipe,before.recipe);assert.equal(after.recipe[0].locked,true);
 assert.equal(before.items[0].moisture.source,'catalog-estimate');assert.equal(after.items[0].moisture.source,'operator-measured');
 assert.equal(after.items[0].asReceivedKg,4);assert.equal(after.totals.waterToAddKg,5.2);
 assert.ok(after.items[0].asReceivedKg>before.items[0].asReceivedKg);assert.ok(after.totals.waterToAddKg<before.totals.waterToAddKg);
 assert.ok(Math.abs(after.totals.asReceivedKg+after.totals.waterToAddKg-after.totals.preparedWetKg)<1e-8);
 assert.equal(after.spawn.basis,'target-wet-substrate-excluding-spawn');assert.equal(after.spawn.kg,0.8);
 assert.notEqual(before.revision,after.revision);assert.equal(LP.isPreparationCurrent(before,after),false);
 const plan=LP.buildLaunchPlan({preparation:after,ingredients:base.ingredients});
 assert.equal(plan.items[0].asReceivedKg,4);assert.equal(plan.shortfalls[0].needed,4);assert.equal(plan.totals.waterToAddKg,5.2);
 const {lote}=LP.buildLoteRecords({form:{numBolsas:999,pesoHumedo:99,humedad:99},plan,now:1});
 assert.equal(lote.numBolsas,10);assert.equal(lote.pesoHumedo,1);assert.equal(lote.peseSeco,4);assert.deepEqual(lote.preparation,after);
});
test('rounding preserves target recipe and records achieved dry mass separately',()=>{
 const p=LP.buildPreparationSnapshot({...base,bags:1,kgPerBag:1,scaleG:50});
 assert.equal(p.recipe[0].p,80);assert.equal(p.target.dryKg,0.4);
 assert.notEqual(p.totals.dryKg,p.target.dryKg);
 assert.ok(Math.abs(p.totals.preparedWetKg-p.totals.dryKg/(1-0.6))<1e-8);
 assert.equal(p.weighing.resolutionG,50);assert.equal(p.weighing.inventoryResolutionG,1);
});
test('invalid composition/moisture rejected; blank override retains estimate; excess water explicit',()=>{
 assert.throws(()=>LP.buildPreparationSnapshot({...base,recipe:[{id:'a',p:80}]}),/100/);
 assert.throws(()=>LP.buildPreparationSnapshot({...base,moistureOverrides:{a:'oops'}}),/humedad/);
 assert.throws(()=>LP.buildPreparationSnapshot({...base,ingredients:[{id:'a'},{id:'b',moisture:0}]}),/humedad/);
 assert.equal(LP.buildPreparationSnapshot({...base,moistureOverrides:{a:''}}).items[0].moisture.source,'catalog-estimate');
 const wet=LP.buildPreparationSnapshot({...base,moistureOverrides:{a:92}});
 assert.equal(wet.totals.waterToAddKg,0);assert.ok(wet.totals.waterExcessKg>0);assert.ok(wet.totals.preparedWetKg>wet.target.wetKg);
 assert.ok(Object.isFrozen(wet.items[0]));
});
