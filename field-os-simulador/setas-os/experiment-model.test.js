'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeExperiment, validateExperiment, classifyExperiment, promotionGate } = require('./experiment-model.js');

const base = (overrides = {}) => ({
  id: 'EXP_1', title: 'Cascarilla avena 10%', hypothesis: 'La inclusión mejora EB sin elevar contaminación.',
  speciesId: 'p_ostreatus_gris', primaryMetric: 'be_pct', status: 'draft',
  control: { id: 'CTRL', recipeVersionId: 'R_CTRL' },
  treatments: [{ id: 'T10', recipeVersionId: 'R_T10', change: '10% cascarilla avena' }],
  ...overrides,
});

const evidence = (batchId, recipeId = 'R') => ({
  schema: 'setas.cycle-evidence.v1', batchId,
  metrics: { be_pct: 85 }, recipeSnapshot: { versionId: recipeId },
  ingredientLots: [{ inventoryLotId: 'INV_1' }],
});

test('ensayo de una réplica sigue siendo válido pero se clasifica exploratory', () => {
  const exp = normalizeExperiment(base());
  assert.deepEqual(validateExperiment(exp), []);
  assert.equal(classifyExperiment(exp), 'exploratory');
});

test('tres réplicas por brazo + randomización habilitan clase comparative', () => {
  const exp = normalizeExperiment(base({ replicatesPerArm: 3, randomization: true }));
  assert.equal(classifyExperiment(exp), 'comparative');
  assert.deepEqual(validateExperiment(exp), []);
});

test('promotionGate bloquea evidencia incompleta y solo habilita experimento completo y trazable', () => {
  const exp = normalizeExperiment(base({
    status: 'complete', completedAt: '2026-09-01', replicatesPerArm: 3, randomization: true,
    control: { id: 'CTRL', recipeVersionId: 'R_CTRL', batchIds: ['C1', 'C2', 'C3'] },
    treatments: [{ id: 'T10', recipeVersionId: 'R_T10', change: '10% cascarilla avena', batchIds: ['T1', 'T2', 'T3'] }],
  }));
  const blocked = promotionGate(exp, [evidence('C1', 'R_CTRL'), evidence('T1', 'R_T10')]);
  assert.equal(blocked.eligible, false);
  assert.equal(blocked.peritoUsage, 'context_only');
  const complete = [
    evidence('C1', 'R_CTRL'), evidence('C2', 'R_CTRL'), evidence('C3', 'R_CTRL'),
    evidence('T1', 'R_T10'), evidence('T2', 'R_T10'), evidence('T3', 'R_T10'),
  ];
  const allowed = promotionGate(exp, complete);
  assert.equal(allowed.eligible, true);
  assert.equal(allowed.evidenceClass, 'comparative');
  assert.equal(allowed.peritoUsage, 'comparative_evidence_candidate');
});
