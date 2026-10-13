'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('./production-readiness.js');
const LP=require('./launch-plan.js');
const IL=require('./inventory-ledger.js');
const P=require('./prototype-readiness.js');
const {parseFirestoreRoomDoc}=require('./live-telemetry-bridge.js');
const NOW='2026-10-12T14:00:00.000Z',MS=Date.parse(NOW);
const ingredients=[{id:'base',name:'Base',moisture:10,cost:1000}];
const fixture=()=>{
 const preparation=JSON.parse(JSON.stringify(LP.buildPreparationSnapshot({recipe:[{id:'base',p:100}],ingredients,moistureOverrides:{base:10},speciesKey:'shiitake',bags:2,kgPerBag:1.5,moistureTarget:60,scaleG:1,spawnPct:10})));
 const inventoryLots=['base','spawn_grano','bags'].map((id,i)=>({id:'LOT'+i,ingredienteId:id,cantidadKgDisponible:10,activo:true,fechaIngreso:'2026-10-01',unidad:id==='bags'?'ud':'kg'}));
 const plan=LP.buildLaunchPlan({preparation,ingredients,inventoryLots,bagUnit:{ingredientId:'bags',units:2},unitIngredientIds:['bags']});
 const latest=Object.fromEntries(['temperature_c','rh_pct','co2_ppm'].map(metric=>[metric,{metric,room_id:'room1',value:20,quality:'valid',device_id:'node1',source:'esp32_hardware',ingest_source:'firestore',observed_at:NOW}]));
 return {speciesKey:'shiitake',speciesName:'Shiitake',speciesConfirmed:true,preparation,model:{criticals:0},plan,inventoryLoaded:true,inventoryLots,reservations:[],stockCheck:IL.checkPlan(plan,{lots:inventoryLots,ledger:[],nowMs:MS}),containerId:'bag',containerStockId:'bags',roomId:'room1',roomState:{bagsPresent:0,bagsIsolated:0,status:'empty',alerts:[]},telemetry:{latest,freshMetrics:{temperature_c:true,rh_pct:true,co2_ppm:true}},lotCode:'SHI-PILOT-01',plannedDate:'2026-10-13'};
};
const details={spawn:{strainId:'STR-01',supplier:'Supplier',thermalClass:'Supplier class record'},equipment:{equipmentId:'EQ-01',protocol:'Validated load report'},room:{capacityBags:10,sanitized:true,targetsReviewed:true},sensors:{deviceIds:'node1',calibrationReference:'CAL-01'}};
const evidence=(input,id,records=[],extra={})=>R.createEvidence({requirementId:id,status:'verified',reviewer:'Operator',reference:'REPORT-'+id,details:details[id]||{},...extra},input,records,{at:NOW,id:extra.id||'REC-'+id});
const complete=input=>{
 const records=R.MANUAL_IDS.filter(id=>id!=='review').map(id=>evidence(input,id));
 records.push(evidence(input,'review',records));return records;
};
const check=(result,id)=>result.checks.find(c=>c.id===id);

