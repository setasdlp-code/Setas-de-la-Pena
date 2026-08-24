'use strict';
// SETAS OS — modelo mínimo para declarar ensayos antes de ejecutarlos.
// Su función principal es impedir que una comparación exploratoria se promueva
// como evidencia causal fuerte sin replicación y trazabilidad suficientes.
(function () {
  const VALID_STATUS = new Set(['draft', 'running', 'complete', 'cancelled']);
  const VALID_METRICS = new Set([
    'be_pct', 'contamination_pct', 'colonization_days', 'cost_per_kg_cop',
    'commercial_yield_kg', 'total_fresh_kg'
  ]);

  const normalizeArm = (arm = {}, role = 'treatment') => ({
    id: String(arm.id || '').trim(),
    role,
    label: arm.label || arm.id || null,
    recipeVersionId: arm.recipeVersionId || null,
    recipeSnapshot: arm.recipeSnapshot || null,
    change: arm.change || null,
    plannedReplicates: Number.isInteger(arm.plannedReplicates) ? arm.plannedReplicates : null,
    batchIds: [...new Set((arm.batchIds || []).map(String).filter(Boolean))],
  });

  const normalizeExperiment = (input = {}) => {
    const defaultReplicates = Number.isInteger(input.replicatesPerArm) ? input.replicatesPerArm : 1;
    const control = normalizeArm({ ...(input.control || {}), plannedReplicates: input.control?.plannedReplicates ?? defaultReplicates }, 'control');
    const treatments = (input.treatments || []).map(t => normalizeArm({ ...t, plannedReplicates: t.plannedReplicates ?? defaultReplicates }, 'treatment'));
    return {
      schema: 'setas.experiment.v1',
      id: String(input.id || '').trim(),
      title: input.title || null,
      hypothesis: input.hypothesis || null,
      status: input.status || 'draft',
      speciesId: input.speciesId || null,
      strainId: input.strainId || null,
      spawnLotId: input.spawnLotId || null,
      primaryMetric: input.primaryMetric || null,
      secondaryMetrics: [...new Set((input.secondaryMetrics || []).filter(Boolean))],
      control,
      treatments,
      randomization: !!input.randomization,
      blockingFactors: [...new Set((input.blockingFactors || []).filter(Boolean))],
      fixedFactors: input.fixedFactors || {},
      plannedAt: input.plannedAt || null,
      startedAt: input.startedAt || null,
      completedAt: input.completedAt || null,
      notes: input.notes || null,
    };
  };

  const classifyExperiment = (input = {}) => {
    const exp = normalizeExperiment(input);
    const allArms = [exp.control, ...exp.treatments];
    const minReplicates = Math.min(...allArms.map(a => a.plannedReplicates || 0));
    if (exp.randomization && minReplicates >= 3 && exp.treatments.length >= 1) return 'comparative';
    return 'exploratory';
  };

  const validateExperiment = (input = {}) => {
    const exp = normalizeExperiment(input);
    const errors = [];
    if (!exp.id) errors.push('missing id');
    if (!exp.title) errors.push('missing title');
    if (!exp.hypothesis) errors.push('missing hypothesis');
    if (!VALID_STATUS.has(exp.status)) errors.push(`invalid status: ${exp.status}`);
    if (!exp.speciesId) errors.push('missing speciesId');
    if (!VALID_METRICS.has(exp.primaryMetric)) errors.push(`invalid primaryMetric: ${exp.primaryMetric}`);
    if (!exp.control.id) errors.push('control arm requires id');
    if (!exp.treatments.length) errors.push('at least one treatment arm is required');

    const arms = [exp.control, ...exp.treatments];
    const ids = arms.map(a => a.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) errors.push('arm ids must be unique');
    arms.forEach((arm) => {
      if (!arm.id) errors.push('arm requires id');
      if (!Number.isInteger(arm.plannedReplicates) || arm.plannedReplicates < 1) errors.push(`${arm.id || 'arm'}: plannedReplicates must be >= 1`);
      if (!arm.recipeVersionId && !arm.recipeSnapshot) errors.push(`${arm.id || 'arm'}: recipeVersionId or recipeSnapshot required`);
    });
    exp.secondaryMetrics.forEach((metric) => {
      if (!VALID_METRICS.has(metric)) errors.push(`invalid secondaryMetric: ${metric}`);
    });
    if (exp.status === 'complete' && !exp.completedAt) errors.push('complete experiment requires completedAt');
    return errors;
  };

  const promotionGate = (input = {}, evidenceRecords = []) => {
    const exp = normalizeExperiment(input);
    const reasons = [];
    const arms = [exp.control, ...exp.treatments];
    if (validateExperiment(exp).length) reasons.push('experiment_definition_invalid');
    if (exp.status !== 'complete') reasons.push('experiment_not_complete');
    if (!exp.randomization) reasons.push('randomization_missing');
    if (classifyExperiment(exp) !== 'comparative') reasons.push('insufficient_planned_replication');

    arms.forEach((arm) => {
      const armEvidence = evidenceRecords.filter((r) => arm.batchIds.includes(r.batchId));
      const completed = armEvidence.filter((r) => Number.isFinite(Number(r.metrics?.[exp.primaryMetric])));
      if (completed.length < (arm.plannedReplicates || 1)) reasons.push(`${arm.id}: incomplete_primary_metric_evidence`);
      if (completed.some((r) => !r.recipeSnapshot || !(r.ingredientLots || []).length)) reasons.push(`${arm.id}: incomplete_traceability`);
    });

    return {
      eligible: reasons.length === 0,
      evidenceClass: classifyExperiment(exp),
      reasons: [...new Set(reasons)],
      peritoUsage: reasons.length === 0 ? 'comparative_evidence_candidate' : 'context_only',
    };
  };

  const api = { VALID_STATUS, VALID_METRICS, normalizeExperiment, validateExperiment, classifyExperiment, promotionGate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasExperiment = api;
})();
