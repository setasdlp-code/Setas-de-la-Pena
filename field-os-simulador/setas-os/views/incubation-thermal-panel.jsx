// Panel «Mapa térmico de incubación» (pestaña Producción, junto a la
// calificación del autoclave). Offsets de sondas por co-ubicación y uniformidad
// base–centro–tope del prototipo con datos de datalogger (OAP-0001).
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito. No se carga solo.
//
// Reglas: el criterio ΔT ≤2 °C en ≥95 % de intervalos es provisional y de
// uniformidad del prototipo, no un setpoint; un intervalo sin las tres
// posiciones no se descarta; la app calcula y la decisión del gate es humana.

const TM_STATUS = { cumple: 'Cumple', no_cumple: 'No cumple', insuficiente: 'Datos insuficientes', ok: 'Comparación suficiente',
  cumple_ensayos_sin_biologico: 'Vacío y carga simulada cumplen', pendiente: 'Pendiente' };
const TM_TONE = { cumple: 'verified', ok: 'verified', cumple_ensayos_sin_biologico: 'verified', no_cumple: 'blocked' };
const tmFmt = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(d).replace('.', ','));

function TMFileInput({ label, onParsed }) {
  const [info, setInfo] = React.useState(''), [error, setError] = React.useState('');
  return <>
    <label>{label}<input type="file" accept=".csv,.txt,text/csv" onChange={async (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      try { const data = SetasAutoclaveQualification.parseLoggerCsv(await file.text()); onParsed(data, file.name); setInfo(`${file.name}: ${data.rows} lecturas · columnas ${data.columns.join(', ')}${data.warnings.length ? ' · ' + data.warnings.join(' ') : ''}`); setError(''); }
      catch (e) { onParsed(null, ''); setInfo(''); setError(e.message); }
    }} /></label>
    {info && <p role="status">{info}</p>}{error && <p role="alert">{error}</p>}
  </>;
}

