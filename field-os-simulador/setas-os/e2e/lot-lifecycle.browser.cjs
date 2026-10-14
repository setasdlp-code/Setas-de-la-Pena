'use strict';
// Ciclo completo de un lote en la app real: planificar, preparar la mezcla,
// pasar por tratamiento térmico, enfriamiento, inoculación, incubación y
// fructificación, cosechar y finalizar.
//
// Cada cambio de etapa sigue el camino de producción: la app encola el evento,
// lo envía por el transporte callable y la función de aceptación REAL
// (functions/accept-field-event.js) lo valida contra un Firestore en memoria.
// La etapa aceptada vuelve a la app por la sincronización de Bitácora
// (ADR-0009), igual que llegaría por onSnapshot. Lo que se comprueba es que la
// etapa que ve el operario es la que aceptó el servidor, y que el cliente nunca
// escribe lifecycleState ni revision por su cuenta.
// Ejecutar: node e2e/lot-lifecycle.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

// La función importa sus dependencias de functions/shared, que es generado
// (npm run functions:sync) y no está en el repositorio.
const SHARED=['field-events-model.js','field-event-contracts.js','setas-os-workflow.js','batch-sheet.js'];
fs.mkdirSync(path.join(root,'functions','shared'),{recursive:true});
for(const f of SHARED)fs.copyFileSync(path.join(root,f),path.join(root,'functions','shared',f));
const {createAcceptFieldEvent}=require('../functions/accept-field-event.js');

const RECETA=[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}];
const PROJECT='e2e-ciclo';
const UID='op_e2e';
const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));

const COLECCIONES=['bitacora_lotes','bitacora_bolsas','bitacora_cosechas','inventario_asientos','inventario_movimientos','inventario_compras','inventario_proveedores','inventario_reservas','room_cycles','production_readiness'];

class FakeFirestore{
  constructor(){this.cols=Object.fromEntries([...COLECCIONES,'field_events','contenedores'].map(c=>[c,new Map()]));this.clientWrites=[];}
  set(c,id,data,merge){const m=this.cols[c];const prev=m.get(String(id));m.set(String(id),clone(merge&&prev?{...prev,...data}:data));}
  docs(c){return [...this.cols[c].values()].map(clone);}
  // Escrituras del cliente con la semántica de firebase/bitacora-sync.js y
  // remote-sync.js. lifecycleEvents usa arrayUnion en producción.
  apply(type,a){
    const tomb={deleted:true};
    const noFoto=b=>{const {foto,...rest}=b;return rest;};
    switch(type){
      case 'guardarLote':return ['bitacora_lotes',this.set('bitacora_lotes',a[0].id,a[0])];
      case 'actualizarLote':{
        const prev=this.cols.bitacora_lotes.get(String(a[0]))||{};
        const f={...a[1]};
        if(Array.isArray(f.lifecycleEvents)){
          const ids=new Set((prev.lifecycleEvents||[]).map(e=>e.id));
          f.lifecycleEvents=[...(prev.lifecycleEvents||[]),...f.lifecycleEvents.filter(e=>!ids.has(e.id))];
        }
        return ['bitacora_lotes',this.set('bitacora_lotes',a[0],f,true)];
      }
      case 'guardarBolsas':a[0].forEach(b=>this.set('bitacora_bolsas',b.id,noFoto(b)));return ['bitacora_bolsas'];
      case 'actualizarBolsa':return ['bitacora_bolsas',this.set('bitacora_bolsas',a[0],noFoto(a[1]),true)];
      case 'guardarCosecha':return ['bitacora_cosechas',this.set('bitacora_cosechas',a[0].id,a[0])];
      case 'eliminarCosecha':return ['bitacora_cosechas',this.set('bitacora_cosechas',a[0],tomb,true)];
      case 'eliminarLoteCascade':this.set('bitacora_lotes',a[0],tomb,true);return ['bitacora_lotes'];
      case 'crearDocumento':{const [c,id]=a[0].split('/');this.set(c,id,a[1]);return [c];}
      case 'actualizarDocumento':{const [c,id]=a[0].split('/');this.set(c,id,a[1],true);return [c];}
      case 'eliminarDocumento':{const [c,id]=a[0].split('/');this.set(c,id,tomb,true);return [c];}
      case 'crearAsientoInventario':if(!this.cols.inventario_asientos.has(a[0].id))this.set('inventario_asientos',a[0].id,a[0]);return ['inventario_asientos'];
      default:throw new Error('operación desconocida '+type);
    }
  }
  // La parte de firebase-admin que usa acceptFieldEvent.
  admin(){
    return {
      collection:c=>({doc:id=>({c,id:String(id)})}),
      runTransaction:async fn=>{
        const writes=[];
        const tx={
          get:async ref=>{const d=this.cols[ref.c].get(ref.id);return {exists:d!==undefined,data:()=>clone(d)};},
          set:(ref,data,opts)=>{writes.push([ref,data,opts]);},
        };
        const out=await fn(tx);
        for(const [ref,data,opts] of writes)this.set(ref.c,ref.id,data,opts&&opts.merge);
        return out;
      },
    };
  }
}

