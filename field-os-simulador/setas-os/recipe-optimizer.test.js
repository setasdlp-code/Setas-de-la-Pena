'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeRecipe,
  capFreeIngredient,
  solveTargetPct,
  applyOptToRecipe,
  calcTreatment,
  generateOptimizer,
  runAutoOptimizer,
  calcMaxBatchFromStock,
  OPT_PROFILES,
} = require('./recipe-optimizer.js');

// ── Fixtures compartidas ──────────────────────────────────────────
const SPP = {
  p_ostreatus_gris: {
    name: 'Orellana Gris',
    cn_optimal: { min: 25, max: 50, ideal: 35 },
    n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 },
    ph_optimal: { min: 6.0, max: 7.5 },
    eb_baseline: 90,
    eb_optimal: 130,
    supplementation_max: 20,
    spawn_rate: 8,
    moisture: { ideal: 65 }
  },
  shiitake: {
    name: 'Shiitake',
    cn_optimal: { min: 30, max: 45, ideal: 38 },
    n_optimal: { min: 1.0, max: 1.8, ideal: 1.4 },
    ph_optimal: { min: 5.5, max: 6.5 },
    eb_baseline: 70,
    eb_optimal: 110,
    supplementation_max: 20,
    spawn_rate: 10,
    moisture: { ideal: 60 }
  }
};

const INGS = [
  { id: 'paja_trigo', name: 'Paja de trigo', cat: 'paja', cn: 80, n: 0.6, c: 48, moisture: 12, cra: 3, ph: 6.8, dig: 7, role: 'base_carbono', tags: ['Base'], cost: 400, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'aserrin_roble', name: 'Aserrín de roble', cat: 'maderas', cn: 120, n: 0.3, c: 50, moisture: 15, cra: 2, ph: 6.2, dig: 4, role: 'base_carbono', tags: ['Base'], cost: 350, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'salvado_trigo', name: 'Salvado de trigo', cat: 'salvados', cn: 15, n: 2.5, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 8, role: 'suplemento_n', tags: ['Suplemento'], cost: 900, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'harina_pescado', name: 'Harina de pescado', cat: 'harinas', cn: 6, n: 8.0, c: 48, moisture: 8, cra: 2, ph: 6.5, dig: 9, role: 'suplemento_n', tags: ['N-Alto'], cost: 3200, cs: ['p_ostreatus_gris'] },
  { id: 'carbonato_calcio', name: 'Carbonato de calcio', cat: 'adit', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 9.5, dig: 0, role: 'aditivo_ph', tags: ['pH'], cost: 3000, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'yeso', name: 'Yeso agrícola', cat: 'adit', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7.0, dig: 0, role: 'aditivo_estructura', tags: ['Estructura'], cost: 2200, cs: ['p_ostreatus_gris', 'shiitake'] },
  { id: 'cascarilla_arroz', name: 'Cascarilla de arroz', cat: 'aireador', cn: 90, n: 0.4, c: 45, moisture: 10, cra: 1, ph: 6.8, dig: 2, role: 'aireador', tags: ['Aireador'], cost: 250, cs: ['p_ostreatus_gris', 'shiitake'] }
];

test('normalizeRecipe rebalancea a 100% respetando bloqueos', () => {
  const recipe = [{ id: 'paja_trigo', p: 70 }, { id: 'salvado_trigo', p: 10 }];
  const normalized = normalizeRecipe(recipe);
  const total = normalized.reduce((s, r) => s + r.p, 0);
  assert.equal(total, 100);

  // Con item bloqueado
  const recWithLock = [{ id: 'paja_trigo', p: 70 }, { id: 'salvado_trigo', p: 10 }];
  const normLocked = normalizeRecipe(recWithLock, ['salvado_trigo']);
  const salvado = normLocked.find(r => r.id === 'salvado_trigo');
  assert.equal(salvado.p, 10);
  const paja = normLocked.find(r => r.id === 'paja_trigo');
  assert.equal(paja.p, 90);
});

test('capFreeIngredient respeta topes y reparte excedente', () => {
  const recipe = [{ id: 'paja_trigo', p: 50 }, { id: 'salvado_trigo', p: 50 }];
  const capped = capFreeIngredient(recipe, 'salvado_trigo', 20);
  const salvado = capped.find(r => r.id === 'salvado_trigo');
  const paja = capped.find(r => r.id === 'paja_trigo');
  assert.equal(salvado.p, 20);
  assert.equal(paja.p, 80);
});

test('solveTargetPct calcula el % necesario para alcanzar la métrica deseada', () => {
  const recipe = [{ id: 'paja_trigo', p: 100 }];
  // Paja sola tiene C:N 80, queremos C:N ideal 35 agregando harina de pescado (N=8%)
  const res = solveTargetPct(recipe, 'p_ostreatus_gris', INGS, 'harina_pescado', 'cn', 35, [], SPP);
  assert.ok(res);
  assert.ok(res.pct > 1 && res.pct <= 20); // Dentro de tope de suplementación
  assert.ok(Math.abs(res.val - 35) < 3.0);
});

