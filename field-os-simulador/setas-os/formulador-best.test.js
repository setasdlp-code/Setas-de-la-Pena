'use strict';
// Vista "Mejor con Bodega": elección de Más producción y Más barata por kg de
// seta, cobertura de Bodega y sugerencias "Para mejorar, conseguir…".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const B = require('./formulador-best.js');

const ann = (key, eb, costPerKgSeta, extra = {}) => ({
  key, recipe: [{ id: key, p: 100 }], eb, band: { low: eb - 20, high: eb + 20, confidence: 'low' },
  costPerDryKg: costPerKgSeta == null ? null : costPerKgSeta * eb / 100, costPerKgSeta,
  unpricedIds: costPerKgSeta == null ? [key] : [], costProvenance: 'catalog',
  requiresAutoclave: false, atModelCap: false, safe: true, ...extra,
});

test('isEbTie: empate solo bajo 1 pt', () => {
  assert.equal(B.EB_TIE_PTS, 1);
  assert.equal(B.isEbTie(120, 119.2), true);
  assert.equal(B.isEbTie(120, 119), false);
});

test('selectPicks ignora candidatas no seguras', () => {
  const r = B.selectPicks([ann('a', 130, 100, { safe: false }), ann('b', 110, 200)]);
  assert.equal(r.produccion.key, 'b');
  assert.equal(r.safeCount, 1);
});

test('selectPicks: empate casi exacto lo gana la más barata', () => {
  const r = B.selectPicks([ann('cara', 120, 900), ann('barata', 119.5, 400), ann('lejos', 100, 100)]);
  assert.equal(r.produccion.key, 'barata');
  assert.equal(r.barata.key, 'lejos');
  assert.equal(r.same, false);
});

test('selectPicks: 2 pts de diferencia no es empate', () => {
  const r = B.selectPicks([ann('alta', 120, 900), ann('baja', 118, 400)]);
  assert.equal(r.produccion.key, 'alta');
  assert.equal(r.barata.key, 'baja');
});

test('selectPicks: todo sin precio deja barata en null', () => {
  const r = B.selectPicks([ann('a', 120, null), ann('b', 110, null)]);
  assert.equal(r.barata, null);
  assert.equal(r.produccion.key, 'a');
});

test('selectPicks: sin candidatas', () => {
  assert.deepStrictEqual(B.selectPicks([]), { produccion: null, barata: null, same: false, safeCount: 0 });
});

test('selectPicks: una receta gana ambas', () => {
  const r = B.selectPicks([ann('a', 120, 100), ann('b', 100, 300)]);
  assert.equal(r.same, true);
});

const INGS = [
  { id: 'aserrin_eucalipto', cost: 200, moisture: 30, role: 'base_carbono' },
  { id: 'salvado_trigo', cost: 1200, moisture: 12, role: 'suplemento_n' },
  { id: 'regalo', cost: 0, moisture: 10, role: 'aireador' },
];
const cand = (recipe, eb, { safety = 80, allowed = true } = {}) => ({
  id: 'x', recipe,
  evaluation: {
    allowed, dimensions: { safety: { score: safety } },
    analysis: { eb, sp: {} }, uncertainty: { eb: { low: eb - 26, high: eb + 26, confidence: 'low' } },
  },
});
const opts = (col = 'thermal') => ({
  ingredients: INGS, invLotes: [], ebOptimal: 130, sKey: 'p_ostreatus_gris', spp: {},
  calcTreatment: () => ({ col }),
});

test('annotateCandidate: costo, banda, seguridad', () => {
  const a = B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 80 }, { id: 'salvado_trigo', p: 20 }], 100), opts());
  assert.equal(a.eb, 100);
  assert.deepStrictEqual(a.band, { low: 74, high: 126, confidence: 'low' });
  assert.ok(a.costPerDryKg > 0);
  assert.equal(a.costPerKgSeta, a.costPerDryKg);
  assert.equal(a.safe, true);
  assert.equal(a.requiresAutoclave, false);
  assert.equal(a.atModelCap, false);
  assert.equal(B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 100 }], 100, { safety: 44 }), opts()).safe, false);
  assert.equal(B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 100 }], 100, { allowed: false }), opts()).safe, false);
});

test('annotateCandidate: autoclave y tope del modelo', () => {
  const a = B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 100 }], 129.97), opts('autoclave'));
  assert.equal(a.requiresAutoclave, true);
  assert.equal(a.atModelCap, true);
});

test('annotateCandidate: insumo sin precio no es gratis', () => {
  const a = B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 90 }, { id: 'regalo', p: 10 }], 100), opts());
  assert.equal(a.costPerKgSeta, null);
  assert.deepStrictEqual(a.unpricedIds, ['regalo']);
});

test('reasonLine: textos numéricos sin tuteo', () => {
  const prod = ann('p', 129.4, 3990);
  const bar = ann('b', 125.1, 2060);
  assert.equal(B.reasonLine(prod, bar, 'produccion'), 'EB +4 pts sobre la más barata · $1.930 más por kg de seta');
  assert.equal(B.reasonLine(bar, prod, 'barata'), '$1.930 menos por kg de seta · EB −4 pts');
  assert.equal(B.reasonLine(prod, prod, 'produccion'), 'Más producción y más barata a la vez');
  assert.equal(B.reasonLine(ann('t', 120.2, 500), ann('u', 120, 500.4), 'produccion'), 'EB igual a la más barata · $ igual por kg de seta');
  assert.equal(B.reasonLine(ann('t', 120.2, 500), ann('u', 120, 500.4), 'barata'), '$ igual por kg de seta · EB igual');
});

