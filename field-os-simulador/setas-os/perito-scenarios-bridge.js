'use strict';
import './perito-scenarios.js';

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

  const readJson = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  };

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
    if (!sKey) return null;
    return { analyzeFn, ings, sKey };
  };

  const catalogNames = ingredients => Object.fromEntries((ingredients || []).map(g => [g.id, g.name || g.id]));

  const activeLots = () => readJson('sdp_lotes', [])
    .filter(l => l?.activo && Number(l.cantidadKgDisponible) > 0 && l.ingredienteId);

  const activeStockIds = lots => new Set((lots || activeLots()).map(l => l.ingredienteId));

  const historyFor = sKey => readJson('setas_v6', [])
    .filter(r => r?.sKey === sKey && Array.isArray(r.recipe))
    .map(r => ({ recipe: r.recipe }));

  const useStockMode = () => {
    try { return localStorage.getItem('setas_workmode') !== 'catalogo'; }
    catch (_) { return true; }
  };

  const roleCaps = an => ({
    supplement: Number(an?.sp?.supplementation_max) || 20,
    suplemento: Number(an?.sp?.supplementation_max) || 20,
    mineral: 8,
    air: 30,
    aireador: 30,
    base: 100,
  });

  const ingredientCaps = (ings, an) => {
    const caps = {};
    const suppMax = Number(an?.sp?.supplementation_max) || 20;
    (ings || []).forEach(g => {
      const role = String(g.role || '').toLowerCase();
      if (role.includes('supp') || role.includes('supl')) caps[g.id] = suppMax;
      else if (role.includes('mineral')) caps[g.id] = 8;
      else if (role.includes('air') || role.includes('aire')) caps[g.id] = 30;
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
    let scoredAnalysis = analysis;
    if (globalThis.SetasEconomy && Array.isArray(context.recipe)) {
      try {
        const prices = globalThis.SetasEconomy.priceMapFromLots(activeLots());
        const real = globalThis.SetasEconomy.recipeCostPerKgAsFormulated(context.recipe, prices);
        if (real.copPerKg != null) scoredAnalysis = { ...analysis, cost: real.copPerKg };
      } catch (_) {}
    }
    return scoring.scoreRecipe(scoredAnalysis, {
      ...context,
      treatment,
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
      __bridgeRecompute: true,
    });
  };

  const recipeText = (recipe, names) => recipe
    .slice()
    .sort((a, b) => b.p - a.p)
    .map(r => `${names[r.id] || r.id} ${Number(r.p).toFixed(1)}%`)
    .join(' · ');

  const deltaText = (candidate, baseline) => {
    const cd = candidate.evaluation?.dimensions || {};
    const bd = baseline.evaluation?.dimensions || {};
    const fmt = (a, b) => {
      const d = Math.round((a || 0) - (b || 0));
      return `${d >= 0 ? '+' : ''}${d}`;
    };
    return `Seguridad ${fmt(cd.safety?.score, bd.safety?.score)} · Agronomía ${fmt(cd.agronomy?.score, bd.agronomy?.score)} · Economía ${fmt(cd.economy?.score, bd.economy?.score)}`;
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
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:8px">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-500)">Perito · escenarios</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">${result.explored} variantes exploradas · ${result.pareto.length} Pareto</div>
      </div>
      ${rows.length ? rows.map((c, i) => {
        const d = c.evaluation?.dimensions || {};
        return `<article style="padding:${i ? '10px 0 0' : '0'};${i ? 'border-top:1px solid rgba(26,20,16,.10);margin-top:10px;' : ''}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
            <strong style="font-size:13px">${TYPE_LABEL[c.type] || 'Alternativa'}</strong>
            <span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Novedad ${Math.round(c.evaluation?.novelty || 0)}/100</span>
          </div>
          <div style="font-family:var(--font-mono);font-size:11px;line-height:1.45;margin-top:4px">${recipeText(c.recipe, names)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500);margin-top:4px">Seguridad ${Math.round(d.safety?.score || 0)} · Agronomía ${Math.round(d.agronomy?.score || 0)} · Economía ${Math.round(d.economy?.score || 0)} · ${deltaText(c, result.baseline)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500);margin-top:3px">Ruta: ${c.path.map(x => x.label || `${x.id} ${x.delta || x.value || ''}`).join(' → ')}</div>
        </article>`;
      }).join('') : '<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">No apareció una alternativa viable que domine suficientemente a la receta actual bajo las restricciones activas.</div>'}
      <div style="margin-top:9px;padding-top:7px;border-top:1px solid rgba(26,20,16,.1);font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Escenarios calculados con el mismo analyze() y SetasScoring del Formulador. Experimental = propuesta para ensayo, no rendimiento garantizado.</div>`;
    return true;
  };

  const compute = detail => {
    if (!detail?.an || !detail?.recipe?.length || !globalThis.SetasPeritoScenarios || !globalThis.SetasScoring) return;
    const runtime = resolveRuntime(detail.an);
    if (!runtime) return;
    const { analyzeFn, ings, sKey } = runtime;
    const lots = activeLots();
    const stockIds = activeStockIds(lots);
    const history = historyFor(sKey);
    const context = {
      sKey,
      treatment: detail.treatment || null,
      stockIds,
      historyCalibration: detail.baseline?.calibration?.history || null,
    };
    const analyzeAdapter = recipe => analyzeFn(recipe, sKey, ings);
    const scoreAdapter = (analysis, ctx) => scoreCandidate(analysis, { ...context, ...ctx, sKey });
    const result = globalThis.SetasPeritoScenarios.searchScenarios({
      recipe: detail.recipe,
      context,
      ingredients: ings,
      analyze: analyzeAdapter,
      score: scoreAdapter,
      history,
      generations: 3,
      beamWidth: 14,
      stepPct: 4,
      useStock: useStockMode(),
      stockIds,
      roleCaps: roleCaps(detail.an),
      ingredientCaps: ingredientCaps(ings, detail.an),
    });
    lastResult = result;
    catalogCache = catalogNames(ings);
    globalThis.__setasLastScenarios = result;
    window.dispatchEvent(new CustomEvent('setas-perito-scenarios', { detail: result }));
    if (!render(result, catalogCache)) requestAnimationFrame(() => render(result, catalogCache));
  };

  window.addEventListener('setas-perito-model', e => {
    lastDetail = e.detail;
    queueMicrotask(() => compute(lastDetail));
  });

  const observer = new MutationObserver(() => {
    if (lastResult && !document.getElementById('perito-scenarios-v1')) render(lastResult, catalogCache || {});
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
