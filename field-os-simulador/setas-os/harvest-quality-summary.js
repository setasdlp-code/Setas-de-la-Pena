'use strict';

/**
 * @file harvest-quality-summary.js — Agregados con n visible de la calidad de
 * cosecha de UN lote, derivados de la proyección `quality` de lot-record.js
 * (`setas.lot-record.v1`). No lee cosechas crudas ni define un modelo propio:
 * es la capa de lectura del bloque `quality` de #520.
 *
 * Qué entrega (por oleada y acumulado):
 *   - cosechas con y sin calidad registrada;
 *   - % de primera sobre el peso con grado declarado, SOLO si el n y la
 *     cobertura alcanzan; si no, `status: 'insufficient_data'` y `fraction: null`
 *     (nunca un porcentaje con datos insuficientes);
 *   - frecuencia de cada defecto de campo como «k de n cosechas evaluadas»
 *     (n = cosechas con los defectos evaluados, no «con alguna calidad»);
 *   - firmeza como conteo por nivel de una escala ordinal (sin media: un
 *     promedio de una escala ordinal no es una medición).
 *
 * Reglas (agronomic-claims / AGENTS.md §4):
 *   - Un grado es un juicio del operario contra un criterio provisional y sin
 *     versionar (`quality.criteria`); no es una medición ni es comparable entre
 *     especies. Aquí solo se agrega, no se interpreta.
 *   - null no es 0: un grado no declarado nunca entra como cero.
 *   - La tolerancia de la suma de grados NO se define aquí: es la de
 *     lot-record (`harvests[].gap`, max(1 %, 5 g)). Una cosecha con
 *     `over_tolerance` se cuenta aparte, se excluye del porcentaje y se informa
 *     su desfase.
 *   - Una cosecha con los tres grados pero sin peso neto (`no_net_weight`) no se
 *     puede verificar contra el total: también se cuenta aparte y se excluye.
 *   - La calidad es evidencia para el Perito, nunca insumo de ranking,
 *     scoring ni calibración (ADR-0004): este módulo no toca nada de eso.
 *
 * Umbrales SIN fuente en la KB: `minHarvestsWithGrades` y `minCoverage` son
 * parámetros con nombre, valor inicial sin aprobar
 * (`unsourced_default_pending_owner_decision`) y se sobrescriben por argumento.
 *
 * Lógica pura (UMD): sin React, DOM, red, almacenamiento ni reloj.
 */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : {};
  const bitacoraRef = () => (isNode ? require('./bitacora-model.js') : glob.SetasBitacora) || null;

  const THRESHOLD_BASIS = 'unsourced_default_pending_owner_decision';
  // Valores iniciales sugeridos por el propietario del diseño, no aprobados.
  const DEFAULT_THRESHOLDS = Object.freeze({
    minHarvestsWithGrades: 3,
    minCoverage: 0.5,
    basis: THRESHOLD_BASIS,
  });

  const GRADES = Object.freeze(['primera', 'segunda', 'descarte']);

  const finiteNonNeg = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);

  const thresholdsFrom = (options) => {
    const o = options && typeof options === 'object' ? options : {};
    const n = Number(o.minHarvestsWithGrades);
    const c = Number(o.minCoverage);
    const validN = Number.isFinite(n) && n >= 1;
    const validC = Number.isFinite(c) && c >= 0 && c <= 1;
    return {
      minHarvestsWithGrades: validN ? Math.floor(n) : DEFAULT_THRESHOLDS.minHarvestsWithGrades,
      minCoverage: validC ? c : DEFAULT_THRESHOLDS.minCoverage,
      // Un valor pasado por argumento no gana fuente por ese solo hecho: lo
      // único que cambia es quién lo eligió.
      basis: validN || validC ? 'caller_supplied_override_unsourced' : THRESHOLD_BASIS,
    };
  };

  const defectLabels = () => {
    const bit = bitacoraRef();
    const list = bit && bit.HARVEST_QUALITY && bit.HARVEST_QUALITY.FIELD_DEFECTS;
    return Object.fromEntries((list || []).map((d) => [d.key, d.label]));
  };

  // Una cosecha entra al % de primera solo si declara los tres grados y su suma
  // cuadra con el neto dentro de la tolerancia de lot-record.
  const classifyHarvest = (h) => {
    const gap = h && h.gap ? h.gap : null;
    const gradeKg = h && h.gradeKg ? h.gradeKg : {};
    const complete = h && h.gradesComplete === true && GRADES.every((g) => finiteNonNeg(gradeKg[g]) != null);
    const declaredAny = GRADES.some((g) => finiteNonNeg(gradeKg[g]) != null);
    if (!declaredAny) return 'no_grades';
    if (!complete) return 'partial_grades';
    const status = gap && gap.status;
    if (status === 'over_tolerance') return 'gap_excluded';
    if (status === 'ok') return 'eligible';
    // no_net_weight (o cualquier estado que no confirme la suma): no verificable.
    return 'unverifiable';
  };

  /**
   * Agrega un conjunto de cosechas (de una oleada o de todo el lote).
   * `flushFractionsStatus` solo aplica al alcance de oleada.
   */
  const aggregate = (harvests, thresholds, { flushFractionsStatus = null } = {}) => {
    const total = harvests.length;
    const withQuality = harvests.filter((h) => h && h.hasQuality === true);
    const classes = harvests.map(classifyHarvest);
    const eligible = harvests.filter((_, i) => classes[i] === 'eligible');
    const gapExcluded = harvests.filter((_, i) => classes[i] === 'gap_excluded').map((h) => ({
      harvestId: h.harvestId == null ? null : h.harvestId,
      status: h.gap.status,
      gapG: h.gap.gapG,
      sumG: h.gap.sumG,
      netG: h.gap.netG,
      toleranceG: h.gap.toleranceG,
    }));
    const count = (c) => classes.filter((x) => x === c).length;

    const kgOf = (g) => eligible.reduce((s, h) => s + h.gradeKg[g], 0);
    const eligibleKg = eligible.length
      ? { primera: kgOf('primera'), segunda: kgOf('segunda'), descarte: kgOf('descarte') }
      : null;
    const basisKg = eligibleKg ? eligibleKg.primera + eligibleKg.segunda + eligibleKg.descarte : 0;

    // Peso declarado por grado (todas las cosechas que lo declaran, también las
    // que se excluyen del %): es lo que el operario escribió, sin interpretar.
    const declaredKg = {};
    GRADES.forEach((g) => {
      const vals = harvests.map((h) => finiteNonNeg(h && h.gradeKg ? h.gradeKg[g] : null)).filter((v) => v != null);
      declaredKg[g] = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
    });

    const coverage = total > 0 ? eligible.length / total : null;
    const reasons = [];
    if (flushFractionsStatus === 'incomplete') reasons.push('flush_fractions_incomplete');
    if (!eligible.length) reasons.push('no_eligible_harvests');
    else {
      if (eligible.length < thresholds.minHarvestsWithGrades) reasons.push('n_below_min');
      if (coverage == null || coverage < thresholds.minCoverage) reasons.push('coverage_below_min');
      if (!(basisKg > 0)) reasons.push('zero_graded_kg');
    }
    const ok = reasons.length === 0;

    // Frecuencia de defectos. n = cosechas con los defectos EVALUADOS
    // (`defectsEvaluated` de lot-record: marca «sin defectos observados» o lista
    // no vacía). Una cosecha con lista vacía y sin marca es «no evaluada»: no
    // cuenta en n, porque no se sabe si tenía defectos.
    const labels = defectLabels();
    const defectCounts = new Map();
    const undeclaredCounts = new Map();
    const evaluated = harvests.filter((h) => h && h.defectsEvaluated === true);
    evaluated.forEach((h) => {
      (Array.isArray(h.fieldDefects) ? h.fieldDefects : []).forEach((k) => defectCounts.set(k, (defectCounts.get(k) || 0) + 1));
      (Array.isArray(h.undeclaredFieldDefects) ? h.undeclaredFieldDefects : []).forEach((k) => undeclaredCounts.set(k, (undeclaredCounts.get(k) || 0) + 1));
    });
    const evaluatedCoverage = total > 0 ? evaluated.length / total : null;
    const defectsGateOk = evaluated.length >= thresholds.minHarvestsWithGrades
      && evaluatedCoverage != null && evaluatedCoverage >= thresholds.minCoverage;
    const defectRow = (key, count, declared) => ({
      key,
      label: declared ? (labels[key] || key) : key,
      declared,
      count,
      n: evaluated.length,
      // % solo con n y cobertura suficientes; el conteo «k de n» siempre es un hecho.
      fraction: defectsGateOk ? count / evaluated.length : null,
      fractionStatus: defectsGateOk ? 'ok' : 'insufficient_data',
    });
    const defects = [
      ...[...defectCounts.entries()].map(([k, c]) => defectRow(k, c, true)),
      ...[...undeclaredCounts.entries()].map(([k, c]) => defectRow(k, c, false)),
    ].sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));

    // Firmeza: ordinal 1-5, conteo por nivel; sin media ni mediana.
    const firm = withQuality.map((h) => h.firmness).filter((v) => Number.isInteger(v) && v >= 1 && v <= 5);
    const firmness = firm.length ? {
      n: firm.length,
      counts: [1, 2, 3, 4, 5].map((level) => ({ level, count: firm.filter((v) => v === level).length })),
    } : null;

    return {
      harvests: { total, withQuality: withQuality.length, withoutQuality: total - withQuality.length },
      grades: {
        withCompleteGrades: count('eligible') + count('gap_excluded') + count('unverifiable'),
        withPartialGrades: count('partial_grades'),
        withoutGrades: count('no_grades'),
        eligible: eligible.length,
        unverifiable: count('unverifiable'),
        gapExcluded,
        declaredKg,
      },
      firstGrade: {
        status: ok ? 'ok' : 'insufficient_data',
        fraction: ok ? eligibleKg.primera / basisKg : null,
        n: eligible.length,
        total,
        coverage,
        basisKg: eligible.length ? basisKg : null,
        eligibleKg,
        reasons,
      },
      defects: {
        n: evaluated.length,
        total,
        notEvaluated: total - evaluated.length,
        coverage: evaluatedCoverage,
        nBasis: 'harvests_with_defects_evaluated',
        fractionStatus: defectsGateOk ? 'ok' : 'insufficient_data',
        rows: defects,
      },
      firmness,
    };
  };

  /**
   * @param {object|null} quality  `record.quality` de buildLotRecord
   * @param {object} [options]     { minHarvestsWithGrades, minCoverage }
   * @returns {object} resumen; `status: 'none'` si ninguna cosecha registra calidad
   */
  const summarizeHarvestQuality = (quality, options) => {
    const thresholds = thresholdsFrom(options);
    const flushes = quality && Array.isArray(quality.flushes) ? quality.flushes : [];
    const allHarvests = flushes.flatMap((f) => (Array.isArray(f.harvests) ? f.harvests : []));
    const gapCodes = quality && Array.isArray(quality.gaps) ? quality.gaps.map((g) => g.code) : [];
    const anyQuality = allHarvests.some((h) => h && h.hasQuality === true);

    const rows = flushes.map((f) => ({
      flush: f.flush,
      fractionsStatus: f.fractionsStatus || 'incomplete',
      ...aggregate(Array.isArray(f.harvests) ? f.harvests : [], thresholds, { flushFractionsStatus: f.fractionsStatus || 'incomplete' }),
    }));

    return {
      status: anyQuality ? 'recorded' : 'none',
      criteria: quality && quality.criteria ? quality.criteria : null,
      gradeCriteriaProvisional: gapCodes.includes('grade_criteria_provisional'),
      qualityUnrecorded: gapCodes.includes('quality_unrecorded') || !anyQuality,
      provenance: quality && quality.provenance ? quality.provenance : null,
      thresholds,
      total: aggregate(allHarvests, thresholds),
      flushes: rows,
    };
  };

  const api = { DEFAULT_THRESHOLDS, THRESHOLD_BASIS, GRADES, summarizeHarvestQuality };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasHarvestQualitySummary = api;
})();
