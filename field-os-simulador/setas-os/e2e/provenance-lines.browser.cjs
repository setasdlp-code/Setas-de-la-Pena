'use strict';
// Una etiqueta de procedencia fija que no sigue al dato es peor que no tener
// etiqueta: afirma algo que puede ser falso. "BE estimada" decía "Hipótesis"
// viniera de un modelo teórico o de uno mezclado con el historial real de la
// finca, y "Costo/kg" declaraba "COP / kg seco", que es una unidad. Este arnés
// monta la app de verdad y comprueba que ahora las dos líneas CAMBIAN con el
// dato — un test que lea el .jsx como texto no puede probar eso.
// Ejecutar: node e2e/provenance-lines.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const RECETA=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];
const ESPECIE='p_ostreatus_gris';

// Tres lotes cerrados de la MISMA especie y la MISMA receta, con cosecha y peso
// seco: es lo que convierte el historial de la finca en evidencia utilizable.
const lotesConHistorial=[1,2,3].map(n=>({
  id:'LH'+n,codigo:'OST-2606'+n+'-01',especie:'Pleurotus ostreatus (Orellana Gris)',
  estado:'completado',fechaInoculacion:'2026-0'+n+'-10',peseSeco:10,numBolsas:10,
  recipeRef:{sKey:ESPECIE,recipe:RECETA},lifecycleEvents:[],
}));
const cosechasConHistorial=[1,2,3].map(n=>({
  id:'CH'+n,loteId:'LH'+n,flush:1,fecha:'2026-0'+n+'-28',pesoFresco:9000,unit:'g',
}));

const arranca=async(server,browser,semilla)=>{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(([lotes,cosechas])=>{
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_lotes',JSON.stringify(['paja_trigo','salvado_trigo','spawn_grano','bolsa_pp_plana']
      .map((id,i)=>({id:'fx-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:100,unidad:id==='bolsa_pp_plana'?'ud':'kg'}))));
    localStorage.setItem('sdp_bit_lotes',JSON.stringify(lotes));
    localStorage.setItem('sdp_bit_cosechas',JSON.stringify(cosechas));
    localStorage.setItem('sdp_bit_bolsas','[]');
    localStorage.setItem('setas_global_workmode','produccion');
  },semilla);
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI&&window.SetasFormulatorAPI.adapterType()==='native');
  await page.selectOption('#form-species-context-select',ESPECIE);
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),RECETA);
  await page.locator('[data-testid="prov-eb"]').first().waitFor({state:'attached'});
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

  // 1. Sin historial de campo: el número es puro modelo y la línea lo dice.
  {
   const {page,errores}=await arranca(server,browser,[[],[]]);
   const eb=await page.locator('[data-testid="prov-eb"]').first().innerText();
   const costo=await page.locator('[data-testid="prov-costo"]').first().innerText();
   assert.match(eb,/sin historial de campo/i,`BE sin historial dice: ${eb}`);
   // La etiqueta fija anterior no puede volver por ninguna vía.
   assert.doesNotMatch(eb,/^hip[oó]tesis$/i);
   assert.doesNotMatch(eb,/sin determinar/i,'no debe pintar un nivel de confianza que no tiene de dónde salir');
   // Y una unidad no es una procedencia.
   assert.match(costo,/cat[aá]logo/i,`Costo dice: ${costo}`);
   assert.doesNotMatch(costo,/COP \/ kg seco/i);
   assert.deepEqual(errores,[]);
   await page.close();
  }

  // 2. Con tres lotes cerrados de la misma receta: el mismo número ya lleva
  //    datos reales de la finca dentro, y la línea tiene que cambiar.
  {
   const {page,errores}=await arranca(server,browser,[lotesConHistorial,cosechasConHistorial]);
   const eb=await page.locator('[data-testid="prov-eb"]').first().innerText();
   assert.match(eb,/historial de campo de la finca/i,`BE con historial dice: ${eb}`);
   assert.doesNotMatch(eb,/sin historial/i);
   // Cuántos lotes lo sostienen: un nivel de confianza sin tamaño de muestra
   // no le sirve a nadie para decidir.
   assert.match(eb,/n=3/i,`no declara el tamaño de muestra: ${eb}`);
   assert.deepEqual(errores,[]);
   await page.close();
  }

  console.log('OK e2e/provenance-lines: la procedencia mostrada sigue al dato, no a una cadena fija');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
