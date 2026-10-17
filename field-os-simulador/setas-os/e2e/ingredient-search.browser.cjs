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
    localStorage.setItem('sdp_seeded','1');localStorage.setItem('setas_global_workmode','investigacion');
    localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe:[{id:'paja_trigo',p:100}],sKey:'p_ostreatus_gris',hasPickedSpecies:true,lockedIds:[]}));
   });
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
   const editor=page.getByTestId('recipe-edit-options');
   await expect(editor).toBeVisible();assert.equal(await editor.getAttribute('open'),null);
   await editor.locator('summary').press('Enter');
   const strategy=editor.getByRole('combobox',{name:'Estrategia de balanceo'});
   await strategy.selectOption('equal');await expect(strategy).toHaveValue('equal');
   const adjust=editor.getByRole('button',{name:'Auto-ajustar al editar',exact:true});
   await adjust.click();await expect(adjust).toHaveAttribute('aria-pressed','true');
   await editor.locator('summary').press('Enter');await expect(editor.locator('summary')).toContainText('Auto-ajustar activo');
   await editor.locator('summary').press('Enter');await adjust.click();await editor.locator('summary').press('Enter');
   const percentage=page.locator('.rec-pct-input').first();await percentage.fill('75');await percentage.press('Tab');
   const next=page.getByTestId('formulator-next-action');await expect(next).toContainText('Balancear 100%');
   await expect(page.getByRole('button',{name:'Ajustar ingredientes libres al 100%',exact:true})).toHaveCount(0);
   await next.click();await expect(percentage).toHaveValue('100');
   const panel=page.locator('#bl-ingredientes'),search=panel.getByRole('searchbox'),options=panel.getByTestId('ingredient-options');
   await expect(search).toBeVisible();assert.equal(await options.getAttribute('open'),null);
   await expect(options.getByRole('button',{name:'Precios',exact:true})).not.toBeVisible();
   const rows=panel.locator('.ing-card-item');const all=await rows.count();assert.ok(all>10);
   await search.fill('  EUCALIPTO   aserrin  ');await expect(rows).toHaveCount(1);await expect(rows).toContainText('Aserrín de eucalipto');
   await panel.getByRole('button',{name:'Limpiar búsqueda',exact:true}).click();await expect(search).toBeFocused();await expect(rows).toHaveCount(all);
   await options.locator('summary').press('Enter');await expect(options).toHaveAttribute('open','');
   await options.locator('[data-cat="suplemento_n"]').click();assert.ok(await rows.count()<all);
   await options.locator('summary').press('Enter');await expect(options.locator('summary')).toContainText('N alto');
   await search.fill('zzzninguno');await expect(panel.getByText('No hay ingredientes para esta vista.',{exact:true})).toBeVisible();
   await panel.locator('.ingredient-no-results').getByRole('button',{name:'Restablecer vista'}).click();await expect(search).toHaveValue('');await expect(rows).toHaveCount(all);
   const compatible=panel.getByRole('button',{name:'Solo compatibles',exact:true});await compatible.click();await expect(compatible).toHaveAttribute('aria-pressed','true');
   assert.ok(await rows.count()>0&&await rows.count()<all);await expect(panel.getByRole('status').first()).toContainText('Compatibles con');await compatible.click();
   await options.locator('summary').press('Enter');await options.getByRole('button',{name:'Precios',exact:true}).click();await expect(options.locator('.price-row').first()).toBeVisible();
   await options.getByRole('button',{name:'Precios',exact:true}).click();await options.locator('summary').press('Enter');
   await search.scrollIntoViewIfNeeded();
   assert.ok(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth),`ingredient panel fits ${width}`);
   assert.ok(await compatible.evaluate(el=>el.getBoundingClientRect().height>=44));
   await page.screenshot({path:`/tmp/setas-ingredient-search-${width}.png`});assert.deepEqual(errors,[]);
   await page.close();console.log(`PASS ingredient selection ${width}: search, keyboard disclosure, recovery, compatibility, price access and fit.`);
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
