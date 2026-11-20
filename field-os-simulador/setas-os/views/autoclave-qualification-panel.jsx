// Panel «Calificación del autoclave» (pestaña Producción, junto a Preparación
// para producción). Registra protocolo, configuraciones de carga, corridas PQ-1
// con datos de datalogger, indicadores y revisiones humanas de G1–G5.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito. No se carga solo.
//
// Reglas de presentación:
//   · los umbrales vienen del protocolo; los valores candidatos se rotulan como
//     propuesta del propietario, no como parámetros validados;
//   · una corrida pendiente no es una corrida aprobada; un guion es «pendiente»,
//     nunca «0» ni «cumple»;
//   · la app calcula y aplica el protocolo; solo un humano cierra compuertas.

const AQ_RUN_LABELS = { conforme: 'Conforme', no_conforme: 'No conforme', invalida: 'Inválida', pendiente: 'Pendiente' };
const AQ_SERIES_LABELS = { conforme: 'Serie conforme', en_curso: 'Serie en curso', no_go: 'No-Go', sin_corridas: 'Sin corridas' };
const AQ_TONE = { conforme: 'verified', cerrado: 'verified', released: 'verified', no_conforme: 'blocked', invalida: 'blocked', no_go: 'blocked', blocked: 'blocked' };
const AQ_PARAM_LABELS = {
  thermalTargetC: ['Objetivo térmico para t_lag', '°C'], maxGapMin: ['Hueco máximo de datos en la meseta', 'min'],
  tRefC: ['T de referencia de F₀', '°C'], zC: ['z', '°C'], f0TargetMin: ['Meta F₀ en el punto frío', 'min'],
  chamberMinC: ['Temperatura mínima de cámara en meseta', '°C'], maxAbsDeltaTC: ['|ΔT| máximo vapor saturado − cámara', '°C'],
  maxLagRangeMin: ['Rango máximo del retardo entre corridas', 'min'], runsRequired: ['Corridas consecutivas', ''],
  minProductProbes: ['Sondas de producto mínimas', ''], ciPerRun: ['Integradores químicos por corrida', ''],
  ibPerRun: ['IB procesados por corrida', ''], controlsPerRun: ['Controles positivos por corrida', ''],
  ibReadHours: ['Lectura de IB', 'h'], controlMaxHours: ['Control positivo legible antes de', 'h'],
};
const AQ_UNIT_STATE_LABELS = { limpia: 'Sin contaminación', contaminada: 'Contaminada', sin_salto: 'Sin salto micelial', salto: 'Salto micelial', sin_crecimiento: 'Sin crecimiento', con_crecimiento: 'Con crecimiento' };
const AQ_STUDY_LABELS = { conforme: 'Conforme', no_conforme: 'No conforme', invalida: 'Inválido', pendiente: 'En curso' };
const aqFmt = (v, d = 1) => (v === null || v === undefined || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(d).replace('.', ','));
const aqLocalToIso = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || '');
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + 5, +m[5])).toISOString() : null; // hora de Bogotá → UTC
};
const aqIsoToLocal = (iso) => {
  const ms = Date.parse(iso || '');
  return Number.isFinite(ms) ? new Date(ms - 5 * 3600000).toISOString().slice(0, 16) : '—';
};
const aqDateTime = (iso) => aqIsoToLocal(iso).replace('T', ' ');

function AQForm({ label, submitLabel, onSubmit, children }) {
  const [error, setError] = React.useState('');
  return <form className="readiness-evidence-form" aria-label={label} onSubmit={(event) => {
    event.preventDefault();
    try { onSubmit(); setError(''); } catch (e) { setError(e.message); }
  }}>
    {children}
    {error && <p role="alert">{error}</p>}
    <button type="submit" className="inv-btn inv-btn-sec">{submitLabel}</button>
  </form>;
}

function AQGateForm({ gate, configurations, studies, submit }) {
  const [f, setF] = React.useState({ status: 'cerrado', reference: '', notes: '', effective: '', calibrationCertificate: '', inspectionReport: '', configurationId: configurations[0]?.id || '', studyId: '', plannedBlocksPerWeek: '', alternativeValidation: '' });
  const studyKind = gate.id === 'G3' ? 'AB' : gate.id === 'G4' ? 'C' : null;
  const gateStudies = studyKind ? studies.filter((st) => st.kind === studyKind) : [];
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const details = gate.id === 'G1' ? { calibrationCertificate: f.calibrationCertificate, inspectionReport: f.inspectionReport }
    : gate.id === 'G2' ? { configurationId: f.configurationId }
    : studyKind ? { studyId: f.studyId }
    : gate.id === 'G5' ? { plannedBlocksPerWeek: f.plannedBlocksPerWeek === '' ? null : Number(f.plannedBlocksPerWeek), alternativeValidation: f.alternativeValidation } : {};
  return <AQForm label={`Revisión de ${gate.id}`} submitLabel={`Guardar revisión de ${gate.id}`} onSubmit={() => {
    const effectiveAt = f.effective ? aqLocalToIso(f.effective) : undefined;
    submit([{ type: 'gate.reviewed', payload: { gateId: gate.id, status: f.status, reference: f.reference, notes: f.notes, details, ...(effectiveAt ? { effectiveAt } : {}) } }], `Revisión de ${gate.id} guardada.`);
  }}>
    <label>Resultado<select value={f.status} onChange={set('status')}><option value="cerrado">Cerrada con evidencia</option><option value="abierto">Sigue o vuelve a quedar abierta</option></select></label>
    <label>Referencia de evidencia<input value={f.reference} onChange={set('reference')} placeholder="Informe, certificado, acta o URL" /></label>
    {gate.id === 'G1' && <>
      <label>Certificado de calibración del manómetro<input value={f.calibrationCertificate} onChange={set('calibrationCertificate')} placeholder="Error, incertidumbre y corrección en el rango" /></label>
      <label>Informe técnico de integridad del servicio competente<input value={f.inspectionReport} onChange={set('inspectionReport')} /></label>
    </>}
    {gate.id === 'G2' && <label>Configuración de carga calificada<select value={f.configurationId} onChange={set('configurationId')}>
      <option value="">Seleccionar</option>{configurations.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}</select></label>}
    {studyKind && <label>Estudio PQ-2 conforme<select value={f.studyId} onChange={set('studyId')}>
      <option value="">{gateStudies.length ? 'Seleccionar' : 'Sin estudios registrados'}</option>{gateStudies.map((st) => <option key={st.id} value={st.id}>{st.id} · {AQ_STUDY_LABELS[st.evaluation.status]}</option>)}</select></label>}
    {gate.id === 'G5' && <>
      <label>Bloques por semana planificados<input type="number" min="0" step="1" value={f.plannedBlocksPerWeek} onChange={set('plannedBlocksPerWeek')} /></label>
      <label>Validación de alternativa de mayor volumen (si supera {SetasAutoclaveQualification.G5_BLOCKS_PER_WEEK_LIMIT}/semana)<input value={f.alternativeValidation} onChange={set('alternativeValidation')} /></label>
    </>}
    <label>Fecha en que se concluyó la evidencia (opcional, hora de Tenjo)<input type="datetime-local" value={f.effective} onChange={set('effective')} /></label>
    <label>Observaciones / motivo<textarea value={f.notes} onChange={set('notes')} /></label>
  </AQForm>;
}

