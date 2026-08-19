'use strict';
// Bridge de presentación del Perito. No recalcula reglas agronómicas: enriquece
// SetasScoring con cantidades persistidas de Bodega y EB real del Recetario,
// y traduce las salidas del modelo a una presentación con incertidumbre visible.
(function () {
  if (globalThis.__setasPeritoUiBridgeLoaded) return;
  globalThis.__setasPeritoUiBridgeLoaded = true;

  const SPECIES_KEY_BY_NAME = {
    'Orellana Gris': 'p_ostreatus_gris',
    'Orellana Blanca': 'p_ostreatus_blanco',
    'Orellana Rosa': 'p_djamor_rosa',
    'Seta de Cardo': 'p_eryngii',
    'Shiitake': 'shiitake',
    'Melena de León': 'lions_mane',
    'Reishi': 'reishi',
    'Enoki': 'enoki',
    'Nameko': 'nameko',
  };
  const CONFIDENCE_ES = { low: 'BAJA', medium: 'MEDIA', high: 'ALTA' };
  const VIABILITY_ES = { approved: 'APROBADA', review: 'REVISAR', hold: 'NO EJECUTAR' };
  let moistureById = null;
  let lastEvent = null;

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  };
  const n = value => Number.isFinite(Number(value)) ? Number(value) : null;
  const clamp01 = value => Math.max(0, Math.min(1, value));

  const recipeSimilarity = (a = [], b = []) => {
    const aa = new Set(a.map(x => x.id));
    const bb = new Set(b.map(x => x.id));
    const union = new Set([...aa, ...bb]);
    if (!union.size) return 0;
    let intersection = 0;
    aa.forEach(id => { if (bb.has(id)) intersection += 1; });
    return intersection / union.size;
  };

  // Lotes reales de Bitácora con cosechas registradas — evidencia auto-derivada,
  // sin que el operador tenga que teclear un EB real a mano por prueba.
  const bitacoraTrialRows = sKey => {
    const calib = globalThis.SetasHistoricalCalibration;
    if (!calib?.bitacoraAsTrialRows) return [];
    return calib.bitacoraAsTrialRows(sKey, readJson('sdp_bit_lotes', []), readJson('sdp_bit_cosechas', []));
  };

  const historyCalibrationFor = (sKey, recipe) => {
    if (!sKey) return null;
    const trialRows = readJson('setas_v6', [])
      .filter(r => r && r.sKey === sKey && n(r.ebReal) != null && Array.isArray(r.recipe));
    const rows = [...bitacoraTrialRows(sKey), ...trialRows];
    if (!rows.length) return null;
    const comparable = rows.map(r => ({ ...r, similarity: recipeSimilarity(recipe, r.recipe) }));
    const selected = comparable.filter(r => r.similarity >= 0.35);
    const pool = selected.length ? selected : comparable;
    const weights = pool.map(r => Math.max(0.10, r.similarity));
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const meanEB = pool.reduce((sum, r, i) => sum + Number(r.ebReal) * weights[i], 0) / weightSum;
    const variance = pool.reduce((sum, r, i) => sum + Math.pow(Number(r.ebReal) - meanEB, 2) * weights[i], 0) / weightSum;
    const similarity = pool.reduce((sum, r, i) => sum + r.similarity * weights[i], 0) / weightSum;
    return {
      n: pool.length,
      meanEB,
      sd: Math.sqrt(Math.max(0, variance)),
      similarity: clamp01(similarity),
      source: 'setas_v6',
      matched: selected.length > 0,
    };
  };

  const stockKgById = () => {
    const lots = readJson('sdp_lotes', []);
    const map = {};
    lots.forEach(l => {
      if (!l || !l.activo || n(l.cantidadKgDisponible) == null || Number(l.cantidadKgDisponible) <= 0) return;
      map[l.ingredienteId] = (map[l.ingredienteId] || 0) + Number(l.cantidadKgDisponible);
    });
    return map;
  };

  const parseMoistureCatalog = async () => {
    if (moistureById) return moistureById;
    const out = {};
    try {
      const response = await fetch('./simulador-app.js', { cache: 'force-cache' });
      if (!response.ok) throw new Error('catalog fetch failed');
      const text = await response.text();
      const start = text.indexOf('const INGS = [');
      const end = text.indexOf('const CATS =', start);
      const block = start >= 0 && end > start ? text.slice(start, end) : text;
      const re = /id:\s*['"]([^'"]+)['"][\s\S]{0,650}?moisture:\s*([0-9.]+)/g;
      let match;
      while ((match = re.exec(block))) out[match[1]] = Number(match[2]);
    } catch (_) {}
    moistureById = out;
    return out;
  };

  const findBatchWetKg = () => {
    const roots = [
      document.querySelector('.builder-cols')?.previousElementSibling,
      document.getElementById('bl-perito')?.parentElement,
      document.querySelector('.builder-cols')?.parentElement,
    ].filter(Boolean);
    for (const root of roots) {
      const text = root.textContent || '';
      const m = text.match(/([0-9]+(?:[.,][0-9]+)?)\s*[×x]\s*([0-9]+(?:[.,][0-9]+)?)\s*kg\s*=\s*([0-9]+(?:[.,][0-9]+)?)\s*kg/i);
      if (m) return Number(m[3].replace(',', '.'));
    }
    return null;
  };

  const maxWetBatchKg = (recipe, stockMap, moistures, targetMoisturePct) => {
    const finalDryFraction = 1 - Math.max(0, Math.min(92, Number(targetMoisturePct) || 65)) / 100;
    let max = Infinity;
    for (const r of recipe || []) {
      const pct = Math.max(0, Number(r.p) || 0) / 100;
      if (!pct) continue;
      const ingredientDryFraction = 1 - Math.max(0, Math.min(92, Number(moistures[r.id]) || 0)) / 100;
      const wetIngredientPerKgFinal = finalDryFraction * pct / Math.max(0.08, ingredientDryFraction);
      const available = Math.max(0, Number(stockMap[r.id]) || 0);
      if (wetIngredientPerKgFinal > 0) max = Math.min(max, available / wetIngredientPerKgFinal);
    }
    return Number.isFinite(max) ? Math.max(0, max) : null;
  };

  const decisionRisk = (model, an) => {
    if (an.trichoderma || model.dimensions?.safety?.status === 'hold') return 'ALTO';
    const score = model.dimensions?.safety?.score ?? 0;
    return score >= 80 ? 'BAJO' : score >= 60 ? 'MEDIO' : 'ALTO';
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

  const renderModel = (model, an, meta) => {
    const root = document.getElementById('bl-perito');
    if (!root) return false;
    let box = document.getElementById('perito-model-v2');
    if (!box) {
      box = document.createElement('section');
      box.id = 'perito-model-v2';
      box.style.cssText = 'margin:0 0 14px;padding:12px 14px;border:1px solid rgba(26,20,16,.14);border-left:4px solid var(--accent-olive);border-radius:6px;background:var(--paper-100);font-family:var(--font-body);';
      root.insertBefore(box, root.firstChild);
    }
    const dim = model.dimensions || {};
    const eb = model.uncertainty?.eb || {};
    const ph = model.uncertainty?.ph || {};
    const viability = VIABILITY_ES[dim.safety?.status] || 'REVISAR';
    const confidence = CONFIDENCE_ES[model.confidence] || 'BAJA';
    const risk = decisionRisk(model, an);
    const stock = model.stockDetail || {};
    const maxBatch = meta.maxWetBatchKg;
    const currentBatch = meta.batchWetKg;
    const stockText = stock.mode === 'quantity'
      ? `${stock.score}% cobertura${currentBatch ? ` del lote de ${currentBatch.toFixed(1)} kg` : ''}${maxBatch != null ? ` · máx. ≈${maxBatch.toFixed(1)} kg húmedos` : ''}`
      : maxBatch != null
      ? `máx. ≈${maxBatch.toFixed(1)} kg húmedos según Bodega`
      : `${stock.score ?? 100}% · ${stock.mode === 'presence' ? 'presencia, sin masa de lote' : 'sin restricción cuantitativa'}`;
    const hist = meta.history;
    const ebBase = hist
      ? `${hist.n} prueba${hist.n === 1 ? '' : 's'} del Recetario · similitud ${Math.round(hist.similarity * 100)}%`
      : 'sin pruebas comparables con EB real · base teórica';

    box.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-500);margin-bottom:8px">Perito · decisión con incertidumbre</div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px">
        <div><div style="font-size:10px;color:var(--ink-500);text-transform:uppercase">Viabilidad</div><strong>${viability}</strong></div>
        <div><div style="font-size:10px;color:var(--ink-500);text-transform:uppercase">Ajuste especie</div><strong>${dim.agronomy?.score ?? '—'}/100</strong></div>
        <div><div style="font-size:10px;color:var(--ink-500);text-transform:uppercase">Economía</div><strong>${dim.economy?.score ?? '—'}/100</strong></div>
        <div><div style="font-size:10px;color:var(--ink-500);text-transform:uppercase">Confianza</div><strong>${confidence}</strong></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;font-family:var(--font-mono);font-size:11px;line-height:1.45">
        <div><b>EB estimada</b><br>${eb.low ?? '—'}–${eb.high ?? '—'}% · confianza ${CONFIDENCE_ES[eb.confidence] || 'BAJA'}<br><span style="color:var(--ink-500)">${ebBase}</span></div>
        <div><b>pH</b><br>${ph.trend || 'tendencia no disponible'}<br><span style="color:var(--ink-500)">medir mezcla hidratada; no es una medición calculada</span></div>
        <div><b>Riesgo</b><br>${risk} · inferido, no observado<br><span style="color:var(--ink-500)">${model.uncertainty?.risk?.note || ''}</span></div>
        <div><b>Bodega</b><br>${stockText}<br><span style="color:var(--ink-500)">${stock.limiting?.length ? `${stock.limiting.length} ingrediente(s) limitante(s)` : 'sin faltantes para el lote evaluado'}</span></div>
      </div>
      <div style="margin-top:9px;padding-top:7px;border-top:1px solid rgba(26,20,16,.1);font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Índice global ${model.score}/100 = heurística comparativa. Bodega: <code>sdp_lotes</code> · Recetario: <code>setas_v6</code>.</div>`;

    replaceLegacyMetric(root, 'EB esperada', `${eb.low ?? '—'}–${eb.high ?? '—'}%`, `Conf. ${CONFIDENCE_ES[eb.confidence] || 'BAJA'}`);
    replaceLegacyMetric(root, 'pH estimado', ph.trend || 'tendencia', 'Medir');
    replaceLegacyMetric(root, 'EB estimada', `${eb.low ?? '—'}–${eb.high ?? '—'}%`, '');
    replaceLegacyMetric(root, 'Calificación', `${model.score}/100`, '');
    softenLegacyText(root);
    return true;
  };

  const recompute = async detail => {
    if (!detail?.an || !detail?.recipe?.length || !globalThis.SetasScoring) return;
    const moistures = await parseMoistureCatalog();
    const an = detail.an;
    const recipe = detail.recipe;
    const sKey = SPECIES_KEY_BY_NAME[an.sp?.name] || null;
    const history = historyCalibrationFor(sKey, recipe);
    const stockMap = stockKgById();
    const batchWetKg = findBatchWetKg();
    const targetMoisturePct = an.sp?.moisture?.ideal ?? 65;
    const sev = globalThis.SetasScoring.assessSeverity(an);
    const ctx = {
      treatment: detail.treatment || null,
      recipe,
      stockIds: new Set(Object.keys(stockMap).filter(id => stockMap[id] > 0)),
      stockKgById: stockMap,
      ingredientMoistureById: moistures,
      batchWetKg,
      targetMoisturePct,
      historyCalibration: history,
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
      __bridgeRecompute: true,
    };
    const model = globalThis.SetasScoring.scoreRecipe(an, ctx);
    const maxBatch = maxWetBatchKg(recipe, stockMap, moistures, targetMoisturePct);
    const render = () => renderModel(model, an, { history, batchWetKg, maxWetBatchKg: maxBatch });
    if (!render()) requestAnimationFrame(render);
    setTimeout(render, 120);
  };

  window.addEventListener('setas-perito-model', event => {
    lastEvent = event.detail;
    recompute(lastEvent);
  });

  const observer = new MutationObserver(() => {
    if (lastEvent && !document.getElementById('perito-model-v2')) recompute(lastEvent);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
