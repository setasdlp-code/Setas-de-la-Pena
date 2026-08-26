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

test('runAutoOptimizer diversifica el top-30 en vez de dejar que 1-2 pares de bases lo acaparen', () => {
  // Catálogo con 6 bases y 6 suplementos intercambiables entre sí: sin diversidad
  // estructural, el top-30 por score puro queda dominado por los 1-2 pares de bases
  // que casualmente puntúan mejor, repetidos con variantes triviales de suplemento.
  const diverseINGS = [
    { id: 'paja_arroz', name: 'Paja de arroz', role: 'base_carbono', cn: 65, n: .7, c: 46, moisture: 12, cra: 2.5, ph: 6.8, dig: 4, tags: [], cs: ['p_ostreatus_gris'], cost: 1800 },
    { id: 'aserrin_eucalipto', name: 'Aserrín de eucalipto', role: 'base_carbono', cn: 350, n: .15, c: 50, moisture: 12, cra: 3, ph: 5.0, dig: 3, tags: [], cs: ['p_ostreatus_gris'], cost: 2000 },
    { id: 'kikuyo', name: 'Kikuyo seco', role: 'base_carbono', cn: 25, n: 1.8, c: 45, moisture: 12, cra: 4, ph: 6.5, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 1400 },
    { id: 'retamo_espinoso', name: 'Retamo espinoso', role: 'base_carbono', cn: 32, n: 1.5, c: 47, moisture: 11, cra: 3, ph: 6.0, dig: 5, tags: [], cs: ['p_ostreatus_gris'], cost: 400 },
    { id: 'heno_pangola', name: 'Heno de pangola', role: 'base_carbono', cn: 60, n: .8, c: 48, moisture: 12, cra: 4, ph: 6.5, dig: 7, tags: [], cs: ['p_ostreatus_gris'], cost: 6500 },
    { id: 'fibra_palma', name: 'Fibra de palma de aceite', role: 'base_carbono', cn: 70, n: .7, c: 49, moisture: 18, cra: 3, ph: 5.8, dig: 4, tags: [], cs: ['p_ostreatus_gris'], cost: 1800 },
    { id: 'salvado_trigo', name: 'Salvado de trigo', role: 'suplemento_n', cn: 16, n: 2.8, c: 45, moisture: 12, cra: 3, ph: 6.2, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 5200 },
    { id: 'afrecho_cerveceria', name: 'Afrecho de cervecería', role: 'suplemento_n', cn: 11, n: 4.2, c: 46, moisture: 75, cra: 4.5, ph: 5.5, dig: 7, tags: [], cs: ['p_ostreatus_gris'], cost: 2500 },
    { id: 'gallinaza', name: 'Gallinaza compostada', role: 'suplemento_n', cn: 10, n: 3.5, c: 35, moisture: 20, cra: 2.5, ph: 7.5, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 2500 },
    { id: 'lombricompost', name: 'Lombricompost', role: 'suplemento_n', cn: 12, n: 3.0, c: 36, moisture: 35, cra: 3.5, ph: 7.0, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 5000 },
    { id: 'compost_maduro', name: 'Compost maduro', role: 'suplemento_n', cn: 15, n: 2.8, c: 42, moisture: 35, cra: 3.5, ph: 7.0, dig: 8, tags: [], cs: ['p_ostreatus_gris'], cost: 2500 },
    { id: 'harina_maiz', name: 'Harina de Maíz', role: 'suplemento_n', cn: 8, n: 3.2, c: 36, moisture: 12, cra: 3.0, ph: 6.8, dig: 7, tags: [], cs: ['p_ostreatus_gris'], cost: 1000 },
    { id: 'carbonato_calcio', name: 'Carbonato de calcio', role: 'aditivo_ph', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 9.5, dig: 0, tags: [], cs: ['p_ostreatus_gris'], cost: 3000 },
    { id: 'yeso', name: 'Yeso agrícola', role: 'aditivo_estructura', cn: 0, n: 0, c: 0, moisture: 0, cra: 0, ph: 7.0, dig: 0, tags: [], cs: ['p_ostreatus_gris'], cost: 2200 },
  ];
  const res = runAutoOptimizer('p_ostreatus_gris', [], 0, diverseINGS, false, 'produccion', {}, SPP);
  assert.ok(res.diag.resultsRaw > 30, 'el fixture debe generar más candidatos crudos que el límite, si no la prueba no ejercita el descarte');

  const roleById = new Map(diverseINGS.map(g => [g.id, g.role]));
  const groupCounts = new Map();
  res.results.forEach(r => {
    const k = r.recipe.filter(i => roleById.get(i.id) === 'base_carbono').map(i => i.id).sort().join('+');
    groupCounts.set(k, (groupCounts.get(k) || 0) + 1);
  });
  assert.ok(groupCounts.size >= 5, `esperaba al menos 5 combinaciones de bases distintas, hubo ${groupCounts.size}`);
  for (const [key, count] of groupCounts) assert.ok(count <= 3, `el grupo "${key}" aporta ${count} resultados, más de los 3 permitidos por combinación de bases`);
  assert.ok(res.results.every((r, i) => i === 0 || res.results[i - 1].score >= r.score), 'el resultado sigue ordenado de mayor a menor score');
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
