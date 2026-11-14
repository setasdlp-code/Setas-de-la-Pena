'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('./culture-lineage');
const identity=require('./trace-identity');
const report=require('./batch-traceability');
const mother={id:'M1',kind:'mother',date:'2026-01-01',origin:'Proveedor / ficha 1',medium:'agar',passes:2};
const spawn={id:'S1',kind:'spawn',parentId:'M1',date:'2026-01-02',origin:'transferencia 1',medium:'grano',passes:3};
const records=api.addRecord(api.addRecord([],mother),spawn);
test('pases documentados, progenitor, fechas e IDs se validan sin inventar umbrales',()=>{
 assert.equal(api.threshold(null),null);assert.equal(api.threshold(0),0);
 for(const value of [-1,1.2,'3',NaN]) assert.throws(()=>api.threshold(value));
 for(const patch of [{passes:2},{parentId:'missing'},{date:'2025-01-01'},{id:'M1'},{date:'2026-02-30'}]) assert.throws(()=>api.addRecord(records,{...spawn,id:'S2',...patch}));
 assert.throws(()=>api.addRecord([], {...mother,passes:null}));
});
test('lote a madre y madre a lotes, sin confundir referencias perdidas o ciclos',()=>{
 const lote={id:'L1',spawnGenerationId:'S1'};
 const t=api.traceBatch(lote,records);assert.equal(t.mother.id,'M1');assert.equal(t.passes,3);assert.equal(t.passAlert,null);
 assert.equal(api.traceBatch(lote,records,3).passAlert,true);assert.equal(api.traceBatch(lote,records,4).passAlert,false);
 assert.deepEqual(api.batchesForCulture('M1',records,[lote,{id:'L2'}]),[lote]);
 assert.equal(api.traceBatch({id:'old'},records).status,'missing');
 assert.equal(api.ancestry([{id:'A',parentId:'A'}],'A').status,'invalid');
 const r=report.buildBatchTraceabilityReport({lote:{...lote,cultureRecords:records}});assert.equal(r.lineage.culture.mother.id,'M1');
});
test('comparación separa líneas y pases, conserva ausencias y usa bolsas evaluadas',()=>{
 const lots=[{id:'L1',spawnGenerationId:'S1',peseSeco:1},{id:'L2',spawnGenerationId:'S1',peseSeco:1},{id:'old'}];
 const result=api.compare({records,lotes:lots,bolsas:[{loteId:'L1',estado:'sana'},{loteId:'L1',estado:null},{loteId:'L2',estado:'contaminada'}],cosechas:[{loteId:'L1',pesoFresco:500}]});
 assert.equal(result.unlinked,1);assert.equal(result.rows[0].eb,50);assert.equal(result.rows[0].ebN,1);assert.equal(result.rows[0].contaminationPct,50);assert.equal(result.rows[0].bags,2);
 assert.equal(api.compare({records,lotes:lots}).rows[0].eb,null);
});
test('identidad de cultivo explícita y enlace operacional reversible',()=>{
 const i=identity.resolveTraceIdentity('setas:culture:M1');assert.equal(i.kind,'culture');assert.equal(identity.resolveTraceIdentity(identity.buildSetasOSUrl(i)).cultureId,'M1');
 assert.equal(identity.resolveTraceIdentity('?culture=M1&lote=L1').valid,false);
 assert.equal(identity.resolveTraceIdentity('M1').kind,'batch');
});
test('snapshots entre dispositivos recuperan registros y rechazan conflictos',()=>{
 assert.deepEqual(api.mergeRecords([],[{cultureRecords:records}]),records);
 assert.throws(()=>api.mergeRecords(records,[{cultureRecords:[{...mother,passes:9}]}]));
 assert.equal(api.traceBatch({spawnGenerationId:'M1'},records).status,'invalid');
 assert.equal(api.ancestry([mother,{...spawn,passes:10}],'S1').status,'invalid');
});
