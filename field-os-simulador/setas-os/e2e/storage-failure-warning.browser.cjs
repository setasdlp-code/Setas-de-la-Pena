'use strict';
// Un guardado local que falla debe avisar al operario. Antes, borrar un lote
// con localStorage lleno lo quitaba de la pantalla sin guardar nada: al
// recargar reaparecía y nadie se enteraba.
// Run: node e2e/storage-failure-warning.browser.cjs
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
  // El borrado de lotes es una acción de administración.
  if(pathname==='/__harness.html')body=body.toString().replace('tab: tab,','tab: tab, isAdmin: true,');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{if(!sessionStorage.getItem('fixture-init')){
   localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'BORRAR',codigo:'BORRAR',especie:'Orellana Gris',estado:'incubacion',fechaInoculacion:'2026-08-01',numBolsas:1}]));
   localStorage.setItem('sdp_bit_bolsas','[]');sessionStorage.setItem('fixture-init','1');}});
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`);
  await page.getByRole('button',{name:'≡ Tabla',exact:true}).click();

  // El navegador rechaza guardar los lotes.
  await page.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='sdp_bit_lotes')throw Object.assign(Error('fixture quota'),{name:'QuotaExceededError'});return window.__setItem.call(this,k,v);};});
  await page.getByRole('button',{name:'Eliminar lote BORRAR',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Eliminar',exact:true}).click();

  await expect(page.getByRole('dialog',{name:'No se pudo guardar',exact:true})).toBeVisible();
  await expect(page.getByRole('dialog',{name:'No se pudo guardar',exact:true})).toContainText('Al recargar se perdería');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')).length),1,'el lote sigue guardado: el aviso dice la verdad');

  assert.deepEqual(errors,[]);
  console.log('storage-failure-warning: ok');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
