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
   const panel=page.getByTestId('climate-dashboard');await expect(panel).toBeVisible();
   const ranges=panel.getByRole('group',{name:'Intervalo de las series ambientales'});
   await ranges.getByRole('button',{name:'Últimas 6 horas'}).click();
   await expect(ranges.getByRole('button',{name:'Últimas 6 horas'})).toHaveAttribute('aria-pressed','true');
   await expect(ranges.getByRole('button',{name:'Última hora'})).toHaveAttribute('aria-pressed','false');
   const temp=panel.getByRole('slider',{name:'Proyección de temperatura (°C)',exact:true});
   await temp.focus();const before=Number(await temp.inputValue());await temp.press('ArrowRight');
   await expect(temp).toHaveValue(String(before+0.5));
   await expect(temp).toHaveAttribute('aria-valuetext',`${before+0.5} °C`);
   await expect(temp).toBeFocused();await temp.press('ArrowRight');await expect(temp).toHaveValue(String(before+1));
   // A parent update must not discard the operator projection.
   await ranges.getByRole('button',{name:'Últimas 24 horas'}).click();
   await expect(temp).toHaveValue(String(before+1));
   await panel.getByLabel('Efecto Gastronómico Deseado:',{exact:true}).selectOption('umami');
   await panel.getByRole('button',{name:'Equilibrar T°',exact:true}).click();
   assert.ok(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth),`dashboard overflow at ${width}`);
   const small=await panel.evaluate(el=>[...el.querySelectorAll('button,select,input')].filter(e=>e.getBoundingClientRect().height).filter(e=>e.getBoundingClientRect().height<44).map(e=>e.textContent.slice(0,40)));
   assert.deepEqual(small,[],`controls smaller than 44px at ${width}`);
   await expect(panel.getByRole('button',{name:'Simular humidificación (1 min)',exact:true})).toBeVisible();
   assert.equal(await panel.getByRole('img').count(),4);
   await temp.scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/setas-climate-accessibility-${width}.png`});
   assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}x${height}: responsive climate, keyboard projections, named graphs and 44px controls.`);

  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
