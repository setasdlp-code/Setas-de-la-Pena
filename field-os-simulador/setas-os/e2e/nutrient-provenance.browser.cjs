'use strict';
// Las cuatro métricas de nutrientes (C:N, N, pH, digestibilidad) del panel
// bl-perito son promedios ponderados de constantes del CATÁLOGO de insumos
// (substrate-analysis.js analyze()), nunca una medición del lote real. Antes
// se pintaban con "Óptimo/Aceptable/Ajustar" y sin más contexto, y cuando no
// había fracción lignocelulósica (receta de puros aditivos) C:N salía
// "0.0:1" y Nitrógeno "0.00%" — un número donde no hay dato. Este arnés monta
// la app de verdad y comprueba que la procedencia declarada sigue al dato:
// menciona el catálogo, la fracción lignocelulósica y el caveat del pH sin
// buffer, y que sin fracción nutritiva se pinta "—", no "0.0:1"/"0.00%".
// Ejecutar: node e2e/nutrient-provenance.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const RECETA_NORMAL=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];
// Receta de puros aditivos minerales/estructurales secos: ambos tienen cn:0 y
// role aditivo_ph/aditivo_estructura, así que quedan fuera de la matriz
// lignocelulósica en analyze() — nP queda en 0, y avgN y cn con él.
const RECETA_SOLO_ADITIVOS=[{id:'carbonato_calcio',p:50},{id:'yeso',p:50}];
const ESPECIE='p_ostreatus_gris';

