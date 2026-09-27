'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const p=require('./prototype-readiness');
const e=require('./experiment-model');
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const experiment=()=>({id:'EXP',title:'Synthetic',hypothesis:'Fixture only',speciesId:'s',primaryMetric:'be_pct',status:'complete',completedAt:'2026-09-26',randomization:true,randomizationExecutedAt:'2026-09-01',randomizationMethod:'recorded allocation',replicatesPerArm:3,control:{id:'c',recipeVersionId:'rc',batchIds:['c1','c2','c3']},treatments:[{id:'t',recipeVersionId:'rt',batchIds:['t1','t2','t3']}],assignments:['c1','c2','c3','t1','t2','t3'].map(batchId=>({batchId,armId:batchId[0]}))});
const records=()=>['c1','c2','c3','t1','t2','t3'].map(batchId=>({batchId,experimentId:'EXP',armId:batchId[0],recipeSnapshot:{versionId:'r'+batchId[0]},ingredientLots:[{lotId:'i'}],metrics:{be_pct:85},outcome:{status:'completed-success',verified:true}}));
test('experimental gate rejects missing measurements and pseudoreplication',()=>{
 for(const value of [null,'',true,NaN,Infinity]){const rows=records();rows[0].metrics.be_pct=value;assert.equal(e.promotionGate(experiment(),rows).eligible,false);}
 const rows=records();assert.equal(e.promotionGate(experiment(),[...Array(3).fill(rows[0]),...Array(3).fill(rows[3])]).eligible,false);
});
test('experimental gate checks version, membership, completion and executed assignment',()=>{
 for(const mutate of [r=>r[0].recipeSnapshot.versionId='wrong',r=>r[0].armId='t',r=>r[0].outcome.verified=false]){const r=records();mutate(r);assert.equal(e.promotionGate(experiment(),r).eligible,false);}
 const exp=experiment();exp.treatments[0].batchIds.push('c1');assert.equal(e.promotionGate(exp,records()).eligible,false);
 const planned=experiment();delete planned.randomizationExecutedAt;assert.equal(e.promotionGate(planned,records()).eligible,false);
});
test('complete zero measurement counts; duplicate identical record counts once',()=>{const r=records();r[0].metrics.be_pct=0;r[0].outcome.status='completed-zero-yield';assert.equal(e.promotionGate(experiment(),[...r,r[0]]).eligible,true);});
test('plan save is separate from physical production and immutable once assigned',()=>{
 const storage=memory();const exp={...experiment(),design:'exploratory',status:'draft',randomization:false,control:{id:'c',recipeVersionId:'rc',recipeSnapshot:{sKey:'s',recipe:[{id:'a',p:100}]},plannedReplicates:1,batchIds:[]},treatments:[]};
 p.savePlan(storage,exp);assert.deepEqual(p.read(storage,'sdp_bit_lotes'),[]);
 const linked=p.linkBatch(p.read(storage,p.PLANS),{experimentId:'EXP',armId:'c'},{id:'b',createdAt:'2026-09-26',recipeRef:{sKey:'s',recipe:[{id:'a',p:100}]}});
 assert.equal(linked.batch.experimentId,'EXP');assert.equal(linked.plans[0].status,'running');
 p.persist(storage,[[p.PLANS,linked.plans]]);assert.throws(()=>p.savePlan(storage,exp),/ejecución/);
});
test('durable commit rolls back quota failure and crash replay is idempotent',()=>{
 const storage=memory();p.persist(storage,[['sdp_bit_lotes',[{id:'before'}]]]);const original=storage.setItem;let n=0;
 storage.setItem=(k,v)=>{if(++n===3)throw Error('quota');original(k,v);};
 assert.throws(()=>p.persist(storage,[['sdp_bit_lotes',[{id:'after'}]],['sdp_bit_bolsas',[]]]),/quota/);
 assert.equal(p.read(storage,'sdp_bit_lotes')[0].id,'before');storage.setItem=original;
 storage.setItem(p.PENDING,JSON.stringify({schema:'setas.local-write.v1',entries:[{key:'sdp_bit_lotes',before:storage.getItem('sdp_bit_lotes'),after:JSON.stringify([{id:'recovered'}])}]}));
 p.recover(storage);p.recover(storage);assert.equal(p.read(storage,'sdp_bit_lotes')[0].id,'recovered');
});
test('recovery refuses to overwrite conflicting later records',()=>{
 const storage=memory();storage.setItem('sdp_bit_lotes','[{"id":"new"}]');storage.setItem(p.PENDING,JSON.stringify({schema:'setas.local-write.v1',entries:[{key:'sdp_bit_lotes',before:'[]',after:'[{"id":"old"}]'}]}));assert.throws(()=>p.recover(storage),/Conflicto/);assert.equal(p.read(storage,'sdp_bit_lotes')[0].id,'new');
});
test('release needs explicit review, is revision-bound, and does not need history',()=>{
 const batch={id:'b',preparation:{revision:'p1'},recipeRef:{recipe:[{id:'a',p:100}]}};
 const release=p.release(batch,{equipment:'Tank',protocol:'Recorded protocol',reviewer:'Operator',acknowledged:true,at:'2026-09-26'});
 assert.equal(p.releaseCurrent(batch,release),true);assert.equal(p.releaseCurrent({...batch,preparation:{revision:'p2'}},release),false);
 assert.throws(()=>p.release({id:'legacy'},{equipment:'Tank',protocol:'Protocol',reviewer:'Operator',acknowledged:true,at:'2026-09-26'}),/antiguo/);
});
test('backup roundtrip preserves null, zero and identities without replaying outboxes',async()=>{
 const storage=memory();p.persist(storage,[['sdp_bit_lotes',[{id:'b',peseSeco:null}]],['sdp_bit_bolsas',[{id:'bag',loteId:'b'}]],['sdp_bit_cosechas',[{id:'h',loteId:'b',bolsaId:'bag',pesoFresco:0}]],['sdp_inventory_ops',[{opId:'b',status:'pending'}]]]);
 const data=await p.backup(storage);const target=memory();p.restore(target,data);assert.equal(p.read(target,'sdp_bit_lotes')[0].peseSeco,null);assert.equal(p.read(target,'sdp_bit_cosechas')[0].pesoFresco,0);assert.deepEqual(p.read(target,'sdp_inventory_ops'),[]);assert.equal(JSON.parse(target.getItem('sdp_recovery_archive_v1')).inventory.length,1);assert.throws(()=>p.restore(target,data),/vacío/);
 const bad=structuredClone(data);bad.collections.sdp_bit_bolsas[0].loteId='wrong';assert.throws(()=>p.validateBackup(bad),/Referencias/);
});
test('economics distinguish recorded cost and sales from modeled harvest value',()=>{
 const {calcLoteStats}=require('./bitacora-model');const stat=l=>calcLoteStats(l,[{id:'bag'}],[{pesoFresco:1000}]);
 assert.equal(stat({peseSeco:1}).economics.recordedRevenueCop,null);assert.equal(stat({peseSeco:1}).economics.recordedCostCop,null);
 const costs=Object.fromEntries(['sustrato','spawn','energia','consumibles'].map(id=>[id,{amountCop:0,source:'fixture receipt'}]));
 const r=stat({peseSeco:1,recordedCosts:costs,sales:[{id:'s1',amountCop:100,recordedAt:'2026-09-26'}]});assert.equal(r.economics.recordedCostCop,0);assert.equal(r.economics.recordedRevenueCop,100);assert.equal(r.economics.recordedMarginCop,100);
});
test('recorded dry mass follows weighing snapshot rounding',()=>{
 const a=require('./launch-plan');const ingredients=[{id:'a',moisture:10},{id:'b',moisture:0}],recipe=[{id:'a',p:80},{id:'b',p:20}];
 const preparation=a.buildPreparationSnapshot({recipe,ingredients,speciesKey:'s',bags:1,kgPerBag:1,moistureTarget:60,scaleG:50,spawnPct:8});
 const {lote}=a.buildLoteRecords({form:{codigo:'synthetic'},plan:{preparation,allocations:[]},recipe,sKey:'s',now:1});assert.equal(lote.peseSeco,preparation.totals.dryKg);assert.equal(lote.dryWeightProvenance,'planned-calculated');
});

