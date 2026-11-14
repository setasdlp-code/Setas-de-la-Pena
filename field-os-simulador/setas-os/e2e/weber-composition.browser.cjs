'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const recipe=[{id:'pellets_weber_hickory',p:79},{id:'salvado_trigo',p:20},{id:'carbonato_calcio',p:1}];
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);if(file.endsWith('__harness.html'))body=body.toString().replace('<script src="simulador-app.js">','<script src="formulator-api.js"></script><script src="simulador-app.js">');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   await page.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('setas_global_workmode','investigacion');});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
   await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
   await page.selectOption('#form-species-context-select','shiitake');
   await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),recipe);
   const panel=page.locator('#bl-perito');const notice=panel.getByTestId('weber-composition');
   await expect(notice).toBeVisible();await expect(notice).toContainText('C:N ≈276');
   await expect(notice).toContainText('Confianza baja');
   await notice.locator('summary').click();
   await expect(notice.locator('tbody tr')).toHaveCount(5);
   await expect(notice.locator('tbody tr').first()).toContainText('Estimación de trabajo');
   await expect(panel.getByRole('button',{name:/Auto-mejorar/})).toBeDisabled();
   assert.equal(await panel.getByRole('button',{name:/Aplicar ajuste|Aplicar corrección combinada/}).count(),0);
   // Save from the existing experimental trial flow, then prove the captured
   // recipe and forecast survive editing the active percentages.
   await panel.getByRole('button',{name:'+ Crear prueba',exact:true}).click();
   await page.getByPlaceholder('ej. Ostra gris — ajuste C:N lote 12').fill('Weber piloto');
   await page.getByRole('button',{name:'Guardar prueba',exact:true}).click();
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('setas_v6'))[0]);
   assert.equal(saved.predictionSnapshot.comparison.rows.length,5);
   assert.ok(saved.predictionSnapshot.modelVersion);assert.ok(saved.predictionSnapshot.capturedAt);
   assert.equal(saved.predictionSnapshot.recipe[0].p,79);
   // Notice dialog can be dismissed through its visible acknowledgement.
   const close=page.getByRole('button',{name:/Entendido|Aceptar|Cerrar/,exact:true});if(await close.count())await close.first().click();
   await page.evaluate(()=>window.SetasFormulatorAPI.applyRecipe([{id:'aserrin_roble',p:79},{id:'salvado_trigo',p:20},{id:'carbonato_calcio',p:1}]));
   await expect(page.getByTestId('weber-composition')).toHaveCount(0);
   const still=await page.evaluate(()=>JSON.parse(localStorage.getItem('setas_v6'))[0]);assert.deepEqual(still.predictionSnapshot,saved.predictionSnapshot);
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('PASS: Weber usable, evidence comparison, guarded automatic dosing, saved forecast and legacy recipe at desktop/mobile.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
