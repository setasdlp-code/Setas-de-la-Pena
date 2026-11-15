// Sección "Calidad" de la cosecha: pesos por grado, defectos de campo y firmeza.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito. Se reutiliza en la canastilla con otro
// idPrefix. Los chips escriben solo `defectosCampo`; los códigos v0.1 del
// fenotipo viven en otro bloque del formulario y siguen escribiendo defectCodes.

const HARVEST_QUALITY_WEIGHTS = [
  { field: 'pesoPrimera', suffix: 'peso-primera', label: 'Primera (g)' },
  { field: 'pesoSegunda', suffix: 'peso-segunda', label: 'Segunda (g)' },
  { field: 'pesoDescarte', suffix: 'peso-descarte', label: 'Descarte (g)' },
];

// Clave de especie del lote para filtrar los defectos de campo (undefined si el
// lote solo trae texto libre: entonces se ofrecen todos los defectos).
const harvestSpeciesKeyOf = lote => {
  const l = lote || {};
  const k = [l.sKey, l.speciesKey, l.recipeRef && l.recipeRef.sKey].find(x => x && SPP[x]);
  return k ? normSpp(k) : undefined;
};

const HarvestQualityFields = ({ value, onChange, speciesKey, netGrams, idPrefix = 'harvest', defaultOpen = true }) => {
  const v = value || {};
  const bit = window.SetasBitacora;
  const quality = bit.HARVEST_QUALITY;
  const defects = bit.fieldDefectsFor(speciesKey);
  const picked = Array.isArray(v.defectosCampo) ? v.defectosCampo : [];
  const firmeza = v.firmeza === '' || v.firmeza == null ? null : Number(v.firmeza);
  const gap = bit.harvestGradeGap({
    pesoPrimera: v.pesoPrimera, pesoSegunda: v.pesoSegunda, pesoDescarte: v.pesoDescarte,
    pesoFresco: Number.isFinite(netGrams) ? netGrams : null,
  });
  const fmt = n => Math.round(n * 10) / 10;
  const weightError = raw => (raw === '' || raw == null ? '' : bit.captureError(raw, { min: 0 }));
  const toggleDefect = key => onChange({ defectosCampo: picked.includes(key) ? picked.filter(k => k !== key) : [...picked, key] });

  return (
    <details className="harvest-quality" open={defaultOpen ? true : undefined}>
      <summary className="harvest-quality-summary">Calidad · opcional</summary>
      <p id={`${idPrefix}-calidad-help`} className="harvest-capture-help">
        Reparte el peso fresco entre grados. Deja vacío lo que no mediste: no se rellena con ceros.
      </p>
      <div className="harvest-quality-weights">
        {HARVEST_QUALITY_WEIGHTS.map(({ field, suffix, label }) => {
          const id = `${idPrefix}-${suffix}`;
          const err = weightError(v[field]);
          return (
            <div key={field}>
              <label className="inv-label" htmlFor={id}>{label}</label>
              <input
                id={id}
                name={id}
                type="number"
                inputMode="decimal"
                className="inv-input"
                min={0}
                step="any"
                autoComplete="off"
                aria-invalid={!!err}
                aria-describedby={err ? `${id}-error` : undefined}
                placeholder="—"
                value={v[field] ?? ''}
                onChange={e => onChange({ [field]: e.target.value })}
              />
              {err && <p id={`${id}-error`} role="alert" className="harvest-quality-error">{err}</p>}
            </div>
          );
        })}
      </div>
      {gap.status === 'over_tolerance' && (
        <p role="status" className="harvest-quality-warning" data-testid={`${idPrefix}-grade-gap`}>
          Los grados suman {fmt(gap.sumG)} g y el peso fresco es {fmt(gap.netG)} g (diferencia {fmt(gap.gapG)} g, tolerancia {fmt(gap.toleranceG)} g). Puedes guardar igual; revisa los pesos.
        </p>
      )}
      <div className="harvest-quality-block">
        <span className="inv-label">Defectos observados en campo</span>
        <div role="group" aria-label="Defectos observados en campo" className="harvest-quality-chips">
          {defects.map(d => (
            <button
              key={d.key}
              type="button"
              className="harvest-quality-chip"
              data-defect={d.key}
              aria-pressed={picked.includes(d.key)}
              onClick={() => toggleDefect(d.key)}
            >{d.label}</button>
          ))}
        </div>
      </div>
      <div className="harvest-quality-block">
        <span className="inv-label" id={`${idPrefix}-firmeza-label`}>Firmeza al tacto (1–5)</span>
        <div id={`${idPrefix}-firmeza`} tabIndex={-1} role="group" aria-labelledby={`${idPrefix}-firmeza-label`} className="harvest-quality-options">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              className="harvest-quality-choice"
              aria-label={`Firmeza ${n} de 5`}
              aria-pressed={firmeza === n}
              data-filled={firmeza === n}
              onClick={() => onChange({ firmeza: firmeza === n ? '' : n })}
            >{n}</button>
          ))}
        </div>
        <ul className="harvest-quality-anchors">
          {[1, 3, 5].map(n => <li key={n}><b>{n}</b> · {quality.FIRMNESS_ANCHORS[n]}</li>)}
        </ul>
      </div>
    </details>
  );
};