function AQProtocolForm({ submit }) {
  const C = SetasAutoclaveQualification.CANDIDATE_PROTOCOL;
  const [f, setF] = React.useState(() => ({ protocolId: 'PQ1-1941X-v1', title: 'PQ-1 · penetración térmica 1941X', basis: '',
    params: Object.fromEntries(Object.keys(C).map((k) => [k, C[k] === null ? '' : String(C[k])])) }));
  const setParam = (k) => (e) => setF((p) => ({ ...p, params: { ...p.params, [k]: e.target.value } }));
  return <AQForm label="Borrador de protocolo PQ-1" submitLabel="Guardar borrador del protocolo" onSubmit={() => {
    const params = Object.fromEntries(Object.entries(f.params).map(([k, v]) => [k, v === '' ? null : Number(String(v).replace(',', '.'))]));
    submit([{ type: 'protocol.drafted', payload: { protocolId: f.protocolId.trim(), title: f.title, params, microbiologicalBasis: f.basis } }], `Borrador ${f.protocolId} guardado. Aún no cuenta: falta aprobarlo.`);
  }}>
    <p>Valores precargados: {SetasAutoclaveQualification.CANDIDATE_ORIGIN} El objetivo térmico y el hueco máximo no tienen valor candidato: se declaran aquí.</p>
    <label>ID y versión del protocolo<input value={f.protocolId} onChange={(e) => setF((p) => ({ ...p, protocolId: e.target.value }))} /></label>
    <label>Título<input value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} /></label>
    <div className="aq-param-grid">{Object.keys(C).map((k) => <label key={k}>{AQ_PARAM_LABELS[k][0]}{AQ_PARAM_LABELS[k][1] ? ` (${AQ_PARAM_LABELS[k][1]})` : ''}
      <input inputMode="decimal" value={f.params[k]} onChange={setParam(k)} /></label>)}</div>
    <label>Fundamento microbiológico (organismo objetivo, resistencia, T_ref, z, carga inicial, reducción requerida)<textarea value={f.basis} onChange={(e) => setF((p) => ({ ...p, basis: e.target.value }))} /></label>
  </AQForm>;
}

function AQApproveForm({ protocol, submit }) {
  const [reference, setReference] = React.useState(''), [effective, setEffective] = React.useState('');
  return <AQForm label={`Aprobar ${protocol.id}`} submitLabel={`Aprobar ${protocol.id}`} onSubmit={() => {
    const effectiveAt = effective ? aqLocalToIso(effective) : undefined;
    submit([{ type: 'protocol.approved', payload: { protocolId: protocol.id, reference, ...(effectiveAt ? { effectiveAt } : {}) } }], `${protocol.id} aprobado. Las corridas ejecutadas antes de esta fecha no cuentan.`);
  }}>
    <p>Aprobar fija estos criterios antes de ejecutar. Un cambio posterior requiere un protocolo nuevo.</p>
    <label>Referencia de la aprobación<input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Acta, documento firmado" /></label>
    <label>Fecha efectiva de aprobación (opcional)<input type="datetime-local" value={effective} onChange={(e) => setEffective(e.target.value)} /></label>
  </AQForm>;
}

