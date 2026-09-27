'use strict';
// Explicit prototype records, durable local writes and portable backups.
(function () {
  const PENDING='sdp_pending_write_v1';
  const PLANS='sdp_experiments_v1';
  const ARCHIVE='sdp_recovery_archive_v1';
  const KEYS=Object.freeze(['sdp_proveedores','sdp_compras','sdp_lotes','sdp_movimientos','sdp_bit_lotes','sdp_bit_bolsas','sdp_bit_cosechas','sdp_bit_tasks','sdp_room_events','sdp_inv_reservas','sdp_sync_queue','sdp_inventory_ops','setas_v6',PLANS,'sdp_room_cycles','sdp_telemetry_v1','sdp_cycle_evidence_v1']);
  const clone=x=>JSON.parse(JSON.stringify(x));
  const read=(storage,key)=>{
    const raw=storage.getItem(key);
    if(raw===null)return [];
    let value;try{value=JSON.parse(raw);}catch{throw Error(`Datos dañados: ${key}. Exporta antes de corregir.`);}
    if(!Array.isArray(value))throw Error(`Colección inválida: ${key}`);
    return value;
  };
  function recover(storage){
    const raw=storage.getItem(PENDING);if(!raw)return;
    const transaction=JSON.parse(raw);
    if(transaction.schema!=='setas.local-write.v1'||!Array.isArray(transaction.entries))throw Error('Recuperación local inválida. Conserva el respaldo.');
    for(const entry of transaction.entries){
      if(!KEYS.includes(entry.key)&&entry.key!==ARCHIVE)throw Error('Clave de recuperación no permitida.');
      const current=storage.getItem(entry.key);
      if(current!==entry.before&&current!==entry.after)throw Error(`Conflicto al recuperar ${entry.key}. No se sobrescribió.`);
    }
    for(const entry of transaction.entries)storage.setItem(entry.key,entry.after);
    storage.removeItem(PENDING);
  }
  function persist(storage,entries){
    recover(storage);
    if(entries.some(([key,value])=>key===ARCHIVE?!validateArchive(value):!KEYS.includes(key)||!Array.isArray(value))||new Set(entries.map(([k])=>k)).size!==entries.length)throw Error('Contrato de guardado inválido.');
    const transaction={schema:'setas.local-write.v1',entries:entries.map(([key,value])=>({key,before:storage.getItem(key),after:JSON.stringify(value)}))};
    // If this write fails, no operational key has changed.
    storage.setItem(PENDING,JSON.stringify(transaction));
    try{for(const entry of transaction.entries)storage.setItem(entry.key,entry.after);storage.removeItem(PENDING);}
    catch(error){
      let rolledBack=true;
      for(const e of transaction.entries){try{e.before===null?storage.removeItem(e.key):storage.setItem(e.key,e.before);}catch{rolledBack=false;}}
      if(rolledBack){try{storage.removeItem(PENDING);}catch{}}
      throw error;
    }
  }
  const recipeSignature=r=>JSON.stringify((r||[]).map(x=>[x.id,Number(x.p??x.pct)]).sort((a,b)=>a[0].localeCompare(b[0])));
  const experimentApi=()=>typeof module!=='undefined'&&module.exports?require('./experiment-model.js'):globalThis.SetasExperiment;
  function savePlan(storage,input){
    const plan=experimentApi().normalizeExperiment(input),errors=experimentApi().validateExperiment(plan);
    if(errors.length)throw Error(errors.join('; '));
    for(const arm of [plan.control,...plan.treatments]){
      const recipe=arm.recipeSnapshot?.recipe;
      if(!recipe?.length||new Set(recipe.map(r=>r.id)).size!==recipe.length||recipe.some(r=>!r.id||!Number.isFinite(Number(r.p))||Number(r.p)<=0)||Math.abs(recipe.reduce((n,r)=>n+Number(r.p),0)-100)>0.01)throw Error('Cada receta debe tener ingredientes únicos y porcentajes positivos que sumen 100%.');
    }
    const plans=read(storage,PLANS),old=plans.find(p=>p.id===plan.id);
    if(old&&(old.status!=='draft'||[old.control,...old.treatments].some(a=>a.batchIds.length)))throw Error('Plan en ejecución: crea una nueva versión.');
    persist(storage,[[PLANS,[...plans.filter(p=>p.id!==plan.id),clone(plan)]]]);return plan;
  }
  function linkBatch(plans,selection,lote){
    const result=clone(plans),plan=result.find(p=>p.id===selection?.experimentId);
    if(!plan||!['draft','running'].includes(plan.status))throw Error('Plan no disponible.');
    const arm=[plan.control,...plan.treatments].find(a=>a.id===selection.armId);
    if(!arm||arm.batchIds.length>=arm.plannedReplicates)throw Error('Grupo completo o inválido.');
    if(arm.recipeSnapshot?.sKey!==lote.recipeRef?.sKey||recipeSignature(arm.recipeSnapshot.recipe)!==recipeSignature(lote.recipeRef.recipe))throw Error('La receta cambió: crea otro plan para esta variante.');
    arm.batchIds.push(lote.id);plan.status='running';plan.startedAt ||= lote.createdAt;
    const batch={...lote,experimentId:plan.id,armId:arm.id,recipeVersionId:arm.recipeVersionId,recipeRef:{...lote.recipeRef,versionId:arm.recipeVersionId}};
    return {plans:result,batch};
  }
  const releaseBasis=batch=>JSON.stringify([batch?.id,batch?.preparation||null,batch?.recipeRef||null,batch?.tratamiento||null]);
  function release(batch,{equipment,protocol,reviewer,acknowledged,at,legacyReviewed=false}){
    if(!batch?.id||!equipment?.trim()||!protocol?.trim()||!reviewer?.trim()||acknowledged!==true||!Number.isFinite(Date.parse(at)))throw Error('Completa equipo, protocolo, responsable y aceptación de incertidumbre.');
    if(!batch.preparation&&!legacyReviewed)throw Error('Revisa explícitamente la especificación del lote antiguo.');
    return {schema:'setas.trial-release.v1',scope:'controlled-trial',basis:releaseBasis(batch),preparationRevision:batch.preparation?.revision||null,equipment:equipment.trim(),protocol:protocol.trim(),reviewer:reviewer.trim(),at,acknowledged:true,legacyReviewed};
  }
  const releaseCurrent=(batch,r=batch?.trialRelease)=>r?.schema==='setas.trial-release.v1'&&r.scope==='controlled-trial'&&r.acknowledged===true&&r.basis===releaseBasis(batch);
  const emptyArchive=()=>({sync:[],inventory:[],fieldEvents:[]});
  const mergeRecords=(a,b,key)=>{
    const result=new Map();
    for(const row of [...a,...b]){
      const id=key(row);if(!id)throw Error('Respaldo con identidad pendiente inválida.');
      // Prefer the latest live delivery envelope while retaining its immutable identity.
      result.set(id,row);
    }
    return [...result.values()];
  };
  function validateArchive(archive){
    if(!archive||!['sync','inventory','fieldEvents'].every(k=>Array.isArray(archive[k])))throw Error('Archivo de recuperación inválido.');
    for(const key of ['sync','inventory'])if(archive[key].some(r=>!r||typeof r!=='object'||!(r.id||r.opId)))throw Error('Identidad archivada inválida.');
    if(archive.fieldEvents.some(r=>!r?.event?.id||!r.delivery||r.delivery.eventId!==r.event.id))throw Error('Evento archivado incompleto.');
    return archive;
  }
  function validateBackup(data){
    if(data?.schema!=='setas.prototype-backup.v1'||!data.collections||typeof data.collections!=='object'||Array.isArray(data.collections)||!Array.isArray(data.fieldEvents))throw Error('Respaldo no compatible.');
    validateArchive(data.archive||emptyArchive());
    validateArchive({sync:[],inventory:[],fieldEvents:data.fieldEvents});
    for(const [key,rows]of Object.entries(data.collections)){
      if(!KEYS.includes(key)||!Array.isArray(rows)||rows.some(r=>!r||typeof r!=='object'||Array.isArray(r)))throw Error(`Colección inválida: ${key}`);
      const ids=rows.map(r=>r.id??r.opId).filter(v=>v!=null);
      if(new Set(ids).size!==ids.length)throw Error(`Identidades duplicadas: ${key}`);
    }
    const lots=data.collections.sdp_bit_lotes||[],bags=data.collections.sdp_bit_bolsas||[],harvests=data.collections.sdp_bit_cosechas||[];
    const lotIds=new Set(lots.map(l=>l.id)),bagIds=new Set(bags.map(b=>b.id));
    if(lots.some(l=>!l.id)||bags.some(b=>!b.id||!lotIds.has(b.loteId))||harvests.some(c=>!lotIds.has(c.loteId)||(c.bolsaId&&!bagIds.has(c.bolsaId))))throw Error('Referencias de lote/bolsa incompletas.');
    return {batches:lots.length,bags:bags.length,harvests:harvests.length,pending:(data.collections.sdp_sync_queue||[]).filter(o=>o.status!=='synced').length+(data.collections.sdp_inventory_ops||[]).filter(o=>o.status!=='synced').length+data.fieldEvents.length};
  }
  async function backup(storage,{db=null,accountId=null,at=new Date().toISOString()}={}){
    recover(storage);
    let fieldEvents=[];
    if(db){fieldEvents=await new Promise((resolve,reject)=>{
      const tx=db.transaction(['field_events','queue_entries'],'readonly');let events=[],queue=[];
      tx.objectStore('field_events').getAll().onsuccess=e=>{events=e.target.result;};tx.objectStore('queue_entries').getAll().onsuccess=e=>{queue=e.target.result;};
      tx.oncomplete=()=>{const records=queue.filter(q=>q.accountId===accountId).map(q=>({event:events.find(e=>e.id===q.eventId),delivery:q}));if(records.some(r=>!r.event)){reject(Error('Hay envíos de campo sin su evento original. Conserva este equipo para recuperar la evidencia.'));return;}resolve(records);};tx.onerror=()=>reject(tx.error);
    });}
    const data={schema:'setas.prototype-backup.v1',at,archive:validateArchive(JSON.parse(storage.getItem('sdp_recovery_archive_v1')||'null')||emptyArchive()),collections:Object.fromEntries(KEYS.map(k=>[k,read(storage,k)])),fieldEvents};validateBackup(data);return data;
  }
  function restore(storage,data){
    const preview=validateBackup(data);recover(storage);
    if(KEYS.some(k=>read(storage,k).length))throw Error('Restaura en un espacio vacío. No se reemplazan registros existentes.');
    const collections=clone(data.collections);
    // Delivery queues are kept for inspection, never imported into live outboxes.
    const previous=data.archive||emptyArchive();
    const archive={sync:mergeRecords(previous.sync,collections.sdp_sync_queue||[],r=>r.id),inventory:mergeRecords(previous.inventory,collections.sdp_inventory_ops||[],r=>r.opId),fieldEvents:mergeRecords(previous.fieldEvents,data.fieldEvents,r=>r.event.id)};
    collections.sdp_sync_queue=[];collections.sdp_inventory_ops=[];
    persist(storage,[...Object.entries(collections),[ARCHIVE,archive]]);
    return preview;
  }
  const dependency=(name,file)=>typeof module!=='undefined'&&module.exports?require(file):globalThis[name];
  function queued(queue,ops){
    const api=dependency('SetasSyncQueue','./sync-queue.js');
    return ops.reduce((q,op)=>api.enqueue(q,api.createOperation(op)),queue);
  }
  function planBatch(storage,{lote,bolsas,plan,selection=null}){
    recover(storage);
    const lots=read(storage,'sdp_bit_lotes');
    if(lots.some(l=>l.id===lote.id||l.codigo===lote.codigo))throw Error('Código de lote ya registrado. Abre el lote existente.');
    const ledger=dependency('SetasInventoryLedger','./inventory-ledger.js');
    const reservations=ledger.addReservations(read(storage,'sdp_inv_reservas'),ledger.reservationsForPlan(plan,{batchId:lote.id,at:lote.createdAt}));
    const extra=[];
    if(selection){const linked=linkBatch(read(storage,PLANS),selection,lote);lote=linked.batch;extra.push([PLANS,linked.plans]);bolsas=bolsas.map(b=>({...b,experimentId:lote.experimentId,armId:lote.armId}));}
    const sync=queued(read(storage,'sdp_sync_queue'),[{type:'guardarLote',key:'lote:'+lote.id,args:[lote]},{type:'guardarBolsas',key:'lote:'+lote.id+':bolsas',args:[bolsas]}]);
    const entries=[['sdp_inv_reservas',reservations],['sdp_bit_lotes',[lote,...lots]],['sdp_bit_bolsas',[...read(storage,'sdp_bit_bolsas'),...bolsas]],['sdp_sync_queue',sync],...extra];
    persist(storage,entries);return Object.fromEntries(entries);
  }
  function prepareBatch(storage,{loteId,trialRelease,sheet,role,operatorId,at}){
    recover(storage);
    const lots=read(storage,'sdp_bit_lotes'),lote=lots.find(l=>l.id===loteId);
    if(!lote||!releaseCurrent(lote,trialRelease))throw Error('La autorización no corresponde a esta versión del lote.');
    if((lote.ingredientShortfalls||[]).some(s=>s.missing>0))throw Error('Este plan tiene insumos faltantes. Replanifica con existencias completas antes de preparar.');
    if(lote.preparation?.totals?.waterExcessKg>0)throw Error('Los insumos exceden el agua objetivo. Revisa la preparación antes de consumir stock.');
    const batchApi=dependency('SetasBatchSheet','./batch-sheet.js');
    const inventory=dependency('SetasInventoryConsumption','./inventory-consumption.js');
    const ledger=dependency('SetasInventoryLedger','./inventory-ledger.js');
    const queue=read(storage,'sdp_inventory_ops');
    const restored=JSON.parse(storage.getItem('sdp_recovery_archive_v1')||'{}');
    const existing=queue.find(o=>o.loteId===loteId)||(restored.inventory||[]).find(o=>o.loteId===loteId);
    // Validate consequences BEFORE changing stock. Existing consumption alone does
    // not prove the preparation event exists (legacy interrupted operation).
    if((existing?.shortfalls||[]).length)throw Error('Hay un consumo parcial anterior. Reconcilia los insumos antes de registrar la preparación.');
    const alreadyRecorded=(lote.lifecycleEvents||[]).some(e=>e.action==='prepare_mix');
    if(alreadyRecorded)return {entries:null,lote,transition:'mix_prepared',reused:true};
    const recetaId=lote.recipeRef?.versionId||lote.recipeRef?.id||lote.recetaId;
    const consequences=batchApi.actionConsequences(sheet,'prepare_mix',{recetaId},{role,operatorId,at,bolsas:read(storage,'sdp_bit_bolsas').filter(b=>b.loteId===loteId)});
    const applied=batchApi.applyConsequences(sheet,consequences,{log:lote.lifecycleEvents||[]});
    const plan={allocations:lote.ingredientLots||[],shortfalls:[],preparation:lote.preparation||null};
    if(!plan.allocations.length)throw Error('El lote no tiene un plan de insumos verificable.');
    const op=inventory.buildConsumptionOp({loteId,codigo:lote.codigo,plan,createdAt:Date.parse(at)});
    const consumption=existing?null:inventory.applyLocal(read(storage,'sdp_lotes'),op,{fecha:at.slice(0,10),nota:'Preparación de mezcla · '+lote.codigo});
    if(consumption?.shortfalls.length)throw Error('Stock insuficiente para completar la mezcla. No se descontó inventario.');
    let reservations=read(storage,'sdp_inv_reservas');
    if(!existing){
      let held=reservations.filter(r=>r.batchId===loteId&&r.status==='held');
      if(!held.length){held=ledger.reservationsForPlan(plan,{batchId:loteId,at});reservations=ledger.addReservations(reservations,held);}
      reservations=held.reduce((q,r)=>ledger.consume(q,r.id,{eventId:op.opId,at}),reservations);
    }
    const patch={lifecycleEvents:applied.log,...applied.batchPatch,trialRelease,pendingPreparationTransition:{from:sheet.state,to:consequences.transition}};
    const next={...lote,...patch};
    const sync=queued(read(storage,'sdp_sync_queue'),[{type:'actualizarLote',key:'lote:'+loteId,args:[loteId,patch]}]);
    const entries=[['sdp_bit_lotes',lots.map(l=>l.id===loteId?next:l)],['sdp_sync_queue',sync],['sdp_inv_reservas',reservations]];
    if(consumption)entries.push(['sdp_lotes',consumption.lotes],['sdp_movimientos',[...read(storage,'sdp_movimientos'),...consumption.movimientos]],['sdp_inventory_ops',[...queue,consumption.appliedOp]]);
    persist(storage,entries);return {entries:Object.fromEntries(entries),lote:next,transition:consequences.transition,reused:false};
  }
  const api={planBatch,prepareBatch,PENDING,PLANS,KEYS,read,recover,persist,savePlan,linkBatch,recipeSignature,release,releaseBasis,releaseCurrent,validateBackup,backup,restore};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  globalThis.SetasPrototype=api;
})();
