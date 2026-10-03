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
  for(const [width,height] of [[1280,900],[390,844],[320,568]]){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=home`);
   const cockpit=page.locator('.home-cockpit');
   const now=cockpit.getByRole('region',{name:'Banda 2: Ahora Turno en Curso'});
   const start=now.getByRole('button',{name:/Iniciar jornada/});await expect(start).toBeVisible();
   const box=await start.boundingBox();assert.ok(box.y+box.height<height-70,`first action above mobile rail at ${width}`);
   await expect(cockpit.getByRole('region',{name:'Banda 1: Atención Inmediata'})).toHaveCount(0);
   const record=cockpit.getByTestId('today-record-summary'),telemetry=cockpit.getByTestId('today-telemetry-summary');
   assert.equal(await record.getAttribute('open'),null);assert.equal(await telemetry.getAttribute('open'),null);
   await telemetry.locator('summary').press('Enter');await expect(telemetry).toHaveAttribute('open','');
   await expect(telemetry.getByTestId('today-climate-strip')).toBeVisible();
   await telemetry.locator('summary').press('Enter');await expect(telemetry).not.toHaveAttribute('open','');
   const buttons=now.locator('.home-quick-action');assert.equal(await buttons.count(),5);
   assert.ok(await buttons.evaluateAll(els=>els.every(e=>e.getBoundingClientRect().height>=44)));
   await now.getByRole('button',{name:/Escanear lote/}).click();await expect(page.getByRole('dialog')).toBeVisible();
   await page.getByRole('dialog').press('Escape');
   await now.getByRole('button',{name:/Entrada a Bodega/}).click();await expect(page).toHaveURL(/view=inventario/);
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=home`);
   await page.screenshot({path:`/tmp/setas-today-hierarchy-${width}.png`});
   assert.ok(await cockpit.evaluate(el=>el.scrollWidth<=el.clientWidth));assert.deepEqual(errors,[]);
   await page.close();console.log(`PASS Hoy ${width}: first action visible, summaries keyboard, no empty attention band, QR and Bodega routes.`);

  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
