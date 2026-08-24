'use strict';
// SETAS OS — evidencia operacional derivada de un ciclo real.
// Reutiliza Bitácora para EB/contaminación/costo y Telemetry para ambiente.
// No modifica scoring ni convierte una observación en causalidad.
(function () {
  const getBitacora = () => {
    if (typeof module !== 'undefined' && module.exports) return require('./bitacora-model.js');
    return globalThis.SetasBitacora;
  };
  const getTelemetry = () => {
    if (typeof module !== 'undefined' && module.exports) return require('./telemetry-contract.js');
    return globalThis.SetasTelemetry;
  };

  const toKg = (value, unit) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    if (unit === 'kg') return n;
    return n / 1000; // Bitácora actual registra cosecha en gramos.
  };

  const harvestByFlush = (cosechas = []) => {
    const map = new Map();
    cosechas.forEach((c) => {
      const flush = Number(c.flush ?? c.numeroFlush ?? c.nFlush ?? 1) || 1;
      const grossKg = toKg(c.pesoFresco ?? c.pesoBruto ?? 0, c.unit);
      const commercialKg = c.pesoComercial != null ? toKg(c.pesoComercial, c.unit) : null;
      const trimKg = c.pesoDescarte != null ? toKg(c.pesoDescarte, c.unit) : null;
      if (!map.has(flush)) map.set(flush, { flush, grossKg: 0, commercialKg: 0, trimKg: 0, records: 0, hasCommercial: false, hasTrim: false });
      const row = map.get(flush);
      row.grossKg += grossKg;
      if (commercialKg != null) { row.commercialKg += commercialKg; row.hasCommercial = true; }
      if (trimKg != null) { row.trimKg += trimKg; row.hasTrim = true; }
      row.records += 1;
    });
    return [...map.values()].sort((a, b) => a.flush - b.flush).map((row) => ({
      flush: row.flush,
      grossKg: row.grossKg,
      commercialKg: row.hasCommercial ? row.commercialKg : null,
      trimKg: row.hasTrim ? row.trimKg : null,
      records: row.records,
    }));
  };

  const buildCycleEvidence = ({
    cycle,
    lote,
    bolsas = [],
    cosechas = [],
    telemetry = [],
    recipeSnapshot = null,
    ingredientLots = [],
    spawnLot = null,
    recordedAt = null,
  } = {}) => {
    if (!cycle?.id) throw new Error('cycle.id is required');
    if (!lote?.id) throw new Error('lote.id is required');
    const bitacora = getBitacora();
    const telem = getTelemetry();
    if (!bitacora?.calcLoteStats) throw new Error('SetasBitacora unavailable');
    if (!telem?.aggregateTelemetry) throw new Error('SetasTelemetry unavailable');

    const stats = bitacora.calcLoteStats(lote, bolsas, cosechas);
    const cycleReadings = telemetry.filter((r) => telem.readingBelongsToCycle(r, cycle));
    const environment = telem.aggregateTelemetry(cycleReadings);
    const flushes = harvestByFlush(cosechas);
    const completeEnvironmentMetrics = Object.values(environment).filter(x => x.validCount > 0).length;
    const hasHarvest = !!stats && stats.totalFresco > 0;
    const hasTraceability = !!recipeSnapshot && ingredientLots.length > 0;

    // Un solo ciclo nunca recibe confianza alta por sí mismo: es evidencia
    // operacional observacional, no un experimento causal replicado.
    const completenessScore = [hasHarvest, bolsas.length > 0, completeEnvironmentMetrics >= 2, hasTraceability].filter(Boolean).length;
    const confidence = completenessScore >= 3 ? 'medium' : 'low';

    return {
      schema: 'setas.cycle-evidence.v1',
      sourceType: 'setas_dlp_trial',
      confidence,
      sourceId: cycle.id,
      batchId: lote.id,
      batchCode: lote.codigo || null,
      roomId: cycle.roomId,
      speciesId: cycle.speciesId || lote.especie || lote.sKey || null,
      stage: cycle.stage,
      cycleState: cycle.state,
      startAt: cycle.startAt,
      endAt: cycle.endAt,
      recordedAt: recordedAt || new Date().toISOString(),
      recipeSnapshot,
      ingredientLots: ingredientLots.map((x) => ({ ...x })),
      spawnLot: spawnLot ? { ...spawnLot } : null,
      metrics: stats ? {
        be_pct: stats.be,
        contamination_pct: stats.contPct,
        colonization_days: stats.diasCol,
        total_fresh_kg: stats.totalFresco,
        cost_per_kg_cop: stats.costoKg,
        bags_total: stats.numBolsas,
        bags_contaminated: stats.bolsasContaminadas,
        bags_healthy: stats.bolsasSanas,
      } : null,
      flushes,
      environment,
      telemetrySummary: {
        totalReadings: cycleReadings.length,
        metricsWithValidData: completeEnvironmentMetrics,
      },
      provenance: {
        biological: 'measured_calculated_from_bitacora',
        environment: cycleReadings.length ? 'measured' : 'missing',
        recipe: recipeSnapshot ? 'snapshot' : 'missing',
        ingredients: ingredientLots.length ? 'lot_traceable' : 'missing',
      },
    };
  };

  const buildHistoricalEvidence = (records = [], { speciesId = null, recipeVersionId = null } = {}) => {
    const filtered = records.filter((r) => {
      if (!r || r.schema !== 'setas.cycle-evidence.v1') return false;
      if (speciesId && r.speciesId !== speciesId) return false;
      if (recipeVersionId && r.recipeSnapshot?.versionId !== recipeVersionId && r.recipeSnapshot?.id !== recipeVersionId) return false;
      return true;
    });
    const completed = filtered.filter(r => r.metrics?.total_fresh_kg > 0);
    const withEnvironment = completed.filter(r => (r.telemetrySummary?.metricsWithValidData || 0) >= 2);
    const withTraceability = completed.filter(r => r.recipeSnapshot && (r.ingredientLots || []).length > 0);
    // Observaciones históricas por sí solas se limitan a medium; high queda
    // reservado para evidencia experimental formal/replicada.
    const confidence = completed.length >= 3 && withEnvironment.length >= 2 ? 'medium' : 'low';
    return {
      schema: 'setas.historical-evidence.v1',
      sourceType: 'setas_dlp_trial',
      confidence,
      filters: { speciesId, recipeVersionId },
      summary: {
        sampleSize: completed.length,
        recordsWithEnvironment: withEnvironment.length,
        recordsWithFullIngredientTraceability: withTraceability.length,
      },
      records: completed,
    };
  };

  const api = { harvestByFlush, buildCycleEvidence, buildHistoricalEvidence };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasCycleEvidence = api;
})();