function AQConfigurationForm({ submit, plannedLoad }) {
  const [f, setF] = React.useState(() => ({ configurationId: '', equipmentId: 'All American 1941X', bagCount: plannedLoad?.bags ?? '', wetMassPerBagKg: plannedLoad?.kgPerBag ?? '', bagType: '', recipeVersion: plannedLoad?.recipeRevision || '', loadArrangement: '', heatSource: 'Estufa a propano', notes: '' }));
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return <AQForm label="Nueva configuración de carga" submitLabel="Registrar configuración" onSubmit={() => {
    submit([{ type: 'configuration.defined', payload: { ...f, configurationId: f.configurationId.trim(), bagCount: Number(f.bagCount), wetMassPerBagKg: Number(String(f.wetMassPerBagKg).replace(',', '.')) } }], `Configuración ${f.configurationId} registrada. Es inmutable: un cambio de carga es otra configuración.`);
  }}>
    <label>ID de configuración<input value={f.configurationId} onChange={set('configurationId')} placeholder="p. ej. CFG-4x2.5-rejilla" /></label>
    <label>Equipo<input value={f.equipmentId} onChange={set('equipmentId')} /></label>
    <label>Bolsas por corrida<input type="number" min="1" step="1" value={f.bagCount} onChange={set('bagCount')} /></label>
    <label>Masa húmeda por bolsa (kg)<input inputMode="decimal" value={f.wetMassPerBagKg} onChange={set('wetMassPerBagKg')} /></label>
    <label>Bolsa y filtro<input value={f.bagType} onChange={set('bagType')} /></label>
    <label>Versión de receta<input value={f.recipeVersion} onChange={set('recipeVersion')} /></label>
    <label>Arreglo de carga (posiciones, rejilla, orientación, ubicación de sondas)<textarea value={f.loadArrangement} onChange={set('loadArrangement')} /></label>
    <label>Fuente de calor<input value={f.heatSource} onChange={set('heatSource')} /></label>
  </AQForm>;
}

