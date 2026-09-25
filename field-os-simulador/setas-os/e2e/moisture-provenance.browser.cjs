'use strict';
// Los kg requeridos de cada insumo salen de SU humedad. Cuando esa humedad es
// la del catálogo y no una medición del lote, los kg también son estimación —
// y el modal que descuenta bodega los listaba sin decirlo. Este arnés monta la
// app de verdad y comprueba que el aviso aparece, nombra los insumos estimados
// y DESAPARECE cuando el operario mide.
// Ejecutar: node e2e/moisture-provenance.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const RECETA=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];

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
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes',JSON.stringify(['paja_trigo','salvado_trigo','spawn_grano','bolsa_pp_plana','bolsa_unicorn_microfiltro']
     .map((id,i)=>({id:'fx-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:200,unidad:id.startsWith('bolsa')?'ud':'kg'}))));
   localStorage.setItem('sdp_bit_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');localStorage.setItem('sdp_bit_cosechas','[]');
   localStorage.setItem('setas_global_workmode','produccion');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI&&window.SetasFormulatorAPI.adapterType()==='native');
  await page.selectOption('#form-species-context-select','p_ostreatus_gris');
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),RECETA);

  const navegar=async v=>{await page.evaluate(v=>{window.SetasOSNavigation.navigate(window,v);window.dispatchEvent(new PopStateEvent('popstate'));},v);};
  await navegar('produccion');
  await page.locator('#prod-bags').fill('10');
  await page.locator('#prod-kg').fill('1');
  await page.locator('#prod-h').fill('60');

  const abrirConfirmacion=async()=>{
   await page.getByRole('button',{name:/Ejecutar lote/}).click();
   const dlg=page.getByRole('dialog',{name:'Ejecutar lote',exact:true});
   await expect(dlg).toBeVisible();
   return dlg;
  };

  // 1. Sin medir nada: las dos humedades son de catálogo y el modal lo declara,
  //    nombrando los insumos y diciendo que los kg también son estimación.
  {
   const dlg=await abrirConfirmacion();
   const aviso=dlg.locator('[data-testid="confirm-humedad-procedencia"]');
   await expect(aviso).toBeVisible();
   const texto=await aviso.innerText();
   assert.match(texto,/0 de 2 medidos/i,`dice: ${texto}`);
   assert.match(texto,/paja/i,'no nombra el insumo estimado');
   assert.match(texto,/salvado/i,'no nombra el segundo insumo estimado');
   assert.match(texto,/kg requeridos/i,'no explica la consecuencia');
   // Va con el tono de aviso, no como nota al pie de 8 px.
   const clase=await aviso.getAttribute('class');
   assert.match(clase,/os-provenance-notice--estimated/);
   const px=await aviso.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
   assert.ok(px>=11,`el aviso se pinta a ${px}px; a ese tamaño no se lee antes de descontar bodega`);
   await dlg.getByRole('button',{name:'Cancelar'}).click();
  }

  // 2. El operario mide una: el aviso cambia y deja de contarla como estimada.
  {
   await page.locator('#ingredient-moisture-paja_trigo').fill('20');
   const dlg=await abrirConfirmacion();
   const texto=await dlg.locator('[data-testid="confirm-humedad-procedencia"]').innerText();
   assert.match(texto,/1 de 2 medidos/i,`dice: ${texto}`);
   assert.doesNotMatch(texto,/paja/i,'sigue señalando como estimado un insumo ya medido');
   assert.match(texto,/salvado/i);
   await dlg.getByRole('button',{name:'Cancelar'}).click();
  }

  // 3. Las dos medidas: el aviso pierde el tono de alarma y lo afirma en positivo.
  {
   await page.locator('#ingredient-moisture-salvado_trigo').fill('12');
   const dlg=await abrirConfirmacion();
   const aviso=dlg.locator('[data-testid="confirm-humedad-procedencia"]');
   const texto=await aviso.innerText();
   assert.match(texto,/medida en los 2 insumos/i,`dice: ${texto}`);
   assert.doesNotMatch(await aviso.getAttribute('class'),/--estimated/);
   await dlg.getByRole('button',{name:'Cancelar'}).click();
  }

  assert.deepEqual(errores,[]);
  console.log('OK e2e/moisture-provenance: el modal que descuenta bodega declara de dónde sale cada humedad');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
