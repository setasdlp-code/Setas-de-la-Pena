'use strict';
// ── substrate-diagnosis.js — lectura clínica de un análisis ──────────
//
// diagnose() traduce la salida numérica de analyze() a la explicación que el
// Perito le muestra al operario: qué está fuera de rango, por qué importa y qué
// hacer. Es la capa que convierte números en decisión de campo.
//
// Extraído de simulador-app.jsx sin cambiar un solo texto ni un solo umbral.
//
// Mismo patrón UMD que scoring.js. `species-targets.js` se resuelve de forma
// perezosa, en cada llamada: dentro del JSX diagnose() se declaraba ANTES que
// su puente (línea 1136 vs 1219) y funcionaba porque solo lo lee al ejecutarse.
// Conservar esa pereza mantiene el módulo indiferente al orden de carga.
(function () {

const speciesTargets = () => (typeof SetasSpeciesTargets !== 'undefined' && SetasSpeciesTargets)
  || (typeof globalThis !== 'undefined' && globalThis.SetasSpeciesTargets)
  || (typeof require !== 'undefined' ? require('./species-targets.js') : null);

const diagnose=(a,sKey)=>{
  if(!a) return{main:'Selecciona ingredientes para comenzar.',sugs:[]};
  const{tot,cn,avgN,suppP,baseP,addP,cafeP,airP,densaP,incompat,eb,sp,trichoderma,dynSpawn,avgPh,avgDig,avgCra,eucPct,pescPct}=a;const s=[];
  if(tot<95) s.push({t:'error',i:'!',tx:`Total ${tot.toFixed(1)}% — necesitas ${(100-tot).toFixed(1)}% más.`});
  else if(tot>105) s.push({t:'error',i:'!',tx:`Total ${tot.toFixed(1)}% — reduce ${(tot-100).toFixed(1)}%.`});
  if(sp){
    if(cn<sp.cn_optimal.min) s.push({t:'warning',i:'↓',tx:`C:N bajo (${cn.toFixed(1)}:1). Agrega base carbono. Objetivo ${sp.cn_optimal.min}–${sp.cn_optimal.max}:1.`});
    else if(cn>sp.cn_optimal.max) s.push({t:'warning',i:'↑',tx:`C:N alto (${cn.toFixed(1)}:1). Agrega salvado o café.`});
    else s.push({t:'success',i:'',tx:`C:N óptimo (${cn.toFixed(1)}:1) para ${sp.name}.`});
    if(trichoderma) s.push({t:'error',i:'!',tx:`COLAPSO TRICHODERMA: N=${avgN.toFixed(2)}% supera umbral crítico sin autoclave. EB cae ~85%. Opciones: reducir N, usar autoclave 121°C×90min, spawn ${dynSpawn}%+.`});
    else if(avgN<sp.n_optimal.min) s.push({t:'warning',i:'↓',tx:`Nitrógeno bajo (${avgN.toFixed(2)}%). Aumenta salvado o borra de café.`});
    else if(avgN>sp.n_optimal.max) s.push({t:'warning',i:'↑',tx:`Nitrógeno elevado (${avgN.toFixed(2)}%). Riesgo moderado. Spawn ajustado: ${dynSpawn}%.`});
    else s.push({t:'success',i:'',tx:`Nitrógeno óptimo (${avgN.toFixed(2)}%). Spawn dinámico: ${dynSpawn}%.`});
    if(suppP>sp.supplementation_max) s.push({t:'error',i:'!',tx:`Suplementación ${suppP.toFixed(0)}% excede ${sp.supplementation_max}%. REQUIERE AUTOCLAVE 121°C×90min. Spawn: ${dynSpawn}%.`});
    // pH
    if(sp.ph_optimal){
      if(avgPh<sp.ph_optimal.min) s.push({t:'error',i:'',tx:`pH estimado ${avgPh.toFixed(1)} — demasiado ácido para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Agrega carbonato de calcio o ceniza vegetal.`});
      else if(avgPh>sp.ph_optimal.max) s.push({t:'warning',i:'',tx:`pH estimado ${avgPh.toFixed(1)} — ligeramente alcalino para ${sp.name} (óptimo ${sp.ph_optimal.min}–${sp.ph_optimal.max}). Reduce cal/yeso o agrega borra de café/aserrín.`});
      else s.push({t:'success',i:'',tx:`pH estimado ${avgPh.toFixed(1)} — dentro del rango óptimo para ${sp.name} (${sp.ph_optimal.min}–${sp.ph_optimal.max}).`});
    }
  }
  if(baseP<50) s.push({t:'warning',i:'↓',tx:`Base carbono baja (${baseP.toFixed(0)}%). Mínimo 50%.`});
  if(addP<2) s.push({t:'warning',i:'!',tx:`Sin minerales. Agrega 2–4% carbonato/yeso.`});
  if(cafeP>30) s.push({t:'error',i:'!',tx:`Borra café ${cafeP.toFixed(0)}% — compactación. Máx 30%.`});
  if(eucPct>20) s.push({t:'warning',i:'!',tx:`Aserín de eucalipto ${eucPct.toFixed(0)}% — aceites esenciales (cineol, terpineol) reducen colonización 20–35%. Máximo recomendado: 20%.`});
  if(pescPct>3) s.push({t:'error',i:'!',tx:`Harina de pescado ${pescPct.toFixed(0)}% supera el 3% — riesgo elevado de ácaros y Sciaridae por olor. Reducir a ≤3% o eliminar.`});
  else if(cafeP>0) s.push({t:'success',i:'',tx:`Café en proporción saludable (${cafeP.toFixed(0)}%).`});
  if(densaP>60&&airP<10) s.push({t:'error',i:'',tx:`Riesgo anaerobiosis: ${densaP.toFixed(0)}% material denso + solo ${airP.toFixed(0)}% aireador. Agrega 10–15% cascarilla de arroz o tamo.`});
  else if(densaP>40&&airP<8) s.push({t:'warning',i:'',tx:`Estructura densa (${densaP.toFixed(0)}% fino, ${airP.toFixed(0)}% aireador). Agrega 8–10% cascarilla.`});
  else s.push({t:'success',i:'',tx:`Buena aireación (${airP.toFixed(0)}% aireador). O₂ adecuado.`});
  // Digestibilidad
  const digLbl=avgDig>=8?'Alta — colonización rápida (7–14 días)':avgDig>=5?'Media — colonización estándar (14–21 días)':'Baja — sustrato lignificado (21–35+ días). Considera pretratamiento o esporas de Shiitake/Reishi.';
  s.push({t:avgDig>=8?'success':avgDig>=5?'warning':'warning',i:'',tx:`Digestibilidad ${avgDig.toFixed(1)}/10 — ${digLbl}`});
  // CRA
  const craLbl=avgCra>=4?'Alta — reduce agua de hidratación ~10%':avgCra<=2?'Baja — hidratar bien, revisar punto de campo':null;
  if(craLbl) s.push({t:'warning',i:'',tx:`CRA ${avgCra.toFixed(1)}/5 — ${craLbl}`});
  const moistLbl=speciesTargets()?.targetSourceLabel(sp?.targets,'moisture');
  const moistNote=moistLbl==='Objetivo heredado'?' (valor heredado sin verificar)':moistLbl==='Objetivo genérico'?' (objetivo genérico)':'';
  s.push({t:'success',i:'△',tx:`Tenjo 2.580 msnm: humedad objetivo ${sp?.moisture?.ideal??'—'}%${moistNote}. Pasteurización sin presión: +25% tiempo. CWLP: pH≥12.`});
  if(incompat.length) s.push({t:'warning',i:'!',tx:`No ideales para ${sp?.name}: ${incompat.join(', ')}.`});
  // Transparencia del modelo: qué factores penalizan la EB y cuánto
  if(a.ebMods){
    const m=a.ebMods,pen=[];
    if(m.phF<1) pen.push(`pH −${Math.round((1-m.phF)*100)}%`);
    if(m.aerF<1) pen.push(`aireación −${Math.round((1-m.aerF)*100)}%`);
    if(m.digF<1) pen.push(`digestibilidad −${Math.round((1-m.digF)*100)}%`);
    if(pen.length) s.push({t:'warning',i:'-',tx:`EB ajustada por: ${pen.join(', ')}. Corrige estos factores para acercarte al EB máximo de la especie.`});
  }
  let main='';
  if(s.filter(x=>x.t==='error').length) main='Problemas críticos. Revisar antes de continuar.';
  else if(s.filter(x=>x.t==='warning').length>2) main='Receta funcional con margen de optimización.';
  else if(eb>100) main='Receta excelente — eficiencia biológica esperada superior al promedio.';
  else if(eb>80) main='Receta satisfactoria para producción estándar.';
  else main='Receta funcional. Revisar sugerencias.';
  return{main,sugs:s};
};

const api = { diagnose };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasSubstrateDiagnosis = api;

})();
