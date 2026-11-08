'use strict';

// API estable entre consumidores externos (Perito, pruebas, futuros agentes)
// y el estado del Formulador. App registra un adaptador nativo (simulador-app.jsx)
// que expone su estado real; sin ese adaptador no hay estado que leer ni receta
// que aplicar — no existe una ruta alterna que toque el DOM (D12, D17).
(function attachFormulatorApi() {
  if (globalThis.SetasFormulatorAPI?.version >= 1) return;

  let nativeAdapter = null;
  let lastTransaction = null;
  let registration = 0;
  const snapshotRecipe = rows => (rows || []).map(row => ({ ...row }));

  // Se lee al validar: mass-balance.js carga después de este archivo en el runtime protegido.
  const balanceTolerance = () => {
    const rv = globalThis.SetasMassBalance
      || (typeof require !== 'undefined' ? require('./mass-balance.js') : null);
    if (!rv) throw new Error('mass-balance.js no está cargado');
    return rv.MASS_BALANCE_TOLERANCE_PP;
  };
  const NO_ADAPTER = { ok: false, code: 'no_native_adapter', message: 'El Formulador no está listo para aplicar recetas.', adapter: null };

  const engine = () => globalThis.SetasPeritoScenarios;

  const getRecipe = () => snapshotRecipe(nativeAdapter?.getRecipe ? nativeAdapter.getRecipe() : []);
  const getLockedIds = () => (nativeAdapter?.getLockedIds ? new Set(nativeAdapter.getLockedIds() || []) : new Set());
  const getState = () => ({
    recipe: getRecipe(),
    lockedIds: getLockedIds(),
    batchWetKg: nativeAdapter?.getBatchWetKg ? nativeAdapter.getBatchWetKg() : null,
    adapter: nativeAdapter ? 'native' : null,
  });

  const validateRecipe = (targetRecipe, restoringDraft = false) => {
    const tol = balanceTolerance();
    if (!Array.isArray(targetRecipe) || (!restoringDraft && targetRecipe.length === 0)) {
      return 'La receta propuesta debe incluir al menos un ingrediente.';
    }
    const ids = new Set();
    let total = 0;
    for (const row of targetRecipe) {
      const id = typeof row?.id === 'string' ? row.id.trim() : '';
      const pct = Number(row?.p ?? row?.pct);
      if (!id) return 'La receta propuesta contiene un ingrediente sin identificador válido.';
      if (ids.has(id)) return `La receta propuesta repite el ingrediente ${id}.`;
      if (!Number.isFinite(pct) || pct < 0 || (!restoringDraft && pct === 0)) return `El porcentaje de ${id} debe ser un número positivo y finito.`;
      ids.add(id);
      total += pct;
    }
    if (!restoringDraft && Math.abs(total - 100) > tol) {
      return `La receta propuesta suma ${total.toFixed(2)}%; debe sumar 100% (±${tol}%).`;
    }
    return null;
  };

  const applyRecipeInternal = async (targetRecipe, options = {}, restoringDraft = false) => {
    const names = options.names || {};
    const validationError = validateRecipe(targetRecipe, restoringDraft);
    if (validationError) return { ok: false, message: validationError, adapter: nativeAdapter ? 'native' : null };
    if (!nativeAdapter?.applyRecipe) return { ...NO_ADAPTER };
    const adapter = nativeAdapter;
    const activeRegistration = registration;
    // Match the shape accepted by validation without rescaling percentages.
    const target = targetRecipe.map(row => ({ ...row, id: row.id.trim(), p: Number(row.p ?? row.pct) }));
    const before = getRecipe(names);

    const distanceFn = engine()?.recipeDistance;
    if (!options.force && options.expectedRecipe && typeof distanceFn === 'function' && distanceFn(before, options.expectedRecipe) > 0.012) {
      return { ok: false, message: 'La receta cambió desde que se calculó este escenario. Esperar el recálculo del Perito.' };
    }
    const guardLockedIds = getLockedIds(names);
    const beforeMap = Object.fromEntries(before.map(r => [r.id, r.p]));
    const targetMap = Object.fromEntries(target.map(r => [r.id, r.p]));
    for (const id of guardLockedIds) {
      if (Math.abs((beforeMap[id] || 0) - (targetMap[id] || 0)) > 0.15) {
        return { ok: false, message: `${names[id] || id} está fijado; la receta propuesta ya no es aplicable.` };
      }
    }

    let result;
    try {
      const res = await adapter.applyRecipe(target, options);
      if (res === true) result = { ok: true, recipe: snapshotRecipe(target), adapter: 'native' };
      else if (res && typeof res === 'object' && res.ok !== false) result = { ok: true, recipe: snapshotRecipe(res.recipe || target), adapter: 'native' };
      else if (res && typeof res === 'object' && res.ok === false) result = { ok: false, message: res.message || 'El adaptador nativo rechazó la receta.', adapter: 'native' };
      else result = { ok: false, message: 'El adaptador nativo no devolvió un resultado válido.', adapter: 'native' };
    } catch (err) {
      result = { ok: false, message: err?.message || 'Falló el adaptador nativo.', adapter: 'native' };
    }

    // An async result cannot install history in another Formulador session.
    if (registration !== activeRegistration) {
      return { ok: false, code: 'adapter_changed', message: 'El Formulador cambió mientras se aplicaba la receta. Recalcular antes de continuar.', adapter: nativeAdapter ? 'native' : null };
    }

    if (!result.ok) {
      return result;
    }

    if (options.recordHistory !== false) {
      lastTransaction = { before: snapshotRecipe(before), after: snapshotRecipe(result.recipe), names: { ...names }, at: Date.now() };
    }
    return result;
  };

  // Solo deshacer una transacción propia puede restaurar un borrador incompleto.
  const applyRecipe = async (targetRecipe, options = {}) => applyRecipeInternal(targetRecipe, options);

  const undoRecipe = async (options = {}) => {
    if (!nativeAdapter?.applyRecipe) return { ...NO_ADAPTER };
    if (!lastTransaction) return { ok: false, message: 'No hay un escenario para deshacer.' };
    const names = options.names || lastTransaction.names || {};
    const current = getRecipe(names);
    const distance = engine()?.recipeDistance;
    if (!options.force && typeof distance === 'function' && distance(current, lastTransaction.after) > 0.012) {
      return { ok: false, message: 'La receta cambió después del escenario; no se deshizo para evitar sobrescribir ajustes nuevos.' };
    }
    const tx = lastTransaction;
    const result = await applyRecipeInternal(tx.before, { ...options, names, expectedRecipe: current, force: true, recordHistory: false }, true);
    if (result.ok) lastTransaction = null;
    return result;
  };

  const registerNativeAdapter = adapter => {
    if (!adapter || typeof adapter.getRecipe !== 'function' || typeof adapter.applyRecipe !== 'function') {
      throw new Error('SetasFormulatorAPI.registerNativeAdapter requiere getRecipe() y applyRecipe().');
    }
    nativeAdapter = adapter;
    const ownRegistration = ++registration;
    lastTransaction = null;
    return () => {
      if (registration === ownRegistration) {
        nativeAdapter = null;
        registration++;
        lastTransaction = null;
      }
    };
  };

  globalThis.SetasFormulatorAPI = {
    version: 1,
    getRecipe,
    getLockedIds,
    getState,
    applyRecipe,
    undoRecipe,
    canUndo: () => !!lastTransaction,
    validateRecipe: targetRecipe => validateRecipe(targetRecipe),
    registerNativeAdapter,
    adapterType: () => nativeAdapter ? 'native' : null,
  };
})();