test('applyOptToRecipe soporta operaciones set, add, increase, decrease', () => {
  const rec = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];

  const setRes = applyOptToRecipe(rec, { mode: 'set', id: 'salvado_trigo', value: 15 }, [], INGS);
  assert.equal(setRes.find(r => r.id === 'salvado_trigo').p, 15);
  assert.equal(setRes.find(r => r.id === 'paja_trigo').p, 85);

  // Con 3 items y paja_trigo bloqueada
  const rec3 = [{ id: 'paja_trigo', p: 70 }, { id: 'aserrin_roble', p: 10 }, { id: 'salvado_trigo', p: 20 }];
  const decRes = applyOptToRecipe(rec3, { mode: 'decrease', id: 'salvado_trigo', delta: 5 }, ['paja_trigo'], INGS);
  const decSalvado = decRes.find(r => r.id === 'salvado_trigo');
  const decAserrin = decRes.find(r => r.id === 'aserrin_roble');
  // salvado batió 15/25 de los libres -> en remaining=30 queda 18
  assert.equal(decSalvado.p, 18);
  assert.equal(decAserrin.p, 12);

  // Soporta combos (array de operaciones)
  const comboRes = applyOptToRecipe(rec, [
    { mode: 'set', id: 'salvado_trigo', value: 15 },
    { mode: 'add', id: 'carbonato_calcio', delta: 2 }
  ], [], INGS);
  assert.equal(comboRes.length, 3);
  assert.equal(comboRes.find(r => r.id === 'carbonato_calcio').p, 2);
});

test('calcTreatment determina el tratamiento térmico y costo energético según riesgo', () => {
  // Bajo riesgo -> CWLP
  const lowRiskAn = { suppP: 5, avgN: 1.0, trichoderma: false };
  const trLow = calcTreatment(lowRiskAn, 'p_ostreatus_gris', SPP);
  assert.equal(trLow.col, 'cwlp');

  // Riesgo medio -> pasteurización térmica (suppP > 15)
  const medRiskAn = { suppP: 16, avgN: 1.5, trichoderma: false };
  const trMed = calcTreatment(medRiskAn, 'p_ostreatus_gris', SPP);
  assert.equal(trMed.col, 'thermal');

  // Alto riesgo / Trichoderma / Shiitake -> autoclave
  const highRiskAn = { suppP: 25, avgN: 2.8, trichoderma: true };
  const trHigh = calcTreatment(highRiskAn, 'p_ostreatus_gris', SPP);
  assert.equal(trHigh.col, 'autoclave');

  const shiitakeTr = calcTreatment(lowRiskAn, 'shiitake', SPP);
  assert.equal(shiitakeTr.col, 'autoclave');
});

test('generateOptimizer genera veredictos y predicciones sin mutar estado', () => {
  const an = {
    sp: SPP.p_ostreatus_gris,
    cn: 70, // C:N alto -> debe sugerir N
    avgN: 0.6,
    avgPh: 6.8,
    eb: 95,
    cost: 450,
    tot: 100,
    suppP: 0,
    addP: 0,
    avgDig: 7,
    airP: 15,
    densaP: 0,
    trichoderma: false,
    incompat: []
  };
  const recipe = [{ id: 'paja_trigo', p: 100 }];
  const stockIds = new Set(['paja_trigo', 'harina_pescado', 'salvado_trigo', 'carbonato_calcio']);

  const opt = generateOptimizer(an, 'p_ostreatus_gris', stockIds, recipe, INGS, [], null, true, {}, SPP);

  assert.ok(opt.score > 0);
  assert.ok(opt.items.length > 0);

  const cnHighItem = opt.items.find(i => i.icon === '↓C:N');
  assert.ok(cnHighItem);
  assert.equal(cnHighItem.priority, 'critical');
  assert.ok(cnHighItem.predictedScore != null);
});

test('runAutoOptimizer genera recetas ordenadas por score respetando inventario y perfil', () => {
  const invLotes = [
    { ingredienteId: 'paja_trigo', activo: true, cantidadKgDisponible: 100, precioPorKgCOP: 400 },
    { ingredienteId: 'harina_pescado', activo: true, cantidadKgDisponible: 20, precioPorKgCOP: 3200 },
    { ingredienteId: 'salvado_trigo', activo: true, cantidadKgDisponible: 30, precioPorKgCOP: 900 },
    { ingredienteId: 'carbonato_calcio', activo: true, cantidadKgDisponible: 5, precioPorKgCOP: 3000 }
  ];

  const res = runAutoOptimizer('p_ostreatus_gris', invLotes, 0, INGS, true, 'produccion', {}, SPP);
  assert.equal(res.noStock, false);
  assert.ok(res.results.length > 0);
  assert.ok(res.results[0].score >= res.results[res.results.length - 1].score);

  // Si se exige stock pero el inventario está vacío
  const emptyRes = runAutoOptimizer('p_ostreatus_gris', [], 0, INGS, true, 'produccion', {}, SPP);
  assert.equal(emptyRes.noStock, true);
  assert.equal(emptyRes.results.length, 0);
});

test('calcMaxBatchFromStock calcula la masa máxima producible con inventario', () => {
  const recipe = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];
  const stockMap = { paja_trigo: 100, salvado_trigo: 10 };
  const maxBatch = calcMaxBatchFromStock(recipe, stockMap, 10, 65, INGS);
  assert.ok(maxBatch > 0);
});
