'use strict';
// Lógica pura de la Bitácora (registro de lotes experimentales) — extraída de
// simulador-app.jsx para que sea testeable con `node --test` sin depender del
// estado de React. Mismo patrón UMD que scoring.js / perito-evidence.js.
(function () {
  const DEFAULT_FRESH_PRICES = {
    p_ostreatus_gris: 20000,
    p_ostreatus_blanco: 22000,
    p_djamor_rosa: 25000,
    p_eryngii: 35000,
    shiitake: 38000,
    lions_mane: 55000,
    reishi: 60000,
    enoki: 28000,
    nameko: 32000
  };

  const calcLoteStats = (lote, bolsas = [], cosechas = []) => {
    if (!lote) return null;
    if (!bolsas.length) return null;
    const bolsasSanas = bolsas.filter(b => b.estado === 'sana').length;
    const bolsasContaminadas = bolsas.filter(b => b.estado === 'contaminada').length;
    const contPct = bolsas.length ? (bolsasContaminadas / bolsas.length) * 100 : 0;
    const totalFresco = cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0) / 1000;
    const peseSeco = parseFloat(lote.peseSeco) || 0;
    const be = peseSeco > 0 ? (totalFresco / peseSeco) * 100 : null;
    // Fechas de col100 corruptas o anteriores a la inoculación (typo de captura) se
    // descartan del promedio en vez de contaminarlo con un NaN o un negativo.
    const col100s = bolsas
      .filter(b => b.col100 && lote.fechaInoculacion)
      .map(b => Math.round((new Date(b.col100) - new Date(lote.fechaInoculacion)) / 86400000))
      .filter(d => Number.isFinite(d) && d >= 0);
    const diasCol = col100s.length ? col100s.reduce((s, d) => s + d, 0) / col100s.length : null;

    // Costeo económico e inversión real incurrida del lote
    const sustCost = lote.costoIngKg > 0 && peseSeco > 0 ? lote.costoIngKg * peseSeco : (peseSeco * 1200);
    const spawnKg = lote.spawnKg != null ? parseFloat(lote.spawnKg) : (peseSeco > 0 ? (peseSeco / (1 - 0.67)) * 0.08 : bolsas.length * 0.16);
    const spawnCostKg = parseFloat(lote.spawnCostKg) || 12000;
    const spawnCostTotal = spawnKg * spawnCostKg;
    const energyCopKg = parseFloat(lote.energyCopKg) || 350;
    const energyCostTotal = peseSeco * energyCopKg;
    const bagConsumableCostUnit = parseFloat(lote.bagConsumableCostUnit) || 300;
    const bagConsumableCostTotal = bolsas.length * bagConsumableCostUnit;
    const costoIncurridoTotal = sustCost + spawnCostTotal + energyCostTotal + bagConsumableCostTotal;
    const costoIncurridoPorBolsa = bolsas.length > 0 ? costoIncurridoTotal / bolsas.length : 0;

    // Ingresos de cosecha y margen real en COP
    const sKey = lote.sKey || 'p_ostreatus_gris';
    const precioVentaKg = parseFloat(lote.precioVentaKg) || DEFAULT_FRESH_PRICES[sKey] || 22000;
    const ingresoRealTotal = totalFresco * precioVentaKg;
    const margenRealTotal = totalFresco > 0 ? ingresoRealTotal - costoIncurridoTotal : 0;
    const margenRealPct = ingresoRealTotal > 0 ? (margenRealTotal / ingresoRealTotal) * 100 : 0;
    const costoRealPorKgCosechado = totalFresco > 0 ? costoIncurridoTotal / totalFresco : null;

    // Comparativa vs Estimación teórica de la receta
    const ebEstimada = parseFloat(lote.ebEstimada || lote.eb) || null;
    const varianzaEB = (be != null && ebEstimada != null) ? be - ebEstimada : null;
    const kgEstimados = (peseSeco > 0 && ebEstimada != null) ? peseSeco * (ebEstimada / 100) : null;
    const varianzaKg = (totalFresco != null && kgEstimados != null) ? totalFresco - kgEstimados : null;

    // Desglose por oleadas (flushes)
    const flushMap = {};
    cosechas.forEach(c => {
      const fNum = c.flush || 1;
      const kgF = (parseFloat(c.pesoFresco) || 0) / 1000;
      if (!flushMap[fNum]) flushMap[fNum] = { flush: fNum, kg: 0, count: 0 };
      flushMap[fNum].kg += kgF;
      flushMap[fNum].count += 1;
    });
    const flushes = Object.values(flushMap).map(f => ({
      flush: f.flush,
      kg: f.kg,
      pctTotal: totalFresco > 0 ? (f.kg / totalFresco) * 100 : 0,
      ingreso: f.kg * precioVentaKg
    })).sort((a, b) => a.flush - b.flush);

    // Mantenemos costoKg por compatibilidad retroactiva con tests existentes
    const costoKg = totalFresco > 0 && lote.costoIngKg > 0 ? (lote.costoIngKg * peseSeco) / totalFresco : null;

    return {
      bolsasSanas, bolsasContaminadas, contPct,
      totalFresco, be, diasCol, costoKg,
      numBolsas: bolsas.length,
      costoIncurridoTotal, costoIncurridoPorBolsa,
      costoDesglose: {
        sustrato: sustCost,
        spawn: spawnCostTotal,
        energia: energyCostTotal,
        consumibles: bagConsumableCostTotal
      },
      precioVentaKg, ingresoRealTotal, margenRealTotal, margenRealPct,
      costoRealPorKgCosechado,
      ebEstimada, varianzaEB, kgEstimados, varianzaKg,
      flushes
    };
  };

  const calcLoteScore = (stats) => {
    if (!stats || stats.totalFresco === 0) return null;
    let s = 0;
    if (stats.be != null) s += Math.min(40, (stats.be / 150) * 40);
    s += (1 - stats.contPct / 100) * 30;
    s += stats.diasCol != null ? (stats.diasCol <= 18 ? 15 : stats.diasCol <= 25 ? 10 : 5) : 7;
    s += stats.costoKg != null ? (stats.costoKg <= 2000 ? 15 : stats.costoKg <= 4000 ? 10 : 5) : 7;
    return Math.max(0, Math.min(100, Math.round(s)));
  };

  // Usado tanto para validar la entrada del operador (rechazar el guardado) como
  // para filtrar datos ya guardados antes de promediar en calcLoteStats.
  const isFechaColValida = (fechaCol, fechaInoculacion) => {
    if (!fechaCol || !fechaInoculacion) return true; // campo vacío: nada que validar aún
    const dCol = new Date(fechaCol);
    const dIno = new Date(fechaInoculacion);
    if (isNaN(dCol.getTime()) || isNaN(dIno.getTime())) return false;
    return dCol.getTime() >= dIno.getTime();
  };

  const api = { calcLoteStats, calcLoteScore, isFechaColValida };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBitacora = api;
})();
