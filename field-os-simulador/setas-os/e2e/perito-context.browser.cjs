'use strict';
// El Perito vivía SÓLO en el Formulador: sabía más que nadie de recetas y no
// decía nada cuando el operario estaba frente al lote con el problema. Este
// arnés monta la app de verdad y comprueba que ahora habla en la ficha del
// lote, que lo que dice sale de la receta CONGELADA de ese lote, y que NO se
// cuela el contrafactual de diseño ("añadir salvado", "salva el 100%"), que es
// inejecutable sobre un lote ya inoculado y afirma una causa sobre algo que ya
// ocurrió.
// Ejecutar: node e2e/perito-context.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

// Shiitake con C:N muy por encima de su rango (35–70, ideal 50): aserrín de
// roble casi puro. La receta va CONGELADA en el lote, como la dejó producción.
const SNAPSHOT={
  schema:'setas.recipe-snapshot.v1',recipeId:'SHI-SAW-03',version:4,status:'approved',
  name:'Shiitake aserrín roble',sKey:'shiitake',
  ingredients:[{id:'aserrin_roble',pct:95},{id:'salvado_trigo',pct:5}],
  cn:null,eb:null,cost:null,snapshotAt:'2026-08-01T08:00:00.000Z',
};
const LOTE={
  id:'LOTE_PERITO_1',codigo:'SHI-260801-07',especie:'Shiitake',
  lifecycleState:'incubation',estado:'incubacion',sala:'incubacion_01',
  numBolsas:3,fechaInoculacion:'2026-08-01',operador:'operador-arnes',
  recipeSnapshot:SNAPSHOT,lifecycleEvents:[],
};
const BOLSAS=[
  {id:'BP1',loteId:'LOTE_PERITO_1',numero:1,codigo:'B1',estado:'sana'},
  {id:'BP2',loteId:'LOTE_PERITO_1',numero:2,codigo:'B2',estado:'sana'},
  {id:'BP3',loteId:'LOTE_PERITO_1',numero:3,codigo:'B3',estado:'aislada'},
];
// Un lote viejo, anterior al versionado de recetas: no guardó con qué se hizo.
const LOTE_SIN_SNAPSHOT={
  id:'LOTE_PERITO_2',codigo:'OST-250101-01',especie:'Orellana',
  lifecycleState:'incubation',estado:'incubacion',sala:'incubacion_01',
  numBolsas:1,fechaInoculacion:'2025-01-01',operador:'operador-arnes',lifecycleEvents:[],
};

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(([lotes,bolsas])=>{
   localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify(lotes));
   localStorage.setItem('sdp_bit_bolsas',JSON.stringify(bolsas));
   localStorage.setItem('sdp_bit_cosechas','[]');
  },[[LOTE,LOTE_SIN_SNAPSHOT],BOLSAS]);
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html`);
  await page.waitForSelector('[data-testid="ux-v2-today"]',{state:'visible'});

  const abrirLote=async id=>{
   await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
   const card=page.locator(`.panel.sdp-lote[data-lote-id="${id}"]`);
   await card.waitFor({state:'visible'});
   await card.click();
   await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').waitFor({state:'visible'});
  };

  // 1. Lote con receta congelada: el Perito habla en la ficha.
  await abrirLote('LOTE_PERITO_1');
  const panel=page.locator('[data-testid="perito-context"]');
  await expect(panel).toBeVisible();
  assert.equal(await panel.getAttribute('data-available'),'true');
  const texto=await panel.innerText();

  // Nombra la receta con la que se hizo ESTE lote, no la abierta en Formulador.
  assert.match(texto,/SHI-SAW-03|Shiitake aserrín roble/i,`dice: ${texto}`);
  // Diagnostica sobre esa receta: C:N muy alto para shiitake.
  await expect(panel.locator('[data-finding="factor_restrictivo"]')).toHaveCount(1);
  assert.match(texto,/C:N/i,'no nombra el factor restrictivo');
  // Y cuenta lo observado en el lote, como hecho separado.
  await expect(panel.locator('[data-finding="observado_en_lote"]').first()).toBeVisible();
  assert.match(texto,/1 bolsa aislada/i,`no reporta la bolsa aislada: ${texto}`);

  // LA REGLA QUE IMPORTA: el contrafactual de diseño no se cuela al campo.
  assert.doesNotMatch(texto,/salva el 100|añadir 5|añadir 5–15|potentialEbGain/i,
    'el consejo de diseño de receta llegó a la ficha de un lote ya inoculado');
  // Ni lenguaje causal.
  assert.doesNotMatch(texto,/por eso|caus[óo]|debido a|[óo]ptim|siempre/i,
    `el panel afirma una causa: ${texto}`);
  // El descargo está a la vista.
  assert.match(texto,/no una causa demostrada/i);

  // La pregunta enlaza con una acción válida de la ficha, y se puede pulsar.
  const pregunta=panel.locator('[data-testid="perito-context-question"]');
  if(await pregunta.count()){
   const caja=await pregunta.boundingBox();
   assert.ok(caja.height>=48,`la pregunta mide ${Math.round(caja.height)} px`);
   assert.match(await pregunta.innerText(),/^¿.*\?$/u,'la acción sugerida no está redactada como pregunta');
  }

  // 2. Lote anterior al versionado: lo dice, no se lo inventa.
  await abrirLote('LOTE_PERITO_2');
  const panel2=page.locator('[data-testid="perito-context"]');
  await expect(panel2).toBeVisible();
  assert.equal(await panel2.getAttribute('data-available'),'false');
  assert.match(await panel2.innerText(),/no guardó con qué receta se produjo/i);
  await expect(panel2.locator('[data-finding="factor_restrictivo"]')).toHaveCount(0);

  assert.deepEqual(errores,[]);
  console.log('OK e2e/perito-context: el Perito habla en la ficha del lote sin traerse el consejo de diseño');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
