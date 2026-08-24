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
    let analyzeFn = (typeof globalThis.analyze === 'function' ? globalThis.analyze : null) || readLexical('typeof analyze === "function" ? analyze : null') || (typeof globalThis.SetasRecipeOptimizer?.analyze === 'function' ? globalThis.SetasRecipeOptimizer.analyze : null);
    let ings = (Array.isArray(globalThis.INGS) && globalThis.INGS.length ? globalThis.INGS : null) || readLexical('typeof INGS !== "undefined" ? INGS : null');
    let spp = (globalThis.SPP && typeof globalThis.SPP === 'object' ? globalThis.SPP : null) || readLexical('typeof SPP !== "undefined" ? SPP : null');
    if (typeof analyzeFn !== 'function' || !Array.isArray(ings)) return null;
    let sKey = null;
    if (spp && an?.sp) sKey = Object.keys(spp).find(k => spp[k] === an.sp || spp[k]?.name === an.sp?.name) || null;
    if (!sKey) {
      const name = an?.sp?.name || an?.sp?.common || an?.sp?.label;
      sKey = SPECIES_KEY_BY_NAME[name] || null;
    }
    return sKey ? { analyzeFn, ings, spp: spp || {}, sKey } : null;
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
    const calib = globalThis.SetasHistoricalCalibration;
    if (!engine?.recipeDistance || !calib?.weightedCalibration) return null;
    const trialRows = readJson('setas_v6', []).filter(r => r?.sKey === sKey && n(r.ebReal) != null && Array.isArray(r.recipe));
    const rows = [...bitacoraTrialRows(sKey), ...trialRows];
    return calib.weightedCalibration(recipe, rows, engine.recipeDistance);
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

  const recipeText = (recipe, names, addedIngredients = []) => {
    const addedMap = new Map((addedIngredients || []).map(x => [x.id, x]));
    return recipe.slice().sort((a, b) => b.p - a.p)
      .map(r => {
        const added = addedMap.get(r.id);
        const name = esc(names[r.id] || r.id);
        if (added && added.isNew) {
          return `<strong style="color:var(--accent-olive,#496E4C)">+ ${name} ${Number(r.p).toFixed(1)}%</strong>`;
        }
        if (added && added.delta > 0) {
          return `<span style="color:var(--accent-olive,#496E4C)">${name} ${Number(r.p).toFixed(1)}% (+${added.delta}%)</span>`;
        }
        return `${name} ${Number(r.p).toFixed(1)}%`;
      }).join(' · ');
  };

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

  const TYPE_CONFIG = {
    conservadora: {
      label: 'Conservadora · Estándar',
      badgeBg: 'var(--accent-blue-grey-dim, #DEE5E7)',
      badgeColor: 'var(--accent-blue-grey, #5E7080)',
      btnBg: 'var(--accent-blue-grey, #5E7080)',
      btnColor: 'var(--paper-0, #F7F4EC)',
    },
    rendimiento: {
      label: 'Rendimiento · Alta Proteína',
      badgeBg: 'var(--accent-olive-dim, #DCE1D1)',
      badgeColor: 'var(--accent-olive, #5B6B44)',
      btnBg: 'var(--accent-olive, #5B6B44)',
      btnColor: 'var(--paper-0, #F7F4EC)',
    },
    economia: {
      label: 'Económica · Subproductos',
      badgeBg: 'var(--accent-terracotta-dim, #EFE0D3)',
      badgeColor: 'var(--accent-terracotta, #A85C32)',
      btnBg: 'var(--accent-terracotta, #A85C32)',
      btnColor: 'var(--paper-0, #F7F4EC)',
    },
    experimental: {
      label: 'Experimental · Novedad',
      badgeBg: 'var(--accent-mushroom-dim, #E7E0D3)',
      badgeColor: 'var(--accent-mushroom, #7A6A52)',
      btnBg: 'var(--paper-0, #F7F4EC)',
      btnColor: 'var(--accent-mushroom, #7A6A52)',
      btnBorder: '1px solid var(--accent-mushroom, #7A6A52)',
    },
    alternativa: {
      label: 'Alternativa Equilibrada',
      badgeBg: 'var(--paper-2, #E5DFD0)',
      badgeColor: 'var(--ink-1, #3C392F)',
      btnBg: 'var(--accent-olive, #5B6B44)',
      btnColor: 'var(--paper-0, #F7F4EC)',
    },
  };

  const render = (result, names) => {
    const root = document.getElementById('bl-perito');
    if (!root) return false;
    let box = document.getElementById('perito-scenarios-v1');
    if (!box) {
      box = document.createElement('section');
      box.id = 'perito-scenarios-v1';
      box.style.cssText = 'margin:12px 0 14px;padding:12px 14px;border:1px solid var(--border-hairline,#8C7F5B);border-radius:var(--radius-md,3px);background:var(--paper-0,#F7F4EC);font-family:var(--font-body);box-shadow:var(--shadow-card-rest,0 1px 4px rgba(26,20,16,.05));';
      const model = document.getElementById('perito-model-v2');
      if (model?.parentElement === root) root.insertBefore(box, model.nextSibling);
      else root.insertBefore(box, root.firstChild?.nextSibling || null);
    }
    const rows = result.recommended || [];
    const formulator = globalThis.SetasFormulatorAPI;
    const canUndo = !!formulator?.canUndo();
    const adapter = formulator?.adapterType?.() || 'none';
    const isPartial = !!result.isPartial;
    const partialTotal = result.partialTotal ?? 0;

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:8px;flex-wrap:wrap">
        <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${isPartial ? 'var(--accent-olive,#5B6B44)' : 'var(--ink-0,#1E1D19)'};font-weight:700">${isPartial ? `🌱 Asistente de Co-formulación · ${partialTotal}% anclado` : 'Perito · Escenarios Recomendados'}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-2)">${result.explored} explorados · ${result.pareto?.length || 0} Pareto</div>
      </div>
      ${canUndo ? '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button data-scenario-action="undo" style="cursor:pointer;min-height:36px;border:1px solid var(--border-hairline,#8C7F5B);background:var(--paper-1,#EFEBE0);padding:5px 10px;border-radius:var(--radius-sm,2px);font-family:var(--font-mono);font-size:10px;font-weight:600;color:var(--ink-0)">↶ Deshacer escenario</button></div>' : ''}
      ${rows.length ? rows.map((c, i) => {
        const d = c.evaluation?.dimensions || {};
        const an = c.evaluation?.analysis || {};
        const conf = TYPE_CONFIG[c.type] || TYPE_CONFIG.alternativa;
        const buttonLabel = isPartial ? 'Completar mi receta' : (c.type === 'experimental' ? 'Probar escenario' : 'Aplicar a mi receta');
        return `<article class="coform-card" style="padding:10px 12px;margin-top:10px;border:1px solid var(--border-hairline,#8C7F5B);border-radius:var(--radius-md,3px);background:var(--paper-1,#EFEBE0);box-shadow:var(--shadow-card-rest,0 1px 4px rgba(26,20,16,.05));">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;padding:2px 6px;border-radius:2px;background:${conf.badgeBg};color:${conf.badgeColor};border:1px solid ${conf.badgeColor};letter-spacing:.04em;text-transform:uppercase;">${conf.label}</span>
            <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-0);">${c.evaluation?.score ? `Score ${Math.round(c.evaluation.score)} pts` : ''}</span>
          </div>
          <div style="font-family:var(--font-sans);font-size:12px;line-height:1.45;color:var(--ink-0);margin-bottom:6px;font-weight:500;">
            ${recipeText(c.recipe, names, c.addedIngredients)}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px;padding:4px 6px;background:var(--paper-0,#F7F4EC);border:1px solid var(--border-hairline,#8C7F5B);border-radius:2px;text-align:center;">
            <div><div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-2);text-transform:uppercase;">C:N</div><div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-0);">${Math.round(an.cn || 0)}:1</div></div>
            <div><div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-2);text-transform:uppercase;">EB est.</div><div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-0);">${Math.round(an.eb || 0)}%</div></div>
            <div><div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-2);text-transform:uppercase;">Costo</div><div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink-0);">$${Math.round(an.cost || 0)}/kg</div></div>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <button data-scenario-action="apply" data-scenario-id="${esc(c.id)}" style="cursor:pointer;min-height:44px;width:100%;border:${conf.btnBorder || '1px solid ' + conf.btnBg};background:${conf.btnBg};color:${conf.btnColor};padding:8px 14px;border-radius:var(--radius-md,3px);font-family:var(--font-sans);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;transition:filter .15s;">
              ${buttonLabel} →
            </button>
          </div>
        </article>`;
      }).join('') : `<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">${esc(result.blockedReason || 'No apareció una alternativa viable bajo las restricciones activas.')}</div>`}
      ${!isPartial && rows.length ? `
      <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(26,20,16,.1)">
        <button data-scenario-action="save-receta" style="cursor:pointer;min-height:40px;border:1px solid var(--border-hairline,#8C7F5B);background:var(--paper-1,#EFEBE0);padding:6px 12px;border-radius:var(--radius-md,3px);font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--ink-0)">💾 Guardar en Recetario</button>
        <button data-scenario-action="create-batch" style="cursor:pointer;min-height:40px;border:1px solid var(--border-hairline,#8C7F5B);background:var(--paper-1,#EFEBE0);padding:6px 12px;border-radius:var(--radius-md,3px);font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--ink-0)">📦 Crear Lote en Bitácora</button>
      </div>` : ''}
      <div id="perito-scenarios-status" style="min-height:14px;margin-top:8px;font-family:var(--font-mono);font-size:10px;color:var(--ink-500)"></div>
      <div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(26,20,16,.1);font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">El Perito consume SetasFormulatorAPI; no conoce controles internos del Formulador. Co-formulación ajusta reactivamente las sugerencias respetando tus ingredientes.</div>`;
    box.onclick = event => {
      const btn = event.target.closest('button[data-scenario-action]');
      if (!btn) return;
      const action = btn.dataset.scenarioAction;
      if (action === 'apply') applyScenario(btn.dataset.scenarioId);
      else if (action === 'undo') undoScenario();
      else if (action === 'save-receta') {
        const saveBtn = document.querySelector('button[aria-label="Guardar receta en Recetario"]');
        if (saveBtn) saveBtn.click();
        setStatus('Receta lista para guardar en Recetario.', 'ok');
      }
      else if (action === 'create-batch') {
        document.getElementById('bl-batch')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setStatus('Desplazado a sección de Lote / Batch.', 'ok');
      }
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
    if (rawTotal > 101) {
      const blocked = { baseline: { recipe: liveRecipe, evaluation: { dimensions: {} } }, explored: 0, pareto: [], recommended: [], blockedReason: `La receta suma ${rawTotal.toFixed(1)}%. Reduce ingredientes para no superar 100%.` };
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
