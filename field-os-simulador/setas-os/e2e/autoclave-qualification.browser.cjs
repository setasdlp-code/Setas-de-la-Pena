'use strict';
// Flujo de calificación del autoclave con datos SINTÉTICOS (no son corridas
// reales del 1941X): G1 → protocolo → configuración → tres corridas PQ-1 con
// CSV de datalogger → indicadores → G2–G4 → equipo verificado en Preparación.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const Q=require('../autoclave-qualification.js');
const root=path.resolve(__dirname,'..');
const DAY=86400000,AMBIENT=74.5,KPA_PER_PSI=6.894757293168;
const pad=n=>String(n).padStart(2,'0');
// Fecha-hora local de Tenjo (UTC−5) en formato datetime-local.
const local=ms=>new Date(ms-5*3600000).toISOString().slice(0,16);
const lerp=(t,t0,v0,t1,v1)=>v0+(v1-v0)*(t-t0)/(t1-t0);
function csvFor(startMs){
 const rows=['timestamp,DL1,DL2,DL3,P_psig'];
 for(let m=0;m<=180;m++){
  const ch=m<=30?lerp(m,0,90,30,121.5):m<=150?121.5:lerp(m,150,121.5,180,100);
  const prod=extra=>{const reach=42+extra;return m<=reach?lerp(m,0,30,reach,121.3):m<=150?121.3:lerp(m,150,121.3,180,105);};
  const psig=ch>=92?(Q.saturationPressureKpa(ch)-AMBIENT)/KPA_PER_PSI:0;
  rows.push([local(startMs+m*60000).replace('T',' ')+':00',ch.toFixed(2),prod(0).toFixed(2),prod(3).toFixed(2),psig.toFixed(3)].join(','));
 }
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
  await context.addInitScript(()=>{
   if(localStorage.getItem('aq-fixture'))return;
   localStorage.setItem('aq-fixture','1');localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('setas_formulator_draft_v1',JSON.stringify({version:1,recipe:[{id:'aserrin_roble',p:85},{id:'salvado_trigo',p:15}],sKey:'shiitake',hasPickedSpecies:true,lockedIds:[]}));
   localStorage.setItem('sdp_lotes',JSON.stringify(['aserrin_roble','salvado_trigo','spawn_grano','bolsa_unicorn_microfiltro'].map((id,i)=>({id:'LOT-'+i,ingredienteId:id,cantidadKgDisponible:100,activo:true,fechaIngreso:'2026-10-01',unidad:id==='bolsa_unicorn_microfiltro'?'ud':'kg',precioPorKgCOP:1000}))));
  });
  const url=`http://127.0.0.1:${server.address().port}/__harness.html`;
  await page.goto(url+'?view=produccion');
  const panel=page.getByTestId('autoclave-qualification');await expect(panel).toBeVisible();
  await expect(panel.getByTestId('aq-summary')).toContainText('No-Go · siguiente compuerta: G1');
  const now=Date.now();

  // Sin responsable no se registra nada.
  const gate=async(id)=>{const card=panel.getByTestId('aq-gate-'+id);if(await card.locator('details').getAttribute('open')===null)await card.locator('summary').click();return card.getByRole('form',{name:'Revisión de '+id});};
  let g1=await gate('G1');
  await g1.getByLabel('Referencia de evidencia').fill('Servicio técnico · informe sintético');
  await g1.getByRole('button',{name:'Guardar revisión de G1'}).click();
  await expect(g1.getByRole('alert')).toContainText('responsable');
  await panel.getByLabel('Responsable de los registros').fill('Operador de prueba');
  await g1.getByRole('button',{name:'Guardar revisión de G1'}).click();
  await expect(g1.getByRole('alert')).toContainText('certificado de calibración');
  await g1.getByLabel('Certificado de calibración del manómetro').fill('CAL-SINTETICO');
  await g1.getByLabel('Informe técnico de integridad del servicio competente').fill('INF-SINTETICO');
  await g1.getByLabel(/Fecha en que se concluyó/).fill(local(now-20*DAY));
  await g1.getByRole('button',{name:'Guardar revisión de G1'}).click();
  await expect(panel.getByTestId('aq-gate-G1').locator('.readiness-status')).toHaveText('Cerrada');
  await expect(panel.getByTestId('aq-summary')).toContainText('siguiente compuerta: G2');
  console.log('PASS G1 exige responsable, certificado e informe; queda cerrada con fecha efectiva.');

  // Protocolo: el candidato no se aprueba sin objetivo térmico, hueco máximo y fundamento.
  await panel.locator('summary',{hasText:'Nuevo protocolo o versión'}).click();
  const proto=panel.getByRole('form',{name:'Borrador de protocolo PQ-1'});
  await proto.getByRole('button',{name:'Guardar borrador del protocolo'}).click();
  await expect(proto.getByRole('alert')).toContainText('thermalTargetC');
  await proto.getByLabel('Objetivo térmico para t_lag (°C)').fill('121');
  await proto.getByLabel('Hueco máximo de datos en la meseta (min)').fill('2');
  await proto.getByRole('button',{name:'Guardar borrador del protocolo'}).click();
  const protoCard=panel.getByTestId('aq-protocol-PQ1-1941X-v1');await expect(protoCard.locator('.readiness-status')).toHaveText('Borrador');
  await protoCard.locator('summary',{hasText:'Aprobar PQ1-1941X-v1'}).click();
  const approve=protoCard.getByRole('form',{name:'Aprobar PQ1-1941X-v1'});
  await approve.getByLabel('Referencia de la aprobación').fill('Acta sintética');
  await approve.getByRole('button',{name:'Aprobar PQ1-1941X-v1'}).click();
  await expect(approve.getByRole('alert')).toContainText('fundamento microbiológico');
  // Un borrador se corrige con el mismo ID mientras no esté aprobado.
  await proto.getByLabel(/Fundamento microbiológico/).fill('Fixture de software: organismo y reducción declarados en el protocolo real.');
  await proto.getByRole('button',{name:'Guardar borrador del protocolo'}).click();
  await approve.getByLabel(/Fecha efectiva de aprobación/).fill(local(now-19*DAY));
  await approve.getByRole('button',{name:'Aprobar PQ1-1941X-v1'}).click();
  await expect(protoCard.locator('.readiness-status')).toHaveText('Aprobado');
  console.log('PASS protocolo candidato: exige valores sin candidato y fundamento antes de aprobar.');

  // Configuración precargada con la carga planificada (6 × 1,5 kg).
  await panel.locator('summary',{hasText:'Nueva configuración de carga'}).click();
  const cfg=panel.getByRole('form',{name:'Nueva configuración de carga'});
  assert.equal(await cfg.getByLabel('Bolsas por corrida').inputValue(),'6');
  assert.equal(await cfg.getByLabel('Masa húmeda por bolsa (kg)').inputValue(),'1.5');
  await cfg.getByLabel('ID de configuración').fill('CFG-6x1.5');
  await cfg.getByLabel(/Arreglo de carga/).fill('Rejilla base, 6 bolsas verticales; DL-2/DL-3 en núcleo de B1 y B3');
  await cfg.getByRole('button',{name:'Registrar configuración'}).click();
  const cfgCard=panel.getByTestId('aq-config-CFG-6x1.5');await expect(cfgCard.locator('.readiness-status')).toHaveText('Sin corridas');

  for(const [i,daysAgo] of [[1,10],[2,9],[3,8]]){
   const start=now-daysAgo*DAY;
   const runSummary=panel.locator('summary',{hasText:'Registrar corrida PQ-1'});
   if(await runSummary.locator('xpath=..').getAttribute('open')===null)await runSummary.click();
   const run=panel.getByRole('form',{name:'Registrar corrida PQ-1'});
   await run.getByLabel('ID de la corrida').fill('R'+i);
   await run.getByLabel('Configuración de carga').selectOption('CFG-6x1.5');
   await run.getByLabel('Protocolo').selectOption('PQ1-1941X-v1');
   await run.getByLabel(/Fecha y hora de inicio/).fill(local(start));
   await run.getByLabel('Operador').fill('Cuidador');
   await run.getByLabel(/Presión ambiente absoluta/).fill('74.5');
   await run.getByLabel(/Corrección del manómetro/).fill('0');
   await run.getByLabel('Archivo CSV del datalogger').setInputFiles({name:`R${i}.csv`,mimeType:'text/csv',buffer:Buffer.from(csvFor(start))});
   await expect(run.getByRole('status')).toContainText('181 lecturas');
   await run.getByLabel('Inicio de meseta').fill(local(start+30*60000));
   await run.getByLabel('Fin de meseta').fill(local(start+150*60000));
   await run.getByRole('button',{name:'Registrar corrida y datos'}).click();
   const row=panel.getByTestId('aq-run-R'+i);await expect(row).toContainText('Pendiente');
   await panel.locator('summary',{hasText:`Detalle de R${i} · Pendiente`}).click();
   const ind=panel.getByRole('form',{name:'Indicadores de R'+i});
   for(const n of [1,2,3]){
    await ind.getByLabel('Resultado CI '+n).selectOption('pass');
    await ind.getByLabel(`Resultado IB-${n}`).selectOption('negativo');await ind.getByLabel(`Horas de lectura IB-${n}`).fill('48');
   }
   await ind.getByLabel('Resultado del control 1').selectOption('positivo');await ind.getByLabel('Horas hasta la primera lectura positiva').fill('18');
   for(const k of ['CI','IB']){await ind.getByLabel('Lote '+k).fill(k+'-LOTE-SINT');await ind.getByLabel('Caducidad '+k).fill('2027-12-31');await ind.getByLabel('IFU '+k).fill('IFU sintética');}
   await ind.getByRole('button',{name:'Guardar indicadores de R'+i}).click();
   await expect(row).toContainText('Conforme');
   await expect(row).toContainText('3/3 · 3/3 · 1/1');
  }
  await expect(cfgCard.locator('.readiness-status')).toHaveText('Serie conforme');
  console.log('PASS tres corridas con CSV e indicadores completan una serie PQ-1 conforme.');

  // PQ-2: G3 no se cierra con una referencia suelta; exige un estudio A/B conforme.
  let g3=await gate('G3');await g3.getByLabel('Referencia de evidencia').fill('Solo referencia');
  await g3.getByRole('button',{name:'Guardar revisión de G3'}).click();
  await expect(g3.getByRole('alert')).toContainText('estudio PQ-2');
  const defineStudy=async(fields)=>{
   const summary=panel.locator('summary',{hasText:'Nuevo estudio PQ-2'});
   if(await summary.locator('xpath=..').getAttribute('open')===null)await summary.click();
   const form=panel.getByRole('form',{name:'Nuevo estudio PQ-2'});
   // Un <select> dentro de su <label> suma el texto de sus opciones al nombre: se ancla al inicio.
   const field=label=>form.getByLabel(label,typeof label==='string'?{exact:true}:{});
   const select=label=>form.getByLabel(new RegExp('^'+label.replace(/[()]/g,'\\$&')));
   for(const [label,value,kind] of fields)kind==='select'?await select(label).selectOption(value):await field(label).fill(value);
   await form.getByRole('button',{name:'Registrar estudio'}).click();
  };
  const read=async(id,daysAgo,units)=>{
   const card=panel.getByTestId('aq-study-'+id);const summary=card.locator('summary',{hasText:'Registrar lectura de '+id});
   if(await summary.locator('xpath=..').getAttribute('open')===null)await summary.click();
   const form=card.getByRole('form',{name:'Lectura de '+id});
   await form.getByLabel('Fecha y hora de la lectura').fill(local(now-daysAgo*DAY));
   await form.getByLabel('Temperatura de incubación medida (°C)').fill('23');
   for(const [u,v] of Object.entries(units))await form.getByLabel('Estado de '+u).selectOption(v);
   await form.getByRole('button',{name:'Guardar lectura de '+id}).click();
   await expect(card.locator('tbody tr')).not.toHaveCount(0);
  };
  await defineStudy([['Tipo de estudio','AB','select'],['ID del estudio','AB-1'],['Inicio (hora de Tenjo)',local(now-19*DAY)],['n por grupo (A y B)','1'],['Configuración de carga procesada','CFG-6x1.5','select'],
   ['Corrida térmica que procesó los controles','R3'],[/Duración fijada/,'15'],['Tolerancia térmica (± °C)','1'],['Días máximos entre lecturas','7']]);
  const ab=panel.getByTestId('aq-study-AB-1');await expect(ab.locator('.readiness-status')).toHaveText('En curso');
  for(const d of [12,5])await read('AB-1',d,{A1:'limpia',B1:'limpia'});
  await expect(ab.locator('.readiness-status')).toHaveText('En curso');
  await read('AB-1',3.9,{A1:'limpia',B1:'limpia'});
  await expect(ab.locator('.readiness-status')).toHaveText('Conforme');
  await defineStudy([['Tipo de estudio','C','select'],['ID del estudio','C-1'],['Inicio (hora de Tenjo)',local(now-12*DAY)],['Lote de spawn','SPAWN-SINT'],['Placas con spawn','1'],['Blancos sin spawn','1'],
   ['Duración de observación (días)','7'],['Tolerancia térmica (± °C)','1'],['Días máximos entre lecturas','4']]);
  await read('C-1',9,{P1:'salto',K1:'sin_crecimiento'});
  await read('C-1',5,{P1:'salto',K1:'sin_crecimiento'});
  await expect(panel.getByTestId('aq-study-C-1').locator('.readiness-status')).toHaveText('Conforme');
  console.log('PASS estudios PQ-2 A/B y C pasan de En curso a Conforme al completar la duración fijada.');

  for(const [id,fill] of [['G2',async f=>f.getByLabel('Configuración de carga calificada').selectOption('CFG-6x1.5')],['G3',async f=>f.getByLabel('Estudio PQ-2 conforme').selectOption('AB-1')],['G4',async f=>f.getByLabel('Estudio PQ-2 conforme').selectOption('C-1')]]){
   const f=await gate(id);await f.getByLabel('Referencia de evidencia').fill('Evidencia sintética '+id);await fill(f);
   await f.getByRole('button',{name:'Guardar revisión de '+id}).click();
   await expect(panel.getByTestId('aq-gate-'+id).locator('.readiness-status')).toHaveText('Cerrada');
  }
  await expect(panel.getByTestId('aq-summary')).toContainText('Ciclo calificado para CFG-6x1.5');

  // Preparación: el equipo de autoclave se verifica con la configuración calificada.
  const dashboard=page.getByTestId('production-readiness-dashboard');
  await page.locator('#prod-lote').fill('SHI-AQ-01');await page.locator('#prod-lote').press('Tab');
  const equipment=dashboard.getByTestId('readiness-equipment');
  await equipment.locator('summary').click();const form=equipment.getByRole('form');
  await form.getByLabel('Resultado de la revisión').selectOption('verified');
  await form.getByLabel('Responsable de la revisión').fill('Operador de prueba');
  await form.getByLabel('Referencia de evidencia').fill('REGISTRO-SINTETICO');
  await form.getByLabel('Equipo identificado').fill('1941X');
  await form.getByLabel('Protocolo y carga validados').fill('PQ1-1941X-v1 · CFG-6x1.5');
  await form.getByLabel(/Corrida del autoclave/).fill('AC-PROD-01');
  await form.getByLabel('Bioindicador de la corrida').selectOption('sin_crecimiento');
  await form.getByRole('button',{name:/Guardar revisión/}).click();
  await expect(form.getByRole('alert')).toContainText('configuración de carga calificada');
  await form.getByLabel(/Configuración de carga calificada/).selectOption('CFG-6x1.5');
  await form.getByRole('button',{name:/Guardar revisión/}).click();
  await expect(equipment.locator('.readiness-status')).toHaveText('Verificado');
  await expect(equipment).toContainText('Ciclo calificado para CFG-6x1.5');
  // Otra carga no hereda la calificación.
  await page.locator('#prod-bags').fill('8');await page.locator('#prod-bags').press('Tab');
  await expect(equipment.locator('.readiness-status')).toHaveText('Sin verificar');
  await page.locator('#prod-bags').fill('6');await page.locator('#prod-bags').press('Tab');
  await expect(equipment.locator('.readiness-status')).toHaveText('Verificado');
  console.log('PASS Preparación verifica el autoclave solo con G1–G4 cerradas para la misma carga.');

  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sdp_autoclave_qualification_v1')));
  assert.ok(stored.every(e=>e.schema==='setas.autoclave-qualification.v1'&&e.by==='Operador de prueba'));
  assert.equal(stored.filter(e=>e.type==='run.data_imported').length,3);
  await page.reload();
  await expect(page.getByTestId('autoclave-qualification').getByTestId('aq-summary')).toContainText('Ciclo calificado para CFG-6x1.5');
  const download=page.waitForEvent('download');await page.getByTestId('autoclave-qualification').getByRole('button',{name:'Exportar registro'}).click();
  const report=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));
  assert.equal(report.schema,'setas.autoclave-qualification-report.v1');assert.equal(report.series[0].status,'conforme');
  console.log('PASS registro persistente tras recargar y exportable.');

  const reloaded=page.getByTestId('autoclave-qualification');
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await reloaded.scrollIntoViewIfNeeded();
   assert.ok(await reloaded.evaluate(el=>el.scrollWidth<=el.clientWidth),'reflow '+width);
   assert.ok(await reloaded.locator('button:visible, summary:visible').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)),'touch targets '+width);
  }
  await reloaded.locator('#aq-title').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/setas-autoclave-qualification-mobile.png'});
  assert.deepEqual(errors,[]);await page.close();
  console.log('PASS 320/390px sin desborde y objetivos táctiles ≥44px.');

  const corrupt=await browser.newPage();await corrupt.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await corrupt.addInitScript(()=>{localStorage.setItem('sdp_seeded','1');localStorage.setItem('sdp_autoclave_qualification_v1','broken');});
  await corrupt.goto(url+'?view=produccion');
  await expect(corrupt.getByTestId('autoclave-qualification').getByRole('alert').first()).toContainText('dañado');
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem('sdp_autoclave_qualification_v1')),'broken');await corrupt.close();
  console.log('PASS registro dañado se conserva y se informa.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