function TMOffsetsForm({ records, submit }) {
  const [data, setData] = React.useState(null), [file, setFile] = React.useState('');
  const [f, setF] = React.useState({ id: `OFF-${records.filter((r) => r.kind === 'offsets').length + 1}`, label: '', probes: [], reference: 'median' });
  const preview = React.useMemo(() => { try { return data && f.probes.length >= 2 ? SetasThermalMapping.computeOffsets(data, { probes: f.probes, reference: f.reference }) : null; } catch { return null; } }, [data, f.probes, f.reference]);
  const toggle = (c) => setF((p) => ({ ...p, probes: p.probes.includes(c) ? p.probes.filter((x) => x !== c) : [...p.probes, c], reference: p.reference === c ? 'median' : p.reference }));
  return <AQForm label="Comparación de sondas en un mismo punto" submitLabel="Guardar offsets" onSubmit={() => {
    if (!data) throw Error('Cargar el CSV de la comparación.');
    submit((by, all) => SetasThermalMapping.createOffsetsRecord(all, { id: f.id.trim(), label: f.label, data, probes: f.probes, reference: f.reference, sourceFile: file }, { by }), `Offsets ${f.id} guardados.`);
  }}>
    <p>Las sondas juntas en un mismo punto durante 48–72 h, antes de ubicarlas (OAP-0001). Offset = mediana de (sonda − referencia); corregido = lectura − offset.</p>
    <label>ID<input value={f.id} onChange={(e) => setF((p) => ({ ...p, id: e.target.value }))} /></label>
    <label>Descripción (sondas, direcciones 1-Wire, ubicación)<input value={f.label} onChange={(e) => setF((p) => ({ ...p, label: e.target.value }))} /></label>
    <TMFileInput label="CSV de la comparación" onParsed={(d, name) => { setData(d); setFile(name); setF((p) => ({ ...p, probes: d ? d.columns : [], reference: 'median' })); }} />
    {data && <fieldset className="aq-fieldset"><legend>Sondas comparadas</legend>
      {data.columns.map((c) => <label key={c} className="readiness-check"><input type="checkbox" checked={f.probes.includes(c)} onChange={() => toggle(c)} /> {c}</label>)}</fieldset>}
    {data && <label>Referencia<select value={f.reference} onChange={(e) => setF((p) => ({ ...p, reference: e.target.value }))}><option value="median">Mediana del grupo en cada instante</option>{f.probes.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>}
    {preview && <p role="status" data-testid="tm-offsets-preview">{TM_STATUS[preview.status]} · {tmFmt(preview.durationH, 1)} h · {preview.samples} instantes · {Object.entries(preview.probes).map(([c, o]) => `${c} ${tmFmt(o.offsetC, 3)} °C`).join(' · ')}{preview.reasons.length ? ' · ' + preview.reasons.join(' ') : ''}</p>}
  </AQForm>;
}

function TMMapForm({ records, submit }) {
  const offsetSets = records.filter((r) => r.kind === 'offsets');
  const [data, setData] = React.useState(null), [file, setFile] = React.useState('');
  const [f, setF] = React.useState({ id: `MAP-${records.filter((r) => r.kind === 'map').length + 1}`, unitId: '', testType: 'vacio', offsetSetId: offsetSets[offsetSets.length - 1]?.id || '', base: '', centro: '', tope: '', stabilization: '', notes: '' });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const elapsed = data?.timeKind === 'elapsed';
  const stabilizationMin = data ? (elapsed ? (f.stabilization === '' ? null : Number(String(f.stabilization).replace(',', '.'))) : SetasAutoclaveQualification.toAxisMinutes(f.stabilization, 'datetime')) : null;
  const offsetSet = offsetSets.find((r) => r.id === f.offsetSetId);
  const preview = React.useMemo(() => {
    try {
      if (!data || !f.base || !f.centro || !f.tope || stabilizationMin === null) return null;
      const positions = { base: f.base, centro: f.centro, tope: f.tope };
      const offsets = offsetSet ? Object.fromEntries(Object.entries(offsetSet.probes).map(([k, v]) => [k, v.offsetC])) : null;
      return SetasThermalMapping.evaluateMap(data, { positions, offsets, stabilizationMin });
    } catch (e) { return { status: 'insuficiente', reasons: [{ severity: 'insufficient', message: e.message }], metrics: null }; }
  }, [data, f.base, f.centro, f.tope, stabilizationMin, offsetSet]);
  const column = (k, label) => <label>{label}<select value={f[k]} onChange={set(k)}><option value="">Seleccionar</option>{(data?.columns || []).map((c) => <option key={c} value={c}>{c}{offsetSet && !offsetSet.probes[c] ? ' (sin offset)' : ''}</option>)}</select></label>;
  return <AQForm label="Ensayo de uniformidad" submitLabel="Guardar ensayo" onSubmit={() => {
    if (!data) throw Error('Cargar el CSV del ensayo.');
    submit((by, all) => SetasThermalMapping.createMapRecord(all, { id: f.id.trim(), unitId: f.unitId, testType: f.testType, offsetSetId: f.offsetSetId, data,
      positions: { base: f.base, centro: f.centro, tope: f.tope }, stabilizationMin, sourceFile: file, notes: f.notes }, { by }), `Ensayo ${f.id} guardado.`);
  }}>
    <p>Registrar cada 30–60 s durante 72 h. Cambiar una sola variable por ensayo (potencia o aislamiento, no ambas).</p>
    <label>ID del ensayo<input value={f.id} onChange={set('id')} /></label>
    <label>Caja o unidad ensayada<input value={f.unitId} onChange={set('unitId')} placeholder="p. ej. Estra-60x40-1" /></label>
    <label>Tipo de ensayo<select value={f.testType} onChange={set('testType')}>{Object.entries(SetasThermalMapping.TEST_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
    <label>Offsets aplicados<select value={f.offsetSetId} onChange={set('offsetSetId')}><option value="">{offsetSets.length ? 'Seleccionar' : 'Sin offsets registrados'}</option>{offsetSets.map((r) => <option key={r.id} value={r.id}>{r.id}{r.label ? ` · ${r.label}` : ''}</option>)}</select></label>
    <TMFileInput label="CSV del ensayo" onParsed={(d, name) => { setData(d); setFile(name); }} />
    {data && <div className="aq-row">{column('base', 'Sonda en la base')}{column('centro', 'Sonda en el centro')}{column('tope', 'Sonda en el tope')}</div>}
    {data && <label>Fin de la estabilización{elapsed ? ' (min)' : ''}<input type={elapsed ? 'text' : 'datetime-local'} inputMode={elapsed ? 'decimal' : undefined} value={f.stabilization} onChange={set('stabilization')} /></label>}
    <label>Observaciones (potencia, aislamiento, masa simulada)<textarea value={f.notes} onChange={set('notes')} /></label>
    {preview && <p role="status" data-testid="tm-map-preview">{TM_STATUS[preview.status]}{preview.metrics ? ` · ΔT ≤ ${tmFmt(preview.metrics.maxDeltaAllowedC, 1)} °C en ${tmFmt(preview.metrics.fraction * 100, 1)} % de ${preview.metrics.intervals} intervalos · p95 ${tmFmt(preview.metrics.p95DeltaC)} °C · máx. ${tmFmt(preview.metrics.maxDeltaC)} °C` : ''}{preview.reasons.length ? ' · ' + preview.reasons.map((r) => r.message).join(' ') : ''}</p>}
  </AQForm>;
}

function IncubationThermalPanel({ records, error, onSave }) {
  const [actor, setActor] = React.useState(() => { try { return sessionStorage.getItem('sdp_aq_actor') || ''; } catch { return ''; } });
  const [message, setMessage] = React.useState('');
  const submit = (build, done) => {
    if (error) throw Error(error);
    if (!actor.trim()) throw Error('Indicar arriba el responsable de los registros.');
    onSave((all) => build(actor.trim(), all));
    setMessage(done);
  };
  const units = React.useMemo(() => SetasThermalMapping.unitSummary(records), [records]);
  const maps = records.filter((r) => r.kind === 'map').map((r) => ({ record: r, evaluation: SetasThermalMapping.reevaluate(records, r) }));
  return <section id="incubation-thermal" className="production-readiness no-print" aria-labelledby="tm-title" data-testid="incubation-thermal">
    <header className="readiness-header"><div><span className="readiness-kicker">Commissioning · incubación modular</span><h2 id="tm-title">Mapa térmico de incubación</h2>
      <p>Offsets de sondas por co-ubicación y uniformidad base–centro–tope con datos de datalogger</p></div></header>
    <p className="readiness-boundary">Criterio provisional: ΔT ≤ {tmFmt(SetasThermalMapping.CRITERIA.maxDeltaC, 1)} °C en ≥ {SetasThermalMapping.CRITERIA.minFraction * 100} % de los intervalos tras estabilización (OAP-0001). Es un gate de uniformidad del prototipo pendiente de validación de campo, no un setpoint de cultivo. Cumplir vacío y carga simulada no autoriza la compra en volumen: faltan el ciclo biológico y los demás gates.</p>
    {error && <p role="alert">{error} No se puede registrar nada nuevo hasta recuperar estos datos.</p>}
    <label className="aq-actor">Responsable de los registros<input value={actor} onChange={(e) => { setActor(e.target.value); try { sessionStorage.setItem('sdp_aq_actor', e.target.value); } catch {} }} autoComplete="name" /></label>
    {message && <p role="status">{message}</p>}
    {units.length > 0 && <div className="readiness-grid">{units.map((u) => <article key={u.unitId} className={`readiness-card is-${TM_TONE[u.status] || 'unknown'}`} data-testid={`tm-unit-${u.unitId}`}>
      <div className="readiness-card-heading"><h3>{u.unitId}</h3><span className="readiness-status">{TM_STATUS[u.status]}</span></div>
      <p>{Object.entries(SetasThermalMapping.TEST_TYPES).map(([k, v]) => `${v}: ${u.tests[k] ? `${TM_STATUS[u.tests[k].status]} (${u.tests[k].id})` : 'sin ensayo'}`).join(' · ')}</p>
    </article>)}</div>}
    {records.filter((r) => r.kind === 'offsets').map((r) => <details key={r.id} className="aq-run-details"><summary>Offsets {r.id} · {tmFmt(r.durationH, 1)} h · referencia {r.reference === 'median' ? 'mediana del grupo' : r.reference}</summary>
      <div className="aq-table-wrap"><table className="inv-table"><caption>Offsets {r.id}{r.label ? ` · ${r.label}` : ''} · {r.by}</caption><thead><tr><th scope="col">Sonda</th><th scope="col">Offset (°C)</th><th scope="col">p05 (°C)</th><th scope="col">p95 (°C)</th><th scope="col">n</th></tr></thead>
        <tbody>{Object.entries(r.probes).map(([c, o]) => <tr key={c}><th scope="row">{c}</th><td>{tmFmt(o.offsetC, 3)}</td><td>{tmFmt(o.p05C, 3)}</td><td>{tmFmt(o.p95C, 3)}</td><td>{o.n}</td></tr>)}</tbody></table></div>
    </details>)}
    {maps.map(({ record: r, evaluation: e }) => <details key={r.id} className="aq-run-details" data-testid={`tm-map-${r.id}`}><summary>{r.id} · {r.unitId} · {SetasThermalMapping.TEST_TYPES[r.testType]} · {TM_STATUS[e.status]}</summary>
      <p>{e.metrics ? `ΔT ≤ ${tmFmt(e.metrics.maxDeltaAllowedC, 1)} °C en ${tmFmt(e.metrics.fraction * 100, 1)} % de ${e.metrics.intervals} intervalos (${tmFmt(e.metrics.afterStabilizationH, 1)} h tras estabilizar) · p95 ${tmFmt(e.metrics.p95DeltaC)} °C · máx. ${tmFmt(e.metrics.maxDeltaC)} °C (${e.metrics.worst.hot ?? '—'} vs ${e.metrics.worst.cold ?? '—'}) · ${e.metrics.missing} sin datos` : ''}</p>
      {e.reasons.length > 0 && <ul>{e.reasons.map((x, i) => <li key={i}>{x.message}</li>)}</ul>}
      <p className="readiness-record">Offsets {r.offsetSetId} · {r.by} · {r.sourceFile}{r.notes ? ` · ${r.notes}` : ''}</p>
    </details>)}
    <details><summary>Registrar comparación de sondas (offsets)</summary><TMOffsetsForm key={'o' + records.length} records={records} submit={submit} /></details>
    <details><summary>Registrar ensayo de uniformidad</summary><TMMapForm key={'m' + records.length} records={records} submit={submit} /></details>
    <p className="readiness-boundary">Registro local inmutable, incluido en el respaldo de ensayos. Aún no se sincroniza entre equipos.</p>
  </section>;
}
