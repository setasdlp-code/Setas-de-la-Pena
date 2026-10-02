'use strict';
// Un solo panel del Perito: el Formulador (#bl-perito) y la Mesa del Perito
// (subpestaña Generador) muestran el mismo veredicto, las mismas tarjetas y la
// misma cuadrícula de métricas, sin la barra resumen duplicada ni el texto
// "sin mutar mesa" junto a botones que sí cambian la receta.
// Run: node e2e/perito-panel-unified.browser.cjs
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
  await page.evaluate(recipe=>window.SetasFormulatorAPI.applyRecipe(recipe),[{id:'paja_trigo',p:97},{id:'borra_cafe',p:3}]);

  const read=async panel=>({
   score:Number(await panel.locator('span',{hasText:/^SCORE$/}).locator('xpath=preceding-sibling::span[1]').textContent()),
   labels:await panel.locator('.perito-item .pi-label').allTextContents(),
   metrics:await panel.locator('.mgrid .mlbl').allTextContents(),
   text:await panel.innerText(),
  });
  const form=page.locator('#bl-perito');
  await expect(form.locator('.perito-item').first()).toBeVisible();
  const a=await read(form);
  assert.equal(await form.getAttribute('data-perito-variant'),'formulador');
  assert.doesNotMatch(a.text,/CALIFICACIÓN|Calificación/,'la barra resumen duplicada no debe volver');
  assert.equal(a.metrics.length,6,a.metrics.join(', '));
  await expect(form.getByTestId('metric-sub')).toContainText('por kg de hongo');
  // Auto-mejorar antes que el asistente IA en el orden de lectura.
  const buttons=await form.locator('button').allTextContents();
  assert.ok(buttons.findIndex(t=>/Auto-mejorar/.test(t))<buttons.findIndex(t=>/Asistente IA/.test(t)),buttons.join(' | '));

  await page.locator('#formular-tab-generador').click();
  await page.getByRole('button',{name:/Perito Diagnóstico Vivo/}).click();
  const wb=page.locator('.perito-standalone-panel');
  await expect(wb.locator('.perito-item').first()).toBeVisible();
  assert.equal(await wb.getAttribute('data-perito-variant'),'workbench');
  const b=await read(wb);
  assert.equal(b.score,a.score,'mismo veredicto en ambos lugares');
  assert.deepEqual(b.labels,a.labels,'mismas tarjetas en el mismo orden');
  assert.deepEqual(b.metrics,a.metrics,'misma cuadrícula de métricas');
  assert.doesNotMatch(b.text,/sin mutar mesa|Sugerencias Inteligentes/i);
  assert.match(b.text,/Contexto Físico y Capacidad de Proceso/i);
  assert.equal(await page.locator('#bl-perito').count(),0,'el id del Formulador no se duplica en la Mesa del Perito');

  // Aplicar desde la Mesa del Perito cambia la receta y se refleja al volver.
  const before=await page.evaluate(()=>window.SetasFormulatorAPI.getRecipe());
  await wb.locator('.pi-apply:not([disabled])').first().click();
  await expect.poll(()=>page.evaluate(()=>window.SetasFormulatorAPI.getRecipe())).not.toEqual(before);
  const after=await read(wb);
  await page.locator('#formular-tab-mesa').click();
  await expect(page.locator('#bl-perito .perito-item').first()).toBeVisible();
  assert.equal((await read(page.locator('#bl-perito'))).score,after.score);

  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.locator('#bl-perito').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'el panel no debe desbordar en móvil');
  assert.deepEqual(errors,[]);
  console.log(`PASS: Formulador y Mesa del Perito muestran el mismo veredicto (${a.score}), ${a.labels.length} tarjetas y ${a.metrics.length} métricas; sin barra duplicada; aplicar desde la Mesa se refleja en el Formulador.`);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
