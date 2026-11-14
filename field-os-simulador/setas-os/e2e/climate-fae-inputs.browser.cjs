'use strict';
// La tarjeta de ventilación (FAE) solo calcula con datos reales de la sala:
// sin lote no muestra ningún número, y con lote usa su sustrato registrado y
// el volumen de esa carpa, declarando los supuestos del modelo.
// Run: node e2e/climate-fae-inputs.browser.cjs
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
  const url=`http://127.0.0.1:${server.address().port}/__harness.html?view=clima`;
  const seed=lotes=>page.addInitScript(l=>{localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify(l));localStorage.setItem('sdp_bit_bolsas','[]');},lotes);
  const card=page.getByTestId('climate-fae-card');

  // 1. Sala sin lote: ningún caudal, ningún ciclo de trabajo.
  await seed([{id:'OTRA',codigo:'OTRA',especie:'Shiitake',estado:'incubacion',sala:'cloudlab_844',numBolsas:8,pesoHumedo:2}]);
  await page.goto(url);
  await expect(card).toHaveAttribute('data-fae-status','no_lot');
  await expect(page.getByTestId('climate-fae-missing')).toContainText('Sin lote activo en la sala');
  await expect(card).not.toContainText('CFM');
  await expect(card).not.toContainText('Duty Cycle');

  // 2. Lote en la sala sin masa registrada: tampoco se calcula.
  const page2=await browser.newPage({viewport:{width:1280,height:900}});
  await page2.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page2.addInitScript(()=>{localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'SIN',codigo:'SIN',especie:'Shiitake',estado:'fructificacion',sala:'martha_01',numBolsas:'',pesoHumedo:''}]));localStorage.setItem('sdp_bit_bolsas','[]');});
  await page2.goto(url);
  await expect(page2.getByTestId('climate-fae-card')).toHaveAttribute('data-fae-status','no_mass');
  await page2.close();

  // 3. Lote con masa: usa su sustrato y el volumen real de la carpa, con supuestos declarados.
  const page3=await browser.newPage({viewport:{width:1280,height:900}});
  page3.on('pageerror',e=>errors.push(e.message));
  await page3.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page3.addInitScript(()=>{localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'MAR',codigo:'MAR',especie:'Shiitake',estado:'fructificacion',sala:'martha_01',numBolsas:10,pesoHumedo:2}]));localStorage.setItem('sdp_bit_bolsas','[]');});
  await page3.goto(url);
  const card3=page3.getByTestId('climate-fae-card');
  await expect(card3).toHaveAttribute('data-fae-status','ok');
  await expect(card3).toContainText('Sustrato húmedo: 20 kg · 0.59 m³');
  await expect(card3).toContainText('CFM');
  await expect(page3.getByTestId('climate-fae-assumptions')).toContainText('ninguno de los dos tiene fuente verificada');
  await expect(card3).toContainText(/[\d.]+ CFM\([\d.]+ m³\/h · [\d.]+ ACH\)/);

  assert.deepEqual(errors,[]);
  console.log('climate-fae-inputs: ok');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