const preparationFixture=()=>{
 const storage=memory(),at='2026-09-26T12:00:00.000Z';
 const lote={id:'b',codigo:'TEST-1',createdAt:at,estado:'planificado',recipeRef:{id:'r'},preparation:{revision:'v1'},ingredientLots:[{ingredientId:'a',lotId:'stock',quantity:2,unidad:'kg'}]};
 const plan={allocations:lote.ingredientLots,shortfalls:[]};
 p.persist(storage,[['sdp_lotes',[{id:'stock',cantidadKgDisponible:10,activo:true}]]]);
 p.planBatch(storage,{lote,bolsas:[{id:'bag',loteId:'b'}],plan});
 const sheet=require('./batch-sheet').buildBatchSheet({lote,bolsas:[],cosechas:[],nowMs:Date.parse(at)});
 const trialRelease=p.release(lote,{equipment:'Fixture',protocol:'Fixture',reviewer:'Test',acknowledged:true,at});
 return {storage,args:{loteId:'b',sheet,trialRelease,operatorId:'op',role:'operator',at}};
};
test('planning atomically reserves without consumption; preparation validates then consumes once',()=>{
 const {storage,args}=preparationFixture();
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,10);
 assert.equal(p.read(storage,'sdp_sync_queue').length,2);
 assert.throws(()=>p.prepareBatch(storage,{...args,sheet:{...args.sheet,state:'closed'}}));
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,10);
 p.prepareBatch(storage,args);p.prepareBatch(storage,args);
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,8);
 assert.equal(p.read(storage,'sdp_inventory_ops').length,1);
 assert.equal(p.read(storage,'sdp_movimientos').length,1);
 assert.equal(p.read(storage,'sdp_bit_lotes')[0].lifecycleState,undefined);
});
test('restored preparation resumes without double deduction or automatic outbox replay',async()=>{
 const {storage,args}=preparationFixture();p.prepareBatch(storage,args);
 const data=await p.backup(storage),restored=memory();p.restore(restored,data);
 const result=p.prepareBatch(restored,args);assert.equal(result.reused,true);
 assert.equal(p.read(restored,'sdp_lotes')[0].cantidadKgDisponible,8);
 assert.equal(p.read(restored,'sdp_inventory_ops').length,0);
});
test('stock shortage and quota failures leave all preparation records unchanged',()=>{
 const {storage,args}=preparationFixture();
 p.persist(storage,[['sdp_lotes',[{id:'stock',cantidadKgDisponible:1}]]]);
 assert.throws(()=>p.prepareBatch(storage,args),/Stock insuficiente/);
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,1);
 assert.equal(p.read(storage,'sdp_inventory_ops').length,0);
 p.persist(storage,[['sdp_lotes',[{id:'stock',cantidadKgDisponible:10}]]]);
 const original=storage.setItem;let n=0;storage.setItem=(k,v)=>{if(++n===4)throw Error('quota');original(k,v);};
 assert.throws(()=>p.prepareBatch(storage,args),/quota/);
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,10);
 assert.equal(p.read(storage,'sdp_bit_lotes')[0].lifecycleEvents,undefined);
});

