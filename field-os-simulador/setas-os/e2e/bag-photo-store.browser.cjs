'use strict';
// Las fotos de bolsas viven en IndexedDB, no en localStorage: una foto previa
// en línea se migra, sobrevive a recargar, y una foto nueva o borrada nunca
// vuelve a escribir el data URL en sdp_bit_bolsas.
// Run: node e2e/bag-photo-store.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
// PNG 1×1 válido: el navegador lo decodifica y compressImageToDataURL lo recomprime.
const PNG='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);
  if(pathname==='/__harness.html')body=body.toString().replace('<script src="simulador-app.js">','<script src="batch-sheet.js"></script><script src="field-qr-events.js"></script><script src="simulador-app.js">');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(png=>{if(!sessionStorage.getItem('fixture-init')){
   localStorage.clear();localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'FOTO',codigo:'FOTO',especie:'Orellana Gris',estado:'incubacion',fechaInoculacion:'2026-08-01',numBolsas:2}]));
   localStorage.setItem('sdp_bit_bolsas',JSON.stringify([
    {id:'FOTO-B01',loteId:'FOTO',codigo:'FOTO-B01',estado:'sana',foto:'data:image/png;base64,'+png},
    {id:'FOTO-B02',loteId:'FOTO',codigo:'FOTO-B02',estado:'sana'}]));sessionStorage.setItem('fixture-init','1');}},PNG);
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_bolsas')));
  const idbKeys=()=>page.evaluate(()=>window.SetasBagPhotos.createStore().getAll().then(m=>Object.keys(m).sort()));
  const open=async()=>{await page.getByText('FOTO',{exact:true}).click();await page.getByRole('button',{name:'Ver tabla de bolsas',exact:true}).click();};
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`);await open();
  const remove1=page.getByRole('button',{name:'Quitar foto de la bolsa FOTO-B01',exact:true});
  const remove2=page.getByRole('button',{name:'Quitar foto de la bolsa FOTO-B02',exact:true});

  // 1. Migración: la foto previa sale de localStorage y queda en IndexedDB.
  await expect.poll(async()=>(await stored()).some(b=>'foto' in b)).toBe(false);
  assert.deepEqual(await idbKeys(),['FOTO-B01']);
  await expect(remove1).toBeVisible();
  assert.equal((await stored())[0].estado,'sana','la migración no altera el resto de la bolsa');

  // 2. Sobrevive a recargar.
  await page.reload();await open();await expect(remove1).toBeVisible();

  // 3. Foto nueva: va a IndexedDB, nunca a localStorage.
  await page.getByLabel('Agregar foto a la bolsa FOTO-B02',{exact:true}).setInputFiles({name:'b.png',mimeType:'image/png',buffer:Buffer.from(PNG,'base64')});
  await expect(remove2).toBeVisible();
  assert.deepEqual(await idbKeys(),['FOTO-B01','FOTO-B02']);
  assert.equal(JSON.stringify(await stored()).includes('data:image'),false);

  // 4. Quitar la foto la borra de IndexedDB.
  await remove1.click();await expect(remove1).toHaveCount(0);
  assert.deepEqual(await idbKeys(),['FOTO-B02']);
  await page.reload();await open();await expect(remove1).toHaveCount(0);await expect(remove2).toBeVisible();

  assert.deepEqual(errors,[]);
  console.log('bag-photo-store: ok');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
