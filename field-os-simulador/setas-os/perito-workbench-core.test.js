'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const workbench = require('./perito-workbench-core.js');

test('calcLiebigBottleneck identifica cuellos de botella en orden de prioridad biológica', () => {
  const sp = {
    cn_optimal: { min: 30, max: 45 },
    n_optimal: { min: 1.0, max: 1.8 },
    ph_optimal: { min: 6.0, max: 7.5 },
  };

  // 1. Trichoderma prioritario
  const bTrich = workbench.calcLiebigBottleneck({ trichoderma: true, tot: 100, cn: 35, avgN: 1.4 }, sp);
  assert.equal(bTrich.factor, 'trichoderma_risk');
  assert.equal(bTrich.severity, 'critical');

  // 2. Desbalance de masa
  const bMass = workbench.calcLiebigBottleneck({ tot: 80, cn: 35, avgN: 1.4 }, sp);
  assert.equal(bMass.factor, 'mass_balance');
  assert.equal(bMass.severity, 'critical');

  // 3. Exceso de Nitrógeno
  const bHighN = workbench.calcLiebigBottleneck({ tot: 100, avgN: 2.5, cn: 35 }, sp);
  assert.equal(bHighN.factor, 'excess_nitrogen');
  assert.equal(bHighN.severity, 'critical');

  // 4. C:N muy bajo
  const bLowCn = workbench.calcLiebigBottleneck({ tot: 100, avgN: 1.5, cn: 20 }, sp);
  assert.equal(bLowCn.factor, 'low_cn');
  assert.equal(bLowCn.severity, 'critical');

  // 5. C:N deficiente (muy alto)
  const bHighCn = workbench.calcLiebigBottleneck({ tot: 100, avgN: 0.9, cn: 65 }, sp);
  assert.equal(bHighCn.factor, 'high_cn');
  assert.equal(bHighCn.severity, 'warning');

  // 6. pH ácido
  const bPhAcid = workbench.calcLiebigBottleneck({ tot: 100, avgN: 1.4, cn: 35, avgPh: 5.2 }, sp);
  assert.equal(bPhAcid.factor, 'acidic_ph');
  assert.equal(bPhAcid.severity, 'warning');

  // 7. Óptimo
  const bOpt = workbench.calcLiebigBottleneck({ tot: 100, avgN: 1.4, cn: 35, avgPh: 6.8, avgDig: 7.5 }, sp);
  assert.equal(bOpt.factor, 'optimal');
  assert.equal(bOpt.severity, 'favorable');
});

test('morphRecipes interpola suavemente dos recetas respetando ingredientes bloqueados', () => {
  const recipeA = [
    { id: 'paja_trigo', p: 80 },
    { id: 'salvado_trigo', p: 20 },
  ];
  const recipeB = [
    { id: 'paja_trigo', p: 60 },
    { id: 'salvado_trigo', p: 30 },
    { id: 'yeso', p: 10 },
  ];

  // alpha = 0 (100% A)
  const atZero = workbench.morphRecipes(recipeA, recipeB, 0.0);
  assert.equal(atZero.find(r => r.id === 'paja_trigo')?.p, 80);
  assert.equal(atZero.find(r => r.id === 'salvado_trigo')?.p, 20);

  // alpha = 1 (100% B)
  const atOne = workbench.morphRecipes(recipeA, recipeB, 1.0);
  assert.equal(atOne.find(r => r.id === 'paja_trigo')?.p, 60);
  assert.equal(atOne.find(r => r.id === 'salvado_trigo')?.p, 30);
  assert.equal(atOne.find(r => r.id === 'yeso')?.p, 10);

  // alpha = 0.5 con salvado_trigo bloqueado en 20%
  const blended = workbench.morphRecipes(recipeA, recipeB, 0.5, ['salvado_trigo']);
  const bran = blended.find(r => r.id === 'salvado_trigo');
  assert.equal(bran.p, 20, 'El ingrediente bloqueado debe conservar el 20% exacto de la receta A');
  const tot = blended.reduce((s, r) => s + r.p, 0);
  assert.ok(Math.abs(tot - 100) <= 0.5, `La suma de porcentajes debe ser 100% (fue ${tot}%)`);
});

test('filterParetoFrontier descarta candidatos dominados y conserva la frontera eficiente', () => {
  const candidates = [
    { id: 'c1_mejor_costo', score: 85, eb: 110, cost: 600 },
    { id: 'c2_mejor_rendimiento', score: 92, eb: 140, cost: 950 },
    { id: 'c3_dominado', score: 80, eb: 100, cost: 1000 }, // Peor en todo frente a c1 y c2
  ];

  const pareto = workbench.filterParetoFrontier(candidates);
  assert.equal(pareto.length, 2);
  assert.ok(pareto.some(c => c.id === 'c1_mejor_costo'));
  assert.ok(pareto.some(c => c.id === 'c2_mejor_rendimiento'));
  assert.ok(!pareto.some(c => c.id === 'c3_dominado'));
});

test('simulateSuggestionDelta proyecta deltas precisos de score, eb y costo sin mutar receta', () => {
  const recipe = [{ id: 'paja_trigo', p: 100 }];
  const ingredients = [
    { id: 'paja_trigo', name: 'Paja de Trigo', cost: 400 },
    { id: 'salvado_trigo', name: 'Salvado de Trigo', cost: 1200 },
  ];

  const applyOptToRecipe = (rec, apply) => {
    return [{ id: 'paja_trigo', p: 85 }, { id: 'salvado_trigo', p: 15 }];
  };

  const analyze = (rec) => ({
    tot: 100,
    cn: rec.some(r => r.id === 'salvado_trigo') ? 35 : 75,
    avgN: rec.some(r => r.id === 'salvado_trigo') ? 1.4 : 0.6,
    cost: rec.some(r => r.id === 'salvado_trigo') ? 520 : 400,
    eb: rec.some(r => r.id === 'salvado_trigo') ? 120 : 80,
    trichoderma: false,
  });

  const score = (an) => ({
    score: an.cn === 35 ? 90 : 60,
    status: an.cn === 35 ? 'good' : 'needs_work',
  });

  const baseAn = analyze(recipe);
  const baseScore = score(baseAn);

  const sim = workbench.simulateSuggestionDelta({
    recipe,
    apply: { id: 'salvado_trigo', delta: 15 },
    lockedIds: [],
    ingredients,
    applyOptToRecipe,
    analyze,
    score,
    baseAn,
    baseScore,
  });

  assert.ok(sim, 'Simulación debe retornar resultado');
  assert.equal(sim.diff.deltaScore, 30);
  assert.equal(sim.diff.deltaEb, 40);
  assert.equal(sim.diff.deltaCost, 120);
  assert.equal(sim.diff.newCn, 35);
  assert.ok(sim.isViable);
  assert.equal(recipe[0].p, 100, 'La receta original no debe ser mutada');
});
