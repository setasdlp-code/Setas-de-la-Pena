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
  for(const [width,height] of [[1366,768],[768,1024],[390,844],[320,568]]){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe:[{id:'aserrin_eucalipto',p:80},{id:'salvado_trigo',p:20}],sKey:'p_ostreatus_gris',hasPickedSpecies:true,lockedIds:['aserrin_eucalipto']}));});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
   const panel=page.getByRole('tabpanel',{name:/Mesa de Mezcla/});
   const input=panel.locator('.rec-pct-input').first();await expect(input).toBeVisible();
   const box=await input.boundingBox();
   if(width===1366)assert.ok(box.y+box.height<height, 'editable composition visible without scrolling at 1366×768');
   const next=page.getByTestId('formulator-next-action');await expect(next).toBeVisible();
   const provenance=panel.getByTestId('formulator-provenance-details'),method=panel.getByTestId('formulator-method-details');
   assert.equal(await provenance.getAttribute('open'),null);assert.equal(await method.getAttribute('open'),null);
   await page.screenshot({path:`/tmp/setas-formulator-after-${width}.png`});
   for(const details of [provenance,method]){
    await details.locator('summary').press('Enter');await expect(details).toHaveAttribute('open','');
    if(details===provenance)await expect(details.getByTestId('prov-costo')).toBeVisible();
    else await expect(details.getByRole('list')).toBeVisible();
    await details.locator('summary').press('Enter');await expect(details).not.toHaveAttribute('open','');
   }
   const origin=panel.getByRole('group',{name:'Origen de ingredientes en la receta activa'});
   await origin.getByRole('button',{name:'Catálogo',exact:true}).click();await expect(origin.getByRole('button',{name:'Catálogo',exact:true})).toHaveAttribute('aria-pressed','true');
   await expect(input).toHaveAttribute('readonly','');
   await panel.getByRole('button',{name:'Desbloquear porcentaje de Aserrín de eucalipto',exact:true}).click();
   await input.fill('75');await input.press('Tab');await expect(input).toHaveValue('75');
   await expect(next).toContainText('100%');
   await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('setas_formulator_draft_v1')).recipe[0].p)).toBe(75);
   await page.getByRole('tab',{name:'Herramientas avanzadas',exact:true}).click();await expect(page.getByRole('tabpanel',{name:'Herramientas avanzadas',exact:true})).toBeVisible();
   await page.getByRole('tab',{name:/Mesa de Mezcla/}).click();await expect(input).toHaveValue('75');
   for(const selector of ['.sim-live-dashboard','.form-species-context','.form-support-details'])assert.ok(await panel.locator(selector).evaluateAll(els=>els.every(el=>el.scrollWidth<=el.clientWidth)), `no horizontal overflow in ${selector} at ${width}`);
   console.log(`PASS Formulador ${width}: editable percentage y=${Math.round(box.y)}, details keyboard, origin, locks, draft, generator navigation.`);
   assert.deepEqual(errors,[]);await page.close();
  }
  // First entry remains actionable with no draft. Check the species selection
  // and both creation routes without invoking generation or production writes.
  const empty=await browser.newPage({viewport:{width:1366,height:768}});
  await empty.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await empty.addInitScript(()=>localStorage.setItem('sdp_seeded','1'));
  await empty.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  const emptyPanel=empty.getByRole('tabpanel',{name:/Mesa de Mezcla/});
  await emptyPanel.locator('#form-species-context-select').selectOption('p_ostreatus_gris');
  await expect(emptyPanel.getByTestId('formulator-provenance-details')).toHaveCount(0);
  await expect(emptyPanel.getByRole('button',{name:'Abrir Generador',exact:true})).toBeVisible();
  await emptyPanel.getByTestId('formulator-method-details').locator('summary').press('Enter');
  await expect(emptyPanel.getByRole('button',{name:'Manual',exact:true})).toBeVisible();
  await emptyPanel.getByRole('button',{name:'Manual',exact:true}).click();
  await expect(emptyPanel.locator('#bl-ingredientes')).toBeInViewport();
  await empty.evaluate(()=>document.body.style.zoom='2');
  for(const selector of ['.sim-live-dashboard','.form-species-context','.form-support-details'])assert.ok(await emptyPanel.locator(selector).evaluateAll(els=>els.every(el=>el.scrollWidth<=el.clientWidth)), `200% zoom overflow in ${selector}`);
  await empty.close();console.log('PASS first entry: species, manual route and 200% CSS zoom reflow.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
