'use strict';
// Un solo Formulador: Receta con diagnóstico, Escenarios y Comparar.
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
  // Costo sin objetivo con fuente: se muestra sin calificar (antes "Ajustar" contra $800/$2.000).
  const costCell=form.locator('.mgrid .mc',{hasText:/Costo \/ kg seco/i});
  await expect(costCell.getByTestId('metric-no-target')).toHaveText(/Sin objetivo/i);
  await expect(costCell.locator('.mbadge.bgood, .mbadge.bwarn, .mbadge.bbad')).toHaveCount(0);
  // Auto-mejorar antes que el asistente IA en el orden de lectura.
  const buttons=await form.locator('button').allTextContents();
  assert.ok(buttons.findIndex(t=>/Auto-mejorar/.test(t))<buttons.findIndex(t=>/Asistente IA/.test(t)),buttons.join(' | '));

  const original=await page.evaluate(()=>window.SetasFormulatorAPI.getRecipe());
  const species=page.locator('#form-species-context-select');
  await page.getByRole('tab',{name:'Escenarios',exact:true}).click();
  await expect(page.locator('#gen-panel')).toBeVisible();
  await expect(species).toHaveValue('p_ostreatus_gris');
  await expect(page.locator('#bl-perito')).toHaveCount(0);
  await expect(page.locator('.perito-workbench-modes')).toHaveCount(0);
  await expect(page.getByRole('tab',{selected:true})).toHaveText('Escenarios');
  await page.getByRole('tab',{name:'Comparar',exact:true}).click();
  await expect(page.locator('.perito-morph-panel')).toBeVisible();
  await expect(page.locator('#gen-panel')).toHaveCount(0);
  assert.deepEqual(await page.evaluate(()=>window.SetasFormulatorAPI.getRecipe()),original,'navigation preserves draft');
  // Roving focus wraps all three destinations and keeps the panel in sync.
  await page.getByRole('tab',{name:'Comparar',exact:true}).press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Receta',exact:false})).toBeFocused();
  await expect(form).toBeVisible();
  assert.equal((await read(form)).score,a.score);
  await page.locator('#formular-tab-mesa').press('End');
  await expect(page.locator('#formular-tab-comparar')).toBeFocused();
  await expect(page.locator('.perito-morph-panel')).toBeVisible();
  await page.locator('#formular-tab-comparar').press('Home');
  await expect(page.locator('#formular-tab-mesa')).toBeFocused();
  // Apply and undo stay with the same active recipe and single diagnosis.
  await form.locator('.pi-apply:not([disabled])').first().click();
  await expect.poll(()=>page.evaluate(()=>window.SetasFormulatorAPI.getRecipe())).not.toEqual(original);
  await form.getByRole('button',{name:/Deshacer \(/}).click();
  assert.deepEqual(await page.evaluate(()=>window.SetasFormulatorAPI.getRecipe()),original);
  for(const [width,height] of [[1366,900],[390,844],[320,568]]){
    await page.setViewportSize({width,height});
    for(const id of ['mesa','generador','comparar']){
      await page.locator('#formular-tab-'+id).click();
      await expect(species).toBeVisible();
      assert.equal(await page.getByRole('tab',{selected:true}).count(),1);
      assert.ok(await page.locator('.formular-mode-nav').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'navigation fits '+width);
      assert.ok(await page.locator('.formular-mode-btn').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)));
    }
    await page.locator('#formular-tab-mesa').click();
    await page.screenshot({path:`/tmp/setas-formulator-consolidated-${width}.png`,fullPage:false});
  }
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.locator('#bl-perito').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'el panel no debe desbordar en móvil');
  assert.deepEqual(errors,[]);
  console.log('PASS: one diagnosis, three destinations, shared species, draft preservation, apply/undo, keyboard navigation and responsive controls.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
