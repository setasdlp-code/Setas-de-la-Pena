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
    if(localStorage.getItem('metrics_test_seed'))return;
    localStorage.setItem('metrics_test_seed','1');localStorage.setItem('sdp_seeded','1');
    localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'M1',codigo:'REAL-M1',peseSeco:1,estado:'completado',recipeRef:{sKey:'p_ostreatus_gris',recipe:[{id:'paja',p:100}]}},{id:'M2',codigo:'PARCIAL-M2',peseSeco:1,estado:'fructificacion',recipeRef:{sKey:'p_ostreatus_gris',recipe:[]}}]));
    localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'B1',loteId:'M1',estado:'contaminada'},{id:'B2',loteId:'M1',estado:'dudosa'}]));
    localStorage.setItem('sdp_bit_cosechas',JSON.stringify([{id:'C1',loteId:'M1',pesoFresco:500},{id:'C2',loteId:'M2',pesoFresco:800}]));
   });
   await page.goto(`${base}/__harness.html?view=metricas&metricsTab=rendimiento`);
   const panel=page.getByTestId('operational-metrics');await expect(panel).toBeVisible();await expect(panel.getByTestId('metrics-mean')).toHaveText('EB media por lote final: 50 %');await expect(panel).toContainText('Parcial; excluido de la media');
   await panel.getByRole('button',{name:'Supervisión',exact:true}).click();await expect(page).toHaveURL(/metricsTab=supervision/);await expect(panel.locator('[data-anomaly-id]')).toHaveCount(2);await expect(panel.getByRole('button',{name:'Revisar hallazgo'})).toHaveCount(0);
   await page.reload();await expect(panel.getByRole('button',{name:'Supervisión',exact:true})).toHaveAttribute('aria-pressed','true');
   await panel.getByRole('button',{name:'Trabajo',exact:true}).click();await expect(panel).toContainText('Horas y productividad por hora: sin datos');await page.goBack();await expect(panel.getByRole('button',{name:'Supervisión',exact:true})).toHaveAttribute('aria-pressed','true');await page.goForward();await expect(panel.getByRole('button',{name:'Trabajo',exact:true})).toHaveAttribute('aria-pressed','true');
   await panel.getByRole('button',{name:'Cosechas',exact:true}).click();await expect(panel).toContainText('1,3 kg cosechados registrados');await expect(panel).toContainText('No representan ventas ni despachos');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,`no horizontal page overflow at ${width}`);
   await panel.getByRole('button',{name:'Rendimiento',exact:true}).focus();await page.keyboard.press('Enter');await expect(panel.getByRole('button',{name:'Rendimiento',exact:true})).toHaveAttribute('aria-pressed','true');
   if(artifactDir)await page.screenshot({path:path.join(artifactDir,`metricas-${width}.png`),fullPage:true});
   assert.deepEqual(errors,[]);await page.close();
  }
  const page=await browser.newPage();await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto(`${base}/__harness.html?view=metricas`);const panel=page.getByTestId('operational-metrics');await expect(panel).toContainText('No hay lotes registrados');await expect(panel.getByTestId('metrics-mean')).toHaveText('EB media por lote final: —');
  await page.evaluate(()=>localStorage.setItem('sdp_bit_cosechas','{broken'));await page.reload();await expect(panel.getByRole('alert')).toContainText('No se pudieron leer');await expect(panel.getByTestId('metrics-mean')).toHaveCount(0);await page.close();
  const reviewer=await browser.newPage();await reviewer.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  // Mock only the authenticated account lookup; the production UI and durable
  // storage/queue path remain unchanged. No backend writes are performed.
  await reviewer.route('**/vendor/firebase/firebase-firestore.js',r=>r.fulfill({contentType:'application/javascript',body:"export const doc=(...args)=>args; export const getDoc=async()=>({exists:()=>true,data:()=>({rol:'produccion'})});"}));
  await reviewer.addInitScript(()=>{window.SetasFirebase={auth:{currentUser:{uid:'reviewer-browser'}},db:{}};localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'R',peseSeco:1,estado:'fructificacion'}]));localStorage.setItem('sdp_bit_bolsas',JSON.stringify([{id:'B1',loteId:'R',estado:'contaminada'},{id:'B2',loteId:'R',estado:'dudosa'}]));});
  await reviewer.goto(`${base}/__harness.html?view=metricas&metricsTab=supervision`);
  const rp=reviewer.getByTestId('operational-metrics'),first=rp.locator('[data-anomaly-id="bolsa:B1:estado"]'),second=rp.locator('[data-anomaly-id="bolsa:B2:estado"]');
  await first.getByRole('button',{name:'Revisar hallazgo'}).click();await first.getByRole('textbox',{name:'Motivo de la revisión'}).fill('Inspección de la bolsa registrada');await first.getByRole('button',{name:'Validar observación'}).click();await expect(first).toContainText('reviewer-browser');await expect(second).toContainText('Pendiente de revisión');await expect(rp.getByRole('status')).toContainText('encolada');
  await reviewer.reload();await expect(first).toContainText('Inspección de la bolsa registrada');await expect(second).toContainText('Pendiente de revisión');assert.equal(await reviewer.evaluate(()=>JSON.parse(localStorage.getItem('sdp_sync_queue')).filter(x=>x.key.startsWith('metrics-review:')).length),1);await reviewer.close();
  console.log('Métricas navegador: escritorio, móvil, teclado, recarga, atrás/adelante, ciclos finales/parciales, vacíos y error de almacenamiento: OK');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