function AQRunForm({ configurations, protocols, runCount, submit }) {
  const [f, setF] = React.useState(() => ({ runId: `PQ1-R${runCount + 1}`, configurationId: configurations[0]?.id || '', protocolId: protocols[0]?.id || '', executedAt: '', operator: '', ambientPressureKpa: '', pressureUnit: 'psig', gaugeCorrection: '', plateauStart: '', plateauEnd: '' }));
  const [parsed, setParsed] = React.useState(null), [fileName, setFileName] = React.useState(''), [fileError, setFileError] = React.useState('');
  const [mapping, setMapping] = React.useState({ chamber: '', pressure: '', products: [] });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const load = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const data = SetasAutoclaveQualification.parseLoggerCsv(await file.text());
      setParsed(data); setFileName(file.name); setFileError('');
      const guess = (re) => data.columns.find((c) => re.test(c)) || '';
      const pressure = guess(/^p|psi|pres|kpa/i), chamber = guess(/dl-?1|c[aá]mara|chamber/i);
      setMapping({ chamber, pressure, products: data.columns.filter((c) => c !== chamber && c !== pressure && /dl|prod|sonda|core|n[uú]cleo/i.test(c)) });
    } catch (e) { setParsed(null); setFileError(e.message); }
  };
  const toggleProduct = (c) => setMapping((m) => ({ ...m, products: m.products.includes(c) ? m.products.filter((x) => x !== c) : [...m.products, c] }));
  const elapsed = parsed?.timeKind === 'elapsed';
  return <AQForm label="Registrar corrida PQ-1" submitLabel="Registrar corrida y datos" onSubmit={() => {
    if (!parsed) throw Error(fileError || 'Cargar el archivo CSV del datalogger.');
    const executedAt = aqLocalToIso(f.executedAt);
    if (!executedAt) throw Error('Indicar fecha y hora de la corrida.');
    const plateau = { kind: parsed.timeKind, start: elapsed ? Number(String(f.plateauStart).replace(',', '.')) : f.plateauStart, end: elapsed ? Number(String(f.plateauEnd).replace(',', '.')) : f.plateauEnd };
    submit([
      { type: 'run.registered', payload: { runId: f.runId.trim(), configurationId: f.configurationId, protocolId: f.protocolId, executedAt, operator: f.operator,
        ambientPressureKpa: f.ambientPressureKpa === '' ? null : Number(String(f.ambientPressureKpa).replace(',', '.')), pressureUnit: f.pressureUnit,
        gaugeCorrection: f.gaugeCorrection === '' ? null : Number(String(f.gaugeCorrection).replace(',', '.')), plateau } },
      { type: 'run.data_imported', payload: { runId: f.runId.trim(), fileName, data: { timeKind: parsed.timeKind, t: parsed.t, values: parsed.values, columns: parsed.columns }, mapping } },
    ], `Corrida ${f.runId} registrada con ${parsed.rows} lecturas. Falta registrar indicadores.`);
  }}>
    <p>Declarar la meseta según la bitácora de la corrida, antes de mirar los resultados. Redefinirla después de cargar los datos invalida la corrida.</p>
    <label>ID de la corrida<input value={f.runId} onChange={set('runId')} /></label>
    <label>Configuración de carga<select value={f.configurationId} onChange={set('configurationId')}><option value="">Seleccionar</option>{configurations.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.bagCount} × {c.wetMassPerBagKg} kg</option>)}</select></label>
    <label>Protocolo<select value={f.protocolId} onChange={set('protocolId')}><option value="">Seleccionar</option>{protocols.map((p) => <option key={p.id} value={p.id}>{p.id}{p.approval ? '' : ' (borrador)'}</option>)}</select></label>
    <label>Fecha y hora de inicio (hora de Tenjo)<input type="datetime-local" value={f.executedAt} onChange={set('executedAt')} /></label>
    <label>Operador<input value={f.operator} onChange={set('operator')} /></label>
    <label>Presión ambiente absoluta medida (kPa)<input inputMode="decimal" value={f.ambientPressureKpa} onChange={set('ambientPressureKpa')} placeholder="Barómetro del día; no la nominal" /></label>
    <label>Unidad del manómetro<select value={f.pressureUnit} onChange={set('pressureUnit')}><option value="psig">psig</option><option value="kPa">kPa manométricos</option></select></label>
    <label>Corrección del manómetro según certificado (misma unidad)<input inputMode="decimal" value={f.gaugeCorrection} onChange={set('gaugeCorrection')} placeholder="0 si el certificado no indica corrección" /></label>
    <label>Archivo CSV del datalogger<input type="file" accept=".csv,.txt,text/csv" onChange={load} /></label>
    <p className="readiness-record">Formato: una columna de tiempo (fecha-hora, o t_min / t_s) y una columna por sonda, p. ej. <code>timestamp,DL1,DL2,DL3,P_psig</code>. Acepta «;» con coma decimal.</p>
    {fileError && <p role="alert">{fileError}</p>}
    {parsed && <>
      <p role="status">{fileName}: {parsed.rows} lecturas · tiempo {elapsed ? 'transcurrido (min)' : 'fecha-hora'} · columnas {parsed.columns.join(', ')}{parsed.warnings.length ? ' · ' + parsed.warnings.join(' ') : ''}</p>
      <label>Columna de cámara (DL-1)<select value={mapping.chamber} onChange={(e) => setMapping((m) => ({ ...m, chamber: e.target.value }))}><option value="">Seleccionar</option>{parsed.columns.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
      <label>Columna de presión<select value={mapping.pressure} onChange={(e) => setMapping((m) => ({ ...m, pressure: e.target.value }))}><option value="">Seleccionar</option>{parsed.columns.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
      <fieldset className="aq-fieldset"><legend>Sondas de producto (núcleo de bolsas)</legend>
        {parsed.columns.filter((c) => c !== mapping.chamber && c !== mapping.pressure).map((c) => <label key={c} className="readiness-check"><input type="checkbox" checked={mapping.products.includes(c)} onChange={() => toggleProduct(c)} /> {c}</label>)}
      </fieldset>
      <label>Inicio de meseta{elapsed ? ' (min)' : ''}<input type={elapsed ? 'text' : 'datetime-local'} inputMode={elapsed ? 'decimal' : undefined} value={f.plateauStart} onChange={set('plateauStart')} /></label>
      <label>Fin de meseta{elapsed ? ' (min)' : ''}<input type={elapsed ? 'text' : 'datetime-local'} inputMode={elapsed ? 'decimal' : undefined} value={f.plateauEnd} onChange={set('plateauEnd')} /></label>
    </>}
  </AQForm>;
}

function AQIndicatorsForm({ run, protocol, submit }) {
  const p = protocol?.params || SetasAutoclaveQualification.CANDIDATE_PROTOCOL;
  const prev = run.indicators;
  const rows = (list, n, make) => Array.from({ length: n }, (_, i) => ({ ...make(i), ...(list?.[i] || {}) }));
  const ibPos = ['B1', 'B3', 'B2']; // IB-1→B1, IB-2→B3, IB-3→B2 (ficha PQ-1)
  const [ci, setCi] = React.useState(() => rows(prev?.ci, p.ciPerRun, (i) => ({ position: `B${i + 1}`, result: 'pending' })));
  const [ib, setIb] = React.useState(() => rows(prev?.ib, p.ibPerRun, (i) => ({ position: ibPos[i] || `B${i + 1}`, result: 'pendiente', readHours: '' })));
  const [controls, setControls] = React.useState(() => rows(prev?.controls, p.controlsPerRun, () => ({ position: 'Incubadora', result: 'pendiente', firstPositiveHours: '' })));
  const [lots, setLots] = React.useState(() => prev?.lots || { ci: { lot: '', expiry: '', ifu: '' }, ib: { lot: '', expiry: '', ifu: '' } });
  const edit = (setter, i, k) => (e) => setter((list) => list.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)));
  const lot = (k, field) => (e) => setLots((l) => ({ ...l, [k]: { ...l[k], [field]: e.target.value } }));
  const n = (v) => (v === '' || v === null || v === undefined ? null : Number(String(v).replace(',', '.')));
  return <AQForm label={`Indicadores de ${run.id}`} submitLabel={`Guardar indicadores de ${run.id}`} onSubmit={() => submit([{ type: 'run.indicators_recorded', payload: { runId: run.id, indicators: {
    ci, ib: ib.map((x) => ({ ...x, readHours: n(x.readHours) })), controls: controls.map((x) => ({ ...x, firstPositiveHours: n(x.firstPositiveHours) })), lots } } }], `Indicadores de ${run.id} guardados.`)}>
    <fieldset className="aq-fieldset"><legend>Integradores químicos Clase 5</legend>
      {ci.map((x, i) => <div className="aq-row" key={'ci' + i}>
        <label>Posición CI {i + 1}<input value={x.position} onChange={edit(setCi, i, 'position')} /></label>
        <label>Resultado CI {i + 1}<select value={x.result} onChange={edit(setCi, i, 'result')}><option value="pending">Sin leer</option><option value="pass">Viró conforme a IFU</option><option value="fail">No viró</option></select></label>
      </div>)}
      <div className="aq-row"><label>Lote CI<input value={lots.ci.lot} onChange={lot('ci', 'lot')} /></label><label>Caducidad CI<input type="date" value={lots.ci.expiry} onChange={lot('ci', 'expiry')} /></label><label>IFU CI<input value={lots.ci.ifu} onChange={lot('ci', 'ifu')} /></label></div>
    </fieldset>
    <fieldset className="aq-fieldset"><legend>Indicadores biológicos procesados (<i>G. stearothermophilus</i>)</legend>
      {ib.map((x, i) => <div className="aq-row" key={'ib' + i}>
        <label>Posición IB-{i + 1}<input value={x.position} onChange={edit(setIb, i, 'position')} /></label>
        <label>Resultado IB-{i + 1}<select value={x.result} onChange={edit(setIb, i, 'result')}><option value="pendiente">Pendiente</option><option value="negativo">Negativo (sin crecimiento)</option><option value="positivo">Positivo (crecimiento)</option></select></label>
        <label>Horas de lectura IB-{i + 1}<input inputMode="decimal" value={x.readHours ?? ''} onChange={edit(setIb, i, 'readHours')} /></label>
      </div>)}
      {controls.map((x, i) => <div className="aq-row" key={'ctl' + i}>
        <label>Control positivo {i + 1} · ubicación<input value={x.position} onChange={edit(setControls, i, 'position')} /></label>
        <label>Resultado del control {i + 1}<select value={x.result} onChange={edit(setControls, i, 'result')}><option value="pendiente">Pendiente</option><option value="positivo">Positivo</option><option value="negativo">Sin crecimiento</option></select></label>
        <label>Horas hasta la primera lectura positiva<input inputMode="decimal" value={x.firstPositiveHours ?? ''} onChange={edit(setControls, i, 'firstPositiveHours')} /></label>
      </div>)}
      <div className="aq-row"><label>Lote IB<input value={lots.ib.lot} onChange={lot('ib', 'lot')} /></label><label>Caducidad IB<input type="date" value={lots.ib.expiry} onChange={lot('ib', 'expiry')} /></label><label>IFU IB<input value={lots.ib.ifu} onChange={lot('ib', 'ifu')} /></label></div>
    </fieldset>
  </AQForm>;
}

