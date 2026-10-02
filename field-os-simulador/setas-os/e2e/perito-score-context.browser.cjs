'use strict';
// Contexto único de score del Perito en la app real: el ΔScore de cada
// tarjeta coincide con su "Índice estimado", y al aplicar la sugerencia el
// veredicto queda en el score que se predijo. Paja de trigo 100% es el caso
// en que "Afinar Nitrógeno" cambia la clase de sustrato.
// Run: node e2e/perito-score-context.browser.cjs
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
  await page.evaluate(recipe=>window.SetasFormulatorAPI.applyRecipe(recipe),[{id:'paja_trigo',p:100}]);
  const panel=page.locator('#bl-perito');
  await expect(panel.locator('.perito-item').first()).toBeVisible();
  const cards=await panel.locator('.perito-item').evaluateAll(els=>els.map(el=>{
   const t=el.innerText;
   const idx=t.match(/Índice estimado: (\d+)\/100 → (\d+)\/100/);
   const delta=t.match(/ΔScore: [+-]?[\d.]+ pts \((\d+(?:\.\d+)?)\)/);
   return{label:el.querySelector('.pi-label')?.textContent||'',base:idx?Number(idx[1]):null,predicted:idx?Number(idx[2]):null,deltaNew:delta?Number(delta[1]):null};
  }));
  const withBoth=cards.filter(c=>c.predicted!=null&&c.deltaNew!=null);
  assert.ok(withBoth.length>=2,`tarjetas con ambas predicciones: ${JSON.stringify(cards)}`);
  for(const c of withBoth) assert.equal(Math.round(c.deltaNew),c.predicted,`${c.label}: ΔScore ${c.deltaNew} ≠ Índice ${c.predicted}`);
  const target=withBoth.find(c=>c.label==='Afinar Nitrógeno');
  assert.ok(target,`falta "Afinar Nitrógeno": ${JSON.stringify(cards)}`);
  await panel.locator('.perito-item',{hasText:'Afinar Nitrógeno'}).getByRole('button',{name:/^Aplicar ajuste/}).click();
  await expect(panel.getByText(`${target.predicted}/100`).first()).toBeVisible();
  const header=await panel.locator('span',{hasText:/^SCORE$/}).locator('xpath=preceding-sibling::span[1]').textContent();
  assert.equal(Number(header),target.predicted,`veredicto ${header} ≠ predicho ${target.predicted}`);
  assert.deepEqual(errors,[]);
  console.log(`PASS: ΔScore = Índice estimado en ${withBoth.length} tarjetas; "Afinar Nitrógeno" predijo ${target.predicted} y el veredicto quedó en ${header}.`);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
