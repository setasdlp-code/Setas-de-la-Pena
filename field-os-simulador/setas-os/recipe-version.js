'use strict';

// Identidad y reglas de versión de receta. SP1: tolerancia única de balance de masa.
(function initRecipeVersion() {
const MASS_BALANCE_TOLERANCE_PP = 0.5;

const totalPct = (rows = []) => (rows || []).reduce((s, r) => s + (parseFloat(r?.p ?? r?.pct) || 0), 0);
const isMassBalancedTotal = tot => Number.isFinite(tot) && Math.abs(tot - 100) <= MASS_BALANCE_TOLERANCE_PP + 1e-9;

const api = { MASS_BALANCE_TOLERANCE_PP, totalPct, isMassBalancedTotal };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasRecipeVersion = api;
}
})();
