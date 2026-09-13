'use strict';
// Local integration harness: real React, scoring and native adapter; no Firebase
// account or production writes. Run: node e2e/perito-readiness.browser.cjs
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
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes',JSON.stringify([{id:'stock',ingredienteId:'paja_trigo',activo:true,cantidadKgDisponible:100}]));
   localStorage.setItem('setas_global_workmode','investigacion');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
  await page.selectOption('#form-species-context-select','p_ostreatus_gris');
  const original=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];
  await page.evaluate(recipe=>window.SetasFormulatorAPI.applyRecipe(recipe),original);
  const assessment=page.locator('#perito-model-v2');await expect(assessment).toBeVisible();
  await expect(assessment).toHaveAttribute('data-readiness','blocked');
  await assessment.locator('[data-perito-detail="checks"] summary').click();
  await expect(assessment.locator('[data-readiness-check="approval"]')).toHaveAttribute('data-status','unknown');
  const revision=await assessment.getAttribute('data-recipe-revision');
  await page.locator('#bl-perito .pi-apply:not([disabled])').first().click();
  await expect(assessment).not.toHaveAttribute('data-recipe-revision',revision);
  const changed=await page.evaluate(()=>window.SetasFormulatorAPI.getRecipe());assert.notDeepEqual(changed,original);
  await page.getByRole('button',{name:/^Deshacer \(/}).click();
  await expect.poll(()=>page.evaluate(()=>window.SetasFormulatorAPI.getRecipe())).toEqual(original);
  await expect.poll(()=>page.evaluate(()=>window.__setasPeritoAssessment.inputRevision)).toEqual(await page.evaluate(()=>window.__setasPeritoInput.inputRevision));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('setas-perito-navigate',{detail:{action:'batch'}})));
  await page.locator('#bf-numbags').fill('60');
  await expect.poll(()=>page.evaluate(()=>window.__setasPeritoInput.batch.wetKg)).toBe(90);
  await expect.poll(()=>page.evaluate(()=>window.__setasPeritoAssessment.assessment.stock.rows[0].requiredWetKg)).toBeGreaterThan(20);
  await page.locator('#bf-hobj').fill('60');
  await expect.poll(()=>page.evaluate(()=>window.__setasPeritoInput.batch.targetMoisturePct)).toBe(60);
  await page.selectOption('#form-species-context-select','shiitake');
  await expect(assessment).toContainText('Shiitake');
  await page.setViewportSize({width:390,height:844});
  await expect(assessment).toBeVisible();
  assert.ok(await assessment.evaluate(el=>el.scrollWidth<=el.clientWidth),'readiness panel must not overflow on mobile');
  if(process.env.SETAS_PERITO_SCREENSHOT)await assessment.screenshot({path:process.env.SETAS_PERITO_SCREENSHOT});
  // Action links use the application's canonical navigation.
  await assessment.locator('[data-perito-action="inventory"]').first().click();
  await expect.poll(()=>page.evaluate(()=>new URL(location.href).searchParams.get('view'))).toBe('inventario');
  assert.deepEqual(errors,[]);
  console.log('PASS: real React recipe apply/undo, fresh assessment, batch/moisture/species changes, mobile layout and Bodega navigation.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
