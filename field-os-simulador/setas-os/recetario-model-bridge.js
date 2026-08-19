'use strict';
// Recetario model bridge: persists a versioned Perito snapshot with newly saved
// recipes and renders the snapshot beside recipe cards without modifying the
// monolithic React source. Older recipes remain readable as legacy records.
(function () {
  if (globalThis.__setasRecetarioModelBridgeLoaded) return;
  globalThis.__setasRecetarioModelBridgeLoaded = true;

  const MODEL_VERSION = 'perito-model-v2.2';
  const CONF = { low: 'BAJA', medium: 'MEDIA', high: 'ALTA' };
  const VIAB = { approved: 'APROBADA', review: 'REVISAR', hold: 'NO EJECUTAR' };
  let latest = null;
  let renderQueued = false;

  const readJson = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  };
  const num = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const money = v => num(v) == null ? '—' : '$' + Math.round(Number(v)).toLocaleString('es-CO');
  const sig = recipe => (recipe || []).map(r => `${r.id}:${Number(r.p || r.pct || 0).toFixed(2)}`).sort().join('|');
  const similarity = (a = [], b = []) => {
    const aa = new Set(a.map(x => x.id)), bb = new Set(b.map(x => x.id));
    const union = new Set([...aa, ...bb]); if (!union.size) return 0;
    let inter = 0; aa.forEach(id => { if (bb.has(id)) inter++; });
    return inter / union.size;
  };
  const stockMap = () => {
    const out = {};
    readJson('sdp_lotes', []).forEach(l => {
      if (!l || !l.activo || num(l.cantidadKgDisponible) == null || Number(l.cantidadKgDisponible) <= 0) return;
      out[l.ingredienteId] = (out[l.ingredienteId] || 0) + Number(l.cantidadKgDisponible);
    });
    return out;
  };
  const inferSpeciesKey = detail => {
    const byName = {
      'Orellana Gris':'p_ostreatus_gris','Orellana Blanca':'p_ostreatus_blanco','Orellana Rosa':'p_djamor_rosa',
      'Seta de Cardo':'p_eryngii','Shiitake':'shiitake','Melena de León':'lions_mane','Reishi':'reishi','Enoki':'enoki','Nameko':'nameko'
    };
    return byName[detail?.an?.sp?.name] || null;
  };
  // Lotes reales de Bitácora con cosechas registradas — evidencia auto-derivada,
  // sin que el operador tenga que teclear un EB real a mano por prueba.
  const bitacoraTrialRows = sKey => {
    const calib = globalThis.SetasHistoricalCalibration;
    if (!calib?.bitacoraAsTrialRows) return [];
    return calib.bitacoraAsTrialRows(sKey, readJson('sdp_bit_lotes', []), readJson('sdp_bit_cosechas', []));
  };

  const historyFor = (sKey, recipe) => {
    if (!sKey) return null;
    const trialRows = readJson('setas_v6', []).filter(r => r?.sKey === sKey && num(r.ebReal) != null && Array.isArray(r.recipe));
    const rows = [...bitacoraTrialRows(sKey), ...trialRows];
    if (!rows.length) return null;
    const ranked = rows.map(r => ({ r, sim: similarity(recipe, r.recipe) })).sort((a,b)=>b.sim-a.sim);
    const pool = ranked.filter(x => x.sim >= 0.35).slice(0,8);
    const use = pool.length ? pool : ranked.slice(0,5);
    const weights = use.map(x => Math.max(.1, x.sim));
    const ws = weights.reduce((a,b)=>a+b,0) || 1;
    const meanEB = use.reduce((s,x,i)=>s+Number(x.r.ebReal)*weights[i],0)/ws;
    const variance = use.reduce((s,x,i)=>s+Math.pow(Number(x.r.ebReal)-meanEB,2)*weights[i],0)/ws;
    const sim = use.reduce((s,x,i)=>s+x.sim*weights[i],0)/ws;
    return { n:use.length, meanEB, sd:Math.sqrt(Math.max(0,variance)), similarity:Math.max(0,Math.min(1,sim)), source:'setas_v6' };
  };
  const batchWetKg = () => {
    const root = document.getElementById('bl-perito')?.parentElement || document.body;
    const m = (root.textContent || '').match(/([0-9]+(?:[.,][0-9]+)?)\s*[×x]\s*([0-9]+(?:[.,][0-9]+)?)\s*kg\s*=\s*([0-9]+(?:[.,][0-9]+)?)\s*kg/i);
    return m ? Number(m[3].replace(',','.')) : null;
  };

  const buildSnapshot = detail => {
    if (!detail?.baseline || !detail?.recipe?.length) return null;
    const sKey = inferSpeciesKey(detail);
    const history = historyFor(sKey, detail.recipe);
    const model = detail.baseline;
    const stock = stockMap();
    return {
      modelVersion: MODEL_VERSION,
      capturedAt: new Date().toISOString(),
      speciesKey: sKey,
      recipeSignature: sig(detail.recipe),
      dimensions: model.dimensions || null,
      uncertainty: model.uncertainty || null,
      provenance: model.provenance || null,
      score: model.score ?? null,
      status: model.status || null,
      confidence: model.confidence || null,
      stockContext: {
        source: 'sdp_lotes',
        stockKgById: stock,
        batchWetKg: batchWetKg(),
        score: model.stockDetail?.score ?? null,
        mode: model.stockDetail?.mode || 'presence'
      },
      historyCalibration: history,
      economics: model.economics ? JSON.parse(JSON.stringify(model.economics)) : null,
    };
  };

  window.addEventListener('setas-perito-model', e => {
    latest = buildSnapshot(e.detail);
    globalThis.__setasLastPeritoSnapshot = latest;
  });

  window.addEventListener('setas-perito-economy', e => {
    if (!latest || !e.detail?.economics) return;
    const signature = sig(e.detail.recipe || []);
    if (signature && signature !== latest.recipeSignature) return;
    latest = {
      ...latest,
      dimensions: e.detail.model?.dimensions || latest.dimensions,
      economics: JSON.parse(JSON.stringify(e.detail.economics)),
      modelVersion: MODEL_VERSION,
    };
    globalThis.__setasLastPeritoSnapshot = latest;
    queueRender();
  });

  const originalSetItem = Storage.prototype.setItem;
  if (!originalSetItem.__setasRecipeSnapshotWrapped) {
    const wrapped = function(key, value) {
      if (key === 'setas_v6' && latest) {
        try {
          const rows = JSON.parse(value);
          if (Array.isArray(rows)) {
            let changed = false;
            const enriched = rows.map((r, i) => {
              if (!r || r.modelSnapshot || !Array.isArray(r.recipe)) return r;
              const sameSpecies = !latest.speciesKey || r.sKey === latest.speciesKey;
              if (sameSpecies && sig(r.recipe) === latest.recipeSignature && i <= 2) {
                changed = true;
                return { ...r, modelSnapshot: JSON.parse(JSON.stringify(latest)) };
              }
              return r;
            });
            if (changed) value = JSON.stringify(enriched);
          }
        } catch (_) {}
      }
      const out = originalSetItem.call(this, key, value);
      if (key === 'setas_v6') queueRender();
      return out;
    };
    wrapped.__setasRecipeSnapshotWrapped = true;
    Storage.prototype.setItem = wrapped;
  }

  const fmtDiff = r => {
    if (num(r.ebReal) == null) return 'EB real pendiente';
    const snap = r.modelSnapshot;
    const central = num(snap?.uncertainty?.eb?.central) ?? num(r.eb);
    if (central == null) return `EB real ${Number(r.ebReal).toFixed(1)}%`;
    const d = Number(r.ebReal) - central;
    return `EB real ${Number(r.ebReal).toFixed(1)}% · error ${d>=0?'+':''}${d.toFixed(1)} pp`;
  };
  const summaryHtml = r => {
    const s = r.modelSnapshot;
    if (!s) return `<div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Modelo: receta legacy · carga y vuelve a guardar para crear snapshot trazable. ${fmtDiff(r)}</div>`;
    const eb = s.uncertainty?.eb || {};
    const hist = s.historyCalibration;
    const eco = s.economics;
    const ecoLine = eco ? ` · mezcla ${money(eco.recipeCost?.copPerKg)}/kg${eco.lot?.costPerFreshKgCOP?.low!=null?` · sustrato/kg hongo ${money(eco.lot.costPerFreshKgCOP.low)}–${money(eco.lot.costPerFreshKgCOP.high)}`:''}` : '';
    return `<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px 9px;font-family:var(--font-mono);font-size:10px;line-height:1.35">
      <div><b>Viabilidad</b><br>${VIAB[s.dimensions?.safety?.status] || 'REVISAR'}</div>
      <div><b>EB</b><br>${eb.low ?? '—'}–${eb.high ?? '—'}%</div>
      <div><b>Confianza</b><br>${CONF[s.confidence] || 'BAJA'}</div>
      <div><b>Economía</b><br>${s.dimensions?.economy?.score ?? '—'}/100</div>
      <div><b>Comparables</b><br>${hist?.n ?? 0}</div>
      <div style="grid-column:1/-1;color:var(--ink-500)">${fmtDiff(r)} · modelo ${s.modelVersion}${hist?.similarity!=null?` · similitud ${Math.round(hist.similarity*100)}%`:''}${ecoLine}</div>
    </div>`;
  };

  const findCard = (name) => {
    const nodes = [...document.querySelectorAll('div,article,section,tr')].filter(el => (el.textContent || '').includes(name));
    return nodes.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length)
      .find(el => /cargar|eliminar|eb real|editar/i.test(el.textContent || '')) || nodes[0] || null;
  };
  const render = () => {
    const rows = readJson('setas_v6', []);
    rows.forEach(r => {
      if (!r?.name) return;
      const card = findCard(r.name); if (!card) return;
      let box = card.querySelector(':scope > .recetario-model-snapshot');
      if (!box) {
        box = document.createElement('div'); box.className = 'recetario-model-snapshot';
        box.style.cssText = 'margin-top:7px;padding:7px 9px;border-top:1px solid rgba(26,20,16,.12);background:rgba(255,255,255,.22);';
        card.appendChild(box);
      }
      box.innerHTML = summaryHtml(r);
    });
  };
  const queueRender = () => {
    if (renderQueued) return; renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; render(); });
  };
  const obs = new MutationObserver(queueRender);
  obs.observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener('load', queueRender);
  setTimeout(queueRender, 250);
})();
