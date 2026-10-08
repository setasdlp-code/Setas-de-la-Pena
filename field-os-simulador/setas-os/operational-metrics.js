'use strict';
(function(root,factory){
  const api=factory(typeof module!=='undefined'&&module.exports?require('./historical-calibration.js'):root.SetasHistoricalCalibration);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.SetasOperationalMetrics=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(history){
  const TABS=Object.freeze(['eventos','rendimiento','trabajo','supervision','salidas','conocimiento']);
  const normalizeTab=value=>TABS.includes(value)?value:'rendimiento';
  const REASONS={'incomplete-outcome':'ciclo parcial; excluido de la media','unverified-outcome':'resultado sin verificar','invalid-harvest':'cosecha inválida o sin identidad','invalid-dry-weight':'masa seca ausente o inválida','missing-recipe-reference':'sin referencia de receta o especie','outcome-value-mismatch':'resultado y masa inconsistentes','missing-or-invalid-eb':'EB ausente o inválida'};
  const number=value=>{
    if(!['number','string'].includes(typeof value)||String(value).trim()==='')return null;
    const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;
  };
  const kg=c=>{const n=number(c?.pesoFresco);return n==null?null:c.unit==='kg'?n:!c.unit||c.unit==='g'?n/1000:null;};
  // Compare complete records, independent of property order. Contradictory copies
  // have no ordering authority and are excluded rather than arbitrarily chosen.
  const stable=value=>JSON.stringify(canonical(value));
  function canonical(v){return Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;}
  function derive(lotes=[],bolsas=[],cosechas=[]){
    const issues=[], events=[];
    function unique(rows,kind){
      const groups=new Map();
      (Array.isArray(rows)?rows:[]).forEach((row,index)=>{
        if(!row||!row.id){issues.push({id:`${kind}:missing:${index}`,batchId:row?.loteId||null,label:`${kind}: registro sin identidad`,reviewable:false});return;}
        const key=String(row.id);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);
      });
      return [...groups].flatMap(([id,copies])=>{
        if(new Set(copies.map(stable)).size>1){issues.push({id:`${kind}:${id}:conflict`,batchId:kind==='lote'?id:copies[0].loteId,affectedBatches:kind==='lote'?[id]:copies.map(c=>c.loteId),label:`${kind} ${id}: copias contradictorias`,reviewable:false});return [];}
        return [copies[0]];
      });
    }
    const lots=unique(lotes,'lote'),bags=unique(bolsas,'bolsa'),harvests=unique(cosechas,'cosecha');
    const lotIds=new Set(lots.map(l=>l.id));
    const invalidBatches=new Set(issues.flatMap(i=>i.affectedBatches||[i.batchId]).filter(Boolean));
    const validHarvests=harvests.filter(c=>{
      const valid=kg(c)!=null&&lotIds.has(c.loteId);
      if(!valid){invalidBatches.add(c.loteId);issues.push({id:`cosecha:${c.id}:invalid`,batchId:c.loteId,label:`Cosecha ${c.id}: masa, unidad o lote inválidos`,snapshot:stable(c)});}
      return valid;
    });
    bags.forEach(b=>{
      if(['contaminada','contaminado','descartada','descartado','dudosa','aislada'].includes(b.estado))issues.push({id:`bolsa:${b.id}:estado`,batchId:b.loteId,label:`${b.codigo||b.id}: ${b.estado}`,snapshot:stable({id:b.id,loteId:b.loteId,codigo:b.codigo||null,estado:b.estado})});
    });
    const observations=history.bitacoraObservations(lots,validHarvests).map(r=>invalidBatches.has(r.loteId)?{...r,be:null,exclusionReason:'invalid-harvest'}:r);
    const eligibility=history.assessHistory(observations,'be');
    const rows=observations.map(r=>{
      const lote=lots.find(l=>l.id===r.loteId);
      const assessed=eligibility.observations.find(x=>x.row.loteId===r.loteId);
      const reason=r.exclusionReason||assessed?.reason;
      const fresh=validHarvests.filter(c=>c.loteId===r.loteId).reduce((a,c)=>a+kg(c),0);
      return {...r,...(reason&&reason!=='incomplete-outcome'?{exclusionReason:reason}:{}),reasonLabel:REASONS[reason]||'Datos pendientes de verificar',dryKg:number(lote.peseSeco??lote.pesoSeco??lote.peso_seco??lote.dryWeightKg),freshKg:invalidBatches.has(r.loteId)?null:validHarvests.some(c=>c.loteId===r.loteId)||r.outcome.status==='completed-zero-yield'?fresh:null,eligible:eligibility.eligibleRows.some(x=>x.loteId===r.loteId)};
    });
    rows.filter(r=>r.exclusionReason).forEach(r=>issues.push({id:`lote:${r.loteId}:datos`,batchId:r.loteId,label:`${r.codigo||r.loteId}: ${REASONS[r.exclusionReason]||'datos pendientes de verificar'}`,snapshot:stable(r)}));
    lots.forEach(l=>{
      const groups=new Map();
      (Array.isArray(l.lifecycleEvents)?l.lifecycleEvents:[]).forEach((e,index)=>{
        if(!e||!e.id||typeof e.type!=='string'){issues.push({id:`evento:${l.id}:missing:${index}`,batchId:l.id,label:`${l.codigo||l.id}: evento sin identidad o formato válido`,reviewable:false});return;}
        if(!groups.has(e.id))groups.set(e.id,[]);groups.get(e.id).push(e);
      });
      groups.forEach((copies,id)=>{
        if(new Set(copies.map(stable)).size>1){issues.push({id:`evento:${l.id}:${id}:conflict`,batchId:l.id,label:`${l.codigo||l.id}: copias contradictorias de evento ${id}`,reviewable:false});return;}
        events.push({...copies[0],batchId:l.id,eventKey:`lote:${l.id}:${id}`});
      });
    });
    validHarvests.forEach(c=>events.push({id:c.id,type:'cosecha',batchId:c.loteId,at:c.fecha||c.createdAt,eventKey:`cosecha:${c.id}`}));
    const reviews=events.filter(e=>e.type==='metrics_review'&&e.operatorId&&Number.isFinite(Date.parse(e.at))&&['validado','corregir'].includes(e.payload?.decision)&&typeof e.payload?.reason==='string'&&e.payload.reason.trim()).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||String(a.id).localeCompare(String(b.id)));
    const resolved=issues.map(i=>{
      const review=reviews.filter(e=>e.batchId===i.batchId&&e.payload?.anomalyId===i.id&&e.payload?.sourceSnapshot===(i.snapshot||null)).at(-1)||null;
      return {...i,reviewable:i.reviewable!==false&&lotIds.has(i.batchId),review};
    });
    const final=eligibility.eligibleRows;
    return {lots,bags,harvests:validHarvests,rows,issues:resolved,events,eligibility,meanEB:final.length?final.reduce((a,r)=>a+r.be,0)/final.length:null,freshKg:validHarvests.reduce((a,c)=>a+kg(c),0),reviews};
  }
  function saveReview({storage,prototype,queue,auth,role,anomalyId,expectedSnapshot,decision,reason,id,at}){
    if(!auth?.uid||!['produccion','direccion'].includes(role))throw new Error('Se requiere una sesión de Producción o Dirección.');
    if(!['validado','corregir'].includes(decision)||typeof reason!=='string'||!reason.trim())throw new Error('Indica la decisión y el motivo de la revisión.');
    if(!id||!Number.isFinite(Date.parse(at)))throw new Error('Identidad o fecha de revisión inválida.');
    prototype.recover(storage);
    const lots=prototype.read(storage,'sdp_bit_lotes'),bags=prototype.read(storage,'sdp_bit_bolsas'),harvests=prototype.read(storage,'sdp_bit_cosechas');
    const issue=derive(lots,bags,harvests).issues.find(i=>i.id===anomalyId);
    if(!issue?.reviewable||(expectedSnapshot!==undefined&&expectedSnapshot!==(issue.snapshot||null)))throw new Error('El hallazgo cambió o no tiene un lote inequívoco. Vuelve a cargarlo.');
    const sheet=typeof module!=='undefined'&&module.exports?require('./batch-sheet.js'):globalThis.SetasBatchSheet;
    const lot=lots.find(l=>l.id===issue.batchId),log=lot.lifecycleEvents||[];
    if(!Array.isArray(log)||log.some(e=>!e||!e.id)||log.length&&(!Number.isInteger(log.at(-1).seq)||log.at(-1).seq<1))throw new Error('El historial del lote necesita revisión antes de añadir eventos.');
    if(lots.some(l=>Array.isArray(l.lifecycleEvents)&&l.lifecycleEvents.some(e=>e?.id===id)))throw new Error('La identidad de revisión ya existe.');
    // Preserve the canonical local event envelope so the next batch action can
    // increment seq. UUID, rather than seq, remains the cross-device identity.
    const nextLog=sheet.appendBatchEvent(log,{id,action:'review_metrics',type:'metrics_review',batchId:issue.batchId,operatorId:auth.uid,at,payload:{anomalyId,decision,reason:reason.trim(),sourceSnapshot:issue.snapshot||null}});
    const event=nextLog.at(-1);
    const nextLots=lots.map(l=>l.id===issue.batchId?{...l,lifecycleEvents:nextLog}:l);
    const pending=prototype.read(storage,'sdp_sync_queue');
    const nextQueue=queue.enqueue(pending,queue.createOperation({type:'actualizarLote',key:`metrics-review:${id}`,id:`metrics-review:${id}`,args:[issue.batchId,{lifecycleEvents:[event]}]}));
    prototype.persist(storage,[['sdp_bit_lotes',nextLots],['sdp_sync_queue',nextQueue]]);
    return {lots:nextLots,queue:nextQueue,event};
  }
  return Object.freeze({TABS,normalizeTab,derive,saveReview});
});
