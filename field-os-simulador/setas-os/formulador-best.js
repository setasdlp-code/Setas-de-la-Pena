/**
 * Formulador — "Mejor con Bodega" (diseño 2026-11-05, PR 2).
 *
 * Convierte el pool de candidatas seguras de searchScenarios en dos recetas:
 *   - Más producción: mayor EB estimada; si dos empatan (< 1 pt) gana la de
 *     menor costo por kg de seta fresca.
 *   - Más barata por kg de seta: menor costo de insumos por kg de seta fresca.
 *
 * Es un orden de producto, no una inferencia de datos de campo (ADR-0004): no
 * toca scoring ni el orden de Escenarios. La banda de EB es la de escala B
 * (buildUncertainty) y se muestra tal cual.
 */
(function () {
  'use strict';

  const EB_TIE_PTS = 1;
  // Mismo umbral de seguridad que usa searchScenarios dentro del beam.
  const SAFETY_MIN = 45;

  const scenarios = () => globalThis.SetasPeritoScenarios
    || (typeof require !== 'undefined' ? require('./perito-scenarios.js') : null);
  // perito-economy.js llega por un import de módulo que puede cargar después
  // del bundle: se resuelve en cada llamada, no al cargar este archivo.
  const economy = () => globalThis.SetasEconomy
    || (typeof require !== 'undefined' ? require('./perito-economy.js') : null);

  const isEbTie = (a, b) => Math.abs(Number(a) - Number(b)) < EB_TIE_PTS;

  const recipeKey = recipe => {
    const S = scenarios();
    if (S?.canonicalRecipeKey) return S.canonicalRecipeKey(recipe);
    return (recipe || []).map(r => `${r.id}:${Number(r.p).toFixed(1)}`).sort().join('|');
  };

  const safetyOf = evaluation => {
    const S = scenarios();
    if (S?.dimensionVector) return S.dimensionVector(evaluation).safety;
    return Number(evaluation?.dimensions?.safety?.score ?? 0);
  };

  const annotateCandidate = (c, { ingredients = [], invLotes = [], ebOptimal = null, calcTreatment = null, sKey = null, spp = {} } = {}) => {
    const evaluation = c?.evaluation || {};
    const an = evaluation.analysis || {};
    const eb = Number(an.eb);
    const ue = evaluation.uncertainty?.eb || {};
    const fifo = scenarios().calculateFifoRecipeCost(c.recipe || [], ingredients, invLotes);
    const unpricedIds = [...new Set(fifo.unpricedIds || [])];
    const costPerKgSeta = unpricedIds.length ? null : economy().costPerKgFreshMushroom(fifo.cost, eb);
    let requiresAutoclave = false;
    if (typeof calcTreatment === 'function') {
      try {
        requiresAutoclave = calcTreatment(an, sKey, { ...spp, ...(sKey ? { [sKey]: an.sp } : {}) })?.col === 'autoclave';
      } catch (e) { requiresAutoclave = false; }
    }
    return {
      key: recipeKey(c.recipe || []),
      recipe: (c.recipe || []).map(r => ({ id: r.id, p: Number(r.p) })),
      eb,
      band: {
        low: Number.isFinite(ue.low) ? ue.low : Math.round(eb),
        high: Number.isFinite(ue.high) ? ue.high : Math.round(eb),
        confidence: ue.confidence || 'low',
      },
      costPerDryKg: fifo.cost,
      costPerKgSeta,
      unpricedIds,
      costProvenance: fifo.costProvenance,
      requiresAutoclave,
      atModelCap: Number.isFinite(Number(ebOptimal)) && eb >= Number(ebOptimal) - 0.05,
      safe: evaluation.allowed === true && safetyOf(evaluation) >= SAFETY_MIN && Number.isFinite(eb),
    };
  };

  // Costo ausente ordena al final.
  const byCost = (a, b) => {
    const ca = a.costPerKgSeta, cb = b.costPerKgSeta;
    if (ca == null && cb == null) return 0;
    if (ca == null) return 1;
    if (cb == null) return -1;
    return ca - cb;
  };
  const byKey = (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

  const selectPicks = (annotated = []) => {
    const safe = (annotated || []).filter(a => a && a.safe);
    if (!safe.length) return { produccion: null, barata: null, same: false, safeCount: 0 };
    const topEb = Math.max(...safe.map(a => a.eb));
    const produccion = safe.filter(a => isEbTie(topEb, a.eb)).sort((a, b) => byCost(a, b) || byKey(a, b))[0];
    const priced = safe.filter(a => a.costPerKgSeta != null);
    const barata = priced.sort((a, b) => byCost(a, b) || b.eb - a.eb || byKey(a, b))[0] || null;
    return { produccion, barata, same: !!barata && barata.key === produccion.key, safeCount: safe.length };
  };

  const money = n => Math.round(Math.abs(n)).toLocaleString('es-CO');

  const reasonLine = (pick, other, which) => {
    if (!pick || !other) return '';
    if (pick.key === other.key) return 'Más producción y más barata a la vez';
    const tie = isEbTie(pick.eb, other.eb);
    const hasCost = pick.costPerKgSeta != null && other.costPerKgSeta != null;
    const dCost = hasCost ? pick.costPerKgSeta - other.costPerKgSeta : null;
    const costPart = (more) => {
      if (!hasCost) return null;
      if (Math.abs(dCost) < 1) return '$ igual por kg de seta';
      return `$${money(dCost)} ${more ? 'más' : 'menos'} por kg de seta`;
    };
    if (which === 'produccion') {
      const ebPart = tie ? 'EB igual a la más barata' : `EB +${Math.round(pick.eb - other.eb)} pts sobre la más barata`;
      const c = costPart(dCost > 0);
      return c ? `${ebPart} · ${c}` : ebPart;
    }
    const ebPart = tie ? 'EB igual' : `EB −${Math.round(other.eb - pick.eb)} pts`;
    const c = costPart(false);
    return c ? `${c} · ${ebPart}` : ebPart;
  };

  const api = {
    EB_TIE_PTS,
    SAFETY_MIN,
    isEbTie,
    annotateCandidate,
    selectPicks,
    reasonLine,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFormuladorBest = api;
})();
