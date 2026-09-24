'use strict';
// La sala como objeto vivo: el tablero tiene que DECIR qué hay dentro, con qué
// ambiente y qué hacer con ella. Se monta la app de verdad porque un test que
// lee el .jsx como texto no prueba que el operario vea nada — en este proyecto
// ya se escribió una pantalla entera dentro de un componente que nunca se
// montaba y la suite siguió en verde.
// Ejecutar: node e2e/room-board.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const HORA=3600000;
const hace=h=>new Date(Date.now()-h*HORA).toISOString();

// martha_01 ocupada, con una bolsa aislada dentro.
const LOTE={
  id:'LOTE_BOARD_1',codigo:'SHI-260901-21',especie:'Shiitake',
  lifecycleState:'fruiting',estado:'fructificacion',sala:'martha_01',
  numBolsas:3,fechaInoculacion:'2026-08-01',operador:'operador-arnes',
  lifecycleEvents:[],
};
const BOLSAS=[
  {id:'B_BOARD_1',loteId:'LOTE_BOARD_1',numero:1,codigo:'B1',estado:'sana'},
  {id:'B_BOARD_2',loteId:'LOTE_BOARD_1',numero:2,codigo:'B2',estado:'sana'},
  {id:'B_BOARD_3',loteId:'LOTE_BOARD_1',numero:3,codigo:'B3',estado:'aislada'},
];
// cloudlab_844 vacía desde hace 30 h: pasado el período de gracia de 24 h,
// pide sanitizar antes de recibir otro lote.
const ROOM_EVENTS=[
  {id:'re-1',roomId:'cloudlab_844',type:'room_occupied',at:hace(80),operatorId:'op'},
  {id:'re-2',roomId:'cloudlab_844',type:'room_emptied',at:hace(30),operatorId:'op'},
];

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
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(([lote,bolsas,roomEvents])=>{
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes','[]');
   localStorage.setItem('sdp_bit_lotes',JSON.stringify([lote]));
   localStorage.setItem('sdp_bit_bolsas',JSON.stringify(bolsas));
   localStorage.setItem('sdp_bit_cosechas','[]');
   localStorage.setItem('sdp_room_events',JSON.stringify(roomEvents));
  },[LOTE,BOLSAS,ROOM_EVENTS]);
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html`);

  await page.waitForSelector('[data-testid="ux-v2-today"]',{state:'visible'});
  await page.locator('.app-rail-mobile [data-dest="salas"]').click();

  const board=page.locator('[data-testid="room-board"]');
  await expect(board).toBeVisible();
  // Las tres salas reales de la finca, no sólo la seleccionada.
  assert.equal(await board.locator('[data-testid="room-card"]').count(),3);

  const martha=board.locator('[data-room-id="martha_01"]');
  assert.equal(await martha.getAttribute('data-room-status'),'occupied');
  const textoMartha=await martha.innerText();
  // Qué hay dentro, con la bolsa aislada contada aparte de las activas.
  assert.match(textoMartha,/1 lote/i);
  assert.match(textoMartha,/2 bolsas activas/i);
  assert.match(textoMartha,/1 bolsa aislada/i,'la bolsa aislada no se ve en la tarjeta');
  assert.match(textoMartha,/Fructificación/i);
  // Una bolsa aislada es lo primero que hay que atender en esa sala.
  assert.match(textoMartha,/Revisar bolsas aisladas/i);
  // Objetivo táctil: se pulsa con guantes.
  const cajaMartha=await martha.boundingBox();
  assert.ok(cajaMartha.height>=48,`tarjeta de ${Math.round(cajaMartha.height)} px`);

  const cloudlab=board.locator('[data-room-id="cloudlab_844"]');
  assert.equal(await cloudlab.getAttribute('data-room-status'),'needs_sanitation');
  assert.match(await cloudlab.innerText(),/sanitizar/i);

  // Sanitizar es la única operación de sala que se declara a mano, y cambia el
  // estado de la tarjeta sin recargar.
  await cloudlab.getByRole('button',{name:/Sanitizar sala/i}).click();
  await expect.poll(async()=>cloudlab.getAttribute('data-room-status')).toBe('empty');
  const sanit=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_room_events')||'[]').filter(e=>e.type==='room_sanitized'));
  assert.equal(sanit.length,1);
  assert.equal(sanit[0].roomId,'cloudlab_844');

  // Ocupación derivada: martha_01 está ocupada y nadie declaró nada, así que
  // el evento room_occupied tiene que haberse escrito solo.
  await expect.poll(async()=>page.evaluate(()=>{
   const evs=JSON.parse(localStorage.getItem('sdp_room_events')||'[]');
   return evs.some(e=>e.roomId==='martha_01'&&e.type==='room_occupied');
  })).toBe(true);

  // Y el tablero nunca puede contradecir a los eventos: la sala que los
  // eventos dan por ocupada es la que la tarjeta muestra ocupada.
  const coherente=await page.evaluate(()=>{
   const evs=JSON.parse(localStorage.getItem('sdp_room_events')||'[]');
   return Array.from(document.querySelectorAll('[data-testid="room-card"]')).every(card=>{
    const id=card.getAttribute('data-room-id');
    const ultimo=evs.filter(e=>e.roomId===id&&(e.type==='room_occupied'||e.type==='room_emptied'))
      .sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(-1)[0];
    if(!ultimo) return true;
    const ocupadaSegunTarjeta=card.getAttribute('data-room-status')==='occupied';
    return ocupadaSegunTarjeta===(ultimo.type==='room_occupied');
   });
  });
  assert.ok(coherente,'una tarjeta dice lo contrario que el último evento de ocupación de su sala');

  assert.deepEqual(errors,[],'la página lanzó errores');
  console.log('OK e2e/room-board: el tablero dice qué hay en cada sala y coincide con sus eventos');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
