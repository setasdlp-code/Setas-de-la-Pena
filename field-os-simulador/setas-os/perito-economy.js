'use strict';
(function () {
  const num = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const clampPct = v => Math.max(0, Math.min(92, Number(v) || 0));

  const priceMapFromLots = (lots = []) => {
    const acc = {};
    lots.forEach(l => {
      if (!l || !l.activo) return;
      const kg = num(l.cantidadKgDisponible);
      const price = num(l.precioPorKgCOP);
      if (kg == null || kg <= 0 || price == null || price < 0 || !l.ingredienteId) return;
      if (!acc[l.ingredienteId]) acc[l.ingredienteId] = { kg: 0, value: 0 };
      acc[l.ingredienteId].kg += kg;
      acc[l.ingredienteId].value += kg * price;
    });
    const out = {};
    Object.entries(acc).forEach(([id, x]) => {
      if (x.kg > 0) out[id] = x.value / x.kg;
    });
    return out;
  };

  const recipeCostPerKgAsFormulated = (recipe = [], priceById = {}) => {
    let knownPct = 0;
    let total = 0;
    recipe.forEach(r => {
      const pct = Math.max(0, Number(r.p ?? r.pct) || 0);
      const price = num(priceById[r.id]);
      if (price == null) return;
      knownPct += pct;
      total += price * pct / 100;
    });
    return {
      copPerKg: knownPct > 0 ? total : null,
      priceCoveragePct: Math.min(100, knownPct),
      complete: knownPct >= 99.5,
    };
  };

  const calculateLotEconomics = ({ recipe = [], batchWetKg, targetMoisturePct, moistureById = {}, priceById = {}, ebLow, ebHigh }) => {
    const finalWetKg = num(batchWetKg);
    if (finalWetKg == null || finalWetKg <= 0) return null;
    const targetMoisture = clampPct(targetMoisturePct);
    const batchDryKg = finalWetKg * (1 - targetMoisture / 100);
    let substrateCostCOP = 0;
    let pricedDryKg = 0;
    const ingredients = [];

    recipe.forEach(r => {
      const pct = Math.max(0, Number(r.p ?? r.pct) || 0) / 100;
      if (!pct) return;
      const requiredDryKg = batchDryKg * pct;
      const ingredientMoisturePct = clampPct(moistureById[r.id]);
      const dryFraction = Math.max(0.08, 1 - ingredientMoisturePct / 100);
      const requiredAsPurchasedKg = requiredDryKg / dryFraction;
      const price = num(priceById[r.id]);
      const costCOP = price == null ? null : requiredAsPurchasedKg * price;
      if (costCOP != null) {
        substrateCostCOP += costCOP;
        pricedDryKg += requiredDryKg;
      }
      ingredients.push({
        id: r.id,
        pct: pct * 100,
        requiredDryKg,
        ingredientMoisturePct,
        requiredAsPurchasedKg,
        pricePerKgCOP: price,
        costCOP,
      });
    });

    const low = Math.max(0, Number(ebLow) || 0);
    const high = Math.max(low, Number(ebHigh) || low);
    const freshKgLow = low > 0 ? batchDryKg * low / 100 : null;
    const freshKgHigh = high > 0 ? batchDryKg * high / 100 : null;
    const costPerFreshKgBest = freshKgHigh && substrateCostCOP > 0 ? substrateCostCOP / freshKgHigh : null;
    const costPerFreshKgWorst = freshKgLow && substrateCostCOP > 0 ? substrateCostCOP / freshKgLow : null;
    const priceCoveragePct = batchDryKg > 0 ? Math.min(100, pricedDryKg / batchDryKg * 100) : 0;

    return {
      batchWetKg: finalWetKg,
      batchDryKg,
      targetMoisturePct: targetMoisture,
      substrateCostCOP: priceCoveragePct > 0 ? substrateCostCOP : null,
      priceCoveragePct,
      completePricing: priceCoveragePct >= 99.5,
      expectedFreshKg: { low: freshKgLow, high: freshKgHigh },
      costPerFreshKgCOP: { low: costPerFreshKgBest, high: costPerFreshKgWorst },
      ingredients,
      excludes: ['spawn', 'energy', 'labor', 'packaging', 'depreciation'],
      source: 'sdp_lotes_active_weighted_price',
    };
  };

  const api = { priceMapFromLots, recipeCostPerKgAsFormulated, calculateLotEconomics };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasEconomy = api;
})();
