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
      design: input.design || 'comparison',
      experimentalUnit: input.experimentalUnit || 'batch',
      randomizationExecutedAt: input.randomizationExecutedAt || null,
      randomizationMethod: input.randomizationMethod || null,
      assignments: (input.assignments || []).map(a=>({batchId:a.batchId,armId:a.armId})),
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
    if (exp.design !== 'exploratory' && !exp.treatments.length) errors.push('at least one treatment arm is required');

    const arms = [exp.control, ...exp.treatments];
    const ids = arms.map(a => a.id).filter(Boolean);
    const batches=arms.flatMap(a=>a.batchIds);
    if(new Set(batches).size!==batches.length)errors.push('batch belongs to multiple arms');
    if(!['comparison','exploratory'].includes(exp.design))errors.push('invalid design');
    if(exp.experimentalUnit!=='batch')errors.push('only independent batch units supported');
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

    if(!exp.randomizationExecutedAt || !Number.isFinite(Date.parse(exp.randomizationExecutedAt)) || !exp.randomizationMethod?.trim())reasons.push('randomization_execution_missing');
    const assigned=new Map();
    exp.assignments.forEach(a=>{if(assigned.has(a.batchId))reasons.push('duplicate_assignment');assigned.set(a.batchId,a.armId);});
    const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>=0;
    arms.forEach(arm=>{
      const complete=new Set();
      for(const id of arm.batchIds){
        if(assigned.get(id)!==arm.id){reasons.push(`${arm.id}: assignment_mismatch`);continue;}
        const records=evidenceRecords.filter(r=>r?.batchId===id);
        const signature=r=>JSON.stringify([r.metrics,r.outcome,r.recipeSnapshot,r.ingredientLots,r.experimentId,r.armId]);
        if(new Set(records.map(signature)).size>1){reasons.push(`${arm.id}: conflicting_evidence`);continue;}
        const r=records[0];
        if(!r||!numeric(r.metrics?.[exp.primaryMetric])||r.outcome?.verified!==true||!['completed-success','completed-zero-yield'].includes(r.outcome?.status))continue;
        if(r.experimentId!==exp.id||r.armId!==arm.id){reasons.push(`${arm.id}: membership_mismatch`);continue;}
        const expected=arm.recipeVersionId||arm.recipeSnapshot?.versionId||arm.recipeSnapshot?.id;
        if(!expected||(r.recipeSnapshot?.versionId||r.recipeSnapshot?.id)!==expected){reasons.push(`${arm.id}: recipe_version_mismatch`);continue;}
        if(!(r.ingredientLots||[]).length||r.ingredientLots.some(l=>!l.inventoryLotId&&!l.lotId)){reasons.push(`${arm.id}: incomplete_traceability`);continue;}
        complete.add(id);
      }
      if(complete.size<arm.plannedReplicates)reasons.push(`${arm.id}: incomplete_primary_metric_evidence`);
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
