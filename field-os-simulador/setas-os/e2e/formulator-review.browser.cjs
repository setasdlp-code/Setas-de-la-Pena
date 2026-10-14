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
  for(const [width,height] of [[1366,900],[390,844],[320,568]]){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{
    localStorage.setItem('sdp_seeded','1');localStorage.setItem('setas_global_workmode','investigacion');localStorage.setItem('sdp_lotes','[]');
    localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe:[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}],sKey:'p_ostreatus_gris',hasPickedSpecies:true,lockedIds:[]}));
   });
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
   const review=page.getByRole('region',{name:'Revisión y preparación'});
   await expect(review).toBeVisible();await expect(page.locator('#bl-perito')).toHaveCount(1);
   await expect(review.locator('#bl-perito')).toHaveCount(1);await expect(review.locator('#bl-tratamiento')).toHaveCount(1);
   await expect(review.getByTestId('form-review-balance')).toContainText('Comprobado');
   await expect(review.getByTestId('form-review-stock')).toContainText('Requiere atención');
   await expect(review.getByTestId('form-review-moisture')).toContainText('humedad de referencia');
   await expect(review.getByTestId('form-review-equipment')).toContainText('Por verificar');
   await expect(review.getByTestId('form-review-equipment')).toContainText('Recomendación del modelo');
   const percentage=page.locator('.rec-pct-input').first();await percentage.fill('70');await percentage.press('Tab');
   await expect(review.getByTestId('form-review-balance')).toContainText('90.0% / 100%');
   await expect(review.getByTestId('form-review-balance')).toContainText('Requiere atención');
   await review.getByTestId('form-review-balance').getByRole('button',{name:'Editar receta'}).click();await expect(percentage).toBeFocused();
   await page.getByTestId('formulator-next-action').click();await expect(review.getByTestId('form-review-balance')).toContainText('100.0% / 100%');
   for(const detail of [review.getByTestId('form-review-gauges'),review.getByTestId('formulator-provenance-details'),review.locator('#bl-tratamiento')]){
    assert.equal(await detail.getAttribute('open'),null);
    await detail.locator('summary').press('Enter');await expect(detail).toHaveAttribute('open','');
    await detail.locator('summary').press('Enter');await expect(detail).not.toHaveAttribute('open','');
   }
   const name=review.getByRole('textbox',{name:'Nombre de la receta'});await expect(name).toBeVisible();
   const oldStock=await review.getByTestId('form-review-stock').innerText();
   await review.locator('#bf-numbags').fill('12');await review.locator('#bf-numbags').press('Tab');
   await expect(review.getByTestId('form-review-stock')).not.toHaveText(oldStock);
   await expect(review.getByTestId('form-review-equipment')).toContainText('Por verificar');
   await review.locator('h2').first().scrollIntoViewIfNeeded();
   assert.ok(await review.evaluate(el=>el.scrollWidth<=el.clientWidth),`review fits ${width}`);
   assert.ok(await review.locator('.form-review-check button').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)));
   await page.screenshot({path:`/tmp/setas-unified-review-${width}.png`});
   await review.getByRole('button',{name:'Ver preparación para producción'}).click();await expect(page).toHaveURL(/view=produccion/);
   await expect(page.locator('#production-readiness')).toBeVisible();
   assert.deepEqual(errors,[]);await page.close();console.log(`PASS unified review ${width}: live balance, stock and evidence, keyboard details, recipe editing, production navigation and fit.`);
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
