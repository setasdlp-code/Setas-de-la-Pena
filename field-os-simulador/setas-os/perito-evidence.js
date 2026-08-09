'use strict';
// Contrato de procedencia para datos usados por el Perito.
// No inventa bibliografía: los registros heredados quedan explícitamente
// marcados como legacy/low hasta enlazarlos con una fuente o medición real.
(function () {
  const VALID_SOURCE_TYPES = new Set([
    'literature',
    'supplier',
    'lab_measurement',
    'setas_dlp_trial',
    'field_measurement',
    'legacy_heuristic',
  ]);
  const VALID_CONFIDENCE = new Set(['low', 'medium', 'high']);

  const normalizeEvidence = (evidence = {}, fallback = {}) => {
    const sourceType = VALID_SOURCE_TYPES.has(evidence.sourceType)
      ? evidence.sourceType
      : (fallback.sourceType || 'legacy_heuristic');
    const confidence = VALID_CONFIDENCE.has(evidence.confidence)
      ? evidence.confidence
      : (fallback.confidence || 'low');
    return {
      sourceType,
      confidence,
      sourceId: evidence.sourceId || null,
      sourceLabel: evidence.sourceLabel || null,
      measuredAt: evidence.measuredAt || null,
      sampleSize: Number.isFinite(evidence.sampleSize) ? evidence.sampleSize : null,
      conditions: evidence.conditions || null,
      notes: evidence.notes || null,
    };
  };

  const annotateSpecies = (species = {}) => Object.fromEntries(
    Object.entries(species).map(([id, value]) => [id, {
      ...value,
      evidence: normalizeEvidence(value?.evidence, {
        sourceType: 'legacy_heuristic',
        confidence: 'low',
      }),
    }])
  );

  const annotateIngredients = (ingredients = []) => ingredients.map((value) => ({
    ...value,
    evidence: normalizeEvidence(value?.evidence, {
      sourceType: value?.labMeasured ? 'lab_measurement' : 'legacy_heuristic',
      confidence: value?.labMeasured ? 'medium' : 'low',
    }),
  }));

  const summarizeEvidence = ({ speciesEvidence, ingredientEvidence = [] } = {}) => {
    const entries = [speciesEvidence, ...ingredientEvidence].filter(Boolean);
    if (!entries.length) return { confidence: 'low', verified: 0, total: 0 };
    const rank = { low: 0, medium: 1, high: 2 };
    const avg = entries.reduce((sum, e) => sum + (rank[e.confidence] ?? 0), 0) / entries.length;
    const confidence = avg >= 1.5 ? 'high' : avg >= 0.75 ? 'medium' : 'low';
    const verified = entries.filter((e) => e.sourceType !== 'legacy_heuristic' && !!e.sourceId).length;
    return { confidence, verified, total: entries.length };
  };

  const api = { normalizeEvidence, annotateSpecies, annotateIngredients, summarizeEvidence };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPeritoEvidence = api;
})();