test('repeated backup and restore retain interrupted consumption identities',async()=>{
 const {storage,args}=preparationFixture();p.prepareBatch(storage,args);
 const lots=p.read(storage,'sdp_bit_lotes');delete lots[0].lifecycleEvents;
 p.persist(storage,[['sdp_bit_lotes',lots]]);
 const first=memory();p.restore(first,await p.backup(storage));
 const second=memory();p.restore(second,await p.backup(first));
 p.prepareBatch(second,args);
 assert.equal(p.read(second,'sdp_lotes')[0].cantidadKgDisponible,8);
 assert.equal(JSON.parse(second.getItem('sdp_recovery_archive_v1')).inventory.length,1);
});

test('excess-water target cannot be authorized into stock consumption',()=>{
 const {storage,args}=preparationFixture();const lots=p.read(storage,'sdp_bit_lotes');
 lots[0].preparation.totals={waterExcessKg:1};p.persist(storage,[['sdp_bit_lotes',lots]]);
 const trialRelease=p.release(lots[0],{equipment:'Test',protocol:'Test',reviewer:'Test',acknowledged:true,at:args.at});
 assert.throws(()=>p.prepareBatch(storage,{...args,trialRelease}),/exceden el agua/);
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,10);
});

test('known planning shortfalls cannot be hidden by a partial allocation',()=>{
 const {storage,args}=preparationFixture(),lots=p.read(storage,'sdp_bit_lotes');
 lots[0].ingredientShortfalls=[{ingredientId:'a',missing:1}];p.persist(storage,[['sdp_bit_lotes',lots]]);
 assert.throws(()=>p.prepareBatch(storage,args),/insumos faltantes/);
 assert.equal(p.read(storage,'sdp_lotes')[0].cantidadKgDisponible,10);
});
