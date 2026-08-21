'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const scenarios = require('./perito-scenarios.js');

const TARGET = 'test_species';
const ingredients = [
  { id:'base_a', name:'Base A', role:'base_carbono', cn:80, c:40, n:0.5, moisture:10, cost:900, cs:[TARGET] },
  { id:'base_b', name:'Base B', role:'base_carbono', cn:75, c:39, n:0.52, moisture:10, cost:950, cs:[TARGET] },
  { id:'base_c', name:'Base C', role:'base_carbono', cn:70, c:38.5, n:0.55, moisture:10, cost:1000, cs:[TARGET] },
  { id:'base_d', name:'Base D', role:'base_carbono', cn:65, c:37.7, n:0.58, moisture:10, cost:1050, cs:[TARGET] },
  { id:'supp_a', name:'Supp A', role:'suplemento_n', cn:10, c:40, n:4.0, moisture:10, cost:1200, cs:[TARGET] },
  { id:'supp_b', name:'Supp B', role:'suplemento_n', cn:12, c:39.6, n:3.3, moisture:10, cost:1300, cs:[TARGET] },
  { id:'supp_c', name:'Supp C', role:'suplemento_medio', cn:15, c:39, n:2.6, moisture:10, cost:1400, cs:[TARGET] },
  { id:'carbonato_calcio', name:'Carbonato', role:'aditivo_ph', cn:0, c:0, n:0, moisture:0, cost:300, cs:[TARGET] },
  { id:'yeso', name:'Yeso', role:'aditivo_estructura', cn:0, c:0, n:0, moisture:0, cost:350, cs:[TARGET] },
];

const spp = {
  [TARGET]: {
    cn_optimal: { ideal: 40 },
    supplementation_max: 30,
  },
};

function analyze(recipe) {
  return {
    recipe,
    cost: recipe.reduce((sum, r) => {
      const g = ingredients.find(i => i.id === r.id);
      return sum + (g?.cost || 0) * r.p / 100;
    }, 0),
    cafeP: 0,
    dynSpawn: 15,
  };
}

function score(analysis) {
  // Deliberately make recipe quality almost flat so the ranking-diversity rule,
  // not a synthetic scoring preference, determines which structural families
  // survive into the top 12.
  return {
    score: 80,
    dimensions: {
      safety: { score: 85 },
      agronomy: { score: 80 },
      economy: { score: 75 },
    },
    breakdown: { risk: 85 },
    uncertainty: {
      eb: { confidence: 'high' },
      risk: { confidence: 'high' },
    },
    provenance: {},
    analysis,
  };
}

function baseSignature(candidate) {
  const roleById = new Map(ingredients.map(g => [g.id, g.role]));
  return candidate.recipe
    .filter(r => roleById.get(r.id) === 'base_carbono')
    .map(r => r.id)
    .sort()
    .join('+');
}

test('ranked top-12 preserves structural diversity across base signatures', () => {
  const out = scenarios.searchScenarios({
    recipe: [],
    context: { sKey: TARGET, spp },
    searchMode: 'global',
    targetKey: TARGET,
    spp,
    ingredients,
    analyze,
    score,
    profileKey: 'premium',
    structuralSeedCap: 300,
  });

  assert.ok(out.ranked.length >= 8, `expected a meaningful ranked set, got ${out.ranked.length}`);

  const signatures = out.ranked.map(baseSignature).filter(Boolean);
  const counts = new Map();
  for (const sig of signatures) counts.set(sig, (counts.get(sig) || 0) + 1);

  assert.ok(counts.size >= 4, `expected >=4 structural base signatures, got ${[...counts.keys()].join(', ')}`);
  for (const [sig, count] of counts) {
    assert.ok(count <= 3, `signature ${sig} appears ${count} times in ranked top-12`);
  }

  const canonical = out.ranked.map(c => scenarios.canonicalRecipeKey(c.recipe));
  assert.equal(new Set(canonical).size, canonical.length, 'ranked results must not contain exact recipe duplicates');
});
