'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  const url=`http://127.0.0.1:${server.address().port}/__harness.html`;
  await page.goto(url+'?view=inventario');
  await expect(page.getByText('Bodega sin existencias registradas')).toBeVisible();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_lotes')||'[]')),[]);
  await page.evaluate(()=>localStorage.setItem('setas_v6',JSON.stringify([{id:'fixture',name:'Receta sintética',sKey:'p_ostreatus_gris',recipe:[{id:'paja_trigo',p:80},{id:'salvado_trigo',p:20}]}])));
  await page.goto(url+'?view=bitacora');
  const panel=page.getByRole('region',{name:'Ensayos y respaldos'});
  await panel.getByRole('button',{name:'Planificar ensayo',exact:true}).click();
  await panel.getByLabel('Nombre del ensayo').fill('Prueba sintética de planificación');
  await panel.getByLabel('Pregunta / hipótesis').fill('Registrar un ensayo sin fabricar observaciones.');
  await panel.getByRole('button',{name:'Continuar',exact:true}).click();
  await panel.getByLabel('Receta de referencia').selectOption('fixture');
  await panel.getByLabel('Lotes independientes por grupo').fill('1');
  await panel.getByLabel('Condiciones que se mantendrán iguales').fill('Solo fixture de software');
  await panel.getByRole('button',{name:'Continuar',exact:true}).click();
  await panel.getByRole('button',{name:'Guardar plan',exact:true}).click();
  await expect(panel.getByRole('status')).toContainText('Plan guardado');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_experiments_v1')).length),1);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_bit_lotes')||'[]').length),0);
  await page.reload();await expect(panel.getByText(/Prueba sintética de planificación ·/)).toBeVisible();
  assert.ok(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth),'trial panel fits mobile');
  const downloadPromise=page.waitForEvent('download');await panel.getByRole('button',{name:'Exportar respaldo'}).click();
  const download=await downloadPromise,backupPath=await download.path(),backup=JSON.parse(fs.readFileSync(backupPath,'utf8'));
  assert.equal(backup.collections.sdp_experiments_v1.length,1);
  await page.screenshot({path:path.join(os.tmpdir(),'setas-prototype-mobile.png'),fullPage:true});
  await page.evaluate(()=>localStorage.clear());await page.reload();
  await panel.getByText('Restaurar respaldo en espacio vacío',{exact:true}).click();
  await panel.getByLabel('Archivo de respaldo').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await expect(panel.getByText(/0 lotes · 0 bolsas · 0 cosechas/)).toBeVisible();
  await panel.getByRole('button',{name:'Confirmar restauración local'}).click();
  await expect(panel.getByText(/Prueba sintética de planificación ·/)).toBeVisible();
  assert.deepEqual(errors,[]);
  console.log('PASS prototype: empty Bodega, mobile guided plan, no fabricated batches, reload, actual backup download and restore.');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
