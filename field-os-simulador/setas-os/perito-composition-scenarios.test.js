'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {INGS,SPP}=require('./substrate-catalog.js');
const {analyze}=require('./substrate-analysis.js');
const sensitivity=require('./perito-composition-scenarios.js');
const optimizer=require('./recipe-optimizer.js');
const lifecycle=require('./recipe-lifecycle.js');
const launch=require('./launch-plan.js');
const ID='pellets_weber_hickory';
const recipe=[{id:ID,p:79},{id:'salvado_trigo',p:20},{id:'carbonato_calcio',p:1}];
const product=INGS.find(g=>g.id===ID);
test('working blend sums C and N separately and declares hypotheses instead of measured Weber data',()=>{
 const c=product.compositionEstimate.inputs.reduce((s,g)=>s+g.c*g.fraction,0);
 const n=product.compositionEstimate.inputs.reduce((s,g)=>s+g.n*g.fraction,0);
 assert.equal(product.c,c);assert.equal(product.n,n);assert.equal(product.cn,c/n);
 assert.equal(product.compositionStatus,'estimated');assert.equal(product.compositionEstimate.confidence,'low');
 assert.notEqual(product.cn,product.compositionEstimate.inputs.reduce((s,g)=>s+g.c/g.n*g.fraction,0));
 assert.ok(product.cs.includes('shiitake'));assert.match(product.notes,/analogía/);
 assert.equal(product.cost,Math.round(120000/(20*.45359237)));
 const claim=product.provenance.claims.find(g=>g.fields.includes('cn'));
 assert.equal(claim.method,'estimated');assert.equal(claim.confidence,'low');
});
test('Weber is calculated in full and retains the declared oak density proxy',()=>{
 const a=analyze(recipe,'shiitake');
 assert.ok(Number.isFinite(a.eb)&&a.eb>0);
 assert.equal(a.densaP,79);assert.equal(a.ebMods.aerF,.85);
 assert.ok(Math.abs(a.cn-(product.c*79+45*20)/(product.n*79+2.8*20))<1e-10);
});
test('fixed-recipe comparison preserves input and matches actual engine calculations without averaging predictions',()=>{
 const before=JSON.stringify({INGS,recipe});
 const c=sensitivity.compare({recipe,sKey:'shiitake'});
 assert.equal(c.rows.length,5);assert.equal(c.rows[0].eb,analyze(recipe,'shiitake').eb);
 assert.ok(c.diverges);
 const low=c.rows.find(r=>r.id==='oak_2024');assert.equal(low.pelletCN,53.8/.48);
 assert.notEqual(low.pelletCN,109.8);assert.match(low.note,/109.8/);
 for(const r of c.rows){
  const ings=INGS.map(g=>g.id===ID?{...g,c:r.c,n:r.n,cn:r.c/r.n}:g);
  assert.equal(r.eb,analyze(recipe,'shiitake',ings,SPP).eb);
 }
 assert.equal(JSON.stringify({INGS,recipe}),before);
 assert.equal(sensitivity.compare({recipe:[{id:ID,p:0},{id:'salvado_trigo',p:100}],sKey:'shiitake'}),null);
 assert.equal(sensitivity.compare({recipe,sKey:'p_ostreatus_gris'}),null);
});
test('estimates suppress automatic recipe changes while retaining diagnosis and manual formulation',()=>{
 const an=analyze(recipe,'shiitake');
 const opt=optimizer.generateOptimizer(an,'shiitake',new Set(),recipe,INGS,[],null,false,{},SPP);
 assert.ok(opt.items.length>0);
 assert.ok(opt.items.every(i=>!i.apply&&!i.comboApply));
 assert.ok(opt.items.some(i=>i.label==='Composición provisional'));
 assert.equal(analyze([{id:'aserrin_roble',p:79},{id:'salvado_trigo',p:20},{id:'carbonato_calcio',p:1}],'shiitake').eb,45.60334695165119);
});
test('saved prediction and production records keep detached evidence, parameters and model version',()=>{
 const inputRecipe=structuredClone(recipe),ings=structuredClone(INGS);
 const snap=sensitivity.snapshot({recipe:inputRecipe,sKey:'shiitake',ings,at:'2026-11-13T20:00:00Z',modelVersion:'test-model'});
 const expected=structuredClone(snap);
 inputRecipe[0].p=1;ings.find(g=>g.id===ID).compositionEstimate.inputs[0].c=0;
 assert.deepEqual(snap,expected);
 const production=lifecycle.buildProductionSnapshot({id:'recipe',name:'Weber piloto',recipe,sKey:'shiitake',predictionSnapshot:snap},{at:'2026-11-13T20:01:00Z'});
 assert.ok(Object.isFrozen(production.predictionSnapshot.comparison.rows));
 const form={codigo:'PILOT',especie:'Shiitake',numBolsas:1,pesoHumedo:2.5,humedad:60};
 const lot=launch.buildLoteRecords({form,plan:{allocations:[],shortfalls:[]},recipe,sKey:'shiitake',now:1794596400000,predictionSnapshot:snap}).lote;
 snap.comparison.rows[0].eb=999;
 assert.deepEqual(production.predictionSnapshot,expected);
 assert.deepEqual(lot.recipeRef.predictionSnapshot,expected);
 assert.throws(()=>sensitivity.snapshot({recipe,sKey:'shiitake'}),/fecha y versión/);
});

test('estimated active ingredient cannot bypass dosing guard when excluded from optimizer pool',()=>{
 const r=[{id:ID,p:90},{id:'salvado_trigo',p:9},{id:'carbonato_calcio',p:1}];
 const opt=optimizer.generateOptimizer(analyze(r,'shiitake'),'shiitake',new Set(),r,INGS.filter(g=>g.id!==ID),[],null,false,{},SPP);
 assert.ok(opt.items.every(i=>!i.apply&&!i.comboApply));
});
test('snapshot records displayed historical forecast separately from raw model',()=>{
 const forecast={value:63.5,low:40,high:80,history:{n:2,weight:.2}};
 const snap=sensitivity.snapshot({recipe,sKey:'shiitake',at:'2026-11-13T20:00:00Z',modelVersion:'test-model',forecast});
 assert.equal(snap.workingPrediction.eb,63.5);
 assert.equal(snap.rawModelEB,analyze(recipe,'shiitake').eb);
 assert.deepEqual(snap.forecast,forecast);
});
