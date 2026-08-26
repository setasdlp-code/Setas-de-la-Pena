'use strict';

// API estable entre consumidores externos (Perito, pruebas, futuros agentes)
// y el estado del Formulador. Hoy incluye un adaptador DOM conservador porque
// App todavía no expone sus setters; cuando App registre un adaptador nativo,
// los consumidores no necesitan cambiar.
(function attachFormulatorApi() {
  if (globalThis.SetasFormulatorAPI?.version >= 1) return;

  let nativeAdapter = null;
  let lastTransaction = null;
  const RECIPE_TOTAL_TOLERANCE = 0.15;

  const engine = () => globalThis.SetasPeritoScenarios;
  const waitFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const reverseNames = names => Object.fromEntries(Object.entries(names || {}).map(([id, name]) => [name, id]));

  const rangeForName = name => [...document.querySelectorAll('input[type="range"][aria-label^="Porcentaje de "]')]
    .find(el => el.getAttribute('aria-label') === `Porcentaje de ${name}`) || null;
  const numberForName = name => rangeForName(name)?.parentElement?.querySelector('input.rec-pct-input') || null;
  const actionButton = label => [...document.querySelectorAll('button[aria-label]')]
    .find(btn => btn.getAttribute('aria-label') === label) || null;

  const setNativeValue = (input, value) => {
    const proto = input instanceof HTMLInputElement ? HTMLInputElement.prototype : Object.getPrototypeOf(input);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(input, String(value));
    else input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const readRecipeFromDom = names => {
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

  const readLockedFromDom = names => {
    const reverse = reverseNames(names);
    const out = new Set();
    document.querySelectorAll('input[type="range"][aria-label^="Porcentaje de "]:disabled').forEach(input => {
      const name = (input.getAttribute('aria-label') || '').replace(/^Porcentaje de /, '');
      if (reverse[name]) out.add(reverse[name]);
    });
    return out;
  };

  const readBatchWetKgFromDom = () => {
    const root = document.getElementById('bl-perito')?.parentElement || document.querySelector('.builder-cols')?.parentElement || document.body;
    const m = (root.textContent || '').match(/([0-9]+(?:[.,][0-9]+)?)\s*[×x]\s*([0-9]+(?:[.,][0-9]+)?)\s*kg\s*=\s*([0-9]+(?:[.,][0-9]+)?)\s*kg/i);
    return m ? Number(m[3].replace(',', '.')) : null;
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

  const mutateDom = async (targetRecipe, { expectedRecipe = null, names = {}, force = false } = {}) => {
    const distance = engine()?.recipeDistance;
    if (typeof distance !== 'function') return { ok: false, message: 'Motor de escenarios no disponible.' };
    const current = readRecipeFromDom(names);
    if (!force && expectedRecipe && distance(current, expectedRecipe) > 0.012) {
      return { ok: false, message: 'La receta cambió desde que se calculó este escenario. Espera el recálculo del Perito.' };
    }

    const filters = filterSnapshot();
    const autoWasOn = !!autoAdjustButton()?.classList.contains('on');
    try {
      if (autoWasOn) { autoAdjustButton()?.click(); await waitFrame(); }
      await prepareCatalog();

      const beforeMap = Object.fromEntries(current.map(r => [r.id, r.p]));
      const targetMap = Object.fromEntries((targetRecipe || []).map(r => [r.id, Number(r.p) || 0]));
      const locked = readLockedFromDom(names);

      for (const id of locked) {
        if (Math.abs((beforeMap[id] || 0) - (targetMap[id] || 0)) > 0.15) {
          throw new Error(`${names[id] || id} está fijado; la receta propuesta ya no es aplicable.`);
        }
      }

      const missing = targetRecipe.filter(r => !beforeMap[r.id]);
      for (const r of missing) {
        const name = names[r.id];
        if (!name || !actionButton(`Agregar ${name} a la receta`)) throw new Error(`No se pudo preparar ${name || r.id} en el catálogo actual.`);
      }

      for (const r of current.filter(r => !targetMap[r.id])) {
        const name = names[r.id];
        const btn = name ? actionButton(`Quitar ${name} de la receta`) : null;
        if (!btn) throw new Error(`No se pudo retirar ${name || r.id}.`);
        btn.click();
        await waitFrame();
      }

      for (const r of missing) {
        const name = names[r.id];
        const btn = actionButton(`Agregar ${name} a la receta`);
        if (!btn) throw new Error(`No se pudo agregar ${name || r.id}.`);
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

      const after = readRecipeFromDom(names);
      if (distance(after, targetRecipe) > 0.012) throw new Error('El Formulador no alcanzó la composición propuesta.');
      return { ok: true, recipe: after, adapter: 'dom' };
    } catch (err) {
      return { ok: false, message: err?.message || 'No se pudo aplicar la receta.', adapter: 'dom' };
    } finally {
      const liveAutoBtn = autoAdjustButton();
      if (autoWasOn && liveAutoBtn && !liveAutoBtn.classList.contains('on')) { liveAutoBtn.click(); await waitFrame(); }
      await restoreCatalog(filters);
    }
  };

  const getRecipe = names => {
    if (nativeAdapter?.getRecipe) return nativeAdapter.getRecipe();
    return readRecipeFromDom(names || {});
  };

  const getLockedIds = names => {
    if (nativeAdapter?.getLockedIds) return new Set(nativeAdapter.getLockedIds() || []);
    return readLockedFromDom(names || {});
  };

  const getState = names => ({
    recipe: getRecipe(names),
    lockedIds: getLockedIds(names),
    batchWetKg: nativeAdapter?.getBatchWetKg ? nativeAdapter.getBatchWetKg() : readBatchWetKgFromDom(),
    adapter: nativeAdapter ? 'native' : 'dom',
  });

  const validateRecipe = targetRecipe => {
    if (!Array.isArray(targetRecipe) || targetRecipe.length === 0) {
      return 'La receta propuesta debe incluir al menos un ingrediente.';
    }
    const ids = new Set();
    let total = 0;
    for (const row of targetRecipe) {
      const id = typeof row?.id === 'string' ? row.id.trim() : '';
      const pct = Number(row?.p ?? row?.pct);
      if (!id) return 'La receta propuesta contiene un ingrediente sin identificador válido.';
      if (ids.has(id)) return `La receta propuesta repite el ingrediente ${id}.`;
      if (!Number.isFinite(pct) || pct <= 0) return `El porcentaje de ${id} debe ser un número positivo y finito.`;
      ids.add(id);
      total += pct;
    }
    if (Math.abs(total - 100) > RECIPE_TOTAL_TOLERANCE) {
      return `La receta propuesta suma ${total.toFixed(2)}%; debe sumar 100% (±${RECIPE_TOTAL_TOLERANCE}%).`;
    }
    return null;
  };

  const applyRecipe = async (targetRecipe, options = {}) => {
    const names = options.names || {};
    const validationError = validateRecipe(targetRecipe);
    if (validationError) return { ok: false, message: validationError, adapter: nativeAdapter ? 'native' : 'dom' };
    const before = getRecipe(names);

    const distanceFn = engine()?.recipeDistance;
    if (!options.force && options.expectedRecipe && typeof distanceFn === 'function' && distanceFn(before, options.expectedRecipe) > 0.012) {
      return { ok: false, message: 'La receta cambió desde que se calculó este escenario. Espera el recálculo del Perito.' };
    }
    const guardLockedIds = getLockedIds(names);
    const beforeMap = Object.fromEntries(before.map(r => [r.id, r.p]));
    const targetMap = Object.fromEntries((targetRecipe || []).map(r => [r.id, Number(r.p) || 0]));
    for (const id of guardLockedIds) {
      if (Math.abs((beforeMap[id] || 0) - (targetMap[id] || 0)) > 0.15) {
        return { ok: false, message: `${names[id] || id} está fijado; la receta propuesta ya no es aplicable.` };
      }
    }

    let result;
    if (nativeAdapter?.applyRecipe) {
      try {
        result = await nativeAdapter.applyRecipe(targetRecipe, options);
        if (result === true) result = { ok: true, recipe: getRecipe(names), adapter: 'native' };
        if (!result || typeof result !== 'object') result = { ok: false, message: 'El adaptador nativo no devolvió un resultado válido.', adapter: 'native' };
      } catch (err) {
        result = { ok: false, message: err?.message || 'Falló el adaptador nativo.', adapter: 'native' };
      }
    } else {
      result = await mutateDom(targetRecipe, options);
    }

    if (!result.ok) {
      const now = getRecipe(names);
      const distance = engine()?.recipeDistance;
      if (!nativeAdapter && typeof distance === 'function' && distance(now, before) > 0.005) {
        await mutateDom(before, { names, expectedRecipe: now, force: true });
      }
      return result;
    }

    if (options.recordHistory !== false) {
      lastTransaction = { before, after: result.recipe || getRecipe(names), names, at: Date.now() };
    }
    return result;
  };

  const undoRecipe = async (options = {}) => {
    if (!lastTransaction) return { ok: false, message: 'No hay un escenario para deshacer.' };
    const names = options.names || lastTransaction.names || {};
    const current = getRecipe(names);
    const distance = engine()?.recipeDistance;
    if (!options.force && typeof distance === 'function' && distance(current, lastTransaction.after) > 0.012) {
      return { ok: false, message: 'La receta cambió después del escenario; no se deshizo para evitar sobrescribir ajustes nuevos.' };
    }
    const tx = lastTransaction;
    const result = await applyRecipe(tx.before, { ...options, names, expectedRecipe: current, force: true, recordHistory: false });
    if (result.ok) lastTransaction = null;
    return result;
  };

  const registerNativeAdapter = adapter => {
    if (!adapter || typeof adapter.getRecipe !== 'function' || typeof adapter.applyRecipe !== 'function') {
      throw new Error('SetasFormulatorAPI.registerNativeAdapter requiere getRecipe() y applyRecipe().');
    }
    nativeAdapter = adapter;
    return () => { if (nativeAdapter === adapter) nativeAdapter = null; };
  };

  globalThis.SetasFormulatorAPI = {
    version: 1,
    getRecipe,
    getLockedIds,
    getState,
    applyRecipe,
    undoRecipe,
    canUndo: () => !!lastTransaction,
    validateRecipe,
    registerNativeAdapter,
    adapterType: () => nativeAdapter ? 'native' : 'dom',
  };
})();