function AQDeviationForm({ run, submit }) {
  const count = Object.keys(run.deviations).length;
  const [f, setF] = React.useState({ deviationId: `DV-${count + 1}`, description: '', status: 'abierta', resolution: '' });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return <AQForm label={`Desviación de ${run.id}`} submitLabel="Guardar desviación" onSubmit={() => submit([{ type: 'run.deviation_recorded', payload: { runId: run.id, ...f } }], `Desviación ${f.deviationId} guardada.`)}>
    <label>ID (usar uno existente para actualizarla)<input value={f.deviationId} onChange={set('deviationId')} /></label>
    <label>Descripción<textarea value={f.description} onChange={set('description')} /></label>
    <label>Estado<select value={f.status} onChange={set('status')}><option value="abierta">Abierta</option><option value="cerrada">Cerrada con resolución</option></select></label>
    <label>Resolución<textarea value={f.resolution} onChange={set('resolution')} /></label>
  </AQForm>;
}

function AQStudyForm({ configurations, submit }) {
  const C = SetasAutoclaveQualification.PQ2_CANDIDATE;
  const [f, setF] = React.useState({ kind: 'AB', studyId: '', startedAt: '', incubationTempC: String(C.incubationTempC), tempToleranceC: '', readingIntervalDays: '', observationDays: '',
    nPerGroup: '', configurationId: configurations[0]?.id || '', thermalRunRef: '', spawnLot: '', medium: 'PDA', plates: '', blanks: '1', maxJumpDays: String(C.maxJumpDays) });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const n = (v) => (v === '' ? null : Number(String(v).replace(',', '.')));
  const ab = f.kind === 'AB';
  return <AQForm label="Nuevo estudio PQ-2" submitLabel="Registrar estudio" onSubmit={() => {
    const common = { studyId: f.studyId.trim(), kind: f.kind, startedAt: aqLocalToIso(f.startedAt), incubationTempC: n(f.incubationTempC), tempToleranceC: n(f.tempToleranceC), readingIntervalDays: n(f.readingIntervalDays), observationDays: n(f.observationDays) };
    const payload = ab ? { ...common, nPerGroup: n(f.nPerGroup), configurationId: f.configurationId, thermalRunRef: f.thermalRunRef }
      : { ...common, spawnLot: f.spawnLot, medium: f.medium, plates: n(f.plates), blanks: n(f.blanks), maxJumpDays: n(f.maxJumpDays) };
    submit([{ type: 'pq2.defined', payload }], `Estudio ${f.studyId} registrado. Sus condiciones quedan fijas.`);
  }}>
    <p>Fijar n, duración, tolerancia térmica y frecuencia de lectura antes de empezar: no se cambian después. Los controles se dimensionan aparte de las bolsas productivas. Valores precargados: propuesta del propietario (2026-11-03), sin validar.</p>
    <label>Tipo de estudio<select value={f.kind} onChange={set('kind')}><option value="AB">A/B · sustrato procesado sin spawn (G3)</option><option value="C">C · placas del lote de spawn y blancos (G4)</option></select></label>
    <label>ID del estudio<input value={f.studyId} onChange={set('studyId')} placeholder={ab ? 'p. ej. PQ2-AB-1' : 'p. ej. PQ2-C-1'} /></label>
    <label>Inicio (hora de Tenjo)<input type="datetime-local" value={f.startedAt} onChange={set('startedAt')} /></label>
    {ab ? <>
      <label>n por grupo (A y B)<input type="number" min="1" step="1" value={f.nPerGroup} onChange={set('nPerGroup')} /></label>
      <label>Configuración de carga procesada<select value={f.configurationId} onChange={set('configurationId')}><option value="">Seleccionar</option>{configurations.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}</select></label>
      <label>Corrida térmica que procesó los controles<input value={f.thermalRunRef} onChange={set('thermalRunRef')} /></label>
      <label>Duración fijada ({C.observationDaysMin}–{C.observationDaysMax} días)<input inputMode="decimal" value={f.observationDays} onChange={set('observationDays')} /></label>
    </> : <>
      <label>Lote de spawn<input value={f.spawnLot} onChange={set('spawnLot')} /></label>
      <label>Medio<input value={f.medium} onChange={set('medium')} /></label>
      <label>Placas con spawn<input type="number" min="1" step="1" value={f.plates} onChange={set('plates')} /></label>
      <label>Blancos sin spawn<input type="number" min="1" step="1" value={f.blanks} onChange={set('blanks')} /></label>
      <label>Límite de salto micelial (días, debe ocurrir antes)<input inputMode="decimal" value={f.maxJumpDays} onChange={set('maxJumpDays')} /></label>
      <label>Duración de observación (días)<input inputMode="decimal" value={f.observationDays} onChange={set('observationDays')} /></label>
    </>}
    <label>Temperatura de incubación (°C)<input inputMode="decimal" value={f.incubationTempC} onChange={set('incubationTempC')} /></label>
    <label>Tolerancia térmica (± °C)<input inputMode="decimal" value={f.tempToleranceC} onChange={set('tempToleranceC')} /></label>
    <label>Días máximos entre lecturas<input inputMode="decimal" value={f.readingIntervalDays} onChange={set('readingIntervalDays')} /></label>
  </AQForm>;
}

