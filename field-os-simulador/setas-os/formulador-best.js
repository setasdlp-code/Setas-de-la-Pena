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
  // Una sugerencia que pide comprar más de 2 insumos que Bodega no tiene ya no
  // es "conseguir algo", es otra receta: con Bodega no vacía se descarta.
  const MAX_NEW_INGREDIENTS = 2;

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

  // ── Cobertura de Bodega ──
  // Kg disponibles por insumo: lotes activos con kg > 0; stockMap solo para
  // insumos sin lotes (la app deriva stockMap de los lotes y no se suma dos veces).
  const stockKgById = (invLotes = [], stockMap = {}) => {
    const out = {};
    (invLotes || []).forEach(l => {
      const kg = Number(l?.cantidadKgDisponible) || 0;
      if (!l || l.activo === false || kg <= 0 || !l.ingredienteId) return;
      out[l.ingredienteId] = (out[l.ingredienteId] || 0) + kg;
    });
    Object.keys(stockMap || {}).forEach(id => {
      const kg = Number(stockMap[id]);
      if (out[id] == null && kg > 0) out[id] = kg;
    });
    return out;
  };

  // Misma cuenta que launch-plan.js: la receta es base seca; cada insumo se pesa
  // tal cual se recibe (corregido por su humedad). El spawn no entra.
  const kgPerBagById = (recipe = [], ingredients = [], { kgPerBag, moisturePct } = {}) => {
    const byId = new Map((ingredients || []).map(g => [g.id, g]));
    const h = Math.min(0.95, Math.max(0, (Number(moisturePct) || 0) / 100));
    const dryPerBag = (Number(kgPerBag) || 0) * (1 - h);
    const out = {};
    (recipe || []).forEach(r => {
      const p = Number(r.p) || 0;
      if (p <= 0) return;
      const m = Math.min(0.92, Math.max(0, (Number(byId.get(r.id)?.moisture) || 0) / 100));
      out[r.id] = (out[r.id] || 0) + dryPerBag * (p / 100) / (1 - m);
    });
    return out;
  };

  const bagsCovered = (recipe, ingredients, stockKg = {}, batch = {}) => {
    const per = kgPerBagById(recipe, ingredients, batch);
    const ids = Object.keys(per).filter(id => per[id] > 0);
    if (!ids.length) return 0;
    return Math.max(0, Math.floor(Math.min(...ids.map(id => (Number(stockKg[id]) || 0) / per[id])) + 1e-9));
  };

  const ceil1 = x => Math.ceil(x * 10 - 1e-9) / 10;
  const shortfall = (recipe, ingredients, stockKg = {}, batch = {}) => {
    const per = kgPerBagById(recipe, ingredients, batch);
    const bags = Number(batch.numBags) || 0;
    return Object.keys(per)
      .map(id => ({ id, kg: ceil1(per[id] * bags - (Number(stockKg[id]) || 0)) }))
      .filter(x => x.kg > 0);
  };

  // ── "Para mejorar, conseguir…" ──
  const round1 = x => Math.round(x * 10) / 10;
  const improvements = ({ stockPicks = {}, catalogAnnotated = [], stockKg = {}, ingredients = [], batch = {}, limit = 3 } = {}) => {
    const prod = stockPicks.produccion || null;
    const bar = stockPicks.barata || null;
    const noStockPicks = !prod && !bar;
    const items = [];
    (catalogAnnotated || []).forEach(a => {
      if (!a || !a.safe) return;
      const toBuy = shortfall(a.recipe, ingredients, stockKg, batch);
      if (!toBuy.length) return;
      if (!noStockPicks && toBuy.filter(t => !(Number(stockKg[t.id]) > 0)).length > MAX_NEW_INGREDIENTS) return;
      const deltaEb = prod ? round1(a.eb - prod.eb) : null;
      const deltaCostPerKgSeta = bar && bar.costPerKgSeta != null && a.costPerKgSeta != null
        ? a.costPerKgSeta - bar.costPerKgSeta : null;
      let kind = null;
      if (noStockPicks) kind = 'eb';
      else if (prod && a.eb - prod.eb >= EB_TIE_PTS) kind = 'eb';
      else if (deltaCostPerKgSeta != null && a.costPerKgSeta < bar.costPerKgSeta * 0.99) kind = 'costo';
      if (!kind) return;
      items.push({ annotated: a, kind, deltaEb, deltaCostPerKgSeta, toBuy });
    });
    items.sort((x, y) => {
      if (x.kind !== y.kind) return x.kind === 'eb' ? -1 : 1;
      if (x.kind === 'eb') return (y.annotated.eb - x.annotated.eb) || byCost(x.annotated, y.annotated) || byKey(x.annotated, y.annotated);
      return (x.deltaCostPerKgSeta - y.deltaCostPerKgSeta) || (y.annotated.eb - x.annotated.eb) || byKey(x.annotated, y.annotated);
    });
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const k = it.toBuy.map(t => t.id).sort().join('|');
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(it);
      if (out.length >= limit) break;
    }
    return out;
  };

  // ── Dos búsquedas: solo Bodega y catálogo ──
  // `search` es runHybridRecipeSearch en la app (con includePool). Ambas
  // corridas usan los mismos lotes, así que el costo tiene una sola base.
  const computeBestWithBodega = ({ search, sKey, spp = {}, ingredients = [], invLotes = [], stockMap = {}, calcTreatment = null, batch = {} } = {}) => {
    if (typeof search !== 'function') throw new Error('computeBestWithBodega requiere search()');
    const stockKg = stockKgById(invLotes, stockMap);
    const ebOptimal = Number(spp?.[sKey]?.eb_optimal);
    const opts = { ingredients, invLotes, ebOptimal, calcTreatment, sKey, spp };
    const annotate = res => (res?.pool || []).map(c => annotateCandidate(c, opts));
    const base = { targetKey: sKey, invLotes, stockMap, ingredients, spp, includePool: true };

    const hasStock = Object.keys(stockKg).length > 0;
    const stockRes = hasStock ? search({ ...base, useStock: true }) : null;
    const stockAnnotated = stockRes ? annotate(stockRes) : [];
    const noStock = !hasStock || !!stockRes?.noStock;
    const picks = noStock ? { produccion: null, barata: null, same: false, safeCount: 0 } : selectPicks(stockAnnotated);

    const catalogRes = search({ ...base, useStock: false });
    // La búsqueda desde cero rara vez prueba "la receta de Bodega + un insumo";
    // una segunda corrida de catálogo sembrada con esa receta sí.
    const seededRes = picks.produccion ? search({ ...base, useStock: false, recipe: picks.produccion.recipe }) : null;
    const seen = new Set();
    const catalogAnnotated = [...annotate(catalogRes), ...annotate(seededRes)].filter(a => (seen.has(a.key) ? false : seen.add(a.key)));
    const bagsOf = p => (p ? bagsCovered(p.recipe, ingredients, stockKg, batch) : null);
    const shortOf = p => (p ? shortfall(p.recipe, ingredients, stockKg, batch) : []);

    return {
      stock: {
        ...picks,
        bags: { produccion: bagsOf(picks.produccion), barata: bagsOf(picks.barata) },
        short: { produccion: shortOf(picks.produccion), barata: shortOf(picks.barata) },
      },
      improvements: improvements({ stockPicks: picks, catalogAnnotated, stockKg, ingredients, batch }),
      noStock,
      stockKg,
      explored: { stock: stockRes?.explored ?? 0, catalog: (catalogRes?.explored ?? 0) + (seededRes?.explored ?? 0) },
    };
  };

  const api = {
    EB_TIE_PTS,
    SAFETY_MIN,
    MAX_NEW_INGREDIENTS,
    isEbTie,
    annotateCandidate,
    selectPicks,
    reasonLine,
    stockKgById,
    kgPerBagById,
    bagsCovered,
    shortfall,
    improvements,
    computeBestWithBodega,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFormuladorBest = api;
})();
