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
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  for(const [width,height] of [[1440,1000],[1280,900],[768,1024],[390,844],[320,568]]){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=home`);
   const cockpit=page.locator('.home-cockpit');
   const now=cockpit.getByRole('region',{name:'Acciones rápidas'});
   assert.equal(await cockpit.getByTestId('ux-v2-today').locator('.home-primary-column > :first-child').getAttribute('aria-label'),'Acciones rápidas','shift actions lead in reading and keyboard order');
   await expect(now.getByRole('button')).toHaveCount(3);
   await expect(now.getByTestId('cockpit-task-count')).toHaveCount(0);
   await expect(now.getByTestId('sync-indicator')).toHaveCount(0);
   await expect(now.getByTestId('open-day-close')).toHaveCount(0);
   await expect(now).not.toContainText(/pendientes|bloqueados|sin verificar/);
   await expect(cockpit.getByTestId('today-pending-panel').getByTestId('cockpit-task-count')).toContainText('0 pendientes');
   await expect(cockpit.getByTestId('today-session-panel').getByTestId('sync-indicator')).toBeVisible();
   const start=now.getByRole('button',{name:/Iniciar jornada/});await expect(start).toBeVisible();
   const box=await start.boundingBox();assert.ok(box.y+box.height<height-70,`first action above mobile rail at ${width}`);
   await expect(cockpit.getByRole('region',{name:'Alertas del cultivo'})).toHaveCount(0);
   const essential=cockpit.getByTestId('home-essential');
   await expect(essential.getByTestId('today-copilot-summary')).toHaveCount(0);
   await expect(essential.getByTestId('today-planning-summary')).toHaveCount(0);
   await expect(essential.locator('.home-overview')).toHaveCount(0);
   await cockpit.getByRole('button',{name:'Seguimiento',exact:true}).click();
   const followup=cockpit.getByTestId('home-followup');await expect(followup).toBeVisible();
   await expect(followup.locator('.home-tools-grid').getByRole('button')).toHaveCount(6);
   await expect(followup.locator('.home-kpi dd')).toHaveText(['0','0','0']);
   for(const id of ['today-planning-summary','today-copilot-summary']){
    const detail=followup.getByTestId(id);await expect(detail).not.toHaveAttribute('open','');
    await detail.locator(':scope > summary').press('Enter');await expect(detail).toHaveAttribute('open','');
    assert.ok(await cockpit.evaluate(el=>el.scrollWidth<=el.clientWidth),`${id} expanded fits at ${width}`);
    await detail.locator(':scope > summary').press('Enter');
   }
   await cockpit.getByRole('button',{name:'Hoy',exact:true}).click();
   const buttons=now.locator('.home-quick-action');assert.equal(await buttons.count(),3);
   assert.ok(await buttons.evaluateAll(els=>els.every(e=>e.getBoundingClientRect().height>=44)));
   assert.ok(await buttons.evaluateAll(els=>els.every(e=>e.scrollWidth<=e.clientWidth)),'action labels fit their buttons');
   assert.ok(await buttons.locator('div > div:first-child').evaluateAll(els=>els.every(e=>getComputedStyle(e).textOverflow!=='ellipsis')),'action names remain readable');
   await now.getByRole('button',{name:/Escanear lote/}).click();await expect(page.getByRole('dialog')).toBeVisible();
   await page.getByRole('dialog').press('Escape');
   await cockpit.getByRole('button',{name:'Seguimiento',exact:true}).click();
   await cockpit.getByTestId('home-followup').getByRole('button',{name:/Bodega/}).click();await expect(page).toHaveURL(/view=inventario/);
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=home`);
   await page.screenshot({path:`/tmp/setas-today-hierarchy-${width}.png`});
   assert.ok(await cockpit.evaluate(el=>el.scrollWidth<=el.clientWidth));assert.deepEqual(errors,[]);
   await page.close();console.log(`PASS Hoy ${width}: first action visible, summaries keyboard, no empty attention band, QR and Bodega routes.`);

  }
 // A populated shift shows each task once, outside the six shortcuts.
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const task=require('../task-engine.js').createTask({id:'FOCUS_TASK',type:'inspection',objectType:'batch',objectId:'FOCUS_BATCH',dueAt:new Date(Date.now()-3600000).toISOString(),priority:'normal',reason:'Revisión del lote de prueba',generatedBy:{source:'operator',ref:'browser-test'}});
  await page.addInitScript(({task})=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_tasks',JSON.stringify([task,{...task,id:'FOCUS_FUTURE',type:'colonization_check',dueAt:new Date(Date.now()+3*86400000).toISOString()}]));
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'FOCUS_BATCH',codigo:'SDP-FOCUS',estado:'incubacion',sKey:'shiitake',especie:'shiitake',numBolsas:1,fechaInoculacion:new Date().toISOString().slice(0,10),createdAt:new Date().toISOString()}]));
  },{task});
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=home`);
  const cockpit=page.locator('.home-cockpit'),now=cockpit.locator('.sdp-band--ahora'),pending=cockpit.getByTestId('today-pending-panel');
  await expect(now.getByRole('button')).toHaveCount(3);
  await expect(now).not.toContainText(/pendientes|bloqueados|sin verificar/);
  await expect(pending.getByTestId('cockpit-task-count')).toHaveText('1 pendiente');
  await expect(cockpit.getByTestId('cockpit-task-row')).toHaveCount(1);
  await expect(pending.getByTestId('cockpit-task-row')).toContainText('SDP-FOCUS');
  await expect(pending.getByRole('button',{name:/Imprimir etiquetas de SDP-FOCUS/})).toBeVisible();
  assert.ok(await cockpit.evaluate(el=>el.scrollWidth<=el.clientWidth),'populated tasks fit');
  await cockpit.getByRole('button',{name:'Seguimiento',exact:true}).click();
  await expect(cockpit.getByTestId('today-planning-summary').locator(':scope > summary')).toContainText('1');
  await cockpit.getByRole('button',{name:'Hoy',exact:true}).click();
  await pending.getByTestId('cockpit-task-row').click();
  await expect(page).toHaveURL(/view=bitacora/);
  await page.close();console.log(`PASS Hoy ${width}: three shortcuts only, one task counted once in separate panel, batch route preserved.`);
 }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
