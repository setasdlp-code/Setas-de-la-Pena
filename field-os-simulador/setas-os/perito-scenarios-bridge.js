'use strict';
import './perito-scenarios.js';
import './formulator-api.js';

(function attachScenarioBridge() {
  if (globalThis.__setasPeritoScenarioBridgeLoaded) return;
  globalThis.__setasPeritoScenarioBridgeLoaded = true;

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
  const TYPE_LABEL = {
    conservadora: 'Conservadora',
    rendimiento: 'Rendimiento',
    economia: 'Economía',
    experimental: 'Experimental',
    alternativa: 'Alternativa',
  };

  let lastDetail = null;
  let lastResult = null;
  let catalogCache = null;
  let applying = false;

  const readJson = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  };
  const n = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const waitFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const readLexical = expression => {
    try { return (0, eval)(expression); }
    catch (_) { return null; }
  };

  const resolveRuntime = an => {
    const analyzeFn = readLexical('typeof analyze === "function" ? analyze : null');
    const ings = readLexical('typeof INGS !== "undefined" ? INGS : null');
    const spp = readLexical('typeof SPP !== "undefined" ? SPP : null');
    if (typeof analyzeFn !== 'function' || !Array.isArray(ings)) return null;
    let sKey = null;
    if (spp && an?.sp) sKey = Object.keys(spp).find(k => spp[k] === an.sp) || null;
    if (!sKey) {
      const name = an?.sp?.name || an?.sp?.common || an?.sp?.label;
      sKey = SPECIES_KEY_BY_NAME[name] || null;
    }
    return sKey ? { analyzeFn, ings, spp, sKey } : null;
  };

  const catalogNames = ingredients => Object.fromEntries((ingredients || []).map(g => [g.id, g.name || g.id]));
  const activeLots = () => readJson('sdp_lotes', []).filter(l => l?.activo && Number(l.cantidadKgDisponible) > 0 && l.ingredienteId);
  const activeStockIds = lots => new Set((lots || activeLots()).map(l => l.ingredienteId));
  const stockKgById = lots => {
    const out = {};
    (lots || []).forEach(l => { out[l.ingredienteId] = (out[l.ingredienteId] || 0) + Number(l.cantidadKgDisponible || 0); });
    return out;
  };
  const historyFor = sKey => readJson('setas_v6', [])
    .filter(r => r?.sKey === sKey && Array.isArray(r.recipe))
    .map(r => ({ recipe: r.recipe }));

  // Lotes reales de Bitácora con cosechas registradas — evidencia auto-derivada,
  // sin que el operador tenga que teclear un EB real a mano por prueba.
  const bitacoraTrialRows = sKey => {
    const calib = globalThis.SetasHistoricalCalibration;
    if (!calib?.bitacoraAsTrialRows) return [];
    return calib.bitacoraAsTrialRows(sKey, readJson('sdp_bit_lotes', []), readJson('sdp_bit_cosechas', []));
  };

  const historyCalibrationFor = (sKey, recipe) => {
    const engine = globalThis.SetasPeritoScenarios;
    if (!engine?.recipeDistance) return null;
    const trialRows = readJson('setas_v6', []).filter(r => r?.sKey === sKey && n(r.ebReal) != null && Array.isArray(r.recipe));
    const rows = [...bitacoraTrialRows(sKey), ...trialRows];
    if (!rows.length) return null;
    const comparable = rows.map(r => ({ ...r, similarity: Math.max(0, 1 - engine.recipeDistance(recipe, r.recipe)) }));
    const selected = comparable.filter(r => r.similarity >= 0.55);
    const pool = selected.length ? selected : comparable;
    const weights = pool.map(r => Math.max(0.08, r.similarity));
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const meanEB = pool.reduce((sum, r, i) => sum + Number(r.ebReal) * weights[i], 0) / weightSum;
    const variance = pool.reduce((sum, r, i) => sum + Math.pow(Number(r.ebReal) - meanEB, 2) * weights[i], 0) / weightSum;
    const similarity = pool.reduce((sum, r, i) => sum + r.similarity * weights[i], 0) / weightSum;
    return { n: pool.length, meanEB, sd: Math.sqrt(Math.max(0, variance)), similarity: Math.max(0, Math.min(1, similarity)) };
  };

  const useStockMode = () => {
    try { return localStorage.getItem('setas_workmode') !== 'catalogo'; }
    catch (_) { return true; }
  };

  const roleCaps = an => ({
    base_carbono: 100,
    suplemento_n: Number(an?.sp?.supplementation_max) || 20,
    suplemento_medio: Number(an?.sp?.supplementation_max) || 20,
    aditivo_ph: 8,
    aditivo_estructura: 15,
    aditivo_micronutriente: 5,
    aireador: 30,
  });

  const ingredientCaps = (ings, an) => {
    const caps = {};
    const suppMax = Number(an?.sp?.supplementation_max) || 20;
    (ings || []).forEach(g => {
      switch (g.role) {
        case 'suplemento_n':
        case 'suplemento_medio': caps[g.id] = suppMax; break;
        case 'aditivo_ph': caps[g.id] = 8; break;
        case 'aditivo_estructura': caps[g.id] = 15; break;
        case 'aditivo_micronutriente': caps[g.id] = 5; break;
        case 'aireador': caps[g.id] = 30; break;
        default: break;
      }
    });
    return caps;
  };

  const scoreCandidate = (analysis, context) => {
    const scoring = globalThis.SetasScoring;
    if (!scoring?.scoreRecipe) throw new Error('SetasScoring no disponible');
    const sev = scoring.assessSeverity?.(analysis) || { criticals: 0, warnings: 0, severity: 0 };
    let treatment = context.treatment || null;
    const calcTreatmentFn = readLexical('typeof calcTreatment === "function" ? calcTreatment : null');
    if (typeof calcTreatmentFn === 'function' && context.sKey) {
      try { treatment = calcTreatmentFn(analysis, context.sKey) || treatment; } catch (_) {}
    }
    return scoring.scoreRecipe(analysis, {
      ...context,
      treatment,
      historyCalibration: historyCalibrationFor(context.sKey, context.recipe || []),
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
      __bridgeRecompute: true,
    });
  };

  const recipeText = (recipe, names) => recipe.slice().sort((a, b) => b.p - a.p)
    .map(r => `${esc(names[r.id] || r.id)} ${Number(r.p).toFixed(1)}%`).join(' · ');

  const deltaText = (candidate, baseline) => {
    const cd = candidate.evaluation?.dimensions || {};
    const bd = baseline.evaluation?.dimensions || {};
    const fmt = (a, b) => {
      const d = Math.round((a || 0) - (b || 0));
      return `${d >= 0 ? '+' : ''}${d}`;
    };
    return `Seguridad ${fmt(cd.safety?.score, bd.safety?.score)} · Agronomía ${fmt(cd.agronomy?.score, bd.agronomy?.score)} · Economía ${fmt(cd.economy?.score, bd.economy?.score)}`;
  };

  const setStatus = (text, kind = 'info') => {
    const el = document.getElementById('perito-scenarios-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = kind === 'error' ? '#9C2F22' : kind === 'ok' ? 'var(--accent-olive)' : 'var(--ink-500)';
  };

  const applyScenario = async scenarioId => {
    const formulator = globalThis.SetasFormulatorAPI;
    if (applying || !formulator || !lastResult || !catalogCache) return;
    const scenario = (lastResult.recommended || []).find(c => c.id === scenarioId);
    if (!scenario) return;
    applying = true;
    setStatus('Aplicando escenario…');
    const result = await formulator.applyRecipe(scenario.recipe, {
      expectedRecipe: lastResult.baseline.recipe,
      names: catalogCache,
      source: 'perito_scenario',
      scenarioId: scenario.id,
    });
    applying = false;
    if (!result.ok) { setStatus(result.message, 'error'); return; }
    setStatus(`${TYPE_LABEL[scenario.type] || 'Escenario'} aplicado · ${result.adapter || formulator.adapterType()}.`, 'ok');
    await waitFrame();
    if (lastDetail) compute(lastDetail);
  };

  const undoScenario = async () => {
    const formulator = globalThis.SetasFormulatorAPI;
    if (applying || !formulator?.canUndo()) return;
    applying = true;
    setStatus('Deshaciendo escenario…');
    const result = await formulator.undoRecipe({ names: catalogCache, source: 'perito_scenario_undo' });
    applying = false;
    if (!result.ok) { setStatus(result.message, 'error'); return; }
    setStatus('Escenario deshecho.', 'ok');
    await waitFrame();
    if (lastDetail) compute(lastDetail);
  };

  const render = (result, names) => {
    const root = document.getElementById('bl-perito');
    if (!root) return false;
    let box = document.getElementById('perito-scenarios-v1');
    if (!box) {
      box = document.createElement('section');
      box.id = 'perito-scenarios-v1';
      box.style.cssText = 'margin:12px 0 14px;padding:12px 14px;border:1px solid rgba(26,20,16,.14);border-radius:6px;background:var(--paper-50);font-family:var(--font-body);';
      const model = document.getElementById('perito-model-v2');
      if (model?.parentElement === root) root.insertBefore(box, model.nextSibling);
      else root.insertBefore(box, root.firstChild?.nextSibling || null);
    }
    const rows = result.recommended || [];
    const formulator = globalThis.SetasFormulatorAPI;
    const canUndo = !!formulator?.canUndo();
    const adapter = formulator?.adapterType?.() || 'none';
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:8px">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-500)">Perito · escenarios</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">${result.explored} variantes · ${result.pareto.length} Pareto · API ${esc(adapter)}</div>
      </div>
      ${canUndo ? '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button data-scenario-action="undo" style="cursor:pointer;border:1px solid var(--border-soft);background:var(--paper-0);padding:5px 9px;border-radius:4px;font-family:var(--font-mono);font-size:10px">↶ Deshacer escenario</button></div>' : ''}
      ${rows.length ? rows.map((c, i) => {
        const d = c.evaluation?.dimensions || {};
        const experimental = c.type === 'experimental';
        return `<article style="padding:${i ? '10px 0 0' : '0'};${i ? 'border-top:1px solid rgba(26,20,16,.10);margin-top:10px;' : ''}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong style="font-size:13px">${TYPE_LABEL[c.type] || 'Alternativa'}</strong><span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Novedad ${Math.round(c.evaluation?.novelty || 0)}/100</span></div>
          <div style="font-family:var(--font-mono);font-size:11px;line-height:1.45;margin-top:4px">${recipeText(c.recipe, names)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500);margin-top:4px">Seguridad ${Math.round(d.safety?.score || 0)} · Agronomía ${Math.round(d.agronomy?.score || 0)} · Economía ${Math.round(d.economy?.score || 0)} · ${deltaText(c, result.baseline)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500);margin-top:3px">Ruta: ${c.path.map(x => esc(x.label || `${x.id} ${x.delta || x.value || ''}`)).join(' → ')}</div>
          <div style="display:flex;justify-content:flex-end;margin-top:7px"><button data-scenario-action="apply" data-scenario-id="${esc(c.id)}" style="cursor:pointer;border:1px solid ${experimental ? 'var(--accent-terracotta)' : 'var(--accent-olive)'};background:${experimental ? 'transparent' : 'var(--accent-olive)'};color:${experimental ? 'var(--accent-terracotta)' : 'var(--paper-0)'};padding:6px 10px;border-radius:4px;font-family:var(--font-mono);font-size:10px;font-weight:700">${experimental ? 'Probar escenario' : 'Aplicar escenario'}</button></div>
        </article>`;
      }).join('') : `<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">${esc(result.blockedReason || 'No apareció una alternativa viable bajo las restricciones activas.')}</div>`}
      <div id="perito-scenarios-status" style="min-height:14px;margin-top:8px;font-family:var(--font-mono);font-size:10px;color:var(--ink-500)"></div>
      <div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(26,20,16,.1);font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">El Perito consume SetasFormulatorAPI; no conoce controles internos del Formulador. Experimental = propuesta para ensayo, no rendimiento garantizado.</div>`;
    box.onclick = event => {
      const btn = event.target.closest('button[data-scenario-action]');
      if (!btn) return;
      if (btn.dataset.scenarioAction === 'apply') applyScenario(btn.dataset.scenarioId);
      else if (btn.dataset.scenarioAction === 'undo') undoScenario();
    };
    return true;
  };

  const compute = detail => {
    const formulator = globalThis.SetasFormulatorAPI;
    if (applying || !formulator || !detail?.an || !detail?.recipe?.length || !globalThis.SetasPeritoScenarios || !globalThis.SetasScoring) return;
    const runtime = resolveRuntime(detail.an);
    if (!runtime) return;
    const { analyzeFn, ings, spp, sKey } = runtime;
    const lots = activeLots();
    const stockIds = activeStockIds(lots);
    const useStock = useStockMode();
    const history = historyFor(sKey);
    const names = catalogNames(ings);
    const formState = formulator.getState(names);
    const liveRecipe = formState.recipe?.length ? formState.recipe : detail.recipe;
    const rawTotal = liveRecipe.reduce((sum, r) => sum + (Number(r.p) || 0), 0);
    if (rawTotal < 99 || rawTotal > 101) {
      const blocked = { baseline: { recipe: liveRecipe, evaluation: { dimensions: {} } }, explored: 0, pareto: [], recommended: [], blockedReason: `La receta suma ${rawTotal.toFixed(1)}%. Llévala a 100% (±1%) antes de explorar escenarios.` };
      lastResult = blocked;
      catalogCache = names;
      globalThis.__setasLastScenarios = blocked;
      if (!render(blocked, names)) requestAnimationFrame(() => render(blocked, names));
      return;
    }

    const compatibleIngs = ings.filter(g => !Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(sKey));
    const context = {
      sKey,
      spp,
      useStock,
      treatment: detail.treatment || null,
      stockIds,
      stockKgById: stockKgById(lots),
      ingredientMoistureById: Object.fromEntries(ings.map(g => [g.id, Number(g.moisture) || 0])),
      batchWetKg: formState.batchWetKg,
      targetMoisturePct: detail.an.sp?.moisture?.ideal ?? 65,
    };
    const analyzeAdapter = recipe => analyzeFn(recipe, sKey, ings);
    const scoreAdapter = (analysis, ctx) => scoreCandidate(analysis, { ...context, ...ctx, sKey });
    const result = globalThis.SetasPeritoScenarios.searchScenarios({
      recipe: liveRecipe,
      context,
      searchMode: 'hybrid',
      targetKey: sKey,
      spp,
      ingredients: compatibleIngs,
      analyze: analyzeAdapter,
      score: scoreAdapter,
      history,
      generations: 3,
      beamWidth: 14,
      stepPct: 4,
      useStock,
      stockIds,
      invLotes: lots,
      stockMap: context.stockKgById,
      roleCaps: roleCaps(detail.an),
      ingredientCaps: ingredientCaps(compatibleIngs, detail.an),
      lockedIds: formState.lockedIds,
    });
    // SetasFormulatorAPI does not expose optimizer profile, maxCost, maxSupp,
    // maxCafe, forceLowRisk or spawnOverride here. Do not synthesize operator
    // choices; the engine keeps its documented production-profile defaults
    // until those constraints are part of the formulator state/API.
    lastResult = result;
    catalogCache = names;
    globalThis.__setasLastScenarios = result;
    window.dispatchEvent(new CustomEvent('setas-perito-scenarios', { detail: result }));
    if (!render(result, names)) requestAnimationFrame(() => render(result, names));
  };

  window.addEventListener('setas-perito-model', e => {
    lastDetail = e.detail;
    if (!applying) queueMicrotask(() => compute(lastDetail));
  });

  const observer = new MutationObserver(() => {
    if (lastResult && !document.getElementById('perito-scenarios-v1')) render(lastResult, catalogCache || {});
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
