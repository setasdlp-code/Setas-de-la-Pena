'use strict';
// Ciclo de sala de punta a punta en la app real: iniciar con bandas sugeridas
// desde knowledge_base/metadata/species.yaml (rotuladas por origen), editar una
// (queda como consigna de la granja), avanzar de etapa (cierra la anterior en
// el mismo instante) y cerrar. Se ejecuta a 1280 y 390 px.
// Ejecutar: node e2e/room-cycles.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  for(const [width,height] of [[1280,900],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errores=[];page.on('pageerror',e=>errores.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([
     {id:'BIT_RC',codigo:'SDP-RC-01',sKey:'p_ostreatus_gris',especie:'p_ostreatus_gris',estado:'incubacion',sala:'martha_01',fechaInoculacion:'2026-10-01',numBolsas:1,createdAt:'2026-10-01T10:00:00.000Z'},
    ]));
   });
   await page.goto(`http://127.0.0.1:${port}/__harness.html?view=clima`);
   const ciclos=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_room_cycles')||'[]'));

   const panel=page.getByTestId('room-cycle-panel');
   await expect(panel).toContainText('Sin ciclo activo');
   await panel.getByTestId('room-cycle-start').click();

   // ── Formulario con bandas sugeridas y su origen
   let dialog=page.getByRole('dialog',{name:'Iniciar ciclo de sala'});
   await expect(dialog).toBeVisible();
   await expect(dialog.getByLabel('Etapa del ciclo')).toHaveValue('incubation');
   await expect(dialog.getByLabel('Especie del ciclo')).toHaveValue('p_ostreatus_gris');
   await expect(dialog.getByLabel('Temperatura aire mínimo')).toHaveValue('20');
   await expect(dialog.getByLabel('Temperatura aire máximo')).toHaveValue('24');
   await expect(dialog.getByLabel('Temperatura núcleo máximo')).toHaveValue('28');
   await expect(dialog.locator('[data-band="temperature_c"] [data-band-source]')).toHaveText('Consigna aprobada (KB)');
   await expect(dialog.locator('[data-band="rh_pct"] [data-band-source]')).toHaveText('Sin valor en la KB');
   await expect(dialog.getByRole('checkbox',{name:/SDP-RC-01/})).toBeChecked();

   // Editar una banda la vuelve consigna de la granja.
   await dialog.getByLabel('Temperatura aire máximo').fill('23');
   await expect(dialog.locator('[data-band="temperature_c"] [data-band-source]')).toHaveText('Consigna de la granja');
   await dialog.getByRole('button',{name:'Iniciar ciclo'}).click();
   await expect(dialog).toHaveCount(0);

   const activo=panel.getByTestId('room-cycle-active');
   await expect(activo).toHaveAttribute('data-stage','incubation');
   await expect(panel.locator('[data-metric="temperature_c"]')).toContainText('20–23 °C');
   await expect(panel.locator('[data-metric="temperature_c"]')).toContainText('Consigna de la granja');
   await expect(panel.locator('[data-metric="substrate_temperature_c"]')).toContainText('≤ 28 °C');
   await expect(panel.locator('[data-metric="rh_pct"]')).toContainText('Banda fija de la sala');
   let lista=await ciclos();
   assert.equal(lista.length,1);
   assert.deepEqual(lista[0].targets.temperature_c,{min:20,max:23,target:null,source:'manual'});
   assert.equal(lista[0].targets.substrate_temperature_c.source,'kb-operational');
   assert.deepEqual(lista[0].batchIds,['BIT_RC']);

   // ── Avanzar a inducción: bandas de fructificación y la etapa anterior se cierra
   await panel.getByRole('button',{name:'Avanzar a Inducción'}).click();
   dialog=page.getByRole('dialog',{name:'Avanzar ciclo de sala'});
   await expect(dialog.getByLabel('Etapa del ciclo')).toHaveValue('induction');
   await expect(dialog.getByLabel('Temperatura aire mínimo')).toHaveValue('13');
   await expect(dialog.getByLabel('Humedad relativa mínimo')).toHaveValue('85');
   await expect(dialog.getByLabel('CO₂ máximo')).toHaveValue('1000');
   await expect(dialog.getByLabel('Temperatura núcleo máximo')).toHaveValue('');
   await dialog.getByRole('button',{name:'Cerrar etapa y avanzar'}).click();
   await expect(activo).toHaveAttribute('data-stage','induction');
   lista=await ciclos();
   assert.equal(lista.length,2);
   const [viejo,nuevo]=lista;
   assert.equal(viejo.state,'closed');
   assert.equal(viejo.endAt,nuevo.startAt,'la etapa anterior cierra cuando empieza la nueva');
   assert.equal(nuevo.state,'active');
   await expect(panel.locator('details summary')).toContainText('Ciclos anteriores (1)');

   // ── Cerrar
   await panel.getByRole('button',{name:'Cerrar ciclo'}).click();
   await page.getByRole('button',{name:'Cerrar ciclo'}).last().click();
   await expect(panel).toContainText('Sin ciclo activo');
   lista=await ciclos();
   assert.ok(lista.every(c=>c.state==='closed'&&c.endAt),'todos los ciclos quedan cerrados con fecha');

   // ── Validación: sin lotes no se puede iniciar
   await panel.getByTestId('room-cycle-start').click();
   dialog=page.getByRole('dialog',{name:'Iniciar ciclo de sala'});
   await dialog.getByRole('checkbox',{name:/SDP-RC-01/}).uncheck();
   await dialog.getByRole('button',{name:'Iniciar ciclo'}).click();
   await expect(dialog.getByRole('alert')).toContainText('selecciona al menos un lote');
   await dialog.getByRole('button',{name:'Cancelar'}).click();

   assert.deepEqual(errores,[],`errores de página (${width}px): ${errores.join(' | ')}`);
   await page.close();
  }
  console.log('PASS room-cycles: iniciar con bandas sugeridas por origen, editar (consigna de la granja), avanzar de etapa cerrando la anterior, cerrar y validar lotes; 1280 y 390 px.');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
