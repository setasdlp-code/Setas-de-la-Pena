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

const api = { MASS_BALANCE_TOLERANCE_PP, totalPct, isMassBalancedTotal };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasMassBalance = api;
}
})();
