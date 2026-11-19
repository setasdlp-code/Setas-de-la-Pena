// Panel «Calidad de cosecha» de la ficha de lote (escritorio y móvil), junto a las
// cosechas. Solo lectura.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito. No se carga solo.
//
// Presenta el resumen de harvest-quality-summary.js, que a su vez lee la
// proyección `quality` de lot-record.js (modelo y formulario de #520). No tiene
// botones ni estados de navegación nuevos. Reglas de presentación:
//   · el grado se rotula siempre «criterio provisional, sin versionar»: es un
//     juicio del operario, no una medición ni es comparable entre especies;
//   · un porcentaje solo aparece si el módulo lo entrega (n y cobertura
//     suficientes); si no, «Datos insuficientes» y el motivo;
//   · la firmeza es una escala ordinal por tacto, nunca una medición
//     instrumental, y no se promedia;
//   · null no es 0: «sin declarar» no es «0 kg».

const HQ_PROVENANCE_LABELS = {
  operator_declared_grade: 'Grado declarado por el operario, criterio provisional',
  operator_ordinal_text_anchored: 'Escala ordinal por tacto con anclas de texto',
  observed_field_measured: 'Observado en campo',
};
const HQ_REASON_LABELS = {
  no_eligible_harvests: 'ninguna cosecha tiene los tres grados declarados y verificados',
  n_below_min: 'pocas cosechas con grado completo',
  coverage_below_min: 'poca cobertura de cosechas con grado completo',
  zero_graded_kg: 'el peso con grado declarado es cero',
  flush_fractions_incomplete: 'la oleada tiene cosechas sin los tres grados',
};

const hqNum = (n, digits) => (Math.round(n * 10 ** digits) / 10 ** digits).toFixed(digits).replace('.', ',');
const hqKg = n => (n == null ? 'sin declarar' : `${hqNum(n, 3)} kg`);
const hqPct = f => `${Math.round(f * 100)} %`;
const hqGrams = g => `${hqNum(g, 1)} g`;
const hqPlural = (n, one, many) => (n === 1 ? one : many);

// Memo por lote y contenido de calidad de sus cosechas: la ficha se vuelve a
// pintar con cada cambio de estado de la app y buildLotRecord recorre cosechas.
let _hqCache = { key: null, value: null };
const lotHarvestQuality = (lote, cosechas) => {
  const lr = typeof window !== 'undefined' ? window.SetasLotRecord : null;
  const summary = typeof window !== 'undefined' ? window.SetasHarvestQualitySummary : null;
  // Sin los módulos (no cargados) no se pinta nada: ni un «Sin calidad
  // registrada» que sería falso.
  if (!lr || !summary || !lote || !lote.id) return null;
  const key = `${lote.id}|${lote.lifecycleState || lote.estado || ''}|${JSON.stringify(cosechas)}`;
  if (_hqCache.key === key) return _hqCache.value;
  let value = null;
  try {
    value = summary.summarizeHarvestQuality(lr.buildLotRecord({ lote, cosechas }).quality);
  } catch (e) {
    console.warn('[Lote] no se pudo resumir la calidad de cosecha', e);
  }
  _hqCache = { key, value };
  return value;
};

