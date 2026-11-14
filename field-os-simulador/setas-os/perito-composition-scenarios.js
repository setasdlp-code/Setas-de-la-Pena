'use strict';
// Sensibilidad de una receta fija, no calibración ni intervalo de confianza.
(function () {
  const catalog=typeof require==='function'?require('./substrate-catalog.js'):globalThis.SetasSubstrateCatalog;
  const engine=typeof require==='function'?require('./substrate-analysis.js'):globalThis.SetasSubstrateAnalysis;
  const ID='pellets_weber_hickory';
  const SOURCES=Object.freeze([
    {id:'oak_2024',label:'Proxy roble — El Sebaaly 2024',c:53.8,n:0.48,url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11575786/',note:'C estimado desde materia orgánica. C:N publicado 109.8; C/N tabulados =112.1.'},
    {id:'oak_2026',label:'Proxy roble — Koziak 2026',c:51.82,n:0.234,url:'https://www.mdpi.com/1996-1944/19/19/4127',note:'Muestra compuesta; tres réplicas analíticas, no tres lotes independientes.'},
    {id:'oak_2012',label:'Proxy roble blanco — Tumuluru 2012',c:50.28,n:0.17,url:'https://www.mdpi.com/1996-1073/5/10/3928',note:'Madera sin torrefacción, base libre de humedad; una medición.'},
    {id:'oak_2017',label:'Proxy roble — Jung 2017',c:48.6,n:0.1,url:'https://www.woodj.org/archive/view_article_pubreader?pid=wood-45-6-857',note:'Madera sin tratamiento; N publicado con poca precisión.'},
  ].map(Object.freeze));
  const hasEstimatedComposition=(recipe,ings=catalog.INGS)=>(recipe||[]).some(r=>Number(r.p)>0&&ings.find(g=>g.id===r.id)?.compositionStatus==='estimated');
  const zone=(x,range)=>!range?null:x<range.min?'bajo':x>range.max?'alto':'en rango';
  function compare({recipe,sKey,ings=catalog.INGS,spp=catalog.SPP}={}) {
    if(!recipe?.some(r=>r.id===ID&&Number(r.p)>0)||sKey!=='shiitake') return null;
    const product=ings.find(g=>g.id===ID);
    if(!product) return null;
    const profiles=[{id:'working',label:'Estimación de trabajo 60/40',c:product.c,n:product.n,url:null,note:'Hipótesis derivada, confianza baja; no análisis Weber.'},...SOURCES];
    const rows=profiles.map(profile=>{
      // Solo C y N cambian. El resto de atributos es el mismo supuesto de
      // trabajo, incluido analysisProxyId (no eliminar la penalización densa).
      const proxy=ings.map(g=>g.id===ID?{...g,c:profile.c,n:profile.n,cn:profile.c/profile.n}:g);
      const a=engine.analyze(recipe,sKey,proxy,spp);
      return {...profile,pelletCN:profile.c/profile.n,recipeCN:a.cn,recipeN:a.avgN,eb:a.eb,
        cnStatus:zone(a.cn,a.sp.cn_optimal),nStatus:zone(a.avgN,a.sp.n_optimal)};
    });
    return {schema:'setas.composition-sensitivity.v1',ingredientId:ID,confidence:'low',
      estimate:JSON.parse(JSON.stringify(product.compositionEstimate)),
      physicalAssumptions:{moisture:product.moisture,ph:product.ph,cra:product.cra,dig:product.dig,analysisProxyId:product.analysisProxyId},
      note:'Los proxies sustituyen C y N del pellet completo; no son análisis de la mezcla Weber ni límites de probabilidad. La EB es salida del modelo sin validación local.',
      diverges:rows.some(r=>r.cnStatus!==rows[0].cnStatus||r.nStatus!==rows[0].nStatus),rows};
  }
  function snapshot({recipe,sKey,ings=catalog.INGS,spp=catalog.SPP,at,modelVersion,forecast=null}={}) {
    const comparison=compare({recipe,sKey,ings,spp});
    if(!comparison) return null;
    if(!at||!modelVersion) throw new Error('La predicción requiere fecha y versión del modelo');
    const analysis=engine.analyze(recipe,sKey,ings,spp);
    return JSON.parse(JSON.stringify({schema:'setas.experimental-prediction.v1',capturedAt:at,modelVersion,
      sKey,recipe:recipe.map(r=>({id:r.id,p:Number(r.p)})),
      ingredients:recipe.map(r=>ings.find(g=>g.id===r.id)).filter(Boolean),
      speciesTargets:spp[sKey],workingPrediction:{cn:analysis.cn,n:analysis.avgN,eb:Number.isFinite(forecast?.value)?forecast.value:analysis.eb},rawModelEB:analysis.eb,forecast,comparison}));
  }
  const api={hasEstimatedComposition,compare,snapshot};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(typeof globalThis!=='undefined') globalThis.SetasCompositionScenarios=api;
})();
