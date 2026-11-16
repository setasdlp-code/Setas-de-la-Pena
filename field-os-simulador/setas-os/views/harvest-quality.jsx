// Calidad de cosecha (setas.harvest-quality.v1): paso opcional dentro del diálogo
// de cosecha existente y panel compacto en la ficha del lote.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito y genera simulador-app.js. No se carga solo.
//
// Toda la lógica (validación, consistencia de kg, agregados) vive en
// harvest-quality.js y harvest-quality-criteria.js: aquí solo se pinta.
// Contrato de campo (UX V2 §1, §14): una columna, objetivos de 48 px, texto
// operativo ≥ 16 px, botones/segmentos en lugar de texto libre, teclado decimal
// que acepta coma y punto, sin hover ni gestos.

const harvestQualityBlankDraft = harvestId => ({
  harvestId: harvestId || null,
  grade: '',
  grams: { primera: '', segunda: '', descarte: '' },
  capDiameterMm: '',
  firmness: '',
  color: '',
  defects: null, // null = sin evaluar; [] = evaluado y sin defectos
});

const harvestQualityDraftToInput = draft => ({
  grade: draft.grade,
  gramsByGrade: draft.grams,
  capDiameterMm: draft.capDiameterMm,
  firmness: draft.firmness,
  color: draft.color,
  defects: draft.defects,
});

const harvestQualityFmtKg = kg => (kg === null || kg === undefined ? '—' : `${(Math.round(kg * 100) / 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`);
const harvestQualityFmtG = kg => `${Math.round(kg * 1000).toLocaleString('es-CO')} g`;
const harvestQualityFmtPct = pct => `${Math.round(pct)} %`;

const HarvestQualitySegment = ({ label, options, value, onChange, testId }) => (
  <div role="group" aria-label={label} className="hq-seg" data-testid={testId}>
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        className="hq-seg-btn"
        aria-pressed={value === o.value}
        onClick={() => onChange(value === o.value ? '' : o.value)}
      >{o.label}</button>
    ))}
  </div>
);

const HarvestQualityCriteriaNote = ({ speciesKey, speciesLabel }) => {
  const criteria = window.SetasHarvestQualityCriteria.criteriaFor(speciesKey);
  if (criteria.status === 'documented') {
    return (
      <details className="hq-criteria" data-testid="hq-criteria" data-criteria-status="documented">
        <summary>Criterios de grado de la KB · provisionales</summary>
        {['primera', 'segunda', 'descarte'].map(g => criteria.grades[g] && (
          <div key={g}>
            <strong>{window.SetasHarvestQuality.GRADE_LABELS[g]} ({criteria.grades[g].kbLabel})</strong>
            <ul>{criteria.grades[g].criteria.map(c => <li key={c}>{c}</li>)}</ul>
          </div>
        ))}
        <p>{criteria.thresholdNote}. Fuente: {criteria.source.file}.</p>
      </details>
    );
  }
  if (criteria.status === 'partial') {
    return (
      <p className="hq-note hq-note--warn" role="note" data-testid="hq-criteria" data-criteria-status="partial">
        Criterio parcial documentado: {criteria.grades.primera.criteria[0]} (KB, {criteria.source.file}). Segunda y descarte: juicio del operario.
      </p>
    );
  }
  return (
    <p className="hq-note hq-note--warn" role="note" data-testid="hq-criteria" data-criteria-status="undocumented">
      Sin criterio documentado{speciesLabel ? ` para ${speciesLabel}` : ''}: el grado es juicio del operario y se registra así.
    </p>
  );
};

