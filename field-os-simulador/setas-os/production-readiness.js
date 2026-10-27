'use strict';
// Pre-production assessment. Inspection records are local documentation;
// this module never authorizes a lifecycle transition or consumes inventory.
(function () {
  const KEY='sdp_production_readiness';
  const SCHEMA='setas.production-readiness.v1';
  const MANUAL_IDS=['spawn','equipment','room','sensors','review'];
  // Esterilizar en autoclave se valida con un bioindicador por corrida: sin
  // crecimiento, el ciclo mató las esporas de referencia; con crecimiento, no.
  // Pasteurización y cal en frío no usan bioindicador.
  const BIOINDICATOR_RESULTS=['sin_crecimiento','con_crecimiento','pendiente'];
  const requiresBioindicator=input=>input?.treatment?.col==='autoclave';
  const text=v=>typeof v==='string'?v.trim():'';
  const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
  const scopeFor=input=>JSON.stringify([
    input.speciesKey||null,input.preparation?.revision||null,input.roomId||null,input.containerId||null,input.lotCode||null,input.plannedDate||null,
    input.treatment?.col||null,input.treatment?.temp||null,input.treatment?.time||null,
    (input.plan?.allocations||[]).filter(a=>a.ingredientId===input.preparation?.spawn?.ingredientId)
      .map(a=>[a.lotId,a.quantity]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),
  ]);
  const validDetails=(id,d={})=>({
    spawn:()=>!!(text(d.strainId)&&text(d.supplier)&&text(d.thermalClass)),
    equipment:()=>!!(text(d.equipmentId)&&text(d.protocol))&&(!text(d.bioindicatorResult)||BIOINDICATOR_RESULTS.includes(d.bioindicatorResult)),
    room:()=>finite(d.capacityBags)&&Number.isInteger(Number(d.capacityBags))&&Number(d.capacityBags)>0&&d.sanitized===true&&d.targetsReviewed===true,
    sensors:()=>!!(text(d.deviceIds)&&text(d.calibrationReference)),
    review:()=>true,
  })[id]?.()===true;
  const validRecord=r=>r?.schema===SCHEMA&&text(r.id)&&MANUAL_IDS.includes(r.requirementId)
    &&['verified','blocked','unknown'].includes(r.status)&&text(r.reviewer)&&text(r.scope)
    &&Number.isFinite(Date.parse(r.at))&&(r.status!=='verified'||text(r.reference)&&validDetails(r.requirementId,r.details))
    &&(r.status==='verified'||text(r.notes));
  const readRecords=storage=>{
    const raw=storage.getItem(KEY);if(raw===null)return [];
    let records;try{records=JSON.parse(raw);}catch{throw Error('El registro de preparación está dañado. Conservar un respaldo antes de corregirlo.');}
    if(!Array.isArray(records)||records.some(r=>!validRecord(r))||new Set(records.map(r=>r.id)).size!==records.length)throw Error('El registro de preparación no tiene un formato válido. No se sobrescribió.');
    return records;
  };
  const latestFor=(records,id)=>records.map((record,index)=>({record,index})).filter(({record:r})=>validRecord(r)&&r.requirementId===id)
    .sort((a,b)=>Date.parse(b.record.at)-Date.parse(a.record.at)||b.index-a.index)[0]?.record||null;
  const reviewBasis=(input,checks)=>JSON.stringify([scopeFor(input),checks.filter(c=>c.id!=='review').map(c=>[c.id,c.status,c.record?.id||null]),
    (input.inventoryLots||[]).map(l=>[l.id,l.activo,l.cantidadKgDisponible,l.sobregiroKg||0]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),
    (input.reservations||[]).map(r=>[r.id,r.kg,r.status,r.expiresAt]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),
    input.roomState?.bagsPresent??null,input.roomState?.lastSanitizedAt??null,input.roomState?.lastEmptiedAt??null,
  ]);
  function assessProductionReadiness(input={},records=[],nowMs=Date.now()) {
    const checks=[],scope=scopeFor(input),prep=input.preparation;
    const add=(id,label,status,detail,action,record=null)=>checks.push({id,label,status,detail,action,record});
    const manual=(id,label,action)=>{
      const record=latestFor(records,id);
      const stale=!!record&&(record.scope!==scope||Date.parse(record.at)>nowMs);
      const status=record&&!stale?record.status:'unknown';
      add(id,label,status,stale?'La revisión pertenece a otra receta, cantidad, sala o fecha futura. Verificar de nuevo.'
        :record?record.status==='verified'?`Revisión documentada por ${record.reviewer}. Referencia: ${record.reference}.`:record.notes
        :'Falta una revisión con responsable y referencia de evidencia.',action,record);
      return checks[checks.length-1];
    };
    add('species','Especie confirmada',input.speciesConfirmed===true?'verified':'unknown',input.speciesConfirmed?input.speciesName||input.speciesKey:'Seleccionar explícitamente la especie para este lote.','recipe');
    const prepValid=prep?.schemaVersion===1&&text(prep.revision)&&prep.speciesKey===input.speciesKey
      &&Array.isArray(prep.items)&&prep.items.length>0&&prep.items.every(i=>finite(i.inventoryKg)&&Number(i.inventoryKg)>0)
      &&finite(prep.target?.bags)&&Number(prep.target.bags)>0&&finite(prep.totals?.waterExcessKg);
    const identified=text(input.lotCode)&&/^\d{4}-\d{2}-\d{2}$/.test(input.plannedDate||'')&&Number.isFinite(Date.parse(input.plannedDate));
    add('preparation','Receta y cantidades',!prepValid||Number(prep?.totals?.waterExcessKg)>0||input.lotCodeAlreadyUsed?'blocked':!identified?'unknown':'verified',
      !prepValid?input.preparationError||'Completar una receta válida y las cantidades del lote.':Number(prep.totals.waterExcessKg)>0?'La mezcla aporta más agua que el objetivo. Revisar la preparación.':input.lotCodeAlreadyUsed?'El código ya pertenece a un lote registrado. Usar un identificador nuevo.':!identified?'Indicar el código y la fecha previstos de este lote.':`${prep.target.bags} bolsas · ${prep.target.wetKg} kg húmedos · ${prep.revision}. Cantidades planificadas.`,'batch');
    const modelKnown=prepValid&&finite(input.model?.criticals)&&Number.isInteger(Number(input.model.criticals))&&Number(input.model.criticals)>=0;
    add('model','Restricciones del modelo',!modelKnown?'unknown':input.model.criticals>0?'blocked':'verified',!modelKnown?'Falta evaluar la receta activa.':input.model.criticals>0?`${input.model.criticals} restricción(es) crítica(s). Corregir la receta antes de continuar.`:'Sin críticos en la evaluación actual; esto no valida rendimiento ni proceso.','recommendations');
    const stockKnown=prepValid&&input.inventoryLoaded===true&&input.plan&&Array.isArray(input.plan.shortfalls)&&input.stockCheck&&Array.isArray(input.stockCheck.lines);
    const missing=stockKnown?input.stockCheck.lines.filter(l=>l.faltante>0):[];
    const neededIds=new Set([...(prep?.items||[]).map(i=>i.ingredientId),prep?.spawn?.ingredientId,input.containerStockId]);
    const overdraw=(input.inventoryLots||[]).some(l=>Number(l.sobregiroKg)>0&&neededIds.has(l.ingredienteId));
    const containerKnown=!!input.containerStockId;
    add('stock','Insumos, semilla y contenedores',!stockKnown?'unknown':missing.length||overdraw||!containerKnown?'blocked':'verified',
      !stockKnown?'No se puede comprobar cobertura sin cantidades e inventario cargados.':!containerKnown?'Seleccionar un contenedor identificado en Bodega.':overdraw?'Un lote asignado tiene sobregiro: realizar un recuento físico.':missing.length
        ?missing.map(s=>`${s.name||s.ingredienteId}: faltan ${s.faltante} ${s.unidad}`).join(' · '):'Las existencias disponibles, descontando reservas, cubren preparación, semilla y contenedores. Confirmar el recuento físico.','inventory');
    const spawn=manual('spawn','Cepa y semilla identificadas','record');
    const spawnLots=(input.plan?.allocations||[]).filter(a=>a.ingredientId===prep?.spawn?.ingredientId);
    if(spawn.status==='verified'&&!spawnLots.length){spawn.status='unknown';spawn.detail='No hay un lote físico de semilla asignado para vincular esta revisión.';}
    const estimated=prepValid?prep.items.filter(i=>i.moisture?.source!=='operator-measured').length:null;
    add('moisture','Humedad de los ingredientes',estimated===null?'unknown':estimated?'unknown':'verified',estimated===null?'Falta la preparación.':estimated?`${estimated} ingrediente(s) usan humedad de referencia. Registrar las mediciones del lote.`:'Humedades ingresadas como mediciones por el operador.','batch');
    const equipment=manual('equipment','Equipo y ciclo de tratamiento','record');
    if(equipment.status==='verified'&&requiresBioindicator(input)){
      const d=equipment.record.details||{};
      if(d.bioindicatorResult==='con_crecimiento'){equipment.status='blocked';equipment.detail='El bioindicador de la corrida del autoclave mostró crecimiento: la esterilización no está validada.';}
      else if(d.bioindicatorResult!=='sin_crecimiento'||!text(d.cycleId)){equipment.status='unknown';equipment.detail='Falta la corrida del autoclave con un bioindicador sin crecimiento.';}
    }
    const room=manual('room','Sala, capacidad y condiciones','record');
    if(room.status==='verified'){
      if(!input.roomState||!finite(input.roomState.bagsPresent)){room.status='unknown';room.detail='No se pudo comprobar la ocupación actual de la sala.';}
      else if(input.roomState.status==='needs_sanitation'||Number(input.roomState.bagsIsolated)>0||input.roomState.alerts?.some(a=>a.code==='bolsas_aisladas')){room.status='blocked';room.detail='La sala requiere limpieza o revisión de aislamiento.';}
      else if(Date.parse(input.roomState.lastEmptiedAt)>Date.parse(room.record.at)){room.status='unknown';room.detail='La sala se vació después de la inspección. Verificar sus condiciones de nuevo.';}
      else if(Number(input.roomState.bagsPresent)+Number(prep?.target?.bags)>Number(room.record.details.capacityBags)){room.status='blocked';room.detail='Las bolsas presentes y planificadas superan la capacidad documentada.';}
    }
    const sensors=manual('sensors','Sensores y calibración','record');
    const telemetry=input.telemetry;
    const metrics=['temperature_c','rh_pct','co2_ppm'];
    const trustworthy=telemetry&&metrics.every(metric=>{
      const r=telemetry.latest?.[metric];
      return r?.quality==='valid'&&finite(r.value)&&text(r.device_id)&&Date.parse(r.observed_at)<=nowMs
        &&telemetry.freshMetrics?.[metric]===true&&['websocket','mqtt','firestore'].includes(r.ingest_source)
        &&['esp32_sensor','esp32_sensor_compensated','esp32_hardware','esphome','hardware_sensor'].includes(r.source)&&r.room_id===input.roomId
        &&text(sensors.record?.details?.deviceIds).split(/[\s,]+/).includes(r.device_id);
    });
    if(sensors.status==='verified'&&!trustworthy){sensors.status='unknown';sensors.detail='Faltan lecturas actuales y válidas de temperatura, HR o CO₂; los datos manuales y de demostración no verifican sensores.';}
    const review=manual('review','Revisión humana de este plan','record');
    if(review.status==='verified'&&(review.record.reviewBasis!==reviewBasis(input,checks)||checks.some(c=>c.id!=='review'&&c.status!=='verified'))){review.status='unknown';review.detail='Cambió un requisito o sigue pendiente. Completar y revisar de nuevo este plan.';}
    const counts={verified:0,blocked:0,unknown:0};checks.forEach(c=>counts[c.status]++);
    return {scope,preparationRevision:prep?.revision||null,checks,counts,status:counts.blocked?'blocked':counts.unknown?'unknown':'verified',
      next:checks.find(c=>c.status==='blocked')||checks.find(c=>c.status==='unknown')||null,
      reviewBasis:reviewBasis(input,checks),spawnLots};
  }
  function createEvidence(form,input,records,{at=new Date().toISOString(),id}={}){
    const result={schema:SCHEMA,id,requirementId:form.requirementId,status:form.status,reviewer:text(form.reviewer),reference:text(form.reference),notes:text(form.notes),details:{...form.details},scope:scopeFor(input),at};
    if(!validRecord(result))throw Error('Completar responsable, evidencia y los datos de la revisión. Para un bloqueo o pendiente, explicar el motivo.');
    if(!input.preparation?.revision||!input.speciesConfirmed)throw Error('Seleccionar la especie y completar las cantidades antes de registrar una revisión.');
    if(result.requirementId==='equipment'&&result.status==='verified'&&requiresBioindicator(input)
      &&(result.details.bioindicatorResult!=='sin_crecimiento'||!text(result.details.cycleId)))
      throw Error('Para esterilizar en autoclave, registrar la corrida (ID del ciclo) y un bioindicador sin crecimiento. Si hubo crecimiento, registrar la revisión como bloqueada.');
    if(result.requirementId==='review'&&result.status==='verified'){
      const assessment=assessProductionReadiness(input,records,Date.parse(at));
      if(assessment.checks.some(c=>c.id!=='review'&&c.status!=='verified'))throw Error('Completar los requisitos pendientes antes de documentar la revisión final.');
      result.reviewBasis=assessment.reviewBasis;
    }
    return result;
  }
  const api={KEY,SCHEMA,MANUAL_IDS,BIOINDICATOR_RESULTS,requiresBioindicator,scopeFor,readRecords,createEvidence,assessProductionReadiness};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  globalThis.SetasProductionReadiness=api;
})();
