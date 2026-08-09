'use strict';
import './perito-ui-bridge.js';

(function attachPeritoScoringHook() {
  let lastApi = null;
  let attempts = 0;

  const attach = () => {
    const api = globalThis.SetasScoring;
    if (!api || typeof api.scoreRecipe !== 'function') return false;
    if (api === lastApi && api.scoreRecipe.__setasPeritoWrapped) return true;
    if (api.scoreRecipe.__setasPeritoWrapped) {
      lastApi = api;
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
    lastApi = api;
    globalThis.__setasPeritoScoringHooked = true;
    return true;
  };

  attach();
  const timer = setInterval(() => {
    attempts += 1;
    attach();
    if (attempts > 120) clearInterval(timer);
  }, 50);
})();
