'use strict';
// Mapa térmico de incubación con CSV SINTÉTICOS (no son mediciones del
// prototipo): offsets por co-ubicación → ensayos de uniformidad → estado de la
// unidad, persistencia, 320/390 px y registro dañado.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
function colocation(hours){
 const rows=['t_min,DS_A,DS_B,DS_C'];
 for(let m=0;m<=hours*60;m+=2){const b=26+Math.sin(m/180);rows.push([m,(b+0.3).toFixed(3),b.toFixed(3),(b-0.2).toFixed(3)].join(','));}
 return rows.join('\n');
}
function mapping(gradient){
 const rows=['t_min,DS_A,DS_B,DS_C'];
 for(let m=0;m<=74*60;m+=1){const w=m<120?20+m/20:26;rows.push([m,(w+0.3).toFixed(3),(w+gradient/2).toFixed(3),(w+gradient-0.2).toFixed(3)].join(','));}
 return rows.join('\n');
}
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await context.addInitScript(()=>localStorage.setItem('sdp_seeded','1'));
  const url=`http://127.0.0.1:${server.address().port}/__harness.html`;
  await page.goto(url+'?view=produccion');
  const panel=page.getByTestId('incubation-thermal');await expect(panel).toBeVisible();
  await panel.getByLabel('Responsable de los registros').fill('Operador de prueba');

  await panel.locator('summary',{hasText:'Registrar comparación de sondas'}).click();
  let off=panel.getByRole('form',{name:'Comparación de sondas en un mismo punto'});
  await off.getByLabel('CSV de la comparación').setInputFiles({name:'corta.csv',mimeType:'text/csv',buffer:Buffer.from(colocation(24))});
  await expect(off.getByTestId('tm-offsets-preview')).toContainText('Datos insuficientes');
  await off.getByRole('button',{name:'Guardar offsets'}).click();
  await expect(off.getByRole('alert')).toContainText('48–72 h');
  await off.getByLabel('CSV de la comparación').setInputFiles({name:'colocacion.csv',mimeType:'text/csv',buffer:Buffer.from(colocation(50))});
  await off.getByLabel(/^Referencia/).selectOption('DS_B');
  await expect(off.getByTestId('tm-offsets-preview')).toContainText('DS_A 0,300 °C');
  await off.getByRole('button',{name:'Guardar offsets'}).click();
  await expect(panel.locator('summary',{hasText:'Offsets OFF-1'})).toBeVisible();
  console.log('PASS offsets: comparación < 48 h rechazada; 50 h guardada con sesgo recuperado.');

  const runMap=async(id,type,gradient,expected)=>{
   const summary=panel.locator('summary',{hasText:'Registrar ensayo de uniformidad'});
   if(await summary.locator('xpath=..').getAttribute('open')===null)await summary.click();
   const form=panel.getByRole('form',{name:'Ensayo de uniformidad'});
   await form.getByLabel('ID del ensayo').fill(id);
   await form.getByLabel('Caja o unidad ensayada').fill('Estra-1');
   await form.getByLabel(/^Tipo de ensayo/).selectOption(type);
   await form.getByLabel('CSV del ensayo').setInputFiles({name:id+'.csv',mimeType:'text/csv',buffer:Buffer.from(mapping(gradient))});
   for(const [label,col] of [['Sonda en la base','DS_A'],['Sonda en el centro','DS_B'],['Sonda en el tope','DS_C']])await form.getByLabel(new RegExp('^'+label)).selectOption(col);
   await form.getByLabel(/Fin de la estabilización/).fill('180');
   await expect(form.getByTestId('tm-map-preview')).toContainText(expected);
   await form.getByRole('button',{name:'Guardar ensayo'}).click();
   await expect(panel.getByTestId('tm-map-'+id).locator('summary')).toContainText(expected);
  };
  await runMap('MAP-1','vacio',1.2,'Cumple');
  await expect(panel.getByTestId('tm-unit-Estra-1').locator('.readiness-status')).toHaveText('Pendiente');
  await runMap('MAP-2','carga_simulada',2.4,'No cumple');
  await expect(panel.getByTestId('tm-unit-Estra-1').locator('.readiness-status')).toHaveText('No cumple');
  await runMap('MAP-3','carga_simulada',1.6,'Cumple');
  await expect(panel.getByTestId('tm-unit-Estra-1').locator('.readiness-status')).toHaveText('Vacío y carga simulada cumplen');
  console.log('PASS ensayos: vacío cumple, carga simulada 2,4 °C no cumple, repetición 1,6 °C cumple; la unidad usa el último de cada tipo.');

  await page.reload();
  const again=page.getByTestId('incubation-thermal');
  await expect(again.getByTestId('tm-unit-Estra-1').locator('.readiness-status')).toHaveText('Vacío y carga simulada cumplen');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_thermal_mapping_v1')));
  assert.equal(stored.length,4);assert.ok(stored.every(r=>r.by==='Operador de prueba'));
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await again.scrollIntoViewIfNeeded();
   assert.ok(await again.evaluate(el=>el.scrollWidth<=el.clientWidth),'reflow '+width);
   assert.ok(await again.locator('button:visible, summary:visible').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)),'touch targets '+width);
  }
  await again.locator('#tm-title').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/setas-incubation-thermal-mobile.png'});
  assert.deepEqual(errors,[]);await page.close();
  console.log('PASS persistencia tras recargar y 320/390 px sin desborde.');

  const corrupt=await browser.newPage();await corrupt.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await corrupt.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_thermal_mapping_v1','broken');});
  await corrupt.goto(url+'?view=produccion');
  await expect(corrupt.getByTestId('incubation-thermal').getByRole('alert').first()).toContainText('dañado');
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem('sdp_thermal_mapping_v1')),'broken');await corrupt.close();
  console.log('PASS registro dañado se conserva y se informa.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