const HarvestQualityScope = ({ title, scope, flushIncomplete, testId }) => {
  const h = scope.harvests;
  const g = scope.grades;
  const fg = scope.firstGrade;
  const declaredAnyGrade = g.withCompleteGrades + g.withPartialGrades > 0;
  const reasons = fg.reasons.filter(r => r !== 'flush_fractions_incomplete' || flushIncomplete);
  return (
    <div className="hq-scope" data-testid={testId} data-first-status={fg.status}>
      <h3 className="hq-scope__title">{title}</h3>
      <ul className="hq-lines">
        <li data-testid="hq-counts">
          Cosechas: <strong>{h.withQuality}</strong> con calidad registrada · <strong>{h.withoutQuality}</strong> sin calidad registrada (de {h.total}).
        </li>
        {declaredAnyGrade ? (
          <>
            <li data-testid="hq-grade-kg">
              Peso por grado declarado: primera <strong>{hqKg(g.declaredKg.primera)}</strong> · segunda <strong>{hqKg(g.declaredKg.segunda)}</strong> · descarte <strong>{hqKg(g.declaredKg.descarte)}</strong>
            </li>
            {fg.status === 'ok' ? (
              <li data-testid="hq-first-grade" data-first-fraction={fg.fraction}>
                Primera: <strong>{hqPct(fg.fraction)}</strong> del peso con grado completo ({hqKg(fg.basisKg)}) · n = {fg.n} de {fg.total} {hqPlural(fg.total, 'cosecha', 'cosechas')} · cobertura {hqPct(fg.coverage)}
              </li>
            ) : (
              <li data-testid="hq-first-grade" data-first-fraction="">
                Primera: <strong>Datos insuficientes</strong> ({reasons.map(r => HQ_REASON_LABELS[r] || r).join('; ')}) · n = {fg.n} de {fg.total} {hqPlural(fg.total, 'cosecha', 'cosechas')}
              </li>
            )}
          </>
        ) : (
          <li data-testid="hq-no-grades">Sin pesos por grado declarados.</li>
        )}
        {g.gapExcluded.length > 0 && (
          <li data-testid="hq-gap-excluded" data-count={g.gapExcluded.length}>
            {g.gapExcluded.length} {hqPlural(g.gapExcluded.length, 'cosecha', 'cosechas')} con desfase entre la suma de grados y el peso fresco, fuera del porcentaje:{' '}
            {g.gapExcluded.map((x, i) => (
              <span key={x.harvestId || i} className="hq-gap">{i ? '; ' : ''}{x.harvestId || 'sin id'} (suma {hqGrams(x.sumG)}, fresco {hqGrams(x.netG)}, diferencia {hqGrams(x.gapG)}, tolerancia {hqGrams(x.toleranceG)})</span>
            ))}
          </li>
        )}
        {g.unverifiable > 0 && (
          <li data-testid="hq-unverifiable">
            {g.unverifiable} {hqPlural(g.unverifiable, 'cosecha', 'cosechas')} con los tres grados pero sin peso fresco neto para verificar la suma: fuera del porcentaje.
          </li>
        )}
        {g.withPartialGrades > 0 && (
          <li data-testid="hq-partial-grades">
            {g.withPartialGrades} {hqPlural(g.withPartialGrades, 'cosecha', 'cosechas')} con grados a medias: fuera del porcentaje.
          </li>
        )}
        {scope.firmness && (
          <li data-testid="hq-firmness">
            Firmeza al tacto (escala ordinal 1–5, no es una medición instrumental) · n = {scope.firmness.n}:{' '}
            {scope.firmness.counts.filter(c => c.count > 0).map(c => `nivel ${c.level} × ${c.count}`).join(', ')}
          </li>
        )}
        {h.withQuality > 0 && (
          <li data-testid="hq-defects" data-defects-n={scope.defects.n} data-defects-total={scope.defects.total}>
            {scope.defects.n === 0 ? (
              <>Defectos de campo: <strong>no evaluados</strong> en ninguna de las {scope.defects.total} {hqPlural(scope.defects.total, 'cosecha', 'cosechas')}.</>
            ) : scope.defects.rows.length === 0 ? (
              <>Defectos de campo: ninguno observado en las {scope.defects.n} {hqPlural(scope.defects.n, 'cosecha evaluada', 'cosechas evaluadas')} (n = {scope.defects.n} de {scope.defects.total}).</>
            ) : (
              <>
                Defectos de campo (n = {scope.defects.n} de {scope.defects.total} {hqPlural(scope.defects.total, 'cosecha evaluada', 'cosechas evaluadas')}):{' '}
                {scope.defects.rows.map((d, i) => (
                  <span key={d.key} className="hq-defect" data-defect={d.key} data-declared={String(d.declared)}>
                    {i ? '; ' : ''}{d.label}{d.declared ? '' : ' (clave fuera de la lista)'} {d.count} de {d.n}{d.fraction == null ? '' : ` (${hqPct(d.fraction)})`}
                  </span>
                ))}
                {scope.defects.fractionStatus !== 'ok' && <> · <strong data-testid="hq-defects-insufficient">Datos insuficientes</strong> para un porcentaje</>}
              </>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

const HarvestQualityPanel = ({ summary, mobile = false }) => {
  if (!summary) return null;
  const prov = summary.provenance || {};
  return (
    <section className="os-detail-panel hq-panel" data-testid="batch-harvest-quality" data-quality-status={summary.status} style={{ marginTop: mobile ? 14 : 0, marginBottom: 12 }}>
      <h2>Calidad de cosecha</h2>
      <p className="hq-note" data-testid="hq-criteria">
        Criterio provisional, sin versionar: el grado es un juicio del operario, no una medición, y no es comparable entre especies. No entra al ranking ni a la calibración.
      </p>
      {summary.status === 'none' ? (
        <p className="hq-note" data-testid="hq-empty">Sin calidad registrada en este lote. Las cosechas existentes siguen siendo válidas.</p>
      ) : (
        <>
          <HarvestQualityScope title="Acumulado del lote" scope={summary.total} testId="hq-total" />
          {summary.flushes.map(f => (
            <HarvestQualityScope key={f.flush} title={`Oleada ${f.flush}`} scope={f} flushIncomplete={f.fractionsStatus === 'incomplete'} testId="hq-flush" />
          ))}
          <p className="hq-note hq-note--foot" data-testid="hq-provenance">
            Procedencia: peso por grado, <span data-provenance={prov.gradeKg}>{HQ_PROVENANCE_LABELS[prov.gradeKg] || prov.gradeKg} ({prov.gradeKg})</span> · firmeza, <span data-provenance={prov.firmness}>{HQ_PROVENANCE_LABELS[prov.firmness] || prov.firmness} ({prov.firmness})</span> · defectos, <span data-provenance={prov.defects}>{HQ_PROVENANCE_LABELS[prov.defects] || prov.defects}</span>.
            {' '}El porcentaje de primera exige al menos {summary.thresholds.minHarvestsWithGrades} cosechas con grado completo y una cobertura de {hqPct(summary.thresholds.minCoverage)}; esos umbrales son valores iniciales sin aprobar.
            {' '}«n» de defectos cuenta solo las cosechas con los defectos evaluados (marcaron «Sin defectos observados» o algún defecto); una cosecha sin esa evaluación es «no evaluada», no «sin defectos».
          </p>
        </>
      )}
    </section>
  );
};
