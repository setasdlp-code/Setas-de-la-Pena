// Paneles de solo lectura de la automatización de los nodos ESP32 y de las horas
// fuera de banda de un lote.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito y genera simulador-app.js. No se carga solo.
//
// Son componentes de presentación: reciben el modelo ya calculado por los
// módulos puros (node-automation.js, cycle-out-of-band.js) y no tienen botones
// de escritura. DEC-001: el control vive en el firmware del nodo; Setas OS lee.

const NODE_LINK_CLASS={fresh:'ok',stale:'warn',offline:'error',no_data:'warn',unknown:'warn'};
const NODE_SOURCE_LABELS=()=>{
  const t=typeof window!=='undefined'?window.SetasRoomCycleTargets:null;
  return (t&&t.SOURCE_LABELS)||{};
};
const nodeNum=n=>String(Math.round(n*1000)/1000).replace('.',',');

const NodeAutomationRelay=({relay,muted})=>(
  <li className="climate-node-relay" data-relay={relay.id} data-relay-on={relay.on===null?'unknown':String(relay.on)} style={{opacity:muted?0.7:1}}>
    <span>{relay.label}</span>
    <strong>{relay.on===null?'sin dato':relay.on?'Encendido (comandado)':'Apagado (comandado)'}</strong>
  </li>
);

const NodeAutomationCard=({node,roomBandSourceLabel})=>{
  const api=typeof window!=='undefined'?window.SetasNodeAutomation:null;
  const link=node.link||{state:'no_data',label:'Sin datos del nodo',ageMs:null};
  const ageText=api?api.ageLabel(link.ageMs):'';
  const muted=link.state!=='fresh';
  const sp=node.setpoints||{};
  const cmp=node.comparison||null;
  const labels=NODE_SOURCE_LABELS();
  const band=cmp&&cmp.band?cmp.band:null;
  const sourceText=band?(labels[band.source]||band.source):null;
  const reported=[];
  if(Number.isFinite(sp.heat_setpoint_c)) reported.push(`arranque de calefacción ${nodeNum(sp.heat_setpoint_c)} °C`);
  if(Number.isFinite(sp.temp_max_c)) reported.push(`techo ${nodeNum(sp.temp_max_c)} °C`);
  if(Number.isFinite(sp.hysteresis_c)) reported.push(`histéresis ${nodeNum(sp.hysteresis_c)} °C`);
  return (
    <div className="climate-node-card" data-testid="node-card" data-device-id={node.deviceId||undefined} data-link-state={link.state} data-node-valid={String(node.valid)}>
      <div className="climate-node-head">
        <strong>Nodo {node.deviceId||'sin id'}{node.position?` · ${node.position}`:''}</strong>
        <span className={`sdp-badge sdp-badge--${NODE_LINK_CLASS[link.state]||'warn'}`} data-testid="node-link-badge">{link.label}{link.state==='no_data'?'':` · ${ageText}`}</span>
      </div>
      {link.state==='stale'&&<p className="climate-node-note" data-testid="node-stale-note">Obsoleto: el último estado tiene más de {api?api.durationLabel(link.freshMs):''} (umbral de frescura de los sensores). Lo de abajo es el último estado conocido, no el actual.</p>}
      {link.state==='offline'&&<p className="climate-node-note" data-testid="node-offline-note">Sin enlace: el nodo no reporta desde hace más de {api?api.durationLabel(link.offlineMs):''}. Lo de abajo es el último estado conocido, no el actual.</p>}
      {!node.valid?(
        <p className="climate-node-note" data-testid="node-invalid" role="status">Estado del nodo no válido para el perfil de esta sala ({node.errors&&node.errors[0]}). No se muestra: Setas OS no usa un estado que no cumple el contrato.</p>
      ):(
        <>
          {!node.commissioned&&<p className="climate-node-note" data-testid="node-uncommissioned">Banco de pruebas, no comisionado: el nodo declara que su firmware no está comisionado.</p>}
          <p className="climate-node-line" data-testid="node-control-state">Control: <strong>{node.controlStateLabel}</strong></p>
          <h4 className="climate-node-sub">Relés</h4>
          <ul className="climate-node-relays" data-testid="node-relays">
            {node.relays.map(r=><NodeAutomationRelay key={r.id} relay={r} muted={muted}/>)}
          </ul>
          <p className="climate-node-foot">Estado comandado por el firmware, no medición del contacto. Setas OS solo lee: no hay control de relés aquí.</p>
          <h4 className="climate-node-sub">Alarmas del nodo</h4>
          {node.alarms.length===0?(
            <p className="climate-node-line" data-testid="node-alarms-none">Sin alarmas activas en el último estado reportado.</p>
          ):(
            <ul className="climate-node-alarms" data-testid="node-alarms">
              {node.alarms.map(a=><li key={a.code} data-alarm={a.code} className="climate-node-alarm"><strong>{a.code}</strong> · {a.description}</li>)}
            </ul>
          )}
          <h4 className="climate-node-sub">Consigna vigente en el nodo</h4>
          <p className="climate-node-line" data-testid="node-setpoint">
            {reported.length?`El nodo reporta ${reported.join(' · ')}.`:'El nodo no reportó consigna de temperatura.'}
            {sp.consigna_id?` Consigna ${sp.consigna_id}.`:''}
          </p>
          <p className="climate-node-foot">Procedencia: reportada por el firmware (declarada, no verificada con medición).</p>
          {cmp&&cmp.state==='match'&&band&&(
            <p className="climate-node-line" data-testid="node-setpoint-origin">Coincide con la banda del ciclo activo ({nodeNum(band.min)}–{nodeNum(band.max)} °C). Origen de la banda: <strong>{sourceText}</strong>.</p>
          )}
          {cmp&&cmp.state==='mismatch'&&(
            <div className="climate-node-mismatch" data-testid="node-setpoint-mismatch" role="status">
              <strong>Consigna distinta del ciclo de sala.</strong> {node.comparisonText}
              {band&&<> Origen de la banda del ciclo: <strong>{sourceText}</strong>.</>}
            </div>
          )}
          {cmp&&cmp.state!=='match'&&cmp.state!=='mismatch'&&(
            <p className="climate-node-line" data-testid="node-setpoint-nocompare">{node.comparisonText}</p>
          )}
        </>
      )}
    </div>
  );
};

