'use strict';
// Alternativas del Perito en la app real: con el suplemento sobre su tope la
// tarjeta ya no propone bajarlo (lo que subía el C:N) sino otro ingrediente, y
// aplicarla baja el C:N; con un ajuste que llega al tope sin entrar en rango
// se ofrece completar con un segundo ingrediente; si no hay salida, lo dice.
// Run: node e2e/perito-alternatives.browser.cjs
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
  const panel=page.locator('#bl-perito');
  const cn=async()=>parseFloat(await panel.locator('.mgrid .mc',{hasText:/^C:N/i}).locator('.mval').textContent());
  const card=label=>panel.locator('.perito-item').filter({has:page.locator('.pi-label',{hasText:new RegExp(`^${label}$`)})});

  // Rastrojo de soya sobre su tope: alternativa que baja el C:N.
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),[{id:'paja_trigo',p:72},{id:'paja_soya',p:28}]);
  const cnCard=card('C:N demasiado alto');
  await expect(cnCard).toBeVisible();
  await expect(cnCard.locator('.pi-action')).toContainText('Alternativa:');
  await expect(cnCard.locator('.pi-action')).not.toContainText('Bajar Paja / rastrojo de soya');
  const cnBefore=await cn();
  await cnCard.getByRole('button',{name:/^Aplicar ajuste/}).click();
  await expect.poll(cn).toBeLessThan(cnBefore);

  // Ajuste que llega al tope sin entrar en rango: completar con otro ingrediente.
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),[{id:'aserrin_eucalipto',p:90},{id:'borra_cafe',p:10}]);
  const capCard=card('C:N demasiado alto');
  await expect(capCard).toContainText('Completar con');
  await expect(capCard.getByRole('button',{name:/Aplicar corrección combinada/})).toBeEnabled();
  await expect(card('Nitrógeno insuficiente').locator('.pi-action')).toContainText('Se corrige con el mismo ajuste que «C:N demasiado alto»');

  // Sin salida: lo dice.
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),[{id:'guadua',p:70},{id:'borra_cafe',p:30}]);
  const stuck=card('C:N demasiado alto');
  await expect(stuck).toContainText('Ningún otro ingrediente compatible acerca C:N al objetivo');
  await expect(stuck.getByRole('button',{name:/^Aplicar ajuste/})).toHaveCount(0);

  assert.deepEqual(errors,[]);
  console.log('PASS: alternativa cuando el suplemento está sobre su tope (baja el C:N), completar con segundo ingrediente, tarjeta remitida al mismo ajuste y aviso sin salida.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
