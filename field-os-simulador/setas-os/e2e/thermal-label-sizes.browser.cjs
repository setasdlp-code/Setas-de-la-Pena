'use strict';
// 40x30 y 50x30: la vista previa y la impresión del navegador usan los mismos
// tamaños de texto y el mismo ancho de columna que el PNG de la Phomemo
// (THERMAL_LABEL_SPECS), y con un nombre de especie largo nada se sale.
// Ejecutar: node e2e/thermal-label-sizes.browser.cjs
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(path.join(root,'simulador-app.jsx'),'utf8');
function spec(size){
 const block=SRC.match(new RegExp(`'${size}':\\s*\\{([^}]*)\\}`))[1];
 const n=k=>Number(block.match(new RegExp(`${k}:\\s*([0-9.]+)`))[1]);
 const mm=96/25.4;
 return {type:{eyebrow:n('eyebrowPx'),species:n('speciesPx'),badge:n('badgePx'),code:n('codePx'),meta:n('metaPx')},
  // Mismo cálculo que buildThermalShareCanvas: textW = w - textX - padX.
  textW:n('wMm')*mm-2*n('padXMm')*mm-n('qrMm')*mm-n('gapPx')};
}
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:1280,height:900},timezoneId:'America/Bogota'});
  await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await page.addInitScript(()=>localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'label-test',codigo:'SDP-261024-PDJ-R01',especie:'Pleurotus djamor rosado',fechaInoculacion:'2026-10-24',numBolsas:1,estado:'incubacion'}])));
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`);
  await page.getByTitle('Imprimir etiquetas térmicas del lote',{exact:true}).first().click();
  for(const size of ['40x30','50x30']){
   const {type:want,textW}=spec(size);
   await page.getByRole('button',{name:new RegExp(size.replace('x','.*'))}).click();
   for(const media of ['screen','print']){
    await page.emulateMedia({media});
    const card=page.locator(`.thermal-card-${media==='print'?'print':'preview'}.thermal-card-${size}`).first();
    await expect(card).toBeVisible();
    const got=await card.evaluate(el=>{
     const fs=sel=>{const e=el.querySelector(sel);return e?parseFloat(getComputedStyle(e).fontSize):null;};
     const box=el.getBoundingClientRect();
     const out=[...el.querySelectorAll('.thermal-body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>box.right+0.5||r.bottom>box.bottom+0.5||e.scrollWidth>e.clientWidth+1);}).map(e=>e.className);
     return {bodyW:el.querySelector('.thermal-body').getBoundingClientRect().width,eyebrow:fs('.thermal-eyebrow'),species:fs('.thermal-species'),badge:fs('.thermal-badge'),code:fs('.thermal-code'),meta:fs('.thermal-meta'),out};
    });
    for(const k of Object.keys(want)) if(got[k]!==null) assert.equal(got[k],want[k],`${size} ${media} .thermal-${k}`);
    // El filete de 1px vive dentro del hueco en el PNG y fuera en flex.
    assert.ok(Math.abs(got.bodyW-(textW-1))<1.5,`${size} ${media}: columna ${got.bodyW.toFixed(1)}px, PNG ${(textW-1).toFixed(1)}px`);
    assert.deepEqual(got.out,[],`${size} ${media}: texto fuera de la etiqueta`);
    console.log(`PASS ${size} ${media}`);
   }
   await page.emulateMedia({media:'screen'});
  }
  await page.close();
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
