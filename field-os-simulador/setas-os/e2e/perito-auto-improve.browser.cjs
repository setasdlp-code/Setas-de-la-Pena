'use strict';
// Auto-mejorar en la app real: con varios críticos avanza aunque el score de
// un solo ajuste quede igual, deja un resumen de lo que hizo y un solo
// "Deshacer" devuelve la receta anterior. Sin ajuste posible, lo dice.
// Run: node e2e/perito-auto-improve.browser.cjs
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
  if(pathname==='/__harness.html')body=body.toString().replace('<script src="simulador-app.js">','<script src="formulator-api.js"></script><script src="simulador-app.js">');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('setas_global_workmode','investigacion');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
  await page.selectOption('#form-species-context-select','p_ostreatus_gris');
  const getRecipe=()=>page.evaluate(()=>window.SetasFormulatorAPI.getRecipe().map(r=>({id:r.id,p:Number(r.p)})));
  const panel=page.locator('#bl-perito');
  const scoreOf=async()=>Number(await panel.locator('span',{hasText:/^SCORE$/}).locator('xpath=preceding-sibling::span[1]').textContent());

  // Dos críticos (C:N alto + N bajo): Auto-mejorar avanza y es reversible.
  const original=[{id:'paja_trigo',p:97},{id:'borra_cafe',p:3}];
  await page.evaluate(recipe=>window.SetasFormulatorAPI.applyRecipe(recipe),original);
  await expect(panel.locator('.perito-item').first()).toBeVisible();
  const before=await getRecipe();
  const scoreBefore=await scoreOf();
  await panel.getByRole('button',{name:/Auto-mejorar/}).first().click();
  const summary=panel.getByTestId('auto-improve-summary');
  await expect(summary).toBeVisible();
  assert.ok(Number(await summary.getAttribute('data-steps'))>=1);
  await expect(summary).toContainText(/críticos 2 → [01]/);
  const after=await getRecipe();
  assert.notDeepEqual(after,before);
  assert.ok(await scoreOf()>=scoreBefore,'Auto-mejorar no debe bajar el score');
  await summary.getByRole('button',{name:'Deshacer Auto-mejorar'}).click();
  await expect.poll(getRecipe).toEqual(before);
  await expect(summary).toHaveCount(0);

  // Sin ajuste aplicable que avance: lo dice y no toca la receta.
  const stuck=[{id:'guadua',p:70},{id:'borra_cafe',p:30}];
  await page.evaluate(recipe=>window.SetasFormulatorAPI.applyRecipe(recipe),stuck);
  await expect(panel.locator('.perito-item').first()).toBeVisible();
  const stuckBefore=await getRecipe();
  await panel.getByRole('button',{name:/Auto-mejorar/}).first().click();
  await expect(summary).toHaveAttribute('data-steps','0');
  await expect(summary).toContainText('no encontró un ajuste');
  assert.deepEqual(await getRecipe(),stuckBefore);

  await page.setViewportSize({width:390,height:844});
  assert.ok(await summary.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'el resumen no debe desbordar en móvil');
  assert.deepEqual(errors,[]);
  console.log('PASS: Auto-mejorar avanza con varios críticos, resume lo aplicado, se deshace en un paso y avisa cuando no encuentra ajuste.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
