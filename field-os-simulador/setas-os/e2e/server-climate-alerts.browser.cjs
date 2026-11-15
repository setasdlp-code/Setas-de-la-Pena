'use strict';
// Las alertas que abre la función alertasClima (climate_alerts) aparecen en
// Hoy como alarma y en el panel de su sala, aunque la app no estuviera abierta
// cuando se abrieron. Solo se muestran las que el servidor marca abiertas.
// Run: node e2e/server-climate-alerts.browser.cjs
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
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{
   localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');
   // Lo que entregaría Firestore: solo las alertas con status 'open'.
   window.SetasFirebase={subscribeToClimateAlerts:cb=>{
    window.__emitAlerts=cb;
    cb([{id:'cloudlab_844__out_of_band_temperature_c',roomId:'cloudlab_844',kind:'out_of_band',metric:'temperature_c',status:'open',
      detail:'Temperatura por encima de la banda del ciclo: 21 °C (banda 14–18 °C).',openedAt:Date.now()-15*60000}]);
    return ()=>{window.__unsubscribed=true;};
   }};
  });
  const base=`http://127.0.0.1:${server.address().port}/__harness.html`;

  // 1. Hoy: alarma con el nombre de la sala y acción para ir a ella.
  await page.goto(`${base}?view=home`);
  const item=page.locator('[data-testid="today-exceptions"] li[data-exception-kind="clima"]');
  await expect(item).toHaveCount(1);
  await expect(item).toHaveAttribute('data-severity','alarma');
  await expect(item).toContainText('Cloudlab 844: clima fuera de banda');
  await expect(item).toContainText('21 °C (banda 14–18 °C)');
  await expect(item).toContainText('Aviso del servidor, abierto hace 15 min');

  // 2. "Ver sala" abre Clima en esa sala, donde la alerta también se ve.
  await item.getByRole('button',{name:'Ver sala',exact:true}).click();
  const roomAlerts=page.getByTestId('climate-server-alerts');
  await expect(roomAlerts).toBeVisible();
  await expect(roomAlerts).toContainText('Clima fuera de banda');
  await expect(roomAlerts).toContainText('aviso del servidor');

  // 3. Cuando el servidor la resuelve, desaparece de la sala.
  await page.evaluate(()=>window.__emitAlerts([]));
  await expect(roomAlerts).toHaveCount(0);

  assert.deepEqual(errors,[]);
  console.log('server-climate-alerts: ok');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