const arranca=async(server,browser,recipe)=>{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_lotes',JSON.stringify(['paja_trigo','salvado_trigo','carbonato_calcio','yeso','spawn_grano','bolsa_pp_plana']
      .map((id,i)=>({id:'fx-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:100,unidad:id==='bolsa_pp_plana'?'ud':'kg'}))));
    localStorage.setItem('sdp_bit_lotes','[]');
    localStorage.setItem('sdp_bit_cosechas','[]');
    localStorage.setItem('sdp_bit_bolsas','[]');
    localStorage.setItem('setas_global_workmode','produccion');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI&&window.SetasFormulatorAPI.adapterType()==='native');
  await page.selectOption('#form-species-context-select',ESPECIE);
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),recipe);
  await page.getByTestId('formulator-provenance-details').locator('summary').click();
  await page.locator('[data-testid="prov-cn"]').first().waitFor({state:'attached'});
  return {page,errores};
};

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);
  if(pathname==='/__harness.html')body=body.toString().replace('<script src="simulador-app.js">','<script src="formulator-api.js"></script><script src="simulador-app.js">');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});

  // 1. Receta normal (80% paja de trigo + 20% salvado de trigo): la nota de
  //    procedencia bajo la rejilla .mgrid es visible y nombra el catálogo, la
  //    fracción lignocelulósica y el caveat del pH sin buffer.
  {
   const {page,errores}=await arranca(server,browser,RECETA_NORMAL);
   const nota=page.locator('[data-testid="prov-nutrientes"]').first();
   await nota.waitFor({state:'visible'});
   const texto=await nota.innerText();
   assert.match(texto,/cat[aá]logo/i,`la nota debe mencionar el catálogo: ${texto}`);
   assert.match(texto,/lignocelul[oó]sic/i,`la nota debe mencionar la fracción lignocelulósica: ${texto}`);
   assert.match(texto,/buffer/i,`la nota debe declarar el caveat del pH sin buffer: ${texto}`);
   assert.match(texto,/promedio lineal/i,`la nota debe decir que el pH es un promedio lineal: ${texto}`);
   assert.doesNotMatch(texto,/\b(alta|media|baja)\b/i,'no debe pintar un nivel de confianza que no tiene de dónde salir');

   // Las cuatro tarjetas .mc de nutrientes llevan su propia línea corta de
   // procedencia bajo el .mbadge.
   // La línea de la tarjeta es un pie de dato en mayúsculas de ~11 px: lleva
   // el label, y el detalle del vocabulario va en el title. Si el detalle se
   // pintara aquí, la celda pasaría de 20 a 53 px de alto (medido).
   const cnMcLine=page.locator('.mc:has-text("C:N") .os-provenance-line').first();
   const cnLine=await cnMcLine.innerText();
   assert.match(cnLine,/^calculado$/i,`la tarjeta C:N debe declarar procedencia en una línea corta: ${cnLine}`);
   const cnTitle=await cnMcLine.getAttribute('title');
   assert.match(cnTitle,/cat[aá]logo/i,`el title debe traer el detail del vocabulario: ${cnTitle}`);
   assert.match(cnTitle,/lignocelul[oó]sic/i,`el title de C:N debe nombrar la fracción lignocelulósica: ${cnTitle}`);

   assert.deepEqual(errores,[]);
   await page.close();
  }

  // 2. prov-cn en la franja de resumen ya no es la cadena vieja escrita a
  //    mano ("Calculado" con el mismo title fijo siempre): ahora usa el
  //    vocabulario 'nutrient' y trae el detail del catálogo.
  {
   const {page,errores}=await arranca(server,browser,RECETA_NORMAL);
   const provCnEl=page.locator('[data-testid="prov-cn"]').first();
   const provCn=await provCnEl.innerText();
   assert.match(provCn,/^calculado$/i,`prov-cn debe decir Calculado y nada más — la celda mide 144 px de ancho: ${provCn}`);
   const provCnTitle=await provCnEl.getAttribute('title');
   assert.match(provCnTitle,/cat[aá]logo/i,`el title de prov-cn debe venir del vocabulario nutrient, no de la cadena vieja fija: ${provCnTitle}`);
   assert.match(provCnTitle,/lignocelul[oó]sic/i,`el title de prov-cn debe declarar la fracción lignocelulósica: ${provCnTitle}`);
   assert.match(provCnTitle,/ning[uú]n insumo de este lote fue analizado/i,`el title debe traer también el caveat: ${provCnTitle}`);
   assert.deepEqual(errores,[]);
   await page.close();
  }

  // 3. Receta de puros aditivos (carbonato_calcio + yeso, ambos cn:0, fuera de
  //    la matriz lignocelulósica): C:N y Nitrógeno se pintan "—", nunca
  //    "0.0:1" ni "0.00%" — 0 no es un valor, es la ausencia de uno.
  {
   const {page,errores}=await arranca(server,browser,RECETA_SOLO_ADITIVOS);
   const provCnEl=page.locator('[data-testid="prov-cn"]').first();
   const provCn=await provCnEl.innerText();
   const provCnTitle=await provCnEl.getAttribute('title');
   const cnCell=page.locator('.form-summary-cell:has-text("C:N") .form-summary-v').first();
   const cnValor=await cnCell.innerText();
   assert.equal(cnValor.trim(),'—',`C:N sin fracción lignocelulósica debe pintar — , no un número: ${cnValor}`);
   assert.doesNotMatch(cnValor,/0\.0:1/,'no debe volver a pintar 0.0:1 donde no hay dato');
   assert.match(provCn,/sin matriz nutritiva/i,`prov-cn debe decir que no hay matriz nutritiva que medir: ${provCn}`);
   assert.match(provCnTitle,/no hay carbono ni nitr[oó]geno que ponderar/i,`el title debe explicar por qué no es 0: ${provCnTitle}`);

   const cnMc=page.locator('.mc:has-text("C:N")').first();
   const cnMcVal=await cnMc.locator('.mval').innerText();
   assert.equal(cnMcVal.trim(),'—',`la tarjeta C:N del mgrid debe pintar — : ${cnMcVal}`);

   const nMc=page.locator('.mc:has-text("Nitrógeno")').first();
   const nMcVal=await nMc.locator('.mval').innerText();
   assert.equal(nMcVal.trim(),'—',`la tarjeta Nitrógeno del mgrid debe pintar — , no 0.00%: ${nMcVal}`);
   assert.doesNotMatch(nMcVal,/0\.00%/,'no debe volver a pintar 0.00% donde no hay dato');
   const nMcProv=await nMc.locator('.os-provenance-line').innerText();
   assert.match(nMcProv,/sin matriz nutritiva/i,`la línea de Nitrógeno debe decir que no hay matriz nutritiva: ${nMcProv}`);

   assert.deepEqual(errores,[]);
   await page.close();
  }

  console.log('OK e2e/nutrient-provenance: la procedencia de las métricas de nutrientes declara el catálogo, la fracción lignocelulósica y el caveat del pH, y — reemplaza 0 donde no hay matriz nutritiva');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