// ── Cobertura de Bodega y "Para mejorar, conseguir…" ──
const BATCH = { numBags: 20, kgPerBag: 2.5, moisturePct: 65 };
const EUC_SAL = [{ id: 'aserrin_eucalipto', p: 80 }, { id: 'salvado_trigo', p: 20 }];
const lot = (ingredienteId, kg, activo = true) => ({ ingredienteId, cantidadKgDisponible: kg, activo });

test('stockKgById ignora lotes inactivos o vacíos y usa stockMap solo sin lotes', () => {
  const kg = B.stockKgById(
    [lot('aserrin_eucalipto', 10), lot('aserrin_eucalipto', 5), lot('salvado_trigo', 7, false), lot('regalo', 0)],
    { aserrin_eucalipto: 99, salvado_trigo: 3 },
  );
  assert.deepStrictEqual(kg, { aserrin_eucalipto: 15, salvado_trigo: 3 });
});

test('bagsCovered usa la masa tal cual por bolsa', () => {
  // seco por bolsa 2.5·0.35 = 0.875; eucalipto 0.875·0.8/0.7 = 1.0 kg; salvado 0.875·0.2/0.88 ≈ 0.1989 kg
  const per = B.kgPerBagById(EUC_SAL, INGS, BATCH);
  assert.ok(Math.abs(per.aserrin_eucalipto - 1.0) < 1e-9);
  assert.ok(Math.abs(per.salvado_trigo - 0.875 * 0.2 / 0.88) < 1e-9);
  assert.equal(B.bagsCovered(EUC_SAL, INGS, { aserrin_eucalipto: 10, salvado_trigo: 1 }, BATCH), 5);
  assert.equal(B.bagsCovered(EUC_SAL, INGS, { aserrin_eucalipto: 10 }, BATCH), 0);
});

test('shortfall redondea hacia arriba a 0.1 kg', () => {
  // 20 bolsas: eucalipto 20 kg (hay 10), salvado ≈ 3.977 kg (hay 1)
  assert.deepStrictEqual(
    B.shortfall(EUC_SAL, INGS, { aserrin_eucalipto: 10, salvado_trigo: 1 }, BATCH),
    [{ id: 'aserrin_eucalipto', kg: 10 }, { id: 'salvado_trigo', kg: 3 }],
  );
  assert.deepStrictEqual(B.shortfall(EUC_SAL, INGS, { aserrin_eucalipto: 100, salvado_trigo: 100 }, BATCH), []);
});

const withRecipe = (a, recipe) => ({ ...a, recipe });
const STOCK = { aserrin_eucalipto: 500, salvado_trigo: 500 };
const stockPicks = {
  produccion: withRecipe(ann('sp', 110, 800), EUC_SAL),
  barata: withRecipe(ann('sb', 90, 500), [{ id: 'aserrin_eucalipto', p: 100 }]),
};
const INGS2 = [...INGS, { id: 'harina_soya', cost: 2500, moisture: 10 }, { id: 'cascarilla_cafe', cost: 300, moisture: 12 }];

test('improvements: solo candidatas que piden algo que falta, y que ganan por ≥1 pt o por costo', () => {
  const catalog = [
    withRecipe(ann('todo-en-bodega', 130, 100), EUC_SAL),
    withRecipe(ann('soya+1.0', 111, 900), [{ id: 'aserrin_eucalipto', p: 85 }, { id: 'harina_soya', p: 15 }]),
    withRecipe(ann('soya+0.9', 110.9, 900), [{ id: 'aserrin_eucalipto', p: 84 }, { id: 'harina_soya', p: 16 }]),
    withRecipe(ann('cafe-barata', 95, 400), [{ id: 'aserrin_eucalipto', p: 80 }, { id: 'cascarilla_cafe', p: 20 }]),
  ];
  const out = B.improvements({ stockPicks, catalogAnnotated: catalog, stockKg: STOCK, ingredients: INGS2, batch: BATCH });
  assert.deepStrictEqual(out.map(i => [i.annotated.key, i.kind]), [['soya+1.0', 'eb'], ['cafe-barata', 'costo']]);
  assert.equal(out[0].deltaEb, 1);
  assert.equal(out[1].deltaCostPerKgSeta, -100);
  assert.deepStrictEqual(out[0].toBuy.map(t => t.id), ['harina_soya']);
});

test('improvements: agrupa por lo que hay que comprar y corta en 3', () => {
  const soya = p => withRecipe(ann(`soya${p}`, 115 + p, 900), [{ id: 'aserrin_eucalipto', p: 100 - p }, { id: 'harina_soya', p }]);
  const other = (id, eb) => withRecipe(ann(id, eb, 900), [{ id: 'aserrin_eucalipto', p: 90 }, { id, p: 10 }]);
  const extra = [{ id: 'x1', cost: 1, moisture: 0 }, { id: 'x2', cost: 1, moisture: 0 }, { id: 'x3', cost: 1, moisture: 0 }];
  const out = B.improvements({
    stockPicks, ingredients: [...INGS2, ...extra], stockKg: STOCK, batch: BATCH,
    catalogAnnotated: [soya(5), soya(6), other('x1', 112), other('x2', 113), other('x3', 114)],
  });
  assert.equal(out.length, 3);
  assert.deepStrictEqual(out.map(i => i.annotated.key), ['soya6', 'x3', 'x2']);
});

test('improvements: Bodega vacía sigue sugiriendo del catálogo', () => {
  const out = B.improvements({
    stockPicks: { produccion: null, barata: null }, stockKg: {}, ingredients: INGS2, batch: BATCH,
    catalogAnnotated: [withRecipe(ann('a', 120, 500), EUC_SAL)],
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].kind, 'eb');
  assert.equal(out[0].deltaEb, null);
  assert.equal(out[0].toBuy.length, 2);
});
