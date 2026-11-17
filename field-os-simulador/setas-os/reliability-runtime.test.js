'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const jsx=fs.readFileSync(`${__dirname}/simulador-app.jsx`,'utf8');
const climate=require('./climate-math.js');
const start=jsx.indexOf('            const missing=[];');
const end=jsx.indexOf('            return <div className="climate-kpi-card" data-testid="room-fae"',start);
const evaluate=vm.runInNewContext(`(lotesEnSala,room,climateMath,SPP,defaultTargets)=>{${jsx.slice(start,end)};return {missing,faeCalc};}`);
const room={volumeM3:3.021452,fanRatedCfm:90};
const lot={sKey:'p_ostreatus_gris',biomasaActivaKg:2};
const spp={p_ostreatus_gris:{}};
const targets={co2_ppm:{target:900}};
test('FAE never calls the model for an empty room or incomplete operational inputs',()=>{
 let calls=0;const math={calcDynamicFAE:()=>{calls++;}};
 for(const [lots,config] of [[[],room],[[{sKey:lot.sKey}],room],[[lot],{volumeM3:null,fanRatedCfm:90}],[[lot],{volumeM3:3,fanRatedCfm:null}],[[{...lot,sKey:null}],room]]){
  const result=evaluate(lots,config,math,spp,targets);
  assert.equal(result.faeCalc,null);assert.ok(result.missing.length);
 }
 assert.equal(calls,0);
});
test('FAE uses all declared biomass and the configured volume/fan instead of room-specific literals',()=>{
 let args;
 const result=evaluate([lot,{...lot,biomasaActivaKg:3}],room,{calcDynamicFAE:(...input)=>{args=input;return climate.calcDynamicFAE(...input);}},spp,targets);
 assert.equal(result.missing.length,0);
 assert.equal(args[0],5);assert.equal(args[1],lot.sKey);
 assert.equal(args[2].roomVolumeM3,room.volumeM3);assert.equal(args[2].fanRatedCfm,90);
 assert.equal(result.faeCalc.roomVolumeM3,room.volumeM3);
});
test('shared writer reports quota/access failures and rethrows for caller rollback',()=>{
 const emitted=[];const writes=[];
 const code=jsx.slice(jsx.indexOf('let lastLocalWriteFailure'),jsx.indexOf('const {useState'));
 const context={localStorage:{setItem:(k,v)=>{if(k==='blocked')throw Error('quota');writes.push([k,v]);},removeItem:()=>{throw Error('disabled storage');}},window:{dispatchEvent:event=>emitted.push(event)},CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail;}}};
 const api=vm.runInNewContext(`${code};({writeLocal,removeLocal})`,context);
 api.writeLocal('good','[]');assert.deepEqual(writes,[['good','[]']]);
 assert.throws(()=>api.writeLocal('blocked','[]'),/quota/);assert.throws(()=>api.removeLocal('old'),/disabled storage/);
 assert.deepEqual(emitted.map(e=>e.detail.key),['blocked','old']);
 assert.ok(emitted.every(e=>e.type==='setas-local-write-failed'));
});

test('pilot reset stops at the first failed deletion and never clears tasks or reloads',async()=>{
 const start=jsx.indexOf('  const resetForPilot=async(typed)=>{');
 const end=jsx.indexOf('  const calcLoteStats=',start);
 const attempted=[];const writes=[];
 const context={SetasPrototype:{planPilotReset:()=>[{loteId:'L1'},{loteId:'L2'}]},bitLotes:[],bitBolsas:[],bitCosechas:[],fieldOperatorRole:'direccion',
  downloadPrototypeBackup:async()=>{},purgeBitLote:async id=>{attempted.push(id);return false;},writeLocal:(...args)=>writes.push(args),setBitTasks:()=>assert.fail('tasks must remain'),location:{reload:()=>assert.fail('must not reload')},setTimeout};
 const reset=vm.runInNewContext(`${jsx.slice(start,end)};resetForPilot`,context);
 await assert.rejects(reset('fixture'),/reinicio se detuvo/);
 assert.deepEqual(attempted,['L1']);assert.deepEqual(writes,[]);
});
