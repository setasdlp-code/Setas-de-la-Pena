'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {captureNumber,captureError,normalizeTrialCapture,normalizeHarvestCapture,persistCapture,calcLoteStats}=require('./bitacora-model');
test('capture distinguishes missing, zero, invalid and fractional counts',()=>{
 assert.equal(captureNumber(''),null);assert.equal(captureNumber('  '),null);assert.equal(captureNumber('0'),0);
 assert.equal(captureError('',{required:true}),'Completa este campo.');assert.equal(captureError('0',{min:0}),'');
 assert.ok(captureError('2x'));assert.ok(captureError('Infinity'));assert.ok(captureError('1.5',{integer:true}));
});
test('JSON round trip preserves unknown measurements and observed zeros',()=>{
 const saved=JSON.parse(JSON.stringify(normalizeTrialCapture({numBolsas:'2',pesoHumedo:'',peseSeco:'',humedad:'0',spawnPct:'0',fechaMezcla:'',fechaInoculacion:''})));
 assert.equal(saved.pesoHumedo,null);assert.equal(saved.peseSeco,null);assert.equal(saved.humedad,0);assert.equal(saved.spawnPct,0);assert.equal(saved.fechaInoculacion,null);
 const zero=JSON.parse(JSON.stringify(normalizeHarvestCapture({pesoFresco:'0',flush:'1',calidad:''})));
 assert.equal(zero.pesoFresco,0);assert.equal(zero.calidad,null);
});
test('harvest storage remains grams, downstream mass is kg and unknown dry mass withholds BE',()=>{
 const c=normalizeHarvestCapture({pesoFresco:'430',flush:'1',calidad:''});assert.equal(c.pesoFresco,430);
 const stats=calcLoteStats({peseSeco:null},[{estado:'sana'}],[c]);assert.equal(stats.totalFresco,0.430);assert.equal(stats.be,null);
});
test('failed multi-key persistence rolls back without losing prior records',()=>{
 const map=new Map([['lotes','[]'],['bolsas','[]']]);let calls=0;
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(++calls===2)throw Error('quota');map.set(k,v);},removeItem:k=>map.delete(k)};
 assert.throws(()=>persistCapture(storage,[['lotes',[{id:'fixture'}]],['bolsas',[{id:'bag'}]]]),/quota/);
 assert.equal(map.get('lotes'),'[]');assert.equal(map.get('bolsas'),'[]');
 persistCapture(storage,[['lotes',[{pesoHumedo:null,peseSeco:0}]]]);assert.deepEqual(JSON.parse(map.get('lotes')),[{pesoHumedo:null,peseSeco:0}]);
});
test('public harvest boundary omits unknown quality without coercing it into an observation',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(`${__dirname}/firebase/public-trace-sync.js`,'utf8');
 const start=source.indexOf('const sanearCosecha =');const end=source.indexOf('\nexport async',start);
 const sanitize=vm.runInNewContext(source.slice(start,end)+';sanearCosecha');
 assert.equal(sanitize({pesoFresco:430,calidad:null,flush:1}).pesoFresco,430);
 assert.equal(Object.hasOwn(sanitize({pesoFresco:0,calidad:null,flush:1}),'calidad'),false);
 assert.equal(sanitize({pesoFresco:0,calidad:0,flush:1}).calidad,0);
});
test('legacy shell harvest routes to canonical records and cannot save demonstration measurements',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(`${__dirname}/Setas OS v5.dc.html`,'utf8');
 const start=source.indexOf('  confirmHarvest(){');const end=source.indexOf('  confirmQuick(){',start);
 const run=vm.runInNewContext('({'+source.slice(start,end)+'})');
 const calls=[];run.goBitTab=tab=>calls.push(tab);run.toast=()=>{};run.confirmHarvest();
 assert.deepEqual(calls,['bit_dash']);
});
