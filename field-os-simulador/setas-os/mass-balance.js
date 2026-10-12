'use strict';

/**
 * @file mass-balance.js — la tolerancia única de balance de masa de una receta.
 *
 * Se llamaba `recipe-version.js`, nombre heredado de un alcance que nunca se
 * construyó (identidad y reglas de versión de receta). Lo que hay aquí es una
 * sola cosa: ¿suman los porcentajes de la receta 100 % dentro de tolerancia?
 * El versionado real vive en `recipe-lifecycle.js`, que es donde uno va a
 * buscarlo — y que además tenía que pedirle esta tolerancia a un archivo que
 * parecía ser su propio tema. El nombre viejo no sólo no describía el
 * contenido: mandaba a leer el archivo equivocado.
 *
 * Existe para que la tolerancia sea UNA, compartida por el Formulador
 * (`formulator-api.js`), el ciclo de vida (`recipe-lifecycle.js`) y la UI
 * (`simulador-app.jsx`): si cada uno llevara la suya, una receta podría ser
 * válida al aplicarla e inválida al aprobarla.
 */
(function initMassBalance() {
const MASS_BALANCE_TOLERANCE_PP = 0.5;

const totalPct = (rows = []) => (rows || []).reduce((s, r) => s + (parseFloat(r?.p ?? r?.pct) || 0), 0);
const isMassBalancedTotal = tot => Number.isFinite(tot) && Math.abs(tot - 100) <= MASS_BALANCE_TOLERANCE_PP + 1e-9;

// Balance only the free rows. Allocate hundredths by largest remainder so
// many small ingredients still sum to exactly 100 without moving a lock.
const balanceRecipe = (rows = [], { lockedIds = [], mode = 'proportional' } = {}) => {
  const fail = message => ({ ok: false, recipe: rows, message });
  if (!rows.length) return fail('Añade ingredientes antes de balancear.');
  if (!['proportional', 'equal', 'last'].includes(mode)) return fail('Método de balance desconocido.');
  const ids = new Set();
  if (rows.some(r => {
    const invalid = !r?.id || ids.has(r.id) || !Number.isFinite(Number(r.p)) || Number(r.p) < 0;
    ids.add(r?.id); return invalid;
  })) return fail('Revisa ingredientes repetidos y porcentajes inválidos antes de balancear.');
  const locks = new Set(lockedIds);
  const fixed = rows.filter(r => locks.has(r.id));
  const free = rows.filter(r => !locks.has(r.id));
  const fixedTotal = totalPct(fixed);
  if (fixedTotal > 100 + 1e-9) return fail(`Los porcentajes fijados suman ${fixedTotal.toFixed(2)}%. Desbloquea o reduce un porcentaje para balancear.`);
  if (!free.length) return isMassBalancedTotal(totalPct(rows))
    ? { ok: true, recipe: rows, message: '' }
    : fail('Todos los porcentajes están fijados. Desbloquea al menos un ingrediente para balancear.');
  const target = Math.max(0, 100 - fixedTotal);
  const sumFree = totalPct(free);
  if (mode === 'last') {
    const last = free[free.length - 1];
    const others = totalPct(free.slice(0, -1));
    if (others > target + 1e-9) return fail('El último ingrediente no puede absorber el exceso. Usa balance proporcional o reduce otro porcentaje.');
    return { ok: true, recipe: rows.map(r => r.id === last.id ? { ...r, p: Number((target - others).toFixed(6)) } : r), message: '' };
  }
  const units = Math.floor(target * 100 + 1e-9);
  const shares = free.map((r, i) => {
    const exact = units * (mode === 'equal' || sumFree === 0 ? 1 / free.length : Number(r.p) / sumFree);
    return { id: r.id, i, units: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let residual = units - shares.reduce((sum, r) => sum + r.units, 0);
  shares.slice().sort((a, b) => b.remainder - a.remainder || a.i - b.i).forEach(r => {
    if (residual > 0) { r.units++; residual--; }
  });
  const values = new Map(shares.map(r => [r.id, r.units / 100]));
  // Preserve sub-hundredth fixed values too, rather than rounding a lock.
  const last = shares[shares.length - 1];
  values.set(last.id, Number((values.get(last.id) + target - units / 100).toFixed(6)));
  return { ok: true, recipe: rows.map(r => locks.has(r.id) ? r : { ...r, p: values.get(r.id) }), message: '' };
};

const api = { MASS_BALANCE_TOLERANCE_PP, totalPct, isMassBalancedTotal, balanceRecipe };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasMassBalance = api;
}
})();