// Paso 2 del diálogo de cosecha. Opcional y rápido: con un toque de grado y
// «Sin defectos» ya se puede guardar. Nada se corrige en silencio: un desfase
// entre los kg por grado y el peso de la cosecha se muestra y queda marcado.
const HarvestQualityStep = ({ harvest, lote, speciesKey, speciesLabel, draft, onDraftChange, operatorId, isOnline, onSave, onSkip, saveError }) => {
  const HQ = window.SetasHarvestQuality;
  const result = HQ.buildQualityBlock(harvestQualityDraftToInput(draft), {
    speciesKey,
    harvest,
    operatorId,
    clock: () => new Date(),
  });
  const netKg = HQ.harvestNetKg(harvest);
  const gramsKg = HQ.GRADES.map(g => HQ.parseDecimalInput(draft.grams[g], { min: 0, max: HQ.MAX_GRAMS }));
  const assignedKg = gramsKg.some(p => p.value !== null) ? HQ.gramsToKg(gramsKg.reduce((s, p) => s + (p.value || 0), 0)) : null;
  const consistency = result.consistency;
  const mismatch = consistency && consistency.status === 'mismatch';
  const set = patch => onDraftChange(prev => ({ ...prev, ...patch }));
  const setGrams = (g, v) => onDraftChange(prev => ({ ...prev, grams: { ...prev.grams, [g]: v } }));
  const defects = draft.defects;
  const hasDefect = code => Array.isArray(defects) && defects.some(d => d.code === code);
  const toggleNone = () => set({ defects: Array.isArray(defects) && defects.length === 0 ? null : [] });
  const toggleDefect = code => {
    const cur = Array.isArray(defects) ? defects : [];
    const next = hasDefect(code) ? cur.filter(d => d.code !== code) : [...cur, { code, severity: null }];
    set({ defects: next.length ? next : null });
  };
  const setSeverity = (code, severity) => set({ defects: defects.map(d => (d.code === code ? { ...d, severity: severity || null } : d)) });
  const flushLabel = harvest && harvest.flush ? `Oleada ${harvest.flush}` : '';
  const weightLabel = netKg !== null ? harvestQualityFmtG(netKg) : 'peso neto sin registrar';
  const firstError = Object.values(result.errors)[0];

  return (
    <div className="hq-step" data-testid="hq-step">
      <header className="harvest-capture-header">
        <h2 className="harvest-capture-title">Calidad de la cosecha</h2>
        <p className="harvest-capture-context">
          Lote <span>{lote ? lote.codigo || lote.id : ''}</span>{harvest && harvest.codigo ? <> · Bolsa <span>{harvest.codigo}</span></> : null}{flushLabel ? ` · ${flushLabel}` : ''} · {weightLabel}
        </p>
      </header>
      <p className="harvest-capture-help">Todo es opcional. Un campo vacío queda como «no medido»; solo un 0 escrito cuenta como cero.</p>
      <HarvestQualityCriteriaNote speciesKey={speciesKey} speciesLabel={speciesLabel} />
      {saveError && <p role="alert" className="hq-note hq-note--error">{saveError}</p>}

      <section className="hq-field">
        <span className="inv-label" id="hq-grade-label">Grado de toda la cosecha</span>
        <HarvestQualitySegment
          label="Grado de toda la cosecha"
          testId="hq-grade"
          value={draft.grade}
          onChange={v => set({ grade: v })}
          options={HQ.GRADES.map(g => ({ value: g, label: HQ.GRADE_LABELS[g] }))}
        />
      </section>

      <section className="hq-field">
        <span className="inv-label">Peso por grado (g) · si la cosecha es mixta</span>
        {HQ.GRADES.map((g, i) => {
          const err = result.errors[`grams_${g}`];
          return (
            <div key={g} className="hq-weight">
              <label className="inv-label" htmlFor={`hq-grams-${g}`}>{HQ.GRADE_LABELS[g]} (g)</label>
              <input
                id={`hq-grams-${g}`}
                name={`qualityGrams${g}`}
                type="text"
                inputMode="decimal"
                enterKeyHint="next"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="inv-input"
                placeholder="Sin pesar"
                aria-invalid={!!err}
                aria-describedby={err ? `hq-grams-${g}-error hq-balance` : 'hq-balance'}
                value={draft.grams[g]}
                onChange={e => setGrams(g, e.target.value)}
              />
              {err && <span id={`hq-grams-${g}-error`} role="alert" className="hq-error">{err}</span>}
            </div>
          );
        })}
        <p id="hq-balance" className={`hq-balance${mismatch ? ' hq-balance--mismatch' : ''}`} role="status" aria-live="polite" data-testid="hq-balance" data-consistency={consistency ? consistency.status : 'none'}>
          {netKg === null
            ? 'La cosecha no tiene peso neto registrado: no se puede cuadrar la suma por grado.'
            : assignedKg === null
              ? `Cosecha ${harvestQualityFmtG(netKg)} · sin pesar por grado.`
              : `Cosecha ${harvestQualityFmtG(netKg)} · asignado ${harvestQualityFmtG(assignedKg)}${mismatch && consistency.deltaKg !== null ? ` · desfase ${consistency.deltaKg > 0 ? '+' : ''}${Math.round(consistency.deltaKg * 1000)} g` : (consistency && consistency.ungradedKg > 0 ? ` · sin asignar ${harvestQualityFmtG(consistency.ungradedKg)}` : '')}`}
        </p>
        {mismatch && consistency.issues.map(issue => <p key={issue.code} className="hq-note hq-note--error" role="alert">{issue.message} No se corrigió: revise los pesos o guárdelo marcado con desfase.</p>)}
      </section>

      <section className="hq-field">
        <label className="inv-label" htmlFor="hq-cap-diameter">Diámetro de píleo típico (mm)</label>
        <input
          id="hq-cap-diameter"
          name="qualityCapDiameter"
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="inv-input"
          placeholder="Sin medir"
          aria-invalid={!!result.errors.capDiameterMm}
          aria-describedby={result.errors.capDiameterMm ? 'hq-cap-diameter-error' : undefined}
          value={draft.capDiameterMm}
          onChange={e => set({ capDiameterMm: e.target.value })}
        />
        {result.errors.capDiameterMm && <span id="hq-cap-diameter-error" role="alert" className="hq-error">{result.errors.capDiameterMm}</span>}
      </section>

      <section className="hq-field">
        <span className="inv-label">Firmeza (juicio al tacto)</span>
        <HarvestQualitySegment
          label="Firmeza"
          testId="hq-firmness"
          value={draft.firmness}
          onChange={v => set({ firmness: v })}
          options={HQ.FIRMNESS.map(v => ({ value: v, label: HQ.FIRMNESS_LABELS[v] }))}
        />
      </section>

      <section className="hq-field">
        <span className="inv-label">Color (juicio a la vista)</span>
        <HarvestQualitySegment
          label="Color"
          testId="hq-color"
          value={draft.color}
          onChange={v => set({ color: v })}
          options={HQ.COLOR.map(v => ({ value: v, label: HQ.COLOR_LABELS[v] }))}
        />
        <p className="hq-hint">Firmeza y color son juicio del operario: la KB no documenta una escala calibrada.</p>
      </section>

      <section className="hq-field">
        <span className="inv-label">Defectos {defects === null ? '· sin evaluar' : ''}</span>
        <div role="group" aria-label="Defectos observados" className="hq-defects" data-testid="hq-defects">
          <button type="button" className="hq-seg-btn" aria-pressed={Array.isArray(defects) && defects.length === 0} onClick={toggleNone}>Sin defectos</button>
          {HQ.DEFECTS.map(d => {
            const on = hasDefect(d.code);
            const current = on ? defects.find(x => x.code === d.code) : null;
            return (
              <div key={d.code} className="hq-defect">
                <button type="button" className="hq-seg-btn" aria-pressed={on} data-defect={d.code} onClick={() => toggleDefect(d.code)}>{d.label}</button>
                {on && (
                  <HarvestQualitySegment
                    label={`Severidad de ${d.label} (opcional)`}
                    value={current.severity || ''}
                    onChange={v => setSeverity(d.code, v)}
                    options={HQ.SEVERITIES.map(s => ({ value: s, label: HQ.SEVERITY_LABELS[s] }))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="harvest-capture-save-note" id="hq-save-note" role="status" aria-live="polite" aria-atomic="true">
        <p>{isOnline ? 'Con conexión' : 'Sin conexión'} · al guardar, la calidad se conserva en este dispositivo y se encola para sincronizar.</p>
        {firstError && <p role="alert">{firstError}</p>}
      </div>
      <div className="inv-modal-actions harvest-capture-actions">
        <button
          type="button"
          className="inv-btn inv-btn-pri"
          disabled={!result.ok}
          data-testid="hq-save"
          aria-describedby="hq-save-note"
          onClick={() => { if (result.ok) onSave(result.block); }}
        >{mismatch && consistency.deltaKg !== null ? `Guardar con desfase de ${consistency.deltaKg > 0 ? '+' : ''}${Math.round(consistency.deltaKg * 1000)} g` : mismatch ? 'Guardar marcado con desfase' : 'Guardar calidad'}</button>
        <button type="button" className="inv-btn inv-btn-sec" data-testid="hq-skip" onClick={onSkip}>Omitir</button>
      </div>
    </div>
  );
};

// Panel compacto de la ficha del lote, junto a las cosechas: resumen por oleada y
// acumulado, con n visible. Sin n suficiente dice «datos insuficientes».
const HarvestQualityPanel = ({ cosechas, speciesKey, speciesLabel, onRate }) => {
  const HQ = window.SetasHarvestQuality;
  const list = Array.isArray(cosechas) ? cosechas : [];
  const agg = HQ.aggregateLotQuality(list, { speciesKey });
  const cum = agg.cumulative;
  const pending = list.filter(h => HQ.readQuality(h).status === 'none');
  const reasonText = group => {
    const r = group.insufficientReasons || [];
    const parts = [];
    if (r.includes('few_graded_harvests')) parts.push(`n=${group.harvests.withGradedKg} de ${agg.policy.minGradedHarvests} cosechas con kg por grado`);
    if (r.includes('low_coverage')) parts.push(`cobertura ${group.coverage === null ? '0' : Math.round(group.coverage * 100)} % de ${Math.round(agg.policy.minCoverage * 100)} %`);
    return parts.join(' · ');
  };
  const gradeLine = group => (group.status === 'ok'
    ? `Primera ${harvestQualityFmtPct(group.firstGradePct)} de ${harvestQualityFmtKg(group.gradedKg)} graduados · n=${group.harvests.withGradedKg} cosechas`
    : `Datos insuficientes (${reasonText(group) || 'sin kg por grado'})`);
  const shownDefects = agg.defects.rows.filter(r => r.count > 0);
  if (!list.length) return null;
  return (
    <section className="os-detail-panel hq-panel" data-testid="batch-harvest-quality" data-quality-status={cum.status} aria-label="Calidad de las cosechas">
      <h2>Calidad de cosecha</h2>
      <p className="hq-line" data-testid="hq-coverage">
        Con calidad: <strong>{cum.harvests.withQuality}</strong> de {cum.harvests.total} cosechas · sin calidad: <strong>{cum.harvests.withoutQuality}</strong>
        {cum.harvests.unsupported > 0 ? ` · versión no reconocida: ${cum.harvests.unsupported}` : ''}
        {cum.harvests.withMismatch > 0 ? ` · con desfase de kg: ${cum.harvests.withMismatch}` : ''}
      </p>
      <p className="hq-line" data-testid="hq-cumulative" data-status={cum.status}><strong>Acumulado:</strong> {gradeLine(cum)}</p>
      {agg.byFlush.length > 1 && (
        <ul className="hq-flushes" data-testid="hq-flushes">
          {agg.byFlush.map(f => (
            <li key={f.flush} data-flush={f.flush} data-status={f.status}>
              <strong>Oleada {f.flush}</strong> · {f.harvests.withQuality}/{f.harvests.total} con calidad · {gradeLine(f)}
            </li>
          ))}
        </ul>
      )}
      <p className="hq-line" data-testid="hq-defect-summary" data-status={agg.defects.status}>
        <strong>Defectos</strong> (n={agg.defects.nAssessed} cosechas evaluadas):{' '}
        {agg.defects.nAssessed === 0
          ? 'ninguna evaluada.'
          : shownDefects.length === 0
            ? `sin defectos registrados (${agg.defects.withoutDefects} sin defectos).`
            : shownDefects.map(r => `${r.label} ${r.count}/${r.nAssessed}${r.frequency !== null ? ` (${harvestQualityFmtPct(r.frequency * 100)})` : ''}`).join(' · ')}
        {agg.defects.status === 'insufficient' && agg.defects.nAssessed > 0 ? ` · datos insuficientes para frecuencias (mínimo ${agg.defects.minAssessedHarvests})` : ''}
      </p>
      {agg.species.criteriaStatus !== 'documented' && (
        <p className="hq-hint" data-testid="hq-criteria-gap">
          {agg.species.criteriaStatus === 'partial' ? 'Criterio de grado parcial en la KB' : 'Sin criterio documentado'}{speciesLabel ? ` para ${speciesLabel}` : ''}: el grado es juicio del operario.
        </p>
      )}
      <p className="hq-hint">Origen: kg medidos; grado, firmeza y color por juicio del operario. Mínimos de presentación configurables, sin fuente (n≥{agg.policy.minGradedHarvests}, cobertura ≥{Math.round(agg.policy.minCoverage * 100)} %).</p>
      {pending.length > 0 && onRate && (
        <div className="hq-pending" data-testid="hq-pending">
          {pending.slice(0, 4).map(h => (
            <button key={h.id} type="button" className="sdp-btn sdp-btn--secondary sdp-btn--field hq-rate" data-harvest-id={h.id} onClick={() => onRate(h.id)}>
              Calificar · oleada {h.flush || 1}{h.fecha ? ` · ${h.fecha}` : ''}
            </button>
          ))}
          {pending.length > 4 && <p className="hq-hint">y {pending.length - 4} cosecha(s) más sin calidad.</p>}
        </div>
      )}
    </section>
  );
};
