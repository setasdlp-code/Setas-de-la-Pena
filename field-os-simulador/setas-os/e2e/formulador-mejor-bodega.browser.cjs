'use strict';
// Vista "Mejor con Bodega" en el Formulador: dos recetas, banda de EB con su
// escala, cobertura, marca de autoclave y "Usar esta receta".
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const LOTS=[
 ['aserrin_eucalipto',200,250],['salvado_trigo',40,1400],['retamo_espinoso',4,150],
 ['carbonato_calcio',5,900],['yeso',5,700],['aserrin_roble',200,400],
].map(([ingredienteId,kg,precio])=>({id:`L-${ingredienteId}`,compraId:'e2e',ingredienteId,cantidadKgTotal:kg,cantidadKgDisponible:kg,precioPorKgCOP:precio,fechaIngreso:'2026-10-01',activo:true}));

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
  const open=async(viewport,lots=LOTS,recipe=[])=>{
   const errors=[];
   const page=await browser.newPage({viewport});
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(({lots,recipe})=>{
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_lotes',JSON.stringify(lots));
    localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe,sKey:'p_ostreatus_gris',hasPickedSpecies:true,lockedIds:[]}));
   },{lots,recipe});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
   await page.waitForFunction(()=>window.SetasFormulatorAPI?.adapterType()==='native');
   // Con la receta vacía el borrador no recuerda la especie: se elige como lo haría el operador.
   const desktopSelect=page.locator('#form-species-context-select');
   await (await desktopSelect.isVisible()?desktopSelect:page.locator('#form-mobile-species-select')).selectOption('p_ostreatus_gris');
   return {page,errors};
  };

  const {page,errors}=await open({width:1366,height:900});
  const panel=page.getByTestId('best-bodega-panel');
  await expect(panel).toBeVisible();
  const prod=panel.getByTestId('best-pick-produccion');
  await expect(prod).toBeVisible({timeout:15000});
  await expect(prod).toContainText(/EB est\. \d+–\d+ · confianza (baja|media|alta) \(escala B\)/);
  await expect(prod).toContainText(/alcanza para \d+ bolsas?/);
  await expect(prod).toContainText(/\/kg seta/);
  await expect(panel.getByTestId('best-pick-barata')).toBeVisible();
  const ids=await prod.getAttribute('data-recipe-ids');
  assert.ok(ids&&ids.length>0);
  assert.ok(await panel.getByTestId('best-improvement').count()<=3);
  console.log('PASS Gris muestra las dos recetas con banda escala B y cobertura.');

  await prod.getByTestId('best-pick-use').click();
  await expect.poll(()=>page.evaluate(()=>SetasFormulatorAPI.getRecipe().map(r=>r.id).sort().join(','))).toBe(ids.split(',').sort().join(','));
  console.log('PASS «Usar esta receta» carga la receta en Mesa de Mezcla.');

  await page.locator('#form-species-context-select').selectOption('shiitake');
  await expect(panel.getByTestId('best-autoclave-badge').first()).toHaveText('requiere autoclave (no habilitado)',{timeout:15000});
  const shiIds=await panel.getByTestId('best-pick-produccion').getAttribute('data-recipe-ids');
  const incompatibles=await page.evaluate(ids=>ids.split(',').filter(id=>{const g=(window.SetasSubstrateCatalog?.INGS||[]).find(x=>x.id===id);return !g||(Array.isArray(g.cs)&&g.cs.length&&!g.cs.includes('shiitake'));}),shiIds);
  assert.deepEqual(incompatibles,[],`receta con insumos no aptos para shiitake: ${shiIds}`);
  console.log('PASS Shiitake marca autoclave y no muestra recetas de Gris.');
  assert.deepEqual(errors,[]);
  await page.close();

  const empty=await open({width:1366,height:900},[]);
  const ep=empty.page.getByTestId('best-bodega-panel');
  await expect(ep).toContainText('Bodega no tiene insumos compatibles con',{timeout:15000});
  assert.ok(await ep.getByTestId('best-improvement').count()>0);
  assert.deepEqual(empty.errors,[]);
  await empty.page.close();
  console.log('PASS Bodega vacía lo dice y sugiere del catálogo.');

  // Camino más calmo: Co-Formulación detrás de «Avanzado» y evidencia plegada.
  const adv=await open({width:1366,height:900},LOTS,[{id:'aserrin_eucalipto',p:75},{id:'salvado_trigo',p:25}]);
  const avanzado=adv.page.getByTestId('formulador-avanzado');
  await expect(avanzado).toBeAttached();
  assert.equal(await avanzado.evaluate(el=>el.open),false);
  await expect(adv.page.getByTestId('co-form-toggle')).toBeHidden();
  await avanzado.locator('summary').click();
  await expect(adv.page.getByTestId('co-form-toggle')).toBeVisible();
  const card=adv.page.locator('#bl-perito .perito-item').filter({has:adv.page.getByText('Evidencia:')}).first();
  await expect(card).toBeAttached({timeout:15000});
  await expect(card.getByText('Evidencia:')).toBeHidden();
  await card.getByText('Ver evidencia',{exact:true}).click();
  await expect(card.getByText('Evidencia:')).toBeVisible();
  assert.deepEqual(adv.errors,[]);
  await adv.page.close();
  console.log('PASS Co-Formulación queda en Avanzado y la evidencia de los ajustes se pliega.');

  const mob=await open({width:375,height:812});
  const mp=mob.page.getByTestId('best-bodega-panel');
  await expect(mp.getByTestId('best-pick-produccion')).toBeVisible({timeout:15000});
  const overflow=await mp.evaluate(el=>el.scrollWidth-el.clientWidth);
  assert.ok(overflow<=1,`desborde horizontal ${overflow}px`);
  assert.deepEqual(mob.errors,[]);
  await mob.page.close();
  console.log('PASS en móvil el panel no desborda.');
 }finally{
  await browser?.close();
  server.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
