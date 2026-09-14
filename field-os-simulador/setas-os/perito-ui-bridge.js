'use strict';
// Presentation consumes one explicit React snapshot; no domain inputs are
// reconstructed from DOM text, generated source or asynchronous storage reads.
(function () {
  if (globalThis.__setasPeritoUiBridgeLoaded) return;
  globalThis.__setasPeritoUiBridgeLoaded = true;
  const CONFIDENCE_ES = { low: 'BAJA', medium: 'MEDIA', high: 'ALTA' };
  const VIABILITY_ES = { approved: 'SIN BLOQUEO DEL MODELO', review: 'REVISAR', hold: 'REQUIERE CORRECCIÓN' };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let lastEvent = null;
  let pendingFrame = null;
  const historyCalibrationFor = input => {
    const sKey = input.species?.key;
    const calib = globalThis.SetasHistoricalCalibration;
    const engine = globalThis.SetasPeritoScenarios;
    if (!sKey || !calib?.weightedCalibration || !engine?.recipeDistance) return null;
    // Source stores: setas_v6, sdp_bit_lotes, sdp_bit_cosechas. Their current
    // React values are supplied together, so history belongs to this snapshot.
    const data = input.historicalEvidence || {};
    const trialRows = (data.trials || []).filter(r => r && r.sKey === sKey);
    const rows = [...(calib.bitacoraAsTrialRows ? calib.bitacoraAsTrialRows(sKey, data.lotes || [], data.harvests || [], {includeIncomplete:true}) : []), ...trialRows];
    return {calibration:calib.weightedCalibration(input.recipe, rows, engine.recipeDistance), eligibility:calib.assessHistory(rows)};
  };
  const softenLegacyText = root => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      let t = node.nodeValue || '';
      t = t.replace(/Autoclave 121°C × 90 min obligatorio/gi, 'Riesgo inferido alto · esterilización a presión recomendada; validar ciclo según carga/formato');
      t = t.replace(/Esterilizar en autoclave 121°C × 90 min/gi, 'Usar esterilización a presión; validar el ciclo según carga y formato');
      t = t.replace(/COLAPSO TRICHODERMA:/gi, 'RIESGO INFERIDO ALTO DE CONTAMINACIÓN:');
      t = t.replace(/EB cae ~85%/gi, 'el rendimiento esperado puede caer de forma marcada');
      t = t.replace(/Sin autoclave: pérdida del lote completo en 5–10 días de colonización\.?/gi, 'Sin un tratamiento compatible, el riesgo inferido de pérdida del lote aumenta.');
      node.nodeValue = t;
    });
  };

  const replaceLegacyMetric = (root, label, value, badge) => {
    root.querySelectorAll('.mc').forEach(card => {
      const lbl = card.querySelector('.mlbl');
      if (!lbl || lbl.textContent.trim() !== label) return;
      const val = card.querySelector('.mval');
      const b = card.querySelector('.mbadge');
      if (val) val.textContent = value;
      if (b) { b.textContent = badge; b.className = 'mbadge bwarn'; }
    });
    root.querySelectorAll('*').forEach(el => {
      if (el.children.length || el.textContent.trim() !== label) return;
      const parent = el.parentElement;
      if (!parent) return;
      const children = [...parent.children];
      const idx = children.indexOf(el);
      const candidate = children[idx + 1];
      if (candidate && candidate.children.length === 0) candidate.textContent = value;
    });
  };

  const renderModel = detail => {
    const root = document.getElementById('bl-perito');
    if (!root) return false;
    if (!detail?.an || !detail?.recipe?.length) {
      document.getElementById('perito-model-v2')?.remove();
      globalThis.__setasPeritoAssessment = null;
      return true;
    }
    if (!globalThis.SetasScoring || !globalThis.SetasPeritoReadiness) return false;
    const historyReport = historyCalibrationFor(detail);
    const history = historyReport?.calibration || null;
    const sev = globalThis.SetasScoring.assessSeverity(detail.an);
    // Unknown quantities stay unavailable in the readiness assessment. Only
    // pass the quantitative context to scoring when all its inputs are known.
    const preflight = globalThis.SetasPeritoReadiness.assessReadiness(detail, null, history);
    const ctx = {
      recipe: detail.recipe, treatment: detail.treatment, historyCalibration: history,
      criticals: sev.criticals, warnings: sev.warnings, severity: sev.severity,
      __bridgeRecompute: true,
      ...(preflight.stock ? {
        stockKgById: detail.inventory.stockKgById,
        ingredientMoistureById: detail.ingredientMoistureById,
        batchWetKg: detail.batch.wetKg,
        targetMoisturePct: detail.batch.targetMoisturePct,
      } : {}),
    };
    const model = globalThis.SetasScoring.scoreRecipe(detail.an, ctx);
    const assessment = globalThis.SetasPeritoReadiness.assessReadiness(detail, model, history);
    const eb = model.uncertainty?.eb || {};
    const ph = model.uncertainty?.ph || {};
    const labels = {ready:'Verificado',blocked:'Corregir',unknown:'Por verificar'};
    const title = {ready:'Comprobaciones completas',blocked:'Hay bloqueos por resolver',verify:'Faltan verificaciones'}[assessment.status];
    let box = document.getElementById('perito-model-v2');
    if (!box) {
      box = document.createElement('section');
      box.id = 'perito-model-v2';
      root.insertBefore(box, root.firstChild);
    }
    box.dataset.recipeRevision = String(detail.inputRevision);
    box.dataset.readiness = assessment.status;
    box.style.cssText = 'margin:0 0 16px;padding:16px;border:1px solid var(--border-soft);border-radius:var(--r-sm);background:var(--paper-100);font-family:var(--font-body);font-size:16px;line-height:1.5;overflow-wrap:anywhere';
    const rowHtml = assessment.checks.map(check => `<li data-readiness-check="${check.id}" data-status="${check.status}" style="padding:10px 0;border-bottom:1px solid var(--border-soft)">
      <strong>${escapeHtml(check.label)} · ${labels[check.status]}</strong><div>${escapeHtml(check.detail)}</div>
      ${check.status !== 'ready' ? `<button type="button" class="inv-btn inv-btn-sec" data-perito-action="${check.action}" style="min-height:48px;padding:8px 12px;margin-top:6px;font:inherit;cursor:pointer">${escapeHtml(check.actionLabel)}</button>` : ''}</li>`).join('');
    const shortages = assessment.stock?.limiting || [];
    const unresolved = assessment.checks.filter(check => check.status !== 'ready');
    const next = unresolved.find(check => check.status === 'blocked') || unresolved[0];
    const expanded = new Set([...box.querySelectorAll('details[open][data-perito-detail]')].map(el => el.dataset.peritoDetail));
    box.innerHTML = `<h3 style="margin:0">Preparación para producir · ${title}</h3>
      <p style="margin:6px 0">${escapeHtml(detail.species?.name || detail.species?.key)} · revisión ${escapeHtml(detail.inputRevision)} · datos del Formulador actual.</p>
      <p>Evaluación: <strong>${VIABILITY_ES[model.dimensions?.safety?.status] || 'REVISAR'}</strong>. La aprobación humana se verifica por separado.</p>
      ${next ? `<div style="margin:12px 0"><strong>Siguiente paso · ${escapeHtml(next.label)}</strong><div>${escapeHtml(next.detail)}</div><button type="button" class="inv-btn inv-btn-sec" data-perito-action="${next.action}" style="min-height:48px;font:inherit;margin-top:8px">${escapeHtml(next.actionLabel)}</button></div>` : ''}
      <details data-perito-detail="checks" ${expanded.has('checks') ? 'open' : ''}><summary style="cursor:pointer;min-height:48px">Ver ${assessment.checks.length} comprobaciones · ${unresolved.length} por resolver</summary><ul style="list-style:none;margin:0;padding:0">${rowHtml}</ul></details>
      ${shortages.length ? `<div style="margin-top:12px"><strong>Faltantes estimados según Bodega</strong><ul>${shortages.map(row=>`<li>${escapeHtml(row.name)}: requiere ${row.requiredWetKg.toFixed(2)} kg · registrado ${row.availableWetKg.toFixed(2)} kg · faltan ${row.missingWetKg.toFixed(2)} kg (peso del ingrediente con su humedad declarada).</li>`).join('')}</ul></div>` : ''}
      <details data-perito-detail="estimates" ${expanded.has('estimates') ? 'open' : ''} style="margin-top:12px"><summary style="cursor:pointer;min-height:48px">Estimaciones y evidencia del modelo</summary>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          <div><b>EB estimada</b><br>${escapeHtml(eb.low ?? '—')}–${escapeHtml(eb.high ?? '—')}% · confianza ${CONFIDENCE_ES[eb.confidence] || 'BAJA'}<br>${history ? `${history.n} registro(s) · similitud ${Math.round(history.similarity*100)}% · ${history.matched ? 'seleccionados por receta' : 'extrapolación'}` : 'sin pruebas comparables con EB real · base teórica'}</div>
          <div><b>pH</b><br>${escapeHtml(ph.trend || 'tendencia no disponible')}<br>medir mezcla hidratada; no es una medición calculada</div>
          <div><b>Riesgo</b><br>inferido, no observado<br>${escapeHtml(model.uncertainty?.risk?.note || '')}</div>
        </div>
        <p data-history-eligibility>${escapeHtml(globalThis.SetasHistoricalCalibration?.describeHistory(historyReport?.eligibility))}. Las observaciones excluidas se conservan como contexto.</p>
        <p>Índice global ${escapeHtml(model.score)}/100: heurística comparativa. Cantidades de Bodega activa; humedad del catálogo efectivo. No son mediciones nuevas.</p>
      </details>`;
    box.querySelectorAll('[data-perito-action]').forEach(button => button.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('setas-perito-navigate', {detail:{action:button.dataset.peritoAction}}));
    }));
    replaceLegacyMetric(root, 'EB esperada', `${eb.low ?? '—'}–${eb.high ?? '—'}%`, `Conf. ${CONFIDENCE_ES[eb.confidence] || 'BAJA'}`);
    replaceLegacyMetric(root, 'pH estimado', ph.trend || 'tendencia', 'Medir');
    softenLegacyText(root);
    globalThis.__setasPeritoAssessment = {inputRevision:detail.inputRevision,assessment,model,historyEligibility:historyReport?.eligibility};
    return true;
  };
  // Coalesce pending frames and always read the latest snapshot inside the
  // callback: an older recipe can never repaint after apply/undo or navigation.
  const scheduleRender = () => {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => { pendingFrame = null; renderModel(lastEvent); });
  };
  window.addEventListener('setas-perito-input', event => {
    lastEvent = event.detail;
    scheduleRender();
  });
  const observer = new MutationObserver(() => {
    if (lastEvent?.recipe?.length && !document.getElementById('perito-model-v2')) scheduleRender();
  });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  lastEvent = globalThis.__setasPeritoInput || null;
  if (lastEvent) scheduleRender();
})();
