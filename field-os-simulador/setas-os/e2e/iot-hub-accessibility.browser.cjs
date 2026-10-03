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
  for(const [width,height] of [[1280,900],[390,844],[320,568]]){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');});
   await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=clima`);
   const opener=page.getByRole('button',{name:'Hub IoT & Firmware'});await opener.click();
   const hub=page.getByRole('dialog',{name:'Hub de Integración IoT & Telemetría'});
   const close=hub.getByRole('button',{name:'Cerrar Hub IoT'});
   await expect(close).toBeFocused();
   await close.press('Shift+Tab');await expect(hub.getByRole('button',{name:'Cerrar',exact:true})).toBeFocused();
   await hub.getByRole('button',{name:'Cerrar',exact:true}).press('Tab');await expect(close).toBeFocused();
   const tabs=hub.getByRole('tablist',{name:'Secciones del Hub IoT'});
   assert.ok(await tabs.evaluate(el=>[...el.querySelectorAll('[role=tab]')].every(t=>document.getElementById(t.getAttribute('aria-controls')))),'all tabs reference an existing panel');
   const nodes=tabs.getByRole('tab',{name:/Nodos en Finca/});await nodes.focus();await nodes.press('ArrowRight');
   await expect(tabs.getByRole('tab',{name:'Generador de Firmware'})).toBeFocused();
   await expect(tabs.getByRole('tab',{name:'Generador de Firmware'})).toHaveAttribute('aria-selected','true');
   await hub.getByLabel('Microcontrolador',{exact:true}).selectOption('esp32c3');
   await hub.getByLabel('Host del servidor Setas OS',{exact:true}).fill('fixture.local');
   await hub.getByLabel('Puerto del servidor',{exact:true}).fill('8081');
   await expect(hub.locator('.iot-code-box')).toContainText('fixture.local');
   await expect(hub.locator('.iot-code-box')).toContainText('8081');
   for(const name of ['Generador de Firmware','Consola Webhook / Test','Conexión en Vivo','Reglas de Automatización']){
    await tabs.getByRole('tab',{name,exact:true}).click();
    await expect(hub.getByRole('tabpanel',{name,exact:true})).toBeVisible();
    const violations=await hub.evaluate(el=>{
     const vis=e=>!!e.getBoundingClientRect().height;
     return [...el.querySelectorAll('input,select,textarea')].filter(vis).filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')).map(e=>e.id||e.tagName);
    });assert.deepEqual(violations,[],`${name}: all fields need labels`);
    assert.ok(await hub.evaluate(el=>el.scrollWidth<=el.clientWidth),`${name}: modal overflow`);
    assert.ok(await hub.locator('.iot-hub-body').evaluate(el=>el.scrollWidth<=el.clientWidth),`${name}: body overflow`);
    const sizes=await hub.evaluate(el=>[...el.querySelectorAll('button,input:not([type=checkbox]),select,textarea,label:has(input[type=checkbox])')].filter(e=>e.getBoundingClientRect().height).map(e=>({h:e.getBoundingClientRect().height,text:e.textContent.slice(0,30)})).filter(e=>e.h<44));
    assert.deepEqual(sizes,[],`${name}: 44px controls`);
    const bounds=await hub.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight,display:getComputedStyle(el).display,max:getComputedStyle(el).maxHeight}});
    assert.ok(bounds.top>=0&&bounds.bottom<=bounds.height,`${name}: bounded modal ${JSON.stringify(bounds)}`);
   }
   await hub.getByLabel('HR Mínima de Arranque (%)',{exact:true}).fill('84');
   await expect(hub.getByLabel('HR Mínima de Arranque (%)',{exact:true})).toHaveValue('84');
   // Only inspect UI. Do not save automation or connect external transports.
   await tabs.getByRole('tab',{name:'Reglas de Automatización'}).focus();await tabs.getByRole('tab',{name:'Reglas de Automatización'}).press('Home');await expect(nodes).toBeFocused();
   await nodes.press('End');await expect(tabs.getByRole('tab',{name:'Reglas de Automatización'})).toBeFocused();
   await tabs.getByRole('tab',{name:'Generador de Firmware'}).click();
   await hub.locator('.iot-hub-body').evaluate(el=>el.scrollTop=0);
   await page.screenshot({path:`/tmp/setas-hub-accessibility-${width}.png`});
   await hub.press('Escape');await expect(hub).toHaveCount(0);await expect(opener).toBeFocused();
   assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}x${height}: labels, fields, tab keyboard, focus trap/restore, touch targets, bounded modal and overflow.`);
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