const loteLocal=(page,id)=>page.evaluate(i=>(JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]')).find(l=>l.id===i)||null,id);

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);
  // El arnés usa el transporte simulado por defecto; aquí se quiere el callable
  // real, que es el que habla con acceptFieldEvent en producción.
  if(pathname==='/__harness.html')body=body.toString()
    .replace('<script src="simulador-app.js">','<script src="formulator-api.js"></script><script src="simulador-app.js">')
    .replace('<script>window.__setasFieldMockSync = true;</script>','');
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const db=new FakeFirestore();
 const accept=createAcceptFieldEvent({db:db.admin(),resolveRole:async()=>'produccion'});
 const aceptados=[];const rechazos=[];
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  const deliver=c=>page.evaluate(({c,docs})=>{const f=window.__subs&&window.__subs[c];if(f)f({coleccion:c,docs,fromCache:false,at:Date.now()});},{c,docs:db.docs(c)}).catch(()=>{});

  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname===`us-central1-${PROJECT}.cloudfunctions.net`&&url.pathname==='/acceptFieldEvent'){
    const envelope=JSON.parse(route.request().postData()).data;
    try{
     const result=await accept(envelope,{uid:UID});
     aceptados.push(envelope.event.payload);
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({result})});
     setTimeout(()=>deliver('bitacora_lotes'),0);
    }catch(err){
     rechazos.push(err.code||err.message);
     await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{message:err.message,details:{code:err.code}}})});
    }
    return;
   }
   return url.hostname==='127.0.0.1'?route.continue():route.abort();
  });
  await page.exposeFunction('__remoteWrite',async(type,args)=>{const [c]=db.apply(type,args);setTimeout(()=>deliver(c),0);return {ok:true};});
  await page.exposeFunction('__remoteSubscribe',async c=>{setTimeout(()=>deliver(c),0);});
  await page.addInitScript(({project,uid})=>{
   if(!sessionStorage.getItem('fixture-init')){
    localStorage.clear();
    localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_lotes',JSON.stringify(['paja_trigo','salvado_trigo','spawn_grano','bolsa_pp_plana','bolsa_unicorn_microfiltro']
      .map((id,i)=>({id:'fx-'+i,ingredienteId:id,activo:true,cantidadKgDisponible:200,cantidadKgTotal:200,unidad:id.startsWith('bolsa')?'ud':'kg',fechaIngreso:'2026-01-0'+(i+1),precioKg:2000}))));
    for(const k of ['sdp_bit_lotes','sdp_bit_bolsas','sdp_bit_cosechas','sdp_inv_reservas'])localStorage.setItem(k,'[]');
    localStorage.setItem('setas_global_workmode','produccion');
    sessionStorage.setItem('fixture-init','1');
   }
   // Sesión de Firebase mínima: lo que leen el transporte callable y la cola
   // de eventos de campo. No hay SDK de Firebase en el arnés.
   window.SetasFirebase={app:{options:{projectId:project}},auth:{currentUser:{uid,getIdToken:async()=>'token-e2e'}}};
   const w=type=>(...args)=>window.__remoteWrite(type,JSON.parse(JSON.stringify(args)));
   window.__subs={};
   window.SetasBitacoraDB=Object.fromEntries(['guardarLote','actualizarLote','guardarBolsas','actualizarBolsa','guardarCosecha','eliminarCosecha','eliminarLoteCascade'].map(t=>[t,w(t)]));
   window.SetasRemoteSyncDB={
    ...Object.fromEntries(['crearDocumento','actualizarDocumento','eliminarDocumento','crearAsientoInventario'].map(t=>[t,w(t)])),
    suscribirColeccion:(c,onData)=>{window.__subs[c]=onData;window.__remoteSubscribe(c);return ()=>{delete window.__subs[c];};},
   };
  },{project:PROJECT,uid:UID});

  const base=`http://127.0.0.1:${server.address().port}/__harness.html`;
  await page.goto(`${base}?view=formular`);
  await page.waitForFunction(()=>window.SetasFormulatorAPI&&window.SetasFormulatorAPI.adapterType()==='native');
  await page.selectOption('#form-species-context-select','p_ostreatus_gris');
  await page.evaluate(r=>window.SetasFormulatorAPI.applyRecipe(r),RECETA);
  const navegar=async v=>{await page.evaluate(v=>{window.SetasOSNavigation.navigate(window,v);window.dispatchEvent(new PopStateEvent('popstate'));},v);};
  const drenar=()=>page.evaluate(()=>window.dispatchEvent(new Event('online')));

  // ── 1. Planificar: el lote nace planificado y sube a Bitácora ─────────────
  await page.evaluate(recipe=>SetasPrototype.savePlan(localStorage,{
    id:'ciclo-trial',title:'Ensayo de ciclo completo',hypothesis:'Recorrer el ciclo del lote en la app',
    speciesId:'p_ostreatus_gris',design:'exploratory',primaryMetric:'be_pct',status:'draft',
    control:{id:'control',label:'Referencia',plannedReplicates:1,batchIds:[],recipeVersionId:'ciclo-v1',recipeSnapshot:{versionId:'ciclo-v1',sKey:'p_ostreatus_gris',recipe}},treatments:[]
  }),RECETA);
  await navegar('bitacora');
  const trials=page.getByRole('region',{name:'Ensayos y respaldos'});
  await trials.getByText('Ensayo de ciclo completo · Planificado',{exact:true}).click();
  await trials.getByRole('button',{name:'Planificar lote de Referencia (0/1)',exact:true}).click();
  await navegar('produccion');
  await page.locator('#prod-bags').fill('2');
  await page.locator('#prod-kg').fill('1');
  await page.locator('#prod-h').fill('60');
  await page.getByRole('button',{name:/Planificar lote/}).click();
  await page.getByRole('dialog',{name:'Planificar lote',exact:true}).getByRole('button',{name:/Confirmar y reservar/}).click();
  await expect.poll(async()=>(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]').length))).toBe(1);
  const loteId=(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes'))[0])).id;
  for(let i=0;i<40&&!db.cols.bitacora_lotes.has(loteId);i++){await drenar();await page.waitForTimeout(250);}
  assert.ok(db.cols.bitacora_lotes.has(loteId),'el lote planificado no subió a Bitácora');
  assert.equal(db.cols.bitacora_lotes.get(loteId).estado,'planificado');

  // ── 2. Preparar la mezcla en móvil: la primera etapa la acepta el servidor ──
  await page.setViewportSize({width:390,height:844});
  const cerrarAvisos=async()=>{
   for(let i=0;i<3;i++){
    const ok=page.locator('.inv-modal-bg').getByRole('button',{name:/^(Aceptar|Entendido|Cerrar)$/i});
    if(!(await ok.count()))return;
    await ok.first().click();
   }
  };
  const abrirFicha=async()=>{
   await cerrarAvisos();
   await page.locator('.app-rail-mobile [data-dest="lotes"]').click();
   const card=page.locator(`.panel.sdp-lote[data-lote-id="${loteId}"]`).first();
   await card.waitFor({state:'visible'});
   await card.click();
   await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').waitFor({state:'visible'});
  };
  await abrirFicha();
  await page.getByRole('button',{name:/Preparar mezcla/i}).first().click();
  const release=page.getByRole('dialog',{name:'Autorizar ensayo controlado'});
  await release.getByLabel('Equipo disponible').fill('Equipo de ensayo documentado');
  await release.getByLabel('Protocolo a ejecutar').fill('Protocolo sintético para prueba de software');
  await release.getByLabel('Responsable que autoriza').fill('Operador de prueba');
  await release.getByRole('checkbox').check();
  await release.getByRole('button',{name:/Autorizar, descontar y registrar/i}).click();

  const esperarEtapa=async(to,estado)=>{
   await expect.poll(()=>db.cols.bitacora_lotes.get(loteId)?.lifecycleState,{message:`el servidor no aceptó ${to}; rechazos: ${rechazos.join(', ')}`}).toBe(to);
   assert.equal(db.cols.bitacora_lotes.get(loteId).estado,estado,`estado en español para ${to}`);
   await expect.poll(async()=>(await loteLocal(page,loteId))?.lifecycleState,{message:`la etapa ${to} no llegó a la app`}).toBe(to);
  };
  await esperarEtapa('mix_prepared','mezcla_preparada');

  // ── 3. Avanzar etapa por etapa desde la ficha ─────────────────────────────
  const etiqueta={thermal_treatment:'Tratamiento térmico',cooling:'Enfriamiento',inoculated:'Inoculado',incubation:'Incubación',fruiting:'Fructificación'};
  const recorrido=[['thermal_treatment','tratamiento_termico'],['cooling','enfriamiento'],['inoculated','inoculado'],['incubation','incubacion'],['maturation','maduracion'],['induction','induccion'],['fruiting','fructificacion']];
  for(const [to,estado] of recorrido){
   const antes=(await loteLocal(page,loteId)).lifecycleState;
   await abrirFicha();
   const avanzar=page.locator('[data-testid="ux-v2-batch-detail-mobile"]').getByRole('button',{name:/Avanzar etapa|Iniciar tratamiento|Cerrar tratamiento|Inocular/i}).first();
   await avanzar.waitFor({state:'visible'});
   await avanzar.click();
   if(to==='inoculated'){
    const dlg=page.getByRole('dialog',{name:'Inocular',exact:true});
    await dlg.getByLabel('Lote de semilla usado').fill('SPW-E2E-01');
    await dlg.getByRole('button',{name:'Registrar inoculación',exact:true}).click();
   }
   await esperarEtapa(to,estado);
   assert.notEqual(antes,to);
   if(etiqueta[to])await expect(page.locator('body')).toContainText(etiqueta[to]);
  }

  // ── 4. Cosechar una bolsa ─────────────────────────────────────────────────
  await abrirFicha();
  await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').getByRole('button',{name:/Registrar cosecha/i}).first().click();
  const harvest=page.getByRole('dialog',{name:'Registrar cosecha',exact:true});
  await harvest.getByLabel('Peso fresco (g)',{exact:true}).fill('430');
  await harvest.getByRole('button',{name:'Guardar cosecha',exact:true}).click();
  await expect(harvest).toHaveCount(0);
  await expect.poll(async()=>(await page.evaluate(id=>JSON.parse(localStorage.getItem('sdp_bit_cosechas')||'[]').filter(c=>c.loteId===id).length,loteId))).toBe(1);
  for(let i=0;i<40&&![...db.cols.bitacora_cosechas.values()].some(c=>c.loteId===loteId);i++){await drenar();await page.waitForTimeout(250);}
  assert.ok([...db.cols.bitacora_cosechas.values()].some(c=>c.loteId===loteId&&c.pesoFresco===430),'la cosecha no subió');

  // ── 5. Finalizar el lote ──────────────────────────────────────────────────
  await abrirFicha();
  await page.locator('[data-testid="ux-v2-batch-detail-mobile"]').getByRole('button',{name:/Finalizar lote/i}).first().click();
  await page.getByRole('dialog',{name:'Finalizar lote'}).getByRole('button',{name:'Finalizar',exact:true}).click();
  await esperarEtapa('closed','completado');

  // ── 6. El cliente nunca escribió la etapa por su cuenta ───────────────────
  // Solo claves de primer nivel: preparation.revision es otra cosa.
  const camposDelLote=w=>Object.keys((w.type==='guardarLote'?w.args[0]:w.args[1])||{});
  const tocaFlujo=db.clientWrites.filter(w=>(w.type==='guardarLote'||w.type==='actualizarLote')&&camposDelLote(w).some(k=>k==='lifecycleState'||k==='revision'));
  assert.deepEqual(tocaFlujo,[],'el cliente escribió lifecycleState o revision');
  const estadoDelCliente=db.clientWrites.filter(w=>w.type==='actualizarLote'&&w.args[1]&&'estado' in w.args[1]);
  assert.deepEqual(estadoDelCliente,[],'con sesión, el cliente no debe escribir el estado del lote');
  assert.deepEqual(rechazos,[],'el servidor rechazó transiciones');
  assert.deepEqual(aceptados.map(p=>p.to),['mix_prepared',...recorrido.map(r=>r[0]),'closed']);
  assert.equal(db.cols.bitacora_lotes.get(loteId).revision,aceptados.length);

  // ── 7. Un lote cerrado no admite más cambios de etapa ─────────────────────
  await abrirFicha();
  await expect(page.locator('[data-testid="ux-v2-batch-detail-mobile"]').getByRole('button',{name:/Avanzar etapa|Finalizar lote/i})).toHaveCount(0);

  assert.deepEqual(errores,[]);
  console.log('OK e2e/lot-lifecycle: planificar → preparar → tratamiento → inocular → incubar → fructificar → cosechar → cerrar, cada etapa aceptada por el servidor y sincronizada');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
