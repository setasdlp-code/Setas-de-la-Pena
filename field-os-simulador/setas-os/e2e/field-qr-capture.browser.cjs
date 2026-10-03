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
  if(pathname==='/__harness.html')body=body.toString().replace('hoyPreviewEventos: 0','scanNonce: 1, hoyPreviewEventos: 0');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'QR1',codigo:'SDP-QR1',especie:'Orellana Gris',estado:'activo',numBolsas:2,fechaInoculacion:'2026-09-10',operador:'fixture',lifecycleEvents:[]},{id:'QR2',codigo:'SDP-QR2',especie:'Orellana Gris',estado:'completado',numBolsas:2,lifecycleEvents:[]}]));
   window.__qrWrites=[];window.__qrPending=[];
   window.SetasEventosCultivoDB={registrarEvento:event=>{window.__qrWrites.push(event);return new Promise((resolve,reject)=>window.__qrPending.push({resolve,reject}));}};
   window.SetasBitacoraDB={actualizarLote:async()=>{}};
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html`);
  let sheet=page.getByRole('dialog',{name:'Captura rápida de campo'});
  await expect(sheet).toBeVisible();
  await sheet.getByLabel('Código impreso en la etiqueta').fill('SDP-QR1');
  await sheet.getByRole('button',{name:'Abrir',exact:true}).click();
  sheet=page.getByRole('dialog').filter({has:page.getByRole('button',{name:'Cerrar hoja de acción'})});
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('[data-action="evento-cosecha_parcial"]')).toHaveCount(0);
  await sheet.locator('[data-action="evento-observacion"]').click({timeout:3000});
  await sheet.getByTestId('qr-evento-observacion-nota').fill('Micelio uniforme, sin cambios visibles');
  await sheet.getByRole('button',{name:'Guardar observación',exact:true}).click();
  await expect(sheet.getByTestId('qr-evento-status')).toHaveAttribute('data-sync-status','pending');
  await page.evaluate(()=>window.__qrPending[0].reject(new Error('Conexión de prueba interrumpida')));
  await expect(sheet.getByTestId('qr-evento-status')).toHaveAttribute('data-sync-status','error');
  await sheet.getByRole('button',{name:'Reintentar',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.__qrWrites.length)).toBe(2);
  assert.ok(await page.evaluate(()=>window.__qrWrites[0].id===window.__qrWrites[1].id));
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))[0].lifecycleEvents.length),1);
  await page.evaluate(()=>window.__qrPending[1].resolve());
  await expect(sheet.getByTestId('qr-evento-status')).toHaveAttribute('data-sync-status','synchronized');
  await page.setViewportSize({width:390,height:844});
  assert.ok(await sheet.evaluate(el=>el.scrollWidth<=el.clientWidth),'field sheet must not overflow on mobile');
  if(process.env.SETAS_QR_SCREENSHOT)await sheet.screenshot({path:process.env.SETAS_QR_SCREENSHOT});
  await sheet.getByRole('button',{name:'Cerrar hoja de acción'}).click();
  await page.getByRole('button',{name:/Escanear lote/}).click();
  sheet=page.getByRole('dialog',{name:'Captura rápida de campo'});
  await sheet.getByLabel('Código impreso en la etiqueta').fill('SDP-QR2');
  await sheet.getByRole('button',{name:'Abrir',exact:true}).click();
  sheet=page.getByRole('dialog').filter({has:page.getByRole('button',{name:'Cerrar hoja de acción'})});
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('[data-action="evento-cosecha_parcial"]')).toHaveCount(0);
  await expect(sheet.locator('[data-action="evento-contaminacion"]')).toHaveCount(0);
  await expect(sheet.getByTestId('qr-evento-status')).toHaveCount(0);
  assert.deepEqual(errors,[]);
  console.log('PASS: real React QR resolution, permitted actions, pending/failure/sync status, same-ID retry, one local event, per-batch status and mobile layout.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
