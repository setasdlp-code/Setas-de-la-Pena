'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await context.addInitScript(()=>{
   if(localStorage.getItem('readiness-fixture'))return;
   localStorage.setItem('readiness-fixture','1');localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe:[{id:'aserrin_roble',p:85},{id:'salvado_trigo',p:15}],sKey:'shiitake',hasPickedSpecies:true,lockedIds:[]}));
   localStorage.setItem('sdp_lotes',JSON.stringify(['aserrin_roble','salvado_trigo','spawn_grano','bolsa_unicorn_microfiltro'].map((id,i)=>({id:'LOT-'+i,ingredienteId:id,cantidadKgDisponible:100,activo:true,fechaIngreso:'2026-10-01',unidad:id==='bolsa_unicorn_microfiltro'?'ud':'kg',precioPorKgCOP:1000}))));
  });
  const url=`http://127.0.0.1:${server.address().port}/__harness.html`;
  await page.goto(url+'?view=home');
  await page.getByRole('navigation',{name:'Vista de inicio'}).getByRole('button',{name:'Seguimiento',exact:true}).click();
  await page.getByTestId('home-followup').getByRole('button',{name:'Revisar preparación',exact:false}).click();
  const dashboard=page.getByTestId('production-readiness-dashboard');await expect(dashboard).toBeVisible();
  await expect(page.locator('#production-readiness-title')).toBeFocused();
  await expect(dashboard.getByTestId('readiness-stock').locator('.readiness-status')).toHaveText('Verificado');
  for(const id of ['spawn','equipment','room','sensors','review'])await expect(dashboard.getByTestId('readiness-'+id).locator('.readiness-status')).toHaveText('Sin verificar');
  const before=await page.evaluate(()=>['sdp_lotes','sdp_bit_lotes','sdp_bit_bolsas','sdp_inventory_ops'].map(k=>JSON.parse(localStorage.getItem(k)||'[]')));
  await page.locator('#prod-lote').fill('SHI-READY-01');await page.locator('#prod-lote').press('Tab');
  const equipment=dashboard.getByTestId('readiness-equipment');
  await equipment.locator('summary').click();const form=equipment.getByRole('form');
  await form.getByLabel('Resultado de la revisión').selectOption('verified');
  await form.getByLabel('Responsable de la revisión').fill('Operador de prueba');
  await form.getByLabel('Referencia de evidencia').fill('INFORME-CARGA-SINTETICA');
  await form.getByLabel('Equipo identificado').fill('EQ-01');
  await form.getByLabel('Protocolo y carga validados').fill('Solo fixture de software, sin validación física real');
  // Shiitake se esteriliza en autoclave: sin corrida y bioindicador no se verifica.
  await form.getByRole('button',{name:/Guardar revisión/}).click();
  await expect(form.getByRole('alert')).toContainText('bioindicador sin crecimiento');
  await expect(equipment.locator('.readiness-status')).toHaveText('Sin verificar');
  await form.getByLabel(/Corrida del autoclave/).fill('AC-FIXTURE-01');
  await form.getByLabel('Bioindicador de la corrida').selectOption('sin_crecimiento');
  await form.getByRole('button',{name:/Guardar revisión/}).click();
  await expect(equipment.locator('.readiness-status')).toHaveText('Verificado');
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_production_readiness'))[0]);
  assert.equal(record.requirementId,'equipment');assert.ok(record.scope.includes('shiitake'));
  // La revisión queda en cola para subir a production_readiness (ADR-0009).
  const queued=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_sync_queue')||'[]'));
  assert.ok(queued.some(op=>op.type==='crearDocumento'&&op.args[0]==='production_readiness/'+record.id&&op.args[1].id===record.id),'la revisión no quedó en cola de sincronización');
  assert.deepEqual(await page.evaluate(()=>['sdp_lotes','sdp_bit_lotes','sdp_bit_bolsas','sdp_inventory_ops'].map(k=>JSON.parse(localStorage.getItem(k)||'[]'))),before);
  await page.reload();await expect(equipment.locator('.readiness-status')).toHaveText('Verificado');
  console.log('PASS dashboard entry, unknown physical evidence, local inspection persistence and no production/stock writes.');
  const spawn=dashboard.getByTestId('readiness-spawn');await spawn.locator('summary').click();
  const spawnForm=spawn.getByRole('form');await spawnForm.getByLabel('Resultado de la revisión').selectOption('verified');
  for(const [label,value] of [['Responsable de la revisión','Reviewer'],['Referencia de evidencia','SPAWN-FIXTURE'],['ID de cepa','STR-01'],['Proveedor de semilla','Supplier'],['Clase térmica documentada de la cepa','Supplier record']])await spawnForm.getByLabel(label,{exact:true}).fill(value);
  await page.evaluate(()=>{window.__readinessSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='sdp_pending_write_v1')throw Error('No se pudo guardar la revisión');return window.__readinessSetItem.call(this,k,v);};});
  await spawnForm.getByRole('button',{name:/Guardar revisión/}).click();await expect(spawnForm.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(spawn.locator('.readiness-status')).toHaveText('Sin verificar');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_production_readiness')).length),1);
  await page.evaluate(()=>{Storage.prototype.setItem=window.__readinessSetItem;delete window.__readinessSetItem;});await spawn.locator('summary').click();
  console.log('PASS failed local save preserves existing records and never verifies an unsaved inspection.');
  await dashboard.getByLabel('Sala prevista para preparación').selectOption('cloudlab_844');
  await expect(equipment.locator('.readiness-status')).toHaveText('Sin verificar');
  await expect(equipment).toContainText('otra receta, cantidad, sala');
  await dashboard.getByLabel('Sala prevista para preparación').selectOption('martha_01');
  await expect(equipment.locator('.readiness-status')).toHaveText('Verificado');
  await page.locator('#prod-bags').fill('3');await page.locator('#prod-bags').press('Tab');
  await expect(equipment.locator('.readiness-status')).toHaveText('Sin verificar');
  console.log('PASS changing room and preparation quantities invalidates previous inspections.');
  const review=dashboard.getByTestId('readiness-review');await review.locator('summary').click();
  const reviewForm=review.getByRole('form');
  await reviewForm.getByLabel('Resultado de la revisión').selectOption('verified');
  await reviewForm.getByLabel('Responsable de la revisión').fill('Reviewer');await reviewForm.getByLabel('Referencia de evidencia').fill('REPORT');
  await reviewForm.getByRole('button',{name:/Guardar revisión/}).click();
  await expect(reviewForm.getByRole('alert')).toContainText('requisitos pendientes');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_production_readiness')).length),1);
  const download=page.waitForEvent('download');await dashboard.getByRole('button',{name:'Exportar informe'}).click();
  const report=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));assert.equal(report.schema,'setas.readiness-report.v1');assert.notEqual(report.assessment.status,'verified');
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await dashboard.scrollIntoViewIfNeeded();
   assert.ok(await dashboard.evaluate(el=>el.scrollWidth<=el.clientWidth),'dashboard reflow '+width);
   assert.ok(await dashboard.locator('button:visible').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)),'touch targets '+width);
  }
  await equipment.locator('summary').click();
  await page.locator('#production-readiness-title').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/setas-production-readiness-mobile.png'});
  assert.deepEqual(errors,[]);await page.close();
  console.log('PASS blocked final review, report export and 320/390px reflow.');
  const corrupt=await browser.newPage();await corrupt.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await corrupt.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_production_readiness','broken');});
  await corrupt.goto(url+'?view=produccion');
  await expect(corrupt.getByTestId('production-readiness-dashboard').getByRole('alert')).toContainText('dañado');
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem('sdp_production_readiness')),'broken');await corrupt.close();
  console.log('PASS corrupt inspection storage is preserved and clearly reported.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
