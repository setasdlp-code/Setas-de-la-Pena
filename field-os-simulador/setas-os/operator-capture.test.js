'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {captureNumber,captureError,normalizeTrialCapture,normalizeHarvestCapture,persistCapture,calcLoteStats,HARVEST_QUALITY,fieldDefectsFor,harvestGradeGap}=require('./bitacora-model');
test('capture distinguishes missing, zero, invalid and fractional counts',()=>{
 assert.equal(captureNumber(''),null);assert.equal(captureNumber('  '),null);assert.equal(captureNumber('0'),0);
 assert.equal(captureError('',{required:true}),'Campo obligatorio.');assert.equal(captureError('0',{min:0}),'');
 assert.ok(captureError('2x'));assert.ok(captureError('Infinity'));assert.ok(captureError('1.5',{integer:true}));
});
test('JSON round trip preserves unknown measurements and observed zeros',()=>{
 const saved=JSON.parse(JSON.stringify(normalizeTrialCapture({numBolsas:'2',pesoHumedo:'',peseSeco:'',humedad:'0',spawnPct:'0',fechaMezcla:'',fechaInoculacion:''})));
 assert.equal(saved.pesoHumedo,null);assert.equal(saved.peseSeco,null);assert.equal(saved.humedad,0);assert.equal(saved.spawnPct,0);assert.equal(saved.fechaInoculacion,null);
 const zero=JSON.parse(JSON.stringify(normalizeHarvestCapture({pesoFresco:'0',flush:'1',calidad:''})));
 assert.equal(zero.pesoFresco,0);assert.equal(zero.calidad,null);
});
test('harvest storage remains grams, downstream mass is kg and unknown dry mass withholds BE',()=>{
 const c=normalizeHarvestCapture({pesoFresco:'430',flush:'1',calidad:''});assert.equal(c.pesoFresco,430);
 const stats=calcLoteStats({peseSeco:null},[{estado:'sana'}],[c]);assert.equal(stats.totalFresco,0.430);assert.equal(stats.be,null);
});
test('failed multi-key persistence rolls back without losing prior records',()=>{
 const map=new Map([['lotes','[]'],['bolsas','[]']]);let calls=0;
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(++calls===2)throw Error('quota');map.set(k,v);},removeItem:k=>map.delete(k)};
 assert.throws(()=>persistCapture(storage,[['lotes',[{id:'fixture'}]],['bolsas',[{id:'bag'}]]]),/quota/);
 assert.equal(map.get('lotes'),'[]');assert.equal(map.get('bolsas'),'[]');
 persistCapture(storage,[['lotes',[{pesoHumedo:null,peseSeco:0}]]]);assert.deepEqual(JSON.parse(map.get('lotes')),[{pesoHumedo:null,peseSeco:0}]);
});
test('public harvest boundary omits unknown quality without coercing it into an observation',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(`${__dirname}/firebase/public-trace-sync.js`,'utf8');
 const start=source.indexOf('const sanearCosecha =');const end=source.indexOf('\nexport async',start);
 const sanitize=vm.runInNewContext(source.slice(start,end)+';sanearCosecha');
 assert.equal(sanitize({pesoFresco:430,calidad:null,flush:1}).pesoFresco,430);
 assert.equal(Object.hasOwn(sanitize({pesoFresco:0,calidad:null,flush:1}),'calidad'),false);
 assert.equal(sanitize({pesoFresco:0,calidad:0,flush:1}).calidad,0);
});
test('legacy shell harvest routes to canonical records and cannot save demonstration measurements',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(`${__dirname}/Setas OS v5.dc.html`,'utf8');
 const start=source.indexOf('  confirmHarvest(){');const end=source.indexOf('  confirmQuick(){',start);
 const run=vm.runInNewContext('({'+source.slice(start,end)+'})');
  const calls=[];run.goBitTab=tab=>calls.push(tab);run.toast=()=>{};run.confirmHarvest();
  assert.deepEqual(calls,['bit_dash']);
});

test('normalizeHarvestCapture calculates net weight with verified tara and rejects tara > gross weight', () => {
  // 1. Con tara verificada: neto = bruto - tara
  const valid = normalizeHarvestCapture({
    pesoBrutoGramos: '870',
    taraGramos: '420',
    taraSource: 'field_measured',
    flush: '1',
    crateId: 'crate_CAN-01',
    crateCode: 'CAN-01',
    bagId: 'B-02',
  });
  assert.equal(valid.pesoFresco, 450);
  assert.equal(valid.pesoFrescoGramos, 450);
  assert.equal(valid.pesoBrutoGramos, 870);
  assert.equal(valid.taraGramos, 420);
  assert.equal(valid.taraSource, 'field_measured');
  assert.equal(valid.netCalculationStatus, 'verified');
  assert.equal(valid.bagId, 'B-02');
  assert.equal(valid.bolsaId, 'B-02');
  assert.equal(valid.unit, 'g');
  assert.equal(valid.unidad, 'g');

  // 2. Tara mayor al peso bruto: rechazo estricto con error
  assert.throws(
    () => normalizeHarvestCapture({ pesoBrutoGramos: 400, taraGramos: 500, flush: 1 }),
    /tara_exceeds_gross_weight/
  );

  // 3. Bruto presente pero tara null (no verificada): bloquea cálculo neto honestamente
  const missingTare = normalizeHarvestCapture({
    pesoBrutoGramos: 870,
    taraGramos: null,
    flush: 1,
    crateId: 'crate_CAN-01',
  });
  assert.equal(missingTare.pesoBrutoGramos, 870);
  assert.equal(missingTare.taraGramos, null);
  assert.equal(missingTare.pesoFresco, null);
  assert.equal(missingTare.pesoFrescoGramos, null);
  assert.equal(missingTare.netCalculationStatus, 'blocked_missing_tare');
});

