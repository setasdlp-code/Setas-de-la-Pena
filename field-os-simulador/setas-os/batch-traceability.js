'use strict';

/**
 * @file batch-traceability.js — Trazabilidad de Lotes y Vinculación Ambiental para Setas OS.
 *
 * Conecta las lecturas de los sensores de automatización (ESP32/telemetría) con la historia
 * de vida de los lotes de producción y bitácora, calculando cumplimiento ambiental, consolidando
 * etapas en cámaras (RoomCycles) y emitiendo reportes de auditoría y certificados QR.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const telemetryContract = isNode
    ? require('./telemetry-contract.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasTelemetry : null);

  const bitacoraModel = isNode
    ? require('./bitacora-model.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasBitacora : null);

  const cycleEvidence = isNode
    ? require('./cycle-evidence.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasCycleEvidence : null);

  /**
   * Calcula el porcentaje de cumplimiento climático de un conjunto de lecturas
   * frente a los rangos target de un RoomCycle.
   *
   * @param {Array<object>} readings Lecturas del ciclo
   * @param {object} targets Diccionario de targets { temperature_c: { min, max, target }, ... }
   * @returns {object} Métricas de cumplimiento { [metric]: { validCount, inBandCount, compliancePct, avgDeltaFromTarget } }
   */
  const calculateEnvironmentalCompliance = (readings = [], targets = {}) => {
    if (!targets || typeof targets !== 'object') return {};

    const grouped = {};
    readings.forEach(r => {
      const metric = r.metric;
      if (!metric || !targets[metric]) return;
      if (r.quality !== 'valid' || !Number.isFinite(r.value)) return;

      if (!grouped[metric]) grouped[metric] = [];
      grouped[metric].push(r.value);
    });

    const result = {};
    Object.entries(targets).forEach(([metric, band]) => {
      if (!band || typeof band !== 'object') return;
      const values = grouped[metric] || [];
      const total = values.length;

      if (total === 0) {
        result[metric] = {
          validCount: 0,
          inBandCount: 0,
          compliancePct: null,
          avgDeltaFromTarget: null,
          targetBand: band,
        };
        return;
      }

      let inBandCount = 0;
      let sumDelta = 0;
      const hasTargetPoint = Number.isFinite(band.target);

      values.forEach(v => {
        let isInside = true;
        if (Number.isFinite(band.min) && v < band.min) isInside = false;
        if (Number.isFinite(band.max) && v > band.max) isInside = false;

        if (isInside) inBandCount++;
        if (hasTargetPoint) sumDelta += Math.abs(v - band.target);
      });

      result[metric] = {
        validCount: total,
        inBandCount,
        compliancePct: Math.round((inBandCount / total) * 1000) / 10, // ej. 98.5%
        avgDeltaFromTarget: hasTargetPoint ? Math.round((sumDelta / total) * 100) / 100 : null,
        targetBand: band,
      };
    });

    return result;
  };

  /**
   * Construye el reporte completo de trazabilidad de un lote integrando insumos,
   * receta, historial ambiental por cámara y resultados de producción.
   *
   * @param {object} params
   * @param {object} params.lote Lote de producción / bitácora
   * @param {Array<object>} [params.cycles] Lista de RoomCycles
   * @param {Array<object>} [params.telemetry] Lecturas de telemetría
   * @param {Array<object>} [params.bolsas] Bolsas asociadas al lote
   * @param {Array<object>} [params.cosechas] Cosechas asociadas al lote
   * @param {Array<object>} [params.incidencias] Incidencias climáticas reportadas
   * @returns {object} Reporte de trazabilidad estructurado
   */
  const buildBatchTraceabilityReport = ({
    lote,
    cycles = [],
    telemetry = [],
    bolsas = [],
    cosechas = [],
    incidencias = [],
    generatedAt = null,
  } = {}) => {
    if (!lote || !lote.id) throw new Error('lote válido con id es requerido');

    const batchId = lote.id;
    const batchCode = lote.codigo || lote.code || batchId;
    const speciesId = lote.especie || lote.sKey || lote.speciesId || null;

    // 1. Linaje genético e insumos (Trazabilidad física)
    const recipeSnapshot = lote.recetaSnapshot || lote.recipeSnapshot || null;
    const ingredientLots = lote.ingredientLots || lote.insumoLots || lote.ingredientLotRefs || [];
    const spawnLot = lote.spawnLot || lote.loteSpawn || (lote.spawnKg ? { kg: lote.spawnKg, costKg: lote.spawnCostKg } : null);

    // 2. Localizar todos los RoomCycles donde vivió este lote
    const matchingCycles = cycles.filter(c => (c.batchIds || []).includes(batchId));

    // Ordenar ciclos por startAt
    const sortedCycles = [...matchingCycles].sort((a, b) => {
      const ta = new Date(a.startAt || 0).getTime();
      const tb = new Date(b.startAt || 0).getTime();
      return ta - tb;
    });

    // 3. Vincular telemetría a cada ciclo del lote
    const environmentalHistory = sortedCycles.map(cycle => {
      const cycleReadings = telemetry.filter(r => {
        if (telemetryContract?.readingBelongsToCycle) {
          return telemetryContract.readingBelongsToCycle(r, cycle);
        }
        if (r.room_id !== cycle.roomId) return false;
        const t = new Date(r.observed_at).getTime();
        const start = new Date(cycle.startAt).getTime();
        const end = cycle.endAt ? new Date(cycle.endAt).getTime() : Infinity;
        return t >= start && t <= end;
      });

      const aggregates = telemetryContract?.aggregateTelemetry
        ? telemetryContract.aggregateTelemetry(cycleReadings)
        : {};

      const compliance = calculateEnvironmentalCompliance(cycleReadings, cycle.targets);

      return {
        cycleId: cycle.id,
        roomId: cycle.roomId,
        stage: cycle.stage,
        state: cycle.state,
        startAt: cycle.startAt,
        endAt: cycle.endAt,
        targets: cycle.targets || {},
        aggregates,
        compliance,
        readingsCount: {
          total: cycleReadings.length,
          valid: cycleReadings.filter(r => r.quality === 'valid').length,
          quarantined: cycleReadings.filter(r => r.quality === 'quarantined').length,
        },
      };
    });

    // 4. Resultados de producción y bitácora
    const loteBolsas = bolsas.filter(b => b.loteId === batchId || !b.loteId);
    const loteCosechas = cosechas.filter(c => c.loteId === batchId || !c.loteId);

    const stats = bitacoraModel?.calcLoteStats
      ? bitacoraModel.calcLoteStats(lote, loteBolsas, loteCosechas)
      : null;

    // 5. Filtrar incidencias climáticas sufridas por este lote
    const loteIncidencias = incidencias.filter(inc => {
      if (Array.isArray(inc.loteIds) && inc.loteIds.includes(batchId)) return true;
      if (inc.loteId === batchId) return true;
      // Incidencia ocurrida en la misma sala durante un ciclo del lote
      return matchingCycles.some(c => c.roomId === inc.roomId);
    });

    // 6. Resumen global de cumplimiento ambiental
    let totalInBand = 0;
    let totalValid = 0;
    environmentalHistory.forEach(eh => {
      Object.values(eh.compliance).forEach(cmp => {
        if (cmp.validCount > 0) {
          totalValid += cmp.validCount;
          totalInBand += cmp.inBandCount;
        }
      });
    });
    const globalEnvironmentalCompliancePct = totalValid > 0
      ? Math.round((totalInBand / totalValid) * 1000) / 10
      : null;

    return {
      schema: 'setas.batch-traceability.v1',
      batchId,
      batchCode,
      speciesId,
      state: lote.estado || lote.state || 'activo',
      fechaInoculacion: lote.fechaInoculacion || null,
      lineage: {
        recipeSnapshot,
        ingredientLots: ingredientLots.map(x => ({ ...x })),
        spawnLot: spawnLot ? { ...spawnLot } : null,
      },
      environmentalHistory,
      globalEnvironmentalCompliancePct,
      productionOutcomes: stats ? {
        biologicalEfficiencyPct: stats.be,
        totalFreshKg: stats.totalFresco,
        contaminationPct: stats.contPct,
        colonizationDays: stats.diasCol,
        bagsTotal: stats.numBolsas,
        bagsHealthy: stats.bolsasSanas,
        bagsContaminated: stats.bolsasContaminadas,
        costIncurredTotalCop: stats.costoIncurridoTotal,
        costPerKgHarvestedCop: stats.costoRealPorKgCosechado,
      } : null,
      incidencias: loteIncidencias,
      provenance: {
        sensors: totalValid > 0 ? 'esp32_iot_verified' : 'missing',
        traceability: ingredientLots.length > 0 ? 'full_fifo_lots' : 'recipe_only',
        biological: stats ? 'measured_from_bitacora' : 'pending',
      },
      generatedAt: generatedAt || new Date().toISOString(),
    };
  };

  /**
   * Exporta un certificado de trazabilidad limpio para impresión de etiqueta térmica
   * o consulta pública de clientes/restaurantes vía código QR.
   *
   * @param {object} report Reporte generado por buildBatchTraceabilityReport
   * @param {object} options
   * @param {boolean} [options.isPublic=false] Si es true, oculta costos y datos confidenciales
   * @returns {object} Certificado formateado para QR o etiqueta
   */
  const exportBatchCertificate = (report, { isPublic = false } = {}) => {
    if (!report || !report.batchId) throw new Error('Reporte de trazabilidad inválido');

    const base = {
      certificateId: `SDP-CERT-${report.batchCode || report.batchId}`,
      batchCode: report.batchCode,
      speciesId: report.speciesId,
      origin: 'Setas de la Peña — Tenjo, Cundinamarca, Colombia',
      organicCleanPractices: true,
      inoculationDate: report.fechaInoculacion,
      stages: report.environmentalHistory.map(h => ({
        stage: h.stage,
        roomId: h.roomId,
        compliancePct: h.compliance.temperature_c?.compliancePct ?? null,
      })),
      environmentalAdherencePct: report.globalEnvironmentalCompliancePct,
      verificationUrl: `https://setasdelapena.com/trace/${encodeURIComponent(report.batchCode)}`,
      certifiedAt: new Date().toISOString(),
    };

    if (isPublic) {
      return {
        ...base,
        harvestSummary: report.productionOutcomes ? {
          totalKg: report.productionOutcomes.totalFreshKg,
          biologicalEfficiencyPct: report.productionOutcomes.biologicalEfficiencyPct,
        } : null,
        substrates: (report.lineage.ingredientLots || []).map(i => i.nombre || i.ingredienteId || 'Sustrato orgánico'),
      };
    }

    return {
      ...base,
      fullAudit: report,
    };
  };

  const api = {
    calculateEnvironmentalCompliance,
    buildBatchTraceabilityReport,
    exportBatchCertificate,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBatchTraceability = api;
})();