function AQReadingForm({ study, submit }) {
  const states = SetasAutoclaveQualification.PQ2_STATES;
  const last = study.readings[study.readings.length - 1];
  const [f, setF] = React.useState(() => ({ readAt: '', tempC: '', notes: '', units: Object.fromEntries(study.units.map((u) => [u, last?.units[u] || states[u[0]][0]])) }));
  return <AQForm label={`Lectura de ${study.id}`} submitLabel={`Guardar lectura de ${study.id}`} onSubmit={() => submit([{ type: 'pq2.reading', payload: {
    studyId: study.id, readAt: aqLocalToIso(f.readAt), tempC: f.tempC === '' ? null : Number(String(f.tempC).replace(',', '.')), notes: f.notes, units: f.units } }], `Lectura de ${study.id} guardada.`)}>
    <div className="aq-row">
      <label>Fecha y hora de la lectura<input type="datetime-local" value={f.readAt} onChange={(e) => setF((p) => ({ ...p, readAt: e.target.value }))} /></label>
      <label>Temperatura de incubación medida (°C)<input inputMode="decimal" value={f.tempC} onChange={(e) => setF((p) => ({ ...p, tempC: e.target.value }))} /></label>
    </div>
    <div className="aq-row">{study.units.map((u) => <label key={u}>Estado de {u}<select value={f.units[u]} onChange={(e) => setF((p) => ({ ...p, units: { ...p.units, [u]: e.target.value } }))}>
      {states[u[0]].map((st) => <option key={st} value={st}>{AQ_UNIT_STATE_LABELS[st]}</option>)}</select></label>)}</div>
    <label>Observaciones<textarea value={f.notes} onChange={(e) => setF((p) => ({ ...p, notes: e.target.value }))} /></label>
  </AQForm>;
}

function AQRunDetails({ evaluation, run, protocol, submit }) {
  const m = evaluation.metrics;
  return <details className="aq-run-details">
    <summary>Detalle de {run.id} · {AQ_RUN_LABELS[evaluation.status]}</summary>
    {evaluation.reasons.length ? <ul>{evaluation.reasons.map((r, i) => <li key={i}><strong>{r.severity === 'invalid' ? 'Inválida' : r.severity === 'fail' ? 'No cumple' : 'Pendiente'}:</strong> {r.message}</li>)}</ul> : <p>Todos los criterios del protocolo se cumplen en esta corrida.</p>}
    <p className="readiness-record">Operador {run.operator} · P ambiente {aqFmt(run.ambientPressureKpa, 2)} kPa · corrección {aqFmt(run.gaugeCorrection, 2)} {run.pressureUnit} · meseta {m.plateau ? `${aqFmt(m.plateau.durationMin)} min` : '—'} · cargas de datos {run.imports.length}</p>
    {Object.keys(m.coverage).length > 0 && <p className="readiness-record">Cobertura en meseta: {Object.entries(m.coverage).map(([id, c]) => `${c.label} ${c.samples} lecturas, hueco máx. ${aqFmt(c.maxGapMin, 2)} min`).join(' · ')}</p>}
    {m.f0 && <p className="readiness-record">F₀ (T_ref {aqFmt(m.f0.tRefC)} °C, z {aqFmt(m.f0.zC)} °C) por sonda: {Object.entries(m.f0.probes).map(([id, x]) => `${id} ${aqFmt(x.totalMin, 2)} min`).join(' · ')} · punto más frío {m.f0.coldProbe}</p>}
    {m.lag && <p className="readiness-record">t_lag hacia {aqFmt(m.lag.targetC)} °C: {Object.entries(m.lag.probes).map(([id, x]) => `${id} ${aqFmt(x.lagMin)} min`).join(' · ')}</p>}
    <AQIndicatorsForm run={run} protocol={protocol} submit={submit} />
    <AQDeviationForm run={run} submit={submit} />
  </details>;
}

