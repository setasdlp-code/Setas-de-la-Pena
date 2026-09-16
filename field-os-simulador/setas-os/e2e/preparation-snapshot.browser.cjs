'use strict';
// Local integration harness: real React, scoring and native adapter; no Firebase
// account or production writes. Run: node e2e/preparation-snapshot.browser.cjs
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
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes',JSON.stringify(['paja_trigo','salvado_trigo','spawn_grano','bolsa_pp_plana'].map((id,i)=>({id:'fixture-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:100,unidad:id==='bolsa_pp_plana'?'ud':'kg'}))));
   localStorage.setItem('sdp_bit_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');
   localStorage.setItem('setas_global_workmode','investigacion');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
  await page.selectOption('#form-species-context-select','p_ostreatus_gris');
  const original=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];
  await page.evaluate(recipe=>window.SetasFormulatorAPI.applyRecipe(recipe),original);
  const navigate=async view=>{await page.evaluate(view=>{window.SetasOSNavigation.navigate(window,view);window.dispatchEvent(new PopStateEvent('popstate'));},view);};
  const spec=()=>page.evaluate(()=>window.__setasPeritoInput.preparation);
  await navigate('produccion');
  await page.locator('#prod-bags').fill('10');await page.locator('#prod-kg').fill('1');await page.locator('#prod-h').fill('60');
  await expect.poll(async()=> (await spec())?.target.wetKg).toBe(10);
  const initial=await spec();assert.equal(initial.items[0].moisture.source,'catalog-estimate');
  const input=page.locator('#ingredient-moisture-paja_trigo');await input.fill('20');
  await expect.poll(async()=> (await spec())?.items[0].moisture.pct).toBe(20);
  const measured=await spec();assert.notEqual(initial.revision,measured.revision);
  assert.ok(measured.items[0].asReceivedKg>initial.items[0].asReceivedKg);assert.ok(measured.totals.waterToAddKg<initial.totals.waterToAddKg);
  assert.equal((await spec()).revision,measured.revision);
  const sheet=page.locator('.prod-sheet[data-preparation-revision]');await expect(sheet).toHaveAttribute('data-preparation-revision',measured.revision);
  await expect(sheet).toContainText(measured.totals.waterToAddKg.toFixed(4));
  await expect(sheet).toContainText('estimación catálogo');await expect(sheet).toContainText('medido');
  // Invalid moisture must leave the editing control available and suppress launch/print.
  await input.fill('93');await expect(input).toBeVisible();await expect(sheet).toHaveCount(0);
  await expect(page.getByRole('button',{name:'⚡ Ejecutar lote',exact:true})).toBeDisabled();
  await input.fill('20');await expect(sheet).toBeVisible();
  // Print the same revision in an isolated popup; browser print is stubbed.
  await page.evaluate(()=>{const originalOpen=window.open;window.open=function(...args){const p=originalOpen.apply(window,args);if(p)p.print=()=>{};return p;};});
  const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:/Imprimir/}).first().click();const popup=await popupPromise;
  await expect(popup.locator('.prod-sheet')).toHaveAttribute('data-preparation-revision',measured.revision);
  await expect(popup.locator('.prod-sheet')).toContainText(measured.totals.waterToAddKg.toFixed(4));await popup.close();
  // Editing batch state behind an open modal must invalidate its snapshot.
  await page.getByRole('button',{name:'⚡ Ejecutar lote',exact:true}).click();await expect(page.getByRole('dialog',{name:'Ejecutar lote',exact:true})).toBeVisible();
  await page.evaluate(()=>{const el=document.getElementById('prod-bags');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'12');el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.getByRole('dialog',{name:'Ejecutar lote',exact:true})).toHaveCount(0);
  await expect.poll(async()=> (await spec())?.target.bags).toBe(12);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))),[]);
  await page.setViewportSize({width:390,height:844});await expect(input).toBeVisible();
  assert.ok(await page.locator('[aria-label="Humedad de preparación"]').evaluate(el=>el.scrollWidth<=el.clientWidth),'moisture controls fit mobile');
  await page.screenshot({path:'/private/tmp/preparation-mobile.png',fullPage:true});
  const accepted=await spec();await page.getByRole('button',{name:'⚡ Ejecutar lote',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Ejecutar lote',exact:true});await expect(dialog).toContainText(accepted.revision);
  assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),'confirmation fits mobile');
  await dialog.getByRole('button',{name:'Confirmar y descontar'}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')).length)).toBe(1);
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))[0]);
  assert.deepEqual(record.preparation,accepted);assert.equal(record.numBolsas,12);assert.equal(record.pesoHumedo,1);assert.equal(record.peseSeco,4.8);
  const inventory=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_lotes')));
  assert.equal(inventory.find(l=>l.ingredienteId==='paja_trigo').cantidadKgDisponible,100-accepted.items[0].inventoryKg);
  // Formulador consumes those same inputs/overrides and invalidates its own launcher.
  await navigate('formular');await page.setViewportSize({width:1280,height:900});
  await page.getByRole('button',{name:'🚀 Lanzar Lote',exact:true}).click();
  await expect(page.getByRole('button',{name:'🚀 Confirmar y Lanzar Producción',exact:true})).toBeVisible();
  await page.evaluate(()=>window.SetasFormulatorAPI.applyRecipe([{id:'paja_trigo',p:70},{id:'salvado_trigo',p:30}]));
  await expect(page.getByRole('button',{name:'🚀 Confirmar y Lanzar Producción',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'🚀 Lanzar Lote',exact:true}).click();const second=await spec();
  await page.getByRole('button',{name:'🚀 Confirmar y Lanzar Producción',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')).length)).toBe(2);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))[0].preparation),second);
  assert.deepEqual(errors,[]);
  console.log('PASS: shared preparation, measured/catalog provenance, water/stock/print parity, recoverable invalid input, stale previews, both isolated launch flows and mobile layout.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
