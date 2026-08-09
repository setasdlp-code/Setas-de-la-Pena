'use strict';
import './perito-economy.js';

(function () {
  if (globalThis.__setasPeritoEconomyBridgeLoaded) return;
  globalThis.__setasPeritoEconomyBridgeLoaded = true;

  let moistureById = null;
  let lastDetail = null;

  const readJson = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  };
  const money = v => v == null || !Number.isFinite(Number(v)) ? '—' : '$' + Math.round(Number(v)).toLocaleString('es-CO');
  const kg = v => v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(2) + ' kg';

  const activeLots = () => readJson('sdp_lotes', []).filter(l => l?.activo && Number(l.cantidadKgDisponible) > 0);
  const stockMap = lots => {
    const out = {};
    lots.forEach(l => { out[l.ingredienteId] = (out[l.ingredienteId] || 0) + Number(l.cantidadKgDisponible || 0); });
    return out;
  };

  const parseMoistures = async () => {
    if (moistureById) return moistureById;
    const out = {};
    try {
      const response = await fetch('./simulador-app.js', { cache: 'force-cache' });
      if (!response.ok) throw new Error('catalog fetch failed');
      const text = await response.text();
      const start = text.indexOf('const INGS = [');
      const end = text.indexOf('const CATS =', start);
      const block = start >= 0 && end > start ? text.slice(start, end) : text;
      const re = /id:\s*['"]([^'"]+)['"][\s\S]{0,650}?moisture:\s*([0-9.]+)/g;
      let m;
      while ((m = re.exec(block))) out[m[1]] = Number(m[2]);
    } catch (_) {}
    moistureById = out;
    return out;
  };

  const findBatchWetKg = () => {
    const root = document.getElementById('bl-perito')?.parentElement || document.querySelector('.builder-cols')?.parentElement || document.body;
    const m = (root.textContent || '').match(/([0-9]+(?:[.,][0-9]+)?)\s*[×x]\s*([0-9]+(?:[.,][0-9]+)?)\s*kg\s*=\s*([0-9]+(?:[.,][0-9]+)?)\s*kg/i);
    return m ? Number(m[3].replace(',', '.')) : null;
  };

  const render = payload => {
    const host = document.getElementById('perito-model-v2') || document.getElementById('bl-perito');
    if (!host) return false;
    let box = document.getElementById('perito-economy-v1');
    if (!box) {
      box = document.createElement('div');
      box.id = 'perito-economy-v1';
      box.style.cssText = 'margin-top:10px;padding-top:9px;border-top:1px solid rgba(26,20,16,.12);font-family:var(--font-mono);font-size:11px;line-height:1.45;';
      host.appendChild(box);
    }
    const e = payload.economics;
    const model = payload.model;
    const lot = e.lot;
    const catalog = payload.catalogCostPerKg;
    const real = e.recipeCost.copPerKg;
    const delta = real != null && catalog != null ? real - catalog : null;
    const costRange = lot?.costPerFreshKgCOP;
    const fresh = lot?.expectedFreshKg;
    const pricing = e.recipeCost.complete ? 'precios completos' : `${Math.round(e.recipeCost.priceCoveragePct)}% de la receta con precio real`;
    const lotPricing = lot ? (lot.completePricing ? 'precios completos' : `${Math.round(lot.priceCoveragePct)}% de materia seca con precio real`) : null;

    box.innerHTML = `
      <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-500);margin-bottom:6px">Economía · Bodega real</div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px 12px">
        <div><b>Score economía</b><br>${model?.dimensions?.economy?.score ?? '—'}/100</div>
        <div><b>Costo mezcla</b><br>${money(real)}/kg<br><span style="color:var(--ink-500)">${pricing}</span></div>
        <div><b>Catálogo</b><br>${money(catalog)}/kg${delta == null ? '' : `<br><span style="color:var(--ink-500)">${delta>=0?'+':''}${money(delta).replace('$','$')} vs catálogo</span>`}</div>
        <div><b>Lote actual</b><br>${lot ? money(lot.substrateCostCOP) : 'define tamaño de lote'}${lot ? `<br><span style="color:var(--ink-500)">${lotPricing}</span>` : ''}</div>
      </div>
      ${lot ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;margin-top:8px">
        <div><b>Producción fresca esperada</b><br>${kg(fresh?.low)}–${kg(fresh?.high)} <span style="color:var(--ink-500)">(desde rango EB)</span></div>
        <div><b>Costo de sustrato / kg hongo</b><br>${money(costRange?.low)}–${money(costRange?.high)} COP/kg</div>
      </div>` : ''}
      <div style="margin-top:7px;color:var(--ink-500);font-size:10px">Costo de sustrato solamente. Excluye spawn, energía, mano de obra, empaque y depreciación. Precios: promedio ponderado de lotes activos de Bodega.</div>`;
    return true;
  };

  const recompute = async detail => {
    if (!detail?.an || !detail?.recipe?.length || !globalThis.SetasEconomy || !globalThis.SetasScoring) return;
    const lots = activeLots();
    const prices = globalThis.SetasEconomy.priceMapFromLots(lots);
    const recipeCost = globalThis.SetasEconomy.recipeCostPerKgAsFormulated(detail.recipe, prices);
    const moistures = await parseMoistures();
    const batchWetKg = findBatchWetKg();
    const targetMoisturePct = detail.an.sp?.moisture?.ideal ?? 65;
    const stock = stockMap(lots);
    const sev = globalThis.SetasScoring.assessSeverity(detail.an);
    const anReal = recipeCost.copPerKg == null ? detail.an : { ...detail.an, cost: recipeCost.copPerKg };
    const ctx = {
      treatment: detail.treatment || null,
      recipe: detail.recipe,
      stockIds: new Set(Object.keys(stock)),
      stockKgById: stock,
      ingredientMoistureById: moistures,
      batchWetKg,
      targetMoisturePct,
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
      __bridgeRecompute: true,
    };
    // Preserve the calibrated EB band already computed by the Perito when available.
    const ebBand = detail.baseline?.uncertainty?.eb || {};
    if (detail.baseline?.calibration?.history) ctx.historyCalibration = detail.baseline.calibration.history;
    if (detail.baseline?.calibration?.source === 'preblended' && detail.baseline.calibration.eb != null) ctx.blendedEB = detail.baseline.calibration.eb;
    const model = globalThis.SetasScoring.scoreRecipe(anReal, ctx);
    const eb = model.uncertainty?.eb || ebBand;
    const lot = globalThis.SetasEconomy.calculateLotEconomics({
      recipe: detail.recipe,
      batchWetKg,
      targetMoisturePct,
      moistureById: moistures,
      priceById: prices,
      ebLow: eb.low,
      ebHigh: eb.high,
    });
    const economics = {
      version: 'economy-v1',
      source: 'sdp_lotes',
      capturedAt: new Date().toISOString(),
      recipeCost,
      lot,
      catalogCostPerKg: Number.isFinite(Number(detail.an.cost)) ? Number(detail.an.cost) : null,
      excludes: ['spawn','energy','labor','packaging','depreciation'],
    };
    const payload = { economics, model, recipe: detail.recipe, catalogCostPerKg: economics.catalogCostPerKg };
    detail.baseline.economics = economics;
    detail.baseline.dimensions = model.dimensions;
    detail.baseline.breakdown = model.breakdown;
    globalThis.__setasLastEconomics = economics;
    window.dispatchEvent(new CustomEvent('setas-perito-economy', { detail: payload }));
    if (!render(payload)) requestAnimationFrame(() => render(payload));
  };

  window.addEventListener('setas-perito-model', e => {
    lastDetail = e.detail;
    recompute(lastDetail);
  });
  const obs = new MutationObserver(() => {
    if (lastDetail && !document.getElementById('perito-economy-v1')) recompute(lastDetail);
  });
  obs.observe(document.documentElement, { childList:true, subtree:true });
})();
