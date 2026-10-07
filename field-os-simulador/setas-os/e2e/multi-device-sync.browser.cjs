'use strict';
// Dos dispositivos, un servidor (ADR-0009). Cada contexto del navegador tiene
// su propio localStorage, como dos teléfonos. El "Firestore" es un servidor en
// memoria en Node con la misma semántica que firebase/bitacora-sync.js y
// firebase/remote-sync.js; las lecturas en vivo se entregan a cada página como
// las entregaría onSnapshot. Lo que se prueba es la app real: la cola, el
// planificador y la proyección de Bodega montados en React.
// Ejecutar: node e2e/multi-device-sync.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const COLECCIONES=['bitacora_lotes','bitacora_bolsas','bitacora_cosechas','inventario_asientos','inventario_movimientos','inventario_compras','inventario_proveedores','inventario_reservas','room_cycles'];
const clone=x=>JSON.parse(JSON.stringify(x));

class FakeFirestore{
  constructor(){this.cols=Object.fromEntries(COLECCIONES.map(c=>[c,new Map()]));}
  set(c,id,data,merge){const m=this.cols[c];const prev=m.get(String(id));m.set(String(id),clone(merge&&prev?{...prev,...data}:data));}
  docs(c){return [...this.cols[c].values()].map(clone);}
  apply(type,a){
    const tomb={deleted:true};
    const noFoto=b=>{const {foto,...rest}=b;return rest;};
    switch(type){
      case 'guardarLote':return ['bitacora_lotes',this.set('bitacora_lotes',a[0].id,a[0])];
      case 'actualizarLote':return ['bitacora_lotes',this.set('bitacora_lotes',a[0],a[1],true)];
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
}

const stockDe=(page,ing)=>page.evaluate(id=>JSON.parse(localStorage.getItem('sdp_lotes')||'[]')
  .filter(l=>l.ingredienteId===id&&l.activo).reduce((s,l)=>s+(Number(l.cantidadKgDisponible)||0),0),ing);

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/__harness.html?view=inventario`;
 const db=new FakeFirestore();
 const pages=[];
 // Mientras `hold` está activo el servidor acepta escrituras pero no avisa a
 // nadie: los dos equipos trabajan sin verse, como sin señal.
 let hold=false;
 const deliver=async(page,c)=>page.evaluate(({c,docs})=>{const f=window.__subs&&window.__subs[c];if(f)f({coleccion:c,docs,fromCache:false,at:Date.now()});},{c,docs:db.docs(c)});
 const broadcast=async cols=>{if(hold)return;for(const p of pages)for(const c of cols)await deliver(p,c).catch(()=>{});};

 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const errores=[];
  const abrir=async(nombre,seed)=>{
   const ctx=await browser.newContext({viewport:{width:1280,height:900}});
   const page=await ctx.newPage();
   page.on('pageerror',e=>errores.push(`${nombre}: ${e.message}`));
   await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   await page.exposeFunction('__remoteWrite',async(type,args)=>{const [c]=db.apply(type,args);setTimeout(()=>broadcast([c]),0);return {ok:true};});
   await page.exposeFunction('__remoteSubscribe',async c=>{setTimeout(()=>deliver(page,c).catch(()=>{}),0);});
   await page.addInitScript(seedData=>{
    localStorage.setItem('sdp_seeded','1');
    for(const [k,v] of Object.entries(seedData)) localStorage.setItem(k,JSON.stringify(v));
    const w=(type)=>(...args)=>window.__remoteWrite(type,JSON.parse(JSON.stringify(args)));
    window.__subs={};
    window.SetasBitacoraDB=Object.fromEntries(['guardarLote','actualizarLote','guardarBolsas','actualizarBolsa','guardarCosecha','eliminarCosecha','eliminarLoteCascade'].map(t=>[t,w(t)]));
    window.SetasRemoteSyncDB={
     ...Object.fromEntries(['crearDocumento','actualizarDocumento','eliminarDocumento','crearAsientoInventario'].map(t=>[t,w(t)])),
     suscribirColeccion:(c,onData)=>{window.__subs[c]=onData;window.__remoteSubscribe(c);return ()=>{delete window.__subs[c];};},
    };
   },seed);
   await page.goto(url);
   await page.waitForFunction(n=>Object.keys(window.__subs||{}).length===n,COLECCIONES.length);
   pages.push(page);
   return page;
  };
  // El drenador corre cada 15 s y con el evento 'online'; aquí se dispara a
  // mano hasta que la condición se cumpla.
  const drenarHasta=async(page,cond,msg)=>{
   for(let i=0;i<40;i++){
    if(await cond())return;
    await page.evaluate(()=>window.dispatchEvent(new Event('online')));
    await page.waitForTimeout(250);
   }
   assert.fail(msg);
  };

  // ── 1. Bodega y Bitácora de A llegan a B ─────────────────────────────────
  const A=await abrir('A',{
   sdp_lotes:[{id:'fx-1',ingredienteId:'paja_trigo',compraId:'compra_fx',activo:true,cantidadKgTotal:10,cantidadKgDisponible:10,precioPorKgCOP:1000,fechaIngreso:'2026-10-01',unidad:'kg'}],
   sdp_movimientos:[],sdp_compras:[],sdp_inv_reservas:[],
   sdp_proveedores:[{id:'prov_test',nombre:'Proveedor de Prueba',tipo:'directo',municipio:'Tenjo'}],
   sdp_bit_lotes:[{id:'BIT_E2E',codigo:'SDP-E2E-01',especie:'ostreatus',estado:'incubacion',numBolsas:0,createdAt:'2026-10-01T10:00:00.000Z'}],
  });
  await drenarHasta(A,async()=>db.cols.inventario_asientos.has('open_fx-1')&&db.cols.bitacora_lotes.has('BIT_E2E')&&db.cols.inventario_proveedores.has('prov_test'),
   'A no subió su inventario, su proveedor o su lote de Bitácora');

  const B=await abrir('B',{sdp_lotes:[],sdp_movimientos:[],sdp_compras:[],sdp_inv_reservas:[],sdp_proveedores:[]});
  await expect.poll(()=>stockDe(B,'paja_trigo')).toBe(10);
  await expect.poll(()=>B.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]').map(l=>l.codigo))).toEqual(['SDP-E2E-01']);
  await expect.poll(()=>B.evaluate(()=>JSON.parse(localStorage.getItem('sdp_proveedores')||'[]').map(p=>p.nombre))).toEqual(['Proveedor de Prueba']);
  await expect(B.locator('.inventory-stock-table')).toContainText('10.0');

  // ── 2. Ajustes simultáneos sin verse: los dos descuentos cuentan ──────────
  const editar=async(page,kg)=>{
   await page.getByRole('button',{name:/Editar/}).first().click();
   const input=page.locator('input[name="stockKg-paja_trigo"]');
   await input.fill(String(kg));
   await input.press('Enter');
  };
  hold=true;
  const antes=db.cols.inventario_asientos.size;
  await editar(A,8);   // −2
  await editar(B,7);   // −3
  await drenarHasta(A,async()=>db.cols.inventario_asientos.size>=antes+1,'A no subió su ajuste');
  await drenarHasta(B,async()=>db.cols.inventario_asientos.size>=antes+2,'B no subió su ajuste');
  hold=false;
  await broadcast(['inventario_asientos']);
  await expect.poll(()=>stockDe(A,'paja_trigo')).toBe(5);
  await expect.poll(()=>stockDe(B,'paja_trigo')).toBe(5);

  // ── 3. Los dos descuentan lo mismo: sobregiro visible y recuento ─────────
  hold=true;
  const antes2=db.cols.inventario_asientos.size;
  await editar(A,0);
  await editar(B,0);
  await drenarHasta(A,async()=>db.cols.inventario_asientos.size>=antes2+1,'A no subió su consumo');
  await drenarHasta(B,async()=>db.cols.inventario_asientos.size>=antes2+2,'B no subió su consumo');
  hold=false;
  await broadcast(['inventario_asientos']);
  for(const p of [A,B]){
   const alerta=p.locator('[data-testid="inventory-overdraw"]');
   await expect(alerta).toBeVisible();
   await expect(alerta).toContainText('5.0 kg de más');
  }
  await editar(A,3);
  await drenarHasta(A,async()=>(await stockDe(B,'paja_trigo'))===3,'el recuento de A no llegó a B');
  await expect(A.locator('[data-testid="inventory-overdraw"]')).toHaveCount(0);
  await expect(B.locator('[data-testid="inventory-overdraw"]')).toHaveCount(0);

  assert.deepEqual(errores,[],`errores de página: ${errores.join(' | ')}`);
  console.log('PASS multi-device: Bodega/proveedor/Bitácora de A llegan a B; ajustes simultáneos se suman; sobregiro visible y recuento lo resuelve en ambos equipos.');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
