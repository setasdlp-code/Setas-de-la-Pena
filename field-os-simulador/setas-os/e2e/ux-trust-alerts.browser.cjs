'use strict';
// Real React, local fixtures only: per-sensor provenance/freshness and one
// alert contract for Hoy, Bodega and the shell badge callback.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const {reserve}=require('../inventory-ledger.js');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);
  if(pathname==='/__harness.html')body=body.toString().replace('onTabChange: setTab,','onTabChange: setTab, onStockAlertChange: function(n){window.__badgeStock=n;},');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   const now=Date.now();
   await page.clock.install({time:now});
   await page.addInitScript(({now,reservation})=>{
    if(!sessionStorage.getItem('fixture-init')){
    sessionStorage.setItem('fixture-init','1');
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_lotes',JSON.stringify([{id:'STOCK',ingredienteId:'paja_trigo',activo:true,cantidadKgDisponible:5}]));
    localStorage.setItem('sdp_inv_reservas',JSON.stringify([reservation]));
    localStorage.setItem('sdp_alertas',JSON.stringify({paja_trigo:2}));
    localStorage.setItem('sdp_compras','[]');localStorage.setItem('sdp_bit_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');
    }
    window.SetasFirebase={subscribeToLiveClimate:cb=>{window.__publishClimate=cb;return ()=>{};}};
   },{now,reservation:reserve({ingredienteId:'paja_trigo',kg:4,batchId:'BATCH',at:now})});
   const url=`http://127.0.0.1:${server.address().port}/__harness.html`;
   await page.goto(url+'?view=home');
   await expect(page.locator('.stock-critical-card')).toContainText('Alerta de Stock Crítico (1)');
   await page.waitForFunction(()=>window.__badgeStock===1);
   await page.goto(url+'?view=inventario');
   await expect(page.locator('.stock-critical-card')).toContainText('Alerta de Stock Crítico (1)');
   await expect(page.locator('.stock-critical-card')).toContainText('Paja de trigo: 1.0 kg');
   await expect(page.locator('.stock-critical-card')).not.toContainText('Paja de cebada');
   await page.goto(url+'?view=clima');
   const prov=metric=>page.getByTestId('climate-provenance-'+metric);
   for(const m of ['temperature_c','rh_pct','co2_ppm','substrate_temperature_c']){
    await expect(prov(m)).toHaveAttribute('data-provenance','model');
    await expect(prov(m)).toContainText('Modelo · sin lectura');
   }
   await page.getByRole('button',{name:'Hub IoT & Firmware'}).click();
   const hub=page.getByRole('dialog',{name:'Hub de Integración IoT & Telemetría'});
   await hub.getByRole('tab',{name:'Consola Webhook / Test'}).click();
   await hub.locator('textarea').fill(JSON.stringify({room_id:'martha_01',temperature_c:18,rh_pct:80,co2_ppm:600}));
   await hub.getByRole('button',{name:'Inyectar Telemetría de Prueba'}).click();
   await hub.press('Escape');
   await expect(prov('temperature_c')).toHaveAttribute('data-provenance','entered');
   await expect(prov('rh_pct')).toContainText('Ingresado · prueba');
   await expect(page.getByTestId('climate-substrate-missing')).toContainText('Sustrato: sin lectura');
   await expect(prov('substrate_temperature_c')).toHaveCount(0);
   // Start a clean document so partial live data cannot inherit the test packet.
   await page.goto(url+'?view=clima');
   await page.waitForFunction(()=>typeof window.__publishClimate==='function');
   await page.evaluate(()=>window.__publishClimate({martha_01:{temperature_c:18,timestamp_local:new Date().toISOString()}}));
   await page.clock.runFor(2100);
   await expect(prov('temperature_c')).toHaveAttribute('data-provenance','measured');
   await expect(prov('temperature_c')).toHaveAttribute('data-freshness','fresh');
   await expect(prov('rh_pct')).toHaveAttribute('data-provenance','model');
   await expect(prov('co2_ppm')).toHaveAttribute('data-provenance','model');
   // CO2 ages while a new temperature packet arrives. Room age is fresh;
   // metric age remains old and must not be revived by the room timestamp.
   await page.evaluate(()=>window.__publishClimate({martha_01:{co2_ppm:600,timestamp_local:new Date().toISOString()}}));
   await page.clock.runFor(2100);
   await expect(prov('co2_ppm')).toHaveAttribute('data-freshness','fresh');
   await page.clock.runFor(94000);
   await page.evaluate(()=>window.__publishClimate({martha_01:{temperature_c:19,timestamp_local:new Date().toISOString()}}));
   await page.clock.runFor(2100);
   await expect(prov('temperature_c')).toHaveAttribute('data-freshness','fresh');
   await expect(prov('co2_ppm')).toHaveAttribute('data-freshness','stale');
   await expect(prov('co2_ppm')).toContainText('Lectura antigua');
   await expect(page.getByTestId('climate-co2-card')).toContainText('ppm compensados');
   await expect(page.getByTestId('climate-co2-card')).not.toContainText('ppm real');
   assert.ok(await page.locator('.climate-kpi-grid').evaluate(el=>el.scrollWidth<=el.clientWidth),'KPI source labels must fit their container');
   if(width===390)assert.ok(await page.locator('.climate-kpi-grid').evaluate(el=>[...el.children].every(c=>c.getBoundingClientRect().width>=el.clientWidth-2)),'mobile KPI cards must have a full-width readable column');
   await page.locator('.climate-kpi-grid').locator('.climate-kpi-card').first().scrollIntoViewIfNeeded();
   await page.screenshot({path:`/tmp/setas-trust-climate-${width}.png`});
   // Clearing managed inventory removes alerts everywhere; stored config alone
   // is not a watchlist and must not resurrect deleted inventory ingredients.
   await page.evaluate(()=>localStorage.setItem('sdp_lotes','[]'));
   await page.goto(url+'?view=inventario');
   await expect(page.locator('.stock-critical-card')).toHaveCount(0);
   await page.waitForFunction(()=>window.__badgeStock===0);
   await page.goto(url+'?view=home');
   await expect(page.locator('.stock-critical-card')).toHaveCount(0);
   assert.deepEqual(errors,[]);
   await page.close();
   console.log(`PASS ${width}px: absent/partial/stale telemetry, same stock alerts in Hoy/Bodega/badge, reservations and empty inventory.`);
  }
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
