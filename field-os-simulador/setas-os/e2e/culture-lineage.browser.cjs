'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const artifactDir=process.env.SETAS_METRICS_ARTIFACT_DIR;
if(artifactDir)fs.mkdirSync(artifactDir,{recursive:true});
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>{
    if(localStorage.getItem('lineage_seed'))return;
    localStorage.setItem('lineage_seed','1');localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'L1',codigo:'TEST-L1',peseSeco:1,estado:'fructificacion',recipeRef:{sKey:'p_ostreatus_gris',recipe:[]}}]));
    localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'B1',loteId:'L1',estado:'contaminada'}]));
    localStorage.setItem('sdp_bit_cosechas',JSON.stringify([{id:'C1',loteId:'L1',pesoFresco:500}]));
   });
   await page.goto(`${base}/__harness.html?view=bitacora`);
   const panel=page.locator('details').filter({has:page.locator('summary', {hasText:'Linajes de cultivo'})});
   await panel.locator('summary').click();
   await expect(panel.getByText('Alerta sin configurar.',{exact:true})).toBeVisible();
   const form=panel.locator('form');
   await form.getByLabel('ID',{exact:true}).fill('M1');
   await form.getByLabel('Fecha',{exact:true}).fill('2026-01-01');
   await form.getByLabel('Origen / referencia').fill('Ficha 1');
   await form.getByLabel('Medio',{exact:true}).fill('agar');
   await form.getByLabel('Número de pases').fill('0');
   await form.getByRole('button',{name:'Guardar registro'}).click();
   await expect(panel.getByText('Cultivo madre: M1',{exact:true})).toBeVisible();
   await form.locator('select').first().selectOption('spawn');
   await form.getByLabel('Progenitor').selectOption('M1');
   await form.getByLabel('ID',{exact:true}).fill('S1');
   await form.getByLabel('Número de pases').fill('1');
   await form.getByRole('button',{name:'Guardar registro'}).click();
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_culture_lineage_v1')));
   assert.equal(stored.records.length,2);assert.equal(stored.records[1].parentId,'M1');
   await panel.getByLabel('Spawn de TEST-L1').selectOption('S1');
   await expect(panel.getByRole('button',{name:'Madre M1 · 1 pases'})).toBeVisible();
   await expect(panel.locator('tbody')).toContainText('50.0%');
   await expect(panel.locator('tbody')).toContainText('100.0%');
   await panel.getByLabel('Umbral de alerta por pases',{exact:true}).fill('1');
   await expect(panel.getByText('Umbral de pases alcanzado',{exact:true})).toBeVisible();
   await page.reload();
   await panel.locator('summary').click();
   await expect(panel.getByLabel('Umbral de alerta por pases',{exact:true})).toHaveValue('1');
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('Culture lineage browser: desktop/mobile capture, ancestry and persisted threshold passed');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