// Panel de la ficha de sala (Clima). `view` sale de SetasNodeAutomation.buildRoomAutomation.
const RoomAutomationPanel=({view})=>{
  const kind=!view?'none':view.automation==='none'?'no-automation':view.noData?'no-data':'nodes';
  return (
    <div className="climate-actuators-panel" data-testid="climate-actuators-panel" data-automation-state={kind}>
      <div className="climate-node-title">
        <h3>Automatización del nodo</h3>
        <span className="sdp-provenance">Solo lectura · reportado por el nodo</span>
      </div>
      {kind==='none'&&<p className="climate-node-line" data-testid="node-no-data">Sin datos de actuadores para esta sala.</p>}
      {kind==='no-automation'&&(
        <p className="climate-node-line" data-testid="node-no-automation"><strong>{view.label}.</strong> Esta sala no tiene perfil de nodo de control: no hay relés ni alarmas que mostrar.</p>
      )}
      {kind==='no-data'&&(
        <p className="climate-node-line" data-testid="node-no-data"><strong>{view.noDataLabel}.</strong> La sala tiene perfil de nodo ({view.profile&&view.profile.deviceId}{view.profile&&view.profile.commissioned===false?', banco de pruebas, no comisionado':''}) pero no ha llegado ningún estado. No se muestra ningún relé, alarma ni consigna.</p>
      )}
      {kind==='nodes'&&view.nodes.map(n=><NodeAutomationCard key={n.deviceId||'nodo'} node={n}/>)}
    </div>
  );
};

