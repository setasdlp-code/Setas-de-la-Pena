'use strict';
/**
 * Setas OS — Sweep Journal Controller (Modo Barrido con Concurrencia Optimista)
 *
 * Módulo puro sin dependencias de React para auditorías masivas de bolsas por hilera.
 * Garantiza:
 * 1. Transiciones atómicas con control de revisión optimista (expectedRevision vs actualRevision).
 * 2. Protección fitosanitaria estricta: bolsas contaminadas nunca se marcan sanas en barrido.
 * 3. No retroceso de colonización sin motivo estructurado explícito ('damage_observed', 'reinoculation', 'data_correction').
 * 4. Preservación de la fecha histórica col100 cuando una bolsa ya estaba al 100%.
 * 5. Observaciones de riesgo vinculadas a un operationId sin mutar destructivamente el estado formal.
 */
(function () {
  const VALID_REGRESSION_REASONS = Object.freeze([
    'damage_observed',
    'reinoculation',
    'data_correction'
  ]);

  const VALID_RISK_TYPES = Object.freeze([
    'micelio_debil',
    'humedad_baja',
    'humedad_excesiva',
    'posible_contaminacion',
    'fuga_filtro',
    'deformidad_primordio',
    'general'
  ]);

  /**
   * Crea una entrada de bolsa para la cola temporal de barrido.
   */
  const createSweepEntry = (bag, { scannedAt = Date.now(), expectedRevision = null } = {}) => {
    if (!bag || !bag.id) {
      throw new Error('bag_must_have_id');
    }
    return {
      bagId: bag.id,
      codigo: bag.codigo || bag.id,
      loteId: bag.loteId || null,
      estado: bag.estado || 'sana',
      colonizacion: typeof bag.colonizacion === 'number' ? bag.colonizacion : 0,
      col100: bag.col100 || null,
      expectedRevision: expectedRevision !== null ? expectedRevision : (bag.revision ?? 0),
      scannedAt: typeof scannedAt === 'number' ? scannedAt : Date.now(),
    };
  };

  /**
   * Aplica la operación masiva de barrido sobre la colección de bolsas.
   */
  const applySweepOperation = ({
    allBolsas = [],
    sweepQueue = [],
    targetColonizacion = null,
    structuredReason = null,
    operationId = null,
    operator = 'operario_local',
    now = Date.now(),
    isRiskObservation = false,
    riskType = null,
    riskNota = '',
  } = {}) => {
    if (!Array.isArray(allBolsas)) throw new Error('allBolsas_must_be_array');
    if (!Array.isArray(sweepQueue)) throw new Error('sweepQueue_must_be_array');

    const opId = operationId || `SWEEP_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const results = [];
    const updatedMap = new Map();
    const isoNow = new Date(now).toISOString();

    for (const entry of sweepQueue) {
      const bagId = entry.bagId || entry.id;
      const currentBag = allBolsas.find(b => b.id === bagId);

      if (!currentBag) {
        results.push({ bagId, updated: false, reason: 'bag_not_found' });
        continue;
      }

      // 1. Control de revisión optimista
      const actualRev = currentBag.revision ?? 0;
      if (
        entry.expectedRevision !== undefined &&
        entry.expectedRevision !== null &&
        entry.expectedRevision !== actualRev
      ) {
        results.push({
          bagId,
          updated: false,
          reason: 'revision_conflict',
          expectedRevision: entry.expectedRevision,
          actualRevision: actualRev,
        });
        continue;
      }

      // 2. Invariante fitosanitario: bolsas contaminadas protegidas
      if (currentBag.estado === 'contaminada') {
        results.push({
          bagId,
          updated: false,
          reason: 'contaminated_bag_protected',
          estado: 'contaminada',
        });
        continue;
      }

      // 3. Caso: Observación de riesgo sin mutar a cuarentena destructivamente
      if (isRiskObservation) {
        const resolvedRiskType = VALID_RISK_TYPES.includes(riskType) ? riskType : 'general';
        const updatedBag = {
          ...currentBag,
          riskObsRef: opId,
          riskType: resolvedRiskType,
          riskNota: (riskNota || '').trim(),
          riskObsAt: isoNow,
          riskObsBy: operator,
          revision: actualRev + 1,
          updatedAt: isoNow,
        };
        updatedMap.set(bagId, updatedBag);
        results.push({
          bagId,
          updated: true,
          isRiskObservation: true,
          riskType: resolvedRiskType,
        });
        continue;
      }

      // 4. Caso: Actualización de porcentaje de colonización
      const targetPct = typeof targetColonizacion === 'number' ? targetColonizacion : null;
      if (targetPct === null || targetPct < 0 || targetPct > 100) {
        results.push({ bagId, updated: false, reason: 'invalid_target_colonizacion' });
        continue;
      }

      const prevPct = typeof currentBag.colonizacion === 'number' ? currentBag.colonizacion : 0;

      // 5. Invariante de no retroceso sin motivo estructurado
      if (targetPct < prevPct) {
        if (!VALID_REGRESSION_REASONS.includes(structuredReason)) {
          results.push({
            bagId,
            updated: false,
            reason: 'regression_requires_structured_reason',
            prevColonizacion: prevPct,
            targetColonizacion: targetPct,
          });
          continue;
        }
      }

      // 6. Preservación histórica de col100
      let col100 = currentBag.col100 || null;
      if (targetPct === 100) {
        if (!col100) {
          col100 = isoNow.slice(0, 10);
        }
        // Si ya tenía fecha col100, se preserva intacta la original
      }

      const updatedBag = {
        ...currentBag,
        colonizacion: targetPct,
        col100,
        sweepOpRef: opId,
        sweepReason: targetPct < prevPct ? structuredReason : null,
        revision: actualRev + 1,
        updatedAt: isoNow,
      };

      updatedMap.set(bagId, updatedBag);
      results.push({
        bagId,
        updated: true,
        prevColonizacion: prevPct,
        newColonizacion: targetPct,
      });
    }

    const updatedCount = results.filter(r => r.updated).length;
    let status = 'failed';
    if (sweepQueue.length > 0 && updatedCount === sweepQueue.length) {
      status = 'applied';
    } else if (updatedCount > 0) {
      status = 'partial';
    } else {
      status = 'failed';
    }

    const nextBolsas = allBolsas.map(b => (updatedMap.has(b.id) ? updatedMap.get(b.id) : b));

    return {
      operationId: opId,
      status,
      totalScanned: sweepQueue.length,
      totalUpdated: updatedCount,
      results,
      updatedBolsas: nextBolsas,
      appliedMap: updatedMap,
    };
  };

  const api = {
    VALID_REGRESSION_REASONS,
    VALID_RISK_TYPES,
    createSweepEntry,
    applySweepOperation,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasSweepJournal = api;
})();
