'use strict';
// ── substrate-analysis.js — modelo agronómico del sustrato ───────────
//
// analyze() es el motor que convierte una receta (% en base seca) en la
// predicción que todo lo demás consume: C:N, N medio, pH, costo, y sobre todo
// EB (eficiencia biológica) con su banda de incertidumbre.
//
// Es el corazón del producto y vivía en la línea 1264 de un archivo de 18 512
// líneas, entre componentes React. Extraído sin cambiar un solo valor ni un
// solo operador.
//
// COMPUERTA OBLIGATORIA: cualquier cambio a este archivo —incluido mover un
// decimal— requiere `npm run perito:regression` con el delta de meanAbsErrorEB
// adjunto al PR. Los ~1000 tests unitarios verifican que el motor sigue
// funcionando; solo esa compuerta verifica que sigue acertando.
// Ver docs/agents/ground-truth-corpus.md.
//
// Mismo patrón UMD que scoring.js: el shell lo carga como <script> (publica
// globalThis.SetasSubstrateAnalysis) y Node lo require(). Depende de
// substrate-catalog.js, que debe cargarse antes.
(function () {

const catalog = (typeof SetasSubstrateCatalog !== 'undefined' && SetasSubstrateCatalog)
  || (typeof globalThis !== 'undefined' && globalThis.SetasSubstrateCatalog)
  || (typeof require !== 'undefined' ? require('./substrate-catalog.js') : null);
if (!catalog) throw new Error('substrate-analysis.js requiere substrate-catalog.js cargado antes.');
const { INGS, SPP } = catalog;

const EB_PENALTY_BALANCE_BAND={min:95,max:105}; // castigo de EB por balance muy fuera de 100 — no es la tolerancia de guardado
const analyze=(recipe,sKey,ings=INGS,spp=SPP)=>{
  if(!recipe.length) return null;
  const tot=recipe.reduce((s,r)=>s+(parseFloat(r.p)||0),0);if(!tot) return null;
  let wC=0,wN=0,wPh=0,wDig=0,wCra=0,nP=0,suppP=0,suppMedP=0,baseP=0,addP=0,cafeP=0,manP=0,airP=0,densaP=0,incompat=[];
  const DENSOS=['aserrin_roble','aserrin_eucalipto','aserrin_pino','aserrin_pino_compostado','borra_cafe','afrecho_cerveceria','chips_poda_urbana','guadua','carton_corrugado','pulpa_papel'];
  recipe.forEach(r=>{
    const g=ings.find(i=>i.id===r.id);if(!g) return;
    const p=parseFloat(r.p)||0;
    // A · Aislamiento de la matriz nutritiva: los aditivos minerales/estructurales secos
    // (carbonato, yeso, zeolita, cascarilla de huevo, vermicompost…) NO entran en la
    // relación C:N — se usan solo como modificadores de pH y textura. Evita el sesgo de
    // dilución del denominador lignocelulósico.
    const esAditivoSeco=(g.role==='aditivo_ph'||g.role==='aditivo_estructura');
    // Los % de la receta ya están en base seca ("Porcentaje en base seca"): ponderar por p.
    // Descontar humedad aquí la aplicaba dos veces y subestimaba insumos húmedos (D18).
    if(g.cn>0&&!esAditivoSeco){wC+=g.c*p;wN+=g.n*p;nP+=p;}
    wPh+=g.ph*p; wDig+=g.dig*p; wCra+=g.cra*p;
    if(g.role==='suplemento_n') suppP+=p;
    if(g.role==='suplemento_medio') suppMedP+=p;
    if(g.role==='base_carbono') baseP+=p;
    if(['aditivo_ph','aditivo_estructura','aditivo_micronutriente'].includes(g.role)) addP+=p;
    if(g.role==='aireador') airP+=p;
    if(g.cat==='cafe') cafeP+=p;
    if(g.cat==='est') manP+=p;
    if(DENSOS.includes(g.id)) densaP+=p;
    if(sKey&&!g.cs.includes(sKey)&&g.cn>0) incompat.push(g.name);
  });
  const avgN=nP?wN/nP:0,cn=avgN>0?(nP?wC/nP:0)/avgN:0;
  const avgPh=tot?wPh/tot:7;
  const avgDig=tot?wDig/tot:5;
  const avgCra=tot?wCra/tot:3;
  const suppTotalP=suppP+suppMedP;
  const suppEffectiveP=suppP+(suppMedP*0.6);
  // COP por kg de mezcla SECA: el precio de bodega es por kg tal cual se recibe (D6).
  const cost=recipe.reduce((s,r)=>{const g=ings.find(i=>i.id===r.id);if(!g) return s;const m=Math.min(0.92,Math.max(0,(Number(g.moisture)||0)/100));return s+(g.cost/(1-m))*(parseFloat(r.p)||0)/100;},0);
  const sp=spp[sKey];let eb=0,trichoderma=false,dynSpawn=sp?.spawn_rate||8;
  if(sp){
    const cF=Math.max(0,1-Math.pow(Math.abs(cn-sp.cn_optimal.ideal)/((sp.cn_optimal.max-sp.cn_optimal.min)/2),1.5));
    const nF=Math.max(0,1-Math.pow(Math.abs(avgN-sp.n_optimal.ideal)/((sp.n_optimal.max-sp.n_optimal.min)/2),1.5));
    eb=sp.eb_baseline+(sp.eb_optimal-sp.eb_baseline)*(cF*.6+nF*.4);
    const needsAutoclave=suppEffectiveP>sp.supplementation_max;
    const nThresh=needsAutoclave?sp.n_optimal.max*1.2:sp.n_optimal.max*1.15;
    if(avgN>nThresh&&!needsAutoclave){trichoderma=true;eb*=.45;}
    else if(avgN>nThresh&&needsAutoclave){eb*=.80;}
    else if(needsAutoclave) eb*=.85;
    if(incompat.length) eb*=.9;
    if(tot<EB_PENALTY_BALANCE_BAND.min||tot>EB_PENALTY_BALANCE_BAND.max) eb*=.95;
    // ── Modificadores multifactor de EB (penalizaciones ≤1: una receta en óptimo no se ve afectada) ──
    // pH fuera de rango: la acidez excesiva bloquea más que la alcalinidad ligera
    var phF=1;
    if(sp.ph_optimal){
      if(avgPh<sp.ph_optimal.min) phF=Math.max(.70,1-(sp.ph_optimal.min-avgPh)*0.12);
      else if(avgPh>sp.ph_optimal.max) phF=Math.max(.80,1-(avgPh-sp.ph_optimal.max)*0.10);
    }
    // Aireación: riesgo de anaerobiosis con mucho material denso y poco aireador
    var aerF=1;
    if(densaP>60&&airP<10) aerF=.85;
    else if(densaP>40&&airP<8) aerF=.93;
    // Digestibilidad: sustratos muy lignificados colonizan lento y rinden algo menos
    // F-19: shiitake/reishi son degradadores de lignina — digF no aplica en madera dura
    const isLigninSpp=['shiitake','reishi'].includes(sKey);
    var digF=isLigninSpp?1:(avgDig>=6?1:Math.max(.85,1-(6-avgDig)*0.03));
    eb=eb*phF*aerF*digF;
    var ebMods={phF,aerF,digF};
    // ── Banda de incertidumbre EB — CV base 18%, crece con penalizadores activos ──
    var ebCvVal=0.18;
    if(ebMods.phF<0.95) ebCvVal+=0.05;
    if(ebMods.aerF<0.95) ebCvVal+=0.05;
    if(ebMods.digF<0.95) ebCvVal+=0.04;
    if(incompat.length) ebCvVal+=0.08;
    if(suppEffectiveP>sp.supplementation_max) ebCvVal+=0.10;
    if(trichoderma) ebCvVal=0.50;
    ebCvVal=Math.min(trichoderma?0.50:0.40,ebCvVal);
    var ebLow=Math.round(eb*(1-ebCvVal));
    var ebHigh=Math.round(eb*(1+ebCvVal));
    var ebIndex=Math.round(Math.max(0,Math.min(100,(eb-sp.eb_baseline)/Math.max(1,sp.eb_optimal-sp.eb_baseline)*100)));
    dynSpawn=Math.min(15,(sp.spawn_rate||8)+Math.floor(suppEffectiveP/5));
  }
    const eucPct=recipe.reduce((s,r)=>r.id==='aserrin_eucalipto'?s+(parseFloat(r.p)||0):s,0);const pescPct=recipe.reduce((s,r)=>r.id==='harina_pescado'?s+(parseFloat(r.p)||0):s,0);return{tot,avgN,cn,cost,eb,moistureTarget:sp?.moisture?.ideal??null,targets:sp?.targets??null,suppP,suppMedP,suppTotalP,suppEffectiveP,baseP,addP,cafeP,manP,airP,densaP,incompat,sp,trichoderma,dynSpawn,avgPh,avgDig,avgCra,eucPct,pescPct,ebLow:typeof ebLow!=='undefined'?ebLow:Math.round(eb),ebHigh:typeof ebHigh!=='undefined'?ebHigh:Math.round(eb),ebIndex:typeof ebIndex!=='undefined'?ebIndex:0,ebMods:typeof ebMods!=='undefined'?ebMods:null};
};

const api = { analyze, EB_PENALTY_BALANCE_BAND };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasSubstrateAnalysis = api;

})();
