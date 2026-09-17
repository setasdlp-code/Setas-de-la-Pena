'use strict';
// Isolated localhost + fresh browser storage, external requests blocked.
// Real React, native adapter, scoring and persistence; no Firebase credentials.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);
  if(pathname==='/__harness.html')body=body.toString().replace('<script src="simulador-app.js">','<script src="formulator-api.js"></script><script src="perito-readiness.js"></script><script src="perito-ui-bridge.js"></script><script src="simulador-app.js">');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch();
  for(const width of [1280,390]){
   const context=await browser.newContext({viewport:{width,height:900}});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   await page.addInitScript(()=>{
    if(sessionStorage.getItem('history-fixture'))return;
    localStorage.clear();localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');
    localStorage.setItem('setas_global_workmode','investigacion');
    const recipe=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];
    const t=(id,ebReal,extra={})=>({id,name:`SYNTHETIC ${id}`,sKey:'p_ostreatus_gris',recipe,eb:'80',cn:'45',date:'1/9/2026',ebReal,...extra});
    localStorage.setItem('setas_v6',JSON.stringify([
     t('missing',null),t('blank',''),t('legacy',90),
     t('good',80,{loteId:'B2',outcome:{status:'completed-success',verified:true}}),
     t('zero',0,{outcome:{status:'completed-zero-yield',verified:true}}),
     t('partial',30,{outcome:{status:'partial',verified:false}})
    ]));
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([
     {id:'B1',estado:'fructificacion',peseSeco:2,recipeRef:{sKey:'p_ostreatus_gris',recipe}},
     {id:'B2',estado:'completado',peseSeco:2,recipeRef:{sKey:'p_ostreatus_gris',recipe}}
    ]));
    localStorage.setItem('sdp_bit_cosechas',JSON.stringify([{id:'H1',loteId:'B1',pesoFresco:1000},{id:'H2',loteId:'B2',pesoFresco:1600}]));
    sessionStorage.setItem('history-fixture','1');
   });
   const base=`http://127.0.0.1:${server.address().port}/__harness.html`;
   const openForm=async()=>{
    await page.goto(`${base}?view=formular`);
    await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
    await page.locator('#form-species-context-select:visible, #form-mobile-species-select:visible').selectOption('p_ostreatus_gris');
    await page.evaluate(()=>window.SetasFormulatorAPI.applyRecipe([{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}]));
    await expect(page.locator('#perito-model-v2')).toBeVisible();
   };
   await openForm();
   await expect.poll(()=>page.evaluate(()=>window.__setasPeritoAssessment?.historyEligibility?.eligibleN)).toBe(2);
   const history=await page.evaluate(()=>window.__setasPeritoAssessment.model.calibration.history);
   assert.equal(history.n,2);assert.equal(history.meanEB,40);
   await page.locator('#perito-model-v2 [data-perito-detail="estimates"] summary').click();
   const summary=page.locator('[data-history-eligibility]');
   await expect(summary).toContainText('2 resultado(s) final(es) elegible(s) · 6 excluido(s)');
   await expect(summary).toContainText('EB ausente o inválida: 2');
   await expect(summary).toContainText('registro duplicado: 1');
   assert.ok(await summary.evaluate(el=>el.scrollWidth<=el.clientWidth),'history summary overflow');
   await summary.screenshot({path:`/private/tmp/history-eligibility-${width}.png`});
   // Reuse the existing final-EB action through the visible recipe card.
   await page.goto(`${base}?view=catalogo`);
   const card=page.locator('[data-recipe-id="missing"]');
   await card.getByRole('button',{name:'Registrar resultado final',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'Registrar EB real'});
   await expect(dialog).toBeVisible();
   assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),'final outcome dialog overflow');
   await dialog.getByRole('textbox').fill('0');
   await dialog.getByRole('button',{name:'Confirmar resultado final'}).click();
   await expect(card.locator('[data-trial-outcome]')).toContainText('EB observada: 0%');
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('setas_v6')).find(r=>r.id==='missing'));
   assert.equal(stored.ebReal,0);assert.deepEqual(stored.outcome,{status:'completed-zero-yield',verified:true});
   await page.reload();
   await expect(page.locator('[data-recipe-id="missing"] [data-trial-outcome]')).toContainText('1 resultado(s) final(es) elegible(s)');
   await openForm();
   await expect.poll(()=>page.evaluate(()=>window.__setasPeritoAssessment?.historyEligibility?.eligibleN)).toBe(3);
   // Empty evidence restores the exact theoretical path, including after reload.
   await page.evaluate(()=>{for(const key of ['setas_v6','sdp_bit_lotes','sdp_bit_cosechas'])localStorage.setItem(key,'[]');});
   await openForm();
   assert.equal(await page.evaluate(()=>window.__setasPeritoAssessment.model.calibration.source),'theoretical');
   assert.equal(await page.evaluate(()=>window.__setasPeritoAssessment.historyEligibility.total),0);
   assert.deepEqual(errors,[]);
   console.log(`PASS ${width}px: real input -> calibration/exclusions; visible zero-final confirmation -> isolated persistence/reload; empty theoretical fallback.`);
   await context.close();
  }
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