test('an empty setup exposes missing prerequisites and never verifies physical evidence',()=>{
 const result=R.assessProductionReadiness({},[],MS);
 assert.equal(result.status,'blocked');
 assert.equal(result.counts.verified,0);
 assert.ok(result.next);
 for(const id of R.MANUAL_IDS)assert.equal(check(result,id).status,'unknown');
});
test('complete documented pilot has ten checks; assessment is pure and has no history requirement',()=>{
 const input=fixture(),records=complete(input),before=JSON.stringify([input,records]);
 const result=R.assessProductionReadiness(input,records,MS);
 assert.equal(result.status,'verified');assert.equal(result.counts.verified,10);
 assert.equal(result.next,null);assert.equal(result.spawnLots[0].lotId,'LOT1');
 assert.equal(JSON.stringify([input,records]),before);
});
test('recipe quantity, room, container, lot code and spawn allocation changes invalidate manual reviews',()=>{
 for(const mutate of [s=>s.preparation.revision='changed',s=>s.roomId='room2',s=>s.containerId='other',s=>s.lotCode='SHI-02',s=>s.treatment={col:'thermal'},s=>s.plan.allocations.find(a=>a.ingredientId==='spawn_grano').lotId='OTHER']){
  const input=fixture(),records=complete(input);mutate(input);
  const result=R.assessProductionReadiness(input,records,MS);
  for(const id of R.MANUAL_IDS)assert.equal(check(result,id).status,'unknown',id);
 }
});
test('final human review requires all prerequisites and becomes stale when available stock or reservations change',()=>{
 const input=fixture();assert.throws(()=>evidence(input,'review'),/requisitos pendientes/);
 const records=complete(input);input.reservations.push({id:'reservation',status:'held',kg:1});
 assert.equal(check(R.assessProductionReadiness(input,records,MS),'review').status,'unknown');
 input.reservations=[];input.inventoryLots[0].cantidadKgDisponible=9;
 assert.equal(check(R.assessProductionReadiness(input,records,MS),'review').status,'unknown');
});
test('an unidentified or reused batch cannot have a complete readiness assessment',()=>{
 for(const change of [s=>s.lotCode='',s=>s.plannedDate='',s=>s.lotCodeAlreadyUsed=true]){
  const input=fixture(),records=complete(input);change(input);
  assert.notEqual(check(R.assessProductionReadiness(input,records,MS),'preparation').status,'verified');
  assert.equal(check(R.assessProductionReadiness(input,records,MS),'review').status,'unknown');
 }
});
test('stock subtracts held reservations and reports spawn/bag shortages using canonical units',()=>{
 for(const id of ['base','spawn_grano','bags']){
  const input=fixture();input.reservations=[IL.reserve({ingredienteId:id,kg:10,batchId:'other',at:NOW})];
  input.stockCheck=IL.checkPlan(input.plan,{lots:input.inventoryLots,ledger:input.reservations,nowMs:MS});
  const c=check(R.assessProductionReadiness(input,[],MS),'stock');
  assert.equal(c.status,'blocked');assert.ok(c.detail.includes(id));assert.ok(!c.detail.includes('undefined'));
 }
});
test('missing inventory, unmeasured moisture, critical recipe and water excess remain actionable',()=>{
 const input=fixture();input.inventoryLoaded=false;input.model.criticals=1;input.preparation.totals.waterExcessKg=0.1;
 input.preparation.items[0].moisture.source='catalog-estimate';
 const result=R.assessProductionReadiness(input,[],MS);
 assert.equal(check(result,'stock').status,'unknown');assert.equal(check(result,'model').status,'blocked');
 assert.equal(check(result,'preparation').status,'blocked');assert.equal(check(result,'moisture').status,'unknown');
});
test('isolated bags, unknown occupancy, sanitation and capacity prevent room verification',()=>{
 for(const state of [null,{bagsPresent:null},{bagsPresent:0,status:'needs_sanitation'},{bagsPresent:0,bagsIsolated:1},{bagsPresent:0,alerts:[{code:'bolsas_aisladas'}]},{bagsPresent:9}]){
  const input=fixture(),records=complete(input);input.roomState=state;
  assert.notEqual(check(R.assessProductionReadiness(input,records,MS),'room').status,'verified');
 }
 const input=fixture(),records=complete(input);input.roomState.lastEmptiedAt='2026-10-12T14:01:00Z';
 assert.equal(check(R.assessProductionReadiness(input,records,MS+60000),'room').status,'unknown');
});
test('sensor verification rejects stale, invalid, future, manual, demo and wrong-device readings',()=>{
 for(const mutate of [s=>s.telemetry.freshMetrics.co2_ppm=false,s=>s.telemetry.latest.rh_pct.quality='suspect',s=>s.telemetry.latest.co2_ppm.observed_at='2026-10-13T14:00:00Z',s=>s.telemetry.latest.rh_pct.ingest_source='manual',s=>s.telemetry.latest.rh_pct.source='iot_hub_webhook',s=>s.telemetry.latest.rh_pct.source='demo',s=>s.telemetry.latest.rh_pct.device_id='other',s=>s.telemetry.latest.rh_pct.room_id='other']){
  const input=fixture(),records=complete(input);mutate(input);
  assert.equal(check(R.assessProductionReadiness(input,records,MS),'sensors').status,'unknown');
 }
});
test('Firestore parsing preserves test and real hardware origin instead of promoting transport to evidence',()=>{
 for(const source of ['iot_hub_webhook','esp32_hardware']){
  assert.equal(parseFirestoreRoomDoc('room1',{device_id:'node1',source,temperature_c:20,timestamp_local:NOW}).source,source);
 }
});
test('inspection records require accountable evidence and preserve explicit blockers',()=>{
 const input=fixture();
 assert.throws(()=>evidence(input,'spawn',[],{reviewer:''}),/Completa/);
 assert.throws(()=>evidence(input,'spawn',[],{details:{}}),/Completa/);
 const record=evidence(input,'equipment',[],{status:'blocked',reference:'',notes:'Cycle not commissioned'});
 assert.equal(check(R.assessProductionReadiness(input,[record],MS),'equipment').status,'blocked');
});
test('corrupt evidence is preserved; write-ahead recovery and portable backup retain inspections',async()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 map.set(R.KEY,'broken');assert.throws(()=>R.readRecords(storage),/dañado/);assert.equal(map.get(R.KEY),'broken');
 storage.removeItem(R.KEY);const records=complete(fixture());P.persist(storage,[[R.KEY,records]]);
 const report=await P.backup(storage);assert.deepEqual(report.collections[R.KEY],records);
 const emptyMap=new Map(),empty={getItem:k=>emptyMap.get(k)??null,setItem:(k,v)=>emptyMap.set(k,String(v)),removeItem:k=>emptyMap.delete(k)};
 P.restore(empty,report);assert.deepEqual(R.readRecords(empty),records);
 const blocked=evidence(fixture(),'equipment',[],{status:'blocked',notes:'New failure',id:'REC-equipment-failure'});
 map.set(P.PENDING,JSON.stringify({schema:'setas.local-write.v1',entries:[{key:R.KEY,before:JSON.stringify(records),after:JSON.stringify([...records,blocked])}]}));
 P.recover(storage);assert.equal(R.readRecords(storage).at(-1).status,'blocked');
});
