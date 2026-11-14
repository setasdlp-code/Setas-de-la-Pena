'use strict';
// Alertas de clima del servidor (climate_alerts) en Hoy y en la sala.
// Se inyecta un SetasFirebase falso con subscribeToClimateAlerts: la app real
// lo recibe de firebase-init.js tras autenticar. También el caso en que la
// lectura falla (p. ej. reglas sin desplegar).
// Ejecutar: node e2e/server-climate-alerts.browser.cjs
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
  const H=3600000;
  const docs=[
   {id:'martha_01__out_of_band_temperature_c',roomId:'martha_01',kind:'out_of_band',metric:'temperature_c',status:'open',openedAt:Date.now()-H,
    detail:'Temperatura por encima de la banda del ciclo: 21 °C (banda 14–18 °C).',history:[{type:'opened',at:Date.now()-H}]},
   {id:'cloudlab_844__sensor_stale',roomId:'cloudlab_844',kind:'sensor_stale',status:'resolved',resolvedAt:Date.now()-2*H,
    history:[{type:'opened',at:Date.now()-5*H},{type:'resolved',at:Date.now()-2*H}]},
   {id:'martha_01__out_of_band_rh_pct',roomId:'martha_01',kind:'out_of_band',metric:'rh_pct',status:'pending',history:[]},
  ];
  for(const [width,height] of [[1280,900],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errores=[];page.on('pageerror',e=>errores.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(({docs})=>{
    localStorage.setItem('sdp_seeded','1');
    window.SETAS_LIVE_TELEMETRY={firestore:false};
    window.__alertCb=null;
    window.SetasFirebase=Object.assign(window.SetasFirebase||{},{subscribeToClimateAlerts:(cb)=>{window.__alertCb=cb;setTimeout(()=>cb(docs),0);return ()=>{window.__alertCb=null;};}});
   },{docs});
   await page.goto(`http://127.0.0.1:${port}/__harness.html?view=home`);

   const hoy=page.getByTestId('today-server-climate-alerts');
   await expect(hoy).toBeVisible();
   // Solo la abierta; la pendiente aún no supera el dwell y no se muestra.
   await expect(hoy.locator('[data-alert-id]')).toHaveCount(1);
   await expect(hoy.locator('[data-alert-id="martha_01__out_of_band_temperature_c"]')).toContainText('Martha Tent 01 · Temperatura fuera de banda');
   await expect(hoy).toContainText('21 °C (banda 14–18 °C)');
   await hoy.locator('summary').click();
   await expect(page.getByTestId('today-server-climate-alerts-history').locator('li')).toHaveCount(3);

   // Se resuelve en el servidor: desaparece de Hoy sin recargar.
   await page.evaluate(docs=>window.__alertCb(docs.map(d=>({...d,status:'resolved'}))),docs);
   await expect(hoy.locator('[data-alert-id]')).toHaveCount(0);

   // Vista de sala: abiertas y historial solo de esa sala.
   await page.evaluate(docs=>window.__alertCb(docs),docs);
   await page.goto(`http://127.0.0.1:${port}/__harness.html?view=clima`);
   const sala=page.getByTestId('room-server-climate-alerts');
   await expect(sala).toBeVisible();
   // Sala inicial: martha_01. Su historial no incluye el de Cloudlab.
   await expect(sala.locator('[data-alert-id="martha_01__out_of_band_temperature_c"]')).toContainText('Temperatura fuera de banda');
   await sala.locator('summary').click();
   await expect(page.getByTestId('room-server-climate-alerts-history').locator('li')).toHaveCount(1);
   await expect(page.getByTestId('room-server-climate-alerts-history')).not.toContainText('Sensor sin lecturas');
   assert.deepEqual(errores,[],`errores de página (${width}px): ${errores.join(' | ')}`);
   await page.close();
  }

  // Lectura rechazada: se dice, no se muestra una lista vacía como si no hubiera alertas.
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');
   window.SETAS_LIVE_TELEMETRY={firestore:false};
   window.SetasFirebase=Object.assign(window.SetasFirebase||{},{subscribeToClimateAlerts:(cb,onError)=>{setTimeout(()=>onError(new Error('permission-denied')),0);return ()=>{};}});
  });
  await page.goto(`http://127.0.0.1:${port}/__harness.html?view=home`);
  await expect(page.getByTestId('today-server-climate-alerts')).toHaveAttribute('data-state','error');
  await expect(page.getByTestId('today-server-climate-alerts')).toContainText('No se pudieron leer las alertas de clima del servidor');
  console.log('PASS alertas de clima del servidor: abiertas en Hoy y sala, historial, resolución en vivo y error de lectura a 1280 y 390 px.');
 } finally {
  if(browser) await browser.close();
  server.close();
 }
})().catch(e=>{console.error(e);process.exit(1);});