test('quality fields: vacío es null, cero es 0, firmeza lleva método y escala solo si existe',()=>{
  const c=normalizeHarvestCapture({pesoFresco:'500',flush:'1',pesoPrimera:'',pesoSegunda:'0',pesoDescarte:'30',firmeza:'3'});
  assert.equal(c.pesoPrimera,null);assert.equal(c.pesoSegunda,0);assert.equal(c.pesoDescarte,30);
  assert.equal(c.firmeza,3);assert.equal(c.firmezaMetodo,'tacto_ordinal');assert.equal(c.firmezaEscala,'v0_texto');
  const s=normalizeHarvestCapture({pesoFresco:'500',flush:'1'});
  assert.equal(s.firmeza,null);assert.equal(s.firmezaMetodo,null);assert.equal(s.firmezaEscala,null);
});
test('criterioGrado solo cuando hay pesos por grado',()=>{
  assert.equal(normalizeHarvestCapture({pesoFresco:'500',pesoSegunda:'0'}).criterioGrado,'provisional_unversioned');
  assert.equal(normalizeHarvestCapture({pesoFresco:'500'}).criterioGrado,null);
});
test('defectosCampo se deduplica, conserva claves desconocidas y suma solo coincidencias exactas a defectCodes',()=>{
  const c=normalizeHarvestCapture({pesoFresco:'500',defectosCampo:['sporulation','bacterial_suspect','bacterial_suspect','xyz'],defectCodes:['abort']});
  assert.deepEqual(c.defectosCampo,['sporulation','bacterial_suspect','xyz']);
  assert.deepEqual(c.defectCodes,['abort','bacterial_suspect']);
  assert.deepEqual(normalizeHarvestCapture({pesoFresco:'500'}).defectosCampo,[]);
});
test('no existe campo de color',()=>{
  assert.equal('colorOrdinal' in normalizeHarvestCapture({pesoFresco:'500',colorOrdinal:3}),false);
});
test('harvestGradeGap',()=>{
  assert.equal(harvestGradeGap({pesoFresco:500}).status,'no_grades');
  assert.equal(harvestGradeGap({pesoFresco:500,pesoPrimera:300}).status,'incomplete');
  assert.equal(harvestGradeGap({pesoFresco:null,pesoPrimera:300}).status,'no_net_weight');
  const ok=harvestGradeGap({pesoFresco:500,pesoPrimera:300,pesoSegunda:150,pesoDescarte:50});
  assert.equal(ok.status,'ok');assert.equal(ok.sumG,500);assert.equal(ok.netG,500);assert.equal(ok.gapG,0);
  assert.equal(harvestGradeGap({pesoFresco:500,pesoPrimera:300,pesoSegunda:150,pesoDescarte:110}).status,'over_tolerance');
  assert.equal(harvestGradeGap({pesoFresco:100,pesoPrimera:60,pesoSegunda:30,pesoDescarte:14}).status,'ok');
  assert.equal(harvestGradeGap({pesoFresco:100,pesoPrimera:60,pesoSegunda:30,pesoDescarte:16}).status,'over_tolerance');
  assert.equal(harvestGradeGap({pesoFresco:0.5,unit:'kg',pesoPrimera:0.5}).sumG,500);
  const str=harvestGradeGap({pesoFresco:'500',pesoPrimera:'300',pesoSegunda:'150',pesoDescarte:'50'});
  assert.equal(str.status,'ok');
});
test('fieldDefectsFor',()=>{
  assert.equal(fieldDefectsFor('p_ostreatus_gris').length,6);
  assert.equal(fieldDefectsFor(null).length,6);
  for(const k of ['lions_mane','reishi'])
    assert.deepEqual(fieldDefectsFor(k).map(d=>d.key),['bacterial_suspect','surface_dryness','mechanical_damage']);
});
test('las 3 claves sin v01Code no están en el diccionario',()=>{
  assert.deepEqual(HARVEST_QUALITY.FIELD_DEFECTS.filter(d=>d.v01Code===null).map(d=>d.key),['sporulation','stipe_elongated','edge_curl_lost']);
  assert.ok(Object.isFrozen(HARVEST_QUALITY));
});
