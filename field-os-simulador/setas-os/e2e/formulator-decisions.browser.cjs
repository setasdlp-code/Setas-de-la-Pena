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
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  const type=path.extname(file);
  res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html'})[type]||'application/octet-stream');
  let body=fs.readFileSync(file);
  if(path.basename(file)==='__harness.html') body=body.toString().replace('<script src="simulador-app.js">','<script src="formulator-api.js"></script><script src="simulador-app.js">');
  res.end(body);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const errors=[];
  const open=async(recipe,lockedIds=[],confirmed=true)=>{
   const page=await browser.newPage({viewport:{width:1366,height:900}});
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(({recipe,lockedIds,confirmed})=>{
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe,sKey:'p_ostreatus_gris',hasPickedSpecies:confirmed,lockedIds}));
   },{recipe,lockedIds,confirmed});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
   await expect(page.locator('.rec-pct-input').first()).toBeVisible();
   await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
   return page;
  };
  const initial=[{id:'aserrin_eucalipto',p:13.3333},{id:'paja_trigo',p:1},{id:'cascarilla_arroz',p:1},{id:'salvado_trigo',p:1}];
  const balance=await open(initial,['aserrin_eucalipto']);
  await balance.getByTestId('formulator-next-action').click();
  const recipe=await balance.evaluate(()=>SetasFormulatorAPI.getRecipe());
  assert.equal(recipe[0].p,13.3333);
  assert.ok(Math.abs(recipe.reduce((s,r)=>s+r.p,0)-100)<1e-6);
  await balance.locator('#bl-perito').getByRole('button',{name:/^Deshacer \(/}).click();
  assert.deepEqual(await balance.evaluate(()=>SetasFormulatorAPI.getRecipe()),initial);
  await balance.close();
  console.log('PASS precise balance preserves fixed values and can be undone.');

  const fixed=await open([{id:'aserrin_eucalipto',p:80},{id:'salvado_trigo',p:10}],['aserrin_eucalipto','salvado_trigo']);
  await fixed.getByTestId('formulator-next-action').click();
  await expect(fixed.getByRole('dialog')).toContainText('Todos los porcentajes están fijados');
  assert.equal((await fixed.evaluate(()=>SetasFormulatorAPI.getRecipe())).reduce((s,r)=>s+r.p,0),90);
  await fixed.close();
  console.log('PASS impossible balance explains the lock blocker and preserves the draft.');

  const page=await open([{id:'bagazo_caña',p:97},{id:'pulpa_cafe',p:3}]);
  const next=page.getByTestId('formulator-next-action');
  await expect(next).toHaveText('Corregir receta');
  await next.click();
  assert.ok(await page.evaluate(()=>!!document.activeElement.closest('#bl-perito')));
  await page.getByRole('tab',{name:'Generador de Recetas',exact:true}).click();
  const workbench=page.locator('[data-perito-variant="workbench"]');
  await expect(workbench).toBeVisible();
  await workbench.getByRole('button',{name:'Corregir receta',exact:true}).click();
  assert.ok(await page.evaluate(()=>!!document.activeElement.closest('[data-perito-variant="workbench"]')));
  console.log('PASS critical recipes route to recommendations in both Formulador and workbench.');

  // An impossible budget must explain the cost rejection, not invent a
  // supplementation cause. Changing the budget invalidates the old result.
  await page.getByRole('button',{name:'Catálogo',exact:true}).click();
  const cost=page.locator('#opt-max-cost');
  await cost.fill('1');
  await page.getByRole('button',{name:'Calcular',exact:true}).click();
  const reasons=page.getByTestId('generator-rejection-reasons');
  await expect(reasons).toContainText('Supera el costo máximo');
  await expect(reasons).not.toContainText('Tus bases requieren más suplementación');
  await cost.fill('');
  await expect(reasons).toHaveCount(0);
  await page.getByRole('button',{name:'Calcular',exact:true}).click();
  await expect(page.locator('.opt-result').first()).toBeVisible();
  await expect(page.getByTestId('generator-candidate-context').first()).toContainText('C:N objetivo');
  await page.getByRole('button',{name:'Rescate',exact:true}).click();
  await expect(page.locator('.generator-status')).toContainText('Rescate');
  await page.getByRole('button',{name:'Producción',exact:true}).click();
  await expect(page.locator('.generator-status')).toContainText('Producción');
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.locator('.sim-root').evaluate(el=>el.scrollWidth<=el.clientWidth),'generator reflows on mobile');
  await page.locator('#gen-panel-title').scrollIntoViewIfNeeded();
  await page.screenshot({path:'/tmp/setas-formulator-decisions-mobile.png'});
  await cost.fill('1');
  await expect(page.locator('.opt-result')).toHaveCount(0);
  assert.deepEqual(errors,[]);
  await page.close();
  console.log('PASS actual rejection reasons, fresh candidates with own targets, stale-result invalidation and mobile reflow.');
  const unconfirmed=await open([{id:'paja_trigo',p:100}],[],false);
  await unconfirmed.getByRole('tab',{name:'Generador de Recetas',exact:true}).click();
  await expect(unconfirmed.getByRole('button',{name:'Calcular',exact:true})).toBeDisabled();
  await unconfirmed.getByRole('button',{name:'Diagnóstico',exact:true}).click();
  await unconfirmed.locator('[data-perito-variant="workbench"]').getByRole('button',{name:'Elegir especie',exact:true}).click();
  await expect(unconfirmed.locator('#generator-species-select')).toBeFocused();
  await unconfirmed.locator('#generator-species-select').selectOption('p_ostreatus_gris');
  await expect(unconfirmed.getByRole('button',{name:'Calcular',exact:true})).toBeEnabled();
  await unconfirmed.close();
  assert.deepEqual(errors,[]);
  console.log('PASS Generator requires and focuses an explicit species selection.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