function AutoclaveQualificationPanel({ events, error, onAppend, nowMs, plannedLoad }) {
  const summary = React.useMemo(() => SetasAutoclaveQualification.summarize(events, nowMs), [events, nowMs]);
  const [actor, setActor] = React.useState(() => { try { return sessionStorage.getItem('sdp_aq_actor') || ''; } catch { return ''; } });
  const [message, setMessage] = React.useState('');
  const submit = (drafts, done) => {
    if (error) throw Error(error);
    if (!actor.trim()) throw Error('Indicar arriba el responsable de los registros.');
    onAppend(drafts.map((d) => ({ ...d, by: actor.trim() })));
    setMessage(done);
  };
  const setActorValue = (v) => { setActor(v); try { sessionStorage.setItem('sdp_aq_actor', v); } catch {} };
  const { state, gates, configurations, protocols, studies, next } = summary;
  const qualified = configurations.filter((c) => c.series.status === 'conforme');
  const releasable = !next && qualified.length > 0;
  const exportJournal = () => {
    const report = { schema: 'setas.autoclave-qualification-report.v1', generatedAt: new Date().toISOString(), events,
      gates: gates.map(({ history, ...g }) => g), series: configurations.map((c) => ({ configurationId: c.id, ...c.series })),
      studies: studies.map((st) => ({ studyId: st.id, kind: st.kind, ...st.evaluation })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'calificacion-autoclave-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section id="autoclave-qualification" className="production-readiness no-print" aria-labelledby="aq-title" data-testid="autoclave-qualification" tabIndex={-1}>
    <header className="readiness-header"><div><span className="readiness-kicker">Commissioning · matriz Go / No-Go</span><h2 id="aq-title">Calificación del autoclave</h2>
      <p>All American 1941X · corridas PQ-1 con datos de datalogger y compuertas G1–G5</p></div>
      <button type="button" className="inv-btn inv-btn-sec" onClick={exportJournal}>Exportar registro</button></header>
    <div className={`readiness-summary is-${releasable ? 'verified' : 'unknown'}`} role="status" aria-live="polite" aria-atomic="true" data-testid="aq-summary">
      <strong>{releasable ? `Ciclo calificado para ${qualified.map((c) => c.id).join(', ')} · no autoriza producción comercial` : `No-Go · siguiente compuerta: ${next ? `${next.id} ${next.label}` : 'serie PQ-1 conforme'}`}</strong>
      <span>{gates.filter((g) => g.status === 'cerrado').length} de {gates.length} compuertas cerradas · {protocols.filter((p) => p.approval).length} protocolo(s) aprobado(s) · {Object.keys(state.runs).length} corrida(s)</span>
    </div>
    <p className="readiness-boundary">La app evalúa los datos medidos contra el protocolo aprobado; no aprueba ciclos. Los umbrales precargados son la propuesta del propietario (2026-11-03), no parámetros validados. El simulador de autoclave del Perito es un modelo y nunca cuenta como corrida.</p>
    {error && <p role="alert">{error} No se puede registrar nada nuevo hasta recuperar estos datos.</p>}
    <label className="aq-actor">Responsable de los registros<input value={actor} onChange={(e) => setActorValue(e.target.value)} autoComplete="name" /></label>
    {message && <p role="status">{message}</p>}

    <h3 className="aq-section-title">Compuertas G1–G5</h3>
    <div className="readiness-grid">{gates.map((g) => <article key={g.id} className={`readiness-card is-${AQ_TONE[g.status] || 'unknown'}`} data-testid={`aq-gate-${g.id}`}>
      <div className="readiness-card-heading"><h3>{g.id} · {g.label}</h3><span className="readiness-status">{g.status === 'cerrado' ? 'Cerrada' : 'Abierta'}</span></div>
      <p>{g.review ? `${g.review.status === 'cerrado' ? 'Cerrada' : 'Abierta'} por ${g.review.by} · ${aqDateTime(g.review.effectiveAt)} · ${g.review.reference || g.review.notes}` : g.requiredForRelease ? 'Sin revisión: bloquea la inoculación productiva.' : 'Gobierna escala y capital comercial; no bloquea el piloto.'}</p>
      <details><summary>Registrar revisión de {g.id}</summary><AQGateForm gate={g} configurations={configurations} studies={studies} submit={submit} /></details>
    </article>)}</div>

    <h3 className="aq-section-title">Protocolo PQ-1</h3>
    {protocols.length === 0 && <p>Sin protocolo. Las corridas se evalúan solo contra un protocolo aprobado antes de ejecutarlas.</p>}
    {protocols.map((p) => <article key={p.id} className={`readiness-card is-${p.approval ? 'verified' : 'unknown'}`} data-testid={`aq-protocol-${p.id}`}>
      <div className="readiness-card-heading"><h3>{p.id} · {p.title}</h3><span className="readiness-status">{p.approval ? 'Aprobado' : 'Borrador'}</span></div>
      <p>{p.approval ? `Aprobado por ${p.approval.by} · ${aqDateTime(p.approval.effectiveAt)} · ${p.approval.reference}` : 'Borrador: sus criterios aún no cuentan.'}</p>
      <div className="aq-table-wrap"><table className="inv-table"><caption>Criterios del protocolo {p.id}</caption><tbody>
        {Object.keys(AQ_PARAM_LABELS).map((k) => <tr key={k}><th scope="row">{AQ_PARAM_LABELS[k][0]}</th><td>{aqFmt(p.params[k], Number.isInteger(p.params[k]) ? 0 : 1)} {AQ_PARAM_LABELS[k][1]}</td></tr>)}
      </tbody></table></div>
      {!p.approval && <details><summary>Aprobar {p.id}</summary><AQApproveForm protocol={p} submit={submit} /></details>}
    </article>)}
    <details><summary>Nuevo protocolo o versión</summary><AQProtocolForm submit={submit} /></details>

    <h3 className="aq-section-title">Configuraciones de carga y series</h3>
    {configurations.length === 0 && <p>Sin configuraciones. Cada carga (bolsas, masa, arreglo, fuente de calor) se califica por separado.</p>}
    {configurations.map((c) => <article key={c.id} className={`readiness-card is-${AQ_TONE[c.series.status] || 'unknown'}`} data-testid={`aq-config-${c.id}`}>
      <div className="readiness-card-heading"><h3>{c.id} · {c.bagCount} × {aqFmt(c.wetMassPerBagKg, 2)} kg</h3><span className="readiness-status">{AQ_SERIES_LABELS[c.series.status]}</span></div>
      <p>{c.series.reasons.join(' ')} {c.series.lagRangeMin !== null ? `Rango de t_lag máx.: ${aqFmt(c.series.lagRangeMin)} min.` : ''}</p>
      <p className="readiness-record">{c.equipmentId} · {c.heatSource} · {c.loadArrangement}</p>
      {c.series.evaluations.length > 0 && <div className="aq-table-wrap"><table className="inv-table"><caption>Corridas de {c.id}</caption>
        <thead><tr><th scope="col">Corrida</th><th scope="col">Inicio</th><th scope="col">Estado</th><th scope="col">F₀ punto frío (min)</th><th scope="col">Cruce F₀ (min de meseta)</th><th scope="col">t_lag máx. (min)</th><th scope="col">|ΔT| máx. (°C)</th><th scope="col">T cámara mín. (°C)</th><th scope="col">CI / IB / control</th></tr></thead>
        <tbody>{c.series.evaluations.map((e) => { const m = e.metrics, i = m.indicators; return <tr key={e.runId} data-testid={`aq-run-${e.runId}`}>
          <th scope="row">{e.runId}</th><td>{aqDateTime(e.executedAt)}</td><td>{AQ_RUN_LABELS[e.status]}</td>
          <td>{aqFmt(m.f0?.minTotalMin, 2)}</td><td>{aqFmt(m.f0?.crossAtMin)}</td><td>{aqFmt(m.lag?.maxLagMin)}</td><td>{aqFmt(m.deltaT?.maxAbsC, 2)}</td><td>{aqFmt(m.chamber?.minC, 2)}</td>
          <td>{i ? `${i.ci.pass}/${i.ci.required} · ${i.ib.negative}/${i.ib.required} · ${i.controls.positive}/${i.controls.required}` : '—'}</td>
        </tr>; })}</tbody></table></div>}
      {c.series.evaluations.map((e) => <AQRunDetails key={e.runId} evaluation={e} run={state.runs[e.runId]} protocol={state.protocols[e.protocolId]} submit={submit} />)}
    </article>)}
    <details><summary>Nueva configuración de carga</summary><AQConfigurationForm submit={submit} plannedLoad={plannedLoad} /></details>
    <details><summary>Registrar corrida PQ-1</summary>{configurations.length && protocols.length
      ? <AQRunForm configurations={configurations} protocols={protocols} runCount={Object.keys(state.runs).length} submit={submit} />
      : <p>Registrar primero un protocolo y una configuración de carga.</p>}</details>
    <h3 className="aq-section-title">Controles PQ-2 (G3 y G4)</h3>
    {studies.length === 0 && <p>Sin estudios. G3 se cierra con controles A/B conformes y G4 con placas C del lote de spawn conformes.</p>}
    {studies.map((st) => { const e = st.evaluation, m = e.metrics; return <article key={st.id} className={`readiness-card is-${AQ_TONE[e.status] || 'unknown'}`} data-testid={`aq-study-${st.id}`}>
      <div className="readiness-card-heading"><h3>{st.id} · {st.kind === 'AB' ? `controles A/B · ${st.nPerGroup} por grupo` : `placas C · spawn ${st.spawnLot}`}</h3><span className="readiness-status">{AQ_STUDY_LABELS[e.status]}</span></div>
      <p>{e.reasons.length ? e.reasons.map((r) => r.message).join(' ') : st.kind === 'AB' ? `0/${st.nPerGroup} contaminadas en A y en B tras ${st.observationDays} días.` : 'Blancos sin crecimiento, placas sin contaminantes y con salto micelial a tiempo. No certifica pureza absoluta ni adaptación productiva.'}</p>
      <p className="readiness-record">Inicio {aqDateTime(st.startedAt)} · {m.readings} lectura(s) · día {aqFmt(m.lastDay)} de {st.observationDays} · {aqFmt(st.incubationTempC)} ± {aqFmt(st.tempToleranceC)} °C (medido {aqFmt(m.tempMinC)}–{aqFmt(m.tempMaxC)}) · hueco máx. {aqFmt(m.maxGapDays)} de {aqFmt(st.readingIntervalDays)} días</p>
      {st.readings.length > 0 && <div className="aq-table-wrap"><table className="inv-table"><caption>Lecturas de {st.id}</caption>
        <thead><tr><th scope="col">Lectura</th><th scope="col">°C</th>{st.units.map((u) => <th scope="col" key={u}>{u}</th>)}</tr></thead>
        <tbody>{st.readings.map((r, i) => <tr key={i}><th scope="row">{aqDateTime(r.readAt)}</th><td>{aqFmt(r.tempC)}</td>{st.units.map((u) => <td key={u}>{AQ_UNIT_STATE_LABELS[r.units[u]]}</td>)}</tr>)}</tbody></table></div>}
      <details><summary>Registrar lectura de {st.id}</summary><AQReadingForm key={st.readings.length} study={st} submit={submit} /></details>
    </article>; })}
    <details><summary>Nuevo estudio PQ-2</summary><AQStudyForm configurations={configurations} submit={submit} /></details>
    <p className="readiness-boundary">Registro local sólo-anexar, incluido en el respaldo de ensayos. Aún no se sincroniza entre equipos: exportar el registro para compartirlo con el servicio técnico.</p>
  </section>;
}
