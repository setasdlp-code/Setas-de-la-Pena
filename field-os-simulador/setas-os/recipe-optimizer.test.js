'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  normalizeRecipe,
  capFreeIngredient,
  solveTargetPct,
  applyOptToRecipe,
  calcTreatment,
  generateOptimizer,
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

// logic-lens: 'add' de un ingrediente nuevo cuando hay bloqueados podía sumar
// más de 100% — el scale se topaba en 0 pero nada capaba el % del ingrediente
// nuevo al espacio libre real, a diferencia de 'increase' (que sí normaliza).
test('applyOptToRecipe: add nunca suma más de 100% aunque delta exceda el espacio libre', () => {
  const rec = [{ id: 'paja_trigo', p: 80 }, { id: 'aserrin_roble', p: 20 }];
  // Solo 20% libre (paja_trigo bloqueada al 80%); delta=30 excede ese espacio.
  const res = applyOptToRecipe(rec, { mode: 'add', id: 'salvado_trigo', delta: 30 }, ['paja_trigo'], INGS);
  const total = res.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  assert.ok(Math.abs(total - 100) < 0.15, `la receta debe sumar 100%, sumó ${total}`);
  assert.equal(res.find(r => r.id === 'paja_trigo').p, 80, 'lo bloqueado no debe cambiar');
  // El nuevo ingrediente se queda con TODO el espacio libre (20%), no con el
  // delta pedido (30%) que no cabía.
  assert.equal(res.find(r => r.id === 'salvado_trigo').p, 20);
  assert.equal(res.find(r => r.id === 'aserrin_roble').p, 0);
});

test('applyOptToRecipe: add sin bloqueos sigue dando exactamente el delta pedido (comportamiento existente intacto)', () => {
  const rec = [{ id: 'paja_trigo', p: 80 }, { id: 'aserrin_roble', p: 20 }];
  const res = applyOptToRecipe(rec, { mode: 'add', id: 'salvado_trigo', delta: 15 }, [], INGS);
  assert.equal(res.find(r => r.id === 'salvado_trigo').p, 15);
  const total = res.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
  assert.ok(Math.abs(total - 100) < 0.15);
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
  assert.deepEqual(cnHighItem.evidence, {
    type: 'heuristic-model',
    confidence: 'low',
    note: 'Regla de composición sin medición específica del lote; confirmar con proceso y resultados trazables.',
  });
});

test('generateOptimizer advierte el mínimo funcional de calcio solo en tratamientos no estériles', () => {
  const an = {
    sp: SPP.p_ostreatus_gris, cn: 35, avgN: 1.2, avgPh: 6.8, eb: 100, cost: 450, tot: 100,
    suppP: 5, addP: 2, avgDig: 7, avgCra: 3, airP: 15, densaP: 0, trichoderma: false, incompat: [],
  };
  const noCalcium = [{ id: 'paja_trigo', p: 93 }, { id: 'salvado_trigo', p: 5 }, { id: 'sulfato_magnesio', p: 2 }];
  const withCalcium = [{ id: 'paja_trigo', p: 92 }, { id: 'salvado_trigo', p: 5 }, { id: 'yeso', p: 1 }, { id: 'sulfato_magnesio', p: 2 }];
  const stockIds = new Set(INGS.map(g => g.id));

  const warning = generateOptimizer(an, 'p_ostreatus_gris', stockIds, noCalcium, INGS, [], null, true, {}, SPP)
    .items.find(i => i.label === 'Calcio mineral bajo el mínimo funcional');
  const sufficient = generateOptimizer(an, 'p_ostreatus_gris', stockIds, withCalcium, INGS, [], null, true, {}, SPP)
    .items.find(i => i.label === 'Calcio mineral bajo el mínimo funcional');

  assert.equal(warning?.priority, 'warning');
  assert.equal(warning?.evidence?.type, 'literature');
  assert.equal(sufficient, undefined);
});

// logic-lens: usageCounts existe para no recomendar siempre el mismo
// ingrediente cuando hay alternativas igual de viables — verificado aquí
// como mecanismo puro, aislado del hecho de que ningún call site en
// simulador-app.jsx lo estaba alimentando con datos reales.
test('generateOptimizer respeta usageCounts: deja de sugerir siempre el mismo ingrediente entre alternativas empatadas', () => {
  const an = {
    sp: SPP.p_ostreatus_gris,
    // cn en el ideal (35) para que SOLO dispare nLow — si cnHigh/cnLow también
    // disparan, su propio bestStock() reclama uno de los 2 candidatos primero
    // y el dedup entre flags (recommendedIds) enmascara el efecto de usageCounts
    // que esta prueba quiere aislar.
    cn: 35, avgN: 0.5, avgPh: 6.8, eb: 90, cost: 450, tot: 100,
    suppP: 0, addP: 0, avgDig: 7, airP: 15, densaP: 0, trichoderma: false, incompat: []
  };
  const recipe = [{ id: 'paja_trigo', p: 100 }];
  const stockIds = new Set(['paja_trigo', 'salvado_trigo', 'harina_pescado', 'carbonato_calcio']);

  const sinUso = generateOptimizer(an, 'p_ostreatus_gris', stockIds, recipe, INGS, [], null, true, {}, SPP, {});
  const nLowItem = sinUso.items.find(i => i.icon === '↑N');
  assert.ok(nLowItem?.apply?.id, 'fixture inválido: se esperaba una sugerencia de N con ingrediente');
  // Sin usageCounts, gana el más barato (salvado_trigo, $900 vs harina_pescado $3200).
  assert.equal(nLowItem.apply.id, 'salvado_trigo');

  const conUsoAlto = { salvado_trigo: 5 };
  const conUso = generateOptimizer(an, 'p_ostreatus_gris', stockIds, recipe, INGS, [], null, true, {}, SPP, conUsoAlto);
  const nLowItem2 = conUso.items.find(i => i.icon === '↑N');
  // Con salvado_trigo ya muy recomendado, el candidato menos usado (harina_pescado) gana.
  assert.equal(nLowItem2.apply.id, 'harina_pescado', 'usageCounts debe desplazar al ingrediente más recomendado');
});

// logic-lens: generateOptimizer.usageCounts (verificado arriba como mecanismo
// puro que sí funciona) nunca era alimentado por ningún call site real en
// simulador-app.jsx — siempre llegaba {} por default, dejando el desempate
// por "menos recomendado históricamente" permanentemente inerte.
test('simulador-app.jsx rastrea uso de ingredientes y lo pasa a generateOptimizer', () => {
  const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  assert.match(jsx, /usageCounts/, 'no se encontró ningún estado/uso de usageCounts en el jsx');
  assert.match(jsx, /setUsageCounts/, 'no se encontró un setter de usageCounts — no se está registrando uso real');
  assert.match(jsx, /generateOptimizer\([^)]*usageCounts/, 'generateOptimizer se sigue llamando sin pasar usageCounts');
});

test('calcMaxBatchFromStock calcula la masa máxima producible con inventario', () => {
  const recipe = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];
  const stockMap = { paja_trigo: 100, salvado_trigo: 10 };
  const maxBatch = calcMaxBatchFromStock(recipe, stockMap, 10, 65, INGS);
  assert.ok(maxBatch > 0);
});
