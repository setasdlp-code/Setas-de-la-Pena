function CultureLineageView({lotes,bolsas,cosechas,onOpenBatch,onLink}) {
  const api=globalThis.SetasCultureLineage;
  const key='sdp_culture_lineage_v1';
  const [state,setState]=React.useState(()=>{try{return JSON.parse(localStorage.getItem(key))||{records:[],links:{},alertPasses:null};}catch{return {records:[],links:{},alertPasses:null};}});
  let records=state.records, conflict='';
  try{records=api.mergeRecords(state.records,lotes);}catch(e){conflict=e.message;}
  const [error,setError]=React.useState('');
  const [selected,setSelected]=React.useState(()=>new URLSearchParams(location.search).get('culture')||'');
  const [form,setForm]=React.useState({kind:'mother',id:'',parentId:'',passes:'',date:'',origin:'',medium:''});
  const save=next=>{try{localStorage.setItem(key,JSON.stringify(next));setState(next);setError('');return true;}catch{setError('No se pudo guardar. Conserve el formulario y reintente.');return false;}};
  const linked=lotes.map(l=>({...l,spawnGenerationId:l.spawnGenerationId||state.links[l.id]}));
  const comparison=api.compare({records:conflict?[]:records,lotes:linked,bolsas,cosechas});
  const chain=api.ancestry(records,selected);
  const fmt=v=>v===null?'Sin datos':v.toFixed(1)+'%';
  const change=(k,v)=>setForm(f=>({...f,[k]:v}));
  return <details className="panel" open={!!new URLSearchParams(location.search).get('culture')}><summary>Linajes de cultivo · EB y contaminación por pases</summary>
    <p>Registro de genealogía local de este navegador. Cada transferencia de spawn suma un pase; registre los pases previos documentados de la madre. La comparación describe asociaciones, no confirma degeneración.</p>
    {conflict&&<p role="alert">{conflict}</p>}
    {error&&<p role="alert">{error}</p>}
    <label>Umbral de alerta por pases (inclusivo)<input aria-label="Umbral de alerta por pases" type="number" min="0" step="1" value={state.alertPasses??''} placeholder="Sin configurar" onChange={e=>{try{save({...state,alertPasses:api.threshold(e.target.value===''?null:Number(e.target.value))});}catch(err){setError(err.message);}}}/></label>
    {state.alertPasses===null&&<p>Alerta sin configurar.</p>}
    <form inert={conflict?true:undefined} onSubmit={e=>{e.preventDefault();try{if(form.passes==='')throw Error('Registre el número de pases documentado.');const nextRecords=api.addRecord(records,{...form,passes:Number(form.passes)});if(save({...state,records:nextRecords})){setSelected(form.id);setForm({...form,id:''});}}catch(err){setError(err.message);}}}>
      <h3>Registrar cultivo madre o generación de spawn</h3>
      <label>Tipo<select value={form.kind} onChange={e=>setForm(f=>({...f,kind:e.target.value,parentId:''}))}><option value="mother">Cultivo madre</option><option value="spawn">Generación de spawn</option></select></label>
      {form.kind==='spawn'&&<label>Progenitor<select required value={form.parentId} onChange={e=>change('parentId',e.target.value)}><option value="">Seleccionar</option>{records.map(r=><option key={r.id} value={r.id}>{r.id} · {r.passes} pases</option>)}</select></label>}
      {['id','date','origin','medium','passes'].map(k=><label key={k}>{{id:'ID',date:'Fecha',origin:'Origen / referencia',medium:'Medio',passes:'Número de pases'}[k]}<input required type={k==='date'?'date':k==='passes'?'number':'text'} min={k==='passes'?0:undefined} step={k==='passes'?1:undefined} value={form[k]} onChange={e=>change(k,e.target.value)}/></label>)}
      <button type="submit" className="inv-btn inv-btn-pri">Guardar registro</button>
    </form>
    <h3>Recorrer genealogía</h3>
    <label>Cultivo<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Seleccionar</option>{records.map(r=><option key={r.id} value={r.id}>{r.id}</option>)}</select></label>
    {selected&&<><p>{chain.status==='complete'?'Cultivo madre: '+chain.mother.id:'Genealogía incompleta'}</p><ol>{chain.chain.map(r=><li key={r.id}><button type="button" onClick={()=>setSelected(r.id)}>{r.id}</button> · {r.kind} · {r.passes} pases · {r.date} · {r.origin} · {r.medium}</li>)}</ol><p>Lotes descendientes:</p>{api.batchesForCulture(selected,records,linked).map(l=><button type="button" key={l.id} onClick={()=>onOpenBatch(l.id)}>{l.codigo||l.id}</button>)}</>}
    <h3>Vincular lote a spawn</h3>
    {linked.map(l=>{const t=api.traceBatch(l,records,state.alertPasses);return <div key={l.id}><button type="button" onClick={()=>onOpenBatch(l.id)}>{l.codigo||l.id}</button> <select disabled={!!conflict} aria-label={'Spawn de '+(l.codigo||l.id)} value={l.spawnGenerationId||''} onChange={e=>{const id=e.target.value;if(save({...state,links:{...state.links,[l.id]:id}}))onLink(l.id,id,records);}}><option value="">Sin genealogía</option>{records.filter(r=>r.kind==='spawn').map(r=><option key={r.id} value={r.id}>{r.id}</option>)}</select>{t.mother&&<button type="button" onClick={()=>setSelected(l.spawnGenerationId)}>Madre {t.mother.id} · {t.passes} pases</button>}{t.passAlert===true&&<span role="status"> Umbral de pases alcanzado</span>}</div>;})}
    <h3>Comparación por línea madre y pases</h3><p>{comparison.unlinked} lotes sin genealogía completa. EB: media de lotes con cosecha registrada (puede ser parcial). Contaminación: bolsas contaminadas / bolsas con estado sano o contaminado registrado.</p>
    <div style={{overflowX:'auto'}}><table><thead><tr>{['Línea madre','Pases','Lotes','EB media','Lotes con EB','Contaminación','Bolsas evaluadas'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{comparison.rows.map(r=><tr key={r.lineId+':'+r.passes}><td><button type="button" onClick={()=>setSelected(r.lineId)}>{r.lineId}</button></td><td>{r.passes}</td><td>{r.batches.length}</td><td>{fmt(r.eb)}</td><td>{r.ebN}</td><td>{fmt(r.contaminationPct)}</td><td>{r.bags}</td></tr>)}</tbody></table></div>
  </details>;
}
