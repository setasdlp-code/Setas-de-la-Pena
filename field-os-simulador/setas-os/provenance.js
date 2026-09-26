'use strict';

/**
 * @file provenance.js — Traductor único de procedencia y confianza para Setas OS.
 *
 * Setas OS ya tiene ~10 vocabularios de procedencia dispersos por el código, cada
 * uno inventado ad hoc por el módulo que lo necesitaba en su momento (`'manual'`,
 * `'operator-measured'`, `'inventory'`, `'model+field-data'`, `'quantity-aware'`...).
 * Este módulo NO añade un vocabulario más ni inventa procedencia nueva: TRADUCE
 * la que ya existe a un vocabulario canónico de seis palabras (KINDS), para que
 * quien pinta un número en la UI no tenga que conocer los ~10 vocabularios de
 * origen ni decidir por su cuenta qué tan autoritativo suena.
 *
 * Regla dura (ver .claude/skills/agronomic-claims/SKILL.md): este módulo no
 * calcula ni promueve procedencia ni confianza. Si el vocabulario o el valor de
 * origen son desconocidos, o si el valor de origen significa "no hay dato",
 * devuelve `null` — nunca adivina, nunca es optimista.
 *
 * ── Vocabularios de origen y de dónde sale cada uno (revisar ahí si cambian) ──
 *
 *  - 'timeline'          → batch-sheet.js, buildEventTimeline(): campo `provenance`
 *                          de cada evento del timeline del lote (~línea 417).
 *  - 'moisture'           → launch-plan.js, buildPreparationSnapshot(): campo
 *                          `items[].moisture.source` (~línea 55).
 *  - 'cost'               → scoring.js, resolveCost(): campo `costDetail.source`
 *                          (~línea 53).
 *  - 'ebType'             → scoring.js, buildProvenance(): campo
 *                          `provenance.eb.type` (~línea 329-337).
 *  - 'calibration'        → scoring.js, resolveCalibration(): campo
 *                          `calibration.source` (~línea 173-193).
 *  - 'stock'              → scoring.js, STOCK_PROVENANCE[mode].type (~línea 319).
 *  - 'telemetryQuality'   → telemetry-contract.js, normalizeTelemetry(): campo
 *                          `reading.quality` (~línea 7 y 46).
 *  - 'cycleEnvironment'   → cycle-evidence.js, buildCycleEvidence(): campo
 *                          `provenance.environment` (~línea 130).
 *
 * ── Tres escalas de confianza, mismas tres palabras, tres significados ──
 *
 * Ver la sección "Three confidence scales share the same three words" del
 * skill agronomic-claims. `describeConfidence()` existe específicamente para que
 * sea imposible pintar un nivel low/medium/high sin decir de qué escala salió:
 *
 *  - 'evidence' — Escala A (cycle-evidence.js / historical-evidence). Techo
 *    estructural: nunca llega a 'high'. Una sola ronda observacional no es un
 *    experimento causal replicado, y eso no se "arregla" subiendo el techo.
 *  - 'ebBand'   — Escala B (scoring.js buildUncertainty() → provenance.eb.confidence).
 *    Sí puede llegar a 'high', bajo los criterios de ADR-0007.
 *  - 'method'   — Escala C (provenance.{ph,risk,stock}.confidence). Califica el
 *    MÉTODO de derivación, no la fuerza de la evidencia — 'high' aquí certifica
 *    forma del input, no verdad demostrada.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // ── Vocabulario canónico de procedencia ──────────────────────────────────
  const KINDS = Object.freeze({
    measured: 'measured',
    calculated: 'calculated',
    estimated: 'estimated',
    target: 'target',
    manual: 'manual',
    simulated: 'simulated',
  });

  const KIND_LABELS = Object.freeze({
    measured: 'Medido',
    calculated: 'Calculado',
    estimated: 'Estimado',
    target: 'Objetivo',
    manual: 'Manual',
    simulated: 'Simulado',
  });

  // ── Escalas de confianza (ver cabecera) ──────────────────────────────────
  const CONFIDENCE_SCALES = Object.freeze({
    evidence: Object.freeze({ ceiling: 'medium' }),
    ebBand: Object.freeze({ ceiling: 'high' }),
    method: Object.freeze({ ceiling: 'high' }),
  });

  const LEVEL_LABEL_ES = Object.freeze({
    low: 'baja',
    medium: 'media',
    high: 'alta',
    unknown: 'sin determinar',
  });
  const VALID_LEVELS = Object.freeze(['low', 'medium', 'high', 'unknown']);
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ── Mapas de traducción, un objeto legible por vocabulario, no un if/else ──
  // Cada entrada es { kind, detail, caveat } o `null` explícito cuando el valor
  // de origen significa "no hay dato" — quien pinta debe saber que no puede
  // afirmar nada, no recibir un kind optimista.

  // batch-sheet.js buildEventTimeline(): provenance de cada evento del timeline.
  const TIMELINE = Object.freeze({
    manual: { kind: KINDS.manual, detail: 'registrado por el operario', caveat: null },
    measured: { kind: KINDS.measured, detail: 'medido en campo', caveat: null },
    calculated_from_bitacora: { kind: KINDS.calculated, detail: 'derivado de la bitácora', caveat: null },
    degraded: { kind: KINDS.measured, detail: 'medido en campo', caveat: 'telemetría degradada' },
  });

  // launch-plan.js buildPreparationSnapshot(): items[].moisture.source.
  const MOISTURE = Object.freeze({
    'operator-measured': { kind: KINDS.measured, detail: 'medido por el operario para esta preparación', caveat: null },
    'catalog-estimate': { kind: KINDS.estimated, detail: 'estimación del catálogo, no es medición de este lote', caveat: null },
  });

  // scoring.js resolveCost(): costDetail.source.
  const COST = Object.freeze({
    inventory: { kind: KINDS.measured, detail: 'costo real de los lotes en bodega', caveat: null },
    catalog: { kind: KINDS.estimated, detail: 'precio de catálogo, no de compra', caveat: null },
  });

  // scoring.js buildProvenance(): provenance.eb.type.
  const EB_TYPE = Object.freeze({
    'model+field-data': { kind: KINDS.estimated, detail: 'modelo con historial de campo de la finca', caveat: null },
    'heuristic-model': { kind: KINDS.estimated, detail: 'modelo heurístico, sin historial de campo', caveat: null },
  });

  // scoring.js resolveCalibration(): calibration.source.
  const CALIBRATION = Object.freeze({
    theoretical: { kind: KINDS.estimated, detail: 'valor teórico', caveat: null },
    preblended: { kind: KINDS.estimated, detail: 'mezcla precalibrada', caveat: null },
    'history-blend': { kind: KINDS.estimated, detail: 'mezclado con historial de la finca', caveat: null },
  });

  // scoring.js STOCK_PROVENANCE[mode].type.
  const STOCK = Object.freeze({
    'quantity-aware': { kind: KINDS.measured, detail: 'cantidades reales de bodega', caveat: null },
    'presence-only': { kind: KINDS.estimated, detail: 'sólo se sabe que hay, no cuánto', caveat: null },
    'no-stock-data': null,
  });

  // telemetry-contract.js normalizeTelemetry(): reading.quality.
  const TELEMETRY_QUALITY = Object.freeze({
    valid: { kind: KINDS.measured, detail: 'lectura de sensor', caveat: null },
    suspect: { kind: KINDS.measured, detail: 'lectura de sensor', caveat: 'valor sospechoso' },
    calibration_due: { kind: KINDS.measured, detail: 'lectura de sensor', caveat: 'sensor pendiente de calibrar' },
    quarantined: null,
    missing: null,
  });

  // cycle-evidence.js buildCycleEvidence(): provenance.environment.
  const CYCLE_ENVIRONMENT = Object.freeze({
    measured: { kind: KINDS.measured, detail: 'telemetría del ciclo', caveat: null },
    degraded: { kind: KINDS.measured, detail: 'telemetría del ciclo', caveat: 'cobertura incompleta' },
    missing: null,
  });

  const LEGACY_VOCAB = Object.freeze({
    timeline: TIMELINE,
    moisture: MOISTURE,
    cost: COST,
    ebType: EB_TYPE,
    calibration: CALIBRATION,
    stock: STOCK,
    telemetryQuality: TELEMETRY_QUALITY,
    cycleEnvironment: CYCLE_ENVIRONMENT,
  });

  /**
   * Traduce un valor de un vocabulario existente al vocabulario canónico.
   * Falla cerrado: vocabulario desconocido, valor desconocido, o valor que
   * significa "no hay dato" → `null`. Nunca adivina.
   */
  const fromLegacy = (vocabulary, value) => {
    const table = LEGACY_VOCAB[vocabulary];
    if (!table || !Object.prototype.hasOwnProperty.call(table, value)) return null;
    const entry = table[value];
    if (!entry) return null;
    return { kind: entry.kind, detail: entry.detail, caveat: entry.caveat ?? null };
  };

  /**
   * Devuelve la forma lista para pintar: { kind, label, detail, caveat, shortLabel }.
   * `input` es { vocabulary, value } (se traduce con fromLegacy) o directamente
   * { kind, detail, caveat } (ya canónico). Si la traducción falla, o el `kind`
   * directo no es uno de KINDS, devuelve `null` en vez de adivinar. Congelado.
   */
  const describe = (input) => {
    if (!input || typeof input !== 'object') return null;
    let translated;
    if (Object.prototype.hasOwnProperty.call(input, 'vocabulary')) {
      translated = fromLegacy(input.vocabulary, input.value);
      if (!translated) return null;
    } else {
      if (!input.kind || !KIND_LABELS[input.kind]) return null;
      translated = { kind: input.kind, detail: input.detail ?? null, caveat: input.caveat ?? null };
    }
    const label = KIND_LABELS[translated.kind];
    const caveat = translated.caveat ?? null;
    const shortLabel = caveat ? `${label} (${caveat})` : label;
    return Object.freeze({ kind: translated.kind, label, detail: translated.detail ?? null, caveat, shortLabel });
  };

  const formatSimilarity = (value) =>
    Number(value).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Escala A — nunca 'high'. Ver cabecera y skill agronomic-claims: el techo es
  // deliberado, jamás se "arregla" subiéndolo.
  const describeEvidence = (level, ceiling) => {
    const capped = level === 'high';
    const effectiveLevel = capped ? 'medium' : level;
    let text = `evidencia observacional: ${LEVEL_LABEL_ES[effectiveLevel]}`;
    if (effectiveLevel === 'medium') text += ' (tope del modelo observacional)';
    const result = {
      scale: 'evidence',
      level: effectiveLevel,
      label: capitalize(LEVEL_LABEL_ES[effectiveLevel]),
      text,
      ceiling,
    };
    if (capped) {
      result.caveat = "la evidencia observacional nunca llega a 'alta': una sola ronda de observación no es un experimento causal replicado";
    }
    return Object.freeze(result);
  };

  // Escala B — banda de predicción de BE (provenance.eb.confidence).
  const describeEbBand = (level, extra, ceiling) => {
    let text = `banda de predicción de BE: ${LEVEL_LABEL_ES[level]}`;
    const parts = [];
    if (extra && Number.isFinite(Number(extra.sampleSize))) parts.push(`n=${Math.round(Number(extra.sampleSize))}`);
    if (extra && Number.isFinite(Number(extra.similarity))) parts.push(`similitud ${formatSimilarity(extra.similarity)}`);
    if (parts.length) text += ` (${parts.join(' · ')})`;
    const result = { scale: 'ebBand', level, label: capitalize(LEVEL_LABEL_ES[level]), text, ceiling };
    if (level === 'high') result.caveat = 'no verificado contra el criterio completo de ADR-0007';
    return Object.freeze(result);
  };

  // Escala C — método de derivación (provenance.{ph,risk,stock}.confidence).
  // Siempre lleva su caveat: 'high' aquí certifica forma del input, nunca fuerza
  // de la evidencia, y eso hay que decirlo en cualquier nivel, no sólo en 'high'.
  const describeMethod = (level, ceiling) => {
    const text = `método de derivación: ${LEVEL_LABEL_ES[level]}`;
    return Object.freeze({
      scale: 'method',
      level,
      label: capitalize(LEVEL_LABEL_ES[level]),
      text,
      caveat: 'califica cómo se derivó, no la fuerza de la evidencia',
      ceiling,
    });
  };

  /**
   * Describe un nivel de confianza NOMBRANDO SIEMPRE la escala que lo produjo.
   * `scale` desconocida o `level` fuera de low/medium/high/unknown → `null`.
   */
  const describeConfidence = (scale, level, extra = {}) => {
    const scaleDef = CONFIDENCE_SCALES[scale];
    if (!scaleDef) return null;
    if (!VALID_LEVELS.includes(level)) return null;
    if (scale === 'evidence') return describeEvidence(level, scaleDef.ceiling);
    if (scale === 'ebBand') return describeEbBand(level, extra, scaleDef.ceiling);
    return describeMethod(level, scaleDef.ceiling);
  };

  const api = {
    KINDS,
    KIND_LABELS,
    CONFIDENCE_SCALES,
    fromLegacy,
    describe,
    describeConfidence,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') glob.SetasProvenance = api;
})();
