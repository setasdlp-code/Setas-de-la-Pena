'use strict';
(function(root){
  const statsApi=()=>typeof module!=='undefined'&&module.exports?require('./bitacora-model.js'):root.SetasBitacora;
  function threshold(value){
    if(value===null||value===undefined||value==='') return null;
    if(!Number.isInteger(value)||value<0) throw Error('El umbral debe ser un entero no negativo o quedar vacío.');
    return value;
  }
  function addRecord(records,record){
    const r={...record};
    for(const k of ['id','date','origin','medium']) if(typeof r[k]!=='string'||!r[k].trim()) throw Error('Falta '+k);
    if(!/^[A-Za-z0-9_-]{1,64}$/.test(r.id)||records.some(x=>x.id===r.id)) throw Error('ID inválido o duplicado.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||new Date(r.date).toISOString().slice(0,10)!==r.date) throw Error('Fecha inválida.');
    if(!Number.isInteger(r.passes)||r.passes<0) throw Error('Pases debe ser un entero no negativo documentado.');
    if(r.kind==='mother'){
      if(r.parentId) throw Error('El cultivo madre no puede tener progenitor.');
      r.parentId=null;r.lineId=r.id;
    }else if(r.kind==='spawn'){
      const p=records.find(x=>x.id===r.parentId);
      if(!p) throw Error('Seleccione un progenitor registrado.');
      if(r.passes!==p.passes+1) throw Error('Cada transferencia incrementa un pase respecto al progenitor.');
      if(r.date<p.date) throw Error('La generación no puede preceder a su origen.');
      r.lineId=p.lineId;
    }else throw Error('Tipo de cultivo inválido.');
    return [...records,Object.freeze(r)];
  }
  function mergeRecords(local,lotes){
    const records=new Map();
    for(const r of [...local,...lotes.flatMap(l=>l.cultureRecords||[])]){
      const old=records.get(r.id);
      if(old&&['kind','parentId','lineId','passes','date','origin','medium'].some(k=>(old[k]??null)!==(r[k]??null))) throw Error('Registros contradictorios para el cultivo '+r.id+'. Revise los originales.');
      records.set(r.id,r);
    }
    return [...records.values()];
  }
  function ancestry(records,id){
    const chain=[],seen=new Set();
    while(id){
      if(seen.has(id)) return {status:'invalid',chain,mother:null};
      seen.add(id);const r=records.find(x=>x.id===id);
      if(!r) return {status:'missing',chain,mother:null};
      chain.unshift({...r});id=r.parentId;
    }
    try {
      let validated=[];
      for(const record of chain) validated=addRecord(validated,record);
    } catch (_) { return {status:'invalid',chain,mother:null}; }
    return {status:chain[0]?.kind==='mother'?'complete':'missing',chain,mother:chain[0]?.kind==='mother'?chain[0]:null};
  }
  function traceBatch(lote,records=[],alertPasses=null){
    const limit=threshold(alertPasses),result=ancestry(records,lote.spawnGenerationId);
    const spawn=result.chain.at(-1);
    if(result.status==='complete'&&spawn?.kind!=='spawn') {result.status='invalid';result.mother=null;}
    return {...result,spawnGenerationId:lote.spawnGenerationId||null,passes:spawn?.passes??null,alertPasses:limit,passAlert:limit===null||!spawn?null:spawn.passes>=limit};
  }
  function batchesForCulture(id,records,lotes){
    return lotes.filter(l=>ancestry(records,l.spawnGenerationId).chain.some(r=>r.id===id));
  }
  function compare({records=[],lotes=[],bolsas=[],cosechas=[]}={}){
    const groups=new Map();let unlinked=0;
    for(const l of lotes){
      const trace=traceBatch(l,records);if(trace.status!=='complete'){unlinked++;continue;}
      const key=JSON.stringify([trace.mother.id,trace.passes]);
      if(!groups.has(key)) groups.set(key,{lineId:trace.mother.id,passes:trace.passes,batches:[],ebValues:[],contaminated:0,bags:0});
      const g=groups.get(key);g.batches.push(l.id);
      const bags=bolsas.filter(b=>b.loteId===l.id),harvests=cosechas.filter(c=>c.loteId===l.id);
      const s=statsApi().calcLoteStats(l,bags,harvests);
      // Sin cosecha, la EB todavía no es una observación de rendimiento.
      if(s&&harvests.length&&Number.isFinite(s.be)) g.ebValues.push(s.be);
      const assessed=bags.filter(b=>['sana','contaminada'].includes(b.estado));
      g.bags+=assessed.length;g.contaminated+=assessed.filter(b=>b.estado==='contaminada').length;
    }
    return {unlinked,rows:[...groups.values()].map(g=>({...g,ebN:g.ebValues.length,eb:g.ebValues.length?g.ebValues.reduce((a,b)=>a+b,0)/g.ebValues.length:null,contaminationPct:g.bags?100*g.contaminated/g.bags:null})).sort((a,b)=>a.lineId.localeCompare(b.lineId)||a.passes-b.passes)};
  }
  const api={mergeRecords,threshold,addRecord,ancestry,traceBatch,batchesForCulture,compare};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.SetasCultureLineage=api;
})(globalThis);
