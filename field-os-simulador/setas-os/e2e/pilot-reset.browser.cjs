'use strict';
// Reinicio para el piloto: solo dirección lo ve; descarga el respaldo antes de
// borrar, cada lote sale como lápida encolada y la cola de tareas queda vacía.
// Solo fixtures sintéticos; ninguna escritura sale del navegador.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const seed=()=>{
  if(localStorage.getItem('pilot_reset_seed'))return;
  localStorage.setItem('pilot_reset_seed','1');
  localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'L1',codigo:'L-PRUEBA-1',estado:'incubacion',createdAt:'2026-10-01T10:00:00Z'},{id:'L2',codigo:'L-PRUEBA-2',estado:'fructificacion',createdAt:'2026-10-02T10:00:00Z'}]));
  localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'B1',loteId:'L1',estado:'colonizando'},{id:'B2',loteId:'L2',estado:'fructificando'}]));
  localStorage.setItem('sdp_bit_cosechas',JSON.stringify([{id:'C1',loteId:'L2',pesoG:300,fecha:'2026-10-20'}]));
  localStorage.setItem('sdp_bit_tasks',JSON.stringify([{id:'T1',batchId:'L1',status:'pending',title:'Revisar colonización'}]));
  localStorage.setItem('setas_os_state',JSON.stringify({containers:[{id:'C-PRUEBA'}],ledger:[],seq:1,salidas:[],yields:[]}));
};
(async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
    const url=`http://127.0.0.1:${server.address().port}/__harness.html?view=bitacora`;
    const local=r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort();

    // Operario: el panel no existe.
    const op=await browser.newPage({serviceWorkers:'block'});await op.route('**/*',local);await op.addInitScript(seed);
    await op.goto(url);await expect(op.getByRole('region',{name:'Ensayos y respaldos'})).toBeVisible();
    await expect(op.getByText('Reiniciar para el piloto de producción')).toHaveCount(0);await op.close();

    // Dirección (rol leído de la sesión, simulado solo en la consulta de cuenta).
    const page=await browser.newPage({serviceWorkers:'block',viewport:{width:390,height:844}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',local);
    await page.route('**/vendor/firebase/firebase-firestore.js',r=>r.fulfill({contentType:'application/javascript',body:"export const doc=(...args)=>args; export const getDoc=async()=>({exists:()=>true,data:()=>({rol:'admin'})});"}));
    await page.addInitScript(()=>{window.SetasFirebase={auth:{currentUser:{uid:'direccion-e2e'}},db:{}};});
    await page.addInitScript(seed);
    await page.goto(url);
    await page.getByText('Reiniciar para el piloto de producción').click();
    const panel=page.getByRole('group',{name:'Reiniciar para el piloto'});
    await expect(panel).toContainText('2 lotes de prueba, con sus 2 bolsas y 1 cosechas');
    const go=panel.getByRole('button',{name:'Descargar respaldo y reiniciar'});
    await expect(go).toBeDisabled();
    await panel.getByLabel('Escribe REINICIAR para confirmar').fill('reiniciar');await expect(go).toBeDisabled();
    await panel.getByLabel('Escribe REINICIAR para confirmar').fill('REINICIAR');await expect(go).toBeEnabled();
    const downloadP=page.waitForEvent('download'),reloadP=page.waitForEvent('load');
    await go.click();
    const download=await downloadP;
    assert.match(download.suggestedFilename(),/^setas-respaldo-antes-del-piloto-\d{4}-\d{2}-\d{2}\.json$/);
    const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
    assert.deepEqual(backup.collections.sdp_bit_lotes.map(l=>l.id),['L1','L2'],'el respaldo conserva los lotes de prueba');
    assert.equal(backup.collections.sdp_bit_tasks.length,1);
    await reloadP;
    const after=await page.evaluate(()=>({
      lotes:JSON.parse(localStorage.getItem('sdp_bit_lotes')),bolsas:JSON.parse(localStorage.getItem('sdp_bit_bolsas')),
      cosechas:JSON.parse(localStorage.getItem('sdp_bit_cosechas')),tasks:JSON.parse(localStorage.getItem('sdp_bit_tasks')),
      queue:JSON.parse(localStorage.getItem('sdp_sync_queue')||'[]'),marker:localStorage.getItem('sdp_pilot_wipe_request_v1'),
    }));
    assert.deepEqual([after.lotes,after.bolsas,after.cosechas,after.tasks],[[],[],[],[]]);
    const cascades=after.queue.filter(o=>o.type==='eliminarLoteCascade').map(o=>o.args);
    assert.deepEqual(cascades.sort((a,b)=>a[0].localeCompare(b[0])),[['L1',['B1'],[]],['L2',['B2'],['C1']]],'cada lote viaja como lápida con sus bolsas y cosechas');
    assert.ok(after.marker,'el shell recibe la marca para descartar el registro del turno');
    assert.deepEqual(errors,[]);
    console.log('PASS pilot reset: oculto a operario, confirmación escrita, respaldo antes de borrar, lápidas encoladas, tareas vacías.');
  }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
