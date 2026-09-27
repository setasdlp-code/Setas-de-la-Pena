'use strict';
// La brecha que esto cierra: el lote nacía ya en incubación y la bodega se
// descontaba en el mismo clic que lo creaba. Planificación y preparación eran
// el mismo instante, así que una reserva nacía y moría a la vez y "Reservado"
// no podía valer otra cosa que cero. Ahora planificar RESERVA y preparar la
// mezcla DESCUENTA. Este arnés monta la app de verdad y comprueba las dos
// mitades por separado, porque un test que lee el .jsx como texto no puede
// probar que los kilos se muevan (ni que no se muevan).
// Ejecutar: node e2e/plan-prepare.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const RECETA=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];

const stockDe=async(page,id)=>page.evaluate(ing=>{
  const lotes=JSON.parse(localStorage.getItem('sdp_lotes')||'[]');
  return lotes.filter(l=>l.ingredienteId===ing&&l.activo)
    .reduce((s,l)=>s+(Number(l.cantidadKgDisponible)||0),0);
},id);
const reservas=async page=>page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_inv_reservas')||'[]'));

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
   if(sessionStorage.getItem('sdp_plan_prepare_seeded')==='1')return;
   sessionStorage.setItem('sdp_plan_prepare_seeded','1');
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes',JSON.stringify(['paja_trigo','salvado_trigo','spawn_grano','bolsa_pp_plana','bolsa_unicorn_microfiltro']
     .map((id,i)=>({id:'fx-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:200,unidad:id.startsWith('bolsa')?'ud':'kg',
       fechaIngreso:'2026-01-0'+(i+1),precioKg:2000}))));
   localStorage.setItem('sdp_bit_lotes','[]');localStorage.setItem('sdp_bit_bolsas','[]');
   localStorage.setItem('sdp_bit_cosechas','[]');localStorage.setItem('sdp_inv_reservas','[]');
   localStorage.setItem('setas_global_workmode','produccion');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI&&window.SetasFormulatorAPI.adapterType()==='native');
  await page.selectOption('#form-species-context-select','p_ostreatus_gris');
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),RECETA);
  const navegar=async v=>{await page.evaluate(v=>{window.SetasOSNavigation.navigate(window,v);window.dispatchEvent(new PopStateEvent('popstate'));},v);};
  const autorizarPreparacion=async()=>{
    const release=page.getByRole('dialog',{name:'Autorizar ensayo controlado'});
    await release.getByLabel('Equipo disponible').fill('Equipo de ensayo documentado');
    await release.getByLabel('Protocolo a ejecutar').fill('Protocolo sintético para prueba de software');
    await release.getByLabel('Responsable que autoriza').fill('Operador de prueba');
    await release.getByRole('checkbox').check();
    const confirmar=release.getByRole('button',{name:/Autorizar, descontar y registrar/i});
    await confirmar.waitFor({state:'visible'});
    await confirmar.click();
  };
  await page.evaluate(recipe=>SetasPrototype.savePlan(localStorage,{
    id:'browser-trial',title:'Ensayo sintético vinculado',hypothesis:'Verificar trazabilidad de software',
    speciesId:'p_ostreatus_gris',design:'exploratory',primaryMetric:'be_pct',status:'draft',
    control:{id:'control',label:'Referencia',plannedReplicates:1,batchIds:[],recipeVersionId:'browser-v1',recipeSnapshot:{versionId:'browser-v1',sKey:'p_ostreatus_gris',recipe}},treatments:[]
  }),RECETA);
  await navegar('bitacora');
  const trials=page.getByRole('region',{name:'Ensayos y respaldos'});
  await trials.getByText('Ensayo sintético vinculado · Planificado',{exact:true}).click();
  await trials.getByRole('button',{name:'Planificar lote de Referencia (0/1)',exact:true}).click();
  await navegar('produccion');
  await page.locator('#prod-bags').fill('10');
  await page.locator('#prod-kg').fill('1');
  await page.locator('#prod-h').fill('60');

  const pajaAntes=await stockDe(page,'paja_trigo');
  assert.ok(pajaAntes>0,'el fixture de bodega no cargó');

  // ── 1. PLANIFICAR: reserva y no mueve un gramo ────────────────────────────
  await page.getByRole('button',{name:/Planificar lote/}).click();
  const dlg=page.getByRole('dialog',{name:'Planificar lote',exact:true});
  await expect(dlg).toBeVisible();
  const textoModal=await dlg.innerText();
  // El modal ya no promete un descuento que no va a hacer.
  assert.match(textoModal,/RESERVAR/i,`el modal dice: ${textoModal}`);
  assert.match(textoModal,/Preparar mezcla/i,'no dice cuándo se descuenta de verdad');
  await dlg.getByRole('button',{name:/Confirmar y reservar/}).click();

  await expect.poll(async()=>(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]').length))).toBe(1);
  const lote=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')[0]);
  // El lote NACE planificado, no en incubación.
  assert.equal(lote.estado,'planificado',`nació en "${lote.estado}"`);
  assert.equal(lote.experimentId,'browser-trial');assert.equal(lote.armId,'control');
  assert.equal(lote.recipeRef.versionId,'browser-v1');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_experiments_v1'))[0].control.batchIds),[lote.id]);

  // La bodega sigue intacta y los kilos están comprometidos, no gastados.
  assert.equal(await stockDe(page,'paja_trigo'),pajaAntes,'planificar descontó bodega');
  const held=(await reservas(page)).filter(r=>r.status==='held'&&r.batchId===lote.id);
  assert.ok(held.length>0,'planificar no reservó nada');
  const kgReservados=held.reduce((s,r)=>s+r.kg,0);
  assert.ok(kgReservados>0);

  // Y la Bodega lo ENSEÑA: reservado deja de ser cero.
  await navegar('inventario');
  const tabla=page.locator('.inventory-stock-table');
  await tabla.first().waitFor({state:'visible'});
  const cabeceras=await tabla.first().locator('th').allInnerTexts();
  assert.ok(cabeceras.some(h=>/Reservado/i.test(h)),`cabeceras: ${cabeceras.join(' | ')}`);
  const reservadoVisible=await tabla.first().locator('[data-label="Reservado"]').allInnerTexts();
  assert.ok(reservadoVisible.some(t=>/\d/.test(t)&&!/^—$/.test(t.trim())),
    `ninguna fila muestra kilos reservados: ${reservadoVisible.join(' | ')}`);

  // ── 2. PREPARAR MEZCLA: cierra la reserva y descuenta ─────────────────────
  // A partir de aquí se trabaja en móvil: preparar la mezcla es trabajo de
  // campo y la ficha del lote se abre desde el rail, igual que en la finca.
  await page.setViewportSize({width:390,height:844});
  await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
  const card=page.locator(`.panel.sdp-lote[data-lote-id="${lote.id}"]`).first();
  await card.waitFor({state:'visible'});
  await card.click();
  await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').waitFor({state:'visible'});
  const preparar=page.getByRole('button',{name:/Preparar mezcla/i}).first();
  await preparar.waitFor({state:'visible'});
  await preparar.click();
  await autorizarPreparacion();

  // Ahora sí se movió la bodega.
  await expect.poll(async()=>await stockDe(page,'paja_trigo')).toBeLessThan(pajaAntes);
  // Y la reserva quedó consumida, no colgada.
  await expect.poll(async()=>(await reservas(page)).filter(r=>r.batchId===lote.id&&r.status==='held').length).toBe(0);
  const consumidas=(await reservas(page)).filter(r=>r.batchId===lote.id&&r.status==='consumed');
  assert.ok(consumidas.length>0,'la reserva no se marcó consumida');
  assert.ok(consumidas.every(r=>r.consumedByEventId),'una reserva consumida sin el evento que la cerró');

  // El lote avanzó a mezcla preparada en su bitácora.
  const ev=await page.evaluate(id=>{
    const l=(JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')).find(x=>x.id===id)||{};
    return (l.lifecycleEvents||[]).map(e=>(e.payload&&e.payload.to)||e.action||e.type);
  },lote.id);
  assert.ok(ev.includes('mix_prepared'),`transiciones: ${ev.join(' | ')}`);

  // ── 3. CONFLICTO ENTRE RESERVAS: cero mutaciones hasta liberar ──────────
  // El físico alcanza para B si se ignora a A, pero A ya lo comprometió. Esta
  // es la carrera que la guarda de ejecución debe detener.
  const conflict=await page.evaluate(()=>{
    const source=(JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]'))[0];
    const plan=JSON.parse(JSON.stringify(source.launchPlan));
    const bId='LOTE_RES_B';
    const aId='LOTE_RES_A';
    const pajaNeed=(plan.allocations||[]).filter(x=>x.ingredientId==='paja_trigo').reduce((sum,x)=>sum+x.quantity,0);
    const inventory=JSON.parse(localStorage.getItem('sdp_lotes')||'[]').map(item=>item.ingredienteId==='paja_trigo'
      ?{...item,activo:true,cantidadKgTotal:pajaNeed,cantidadKgDisponible:pajaNeed}
      :{...item,activo:true,cantidadKgTotal:200,cantidadKgDisponible:200});
    const cleanBatch=(id,codigo)=>({...source,id,codigo,estado:'planificado',lifecycleEvents:[],launchPlan:plan,
      ingredientLots:plan.allocations||[],fechaFin:null,updatedAt:new Date().toISOString()});
    const baseBags=JSON.parse(localStorage.getItem('sdp_bit_bolsas')||'[]').filter(x=>x.loteId===source.id);
    const bags=baseBags.map((bag,i)=>({...bag,id:`B-${i+1}`,codigo:`B-${i+1}`,loteId:bId}));
    const at=new Date().toISOString();
    const own=window.SetasInventoryLedger.reservationsForPlan(plan,{batchId:bId,at});
    const heldByA=window.SetasInventoryLedger.reserve({ingredienteId:'paja_trigo',kg:pajaNeed,batchId:aId,at});
    const ledger=window.SetasInventoryLedger.addReservations([],[heldByA,...own]);
    localStorage.setItem('sdp_lotes',JSON.stringify(inventory));
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([cleanBatch(bId,'UX-RES-B'),cleanBatch(aId,'UX-RES-A')]));
    localStorage.setItem('sdp_bit_bolsas',JSON.stringify(bags));
    localStorage.setItem('sdp_inv_reservas',JSON.stringify(ledger));
    localStorage.setItem('sdp_movimientos','[]');
    localStorage.setItem('sdp_inventory_ops','[]');
    return {aId,bId,pajaNeed};
  });
  await page.reload();
  await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
  const conflictCard=page.locator(`.panel.sdp-lote[data-lote-id="${conflict.bId}"]`).first();
  await conflictCard.waitFor({state:'visible'});
  await conflictCard.click();

  const beforeBlock=await page.evaluate(id=>{
    const read=key=>localStorage.getItem(key)||'';
    const batch=(JSON.parse(read('sdp_bit_lotes')||'[]')).find(x=>x.id===id);
    return {inventory:read('sdp_lotes'),movements:read('sdp_movimientos'),ledger:read('sdp_inv_reservas'),ops:read('sdp_inventory_ops'),events:JSON.stringify(batch?.lifecycleEvents||[])};
  },conflict.bId);
  await page.getByRole('button',{name:/Preparar mezcla/i}).first().click();
  const blocked=page.getByRole('dialog',{name:'Inventario comprometido o incompleto'});
  await expect(blocked).toBeVisible();
  assert.match(await blocked.innerText(),/No se descontó Bodega ni avanzó el lote/);
  const afterBlock=await page.evaluate(id=>{
    const read=key=>localStorage.getItem(key)||'';
    const batch=(JSON.parse(read('sdp_bit_lotes')||'[]')).find(x=>x.id===id);
    return {inventory:read('sdp_lotes'),movements:read('sdp_movimientos'),ledger:read('sdp_inv_reservas'),ops:read('sdp_inventory_ops'),events:JSON.stringify(batch?.lifecycleEvents||[])};
  },conflict.bId);
  assert.deepEqual(afterBlock,beforeBlock,'el bloqueo por reserva ajena mutó estado físico o trazabilidad');
  await blocked.getByRole('button',{name:'Aceptar'}).click();

  // Liberar A recupera B sin alterar su plan. Tras recargar, B puede consumir,
  // cerrar únicamente su propia reserva y registrar una sola transición.
  await page.evaluate(({aId})=>{
    const ledger=JSON.parse(localStorage.getItem('sdp_inv_reservas')||'[]');
    const released=window.SetasInventoryLedger.releaseForBatch(ledger,aId,{at:new Date().toISOString(),reason:'Prueba de recuperación'});
    localStorage.setItem('sdp_inv_reservas',JSON.stringify(released));
  },conflict);
  await page.reload();
  await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
  await page.locator(`.panel.sdp-lote[data-lote-id="${conflict.bId}"]`).first().click();
  await page.getByRole('button',{name:/Preparar mezcla/i}).first().click();
  await autorizarPreparacion();
  await expect.poll(async()=>await stockDe(page,'paja_trigo')).toBe(0);
  await expect.poll(async()=>(await reservas(page)).filter(r=>r.batchId===conflict.bId&&r.status==='held').length).toBe(0);
  const recovery=await page.evaluate(id=>{
    const batch=(JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')).find(x=>x.id===id)||{};
    const events=(batch.lifecycleEvents||[]).map(e=>(e.payload&&e.payload.to)||e.action||e.type);
    const ops=JSON.parse(localStorage.getItem('sdp_inventory_ops')||'[]').filter(x=>x.loteId===id);
    const consumed=JSON.parse(localStorage.getItem('sdp_inv_reservas')||'[]').filter(r=>r.batchId===id&&r.status==='consumed');
    return {events,ops,consumed};
  },conflict.bId);
  assert.equal(recovery.events.filter(x=>x==='mix_prepared').length,1,'la recuperación no registró exactamente una transición');
  assert.equal(recovery.ops.length,1,'la recuperación no produjo exactamente una operación de inventario');
  assert.ok(recovery.consumed.length>0&&recovery.consumed.every(r=>r.consumedByEventId),'la reserva propia no quedó trazada como consumida');

  assert.deepEqual(errores,[]);
  console.log('OK e2e/plan-prepare: reserva al planificar; conflicto ajeno bloquea sin mutar; liberar permite consumir una vez');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
