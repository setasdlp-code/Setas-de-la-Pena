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
  assert.ok(Array.isArray(sim.diff.deltaEbRange));
  assert.equal(sim.diff.confidence, 'medium');
  assert.equal(sim.diff.deltaCost, 120);
  assert.equal(sim.diff.newCn, 35);
  assert.ok(sim.isViable);
  assert.equal(recipe[0].p, 100, 'La receta original no debe ser mutada');
});

test('calcRestrictiveFactor calcula oportunidad contrafactual y evalúa riesgo según tratamiento', () => {
  const sp = {
    name: 'Orellana Gris',
    supplementation_max: 20,
    cn_optimal: { min: 30, max: 45, ideal: 38 },
    n_optimal: { min: 1.0, max: 2.0 },
  };

  // Suplementación excesiva con pasteurización (tratamiento no autoclave) => Crítico
  const pasteur = workbench.calcRestrictiveFactor(
    { tot: 100, cn: 35, avgN: 1.5, suppP: 26 },
    sp,
    { treatment: { col: 'thermal', name: 'Pasteurización' } }
  );
  assert.equal(pasteur.factor, 'excess_supplementation');
  assert.equal(pasteur.severity, 'critical');
  assert.ok(pasteur.counterfactualOpportunity, 'Debe incluir oportunidad contrafactual');
  assert.ok(pasteur.counterfactualOpportunity.potentialEbGain[0] > 0);

  // Suplementación excesiva con autoclave => Warning (tolerancia térmica superior)
  const autoclave = workbench.calcRestrictiveFactor(
    { tot: 100, cn: 35, avgN: 1.5, suppP: 22 },
    sp,
    { treatment: { col: 'autoclave', name: 'Autoclave' } }
  );
  assert.equal(autoclave.factor, 'excess_supplementation');
  assert.equal(autoclave.severity, 'warning');

  // C:N alto con oportunidad contrafactual cuantificada
  const highCn = workbench.calcRestrictiveFactor(
    { tot: 100, cn: 65, avgN: 0.9, suppP: 5 },
    sp
  );
  assert.equal(highCn.factor, 'high_cn');
  assert.equal(highCn.counterfactualOpportunity.metric, 'cn');
  assert.deepEqual(highCn.counterfactualOpportunity.targetRange, [30, 45]);
  assert.ok(highCn.counterfactualOpportunity.potentialEbGain[1] >= 20);
});

test('TENJO_PHYSICAL_CONTEXT contiene constantes físicas invariantes verificadas para 2600 msnm', () => {
  const ctx = workbench.TENJO_PHYSICAL_CONTEXT;
  assert.equal(ctx.altitudeM, 2600);
  assert.equal(ctx.atmosphericPressureKPa, 74.5);
  assert.equal(ctx.waterBoilingPointC, 91.5);
  assert.equal(ctx.requiredSterilizationTempC, 121.1);
  assert.equal(ctx.requiredGaugePressurePsi, 19.03);
  assert.equal(ctx.coldSpotF0TargetMin, 12.0);
  assert.throws(() => { ctx.altitudeM = 0; }, TypeError);
});

test('analyzeMorphTrajectory evalúa factibilidad a lo largo de alpha [0, 1] y detecta intervalos no permitidos', () => {
  const recipeA = [{ id: 'paja', p: 90 }, { id: 'salvado', p: 10 }];
  const recipeB = [{ id: 'paja', p: 50 }, { id: 'salvado', p: 50 }]; // 50% salvado excede límite (inviable)

  const species = {
    supplementation_max: 20,
    cn_optimal: { min: 30, max: 45 },
    n_optimal: { min: 1.0, max: 2.0 },
  };

  const analyzeFn = (rec) => {
    const salvado = rec.find(r => r.id === 'salvado')?.p || 0;
    return {
      tot: 100,
      suppP: salvado,
      cn: salvado > 30 ? 20 : 35,
      avgN: salvado > 30 ? 2.5 : 1.4,
      trichoderma: salvado > 35,
    };
  };

  const res = workbench.analyzeMorphTrajectory({
    recipeA,
    recipeB,
    lockedIds: [],
    species,
    analyzeFn,
    steps: 10,
    requestedAlpha: 0.8, // En alpha=0.8, salvado = 0.2*10 + 0.8*50 = 42% > 20% (infeasible)
  });

  assert.ok(res.trajectory.length === 11);
  assert.equal(res.trajectory[0].isFeasible, true, 'alpha=0 debe ser factible');
  assert.equal(res.trajectory[10].isFeasible, false, 'alpha=1 debe ser inviable');
  assert.equal(res.isFeasibleAtRequestedAlpha, false, 'alpha=0.8 debe ser inviable');
  assert.ok(res.requestedViolations.length > 0);
  assert.ok(res.feasibleInterval !== null);
  assert.equal(res.feasibleInterval[0], 0);
  assert.ok(res.feasibleInterval[1] <= 0.3); // Solo hasta ~20% de salvado
});
