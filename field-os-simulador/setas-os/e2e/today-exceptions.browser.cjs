'use strict';
// Banda 1 de Hoy con las excepciones de today-exceptions.js montadas en la app
// real: un cambio atascado en la cola (con su Reintentar), un lote de Bodega
// sobregirado, un lote con incubación más larga que la referencia del
// catálogo y un sensor que manda valores imposibles por WebSocket — la misma
// puerta que la telemetría de verdad, no el probador del Hub.
// Ejecutar: node e2e/today-exceptions.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  for(const [width,height] of [[1280,900],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errores=[];page.on('pageerror',e=>errores.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   let socket=null;
   await page.routeWebSocket(`ws://127.0.0.1:${port}/telemetria`,ws=>{socket=ws;});
   await page.addInitScript(({port})=>{
    const daysAgo=d=>new Date(Date.now()-d*86400000).toISOString().slice(0,10);
    localStorage.setItem('sdp_seeded','1');
    window.SETAS_LIVE_TELEMETRY={websocketUrl:`ws://127.0.0.1:${port}/telemetria`,firestore:false};
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([
     {id:'BIT_E2E',codigo:'SDP-E2E-INC',sKey:'p_ostreatus_gris',especie:'p_ostreatus_gris',estado:'incubacion',fechaInoculacion:daysAgo(27),numBolsas:1,createdAt:new Date().toISOString()},
    ]));
    localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'B1',loteId:'BIT_E2E',codigo:'SDP-E2E-INC-B01',num:1,estado:'sana',col100:null}]));
    localStorage.setItem('sdp_lotes',JSON.stringify([
     {id:'fx-1',ingredienteId:'paja_trigo',compraId:'c',activo:true,cantidadKgTotal:5,cantidadKgDisponible:0,sobregiroKg:2,precioPorKgCOP:1000,fechaIngreso:'2026-10-01'},
    ]));
    localStorage.setItem('sdp_sync_queue',JSON.stringify([
     {id:'actualizarLote:lote:BIT_E2E:1',type:'actualizarLote',key:'lote:BIT_E2E',args:['BIT_E2E',{nota:'x'}],at:1,attempts:5,status:'stuck',nextAttemptAt:1,lastError:'permission-denied'},
    ]));
   },{port});
   await page.goto(`http://127.0.0.1:${port}/__harness.html?view=home`);

   const lista=page.getByTestId('today-exceptions');
   await expect(lista).toBeVisible();
   await expect(lista.locator('[data-exception-kind="sync"][data-severity="alarma"]')).toContainText('1 cambio sin sincronizar');
   await expect(lista.locator('[data-exception-kind="bodega"]')).toContainText('Recuento necesario en 1 lote de Bodega');
   const lote=lista.locator('[data-exception-kind="lote"]');
   await expect(lote).toContainText('SDP-E2E-INC: día 27 de incubación');
   await expect(lote).toContainText('heurística');
   await expect(lote).toHaveAttribute('data-severity','vigilar');

   // Sensor con valores imposibles, por el transporte real.
   await expect.poll(()=>socket!==null).toBe(true);
   for(let i=0;i<3;i++) socket.send(JSON.stringify({room_id:'incubacion_01',device_id:'esp32-e2e',observed_at:new Date(Date.now()+i).toISOString(),temperature_c:-45}));
   const sensor=lista.locator('[data-exception-kind="sensor"]');
   await expect(sensor).toContainText('esp32-e2e (incubacion_01): 3 lecturas imposibles de temperatura');

   // Alarmas antes que "vigilar".
   const severidades=await lista.locator('li').evaluateAll(els=>els.map(e=>e.dataset.severity));
   assert.ok(severidades.indexOf('vigilar')>severidades.lastIndexOf('alarma'),`orden: ${severidades}`);

   // Reintentar devuelve la operación a pendiente y la alarma desaparece.
   await lista.locator('[data-exception-kind="sync"]').getByRole('button',{name:'Reintentar'}).click();
   await expect(lista.locator('[data-exception-kind="sync"][data-severity="alarma"]')).toHaveCount(0);
   const estado=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_sync_queue'))[0]?.status);
   assert.equal(estado,'pending');

   // "Abrir lote" lleva a la ficha del lote.
   await lote.getByRole('button',{name:'Abrir lote'}).click();
   await expect(page.getByText('SDP-E2E-INC').first()).toBeVisible();

   assert.deepEqual(errores,[],`errores de página (${width}px): ${errores.join(' | ')}`);
   await page.close();
  }
  // ── Notificaciones: con permiso y la app en segundo plano se avisan solo
  // las alarmas nuevas, una vez cada una.
  {
   const page=await browser.newPage({viewport:{width:1280,height:900}});
   const errores=[];page.on('pageerror',e=>errores.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{
    localStorage.setItem('sdp_seeded','1');
    window.__notes=[];
    window.Notification=class{constructor(title,opts){window.__notes.push({title,tag:opts&&opts.tag});}static requestPermission(){return Promise.resolve('granted');}};
    window.Notification.permission='granted';
    Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});
    // Se registre o no el service worker del banco, el aviso sale por uno de
    // los dos caminos; ambos quedan anotados para comprobar que no se duplica.
    if(window.ServiceWorkerRegistration)ServiceWorkerRegistration.prototype.showNotification=function(title,opts){window.__notes.push({title,tag:opts&&opts.tag});return Promise.resolve();};
    localStorage.setItem('sdp_lotes',JSON.stringify([{id:'fx-1',ingredienteId:'paja_trigo',compraId:'c',activo:true,cantidadKgTotal:5,cantidadKgDisponible:0,sobregiroKg:2,precioPorKgCOP:1000,fechaIngreso:'2026-10-01'}]));
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'BIT_N',codigo:'SDP-N',sKey:'p_ostreatus_gris',estado:'incubacion',fechaInoculacion:'2026-01-01',numBolsas:0}]));
   });
   await page.goto(`http://127.0.0.1:${port}/__harness.html?view=home`);
   await expect(page.getByTestId('today-exceptions')).toBeVisible();
   await expect.poll(()=>page.evaluate(()=>window.__notes.map(n=>n.tag))).toEqual(['setas-bodega:overdraw']);
   // Otro render (cambio de vista y vuelta) no repite el aviso.
   await page.evaluate(()=>window.dispatchEvent(new Event('online')));
   await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>window.__notes.length),1,'una alarma ya avisada no se repite');
   await expect(page.getByTestId('enable-notifications')).toHaveCount(0);
   assert.deepEqual(errores,[],`errores de página (notificaciones): ${errores.join(' | ')}`);
   await page.close();
  }
  console.log('PASS today-exceptions: sincronización atascada + Reintentar, sobregiro de Bodega, incubación sobre la referencia rotulada como heurística, lecturas imposibles por WebSocket; orden por severidad a 1280 y 390 px; notificación solo de alarmas nuevas, sin repetir.');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