// Telemetría guardada en este equipo (sdp_telemetry_v1, la misma que leen la
// evidencia de ciclo y la trazabilidad). Se relee del almacenamiento y se
// reutiliza el resultado mientras el contenido, los ciclos y el minuto no cambien.
let _lotOobCache={key:null,value:null};
const lotOutOfBand=({lote,cycles,now})=>{
  const api=typeof window!=='undefined'?window.SetasCycleOutOfBand:null;
  if(!api||!lote||!lote.id) return null;
  let raw='[]';
  try{raw=(typeof localStorage!=='undefined'&&localStorage.getItem('sdp_telemetry_v1'))||'[]';}catch(e){raw='[]';}
  const lotCycles=(cycles||[]).filter(c=>c&&Array.isArray(c.batchIds)&&c.batchIds.includes(lote.id));
  // Campos por separado: la telemetría puede pesar megabytes y no se concatena.
  const key={id:lote.id,minute:Math.floor(now/60000),cycles:JSON.stringify(lotCycles),raw};
  const k=_lotOobCache.key;
  if(k&&k.id===key.id&&k.minute===key.minute&&k.cycles===key.cycles&&k.raw===key.raw) return _lotOobCache.value;
  let readings=[];
  try{const parsed=JSON.parse(raw);readings=Array.isArray(parsed)?parsed:[];}catch(e){readings=[];}
  let value=null;
  try{value=api.buildCycleOutOfBand({cycles:lotCycles,readings,now});}
  catch(e){console.warn('[Lote] no se pudieron calcular las horas fuera de banda',e);}
  _lotOobCache={key,value};
  return value;
};

// Horas fuera de banda por etapa y métrica en la ficha de lote, junto a las cosechas.
const LotOutOfBandPanel=({result,mobile=false,roomNames=null})=>{
  // Sin el módulo de cálculo (no cargado) no hay resultado: no se pinta nada, ni
  // un "lote sin ciclo" que sería falso.
  if(!result) return null;
  const labels=NODE_SOURCE_LABELS();
  const pct=r=>`${Math.round(r*100)} %`;
  const hours=h=>`${String(h).replace('.',',')} h`;
  const rows=result&&result.rows?result.rows:[];
  const stages=[];
  rows.forEach(r=>{
    let g=stages.find(x=>x.cycleId===r.cycleId);
    if(!g){g={cycleId:r.cycleId,stageLabel:r.stageLabel,roomId:r.roomId,cycleState:r.cycleState,rows:[]};stages.push(g);}
    g.rows.push(r);
  });
  return (
    <section className="os-detail-panel" data-testid="batch-out-of-band" style={{marginTop:mobile?14:0,marginBottom:12}}>
      <h2>Horas fuera de banda por etapa</h2>
      <p className="climate-node-foot" style={{marginTop:0}}>Calculadas con la telemetría guardada en este equipo para cada ciclo de sala del lote, contra las bandas de ese ciclo. Una cobertura baja no se completa con estimaciones.</p>
      {!result.hasCycles&&<p className="climate-node-line" data-testid="batch-oob-nocycle">Este lote no tiene ciclo de sala: no hay bandas contra las que medir.</p>}
      {stages.map(g=>(
        <div key={g.cycleId} className="batch-oob-stage" data-testid="batch-oob-stage" data-cycle-id={g.cycleId}>
          <h3 className="batch-oob-stage__title">{g.stageLabel} · sala {(roomNames&&roomNames[g.roomId])||g.roomId}{g.cycleState==='active'?' · en curso':''}</h3>
          <ul className="batch-oob-list">
            {g.rows.map(r=>(
              <li key={r.metric} className="batch-oob-row" data-testid="batch-oob-row" data-metric={r.metric} data-status={r.status}>
                <span className="batch-oob-row__metric">{r.metricLabel}</span>
                <span className="batch-oob-row__band">Banda {r.band.min!=null?nodeNum(r.band.min):'—'}–{r.band.max!=null?nodeNum(r.band.max):'—'} {r.unit}{r.band.source&&labels[r.band.source]?` · ${labels[r.band.source]}`:''}</span>
                {r.status==='ok'
                  ?<strong className="batch-oob-row__value">{hours(r.outOfBandHours)} fuera de banda <span className="batch-oob-row__cov">de {hours(r.coveredHours)} con datos · cobertura {pct(r.coverageRatio)}</span></strong>
                  :<strong className="batch-oob-row__value batch-oob-row__value--none">Datos insuficientes <span className="batch-oob-row__cov">cobertura {pct(r.coverageRatio)} de la etapa ({r.readingCount} {r.readingCount===1?'lectura válida':'lecturas válidas'})</span></strong>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {result.skippedCycles&&result.skippedCycles.length>0&&(
        <p className="climate-node-foot" data-testid="batch-oob-skipped">Sin cálculo: {result.skippedCycles.map(s=>`${s.stageLabel} (${s.reason})`).join(', ')}.</p>
      )}
    </section>
  );
};
