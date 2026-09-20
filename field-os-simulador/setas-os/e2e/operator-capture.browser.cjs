'use strict';
// Local integration harness: real React, scoring and native adapter; no Firebase
// account or production writes. Run: node e2e/field-qr-capture.browser.cjs
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
  if(pathname==='/__harness.html')body=body.toString().replace('<script src="simulador-app.js">','<script src="batch-sheet.js"></script><script src="field-qr-events.js"></script><script src="simulador-app.js">');
  if(pathname==='/__harness.html')body=body.toString().replace('hoyPreviewEventos: 0','hoyPreviewEventos: 0');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{if(!sessionStorage.getItem('fixture-init')){localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');localStorage.setItem('sdp_bit_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');sessionStorage.setItem('fixture-init','1');}});
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`);
  await page.getByRole('button',{name:'+ Nueva prueba',exact:true}).click();
  let trial=page.getByRole('dialog',{name:'Nueva prueba experimental'});
  await trial.getByLabel('# Bolsas',{exact:true}).fill('2');
  await trial.getByLabel('# Bolsas',{exact:true}).fill('');
  await trial.getByLabel('# Bolsas',{exact:true}).press('Tab');
  await expect(trial.getByLabel('# Bolsas',{exact:true})).toHaveValue('');
  await trial.getByLabel('Código de lote').fill('CAPTURE-FIXTURE');
  await trial.getByLabel('Especie',{exact:true}).fill('Orellana Gris');
  await trial.getByRole('button',{name:'Crear lote y generar bolsas'}).click();
  await expect(trial.getByLabel('# Bolsas',{exact:true})).toBeFocused();
  await expect(trial.getByLabel('Código de lote')).toHaveValue('CAPTURE-FIXTURE');
  await trial.getByLabel('# Bolsas',{exact:true}).fill('2');
  await trial.getByLabel('Humedad medida % · opcional').fill('0');
  await trial.getByRole('button',{name:'Cancelar',exact:true}).click();
  await page.reload();
  await page.getByRole('button',{name:'+ Nueva prueba',exact:true}).click();
  trial=page.getByRole('dialog',{name:'Nueva prueba experimental'});
  await expect(trial.getByLabel('Humedad medida % · opcional')).toHaveValue('0');
  await expect(trial.getByLabel('Peso seco medido total (kg) · opcional')).toHaveValue('');
  await page.setViewportSize({width:390,height:844});
  assert.ok(await trial.evaluate(el=>el.scrollWidth<=el.clientWidth),'trial mobile overflow');
  assert.ok((await trial.getByLabel('# Bolsas',{exact:true}).boundingBox()).height>=44);
  // A failed operational write must leave the exact draft and no record.
  await page.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='sdp_bit_bolsas')throw Error('fixture quota');return window.__setItem.call(this,k,v);};});
  await trial.getByRole('button',{name:'Crear lote y generar bolsas'}).click();
  await expect(trial.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(trial.getByLabel('Código de lote')).toHaveValue('CAPTURE-FIXTURE');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')).length),0);
  await page.evaluate(()=>Storage.prototype.setItem=window.__setItem);
  await trial.getByLabel('# Bolsas',{exact:true}).press('Enter');
  await expect(trial).toHaveCount(0);
  let records=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')));
  assert.equal(records[0].humedad,0);assert.equal(records[0].pesoHumedo,null);assert.equal(records[0].peseSeco,null);
  await page.reload();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))[0].humedad),0);
  await page.getByText('CAPTURE-FIXTURE',{exact:true}).click();
  await page.getByRole('button',{name:'Registrar cosecha para la bolsa CAPTURE-FIXTURE-B01',exact:true}).click();
  let harvest=page.getByRole('dialog',{name:'Registrar cosecha',exact:true});
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).fill('430');
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).fill('');
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).press('Tab');
  await expect(harvest.getByLabel('Peso fresco (g)',{exact:true})).toHaveValue('');
  await harvest.getByRole('button',{name:'Guardar cosecha',exact:true}).click();
  await expect(harvest.getByLabel('Peso fresco (g)',{exact:true})).toBeFocused();
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).fill('0');
  await harvest.getByRole('button',{name:'Cancelar',exact:true}).click();
  await page.reload();await page.getByText('CAPTURE-FIXTURE',{exact:true}).click();
  await page.getByRole('button',{name:'Registrar cosecha para la bolsa CAPTURE-FIXTURE-B01',exact:true}).click();
  harvest=page.getByRole('dialog',{name:'Registrar cosecha',exact:true});
  await expect(harvest.getByLabel('Peso fresco (g)',{exact:true})).toHaveValue('0');
  assert.ok(await harvest.evaluate(el=>el.scrollWidth<=el.clientWidth),'harvest mobile overflow');
  assert.ok((await harvest.getByRole('button',{name:'1 de 5 estrellas',exact:true}).boundingBox()).height>=44);
  await harvest.screenshot({path:'/tmp/setas-capture-harvest-mobile.png'});
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).press('Enter');
  await expect(harvest).toHaveCount(0);
  let crops=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_cosechas')));
  assert.equal(crops[0].pesoFresco,0);assert.equal(crops[0].calidad,null);
  await page.getByRole('button',{name:'Registrar cosecha para la bolsa CAPTURE-FIXTURE-B01',exact:true}).click();
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).fill('430');
  await page.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='sdp_bit_cosechas')throw Error('fixture quota');return window.__setItem.call(this,k,v);};});
  await harvest.getByRole('button',{name:'Guardar cosecha',exact:true}).click();
  await expect(harvest.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(harvest.getByLabel('Peso fresco (g)',{exact:true})).toHaveValue('430');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_cosechas')).length),1);
  await page.evaluate(()=>Storage.prototype.setItem=window.__setItem);
  await harvest.getByRole('button',{name:'Guardar cosecha',exact:true}).click();
  await page.reload();
  crops=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_cosechas')));
  assert.equal(crops[1].pesoFresco,430);assert.equal(crops[1].calidad,null);
  // Preparation uses a synthetic recipe only in this isolated browser origin.
  await page.evaluate(()=>localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe:[{id:'aserrin_eucalipto',p:100}],sKey:'p_ostreatus_gris',hasPickedSpecies:true,lockedIds:[]})));
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=produccion`);
  await page.locator('#prod-bags').fill('');await page.locator('#prod-bags').press('Tab');
  await expect(page.locator('#prod-bags')).toHaveValue('');
  await page.getByRole('button',{name:'Imprimir',exact:true}).click();
  await expect(page.locator('#prod-bags')).toBeFocused();
  await expect(page.locator('#print-sheet')).toHaveCount(0);
  await page.reload();await expect(page.locator('#prod-bags')).toHaveValue('');
  await page.locator('#prod-bags').fill('2');
  await page.locator('#prod-kg').fill('1.5');await page.locator('#prod-h').fill('67');
  let moisture=page.locator('[name="ingredientMoisture-aserrin_eucalipto"]');
  await moisture.fill('0');await moisture.press('Tab');await expect(moisture).toHaveValue('0');
  await moisture.fill('');await moisture.press('Tab');await expect(moisture).toHaveValue('');
  await page.reload();await expect(moisture).toHaveValue('');
  await moisture.fill('0');await page.reload();await expect(moisture).toHaveValue('0');
  await page.screenshot({path:'/tmp/setas-capture-preparation-mobile.png',fullPage:true});
  console.log('PASS: trial/harvest blanks, optional null vs zero, kg/g, quota failure preservation, draft reopen/reload, keyboard submit/focus, 390px controls, preparation blanks/zero and print validation.');

  assert.deepEqual(errors,[]);

 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
