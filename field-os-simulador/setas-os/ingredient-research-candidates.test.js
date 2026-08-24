'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RESEARCH_CANDIDATES, validateResearchCandidates } = require('./ingredient-research-candidates.js');

const REQUIRED_SOURCE_PRIORITIES = new Set([1,2,3,4,5,6,7,8,9,10,11,12,15,19,25]);

test('registro de investigación contiene exactamente 25 candidatos válidos', () => {
  assert.deepEqual(validateResearchCandidates(), []);
});

test('ningún candidato suplanta valores C:N/N/C con estimaciones sin verificar', () => {
  const offenders = RESEARCH_CANDIDATES.filter(item => {
    const c = item.composition || {};
    return c.cn !== null || c.n_pct !== null || c.c_pct !== null;
  });
  assert.deepEqual(
    offenders.map(x => x.id),
    [],
    'los candidatos deben conservar cn/n/c como null hasta análisis o fuente específica defendible'
  );
});

test('costos de candidatos están explícitamente marcados como presupuesto piloto', () => {
  const offenders = RESEARCH_CANDIDATES.filter(item => !item.costPlanningCopKg?.basis?.startsWith('pilot_budget'));
  assert.deepEqual(offenders.map(x => x.id), []);
});

test('candidatos prioritarios con evidencia localizada conservan fuentes trazables', () => {
  const missing = RESEARCH_CANDIDATES.filter(item => REQUIRED_SOURCE_PRIORITIES.has(item.priority) && (!item.sources || item.sources.length === 0));
  assert.deepEqual(missing.map(x => x.id), []);
});

test('ids de candidatos no colisionan entre sí', () => {
  assert.equal(new Set(RESEARCH_CANDIDATES.map(x => x.id)).size, RESEARCH_CANDIDATES.length);
});

test('material húmedo no usa costo como si fuera materia seca', () => {
  const offenders = RESEARCH_CANDIDATES.filter(item => item.moistureBasis === 'as_received' && item.costPlanningCopKg?.basis === 'pilot_budget_not_market_quote');
  assert.deepEqual(
    offenders.map(x => x.id),
    [],
    'materiales húmedos deben indicar explícitamente que el costo corresponde a material fresco/as received'
  );
});
