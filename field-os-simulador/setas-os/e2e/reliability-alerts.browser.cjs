'use strict';
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
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');const body=fs.readFileSync(file);res.end(file.endsWith('__harness.html')?body.toString().replace('tab: tab,','tab: tab, isAdmin: true,'):body);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await page.addInitScript(()=>{
   if(!sessionStorage.getItem('reliability-fixture')){
    localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');sessionStorage.setItem('reliability-fixture','1');
   }
   window.__alertsAllow=false;window.__alertsCached=false;window.__alertsUnsubscribed=0;
   window.SetasDB={subscribeClimateAlerts:(next,error)=>{
    window.__alertsNext=next;window.__alertsError=error;
    if(!window.__alertsAllow)error({code:'permission-denied'});
    else next({records:window.__alertRecords,fromCache:window.__alertsCached});
    return ()=>window.__alertsUnsubscribed++;
   }};
  });
  const url=`http://127.0.0.1:${server.address().port}/__harness.html`;
  await page.goto(url+'?view=home');
  const today=page.getByTestId('today-server-alerts');
  await expect(today.getByRole('alert')).toContainText('no tiene permiso');
  await expect(today).not.toContainText('Sin alertas abiertas');
  await page.evaluate(()=>{
   window.__alertsAllow=true;
   window.__alertRecords=[
    {id:'M__temp',roomId:'martha_01',cycleId:'CM',status:'open',kind:'out_of_band',detail:'Temperatura fuera de banda: 24 °C.',openedAt:1794654000000},
    {id:'C__stale',roomId:'cloudlab_844',cycleId:'CC',status:'open',kind:'sensor_stale',detail:'Última lectura hace 40 min.',openedAt:1794654000001},
    {id:'M__rh',roomId:'martha_01',cycleId:'CM',status:'resolved',kind:'out_of_band',detail:'Humedad 70 %.',openedAt:1794653000000,resolvedAt:1794653900000},
    {id:'M__rh__episode_1794653000000',alertId:'M__rh',recordType:'episode',roomId:'martha_01',cycleId:'CM',status:'resolved',kind:'out_of_band',detail:'Humedad 70 %.',openedAt:1794653000000,resolvedAt:1794653900000},
   ];
  });
  await today.getByRole('button',{name:'Reintentar lectura'}).click();
  await expect(today).toContainText('Abiertas (2)');
  await today.locator('summary').click();await expect(today).toContainText('Historial (1)');
  await expect(today.getByText('Humedad 70 %.',{exact:true})).toHaveCount(1);
  await today.getByRole('button',{name:'Ver sala',exact:true}).first().click();
  const room=page.getByTestId('room-server-alerts');await expect(room).toContainText('Abiertas (1)');
  await expect(room).not.toContainText('Cloudlab 844');
  await expect(page.getByTestId('room-fae')).toContainText('Sin lote en la sala');
  await expect(page.getByTestId('room-fae')).not.toContainText('CFM');
  await page.evaluate(()=>window.__alertsNext({records:window.__alertRecords,fromCache:true}));
  await expect(room).toContainText('Copia local');
  await page.evaluate(()=>window.__alertsError({code:'unavailable'}));
  await expect(room.getByRole('alert')).toContainText('No se pudieron leer');
  await expect(room).not.toContainText('Abiertas (1)');
  await page.evaluate(()=>{
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'REL-1',codigo:'REL-1',sala:'martha_01',sKey:'p_ostreatus_gris',especie:'Orellana Gris',estado:'incubacion',fechaInoculacion:'2026-11-01',numBolsas:1}]));
   localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'REL-B1',codigo:'REL-B1',loteId:'REL-1',estado:'sana'}]));
   localStorage.setItem('sdp_bit_cosechas',JSON.stringify([{id:'REL-C1',loteId:'REL-1',pesoFresco:0.2}]));
  });
  await page.goto(url+'?view=clima');
  await expect(page.getByTestId('room-fae')).toContainText('Falta registrar la biomasa');
  await expect(page.getByTestId('room-fae')).not.toContainText('CFM');
  await page.goto(url+'?view=bitacora');
  await page.getByRole('button',{name:'≡ Tabla',exact:true}).click();
  const snapshot=await page.evaluate(()=>Object.fromEntries(['sdp_bit_lotes','sdp_bit_bolsas','sdp_bit_cosechas','sdp_inv_reservas','sdp_sync_queue'].map(k=>[k,localStorage.getItem(k)])));
  await page.evaluate(()=>{const original=Storage.prototype.setItem;window.__restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(k,v){if(k==='sdp_bit_bolsas')throw Error('fixture quota');return original.call(this,k,v);};});
  await page.getByRole('button',{name:'Eliminar lote REL-1',exact:true}).click();
  await page.getByRole('dialog',{name:'Eliminar lote',exact:true}).getByRole('button',{name:'Eliminar',exact:true}).click();
  await expect(page.getByTestId('local-save-error')).toBeVisible();
  const after=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(snapshot));
  assert.deepEqual(after,snapshot,'failed deletion must restore all durable records and queue');
  assert.equal(await page.evaluate(()=>localStorage.getItem('sdp_pending_write_v1')),null,'failed rollback must not replay a deletion after reload');
  await page.evaluate(()=>window.__restoreStorage());
  await page.reload();await expect(page.getByText('REL-1',{exact:true}).first()).toBeVisible();
  assert.deepEqual(errors,[]);
  console.log('PASS alert access failure/retry/cache, open/history dedup, room scoping, truthful FAE and atomic failed deletion/reload (390px).');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
