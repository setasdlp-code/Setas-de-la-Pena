'use strict';
// Lógica pura de la Bitácora (registro de lotes experimentales) — extraída de
// simulador-app.jsx para que sea testeable con `node --test` sin depender del
// estado de React. Mismo patrón UMD que scoring.js / perito-evidence.js.
(function () {
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
    const costoKg = totalFresco > 0 && lote.costoIngKg > 0 ? (lote.costoIngKg * peseSeco) / totalFresco : null;
    return { bolsasSanas, bolsasContaminadas, contPct, totalFresco, be, diasCol, costoKg, numBolsas: bolsas.length };
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
