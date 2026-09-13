'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const batchSheetApi=require('./batch-sheet.js');const qrEvents=require('./field-qr-events.js');
const jsx=fs.readFileSync(`${__dirname}/simulador-app.jsx`,'utf8');
const start=jsx.indexOf('  const reportarEventoCultivo = ');const end=jsx.indexOf('  const renderQrCaptures=',start);
const tick=()=>new Promise(setImmediate);
const harness=({failLocal=false,actions=['inspection'],eventWrite=async()=>{},logWrite=async()=>{}}={})=>{
 let statuses=[];const writes=[];const notices=[];let local=null;
 const context={batchSheetApi,qrSavingRef:{current:new Set()},qrLotesRef:{current:[{id:'L1',codigo:'L1',operador:'operator',lifecycleEvents:[]}]},
  window:{SetasFieldQrEvents:qrEvents,SetasEventosCultivoDB:{registrarEvento:async e=>{writes.push(e);return eventWrite(e)}},SetasBitacoraDB:{actualizarLote:logWrite}},
  buildSheetFor:()=>({actions:actions.map(action=>({action,blockedBy:null}))}),
  localStorage:{setItem:(key,value)=>{if(failLocal)throw Error('quota');local=JSON.parse(value)}},
  setQrEventoStatuses:fn=>{statuses=fn(statuses)},setBitLotes:()=>{},setQrEventoObsAbierta:()=>{},setQrEventoObsNota:()=>{},setNoticeDlg:n=>notices.push(n),
  setDiagLoteId:()=>{},setDiagBolsaId:()=>{},setDiagImageBase64:()=>{},setDiagResult:()=>{},setDiagError:()=>{},setDiagNotes:()=>{},setShowQrSheet:()=>{},setShowFieldActionModal:()=>{},setShowDiagModal:()=>{},bitBolsas:[],
  setBitActiveLoteId:()=>{},setBitCosechaForm:()=>{},setShowBitCosecha:()=>{},console,
 };
 const run=vm.runInNewContext(`${jsx.slice(start,end)};reportarEventoCultivo`,context);
 return {run:(event=null,tipo='observacion')=>run(tipo,{id:'L1'},null,'Observación de prueba',event),statuses:()=>statuses,writes,local:()=>local,notices,context};
};
test('actual UI handler reports pending until both server writes acknowledge',async()=>{
 let finishEvent,finishLog;
 const h=harness({eventWrite:()=>new Promise(r=>{finishEvent=r}),logWrite:()=>new Promise(r=>{finishLog=r})});
 await h.run();assert.equal(h.statuses()[0].status,'pending');assert.equal(h.local()[0].lifecycleEvents.length,1);
 finishEvent();await tick();assert.equal(h.statuses()[0].status,'pending');
 finishLog();await tick();assert.equal(h.statuses()[0].status,'synchronized');
});
test('actual UI handler surfaces late failure and retry keeps event and local log identity',async()=>{
 let fail=true;const h=harness({eventWrite:async()=>{if(fail)throw Error('offline')}});
 await h.run();await tick();assert.equal(h.statuses()[0].status,'error');
 const event=h.statuses()[0].event;fail=false;await h.run(event);await tick();
 assert.equal(h.statuses()[0].status,'synchronized');assert.equal(h.local()[0].lifecycleEvents.length,1);assert.equal(h.writes[0].id,h.writes[1].id);
});
test('local storage failure cannot claim saved or start server writes',async()=>{
 const h=harness({failLocal:true});await h.run();await tick();
 assert.equal(h.statuses()[0].status,'error');assert.equal(h.statuses()[0].savedLocally,false);assert.equal(h.writes.length,0);
});
test('current action policy is checked again at save time',async()=>{
 const h=harness({actions:[]});await h.run();assert.equal(h.writes.length,0);assert.equal(h.local(),null);assert.equal(h.notices.length,1);
});
test('opening structured captures or cancelling them makes no premature event write',async()=>{
 for(const [tipo,action] of [['contaminacion','contamination'],['cosecha_parcial','harvest']]){
  const h=harness({actions:[action]});await h.run(null,tipo);assert.equal(h.writes.length,0);assert.equal(h.local(),null);
 }
});
