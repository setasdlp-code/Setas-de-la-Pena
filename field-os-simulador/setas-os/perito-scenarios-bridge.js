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
  let applying = false;
  let lastApplied = null;

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
    if (!sKey) return null;
    return { analyzeFn, ings, sKey };
  };

  const catalogNames = ingredients => Object.fromEntries((ingredients || []).map(g => [g.id, g.name || g.id]));
  const reverseNames = names => Object.fromEntries(Object.entries(names || {}).map(([id, name]) => [name, id]));

  const activeLots = () => readJson('sdp_lotes', [])
    .filter(l => l?.activo && Number(l.cantidadKgDisponible) > 0 && l.ingredienteId);
  const activeStockIds = lots => new Set((lots || activeLots()).map(l => l.ingredienteId));
  const stockKgById = lots => {
    const out = {};
    (lots || []).forEach(l => { out[l.ingredienteId] = (out[l.ingredienteId] || 0) + Number(l.cantidadKgDisponible || 0); });
    return out;
  };

  const historyFor = sKey => readJson('setas_v6', [])
    .filter(r => r?.sKey === sKey && Array.isArray(r.recipe))
    .map(r => ({ recipe: r.recipe }));

  const historyCalibrationFor = (sKey, recipe) => {
    const engine = globalThis.SetasPeritoScenarios;
    if (!engine?.recipeDistance) return null;
    const rows = readJson('setas_v6', [])
      .filter(r => r?.sKey === sKey && n(r.ebReal) != null && Array.isArray(r.recipe));
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

  const findBatchWetKg = () => {
    const root = document.getElementById('bl-perito')?.parentElement || document.querySelector('.builder-cols')?.parentElement || document.body;
    const m = (root.textContent || '').match(/([0-9]+(?:[.,][0-9]+)?)\s*[×x]\s*([0-9]+(?:[.,][0-9]+)?)\s*kg\s*=\s*([0-9]+(?:[.,][0-9]+)?)\s*kg/i);
    return m ? Number(m[3].replace(',', '.')) : null;
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

  const lockedIdsFromDom = names => {
    const reverse = reverseNames(names);
    const out = new Set();
    document.querySelectorAll('input[type="range"][aria-label^="Porcentaje de "]:disabled').forEach(input => {
      const name = (input.getAttribute('aria-label') || '').replace(/^Porcentaje de /, '');
      if (reverse[name]) out.add(reverse[name]);
    });
    return out;
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
      historyCalibration: historyCalibrationFor(context.sKey, context.recipe || []),
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
      __bridgeRecompute: true,
    });
  };

  const recipeText = (recipe, names) => recipe
    .slice()
    .sort((a, b) => b.p - a.p)
    .map(r => `${esc(names[r.id] || r.id)} ${Number(r.p).toFixed(1)}%`)
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

  const rangeForName = name => [...document.querySelectorAll('input[type="range"][aria-label^="Porcentaje de "]')]
    .find(el => el.getAttribute('aria-label') === `Porcentaje de ${name}`) || null;
  const numberForName = name => {
    const range = rangeForName(name);
    return range?.parentElement?.querySelector('input.rec-pct-input') || null;
  };
  const actionButton = label => [...document.querySelectorAll('button[aria-label]')]
    .find(btn => btn.getAttribute('aria-label') === label) || null;

  const recipeFromDom = names => {
    const reverse = reverseNames(names);
    const out = [];
    document.querySelectorAll('input[type="range"][aria-label^="Porcentaje de "]').forEach(range => {
      const name = (range.getAttribute('aria-label') || '').replace(/^Porcentaje de /, '');
      const id = reverse[name];
      if (!id) return;
      const input = range.parentElement?.querySelector('input.rec-pct-input') || range;
      const p = Number(input.value);
      if (Number.isFinite(p) && p > 0) out.push({ id, p });
    });
    return out;
  };

  const setNativeValue = (input, value) => {
    const proto = input instanceof HTMLInputElement ? HTMLInputElement.prototype : Object.getPrototypeOf(input);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(input, String(value));
    else input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const filterSnapshot = () => {
    const host = document.getElementById('bl-ingredientes');
    const search = host?.querySelector('input.search');
    const activeCat = host?.querySelector('button.cat.on[data-cat]');
    const pantryBtn = host?.querySelector('.bodega-bar-right button.tog');
    return {
      search: search?.value || '',
      cat: activeCat?.dataset?.cat || 'all',
      pantryOnly: pantryBtn?.textContent?.trim() === 'Ver todos',
    };
  };

  const prepareCatalog = async () => {
    const host = document.getElementById('bl-ingredientes');
    if (!host) return;
    const pantryBtn = host.querySelector('.bodega-bar-right button.tog');
    if (pantryBtn?.textContent?.trim() === 'Ver todos') { pantryBtn.click(); await waitFrame(); }
    const search = host.querySelector('input.search');
    if (search && search.value) { setNativeValue(search, ''); await waitFrame(); }
    const all = host.querySelector('button.cat[data-cat="all"]');
    if (all && !all.classList.contains('on')) { all.click(); await waitFrame(); }
  };

  const restoreCatalog = async snap => {
    const host = document.getElementById('bl-ingredientes');
    if (!host || !snap) return;
    const cat = host.querySelector(`button.cat[data-cat="${snap.cat}"]`);
    if (cat && !cat.classList.contains('on')) { cat.click(); await waitFrame(); }
    const search = host.querySelector('input.search');
    if (search && search.value !== snap.search) { setNativeValue(search, snap.search); await waitFrame(); }
    const pantryBtn = host.querySelector('.bodega-bar-right button.tog');
    const pantryNow = pantryBtn?.textContent?.trim() === 'Ver todos';
    if (pantryBtn && pantryNow !== snap.pantryOnly) { pantryBtn.click(); await waitFrame(); }
  };

  const autoAdjustButton = () => [...document.querySelectorAll('button.tog')]
    .find(btn => btn.textContent?.trim() === 'Auto-ajustar') || null;

  const applyRecipeViaDom = async (targetRecipe, expectedRecipe, names, force = false) => {
    const engine = globalThis.SetasPeritoScenarios;
    if (!engine?.recipeDistance) return { ok: false, message: 'Motor de escenarios no disponible.' };
    const current = recipeFromDom(names);
    if (!force && expectedRecipe && engine.recipeDistance(current, expectedRecipe) > 0.012) {
      return { ok: false, message: 'La receta cambió desde que se calculó este escenario. Espera el recálculo del Perito.' };
    }

    const filters = filterSnapshot();
    const autoBtn = autoAdjustButton();
    const autoWasOn = !!autoBtn?.classList.contains('on');
    try {
      if (autoWasOn) { autoBtn.click(); await waitFrame(); }
      await prepareCatalog();

      const beforeMap = Object.fromEntries(current.map(r => [r.id, r.p]));
      const targetMap = Object.fromEntries(targetRecipe.map(r => [r.id, Number(r.p) || 0]));
      const locked = lockedIdsFromDom(names);

      for (const id of locked) {
        if (Math.abs((beforeMap[id] || 0) - (targetMap[id] || 0)) > 0.15) {
          throw new Error(`${names[id] || id} está fijado; el escenario ya no es aplicable.`);
        }
      }

      const missing = targetRecipe.filter(r => !beforeMap[r.id]);
      for (const r of missing) {
        const name = names[r.id];
        if (!name || !actionButton(`Agregar ${name} a la receta`)) {
          throw new Error(`No se pudo preparar ${name || r.id} en el catálogo actual.`);
        }
      }

      const extras = current.filter(r => !targetMap[r.id]);
      for (const r of extras) {
        const name = names[r.id];
        const btn = name ? actionButton(`Quitar ${name} de la receta`) : null;
        if (!btn) throw new Error(`No se pudo retirar ${name || r.id}.`);
        btn.click();
        await waitFrame();
      }

      for (const r of missing) {
        const name = names[r.id];
        const btn = actionButton(`Agregar ${name} a la receta`);
        if (!btn) throw new Error(`No se pudo agregar ${name}.`);
        btn.click();
        await waitFrame();
      }

      for (const r of targetRecipe) {
        const name = names[r.id];
        const range = name ? rangeForName(name) : null;
        const input = name ? numberForName(name) : null;
        if (!range || !input) throw new Error(`No se encontró el control de ${name || r.id}.`);
        if (range.disabled) continue;
        const target = Math.round(Number(r.p) * 100) / 100;
        if (Math.abs(Number(input.value) - target) < 0.01) continue;
        setNativeValue(input, target);
        await waitFrame();
      }

      const after = recipeFromDom(names);
      if (engine.recipeDistance(after, targetRecipe) > 0.012) {
        throw new Error('El Formulador no alcanzó la composición propuesta; se canceló la aplicación.');
      }
      return { ok: true, recipe: after };
    } catch (err) {
      return { ok: false, message: err?.message || 'No se pudo aplicar el escenario.' };
    } finally {
      const liveAutoBtn = autoAdjustButton();
      if (autoWasOn && liveAutoBtn && !liveAutoBtn.classList.contains('on')) { liveAutoBtn.click(); await waitFrame(); }
      await restoreCatalog(filters);
    }
  };

  const setStatus = (text, kind = 'info') => {
    const el = document.getElementById('perito-scenarios-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = kind === 'error' ? '#9C2F22' : kind === 'ok' ? 'var(--accent-olive)' : 'var(--ink-500)';
  };

  const applyScenario = async scenarioId => {
    if (applying || !lastResult || !catalogCache) return;
    const scenario = (lastResult.recommended || []).find(c => c.id === scenarioId);
    if (!scenario) return;
    const before = recipeFromDom(catalogCache);
    applying = true;
    setStatus('Aplicando escenario…');
    const result = await applyRecipeViaDom(scenario.recipe, lastResult.baseline.recipe, catalogCache);
    if (!result.ok) {
      const now = recipeFromDom(catalogCache);
      if (globalThis.SetasPeritoScenarios.recipeDistance(now, before) > 0.005) {
        await applyRecipeViaDom(before, now, catalogCache, true);
      }
      applying = false;
      setStatus(result.message, 'error');
      return;
    }
    lastApplied = { before, after: result.recipe, type: scenario.type };
    applying = false;
    setStatus(`${TYPE_LABEL[scenario.type] || 'Escenario'} aplicado.`, 'ok');
    await waitFrame();
    if (lastDetail) compute(lastDetail);
  };

  const undoScenario = async () => {
    if (applying || !lastApplied || !catalogCache) return;
    const current = recipeFromDom(catalogCache);
    if (globalThis.SetasPeritoScenarios.recipeDistance(current, lastApplied.after) > 0.012) {
      setStatus('La receta cambió después del escenario; no se deshizo para evitar sobrescribir ajustes nuevos.', 'error');
      return;
    }
    applying = true;
    setStatus('Deshaciendo escenario…');
    const result = await applyRecipeViaDom(lastApplied.before, current, catalogCache, true);
    applying = false;
    if (!result.ok) { setStatus(result.message, 'error'); return; }
    lastApplied = null;
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
    const canUndo = !!lastApplied;
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:8px">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-500)">Perito · escenarios</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">${result.explored} variantes exploradas · ${result.pareto.length} Pareto</div>
      </div>
      ${canUndo ? '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button data-scenario-action="undo" style="cursor:pointer;border:1px solid var(--border-soft);background:var(--paper-0);padding:5px 9px;border-radius:4px;font-family:var(--font-mono);font-size:10px">↶ Deshacer escenario</button></div>' : ''}
      ${rows.length ? rows.map((c, i) => {
        const d = c.evaluation?.dimensions || {};
        const experimental = c.type === 'experimental';
        return `<article style="padding:${i ? '10px 0 0' : '0'};${i ? 'border-top:1px solid rgba(26,20,16,.10);margin-top:10px;' : ''}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
            <strong style="font-size:13px">${TYPE_LABEL[c.type] || 'Alternativa'}</strong>
            <span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Novedad ${Math.round(c.evaluation?.novelty || 0)}/100</span>
          </div>
          <div style="font-family:var(--font-mono);font-size:11px;line-height:1.45;margin-top:4px">${recipeText(c.recipe, names)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500);margin-top:4px">Seguridad ${Math.round(d.safety?.score || 0)} · Agronomía ${Math.round(d.agronomy?.score || 0)} · Economía ${Math.round(d.economy?.score || 0)} · ${deltaText(c, result.baseline)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500);margin-top:3px">Ruta: ${c.path.map(x => esc(x.label || `${x.id} ${x.delta || x.value || ''}`)).join(' → ')}</div>
          <div style="display:flex;justify-content:flex-end;margin-top:7px"><button data-scenario-action="apply" data-scenario-id="${esc(c.id)}" style="cursor:pointer;border:1px solid ${experimental ? 'var(--accent-terracotta)' : 'var(--accent-olive)'};background:${experimental ? 'transparent' : 'var(--accent-olive)'};color:${experimental ? 'var(--accent-terracotta)' : 'var(--paper-0)'};padding:6px 10px;border-radius:4px;font-family:var(--font-mono);font-size:10px;font-weight:700">${experimental ? 'Probar escenario' : 'Aplicar escenario'}</button></div>
        </article>`;
      }).join('') : `<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">${esc(result.blockedReason || 'No apareció una alternativa viable que domine suficientemente a la receta actual bajo las restricciones activas.')}</div>`}
      <div id="perito-scenarios-status" style="min-height:14px;margin-top:8px;font-family:var(--font-mono);font-size:10px;color:var(--ink-500)"></div>
      <div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(26,20,16,.1);font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">Escenarios calculados con el mismo analyze() y SetasScoring del Formulador. Se respetan ingredientes fijados y compatibilidad por especie. Experimental = propuesta para ensayo, no rendimiento garantizado.</div>`;

    box.onclick = event => {
      const btn = event.target.closest('button[data-scenario-action]');
      if (!btn) return;
      if (btn.dataset.scenarioAction === 'apply') applyScenario(btn.dataset.scenarioId);
      else if (btn.dataset.scenarioAction === 'undo') undoScenario();
    };
    return true;
  };

  const compute = detail => {
    if (applying || !detail?.an || !detail?.recipe?.length || !globalThis.SetasPeritoScenarios || !globalThis.SetasScoring) return;
    const runtime = resolveRuntime(detail.an);
    if (!runtime) return;
    const { analyzeFn, ings, sKey } = runtime;
    const lots = activeLots();
    const stockIds = activeStockIds(lots);
    const history = historyFor(sKey);
    const names = catalogNames(ings);
    const rawTotal = detail.recipe.reduce((sum, r) => sum + (Number(r.p) || 0), 0);
    if (rawTotal < 99 || rawTotal > 101) {
      const blocked = {
        baseline: { recipe: detail.recipe, evaluation: { dimensions: {} } },
        explored: 0,
        pareto: [],
        recommended: [],
        blockedReason: `La receta suma ${rawTotal.toFixed(1)}%. Llévala a 100% (±1%) antes de explorar escenarios para no normalizar cambios de forma implícita.`,
      };
      lastResult = blocked;
      catalogCache = names;
      globalThis.__setasLastScenarios = blocked;
      if (!render(blocked, names)) requestAnimationFrame(() => render(blocked, names));
      return;
    }

    const lockedIds = lockedIdsFromDom(names);
    const compatibleIngs = ings.filter(g => !Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(sKey));
    const context = {
      sKey,
      treatment: detail.treatment || null,
      stockIds,
      stockKgById: stockKgById(lots),
      ingredientMoistureById: Object.fromEntries(ings.map(g => [g.id, Number(g.moisture) || 0])),
      batchWetKg: findBatchWetKg(),
      targetMoisturePct: detail.an.sp?.moisture?.ideal ?? 65,
    };
    const analyzeAdapter = recipe => analyzeFn(recipe, sKey, ings);
    const scoreAdapter = (analysis, ctx) => scoreCandidate(analysis, { ...context, ...ctx, sKey });
    const result = globalThis.SetasPeritoScenarios.searchScenarios({
      recipe: detail.recipe,
      context,
      ingredients: compatibleIngs,
      analyze: analyzeAdapter,
      score: scoreAdapter,
      history,
      generations: 3,
      beamWidth: 14,
      stepPct: 4,
      useStock: useStockMode(),
      stockIds,
      roleCaps: roleCaps(detail.an),
      ingredientCaps: ingredientCaps(compatibleIngs, detail.an),
      lockedIds,
    });
    lastResult = result;
    catalogCache = names;
    globalThis.__setasLastScenarios = result;
    window.dispatchEvent(new CustomEvent('setas-perito-scenarios', { detail: result }));
    if (!render(result, catalogCache)) requestAnimationFrame(() => render(result, catalogCache));
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
