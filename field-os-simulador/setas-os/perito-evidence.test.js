'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEvidence, annotateIngredients, summarizeEvidence } = require('./perito-evidence.js');

test('datos heredados sin fuente quedan explícitamente low/legacy', () => {
  const e = normalizeEvidence();
  assert.equal(e.sourceType, 'legacy_heuristic');
  assert.equal(e.confidence, 'low');
  assert.equal(e.sourceId, null);
});

test('ingrediente medido puede conservar procedencia de laboratorio', () => {
  const [g] = annotateIngredients([{ id: 'x', labMeasured: true, evidence: { sourceType: 'lab_measurement', confidence: 'high', sourceId: 'LAB-001' } }]);
  assert.equal(g.evidence.sourceType, 'lab_measurement');
  assert.equal(g.evidence.confidence, 'high');
  assert.equal(g.evidence.sourceId, 'LAB-001');
});

test('resumen distingue evidencia verificada de heurística heredada', () => {
  const s = summarizeEvidence({
    speciesEvidence: { sourceType: 'literature', confidence: 'high', sourceId: 'doi:test' },
    ingredientEvidence: [{ sourceType: 'legacy_heuristic', confidence: 'low', sourceId: null }],
  });
  assert.equal(s.verified, 1);
  assert.equal(s.total, 2);
});
