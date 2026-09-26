'use strict';
// Mover un lote de sala tiene que DEJAR RASTRO. Antes la acción "Mover de sala"
// sólo cambiaba la sala seleccionada del panel de clima y navegaba allí: el lote
// aparecía en otra sala sin evento, sin fecha y sin autor. Este arnés monta la
// app de verdad porque los tests que leen el .jsx como texto no pueden probar
// que el operario ve el selector ni que el traslado quedó registrado.
// Ejecutar: node e2e/room-move.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const LOTE={
  id:'LOTE_MOVE_1',codigo:'SHI-260901-11',especie:'Shiitake',
  lifecycleState:'incubation',estado:'incubacion',sala:'martha_01',
  numBolsas:2,fechaInoculacion:'2026-08-20',operador:'operador-arnes',
  lifecycleEvents:[],
};
const BOLSAS=[1,2].map(n=>({id:'B_MOVE_'+n,loteId:'LOTE_MOVE_1',numero:n,codigo:'B'+n,estado:'sana'}));

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
  // Mismo escape que los gates: donde el Chromium preinstalado no es el que
  // Playwright fija, el arnés fallaría por entorno y no por contrato.
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(([lote,bolsas])=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([lote]));
   localStorage.setItem('sdp_bit_bolsas',JSON.stringify(bolsas));
   localStorage.setItem('sdp_bit_cosechas','[]');
  },[LOTE,BOLSAS]);
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html`);

  await page.waitForSelector('[data-testid="ux-v2-today"]',{state:'visible'});
  await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
  const card=page.locator('.panel.sdp-lote[data-lote-id="LOTE_MOVE_1"]');
  await card.waitFor({state:'visible'});
  await card.click();
  await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').waitFor({state:'visible'});

  // La acción existe para un lote en incubación y abre un selector de destino,
  // no una navegación silenciosa al panel de clima.
  await page.getByRole('button',{name:/Mover de sala/i}).first().click();
  const modal=page.locator('[data-testid="move-room-modal"]');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Martha Tent 01'); // de dónde sale
  const destinos=modal.locator('button[data-room-id]');
  // Se ofrecen las otras salas reales, nunca la que ya ocupa.
  assert.equal(await destinos.count(),2);
  assert.equal(await modal.locator('button[data-room-id="martha_01"]').count(),0);
  // Objetivo táctil del proyecto: se pulsa con guantes.
  const caja=await destinos.first().boundingBox();
  assert.ok(caja.height>=48,`destino de ${Math.round(caja.height)} px, el mínimo con guantes es 48`);

  await modal.locator('button[data-room-id="cloudlab_844"]').click();
  await expect(modal).toBeHidden();

  // El traslado quedó escrito: sala nueva en el lote y evento inmutable con destino.
  await expect.poll(async()=>(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')[0]?.sala))).toBe('cloudlab_844');
  const evento=await page.evaluate(()=>{
   const l=JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')[0]||{};
   return (l.lifecycleEvents||[]).find(e=>e.action==='move')||null;
  });
  assert.ok(evento,'mover de sala no dejó evento en la bitácora del lote');
  assert.equal(evento.payload.salaDestinoId,'cloudlab_844');
  assert.ok(evento.at,'el evento de traslado no tiene fecha');
  assert.ok(evento.hash,'el evento de traslado no entró en la cadena de hashes');

  // Y la ficha muestra la sala nueva, no la vieja.
  const ficha=await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').innerText();
  assert.ok(/cloudlab/i.test(ficha),'la ficha sigue mostrando la sala anterior');

  assert.deepEqual(errors,[],'la página lanzó errores');
  console.log('OK e2e/room-move: el traslado de sala queda registrado y visible');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
