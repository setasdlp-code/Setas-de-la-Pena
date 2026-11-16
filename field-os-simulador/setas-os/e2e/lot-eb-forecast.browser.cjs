'use strict';
// El pronóstico de EB que guarda un lote debe ser exactamente el que el
// usuario vio en el Formulador (no la banda interna de analyze()), y debe
// seguir igual tras recargar. Monta la app real del harness, planifica un lote
// de shiitake y compara lo mostrado con lo persistido.
// Ejecutar: node e2e/lot-eb-forecast.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const RECETA=[{id:'aserrin_roble',p:79},{id:'salvado_trigo',p:20},{id:'carbonato_calcio',p:1}];
const INSUMOS=['aserrin_roble','salvado_trigo','carbonato_calcio','spawn_grano','bolsa_pp_plana','bolsa_unicorn_microfiltro'];

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
  await page.addInitScript(insumos=>{
   if(sessionStorage.getItem('fc_seeded')) return;
   sessionStorage.setItem('fc_seeded','1');
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes',JSON.stringify(insumos.map((id,i)=>({id:'fx-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:200,
     unidad:id.startsWith('bolsa')?'ud':'kg',fechaIngreso:'2026-01-0'+(i+1),precioKg:2000}))));
   ['sdp_bit_lotes','sdp_bit_bolsas','sdp_bit_cosechas','sdp_inv_reservas'].forEach(k=>localStorage.setItem(k,'[]'));
   localStorage.setItem('setas_global_workmode','produccion');
  },INSUMOS);
  const url=`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`;
  await page.goto(url);
  await page.waitForFunction(()=>window.SetasFormulatorAPI&&window.SetasFormulatorAPI.adapterType()==='native'&&window.SetasEbForecast);
  await page.selectOption('#form-species-context-select','shiitake');
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),RECETA);

  // Lo que el usuario ve en el Formulador.
  const vista=page.getByTestId('recipe-eb-forecast');
  await expect(vista).toBeVisible();
  const texto=await vista.innerText();
  const m=texto.match(/EB estimada · (\d+)%\s*·\s*rango (\d+)–(\d+)%/);
  assert.ok(m,`no se pudo leer el pronóstico visible: ${texto}`);
  const [central,low,high]=m.slice(1).map(Number);
  await expect(page.getByTestId('shiitake-eb-unvalidated')).toBeVisible();

  const navegar=async v=>{await page.evaluate(v=>{window.SetasOSNavigation.navigate(window,v);window.dispatchEvent(new PopStateEvent('popstate'));},v);};
  await navegar('produccion');
  await page.locator('#prod-bags').fill('10');
  await page.locator('#prod-kg').fill('2');
  await page.locator('#prod-h').fill('60');
  await page.getByRole('button',{name:/Planificar lote/}).click();
  const dlg=page.getByRole('dialog',{name:'Planificar lote',exact:true});
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button',{name:/Confirmar y reservar/}).click();
  await expect.poll(async()=>(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]').length))).toBe(1);

  const leer=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')[0]);
  const lote=await leer();
  const f=lote.forecastSnapshot;
  assert.ok(f,'el lote no guardó pronóstico');
  assert.equal(f.schema,'setas.eb-forecast.v1');
  assert.deepEqual(f.shown,{central,low,high},'el pronóstico guardado no es el que se mostró');
  assert.equal(f.confidence.scale,'B');
  assert.ok(f.modelVersion&&f.recipeFingerprint);

  // Tras recargar sigue idéntico.
  await page.reload();
  await page.waitForFunction(()=>window.SetasEbForecast);
  assert.deepEqual((await leer()).forecastSnapshot,f,'el pronóstico cambió al recargar');

  // El detalle del lote lo muestra como pendiente de cierre.
  await navegar('bitacora');
  const ok=page.locator('.inv-modal-bg').getByRole('button',{name:/^(Aceptar|Entendido|Cerrar)$/i});
  if(await ok.count()) await ok.first().click();
  const card=page.locator(`.panel.sdp-lote[data-lote-id="${lote.id}"]`).first();
  await card.waitFor({state:'visible'});
  await card.click();
  const caja=page.locator('[data-testid="ux-v2-batch-detail"]').getByTestId('lote-eb-forecast');
  await expect(caja).toBeVisible({timeout:3000});
  await expect(caja).toHaveAttribute('data-forecast-status','pendiente');
  assert.match(await caja.innerText(),new RegExp(`${central}%[\\s\\S]*rango ${low}–${high}%[\\s\\S]*pendiente de cierre`));

  assert.deepEqual(errores,[]);
  console.log(`OK e2e/lot-eb-forecast: guardado ${central}% (${low}–${high}) = mostrado; estable tras recargar`);
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
