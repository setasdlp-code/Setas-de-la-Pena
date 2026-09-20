'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const scoring=require('./scoring.js');
const readiness=require('./perito-readiness.js');
const code=fs.readFileSync(`${__dirname}/perito-ui-bridge.js`,'utf8');
const input=(inputRevision,wetKg=10)=>({inputRevision,species:{key:'p_ostreatus_gris',name:'Orellana'},recipe:[{id:'base',p:100}],ingredients:[{id:'base',name:'Base'}],ingredientMoistureById:{base:20},batch:{wetKg,targetMoisturePct:60},inventory:{available:true,stockKgById:{base:10}},an:{tot:100,cn:35,avgN:1.4,avgPh:6.5,eb:90,suppP:10,incompat:[],sp:{cn_optimal:{min:25,ideal:35,max:50},n_optimal:{min:0.8,ideal:1.4,max:2},ph_optimal:{min:6,max:7.5},eb_baseline:90,eb_optimal:120,supplementation_max:20}},historicalEvidence:{trials:[],lotes:[],harvests:[]}});
const harness=()=>{
 const listeners={},frames=[],calls=[];let box=null;
 const empty=()=>[];
 const root={querySelectorAll:empty,insertBefore:value=>{box=value}};
 const document={documentElement:{},getElementById:id=>id==='bl-perito'?root:box,createElement:()=>({dataset:{},style:{},querySelectorAll:empty,remove:()=>{box=null}}),createTreeWalker:()=>({nextNode:()=>false})};
 const context={document,NodeFilter:{SHOW_TEXT:4},window:{addEventListener:(name,fn)=>{listeners[name]=fn}},MutationObserver:class{observe(){}},requestAnimationFrame:fn=>{frames.push(fn);return frames.length},SetasPeritoReadiness:readiness,SetasScoring:{...scoring,scoreRecipe:(an,ctx)=>{calls.push(ctx);return scoring.scoreRecipe(an,ctx)}},localStorage:{getItem:()=>{throw Error('must not read storage')}},fetch:()=>{throw Error('must not fetch generated source')}};
 vm.runInNewContext(code,context);
 return {context,calls,send:detail=>listeners['setas-perito-input']({detail}),flush:()=>{while(frames.length)frames.shift()()},box:()=>box};
};
test('current stock quantities reach real scoring without a baseline or DOM scraping',()=>{
 const h=harness();h.send(input(1,30));h.flush();
 assert.equal(h.calls[0].batchWetKg,30);
 assert.equal(h.calls[0].ingredientMoistureById.base,20);
 assert.equal(h.context.__setasPeritoAssessment.model.stockDetail.mode,'quantity');
 assert.equal(h.context.__setasPeritoAssessment.assessment.stock.limiting[0].missingWetKg,5);
 assert.ok(h.context.__setasPeritoAssessment.model.stockDetail.score<100);
});
test('pending renders only evaluate newest input and empty recipe clears assessment',()=>{
 const h=harness();h.send(input(1,30));h.send(input(2,10));h.flush();
 assert.equal(h.calls.length,1);
 assert.equal(h.context.__setasPeritoAssessment.inputRevision,2);
 assert.equal(h.context.__setasPeritoAssessment.assessment.stock.limiting.length,0);
 h.send({...input(3),recipe:[],an:null});h.flush();
 assert.equal(h.box(),null);
 assert.equal(h.context.__setasPeritoAssessment,null);
});
test('missing moisture cannot claim quantity coverage',()=>{
 const h=harness();const detail=input(1);detail.ingredientMoistureById.base=null;h.send(detail);h.flush();
 assert.equal(h.calls[0].stockKgById,undefined);
 assert.equal(h.context.__setasPeritoAssessment.assessment.checks.find(c=>c.id==='stock').status,'unknown');
});
