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
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{if(!sessionStorage.getItem('fixture-init')){
   localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'RECOVERY',codigo:'RECOVERY',especie:'Orellana Gris',estado:'incubacion',fechaInoculacion:'2026-08-01',numBolsas:1}]));
   localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'RECOVERY-B01',loteId:'RECOVERY',codigo:'RECOVERY-B01',estado:'sana',observaciones:'Original'}]));sessionStorage.setItem('fixture-init','1');}});
  const url=`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`;
  await page.goto(url);await page.getByText('RECOVERY',{exact:true}).click();await page.getByRole('button',{name:'Ver tabla de bolsas',exact:true}).click();
  const input=page.getByLabel('Observaciones de la bolsa RECOVERY-B01',{exact:true});
  await input.fill('Borrador recuperable');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_bolsas'))[0].observaciones),'Original');
  await page.reload();await page.getByText('RECOVERY',{exact:true}).click();await page.getByRole('button',{name:'Ver tabla de bolsas',exact:true}).click();
  await expect(input).toHaveValue('Borrador recuperable');
  const queueBefore=await page.evaluate(()=>localStorage.getItem('sdp_sync_queue'));
  await page.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='sdp_bit_bolsas')throw Error('fixture quota');return window.__setItem.call(this,k,v);};});
  await page.getByRole('button',{name:'Guardar observaciones de RECOVERY-B01',exact:true}).click();
  await expect(page.locator('.bag-observation-editor').filter({has:input}).getByRole('alert')).toContainText('No se pudo guardar');
  await expect(input).toHaveValue('Borrador recuperable');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_bolsas'))[0].observaciones),'Original');
  assert.equal(await page.evaluate(()=>localStorage.getItem('sdp_sync_queue')),queueBefore);
  await page.getByRole('button',{name:'Primordios',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'No se pudo guardar',exact:true})).toBeVisible();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))[0].estado),'incubacion');
  await page.getByRole('dialog',{name:'No se pudo guardar',exact:true}).press('Escape');
  await page.evaluate(()=>Storage.prototype.setItem=window.__setItem);
  await page.getByRole('button',{name:'Guardar observaciones de RECOVERY-B01',exact:true}).click();
  await expect(page.getByRole('button',{name:'Guardar observaciones de RECOVERY-B01',exact:true})).toHaveCount(0);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_bolsas'))[0].observaciones),'Borrador recuperable');
  await page.reload();await page.getByText('RECOVERY',{exact:true}).click();await page.getByRole('button',{name:'Ver tabla de bolsas',exact:true}).click();await expect(input).toHaveValue('Borrador recuperable');
  await input.fill('Descartar');await input.press('Escape');await expect(input).toHaveValue('Borrador recuperable');
  await input.fill('Cancelar botón');await page.getByRole('button',{name:'Cancelar observaciones de RECOVERY-B01',exact:true}).click();await expect(input).toHaveValue('Borrador recuperable');
  await input.fill('Cancelar con fallo');
  await page.evaluate(()=>{window.__removeItem=Storage.prototype.removeItem;Storage.prototype.removeItem=function(k){if(k.startsWith('setas_bag_observation_draft:'))throw Error('fixture storage');return window.__removeItem.call(this,k);};});
  await page.getByRole('button',{name:'Cancelar observaciones de RECOVERY-B01',exact:true}).click();
  await expect(input).toHaveValue('Cancelar con fallo');await expect(page.locator('.bag-observation-editor').filter({has:input}).getByRole('alert')).toContainText('El texto se conserva');
  await page.evaluate(()=>Storage.prototype.removeItem=window.__removeItem);
  await page.getByRole('button',{name:'Cancelar observaciones de RECOVERY-B01',exact:true}).click();
  await expect(input).toHaveValue('Borrador recuperable');
  await input.fill('Guardar con Enter');await input.press('Enter');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_bolsas'))[0].observaciones),'Guardar con Enter');
  // Surface (infrared) readings append to the bag history; invalid input is refused.
  const surface=page.getByTestId('bag-surface-RECOVERY-B01');
  await expect(surface.getByTestId('bag-surface-last')).toHaveText('Sin lecturas de superficie');
  await surface.getByLabel('Temperatura de superficie de la bolsa RECOVERY-B01 en grados Celsius',{exact:true}).fill('120');
  await page.getByRole('button',{name:'Registrar superficie de RECOVERY-B01',exact:true}).click();
  await expect(surface.getByRole('alert')).toContainText('entre -10 y 80');
  await surface.getByLabel('Temperatura de superficie de la bolsa RECOVERY-B01 en grados Celsius',{exact:true}).fill('23.4');
  await surface.getByLabel('Temperatura del aire junto a la bolsa RECOVERY-B01 en grados Celsius, opcional',{exact:true}).fill('22');
  await page.getByRole('button',{name:'Registrar superficie de RECOVERY-B01',exact:true}).click();
  await expect(surface.getByTestId('bag-surface-last')).toContainText('23.4 °C · +1.4 °C vs aire');
  await expect(surface.getByTestId('bag-surface-last')).toContainText('1 lectura');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_bolsas'))[0].lecturasSuperficie);
  assert.equal(stored.length,1);assert.equal(stored[0].metodo,'infrarrojo_superficie');assert.equal(stored[0].deltaC,1.4);
  await page.setViewportSize({width:390,height:844});await input.scrollIntoViewIfNeeded();assert.ok((await input.boundingBox()).height>=44);
  await page.screenshot({path:'/tmp/setas-bag-edit-recovery.png'});
  assert.deepEqual(errors,[]);console.log('PASS bag observation: draft reload, failed durable write without sync, retry, durable reload, cancel and Enter.');

 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
