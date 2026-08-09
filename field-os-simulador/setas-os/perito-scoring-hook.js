'use strict';
import './perito-ui-bridge.js';

// Observa solo la evaluación principal del Perito. Las simulaciones internas
// no pasan blendedEB, por lo que no disparan renders ni lecturas de Bodega.
(function attachPeritoScoringHook() {
  if (globalThis.__setasPeritoScoringHooked) return;
  const attach = () => {
    const api = globalThis.SetasScoring;
    if (!api || typeof api.scoreRecipe !== 'function') return false;
    if (api.scoreRecipe.__setasPeritoWrapped) {
      globalThis.__setasPeritoScoringHooked = true;
      return true;
    }
    const original = api.scoreRecipe.bind(api);
    const wrapped = (an, ctx = {}) => {
      const result = original(an, ctx);
      if (!ctx.__bridgeRecompute && ctx.blendedEB != null && Array.isArray(ctx.recipe) && ctx.recipe.length) {
        try {
          window.dispatchEvent(new CustomEvent('setas-perito-model', {
            detail: {
              an,
              recipe: ctx.recipe.map(r => ({ id: r.id, p: Number(r.p) || 0 })),
              treatment: ctx.treatment || null,
              baseline: result,
            },
          }));
        } catch (_) {}
      }
      return result;
    };
    wrapped.__setasPeritoWrapped = true;
    api.scoreRecipe = wrapped;
    globalThis.__setasPeritoScoringHooked = true;
    return true;
  };

  if (attach()) return;
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (attach() || attempts > 100) clearInterval(timer);
  }, 50);
})();
